from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.models import User
import pandas as pd
import io
from .forms import CSVUploadForm, FunctionEvaluationForm, SignalGeneratorForm
from .models import SignalAnalysis
from .signal_utils import SignalPredictor, SignalGenerator


def assign_orphaned_analyses():
    """Assign any orphaned analyses to the first superuser"""
    orphaned = SignalAnalysis.objects.filter(user__isnull=True)
    if orphaned.exists():
        admin_user = User.objects.filter(is_superuser=True).first()
        if admin_user:
            orphaned.update(user=admin_user)


def home(request):
    """Home page with upload form"""
    # Handle any orphaned analyses
    assign_orphaned_analyses()
    
    if request.user.is_authenticated:
        recent_analyses = SignalAnalysis.objects.filter(user=request.user)[:5]
        total_analyses = SignalAnalysis.objects.filter(user=request.user).count()
        
        # Check for temporary analysis that can be saved
        temp_analysis = request.session.get('temp_analysis')
        has_temp_analysis = bool(temp_analysis)
    else:
        recent_analyses = []
        total_analyses = 0
        has_temp_analysis = False
        
    return render(request, 'predictor/home.html', {
        'recent_analyses': recent_analyses,
        'total_analyses': total_analyses,
        'has_temp_analysis': has_temp_analysis,
    })


def upload_csv(request):
    """Handle CSV upload and signal analysis"""
    if request.method == 'POST':
        form = CSVUploadForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                # Read the uploaded CSV file
                csv_file = request.FILES['csv_file']
                csv_data = pd.read_csv(io.StringIO(csv_file.read().decode('utf-8')))
                  # Validate CSV structure
                if 'x' not in csv_data.columns or 'y' not in csv_data.columns:
                    messages.error(request, 'CSV file must contain "x" and "y" columns.')
                    return render(request, 'predictor/upload.html', {'form': form})
                
                # Perform signal analysis
                predictor = SignalPredictor()
                split_point = form.cleaned_data['split_point']
                result = predictor.analyze_signal(csv_data, split_point)
                
                if result['success']:
                    # Save to database only if user is logged in
                    analysis = None
                    if request.user.is_authenticated:
                        analysis = SignalAnalysis.objects.create(
                            user=request.user,
                            fitted_function=result['fitted_function'],
                            parameters=result['parameters'],
                            mse=result['mse'],
                            dominant_frequencies=result['dominant_frequencies']
                        )                        # Store predictor in session for function evaluation
                        request.session['predictor_params'] = predictor.params.tolist()
                        request.session['analysis_id'] = analysis.id
                    else:
                        # For anonymous users, store complete analysis data in session
                        request.session['predictor_params'] = predictor.params.tolist()
                        request.session['analysis_id'] = None
                        request.session['temp_analysis'] = {
                            'fitted_function': result['fitted_function'],
                            'parameters': result['parameters'],
                            'mse': result['mse'],
                            'dominant_frequencies': result['dominant_frequencies']
                        }
                    
                    # Redirect to results page
                    return render(request, 'predictor/results.html', {
                        'result': result,
                        'analysis': analysis,
                        'csv_data': csv_data.to_dict('records')[:10],  # First 10 rows for preview
                        'eval_form': FunctionEvaluationForm()
                    })
                else:
                    messages.error(request, f'Analysis failed: {result["error"]}')
                    
            except Exception as e:
                messages.error(request, f'Error processing file: {str(e)}')
        
        return render(request, 'predictor/upload.html', {'form': form})
    
    else:
        form = CSVUploadForm()
        return render(request, 'predictor/upload.html', {'form': form})


def evaluate_function(request):
    """Evaluate fitted function at a specific x value"""
    if request.method == 'POST':
        form = FunctionEvaluationForm(request.POST)
        if form.is_valid():
            try:
                params = request.session.get('predictor_params')
                if not params:
                    return JsonResponse({'error': 'No fitted function available'})
                
                predictor = SignalPredictor()
                predictor.params = params
                
                x_value = form.cleaned_data['x_value']
                result = predictor.evaluate_function(x_value)
                
                return JsonResponse({
                    'success': True,
                    'x_value': x_value,
                    'result': round(result, 6)
                })
                
            except Exception as e:
                return JsonResponse({'error': str(e)})
    
    return JsonResponse({'error': 'Invalid request'})


@login_required
def analysis_detail(request, analysis_id):
    """View details of a specific analysis"""
    try:
        analysis = SignalAnalysis.objects.get(id=analysis_id, user=request.user)
        return render(request, 'predictor/analysis_detail.html', {
            'analysis': analysis,
            'eval_form': FunctionEvaluationForm()
        })
    except SignalAnalysis.DoesNotExist:
        messages.error(request, 'Analysis not found.')
        return redirect('home')


@login_required
def analysis_list(request):
    """List all previous analyses"""
    analyses = SignalAnalysis.objects.filter(user=request.user)
    return render(request, 'predictor/analysis_list.html', {
        'analyses': analyses
    })


