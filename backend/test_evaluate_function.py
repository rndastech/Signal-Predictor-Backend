#!/usr/bin/env python
"""
Quick test script to verify the evaluate function conversion works correctly
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'signal_predictor.settings')
django.setup()

from predictor.views import convert_stored_params_to_predictor_format
from predictor.signal_utils import SignalPredictor

def test_conversion():
    """Test the parameter conversion function"""
    
    # Example stored parameters (from database)
    stored_params = {
        'sinusoidal_components': [
            {'amplitude': 1.5, 'frequency': 0.1, 'phase': 0.0},
            {'amplitude': 0.8, 'frequency': 0.3, 'phase': 1.57}
        ],
        'offset': 0.5
    }
    
    print("Original stored parameters:")
    print(stored_params)
    
    # Convert to predictor format
    predictor_params = convert_stored_params_to_predictor_format(stored_params)
    print("\nConverted predictor parameters:")
    print(predictor_params)
    
    # Expected format: [A1, f1, phi1, A2, f2, phi2, D]
    expected = [1.5, 0.1, 0.0, 0.8, 0.3, 1.57, 0.5]
    print("\nExpected parameters:")
    print(expected)
    
    # Test the evaluation
    predictor = SignalPredictor()
    predictor.params = predictor_params
    
    # Test evaluation at x=1.0
    test_x = 1.0
    result = predictor.evaluate_function(test_x)
    print(f"\nEvaluation at x={test_x}: {result}")
    
    # Manually calculate expected result
    import math
    manual_result = (1.5 * math.sin(2 * math.pi * 0.1 * test_x + 0.0) + 
                    0.8 * math.sin(2 * math.pi * 0.3 * test_x + 1.57) + 
                    0.5)
    print(f"Manual calculation: {manual_result}")
    
    print(f"\nResults match: {abs(result - manual_result) < 1e-10}")

if __name__ == "__main__":
    test_conversion()
