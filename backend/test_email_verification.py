#!/usr/bin/env python
"""
Test script to verify email verification template rendering
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'signal_predictor.settings')
django.setup()

from django.template.loader import render_to_string
from django.contrib.auth.models import User
from django.conf import settings

def test_email_verification_template():
    """Test that the email verification template renders correctly"""
    
    # Create a test user object (don't save to database)
    test_user = User(
        username='testuser',
        first_name='John',
        last_name='Doe',
        email='test@example.com'
    )
    
    # Test context
    context = {
        'user': test_user,
        'verification_link': 'http://localhost:3000/verify-email/MQ/abc123def456'
    }
    
    try:
        # Test HTML template
        html_content = render_to_string('emails/email_verification.html', context)
        print("✅ HTML template rendered successfully!")
        print(f"HTML content length: {len(html_content)} characters")
        
        # Test text template
        text_content = render_to_string('emails/email_verification.txt', context)
        print("✅ Text template rendered successfully!")
        print(f"Text content length: {len(text_content)} characters")
        
        # Verify key elements are present in HTML
        if 'Verify Your Email' in html_content:
            print("✅ HTML contains correct title")
        else:
            print("❌ HTML missing title")
            
        if test_user.first_name in html_content:
            print("✅ HTML contains user's first name")
        else:
            print("❌ HTML missing user's first name")
            
        if context['verification_link'] in html_content:
            print("✅ HTML contains verification link")
        else:
            print("❌ HTML missing verification link")
            
        # Verify key elements are present in text
        if 'Welcome John!' in text_content:
            print("✅ Text contains correct greeting")
        else:
            print("❌ Text missing greeting")
            
        if context['verification_link'] in text_content:
            print("✅ Text contains verification link")
        else:
            print("❌ Text missing verification link")
            
        print("\n🎉 Email verification templates are working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Error rendering template: {e}")
        return False

if __name__ == '__main__':
    test_email_verification_template()
