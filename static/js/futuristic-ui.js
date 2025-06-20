// Enhanced UI Interactions and Effects

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all enhanced interactions
    // initParticleEffect(); // Disabled to prevent overlay issues
    initScrollAnimations();
    initLoadingStates();
    initHoverEffects();
    initFormEnhancements();
    initTooltips();
});

// Particle background effect - DISABLED
function initParticleEffect() {
    // Disabled to prevent overlay issues
    console.log('Particle effect disabled to prevent layout issues');
}

// Scroll-triggered animations
function initScrollAnimations() {
    // Simple fade-in without complex observers for now
    const elements = document.querySelectorAll('.card, .alert');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Enhanced loading states
function initLoadingStates() {
    // Form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');
                
                // Re-enable after 10 seconds as fallback
                setTimeout(() => {
                    if (submitBtn.disabled) {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('loading');
                    }
                }, 10000);
            }
        });
    });

    // File upload progress
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const fileName = e.target.files[0].name;
                const feedback = document.createElement('div');
                feedback.className = 'alert alert-info mt-2';
                feedback.innerHTML = `<i class="fas fa-file-upload"></i> Selected: <strong>${fileName}</strong>`;
                
                // Remove existing feedback
                const existingFeedback = input.parentNode.querySelector('.alert');
                if (existingFeedback) {
                    existingFeedback.remove();
                }
                
                input.parentNode.appendChild(feedback);
                feedback.classList.add('animate-slideInLeft');
            }
        });
    });
}

// Enhanced hover effects
function initHoverEffects() {
    // Card hover effects
    document.querySelectorAll('.floating-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.01)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.transition = 'all 0.3s ease';
        });
    });

    // Simple button hover effects
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'all 0.3s ease';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.transition = 'all 0.3s ease';
        });
    });
}

// Form enhancements
function initFormEnhancements() {
    // Password strength indicator
    document.querySelectorAll('input[type="password"]').forEach(input => {
        if (input.name === 'password1' || input.name === 'password') {
            input.addEventListener('input', function() {
                const strength = calculatePasswordStrength(this.value);
                updatePasswordStrengthIndicator(this, strength);
            });
        }
    });

    // Real-time validation feedback
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Clear error state on input
            this.classList.remove('state-error');
            const errorMsg = this.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    });
}

// Password strength calculation
function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
}

// Update password strength indicator
function updatePasswordStrengthIndicator(input, strength) {
    let existingIndicator = input.parentNode.querySelector('.password-strength');
    if (!existingIndicator) {
        existingIndicator = document.createElement('div');
        existingIndicator.className = 'password-strength mt-2';
        input.parentNode.appendChild(existingIndicator);
    }

    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#ff1493', '#ff6600', '#ffff00', '#39ff14', '#00ffff'];
    
    existingIndicator.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="flex-grow-1 me-2">
                <div class="progress" style="height: 4px;">
                    <div class="progress-bar" style="width: ${(strength / 5) * 100}%; background: ${strengthColors[strength - 1] || '#ff1493'}"></div>
                </div>
            </div>
            <small style="color: ${strengthColors[strength - 1] || '#ff1493'}">${strengthLevels[strength - 1] || 'Very Weak'}</small>
        </div>
    `;
}

// Field validation
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Basic validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address.';
    }

    // Update field appearance
    if (!isValid) {
        field.classList.add('state-error');
        showFieldError(field, errorMessage);
    } else {
        field.classList.remove('state-error');
        field.classList.add('state-success');
        removeFieldError(field);
    }

    return isValid;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show field error
function showFieldError(field, message) {
    removeFieldError(field);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message alert alert-danger mt-1 p-2';
    errorDiv.innerHTML = `<small><i class="fas fa-exclamation-triangle"></i> ${message}</small>`;
    field.parentNode.appendChild(errorDiv);
}

// Remove field error
function removeFieldError(field) {
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// Initialize tooltips
function initTooltips() {
    // Only initialize if bootstrap is available and has Tooltip
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(element => {
            new bootstrap.Tooltip(element);
        });
    }
}

// Smooth scroll to anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Theme switching (if needed in future)
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
}

// Keyboard navigation enhancements
document.addEventListener('keydown', function(e) {
    // Escape key to close modals/dropdowns
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        });
        
        document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
});

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Show performance indicator if load time is slow
        if (loadTime > 3000) {
            console.warn('Slow page load detected. Consider optimizing.');
        }
    });
}

// Initialize performance monitoring
initPerformanceMonitoring();

// Export functions for potential external use
window.SignalPredictorUI = {
    toggleTheme,
    validateField,
    calculatePasswordStrength
};
