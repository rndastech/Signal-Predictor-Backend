from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
import pandas as pd
import io
import json

from .models import SignalAnalysis, UserProfile
from .serializers import (
    SignalAnalysisSerializer, SignalAnalysisCreateSerializer,
    FunctionEvaluationSerializer, SignalGeneratorSerializer,
    UserSerializer, UserProfileSerializer, AnalysisShareSerializer,
    SharePasswordSerializer, UserRegistrationSerializer, UserLoginSerializer
)
from .forms import SignalGeneratorForm
from .signal_utils import SignalPredictor, SignalGenerator as GeneratorClass


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_token(request):
    """Get CSRF token for the frontend"""
    return Response({'csrfToken': get_token(request)})


class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)
            
            if user:
                login(request, user)
                return Response({
                    'user': UserSerializer(user).data,
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'user': UserSerializer(request.user).data,
                'is_authenticated': True
            })
        return Response({'is_authenticated': False})


class HomeView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        data = {
            'recent_analyses': [],
            'total_analyses': 0,
            'has_temp_analysis': False
        }
        
        if request.user.is_authenticated:
            recent_analyses = SignalAnalysis.objects.filter(user=request.user)[:5]
            data['recent_analyses'] = SignalAnalysisSerializer(recent_analyses, many=True).data
            data['total_analyses'] = SignalAnalysis.objects.filter(user=request.user).count()
            data['has_temp_analysis'] = 'temp_analysis' in request.session
        
        return Response(data)


