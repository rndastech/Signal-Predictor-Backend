from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
import json
from django.contrib.auth.hashers import make_password, check_password
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
import os
import uuid
from .storage_backends import PublicMediaStorage

# Constants
ANALYSIS_PLOTS_DIR = 'analysis_plots/'


def validate_image_size(image):
    """Ensure uploaded image is <= 500KB"""
    max_size = 500 * 1024
    if image.size > max_size:
        raise ValidationError('Profile picture size should not exceed 500KB.')


def user_profile_picture_upload_to(instance, filename):
    """Generate a unique filename for profile pictures."""
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('profile_pics', new_filename)


def csv_upload_to(instance, filename):
    """Generate a unique filename for uploaded CSV files."""
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('uploads', new_filename)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # Use custom upload_to to generate unique filenames
    profile_picture = models.ImageField(
        upload_to=user_profile_picture_upload_to,
        blank=True,
        null=True,
        storage=PublicMediaStorage(),
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif']),
            validate_image_size
        ]
    )
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
    uploaded_file = models.FileField(
        upload_to=csv_upload_to,
        storage=PublicMediaStorage()
    )
    created_at = models.DateTimeField(auto_now_add=True)
    fitted_function = models.TextField()
    parameters = models.JSONField()
    mse = models.FloatField(null=True, blank=True)
    dominant_frequencies = models.JSONField()    # Data preview and visualization fields
    data_preview = models.JSONField(null=True, blank=True, help_text="First 10 rows of the data")
    original_signal_plot = models.ImageField(
        upload_to=ANALYSIS_PLOTS_DIR,
        blank=True,
        null=True,
        storage=PublicMediaStorage()
    )
    fitted_signal_plot = models.ImageField(
        upload_to=ANALYSIS_PLOTS_DIR,
        blank=True,
        null=True,
        storage=PublicMediaStorage()
    )
    frequency_analysis_plot = models.ImageField(
        upload_to=ANALYSIS_PLOTS_DIR,
        blank=True,
        null=True,
        storage=PublicMediaStorage()
    )

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
        return 0    # Methods to set and check share password
    def set_share_password(self, raw_password):
        self.share_password_hash = make_password(raw_password)

    def check_share_password(self, raw_password):
        return check_password(raw_password, self.share_password_hash)
    
    # Methods for managing visualization data
    def set_data_preview(self, dataframe, num_rows=10):
        """Save the first n rows of the dataframe as JSON for preview"""
        if dataframe is not None and len(dataframe) > 0:
            preview_data = dataframe.head(num_rows).to_dict('records')
            self.data_preview = preview_data
    
    def get_data_preview(self):
        """Get the data preview as a list of dictionaries"""
        return self.data_preview if self.data_preview else []
    
    @property
    def has_visualizations(self):
        """Check if any visualization plot is saved"""
        return bool(
            self.original_signal_plot or 
            self.fitted_signal_plot or 
            self.frequency_analysis_plot
        )
    
    def get_visualization_urls(self):
        """Get URLs for all visualization plots"""
        return {
            'original_signal': self.original_signal_plot.url if self.original_signal_plot else None,
            'fitted_signal': self.fitted_signal_plot.url if self.fitted_signal_plot else None,
            'frequency_analysis': self.frequency_analysis_plot.url if self.frequency_analysis_plot else None,
        }


# Signal handler to delete associated files when a SignalAnalysis instance is deleted
@receiver(post_delete, sender=SignalAnalysis)
def delete_signal_analysis_files(sender, instance, **kwargs):
    # Delete uploaded CSV and generated plots without saving the model
    if instance.uploaded_file:
        instance.uploaded_file.delete(save=False)
    if instance.original_signal_plot:
        instance.original_signal_plot.delete(save=False)
    if instance.fitted_signal_plot:
        instance.fitted_signal_plot.delete(save=False)
    if instance.frequency_analysis_plot:
        instance.frequency_analysis_plot.delete(save=False)

# Signal handler to delete old profile picture when changed
@receiver(pre_save, sender=UserProfile)
def delete_old_profile_picture(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old = UserProfile.objects.get(pk=instance.pk)
    except UserProfile.DoesNotExist:
        return
    old_file = old.profile_picture
    new_file = instance.profile_picture
    if old_file and old_file != new_file:
        old_file.delete(save=False)
