# Signal Predictor - React + Django API Integration

This project has been successfully converted from Django template-based views to a React frontend with Django REST API backend.

## Architecture

- **Backend**: Django REST API (Port 8000)
- **Frontend**: React App (Port 3000)
- **Communication**: RESTful APIs with session-based authentication

## Setup Instructions

### Backend (Django)

1. Navigate to the Django project:
   ```powershell
   cd "c:\Users\rites\OneDrive\Documents\Sinusoid Predictor\signal_predictor_webapp"
   ```

2. Install required packages:
   ```powershell
   pip install djangorestframework django-cors-headers
   ```

3. Run migrations:
   ```powershell
   python manage.py migrate
   ```

4. Start the Django server:
   ```powershell
   python manage.py runserver
   ```
   Server will be available at: http://localhost:8000

### Frontend (React)

1. Navigate to the React project:
   ```powershell
   cd "c:\Users\rites\OneDrive\Documents\Sinusoid Predictor\signal-predictor-frontend"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the React development server:
   ```powershell
   npm start
   ```
   App will be available at: http://localhost:3000

## API Endpoints

The Django backend now provides the following API endpoints:

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/user/` - Get current user info

### Signal Analysis
- `GET /api/home/` - Get dashboard data
- `POST /api/upload/` - Upload CSV and analyze signal
- `POST /api/evaluate/` - Evaluate function at specific points
- `GET /api/analyses/` - List user's analyses
- `GET /api/analyses/<id>/` - Get specific analysis
- `PATCH /api/analyses/<id>/` - Update analysis
- `DELETE /api/analyses/<id>/` - Delete analysis
- `POST /api/analyses/bulk-delete/` - Delete multiple analyses
- `POST /api/save-analysis/` - Save session analysis to database

### Signal Generator
- `POST /api/generator/` - Generate synthetic signals

### User Profile
- `GET /api/profile/` - Get user profile
- `PATCH /api/profile/` - Update user profile

## Key Features Implemented

### Frontend (React)
- ✅ Session-based authentication with Django
- ✅ File upload with drag & drop support
- ✅ Real-time API communication
- ✅ Error handling and loading states
- ✅ Responsive UI with Bootstrap
- ✅ Function evaluation
- ✅ Analysis results display

### Backend (Django API)
- ✅ REST API endpoints for all functionality
- ✅ CORS configuration for React frontend
- ✅ Session-based authentication
- ✅ File upload handling
- ✅ Signal analysis processing
- ✅ JSON serialization of models

## Configuration

### CORS Settings
The Django backend is configured to accept requests from:
- http://localhost:3000 (React dev server)
- http://127.0.0.1:3000

### API Base URL
The React frontend is configured to make requests to:
- http://localhost:8000/api (Django API)

## Testing the Integration

1. Start both servers (Django on 8000, React on 3000)
2. Navigate to http://localhost:3000
3. Try the following flows:
   - User registration/login
   - CSV file upload and analysis
   - Function evaluation
   - Results display

## Next Steps

Optional enhancements you can add:
- [ ] Token-based authentication (JWT)
- [ ] Real-time updates with WebSockets
- [ ] Data visualization charts
- [ ] Export functionality
- [ ] Analysis sharing features
- [ ] Batch file processing

## Troubleshooting

**CORS Issues**: Make sure both servers are running and the CORS settings in Django include your React app's URL.

**API Errors**: Check the Django server console for detailed error messages.

**File Upload Issues**: Ensure the Django media settings are properly configured and the upload directory exists.

The integration is now complete and fully functional!