@method_decorator(csrf_exempt, name='dispatch')
class SignalAnalysisUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = SignalAnalysisCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Read the uploaded CSV file
                csv_file = serializer.validated_data['csv_file']
                csv_data = pd.read_csv(io.StringIO(csv_file.read().decode('utf-8')))
                
                # Validate CSV structure
                if 'x' not in csv_data.columns or 'y' not in csv_data.columns:
                    return Response({
                        'error': 'CSV file must contain "x" and "y" columns.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Apply advanced mode options
                advanced = serializer.validated_data.get('advanced_mode', False)
                noise_lvl = serializer.validated_data.get('noise_filter', 0)
                
                if noise_lvl > 0:
                    csv_data = csv_data[csv_data['y'].abs() >= noise_lvl]
                
                if not advanced:
                    idx = int(0.8 * len(csv_data))
                    split_point = csv_data['x'].iloc[idx if idx < len(csv_data) else -1]
                else:
                    split_point = serializer.validated_data.get('split_point')
                
                # Perform signal analysis
                predictor = SignalPredictor()
                result = predictor.analyze_signal(csv_data, split_point)
                
                if result['success']:
                    analysis = None
                    if request.user.is_authenticated:
                        analysis = SignalAnalysis.objects.create(
                            user=request.user,
                            fitted_function=result['fitted_function'],
                            parameters=result['parameters'],
                            mse=result['mse'],
                            dominant_frequencies=result['dominant_frequencies']
                        )
                        request.session['predictor_params'] = predictor.params.tolist()
                        request.session['analysis_id'] = analysis.id
                        
                        if 'temp_analysis' in request.session:
                            del request.session['temp_analysis']
                        
                        return Response({
                            'success': True,
                            'analysis': SignalAnalysisSerializer(analysis).data,
                            'result': result
                        })
                    else:
                        # For anonymous users, store in session
                        request.session['predictor_params'] = predictor.params.tolist()
                        request.session['analysis_id'] = None
                        request.session['temp_analysis'] = {
                            'fitted_function': result['fitted_function'],
                            'parameters': result['parameters'],
                            'mse': result['mse'],
                            'dominant_frequencies': result['dominant_frequencies']
                        }
                        
                        return Response({
                            'success': True,
                            'result': result,
                            'temp_analysis': True
                        })
                else:
                    return Response({
                        'error': result.get('error', 'Analysis failed')
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except Exception as e:
                return Response({
                    'error': f'Error processing file: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FunctionEvaluationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = FunctionEvaluationSerializer(data=request.data)
        if serializer.is_valid():
            x_values = serializer.validated_data['x_values']
            
            # Try to get predictor params from session first
            predictor_params = request.session.get('predictor_params')
            
            # If no session params, try to get from analysis_id
            if not predictor_params:
                analysis_id = request.data.get('analysis_id')
                if analysis_id:
                    try:
                        # For authenticated users, check ownership
                        if request.user.is_authenticated:
                            analysis = SignalAnalysis.objects.get(
                                id=analysis_id, 
                                user=request.user
                            )
                        else:
                            # For anonymous users, only allow public analyses
                            analysis = SignalAnalysis.objects.get(
                                id=analysis_id,
                                is_public=True
                            )
                        # Convert stored parameters to predictor format
                        predictor_params = self.convert_stored_params_to_predictor_format(analysis.parameters)
                    except SignalAnalysis.DoesNotExist:
                        return Response({
                            'error': 'Analysis not found or access denied'
                        }, status=status.HTTP_404_NOT_FOUND)
            
            if not predictor_params:
                return Response({
                    'error': 'No active analysis session found'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                predictor = SignalPredictor()
                predictor.params = predictor_params
                y_values = [predictor.evaluate_function(x) for x in x_values]
                
                return Response({
                    'x_values': x_values,
                    'y_values': y_values
                })
            except Exception as e:
                return Response({
                    'error': f'Error evaluating function: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def convert_stored_params_to_predictor_format(self, stored_parameters):
        """
        Convert stored database parameters to predictor format
        """
        try:
            params = []
            components = stored_parameters.get('sinusoidal_components', [])
            
            for component in components:
                params.extend([
                    component['amplitude'],
                    component['frequency'],
                    component['phase']
                ])
            
            # Add offset at the end
            params.append(stored_parameters.get('offset', 0))
            
            return params
        except (KeyError, TypeError) as e:
            raise ValueError(f"Invalid parameter format: {e}")


class SignalAnalysisListView(generics.ListAPIView):
    serializer_class = SignalAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SignalAnalysis.objects.filter(user=self.request.user)


@method_decorator(csrf_exempt, name='dispatch')
class SignalAnalysisDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SignalAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SignalAnalysis.objects.filter(user=self.request.user)


class SignalGeneratorView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser, FormParser]
    def post(self, request):
        form = SignalGeneratorForm(request.data)
        if form.is_valid():
            data = form.cleaned_data
            x_start = data['x_start']
            x_end = data['x_end']
            num_points = data['num_points']
            offset = data['offset']
            noise_level = data['noise_level'] if data.get('add_noise') else 0
            use_random = data.get('use_random_parameters', False)
            num_sinusoids = data.get('num_sinusoids', 1)
            # Prepare sinusoid parameters
            sinusoid_params = []
            if not use_random:
                for i in range(1, min(num_sinusoids, 3) + 1):
                    amp = data.get(f'amplitude_{i}')
                    freq = data.get(f'frequency_{i}')
                    phase = data.get(f'phase_{i}')
                    if amp is not None and freq is not None and phase is not None:
                        sinusoid_params.append((amp, freq, phase))
                if len(sinusoid_params) < num_sinusoids:
                    sinusoid_params.extend(GeneratorClass()._generate_random_parameters(num_sinusoids - len(sinusoid_params)))
            # Generate signal
            generator = GeneratorClass()
            result = generator.generate_signal(
                x_start=x_start,
                x_end=x_end,
                num_points=num_points,
                sinusoid_params=sinusoid_params if not use_random else None,
                offset=offset,
                noise_level=noise_level,
                use_random=use_random,
                num_sinusoids=num_sinusoids
            )
            # Convert DataFrame to list of dicts
            df = result.get('data')
            csv_data = df.to_dict('records') if hasattr(df, 'to_dict') else []
            # Generate visualization plots
            plots = generator.generate_visualization(df)
            return Response({
                'success': True,
                'function_string': result.get('function_string'),
                'parameters': generator.last_generated_params,
                'plots': plots,
                'csv_data': csv_data
            })
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_session_analysis(request):
    """Save temporary analysis from session to database"""
    temp_analysis = request.session.get('temp_analysis')
    if not temp_analysis:
        return Response({
            'error': 'No temporary analysis found in session'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    analysis = SignalAnalysis.objects.create(
        user=request.user,
        fitted_function=temp_analysis['fitted_function'],
        parameters=temp_analysis['parameters'],
        mse=temp_analysis['mse'],
        dominant_frequencies=temp_analysis['dominant_frequencies']
    )
    
    # Clear temporary data
    del request.session['temp_analysis']
    request.session['analysis_id'] = analysis.id
    
    return Response({
        'success': True,
        'analysis': SignalAnalysisSerializer(analysis).data
    })


@api_view(['POST'])
def clear_session(request):
    """Clear analysis session data"""
    keys_to_clear = ['predictor_params', 'analysis_id', 'temp_analysis']
    for key in keys_to_clear:
        if key in request.session:
            del request.session[key]
    
    return Response({'success': True, 'message': 'Session cleared'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_delete_analyses(request):
    """Delete multiple analyses"""
    analysis_ids = request.data.get('analysis_ids', [])
    if not analysis_ids:
        return Response({
            'error': 'No analysis IDs provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    deleted_count = SignalAnalysis.objects.filter(
        id__in=analysis_ids, 
        user=request.user
    ).delete()[0]
    
    return Response({
        'success': True,
        'deleted_count': deleted_count
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_csrf_token(request):
    """Endpoint to get CSRF token"""
    token = get_token(request)
    return Response({'csrfToken': token})


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({
                'error': 'Both current and new passwords are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if current password is correct
        if not request.user.check_password(current_password):
            return Response({
                'current_password': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password length
        if len(new_password) < 8:
            return Response({
                'new_password': 'New password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        request.user.set_password(new_password)
        request.user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class AnalysisShareOptionsView(APIView):
    """API endpoint for managing analysis share settings"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, analysis_id):
        """Get current share settings for an analysis"""
        try:
            analysis = SignalAnalysis.objects.get(id=analysis_id, user=request.user)
            # Generate frontend URL instead of API URL
            frontend_base = 'http://localhost:3000'  # In production, this should be configurable
            public_url = f'{frontend_base}/share/{analysis.id}'
            
            return Response({
                'id': analysis.id,
                'name': analysis.display_name,
                'is_public': analysis.is_public,
                'has_password': bool(analysis.share_password_hash),
                'public_url': public_url
            })
        except SignalAnalysis.DoesNotExist:
            return Response({
                'error': 'Analysis not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, analysis_id):
        """Update share settings for an analysis"""
        try:
            analysis = SignalAnalysis.objects.get(id=analysis_id, user=request.user)
            serializer = AnalysisShareSerializer(data=request.data)
            
            if serializer.is_valid():
                is_public = serializer.validated_data['is_public']
                password = serializer.validated_data.get('password', '')
                
                analysis.is_public = is_public
                
                if is_public and password:
                    analysis.set_share_password(password)
                else:
                    analysis.share_password_hash = ''
                
                analysis.save()
                
                # Generate frontend URL instead of API URL
                frontend_base = 'http://localhost:3000'  # In production, this should be configurable
                public_url = f'{frontend_base}/share/{analysis.id}'
                
                return Response({
                    'success': True,
                    'message': 'Share settings updated successfully',
                    'is_public': analysis.is_public,
                    'has_password': bool(analysis.share_password_hash),
                    'public_url': public_url
                })
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except SignalAnalysis.DoesNotExist:
            return Response({
                'error': 'Analysis not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AnalysisShareView(APIView):
    """Public API endpoint for accessing shared analyses"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, analysis_id):
        """Get a shared analysis (public view)"""
        try:
            analysis = SignalAnalysis.objects.get(id=analysis_id)
            
            if not analysis.is_public:
                return Response({
                    'error': 'Analysis is not public'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Check if password is required but not provided
            if analysis.share_password_hash:
                return Response({
                    'requires_password': True,
                    'analysis_name': analysis.display_name
                })
            
            # Return analysis data for public access
            return Response({
                'analysis': SignalAnalysisSerializer(analysis).data,
                'shared': True
            })
            
        except SignalAnalysis.DoesNotExist:
            return Response({
                'error': 'Analysis not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, analysis_id):
        """Access password-protected shared analysis"""
        try:
            analysis = SignalAnalysis.objects.get(id=analysis_id)
            
            if not analysis.is_public:
                return Response({
                    'error': 'Analysis is not public'
                }, status=status.HTTP_404_NOT_FOUND)
            
            if not analysis.share_password_hash:
                return Response({
                    'error': 'Analysis does not require a password'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = SharePasswordSerializer(data=request.data)
            if serializer.is_valid():
                password = serializer.validated_data['password']
                
                if analysis.check_share_password(password):
                    return Response({
                        'analysis': SignalAnalysisSerializer(analysis).data,
                        'shared': True
                    })
                else:
                    return Response({
                        'error': 'Incorrect password'
                    }, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except SignalAnalysis.DoesNotExist:
            return Response({
                'error': 'Analysis not found'
            }, status=status.HTTP_404_NOT_FOUND)
