from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    UserRegistrationView, UserLoginView, UserLogoutView, CurrentUserView,
    HomeView, SignalAnalysisUploadView, FunctionEvaluationView,
    SignalAnalysisListView, SignalAnalysisDetailView, SignalGeneratorView,
    UserProfileView, save_session_analysis, clear_session, bulk_delete_analyses,
    csrf_token, ChangePasswordView, PasswordResetRequestView, PasswordResetConfirmView,
    AnalysisShareOptionsView, AnalysisShareView, AnalysisDetailWithVisualizationsView, VerifyEmailView
)

urlpatterns = [
    # CSRF token endpoint
    path('csrf/', csrf_token, name='api_csrf'),
    
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='api_register'),
    path('auth/verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='api_verify_email'),
    path('auth/login/', UserLoginView.as_view(), name='api_login'),
    path('auth/logout/', UserLogoutView.as_view(), name='api_logout'),
    path('auth/user/', CurrentUserView.as_view(), name='api_current_user'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='api_change_password'),
    
    # Password reset endpoints
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='api_password_reset'),
    path('auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='api_password_reset_confirm'),
    
    # Home/dashboard
    path('home/', HomeView.as_view(), name='api_home'),
      # Signal analysis endpoints
    path('upload/', SignalAnalysisUploadView.as_view(), name='api_upload'),
    path('evaluate/', FunctionEvaluationView.as_view(), name='api_evaluate'),
    path('analyses/', SignalAnalysisListView.as_view(), name='api_analyses_list'),
    path('analyses/<int:pk>/', SignalAnalysisDetailView.as_view(), name='api_analysis_detail'),
    path('analyses/<int:analysis_id>/details/', AnalysisDetailWithVisualizationsView.as_view(), name='api_analysis_details_with_viz'),
    path('analyses/bulk-delete/', bulk_delete_analyses, name='api_bulk_delete'),
    path('save-analysis/', save_session_analysis, name='api_save_analysis'),
    
    # Signal generator
    path('generator/', SignalGeneratorView.as_view(), name='api_generator'),
    
    # User profile
    path('profile/', UserProfileView.as_view(), name='api_profile'),
    
    # Session management
    path('clear-session/', clear_session, name='api_clear_session'),
    
    # Share functionality
    path('analyses/<int:analysis_id>/share-options/', AnalysisShareOptionsView.as_view(), name='api_share_options'),
    path('share/<int:analysis_id>/', AnalysisShareView.as_view(), name='api_share_view'),
]
