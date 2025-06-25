import numpy as np
import pandas as pd
from scipy.fft import fft, fftfreq
from scipy.signal import find_peaks
from scipy.optimize import curve_fit
from scipy.optimize import differential_evolution  # added for global optimization
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error
import io
import base64
import math
import random


class SignalGenerator:
    """Generate synthetic sinusoidal signals with customizable parameters"""
    
    def __init__(self):
        self.last_generated_params = None
    
    def generate_signal(self, x_start=0, x_end=50, num_points=1000, 
                       sinusoid_params=None, offset=0, noise_level=0, 
                       use_random=False, num_sinusoids=3):
        """
        Generate a synthetic signal based on multiple sinusoids
        
        Args:
            x_start: Starting x value
            x_end: Ending x value  
            num_points: Number of data points
            sinusoid_params: List of tuples (amplitude, frequency, phase) for each sinusoid
            offset: DC offset
            noise_level: Standard deviation of Gaussian noise
            use_random: If True, generate random parameters
            num_sinusoids: Number of sinusoids when using random parameters
            
        Returns:
            pandas DataFrame with 'x' and 'y' columns
        """
        try:
            # Generate x values
            x = np.linspace(x_start, x_end, num_points)
            
            # Initialize y with offset
            y = np.full_like(x, offset)
            
            # Generate or use provided sinusoid parameters
            if use_random:
                params = self._generate_random_parameters(num_sinusoids)
            else:
                params = sinusoid_params if sinusoid_params else [(1.0, 0.1, 0)]
            
            self.last_generated_params = {
                'sinusoids': params,
                'offset': offset,
                'noise_level': noise_level,
                'x_range': (x_start, x_end),
                'num_points': num_points
            }
            
            # Add each sinusoidal component
            for amplitude, frequency, phase in params:
                y += amplitude * np.sin(2 * np.pi * frequency * x + phase)
              # Add noise if specified
            if noise_level > 0:
                rng = np.random.default_rng()
                noise = rng.normal(0, noise_level, size=len(x))
                y += noise
            
            # Create DataFrame
            df = pd.DataFrame({
                'x': x,
                'y': y
            })
            
            return {
                'success': True,
                'data': df,
                'parameters': self.last_generated_params,
                'function_string': self._generate_function_string(params, offset)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _generate_random_parameters(self, num_sinusoids):
        """Generate random parameters for sinusoids"""
        params = []
        for _ in range(num_sinusoids):
            # Random amplitude between 0.1 and 2.0
            amplitude = random.uniform(0.1, 2.0)
            # Random frequency between 0.01 and 0.5
            frequency = random.uniform(0.01, 0.5)
            # Random phase between -π and π
            phase = random.uniform(-math.pi, math.pi)
            params.append((amplitude, frequency, phase))
        return params
    
    def _generate_function_string(self, params, offset):
        """Generate human-readable function string"""
        function_str = "f(x) = "
        
        for i, (amplitude, frequency, phase) in enumerate(params):
            if i > 0:
                function_str += " + "
            function_str += f"{amplitude:.3f} * sin(2π * {frequency:.3f} * x + {phase:.3f})"
        
        if offset != 0:
            function_str += f" + {offset:.3f}"
        
        return function_str
    
    def generate_visualization(self, df):
        """Generate visualization plots for the generated signal"""
        # Constants for axis labels
        X_LABEL = 'X (time)'
        Y_LABEL = 'Y (signal)'
        
        plots = {}
        x = df['x'].values
        y = df['y'].values
        params = self.last_generated_params
        
        # Plot 1: Generated Signal
        plt.figure(figsize=(12, 6))
        plt.plot(x, y, 'b-', linewidth=1.5, label='Generated Signal')
        plt.title('Generated Sinusoidal Signal')
        plt.xlabel(X_LABEL)
        plt.ylabel(Y_LABEL)
        plt.grid(True, alpha=0.3)
        plt.legend()
        plots['signal'] = self._plot_to_base64()
        
        # Plot 2: Individual Components
        if len(params['sinusoids']) > 1:
            plt.figure(figsize=(12, 8))
            
            # Plot each sinusoidal component
            y_components = []
            for i, (amplitude, frequency, phase) in enumerate(params['sinusoids']):
                component = amplitude * np.sin(2 * np.pi * frequency * x + phase)
                y_components.append(component)
                plt.plot(x, component, '--', alpha=0.7, 
                        label=f'Component {i+1}: A={amplitude:.2f}, f={frequency:.3f}')
            
            # Plot combined signal (without noise)
            y_clean = np.sum(y_components, axis=0) + params['offset']
            plt.plot(x, y_clean, 'k-', linewidth=2, label='Combined (no noise)')
            
            plt.title('Individual Sinusoidal Components')
            plt.xlabel(X_LABEL)
            plt.ylabel(Y_LABEL)
            plt.grid(True, alpha=0.3)
            plt.legend()
            plots['components'] = self._plot_to_base64()
        
        # Plot 3: FFT Analysis of generated signal
        N = len(x)
        T = x[1] - x[0] if len(x) > 1 else 1
        yf = fft(y)
        xf = fftfreq(N, T)[:N//2]
        amplitudes = 2.0 / N * np.abs(yf[:N//2])
        
        plt.figure(figsize=(10, 6))
        plt.plot(xf, amplitudes, 'r-', linewidth=1.5)
        plt.title('FFT Analysis of Generated Signal')
        plt.xlabel('Frequency')
        plt.ylabel('Amplitude')
        plt.grid(True, alpha=0.3)
        
        # Mark the theoretical frequencies
        for amplitude, frequency, phase in params['sinusoids']:
            plt.axvline(x=frequency, color='green', linestyle='--', alpha=0.7,
                       label=f'Theoretical f={frequency:.3f}')
        
        plt.legend()
        plots['fft'] = self._plot_to_base64()
        
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

            # Detrend to remove DC offset
            y_detrended = y_train - np.mean(y_train)

            # Compute one-sided FFT including Nyquist
            yf = fft(y_detrended)
            xf = np.fft.rfftfreq(N, T)
            amplitudes = 2.0 / N * np.abs(yf[:N//2+1])

            # Remove DC spike so it doesn't count as a sinusoid
            amplitudes[0] = 0

            # Find dominant frequencies
            peaks, _ = find_peaks(amplitudes, height=0.05)
            # Fallback: if fewer than 2 peaks found, pick top-2 amplitude bins
            if len(peaks) < 2 and len(amplitudes) >= 2:
                sorted_idx = np.argsort(amplitudes)
                peaks = sorted_idx[-2:]
            # Assign detected frequencies and amplitudes
            self.dominant_freqs = xf[peaks]
            self.dominant_amplitudes = amplitudes[peaks]

            if len(self.dominant_freqs) == 0:
                raise ValueError("No dominant frequencies found")
            
            # Set initial guesses for curve fitting
            # Estimate initial amplitudes, frequencies, and phases from FFT
            # FFT was computed on detrended data, so get phase from original y_train FFT
            fft_full = fft(y_train - np.mean(y_train))
            fft_angles = np.angle(fft_full[:N//2+1])
            initial_guess = []
            for amp, freq, peak in zip(self.dominant_amplitudes, self.dominant_freqs, peaks):
                phase_guess = fft_angles[peak]
                initial_guess.extend([amp, freq, phase_guess])
            # Use mean of training data as initial offset
            initial_guess.append(np.mean(y_train))
            

            self.params, _ = curve_fit(
                self.multi_sinusoidal,
                x_train,
                y_train,
                p0=initial_guess,
            )  
            
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
            phi = self.params[i+2] % (2 * np.pi)  # normalize to [0, 2π]
            fitted_function += f"{A:.3f} * sin(2 * π * {f:.3f} * x + {phi:.3f}) + "
        
        D = self.params[-1]
        fitted_function += f"{D:.3f}"
        return fitted_function
    
    def _format_parameters(self):
        """Format parameters for display"""
        formatted_params = []
        for i in range(0, len(self.params)-1, 3):
            phi = self.params[i+2] % (2 * np.pi)
            formatted_params.append({
                'amplitude': round(self.params[i], 3),
                'frequency': round(self.params[i+1], 3),
                'phase': round(phi, 3)
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
