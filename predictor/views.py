from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
import pandas as pd
import io
from .forms import CSVUploadForm, FunctionEvaluationForm
from .models import SignalAnalysis
from .signal_utils import SignalPredictor


def home(request):
    """Home page with upload form"""
    recent_analyses = SignalAnalysis.objects.all()[:5]
    return render(request, 'predictor/home.html', {
        'recent_analyses': recent_analyses
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
                    # Save to database
                    analysis = SignalAnalysis.objects.create(
                        fitted_function=result['fitted_function'],
                        parameters=result['parameters'],
                        mse=result['mse'],
                        dominant_frequencies=result['dominant_frequencies']
                    )
                    
                    # Store predictor in session for function evaluation
                    request.session['predictor_params'] = predictor.params.tolist()
                    request.session['analysis_id'] = analysis.id
                    
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


def analysis_detail(request, analysis_id):
    """View details of a specific analysis"""
    try:
        analysis = SignalAnalysis.objects.get(id=analysis_id)
        return render(request, 'predictor/analysis_detail.html', {
            'analysis': analysis,
            'eval_form': FunctionEvaluationForm()
        })
    except SignalAnalysis.DoesNotExist:
        messages.error(request, 'Analysis not found.')
        return redirect('home')


def analysis_list(request):
    """List all previous analyses"""
    analyses = SignalAnalysis.objects.all()
    return render(request, 'predictor/analysis_list.html', {
        'analyses': analyses
    })
