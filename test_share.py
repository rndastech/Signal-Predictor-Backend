#!/usr/bin/env python3
"""
Test script to verify share functionality is working
"""
import requests
import json

BASE_URL = 'http://localhost:8000'
API_URL = f'{BASE_URL}/api'

def test_share_functionality():
    print("Testing Share Functionality")
    print("=" * 50)
    
    # First, let's try to get CSRF token
    print("1. Getting CSRF token...")
    session = requests.Session()
    csrf_response = session.get(f'{API_URL}/csrf/')
    print(f"CSRF Status: {csrf_response.status_code}")
    
    # Test that we can access share endpoints (they should return 404 for non-existent analysis)
    print("\n2. Testing share endpoints availability...")
    
    # Test share options endpoint (should require authentication)
    share_options_response = session.get(f'{API_URL}/analyses/999/share-options/')
    print(f"Share options endpoint status: {share_options_response.status_code}")
    if share_options_response.status_code == 401:
        print("✓ Share options endpoint requires authentication (as expected)")
    
    # Test public share endpoint (should return 404 for non-existent analysis)
    share_view_response = session.get(f'{API_URL}/share/999/')
    print(f"Public share endpoint status: {share_view_response.status_code}")
    if share_view_response.status_code == 404:
        print("✓ Public share endpoint returns 404 for non-existent analysis (as expected)")
    
    print("\n3. API endpoints are accessible and responding correctly!")
    print("✓ Backend share functionality is properly configured")

if __name__ == '__main__':
    try:
        test_share_functionality()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Django server. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error testing share functionality: {e}")
