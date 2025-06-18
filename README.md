# Signal Predictor Web Application

A Django-based web application for analyzing time-series signals using Fast Fourier Transform (FFT) and multi-sinusoidal curve fitting.

## Features

- **Signal Analysis**: Upload CSV files with signal data (x, y columns)
- **FFT Analysis**: Automatic frequency domain analysis to identify dominant frequencies
- **Curve Fitting**: Multi-sinusoidal model fitting using scipy optimization
- **Visualizations**: Interactive plots showing:
  - Frequency spectrum
  - Original vs reconstructed signal
  - Training vs testing performance
- **Function Evaluation**: Real-time evaluation of fitted mathematical functions
- **Analysis History**: Store and browse past analysis results
- **Responsive UI**: Modern, mobile-friendly interface with Bootstrap

## Mathematical Background

The application implements a signal analysis pipeline that:

1. **Splits data** into training (x < split_point) and testing (x >= split_point) sets
2. **Performs FFT** on training data to identify dominant frequencies
3. **Fits a multi-sinusoidal model** of the form:
   ```
   f(x) = Σ Ai * sin(2π * fi * x + φi) + D
   ```
   Where:
   - `Ai` = Amplitude of component i
   - `fi` = Frequency of component i  
   - `φi` = Phase of component i
   - `D` = DC offset

4. **Validates** the model on test data and calculates Mean Squared Error (MSE)

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/signal-predictor.git
   cd signal-predictor
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

6. **Access the application**:
   Open your browser and navigate to `http://127.0.0.1:8000/`

## Usage

### CSV File Format

Your CSV file should have the following structure:
```csv
x,y
0.0,1.234
0.1,2.456
0.2,1.789
...
```

Requirements:
- Must contain 'x' and 'y' columns
- Numeric data only
- At least 3 data points recommended
- CSV format (.csv extension)

### Analysis Workflow

1. **Upload CSV**: Navigate to the upload page and select your signal data file
2. **Set Parameters**: Choose the train/test split point (default: 20)
3. **Analyze**: Click "Analyze Signal" to process your data
4. **View Results**: Examine the fitted function, parameters, and visualizations
5. **Evaluate Function**: Test the fitted function with custom x values
6. **Browse History**: View and compare past analyses

## Sample Data

A sample CSV file (`sample_signal.csv`) is included for testing. It contains a sinusoidal signal that demonstrates the application's capabilities.

## Technology Stack

- **Backend**: Django 4.2.7
- **Frontend**: Bootstrap 5, jQuery
- **Data Processing**: pandas, numpy, scipy, scikit-learn
- **Visualization**: matplotlib
- **Database**: SQLite (default, easily configurable for PostgreSQL/MySQL)

## Project Structure

```
signal_predictor_webapp/
├── manage.py
├── requirements.txt
├── sample_signal.csv
├── predictor/
│   ├── models.py          # Database models
│   ├── views.py           # Request handlers
│   ├── forms.py           # Form definitions
│   ├── signal_utils.py    # Core signal processing logic
│   ├── urls.py            # URL routing
│   └── admin.py           # Admin interface
├── signal_predictor/
│   ├── settings.py        # Django configuration
│   ├── urls.py            # Main URL routing
│   └── wsgi.py            # WSGI configuration
└── templates/
    ├── base.html          # Base template
    └── predictor/
        ├── home.html      # Home page
        ├── upload.html    # Upload form
        ├── results.html   # Analysis results
        ├── analysis_list.html
        └── analysis_detail.html
```

## API Endpoints

- `/` - Home page
- `/upload/` - CSV upload and analysis
- `/evaluate/` - AJAX endpoint for function evaluation
- `/analyses/` - List all analyses
- `/analysis/<id>/` - View specific analysis details
- `/admin/` - Django admin interface

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with Django and the Python scientific computing stack
- Uses Fast Fourier Transform for frequency analysis
- Implements scipy's curve fitting optimization algorithms
- Responsive design powered by Bootstrap

## Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Upload Interface
![Upload](screenshots/upload.png)

### Analysis Results
![Results](screenshots/results.png)

### Frequency Spectrum
![Frequency Spectrum](screenshots/frequency_spectrum.png)

---

**Author**: Ritesh Narayan Das  
**Created**: June 2025
