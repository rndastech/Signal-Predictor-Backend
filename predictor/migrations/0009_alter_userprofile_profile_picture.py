# Generated by Django 4.2.7 on 2025-06-24 12:20

import django.core.validators
from django.db import migrations, models
import predictor.models


class Migration(migrations.Migration):

    dependencies = [
        ('predictor', '0008_remove_userprofile_email_verification_sent_at_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='profile_picture',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pics/', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif']), predictor.models.validate_image_size]),
        ),
    ]
