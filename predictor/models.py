from django.db import models
import json


class SignalAnalysis(models.Model):
    uploaded_file = models.FileField(upload_to='uploads/')
    created_at = models.DateTimeField(auto_now_add=True)
    fitted_function = models.TextField()
    parameters = models.JSONField()
    mse = models.FloatField(null=True, blank=True)
    dominant_frequencies = models.JSONField()
    
    def __str__(self):
        return f"Signal Analysis {self.id} - {self.created_at}"
    
    class Meta:
        ordering = ['-created_at']
