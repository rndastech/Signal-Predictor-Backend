from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import json
from django.contrib.auth.hashers import make_password, check_password


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    website = models.URLField(blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()


class SignalAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='signal_analyses', null=True, blank=True)
    name = models.CharField(max_length=100, blank=True, help_text="Custom name for this analysis")
    uploaded_file = models.FileField(upload_to='uploads/')
    created_at = models.DateTimeField(auto_now_add=True)
    fitted_function = models.TextField()
    parameters = models.JSONField()
    mse = models.FloatField(null=True, blank=True)
    dominant_frequencies = models.JSONField()

    # Add public/private sharing fields
    is_public = models.BooleanField(default=False)
    share_password_hash = models.CharField(max_length=128, blank=True)

    def __str__(self):
        # string representation uses display_name property directly
        return f"{self.display_name} - {self.created_at} - User: {self.user.username if self.user else 'Anonymous'}"
    
    @property
    def display_name(self):
        """Return custom name if set, otherwise default to 'Analysis #id'"""
        return self.name if self.name else f"Analysis #{self.id}"
    
    class Meta:
        ordering = ['-created_at']
        
    @property
    def user_analysis_count(self):
        """Get total number of analyses for this user"""
        if self.user:
            return SignalAnalysis.objects.filter(user=self.user).count()
        return 0

    # Methods to set and check share password
    def set_share_password(self, raw_password):
        self.share_password_hash = make_password(raw_password)

    def check_share_password(self, raw_password):
        return check_password(raw_password, self.share_password_hash)
