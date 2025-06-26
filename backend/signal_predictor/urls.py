from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('predictor.api_urls')),  # API endpoints
    # Removed template-based views as we're using React frontend
    path('', RedirectView.as_view(url='/api/home/', permanent=False)),  # Redirect to API
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
