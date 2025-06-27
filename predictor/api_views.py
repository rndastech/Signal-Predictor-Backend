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
from django.core.files.base import ContentFile
from django.conf import settings
import pandas as pd
import io
import json
import base64
import uuid
from gradio_client import Client, handle_file
import tempfile
import re
import ast
import requests
import os

from .models import SignalAnalysis, UserProfile
from .serializers import (
    SignalAnalysisSerializer, SignalAnalysisCreateSerializer,
    FunctionEvaluationSerializer, SignalGeneratorSerializer,
    UserSerializer, UserProfileSerializer, AnalysisShareSerializer,
    SharePasswordSerializer, UserRegistrationSerializer, UserLoginSerializer,
    PasswordResetRequestSerializer, PasswordResetSerializer
)
from .forms import SignalGeneratorForm
from .signal_utils import SignalPredictor, SignalGenerator as GeneratorClass
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string


# Constants
ANALYSIS_NOT_FOUND_ERROR = 'Analysis not found'
MAX_ANALYSES_PER_USER = 50


def save_base64_image(base64_string, filename_prefix):
    """
    Convert base64 string to Django ContentFile
    Returns ContentFile object that can be saved to ImageField
    """
    try:
        # Decode base64 string
        image_data = base64.b64decode(base64_string)
        # Create unique filename
        filename = f"{filename_prefix}_{uuid.uuid4().hex[:8]}.png"
        # Return ContentFile
        return ContentFile(image_data, name=filename)
    except Exception:
        return None


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_token(request):
    """Get CSRF token for the frontend"""
    return Response({'csrfToken': get_token(request)})


@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Deactivate account until email confirmation
            user.is_active = False
            user.save()
            # Generate email verification token
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            verify_link = f"{settings.FRONTEND_BASE_URL}/verify-email/{uid}/{token}"
            
            # Send verification email using HTML template
            subject = 'Verify Your Email Address - Signal Predictor'
            
            # Create context for email templates
            context = {
                'user': user,
                'verification_link': verify_link,
            }
            
            # Render HTML and text versions of the email
            html_content = render_to_string('emails/email_verification.html', context)
            text_content = render_to_string('emails/email_verification.txt', context)
            
            # Create and send email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            return Response({
                'success': True,
                'message': 'User created. Check your email to verify your account.'
            }, status=status.HTTP_201_CREATED)
        # Return structured errors
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            # Check if account is active (email verified)
            from django.contrib.auth.models import User as DjangoUser
            try:
                user_obj = DjangoUser.objects.get(username=username)
                if not user_obj.is_active:
                    return Response({'error': 'Email not verified. Please verify your email before logging in.'}, status=status.HTTP_403_FORBIDDEN)
            except DjangoUser.DoesNotExist:
                pass
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
            total = SignalAnalysis.objects.filter(user=request.user).count()
            data['recent_analyses'] = SignalAnalysisSerializer(recent_analyses, many=True).data
            data['total_analyses'] = total
            data['has_temp_analysis'] = 'temp_analysis' in request.session
            # Include quota info
            data['quota_total'] = MAX_ANALYSES_PER_USER
            data['quota_percent'] = int((total / data['quota_total']) * 100) if data['quota_total'] else 0
        
        return Response(data)


class SignalAnalysisUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]
    
    def _analyze_with_hf(self, csv_data, split_point, noise_lvl):
        """Call Hugging Face Space and parse markdown response"""
        # Write CSV to temp file
        with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as tmp:
            csv_data.to_csv(tmp.name, index=False)
        # Call HF API
        client = Client("rndascode/Signal-Predictor")
        api_result = client.predict(
            csv_file=handle_file(tmp.name),
            split_point=split_point,
            noise_level=noise_lvl,
            api_name="/predict"
        )
        result_str, fft_img, orig_img, train_img = api_result
        # Normalize image outputs
        fs_url = fft_img.get('url') if isinstance(fft_img, dict) else fft_img
        ovr_url = orig_img.get('url') if isinstance(orig_img, dict) else orig_img
        tvt_url = train_img.get('url') if isinstance(train_img, dict) else train_img
        plots = {
            'frequency_spectrum': fs_url,
            'original_vs_reconstructed': ovr_url,
            'training_vs_testing': tvt_url
        }
        # Parse markdown fields
        func_m = re.search(r"\*\*Function:\*\*\s*`([^`]+)`", result_str)
        function_string = func_m.group(1) if func_m else result_str
        mse = None
        m = re.search(r"\*\*MSE:\*\*\s*`([^`]+)`", result_str)
        if m:
            mse = float(m.group(1))
        parameters = {}
        p = re.search(r"\*\*Parameters:\*\*\s*`(.+)`", result_str)
        if p:
            ps = re.sub(r'np\.float64\(([^)]+)\)', r'\1', p.group(1))
            parameters = ast.literal_eval(ps)
        dom_freqs = []
        d = re.search(r"\*\*Dominant Frequencies:\*\*\s*`(.+)`", result_str)
        if d:
            ds = re.sub(r'np\.float64\(([^)]+)\)', r'\1', d.group(1))
            dom_freqs = ast.literal_eval(ds)
        return {
            'success': True,
            'fitted_function': function_string,
            'mse': mse,
            'parameters': parameters,
            'dominant_frequencies': dom_freqs,
            'plots': plots
        }

    def post(self, request):  # noqa: C901
        serializer = SignalAnalysisCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # Enforce maximum analyses per user
        if request.user.is_authenticated:
            current_count = SignalAnalysis.objects.filter(user=request.user).count()
            if current_count >= MAX_ANALYSES_PER_USER:
                return Response({'error': f'You have reached the maximum number of analyses ({MAX_ANALYSES_PER_USER}). Please delete previous analyses to continue.'}, status=status.HTTP_400_BAD_REQUEST)
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
            result = self._analyze_with_hf(csv_data, split_point, noise_lvl)
            if not result.get('success'):
                return Response({'error': result.get('error', 'Analysis failed')}, status=status.HTTP_400_BAD_REQUEST)
            
            # Build predictor parameters list for evaluation usage
            params_dict = result.get('parameters', {})
            predictor_params = []
            for comp in params_dict.get('sinusoidal_components', []):
                predictor_params.extend([comp['amplitude'], comp['frequency'], comp['phase']])
            # Append offset
            predictor_params.append(params_dict.get('offset', 0))

            if result['success']:
                analysis = None
                if request.user.is_authenticated:
                    analysis = SignalAnalysis.objects.create(
                        user=request.user,
                        uploaded_file=serializer.validated_data['csv_file'],
                        fitted_function=result['fitted_function'],
                        parameters=result['parameters'],
                        mse=result['mse'],
                        dominant_frequencies=result['dominant_frequencies']
                    )
                    
                    # Save data preview (first 10 rows)
                    analysis.set_data_preview(csv_data)
                      # Save visualization plots if they exist in the result
                    plots = result.get('plots', {})
                    # Save visualization plots using public URLs, local files, or base64
                    DATA_PREFIX = 'data:image'
                    for key, field_name in [
                        ('frequency_spectrum', 'frequency_analysis_plot'),
                        ('original_vs_reconstructed', 'fitted_signal_plot'),
                        ('training_vs_testing', 'original_signal_plot')
                    ]:
                        img_src = plots.get(key)
                        if not img_src:
                            continue
                        img_file = None
                        # Base64-encoded image
                        if isinstance(img_src, str) and img_src.startswith(DATA_PREFIX):
                            img_file = save_base64_image(img_src, f'{key}_{analysis.id}')
                        # HTTP(S) URL
                        elif isinstance(img_src, str) and img_src.startswith(('http://', 'https://')):
                            try:
                                resp = requests.get(img_src)
                                if resp.ok:
                                    ext = img_src.split('.')[-1].split('?')[0]
                                    name = f"{key}_{analysis.id}.{ext}"
                                    img_file = ContentFile(resp.content, name=name)
                            except Exception:
                                img_file = None
                        # Local file path
                        elif isinstance(img_src, str) and os.path.exists(img_src):
                            with open(img_src, 'rb') as f:
                                ext = img_src.split('.')[-1]
                                name = f"{key}_{analysis.id}.{ext}"
                                img_file = ContentFile(f.read(), name=name)
                        # Save if present
                        if img_file:
                            getattr(analysis, field_name).save(img_file.name, img_file, save=False)
                    # Save the analysis with all the new data
                    analysis.save()

                    # Store predictor_params in session
                    request.session['predictor_params'] = predictor_params
                    request.session['analysis_id'] = analysis.id

                    if 'temp_analysis' in request.session:
                        del request.session['temp_analysis']
                    
                    # For saved analysis, return the serialized data with all visualizations and data preview
                    analysis_data = SignalAnalysisSerializer(analysis).data
                    
                    return Response({
                        'success': True,
                        'analysis': analysis_data,
                        'result': result,
                        'saved': True  # Flag to indicate this was saved
                    })
                else:
                    # For anonymous users, store in session
                    request.session['predictor_params'] = predictor_params
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


class FunctionEvaluationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):  # noqa: C901
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


class SignalAnalysisDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SignalAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SignalAnalysis.objects.filter(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to include visualization data and data preview"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Enhance the response with additional visualization data
        data = serializer.data
        data.update({
            'has_visualizations': instance.has_visualizations,
            'visualization_urls': instance.get_visualization_urls(),
            'data_preview': instance.get_data_preview(),
            'display_mode': 'saved'  # Flag to indicate this is saved data only
        })
        
        return Response(data)


class SignalGeneratorView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser, FormParser]
    def post(self, request):  # noqa: C901
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
    
    def retrieve(self, request, *args, **kwargs):
        # Add quota usage info to profile response
        profile = self.get_object()
        data = self.get_serializer(profile).data
        total = SignalAnalysis.objects.filter(user=request.user).count()
        data['total_analyses'] = total
        data['quota_total'] = MAX_ANALYSES_PER_USER
        data['quota_percent'] = int((total / MAX_ANALYSES_PER_USER) * 100) if MAX_ANALYSES_PER_USER else 0
        return Response(data)
     
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
            # Generate frontend URL using configurable base URL
            public_url = f'{settings.FRONTEND_BASE_URL}/share/{analysis.id}'
            
            return Response({
                'id': analysis.id,
                'name': analysis.display_name,
                'is_public': analysis.is_public,
                'has_password': bool(analysis.share_password_hash),                'public_url': public_url
            })
        except SignalAnalysis.DoesNotExist:
            return Response({
                'error': ANALYSIS_NOT_FOUND_ERROR
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
                
                # Generate frontend URL using configurable base URL
                public_url = f'{settings.FRONTEND_BASE_URL}/share/{analysis.id}'
                
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
                'error': ANALYSIS_NOT_FOUND_ERROR
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
              # Return analysis data for public access with visualizations
            analysis_data = SignalAnalysisSerializer(analysis).data
            analysis_data.update({
                'has_visualizations': analysis.has_visualizations,
                'visualization_urls': analysis.get_visualization_urls(),
                'data_preview': analysis.get_data_preview(),
                'display_mode': 'shared'  # Flag to indicate this is shared data
            })
            
            return Response({
                'analysis': analysis_data,                'shared': True            })
            
        except SignalAnalysis.DoesNotExist:
            return Response({
                'error': ANALYSIS_NOT_FOUND_ERROR
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
                    # Return analysis data with visualizations for password-protected access
                    analysis_data = SignalAnalysisSerializer(analysis).data
                    analysis_data.update({
                        'has_visualizations': analysis.has_visualizations,
                        'visualization_urls': analysis.get_visualization_urls(),
                        'data_preview': analysis.get_data_preview(),
                        'display_mode': 'shared'  # Flag to indicate this is shared data
                    })
                    
                    return Response({
                        'analysis': analysis_data,
                        'shared': True
                    })
                else:
                    return Response({
                        'error': 'Incorrect password'
                    }, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)            
        except SignalAnalysis.DoesNotExist:
            return Response({
                'error': ANALYSIS_NOT_FOUND_ERROR
            }, status=status.HTTP_404_NOT_FOUND)


class AnalysisDetailWithVisualizationsView(APIView):
    """
    Retrieve analysis with all saved visualizations and data preview
    For display purposes only - no recomputation
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, analysis_id):
        try:
            analysis = SignalAnalysis.objects.get(id=analysis_id, user=request.user)
            
            # Get the serialized analysis data
            analysis_data = SignalAnalysisSerializer(analysis).data
              # Add additional context for frontend display
            response_data = {
                'analysis': analysis_data,
                'has_visualizations': analysis.has_visualizations,
                'visualization_urls': analysis.get_visualization_urls(),
                'data_preview': analysis.get_data_preview(),
                'display_mode': 'saved'  # Flag to indicate this is saved data only
            }
            
            return Response(response_data)
            
        except SignalAnalysis.DoesNotExist:
            return Response({
                'error': ANALYSIS_NOT_FOUND_ERROR
            }, status=status.HTTP_404_NOT_FOUND)


# Password reset views
class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                reset_link = f"{settings.FRONTEND_BASE_URL}/password-reset-confirm/{uid}/{token}"
                
                # Create context for email templates
                context = {
                    'user': user,
                    'reset_link': reset_link,
                    'site_name': 'Signal Predictor'
                }
                
                # Render HTML and text versions
                html_content = render_to_string('emails/password_reset_email.html', context)
                text_content = render_to_string('emails/password_reset_email.txt', context)
                
                # Create and send email
                email_message = EmailMultiAlternatives(
                    subject="🔐 Password Reset Request - Signal Predictor",
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[email]
                )
                email_message.attach_alternative(html_content, "text/html")
                email_message.send(fail_silently=False)
            except User.DoesNotExist:
                pass
            return Response({'message': 'If the email exists, a password reset link has been sent.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data['uid']
            token = serializer.validated_data['token']
            try:
                uid_decoded = force_str(urlsafe_base64_decode(uid))
                user = User.objects.get(pk=uid_decoded)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({'error': 'Invalid link.'}, status=status.HTTP_400_BAD_REQUEST)
            if not default_token_generator.check_token(user, token):
                return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
            new_password = serializer.validated_data['new_password']
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password has been reset successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        if user and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({'success': True, 'message': 'Email verified successfully'})
        return Response({'success': False, 'message': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
