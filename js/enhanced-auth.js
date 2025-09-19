// Enhanced Authentication UI
document.addEventListener('DOMContentLoaded', () => {
    // Initialize form enhancements
    initFormEnhancements();
    initPasswordStrength();
    initValidation();
    initLoadingStates();
});

function initFormEnhancements() {
    // Float labels on input focus/content
    document.querySelectorAll('.form-group input').forEach(input => {
        const label = input.nextElementSibling;
        if (!label) return;

        // Initial state check
        if (input.value) {
            label.classList.add('float');
        }

        // Input event handlers
        input.addEventListener('focus', () => label.classList.add('float'));
        input.addEventListener('blur', () => {
            if (!input.value) {
                label.classList.remove('float');
            }
        });
    });
}

function initPasswordStrength() {
    const passwordInput = document.querySelector('input[type="password"]');
    if (!passwordInput) return;

    // Create strength indicator
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength';
    passwordInput.parentNode.appendChild(strengthIndicator);

    passwordInput.addEventListener('input', () => {
        const strength = checkPasswordStrength(passwordInput.value);
        updateStrengthIndicator(strengthIndicator, strength);
    });
}

function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
}

function updateStrengthIndicator(indicator, strength) {
    indicator.className = 'password-strength';
    if (strength >= 4) {
        indicator.classList.add('strength-strong');
    } else if (strength >= 2) {
        indicator.classList.add('strength-medium');
    } else {
        indicator.classList.add('strength-weak');
    }
}

function initValidation() {
    // Email validation
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.addEventListener('input', debounce(() => {
            validateEmail(emailInput);
        }, 500));
    }

    // Password validation
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', debounce(() => {
            validatePassword(passwordInput);
        }, 500));
    }
}

function validateEmail(input) {
    const email = input.value;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    showValidationMessage(input, isValid, 
        isValid ? 'Valid email address' : 'Please enter a valid email address');
}

function validatePassword(input) {
    const password = input.value;
    const isValid = password.length >= 8;
    showValidationMessage(input, isValid,
        isValid ? 'Password meets requirements' : 'Password must be at least 8 characters');
}

function showValidationMessage(input, isValid, message) {
    // Remove existing message
    const existingMessage = input.parentNode.querySelector('.validation-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `validation-message ${isValid ? 'success' : 'error'}`;
    messageElement.innerHTML = `
        <i class="fas fa-${isValid ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    input.parentNode.appendChild(messageElement);
}

function initLoadingStates() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            const submitButton = form.querySelector('button[type="submit"]');
            if (!submitButton) return;

            // Add loading state
            const spinner = document.createElement('span');
            spinner.className = 'spinner';
            submitButton.prepend(spinner);
            submitButton.disabled = true;
        });
    });
}

// Toast notification system
class Toast {
    static show(message, type = 'success', duration = 3000) {
        const container = document.querySelector('.toast-container') || 
            Toast.createContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static createContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export utilities
window.Toast = Toast;