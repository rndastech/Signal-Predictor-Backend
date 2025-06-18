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
