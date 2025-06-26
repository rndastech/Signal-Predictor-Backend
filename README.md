<div align="center">

![Signal Predictor Banner](https://github.com/user-attachments/assets/8e4a5e4c-b816-4ce7-9d89-9ebec51b9af9)

# 🌊 Signal Predictor (Backend)

### *Advanced Signal Analysis & Prediction Platform*

[![Django](https://img.shields.io/badge/Django-4.2.7-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![AWS S3](https://img.shields.io/badge/AWS%20S3-569A31?style=for-the-badge&logo=amazon-s3&logoColor=white)](https://aws.amazon.com/s3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A cutting-edge full-stack web application for advanced time-series signal analysis using Fast Fourier Transform (FFT), multi-sinusoidal curve fitting, and machine learning techniques.**

[🚀 **Live Demo**](#) 

</div>

---

## ✨ Features Overview

### 🔬 **Advanced Signal Analysis**
- **FFT Analysis**: Automatic frequency domain analysis to identify dominant frequencies
- **Multi-Sinusoidal Curve Fitting**: Sophisticated optimization using scipy algorithms
- **Train/Test Validation**: Intelligent data splitting with performance metrics
- **Real-time Function Evaluation**: Test fitted mathematical functions with custom inputs
- **Advanced Mode**: Customizable analysis parameters with noise filtering

### 🎛️ **Signal Generation & Synthesis**
- **Synthetic Signal Generator**: Create custom sinusoidal signals with multiple components
- **Parameter Control**: Fine-tune amplitude, frequency, phase, and DC offset
- **Noise Simulation**: Add configurable Gaussian noise for realistic testing
- **Random Generation**: AI-powered random parameter generation
- **Visual Preview**: Real-time visualization of generated signals

### 👤 **User Management & Authentication**
- **Secure Registration**: Email verification with professional templates
- **Password Management**: Reset functionality with secure token validation
- **User Profiles**: Customizable profiles with avatar upload
- **Analysis Quotas**: Configurable per-user analysis limits
- **Session Management**: Persistent analysis sessions for anonymous users

### 📊 **Data Visualization & Sharing**
- **Interactive Plots**: High-quality matplotlib visualizations
- **Multi-view Analysis**: Frequency spectrum, original vs reconstructed, training vs testing
- **Public Sharing**: Share analyses with optional password protection
- **Export Capabilities**: Download results as CSV, images, or JSON
- **Analysis History**: Comprehensive browsing and management of past analyses

### 🏗️ **Modern Architecture**
- **Full-Stack Separation**: Django REST API + React SPA
- **Cloud Storage**: AWS S3/Cloudflare R2 integration for scalability
- **RESTful API**: Complete API coverage for all features
- **Responsive Design**: Futuristic dark theme optimized for all devices
- **Production Ready**: Configured for deployment with PostgreSQL

## 🧮 Mathematical Foundation

The application implements a sophisticated signal analysis pipeline:

1. **Data Preprocessing**: Intelligent splitting into training (x < split_point) and testing (x ≥ split_point) sets
2. **Frequency Analysis**: Fast Fourier Transform to identify dominant frequency components
3. **Model Fitting**: Multi-sinusoidal regression of the form:
   ```
   f(x) = Σᵢ Aᵢ * sin(2π * fᵢ * x + φᵢ) + D
   ```
   Where:
   - `Aᵢ` = Amplitude of component i
   - `fᵢ` = Frequency of component i  
   - `φᵢ` = Phase shift of component i
   - `D` = DC offset (bias term)

4. **Model Validation**: Performance evaluation using Mean Squared Error (MSE) on test data
5. **Prediction**: Real-time function evaluation for new input values

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 13+** (or SQLite for development)
- **Git** for version control

### 🔧 Backend Setup (Django API)

1. **Clone the repository**
   ```bash
   git clone https://github.com/riteshnarayandas/signal-predictor.git
   cd signal-predictor/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**
   ```bash
   # Create .env file in backend/ directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Start development server**
   ```bash
   python manage.py runserver
   ```

### ⚛️ Frontend Setup (React SPA)

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/api/`
   - Admin Panel: `http://localhost:8000/admin/`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration with email verification
- `POST /api/auth/login/` - User authentication
- `POST /api/auth/logout/` - Session termination
- `GET /api/auth/user/` - Current user profile
- `POST /api/auth/change-password/` - Password modification
- `POST /api/auth/password-reset/` - Password reset request
- `POST /api/auth/password-reset-confirm/` - Password reset confirmation

### Signal Analysis
- `POST /api/upload/` - CSV file upload and analysis
- `POST /api/evaluate/` - Function evaluation at specific points
- `GET /api/analyses/` - List user's analyses
- `GET /api/analyses/{id}/` - Retrieve specific analysis
- `PATCH /api/analyses/{id}/` - Update analysis metadata
- `DELETE /api/analyses/{id}/` - Delete analysis

### Signal Generation
- `POST /api/generator/` - Generate synthetic signals
- `GET /api/generator/presets/` - Available generation presets

### Sharing & Collaboration
- `GET /api/analyses/{id}/share-options/` - Get sharing configuration
- `POST /api/analyses/{id}/share-options/` - Update sharing settings
- `GET /api/share/{id}/` - Access shared analysis
- `POST /api/share/{id}/` - Access password-protected analysis

### User Management
- `GET /api/profile/` - User profile data
- `PATCH /api/profile/` - Update profile information
- `POST /api/profile/avatar/` - Upload profile picture

## 🛠️ Technology Stack

### Backend Technologies
- **Framework**: Django 4.2.7 with Django REST Framework
- **Database**: PostgreSQL with psycopg2 adapter. Hosted on Neon.
- **Authentication**: Django's built-in auth + custom email verification
- **File Storage**: AWS S3 / Cloudflare R2 with django-storages
- **Email**: SMTP with HTML templates
- **Task Queue**: Django APScheduler for background tasks

### Data Science & Analysis
- **Signal Processing**: NumPy, SciPy, scikit-learn
- **Visualization**: Matplotlib, Seaborn
- **Data Handling**: Pandas for CSV processing
- **Machine Learning**: Custom FFT analysis and curve fitting

### Frontend Technologies
- **Framework**: React 19.1.0 with React Router
- **Styling**: Bootstrap 5 + Custom CSS with futuristic theme
- **Icons**: Lucide React + Font Awesome
- **HTTP Client**: Axios for API communication
- **State Management**: React Context API

### Development & Deployment
- **Environment**: Python-decouple for configuration
- **CORS**: django-cors-headers for frontend integration
- **Security**: CSRF protection, secure headers
- **Monitoring**: Custom error handling and logging

## 🎨 User Interface

### Modern Design Features
- **🌃 Futuristic Dark Theme**: Custom-designed dark interface with neon accents
- **⚡ Smooth Animations**: CSS3 transitions and hover effects
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **🎯 Intuitive Navigation**: Clean, user-friendly interface
- **📊 Interactive Visualizations**: High-quality charts and graphs
- **🔔 Toast Notifications**: Real-time feedback for user actions

### Key Components
1. **Dashboard**: Overview of recent analyses and statistics
2. **Upload Interface**: Drag-and-drop file upload with preview
3. **Analysis Results**: Comprehensive visualization suite
4. **Signal Generator**: Interactive parameter configuration
5. **Profile Management**: User settings and analysis history
6. **Sharing Hub**: Collaboration and export features

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration (PostgreSQL)
DB_NAME=signal_predictor
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# Cloud Storage (AWS S3 / Cloudflare R2)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
AWS_S3_ENDPOINT_URL=https://your-endpoint.com

# Frontend Configuration
FRONTEND_BASE_URL=http://localhost:3000
```

<div align="center">

### 🌟 Star this project if it helped you!

**Made with ❤️ by [Ritesh Narayan Das](https://github.com/rndastech)**

*Advanced Signal Analysis & Prediction Platform • June 2025*

</div>
