import numpy as np
import pandas as pd
from scipy.fft import fft, fftfreq
from scipy.signal import find_peaks
from scipy.optimize import curve_fit
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error
import io
import base64
import math


class SignalPredictor:
    def __init__(self):
        self.params = None
        self.mse = None
        self.dominant_freqs = None
        self.dominant_amplitudes = None
        
    def multi_sinusoidal(self, x, *params):
        """Multi-sinusoidal model for curve fitting"""
        D = params[-1]  # Offset
        y = np.zeros_like(x) + D
        for i in range(0, len(params)-1, 3):
            A = params[i]
            f = params[i+1]
            phi = params[i+2]
            y += A * np.sin(2 * np.pi * f * x + phi)
        return y
    
    def analyze_signal(self, csv_data, split_point=20):
        """
        Analyze signal using FFT and curve fitting
        
        Args:
            csv_data: pandas DataFrame with 'x' and 'y' columns
            split_point: point to split train/test data
            
        Returns:
            dict with analysis results
        """
        try:
            # Extract x and y data
            x_data = csv_data['x'].values
            y_data = csv_data['y'].values
            
            # Split data into training and testing
            train_mask = x_data < split_point
            test_mask = x_data >= split_point
            
            x_train = x_data[train_mask]
            y_train = y_data[train_mask]
            x_test = x_data[test_mask]
            y_test = y_data[test_mask]
            
            if len(x_train) < 2:
                raise ValueError("Not enough training data points")
            
            # Perform FFT on training data
            N = len(x_train)
            T = x_train[1] - x_train[0] if len(x_train) > 1 else 1
            
            yf = fft(y_train)
            xf = fftfreq(N, T)[:N//2]
            
            # Find dominant frequencies
            amplitudes = 2.0 / N * np.abs(yf[:N//2])
            peaks, _ = find_peaks(amplitudes, height=0.05)
            
            self.dominant_freqs = xf[peaks]
            self.dominant_amplitudes = amplitudes[peaks]
            
            if len(self.dominant_freqs) == 0:
                raise ValueError("No dominant frequencies found")
            
            # Set initial guesses for curve fitting
            initial_guess = []
            for amp, freq in zip(self.dominant_amplitudes, self.dominant_freqs):
                initial_guess.extend([amp, freq, 0])  # Amplitude, frequency, phase
            initial_guess.append(0)  # Offset
            
            # Fit the multi-sinusoidal model
            self.params, _ = curve_fit(self.multi_sinusoidal, x_train, y_train, p0=initial_guess)
            
            # Test the model if test data exists
            if len(x_test) > 0:
                y_pred = self.multi_sinusoidal(x_test, *self.params)
                self.mse = mean_squared_error(y_test, y_pred)
            else:
                y_pred = None
                self.mse = None
            
            # Generate plots
            plots = self._generate_plots(x_data, y_data, x_train, y_train, x_test, y_test, y_pred, xf, amplitudes)
            
            # Generate fitted function string
            fitted_function = self._generate_function_string()
            
            return {
                'success': True,
                'fitted_function': fitted_function,
                'parameters': self._format_parameters(),
                'mse': self.mse,
                'dominant_frequencies': list(zip(self.dominant_freqs, self.dominant_amplitudes)),
                'plots': plots,
                'test_predictions': y_pred.tolist() if y_pred is not None else None,
                'test_x': x_test.tolist() if len(x_test) > 0 else None
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_plots(self, x_data, y_data, x_train, y_train, x_test, y_test, y_pred, xf, amplitudes):
        """Generate matplotlib plots and return as base64 encoded images"""
        plots = {}
        
        # Plot 1: Frequency Spectrum
        plt.figure(figsize=(10, 6))
        plt.plot(xf, amplitudes)
        plt.title('Fourier Transform - Frequency Spectrum')
        plt.xlabel('Frequency')
        plt.ylabel('Amplitude')
        plt.grid()
        plots['frequency_spectrum'] = self._plot_to_base64()
        
        # Plot 2: Original vs Reconstructed Signal
        plt.figure(figsize=(12, 8))
        reconstructed_signal = self.multi_sinusoidal(x_data, *self.params)
        plt.scatter(x_data, y_data, label='Original Data', color='red', s=10)
        plt.plot(x_data, reconstructed_signal, label='Reconstructed Signal', color='blue', linewidth=2)
        plt.title('Original Signal vs Reconstructed Signal')
        plt.xlabel('X (time)')
        plt.ylabel('Y (signal)')
        plt.legend()
        plt.grid()
        plots['original_vs_reconstructed'] = self._plot_to_base64()
        
        # Plot 3: Training vs Testing Performance
        if y_pred is not None and len(x_test) > 0:
            plt.figure(figsize=(12, 8))
            plt.scatter(x_train, y_train, label='Training Data', color='green', s=10)
            plt.scatter(x_test, y_test, label='Test Data (Ground Truth)', color='red', s=10)
            plt.plot(x_train, self.multi_sinusoidal(x_train, *self.params), 
                    label='Fitted Model on Training Data', color='blue', linewidth=2)
            plt.plot(x_test, y_pred, label='Predicted Test Data', color='orange', 
                    linewidth=2, linestyle='--')
            plt.title('Model Fitting and Prediction')
            plt.xlabel('X (time)')
            plt.ylabel('Y (signal)')
            plt.legend()
            plt.grid()
            plots['training_vs_testing'] = self._plot_to_base64()
        
        return plots
    
    def _plot_to_base64(self):
        """Convert current matplotlib plot to base64 string"""
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
        buffer.seek(0)
        plot_data = buffer.getvalue()
        buffer.close()
        plt.close()
        
        encoded_plot = base64.b64encode(plot_data).decode()
        return encoded_plot
    
    def _generate_function_string(self):
        """Generate human-readable fitted function string"""
        fitted_function = "f(x) = "
        for i in range(0, len(self.params)-1, 3):
            A = self.params[i]
            f = self.params[i+1]
            phi = self.params[i+2]
            fitted_function += f"{A:.3f} * sin(2 * π * {f:.3f} * x + {phi:.3f}) + "
        
        D = self.params[-1]
        fitted_function += f"{D:.3f}"
        return fitted_function
    
    def _format_parameters(self):
        """Format parameters for display"""
        formatted_params = []
        for i in range(0, len(self.params)-1, 3):
            formatted_params.append({
                'amplitude': round(self.params[i], 3),
                'frequency': round(self.params[i+1], 3),
                'phase': round(self.params[i+2], 3)
            })
        
        return {
            'sinusoidal_components': formatted_params,
            'offset': round(self.params[-1], 3)
        }
    
    def evaluate_function(self, x_value):
        """Evaluate the fitted function at a specific x value"""
        if self.params is None:
            raise ValueError("Model has not been fitted yet")
        
        result = 0
        for i in range(0, len(self.params)-1, 3):
            A = self.params[i]
            f = self.params[i+1]
            phi = self.params[i+2]
            result += A * math.sin(2 * math.pi * f * x_value + phi)
        result += self.params[-1]  # Add offset
        
        return result
