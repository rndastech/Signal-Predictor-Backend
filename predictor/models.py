from django.db import models
from django.contrib.auth.models import User
import json


class SignalAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='signal_analyses', null=True, blank=True)
    uploaded_file = models.FileField(upload_to='uploads/')
    created_at = models.DateTimeField(auto_now_add=True)
    fitted_function = models.TextField()
    parameters = models.JSONField()
    mse = models.FloatField(null=True, blank=True)
    dominant_frequencies = models.JSONField()
    
    def __str__(self):
        return f"Signal Analysis {self.id} - {self.created_at} - User: {self.user.username if self.user else 'Anonymous'}"
    
    class Meta:
        ordering = ['-created_at']
        
    @property
    def user_analysis_count(self):
        """Get total number of analyses for this user"""
        if self.user:
            return SignalAnalysis.objects.filter(user=self.user).count()
        return 0
