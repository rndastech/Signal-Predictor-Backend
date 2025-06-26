from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.views import LoginView, LogoutView
from django.urls import reverse_lazy
from django.views.generic import CreateView


class CustomLoginView(LoginView):
    template_name = 'registration/login.html'
    redirect_authenticated_user = True
    
    def get_success_url(self):
        # If there's temporary analysis data in session, show a save prompt
        temp_analysis = self.request.session.get('temp_analysis')
        if temp_analysis:
            messages.success(self.request, 'You can now save your previous analysis!')
        return self.get_redirect_url() or reverse_lazy('home')
    
    def form_invalid(self, form):
        messages.error(self.request, 'Invalid username or password.')
        return super().form_invalid(form)


class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('home')


class SignUpView(CreateView):
    form_class = UserCreationForm
    template_name = 'registration/signup.html'
    success_url = reverse_lazy('home')
    
    def form_valid(self, form):
        response = super().form_valid(form)
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password1')
        user = authenticate(username=username, password=password)
        login(self.request, user)
        
        # Check if there's temporary analysis data to save
        temp_analysis = self.request.session.get('temp_analysis')
        if temp_analysis:
            messages.success(self.request, f'Welcome {username}! You can now save your previous analysis.')
        else:
            messages.success(self.request, f'Welcome {username}! Your account has been created.')
        
        return response
