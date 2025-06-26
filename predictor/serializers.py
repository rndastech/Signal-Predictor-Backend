from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SignalAnalysis, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'profile_picture', 'bio', 'location', 'birth_date', 'website']


class SignalAnalysisSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    display_name = serializers.ReadOnlyField()
    user_analysis_count = serializers.ReadOnlyField()
    visualization_urls = serializers.ReadOnlyField(source='get_visualization_urls')
    has_visualizations = serializers.ReadOnlyField()
    uploaded_file = serializers.FileField(read_only=True)
    
    class Meta:
        model = SignalAnalysis
        fields = [
            'id', 'user', 'name', 'display_name', 'created_at',
            'uploaded_file', 'fitted_function', 'parameters', 'mse', 'dominant_frequencies',
            'is_public', 'user_analysis_count', 'data_preview',
            'original_signal_plot', 'fitted_signal_plot', 'frequency_analysis_plot',
            'visualization_urls', 'has_visualizations'
        ]
        read_only_fields = [
            'id', 'created_at', 'user', 'display_name', 'user_analysis_count',
            'uploaded_file', 'visualization_urls', 'has_visualizations'
        ]


class SignalAnalysisCreateSerializer(serializers.Serializer):
    """Serializer for creating signal analysis from CSV upload"""
    csv_file = serializers.FileField()
    advanced_mode = serializers.BooleanField(default=False)
    split_point = serializers.FloatField(required=False, allow_null=True)
    noise_filter = serializers.FloatField(default=0, min_value=0)


class FunctionEvaluationSerializer(serializers.Serializer):
    """Serializer for evaluating function at specific points"""
    x_values = serializers.ListField(
        child=serializers.FloatField(),
        help_text="List of x values to evaluate the function at"
    )


class SignalGeneratorSerializer(serializers.Serializer):
    """Serializer for signal generation"""
    function_type = serializers.ChoiceField(
        choices=[
            ('sine', 'Sine Wave'),
            ('cosine', 'Cosine Wave'),
            ('sawtooth', 'Sawtooth Wave'),
            ('square', 'Square Wave'),
            ('triangle', 'Triangle Wave'),
            ('noise', 'Random Noise'),
            ('chirp', 'Chirp Signal'),
            ('exponential', 'Exponential Decay'),
            ('gaussian_pulse', 'Gaussian Pulse'),
            ('damped_sine', 'Damped Sine Wave')
        ]
    )
    frequency = serializers.FloatField(default=1.0, min_value=0.1, max_value=100.0)
    amplitude = serializers.FloatField(default=1.0, min_value=0.1, max_value=10.0)
    phase = serializers.FloatField(default=0.0)
    duration = serializers.FloatField(default=2.0, min_value=0.1, max_value=10.0)
    sample_rate = serializers.IntegerField(default=1000, min_value=100, max_value=10000)
    noise_level = serializers.FloatField(default=0.0, min_value=0.0, max_value=1.0)


class AnalysisShareSerializer(serializers.Serializer):
    """Serializer for sharing analysis"""
    is_public = serializers.BooleanField(default=False)
    password = serializers.CharField(required=False, allow_blank=True, max_length=128)


class SharePasswordSerializer(serializers.Serializer):
    """Serializer for validating share password"""
    password = serializers.CharField(max_length=128)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return data
