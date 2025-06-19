from django import forms


class CSVUploadForm(forms.Form):
    csv_file = forms.FileField(
        label='Upload CSV File',
        help_text='Upload a CSV file with "x" and "y" columns containing signal data',
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': '.csv'
        })
    )
    
    split_point = forms.FloatField(
        label='Train/Test Split Point',
        initial=20,
        help_text='Data points with x < split_point will be used for training',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    def clean_csv_file(self):
        file = self.cleaned_data['csv_file']
        if not file.name.endswith('.csv'):
            raise forms.ValidationError('Please upload a CSV file.')
        return file


class FunctionEvaluationForm(forms.Form):
    x_value = forms.FloatField(
        label='X Value',
        help_text='Enter a value to evaluate the fitted function',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )


class SignalGeneratorForm(forms.Form):
    # General parameters
    x_start = forms.FloatField(
        label='X Start',
        initial=0,
        help_text='Starting value for x-axis',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    x_end = forms.FloatField(
        label='X End',
        initial=50,
        help_text='Ending value for x-axis',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    num_points = forms.IntegerField(
        label='Number of Points',
        initial=1000,
        help_text='Number of data points to generate',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'min': '100',
            'max': '10000'
        })
    )
    
    # Noise parameters
    add_noise = forms.BooleanField(
        label='Add Noise',
        required=False,
        initial=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        })
    )
    
    noise_level = forms.FloatField(
        label='Noise Level',
        initial=0.1,
        required=False,
        help_text='Standard deviation of Gaussian noise (0 = no noise)',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.01',
            'min': '0'
        })
    )
    
    # Parameter generation mode
    use_random_parameters = forms.BooleanField(
        label='Use Random Parameters',
        required=False,
        initial=False,
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        })
    )
    
    num_sinusoids = forms.IntegerField(
        label='Number of Sinusoids',
        initial=3,
        help_text='Number of sinusoidal components to generate',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'min': '1',
            'max': '10'
        })
    )
    
    # Manual parameters for first 3 sinusoids (when not using random)
    amplitude_1 = forms.FloatField(
        label='Amplitude 1',
        initial=1.0,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    frequency_1 = forms.FloatField(
        label='Frequency 1',
        initial=0.1,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.01'
        })
    )
    
    phase_1 = forms.FloatField(
        label='Phase 1',
        initial=0,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    amplitude_2 = forms.FloatField(
        label='Amplitude 2',
        initial=0.5,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    frequency_2 = forms.FloatField(
        label='Frequency 2',
        initial=0.2,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.01'
        })
    )
    
    phase_2 = forms.FloatField(
        label='Phase 2',
        initial=0,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    amplitude_3 = forms.FloatField(
        label='Amplitude 3',
        initial=0.3,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    frequency_3 = forms.FloatField(
        label='Frequency 3',
        initial=0.05,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.01'
        })
    )
    
    phase_3 = forms.FloatField(
        label='Phase 3',
        initial=0,
        required=False,
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    # Offset
    offset = forms.FloatField(
        label='DC Offset',
        initial=0,
        help_text='Constant offset added to the signal',
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'step': '0.1'
        })
    )
    
    def clean(self):
        cleaned_data = super().clean()
        x_start = cleaned_data.get('x_start')
        x_end = cleaned_data.get('x_end')
        
        if x_start and x_end and x_start >= x_end:
            raise forms.ValidationError('X End must be greater than X Start')
        
        return cleaned_data
