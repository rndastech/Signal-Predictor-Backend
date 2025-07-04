from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import SignalAnalysis, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)


# Re-register User admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'website')
    list_filter = ('birth_date',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'location')


@admin.register(SignalAnalysis)
class SignalAnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'display_name', 'created_at', 'mse', 'get_components_count', 'has_visualizations')
    list_filter = ('created_at', 'user', 'is_public')
    search_fields = ('name', 'fitted_function', 'user__username')
    readonly_fields = ('created_at', 'has_visualizations', 'get_visualization_urls', 'get_data_preview')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'created_at', 'uploaded_file')
        }),
        ('Analysis Results', {
            'fields': ('fitted_function', 'parameters', 'mse', 'dominant_frequencies')
        }),
        ('Data Preview', {
            'fields': ('data_preview',),
            'classes': ('collapse',)
        }),
        ('Visualizations', {
            'fields': ('original_signal_plot', 'fitted_signal_plot', 'frequency_analysis_plot', 'has_visualizations'),
            'classes': ('collapse',)
        }),
        ('Sharing', {
            'fields': ('is_public', 'share_password_hash'),
            'classes': ('collapse',)
        })
    )
    
    def get_components_count(self, obj):
        return len(obj.parameters.get('sinusoidal_components', []))
    get_components_count.short_description = 'Components'
