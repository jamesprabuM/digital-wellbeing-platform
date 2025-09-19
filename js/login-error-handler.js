/**
 * Login Error Handler for Digital Wellbeing Platform
 * 
 * This script provides enhanced error handling for authentication operations
 * including login, registration, and general API calls.
 */

(function () {
    console.log('🛠️ Initializing Login Error Handler...');

    // Error message templates for common authentication errors
    const errorMessages = {
        // Firebase auth errors
        'auth/user-not-found': 'No account found with this email address. Please check your email or register.',
        'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
        'auth/email-already-in-use': 'An account with this email already exists. Please log in or reset your password.',
        'auth/weak-password': 'Password is too weak. Please use at least 6 characters with a mix of letters, numbers and symbols.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later or reset your password.',
        'auth/network-request-failed': 'Network connection issue. Please check your internet connection and try again.',
        'auth/requires-recent-login': 'For security reasons, please log in again before making this change.',
        'auth/account-exists-with-different-credential': 'An account already exists with this email but with a different sign-in method.',
        'auth/popup-closed-by-user': 'Sign in was cancelled. Please try again.',

        // API error responses
        'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
        'user_not_found': 'No account found with this email address.',
        'email_already_exists': 'This email address is already in use.',
        'server_error': 'Server error. Please try again later.',
        'network_error': 'Network connection issue. Please check your internet connection and try again.',
        'validation_error': 'Please check the form fields and try again.',
        'unauthorized': 'You need to log in to access this feature.',
        'not_found': 'The requested resource was not found.',

        // Default error
        'default': 'An unexpected error occurred. Please try again.'
    };

    // Enhanced error handler function
    function handleAuthError(error, errorDisplay, type = 'login') {
        console.error(`❌ Authentication error (${type}):`, error);

        // Default error message based on type
        let defaultMessage = 'Login failed. Please check your credentials and try again.';
        if (type === 'register') {
            defaultMessage = 'Registration failed. Please check the form and try again.';
        } else if (type === 'profile') {
            defaultMessage = 'Profile update failed. Please try again.';
        } else if (type === 'password') {
            defaultMessage = 'Password reset failed. Please try again.';
        }

        // Extract error code
        let errorCode = 'default';
        if (error.code) {
            errorCode = error.code;
        } else if (error.message && error.message.includes(':')) {
            // Try to extract error code from message
            const parts = error.message.split(':');
            const possibleCode = parts[0].trim().toLowerCase().replace(/\s+/g, '_');
            if (errorMessages[possibleCode]) {
                errorCode = possibleCode;
            }
        }

        // Get appropriate error message
        const message = errorMessages[errorCode] || error.message || defaultMessage;

        // Display error in UI if element exists
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';

            // Add error highlight animation
            errorDisplay.classList.add('error-animation');
            setTimeout(() => {
                errorDisplay.classList.remove('error-animation');
            }, 1000);
        }

        // Also show notification if available
        if (window.showNotification) {
            window.showNotification(message, 'error', 5000); // Display for 5 seconds
        }

        return message;
    }

    // Wait for API client to be available and enhance with better error handling
    function enhanceApiClientErrorHandling() {
        if (!window.apiClient) {
            console.log('⏳ Waiting for API client...');
            setTimeout(enhanceApiClientErrorHandling, 500);
            return;
        }

        console.log('🔄 Enhancing API client with better error handling...');

        // Enhance the request method
        const originalRequest = window.apiClient.request;
        window.apiClient.request = async function (endpoint, options = {}) {
            try {
                const result = await originalRequest.call(this, endpoint, options);
                return result;
            } catch (error) {
                // Format error for better debugging
                console.error(`❌ API request error (${endpoint}):`, error);

                // Create a more descriptive error
                const enhancedError = new Error(error.message || 'API request failed');
                enhancedError.originalError = error;
                enhancedError.endpoint = endpoint;
                enhancedError.status = error.status;

                // Add error code if possible
                if (error.message) {
                    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
                        enhancedError.code = 'network_error';
                    } else if (error.status === 401) {
                        enhancedError.code = 'unauthorized';
                    } else if (error.status === 404) {
                        enhancedError.code = 'not_found';
                    } else if (error.status === 500) {
                        enhancedError.code = 'server_error';
                    }
                }

                throw enhancedError;
            }
        };

        // Enhance the login method
        const originalLogin = window.apiClient.login;
        window.apiClient.login = async function (email, password) {
            try {
                // Hide previous errors if any
                const errorDisplay = document.getElementById('login-error');
                if (errorDisplay) {
                    errorDisplay.style.display = 'none';
                }

                const result = await originalLogin.call(this, email, password);
                return result;
            } catch (error) {
                // Use enhanced error handler
                handleAuthError(error, document.getElementById('login-error'), 'login');
                throw error;
            }
        };

        // Enhance the register method
        const originalRegister = window.apiClient.register;
        window.apiClient.register = async function (userData) {
            try {
                // Hide previous errors if any
                const errorDisplay = document.getElementById('register-error');
                if (errorDisplay) {
                    errorDisplay.style.display = 'none';
                }

                const result = await originalRegister.call(this, userData);
                return result;
            } catch (error) {
                // Use enhanced error handler
                handleAuthError(error, document.getElementById('register-error'), 'register');
                throw error;
            }
        };

        console.log('✅ API client enhanced with better error handling');
    }

    // Wait for Auth Manager to be available and enhance error handling
    function enhanceAuthManagerErrorHandling() {
        if (!window.authManager) {
            console.log('⏳ Waiting for Auth Manager...');
            setTimeout(enhanceAuthManagerErrorHandling, 500);
            return;
        }

        console.log('🔄 Enhancing Auth Manager with better error handling...');

        // Enhance handleLogin method
        const originalHandleLogin = window.authManager.handleLogin;
        window.authManager.handleLogin = async function (e) {
            e.preventDefault();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDisplay = document.getElementById('login-error');

            // Clear previous errors
            if (errorDisplay) {
                errorDisplay.style.display = 'none';
            }

            try {
                // Show loading state
                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                    submitBtn.disabled = true;
                }

                // Validate email format
                if (!validateEmail(email)) {
                    throw { code: 'auth/invalid-email' };
                }

                // Attempt login via API client if available, else fallback
                if (window.apiClient) {
                    await window.apiClient.login(email, password);
                } else if (window.db) {
                    await window.db.login(email, password);
                } else {
                    throw new Error('No authentication backend available');
                }

                // If successful, hide modal
                this.hideLoginModal();

                // Show welcome notification
                if (window.showNotification) {
                    window.showNotification('Welcome back! Your wellness journey continues.', 'success');
                }
            } catch (error) {
                // Use enhanced error handler
                handleAuthError(error, errorDisplay, 'login');
            } finally {
                // Reset button state
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Log In';
                    submitBtn.disabled = false;
                }
            }
        };

        // Enhance handleRegistration method
        const originalHandleRegistration = window.authManager.handleRegistration;
        window.authManager.handleRegistration = async function (e) {
            e.preventDefault();

            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            const terms = document.getElementById('register-terms').checked;
            const errorDisplay = document.getElementById('register-error');

            // Clear previous errors
            if (errorDisplay) {
                errorDisplay.style.display = 'none';
            }

            // Validate form
            if (password !== confirm) {
                handleAuthError({ code: 'validation_error', message: 'Passwords do not match.' }, errorDisplay, 'register');
                return;
            }

            if (!validateEmail(email)) {
                handleAuthError({ code: 'auth/invalid-email' }, errorDisplay, 'register');
                return;
            }

            if (!terms) {
                handleAuthError({ code: 'validation_error', message: 'You must agree to the Terms of Service and Privacy Policy.' }, errorDisplay, 'register');
                return;
            }

            try {
                // Show loading state
                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
                    submitBtn.disabled = true;
                }

                // Attempt registration
                if (window.apiClient) {
                    await window.apiClient.register({
                        name: username,
                        username: username,
                        email,
                        password
                    });
                } else if (window.db) {
                    await window.db.register(username, email, password);
                } else {
                    throw new Error('No authentication backend available');
                }

                // If successful, hide modal
                this.hideRegistrationModal();

                // Show welcome notification
                if (window.showNotification) {
                    window.showNotification('Welcome to MindfulPath! Your wellness journey begins now.', 'success');
                }
            } catch (error) {
                // Use enhanced error handler
                handleAuthError(error, errorDisplay, 'register');
            } finally {
                // Reset button state
                if (submitBtn) {
                    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                    submitBtn.disabled = false;
                }
            }
        };

        console.log('✅ Auth Manager enhanced with better error handling');
    }

    // Helper function to validate email format
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Add CSS for error animation
    function addErrorAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .error-animation {
                animation: errorPulse 0.5s ease;
            }
            
            @keyframes errorPulse {
                0% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                50% { transform: translateX(5px); }
                75% { transform: translateX(-5px); }
                100% { transform: translateX(0); }
            }
            
            .auth-error {
                background-color: rgba(255, 0, 0, 0.1);
                border-left: 3px solid #f44336;
                color: #d32f2f;
                padding: 10px;
                margin-bottom: 15px;
                border-radius: 4px;
                font-size: 14px;
                display: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize error handler
    function init() {
        // Add error animation styles
        addErrorAnimationStyles();

        // Make the error handler function globally available
        window.handleAuthError = handleAuthError;

        // Enhance API client and Auth Manager
        enhanceApiClientErrorHandling();
        enhanceAuthManagerErrorHandling();

        console.log('✅ Login Error Handler initialized');
    }

    // Start initialization
    init();
})();