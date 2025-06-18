from django.contrib import admin
from .models import SignalAnalysis


@admin.register(SignalAnalysis)
class SignalAnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'mse', 'get_components_count')
    list_filter = ('created_at',)
    search_fields = ('fitted_function',)
    readonly_fields = ('created_at',)
    
    def get_components_count(self, obj):
        return len(obj.parameters.get('sinusoidal_components', []))
    get_components_count.short_description = 'Components'
