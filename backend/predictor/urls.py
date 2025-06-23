from django.urls import path
from . import views
from .auth_views import CustomLoginView, CustomLogoutView, SignUpView
from .views import share_options, analysis_share

urlpatterns = [
    path('', views.home, name='home'),
    path('upload/', views.upload_csv, name='upload_csv'),
    path('evaluate/', views.evaluate_function, name='evaluate_function'),    path('analysis/<int:analysis_id>/', views.analysis_detail, name='analysis_detail'),
    path('analysis/<int:analysis_id>/rename/', views.rename_analysis, name='rename_analysis'),    path('analysis/<int:analysis_id>/delete/', views.delete_analysis, name='delete_analysis'),
    path('analyses/', views.analysis_list, name='analysis_list'),
    path('analyses/bulk-delete/', views.bulk_delete_analyses, name='bulk_delete_analyses'),
    path('save-analysis/', views.save_session_analysis, name='save_session_analysis'),
    path('clear-session/', views.clear_session, name='clear_session'),  # Debug only
    path('generator/', views.signal_generator, name='signal_generator'),
    path('download-csv/', views.download_generated_csv, name='download_generated_csv'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('analysis/<int:analysis_id>/share/options/', share_options, name='share_options'),
    path('share/<int:analysis_id>/', analysis_share, name='analysis_share'),
]