@login_required
def save_session_analysis(request):
    """Save the current session analysis to the database for logged-in user"""
    temp_analysis = request.session.get('temp_analysis')
    if not temp_analysis:
        messages.error(request, 'No temporary analysis found to save.')
        return redirect('home')
    
    try:
        # Create the analysis from session data
        analysis = SignalAnalysis.objects.create(
            user=request.user,
            fitted_function=temp_analysis['fitted_function'],
            parameters=temp_analysis['parameters'],
            mse=temp_analysis['mse'],
            dominant_frequencies=temp_analysis['dominant_frequencies']
        )
        
        # Update session with the saved analysis ID
        request.session['analysis_id'] = analysis.id
        # Remove temporary data
        if 'temp_analysis' in request.session:
            del request.session['temp_analysis']
        
        messages.success(request, f'Analysis #{analysis.id} saved successfully!')
        return redirect('analysis_detail', analysis_id=analysis.id)
        
    except Exception as e:
        messages.error(request, f'Error saving analysis: {str(e)}')
        return redirect('home')


def clear_session(request):
    """Debug view to clear session data"""
    if 'temp_analysis' in request.session:
        del request.session['temp_analysis']
    if 'predictor_params' in request.session:
        del request.session['predictor_params']
    if 'analysis_id' in request.session:
        del request.session['analysis_id']
    
    messages.success(request, 'Session data cleared!')
    return redirect('home')


def signal_generator(request):
    """Signal generator view"""
    if request.method == 'POST':
        form = SignalGeneratorForm(request.POST)
        if form.is_valid():
            try:
                generator = SignalGenerator()
                
                # Extract form data
                x_start = form.cleaned_data['x_start']
                x_end = form.cleaned_data['x_end']
                num_points = form.cleaned_data['num_points']
                offset = form.cleaned_data['offset']
                noise_level = form.cleaned_data['noise_level'] if form.cleaned_data['add_noise'] else 0
                use_random = form.cleaned_data['use_random_parameters']
                num_sinusoids = form.cleaned_data['num_sinusoids']
                
                # Prepare sinusoid parameters
                if use_random:
                    sinusoid_params = None
                else:
                    sinusoid_params = []
                    # Collect up to 3 manual sinusoid parameters
                    for i in range(1, min(num_sinusoids + 1, 4)):
                        amp_field = f'amplitude_{i}'
                        freq_field = f'frequency_{i}'
                        phase_field = f'phase_{i}'
                        
                        if (form.cleaned_data.get(amp_field) is not None and 
                            form.cleaned_data.get(freq_field) is not None and 
                            form.cleaned_data.get(phase_field) is not None):
                            sinusoid_params.append((
                                form.cleaned_data[amp_field],
                                form.cleaned_data[freq_field],
                                form.cleaned_data[phase_field]
                            ))
                    
                    # If we need more sinusoids than manually specified, add random ones
                    if len(sinusoid_params) < num_sinusoids:
                        additional_random = generator._generate_random_parameters(
                            num_sinusoids - len(sinusoid_params)
                        )
                        sinusoid_params.extend(additional_random)
                
                # Generate the signal
                result = generator.generate_signal(
                    x_start=x_start,
                    x_end=x_end,
                    num_points=num_points,
                    sinusoid_params=sinusoid_params,
                    offset=offset,
                    noise_level=noise_level,
                    use_random=use_random,
                    num_sinusoids=num_sinusoids
                )
                
                if result['success']:
                    # Generate visualizations
                    plots = generator.generate_visualization(result['data'])
                    
                    # Store generated data in session for potential CSV download
                    request.session['generated_signal'] = result['data'].to_dict('records')
                    request.session['generated_params'] = result['parameters']
                    
                    return render(request, 'predictor/generator_results.html', {
                        'result': result,
                        'plots': plots,
                        'csv_data': result['data'].to_dict('records')[:10],  # First 10 rows for preview
                        'form': form
                    })
                else:
                    messages.error(request, f'Signal generation failed: {result["error"]}')
                    
            except Exception as e:
                messages.error(request, f'Error generating signal: {str(e)}')
        
        return render(request, 'predictor/signal_generator.html', {'form': form})
    
    else:
        form = SignalGeneratorForm()
        return render(request, 'predictor/signal_generator.html', {'form': form})


def download_generated_csv(request):
    """Download the generated signal as CSV"""
    generated_data = request.session.get('generated_signal')
    if not generated_data:
        messages.error(request, 'No generated signal data found.')
        return redirect('signal_generator')
    
    try:
        # Convert back to DataFrame
        df = pd.DataFrame(generated_data)
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="generated_signal.csv"'
        
        # Write CSV to response
        df.to_csv(response, index=False)
        
        return response
        
    except Exception as e:
        messages.error(request, f'Error creating CSV: {str(e)}')
        return redirect('signal_generator')
