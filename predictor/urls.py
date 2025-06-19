from django.urls import path
from . import views
from .auth_views import CustomLoginView, CustomLogoutView, SignUpView

urlpatterns = [
    path('', views.home, name='home'),
    path('upload/', views.upload_csv, name='upload_csv'),
    path('evaluate/', views.evaluate_function, name='evaluate_function'),
    path('analysis/<int:analysis_id>/', views.analysis_detail, name='analysis_detail'),
    path('analyses/', views.analysis_list, name='analysis_list'),
    path('save-analysis/', views.save_session_analysis, name='save_session_analysis'),
    path('clear-session/', views.clear_session, name='clear_session'),  # Debug only
    path('generator/', views.signal_generator, name='signal_generator'),
    path('download-csv/', views.download_generated_csv, name='download_generated_csv'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('signup/', SignUpView.as_view(), name='signup'),
]
