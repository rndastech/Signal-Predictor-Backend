from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse, Http404  # include Http404 for share view
from django.contrib.auth.models import User
import pandas as pd
import io
from django.urls import reverse  # for building share URLs
from .forms import (CSVUploadForm, FunctionEvaluationForm, SignalGeneratorForm, AnalysisRenameForm,
    UserProfileForm, UserForm, AnalysisShareForm, SharePasswordForm)
from .models import SignalAnalysis, UserProfile
from .signal_utils import SignalPredictor, SignalGenerator
from django.core.files.base import ContentFile
import base64, uuid

MAX_ANALYSES_PER_USER = 50


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
        
        # No longer check for temporary analysis since new analyses are auto-saved
        has_temp_analysis = False
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
        # Enforce maximum analyses per user
        if request.user.is_authenticated:
            current_count = SignalAnalysis.objects.filter(user=request.user).count()
            if current_count >= MAX_ANALYSES_PER_USER:
                messages.error(request, f'You have reached the maximum number of analyses ({MAX_ANALYSES_PER_USER}). Please delete previous analyses to continue.')
                form = CSVUploadForm()
                return render(request, 'predictor/upload.html', {'form': form})
        
        form = CSVUploadForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                # Read the uploaded CSV file
                csv_file = request.FILES['csv_file']
                csv_data = pd.read_csv(io.StringIO(csv_file.read().decode('utf-8')))                # Validate CSV structure
                if 'x' not in csv_data.columns or 'y' not in csv_data.columns:
                    messages.error(request, 'CSV file must contain "x" and "y" columns.')
                    return render(request, 'predictor/upload.html', {'form': form})
                
                # Apply advanced mode options
                advanced = form.cleaned_data.get('advanced_mode')
                noise_lvl = form.cleaned_data.get('noise_filter') or 0
                if noise_lvl > 0:
                    # Filter out low amplitude noise
                    csv_data = csv_data[csv_data['y'].abs() >= noise_lvl]
                if not advanced:
                    # Auto determine split at 80% of data
                    idx = int(0.8 * len(csv_data))
                    split_point = csv_data['x'].iloc[idx if idx < len(csv_data) else -1]
                else:
                    split_point = form.cleaned_data.get('split_point')
                # Perform signal analysis
                predictor = SignalPredictor()
                result = predictor.analyze_signal(csv_data, split_point)
                
                if result['success']:
                    # Auto-save to database for logged-in users
                    analysis = None
                    if request.user.is_authenticated:
                        csv_file = request.FILES['csv_file']
                        analysis = SignalAnalysis.objects.create(
                            user=request.user,
                            uploaded_file=csv_file,
                            fitted_function=result['fitted_function'],
                            parameters=result['parameters'],
                            mse=result['mse'],
                            dominant_frequencies=result['dominant_frequencies']
                        )
                        # Save data preview (first 10 rows)
                        analysis.set_data_preview(csv_data)
                        # Save visualization plots
                        plots = result.get('plots', {})
                        # Frequency spectrum
                        if plots.get('frequency_spectrum'):
                            data = base64.b64decode(plots['frequency_spectrum'])
                            filename = f"frequency_analysis_{analysis.id}_{uuid.uuid4().hex[:8]}.png"
                            analysis.frequency_analysis_plot.save(filename, ContentFile(data), save=False)
                        # Original vs reconstructed: save as original_signal_plot
                        if plots.get('original_vs_reconstructed'):
                            data = base64.b64decode(plots['original_vs_reconstructed'])
                            filename = f"original_signal_{analysis.id}_{uuid.uuid4().hex[:8]}.png"
                            analysis.original_signal_plot.save(filename, ContentFile(data), save=False)
                        # Training vs testing performance: save as fitted_signal_plot
                        if plots.get('training_vs_testing'):
                            data = base64.b64decode(plots['training_vs_testing'])
                            filename = f"fitted_signal_{analysis.id}_{uuid.uuid4().hex[:8]}.png"
                            analysis.fitted_signal_plot.save(filename, ContentFile(data), save=False)
                        # Persist all changes
                        analysis.save()
                    # Store predictor in session for function evaluation
                    request.session['predictor_params'] = predictor.params.tolist()
                    request.session['analysis_id'] = analysis.id if analysis else None
                    # Clear any temporary analysis data
                    request.session.pop('temp_analysis', None)
                    
                    # Redirect to results page
                    # Prepare rename form for authenticated users
                    rename_form = AnalysisRenameForm(initial={'name': analysis.name}) if analysis else None
                    return render(request, 'predictor/results.html', {
                        'result': result,
                        'analysis': analysis,
                        'csv_data': csv_data.to_dict('records')[:10],  # First 10 rows for preview
                        'eval_form': FunctionEvaluationForm(),
                        'rename_form': rename_form,
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
                # First try to get parameters from session (for fresh analyses)
                params = request.session.get('predictor_params')
                  # If no session params, try to get from analysis_id parameter
                if not params:
                    analysis_id = request.POST.get('analysis_id')
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
                            params = convert_stored_params_to_predictor_format(analysis.parameters)
                        except SignalAnalysis.DoesNotExist:
                            return JsonResponse({'error': 'Analysis not found or access denied'})
                
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


def convert_stored_params_to_predictor_format(stored_parameters):
    """
    Convert stored database parameters to predictor format
    
    stored_parameters format:
    {
        'sinusoidal_components': [
            {'amplitude': A1, 'frequency': f1, 'phase': phi1},
            {'amplitude': A2, 'frequency': f2, 'phase': phi2},
            ...
        ],
        'offset': D
    }
    
    predictor format: [A1, f1, phi1, A2, f2, phi2, ..., D]
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


@login_required
def analysis_detail(request, analysis_id):
    """View details of a specific analysis with visualizations and data preview"""
    try:
        analysis = SignalAnalysis.objects.get(id=analysis_id, user=request.user)
        rename_form = AnalysisRenameForm(initial={'name': analysis.name})
        
        # Get additional data for display
        context = {
            'analysis': analysis,
            'eval_form': FunctionEvaluationForm(),
            'rename_form': rename_form,
            'has_visualizations': analysis.has_visualizations,
            'data_preview': analysis.get_data_preview(),
            'visualization_urls': analysis.get_visualization_urls(),
        }
        
        return render(request, 'predictor/analysis_detail.html', context)
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
    
    if request.method == 'POST':
        # Handle saving with optional name
        form = AnalysisRenameForm(request.POST)
        if form.is_valid():
            try:
                analysis_name = form.cleaned_data.get('name') or ""
                # Create the analysis from session data
                analysis = SignalAnalysis.objects.create(
                    user=request.user,
                    name=analysis_name,
                    fitted_function=temp_analysis['fitted_function'],
                    parameters=temp_analysis['parameters'],
                    mse=temp_analysis['mse'],
                    dominant_frequencies=temp_analysis['dominant_frequencies']
                )
                # Save data preview JSON
                if 'data_preview' in temp_analysis:
                    analysis.data_preview = temp_analysis['data_preview']
                # Save visualization images from session
                plots = temp_analysis.get('plots', {})
                # frequency spectrum
                if plots.get('frequency_spectrum'):
                    img = base64.b64decode(plots['frequency_spectrum'])
                    fname = f"frequency_analysis_{analysis.id}.png"
                    analysis.frequency_analysis_plot.save(fname, ContentFile(img), save=False)
                # original vs reconstructed => fitted_signal
                if plots.get('original_vs_reconstructed'):
                    img = base64.b64decode(plots['original_vs_reconstructed'])
                    fname = f"fitted_signal_{analysis.id}.png"
                    analysis.fitted_signal_plot.save(fname, ContentFile(img), save=False)
                # training vs testing => original_signal
                if plots.get('training_vs_testing'):
                    img = base64.b64decode(plots['training_vs_testing'])
                    fname = f"original_signal_{analysis.id}.png"
                    analysis.original_signal_plot.save(fname, ContentFile(img), save=False)
                analysis.save()
                
                # Update session and clear temporary data
                request.session['analysis_id'] = analysis.id
                request.session.pop('temp_analysis', None)
                
                if analysis_name:
                    messages.success(request, f'Analysis "{analysis_name}" saved successfully!')
                else:
                    messages.success(request, f'Analysis #{analysis.id} saved successfully!')
                return redirect('analysis_detail', analysis_id=analysis.id)
                
            except Exception as e:
                messages.error(request, f'Error saving analysis: {str(e)}')
                return redirect('home')
        else:
            # Form has errors, show them
            messages.error(request, 'Please correct the errors and try again.')
    else:
        # For backward compatibility, if it's a GET request, save without prompting for name
        try:
            # Create the analysis without name
            analysis = SignalAnalysis.objects.create(
                user=request.user,
                fitted_function=temp_analysis['fitted_function'],
                parameters=temp_analysis['parameters'],
                mse=temp_analysis['mse'],
                dominant_frequencies=temp_analysis['dominant_frequencies']
            )
            # Save preview and plots same as above
            if 'data_preview' in temp_analysis:
                analysis.data_preview = temp_analysis['data_preview']
            plots = temp_analysis.get('plots', {})
            if plots.get('frequency_spectrum'):
                img = base64.b64decode(plots['frequency_spectrum'])
                fname = f"frequency_analysis_{analysis.id}.png"
                analysis.frequency_analysis_plot.save(fname, ContentFile(img), save=False)
            if plots.get('original_vs_reconstructed'):
                img = base64.b64decode(plots['original_vs_reconstructed'])
                fname = f"fitted_signal_{analysis.id}.png"
                analysis.fitted_signal_plot.save(fname, ContentFile(img), save=False)
            if plots.get('training_vs_testing'):
                img = base64.b64decode(plots['training_vs_testing'])
                fname = f"original_signal_{analysis.id}.png"
                analysis.original_signal_plot.save(fname, ContentFile(img), save=False)
            analysis.save()
             
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


@login_required
def rename_analysis(request, analysis_id):
    """Rename a specific analysis"""
    try:
        analysis = SignalAnalysis.objects.get(id=analysis_id, user=request.user)
        
        if request.method == 'POST':
            form = AnalysisRenameForm(request.POST)
            if form.is_valid():
                new_name = form.cleaned_data['name']
                analysis.name = new_name if new_name else ""
                analysis.save()
                
                if new_name:
                    messages.success(request, f'Analysis renamed to "{new_name}"')
                else:
                    messages.success(request, f'Analysis name reset to default "Analysis #{analysis.id}"')
                
                return redirect('analysis_detail', analysis_id=analysis.id)
            else:
                messages.error(request, 'Please correct the errors below.')
        else:
            form = AnalysisRenameForm(initial={'name': analysis.name})
            
        return render(request, 'predictor/analysis_detail.html', {
            'analysis': analysis,
            'eval_form': FunctionEvaluationForm(),
            'rename_form': form
        })
        
    except SignalAnalysis.DoesNotExist:
        messages.error(request, 'Analysis not found.')
        return redirect('home')


@login_required
def delete_analysis(request, analysis_id):
    """Delete a specific analysis"""
    try:
        analysis = SignalAnalysis.objects.get(id=analysis_id, user=request.user)
        
        if request.method == 'POST':
            analysis_name = analysis.display_name
            analysis.delete()
            messages.success(request, f'Analysis "{analysis_name}" has been deleted successfully.')
            return redirect('analysis_list')
        else:
            # Redirect to analysis list if not POST request
            messages.warning(request, 'Invalid request method.')
            return redirect('analysis_list')
        
    except SignalAnalysis.DoesNotExist:
        messages.error(request, 'Analysis not found.')
        return redirect('analysis_list')


@login_required
def bulk_delete_analyses(request):
    """Delete multiple analyses at once"""
    if request.method == 'POST':
        analysis_ids = request.POST.getlist('analysis_ids')
        if analysis_ids:
            try:
                # Get the analyses to delete (ensuring they belong to the current user)
                analyses_to_delete = SignalAnalysis.objects.filter(
                    id__in=analysis_ids, 
                    user=request.user
                )
                count = analyses_to_delete.count()
                analyses_to_delete.delete()
                
                if count == 1:
                    messages.success(request, '1 analysis has been deleted successfully.')
                else:
                    messages.success(request, f'{count} analyses have been deleted successfully.')
                    
            except Exception as e:
                messages.error(request, f'Error deleting analyses: {str(e)}')
        else:
            messages.warning(request, 'No analyses were selected for deletion.')
    
    return redirect('analysis_list')


@login_required
def profile_view(request):
    """Display user profile"""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    
    # Calculate quota usage for display
    total_analyses = SignalAnalysis.objects.filter(user=request.user).count()
    quota_total = MAX_ANALYSES_PER_USER
    quota_percent = int((total_analyses / quota_total) * 100) if quota_total else 0
    
    context = {
        'profile': profile,
        'total_analyses': total_analyses,
        'recent_analyses': SignalAnalysis.objects.filter(user=request.user)[:5],
        'quota_total': quota_total,
        'quota_percent': quota_percent,
    }
    
    return render(request, 'predictor/profile.html', context)


@login_required
def edit_profile(request):
    """Edit user profile"""
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'POST':
        user_form = UserForm(request.POST, instance=request.user)
        profile_form = UserProfileForm(request.POST, request.FILES, instance=profile)
        
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.success(request, 'Your profile has been updated successfully!')
            return redirect('profile')
    else:
        user_form = UserForm(instance=request.user)
        profile_form = UserProfileForm(instance=profile)
    
    context = {
        'user_form': user_form,
        'profile_form': profile_form,
    }
    
    return render(request, 'predictor/edit_profile.html', context)


@login_required
def share_options(request, analysis_id):
    """Allow owner to set public/private status and optional password"""
    analysis = get_object_or_404(SignalAnalysis, id=analysis_id, user=request.user)
    if request.method == 'POST':
        form = AnalysisShareForm(request.POST)
        if form.is_valid():
            is_pub = form.cleaned_data['is_public']
            pwd = form.cleaned_data['share_password']
            analysis.is_public = is_pub
            if is_pub and pwd:
                analysis.set_share_password(pwd)
            else:
                analysis.share_password_hash = ''
            analysis.save()
            messages.success(request, 'Share settings updated.')
            return redirect('share_options', analysis_id=analysis.id)
    else:
        initial = {'is_public': analysis.is_public}
        form = AnalysisShareForm(initial=initial)
    public_url = request.build_absolute_uri(
        reverse('analysis_share', args=[analysis.id])
    )
    return render(request, 'predictor/share_options.html', {
        'analysis': analysis,
        'form': form,
        'public_url': public_url,
    })


def analysis_share(request, analysis_id):
    """Public view of a shared analysis, with optional password"""
    analysis = get_object_or_404(SignalAnalysis, id=analysis_id)
    if not analysis.is_public:
        raise Http404
    # Password protection
    if analysis.share_password_hash:
        if request.method == 'POST':
            form = SharePasswordForm(request.POST)
            if form.is_valid():
                pwd = form.cleaned_data['password']
                if analysis.check_share_password(pwd):
                    # access granted - include visualization data
                    context = {
                        'analysis': analysis,
                        'eval_form': FunctionEvaluationForm(),
                        'shared': True,
                        'has_visualizations': analysis.has_visualizations,
                        'data_preview': analysis.get_data_preview(),
                        'visualization_urls': analysis.get_visualization_urls(),
                    }
                    return render(request, 'predictor/analysis_detail.html', context)
                else:
                    form.add_error('password', 'Incorrect password.')
        else:
            form = SharePasswordForm()
        return render(request, 'predictor/analysis_share_password.html', {
            'analysis': analysis,
            'form': form
        })
    # No password, render directly with visualization data
    context = {
        'analysis': analysis,
        'eval_form': FunctionEvaluationForm(),
        'shared': True,
        'has_visualizations': analysis.has_visualizations,
        'data_preview': analysis.get_data_preview(),
        'visualization_urls': analysis.get_visualization_urls(),
    }
    return render(request, 'predictor/analysis_detail.html', context)
