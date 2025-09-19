/**
 * Authentication System Fix
 * 
 * This script ensures the authentication system works properly by fixing the integration between
 * the API client and API integration layers.
 */

(function () {
    console.log('🔧 Initializing Authentication System Fix...');

    // Wait for both API client and API integration to be available
    function initAuthFix() {
        if (!window.apiClient || !window.apiIntegration) {
            console.log('⏳ Waiting for API dependencies...');
            setTimeout(initAuthFix, 100);
            return;
        }

        console.log('✅ API dependencies detected, applying fixes...');
        applyAuthFixes();
    }

    function applyAuthFixes() {
        // Fix API client initialization to use offline mode when needed
        const originalApiClientInit = window.apiClient.constructor;

        // Create proxy for login method to handle offline authentication properly
        const originalLogin = window.apiClient.login;
        window.apiClient.login = async function (email, password) {
            console.log('🔐 Enhanced login process started');

            try {
                // If offline mode is active, use the offline login function directly
                if (window.apiIntegration && !window.apiIntegration.isServerAvailable) {
                    console.log('📡 Using offline login mode');
                    return await window.apiIntegration.offlineLogin(email, password);
                }

                // Otherwise try regular login
                return await originalLogin.call(this, email, password);
            } catch (error) {
                console.error('❌ Login error:', error);

                // If server error occurs during login, try offline login
                if (window.apiIntegration) {
                    console.log('🔄 Falling back to offline login');
                    try {
                        return await window.apiIntegration.offlineLogin(email, password);
                    } catch (offlineError) {
                        console.error('❌ Offline login failed:', offlineError);
                        throw offlineError;
                    }
                } else {
                    throw error;
                }
            }
        };

        // Create proxy for registration method
        const originalRegister = window.apiClient.register;
        window.apiClient.register = async function (userData) {
            console.log('📝 Enhanced registration process started');

            try {
                // If offline mode is active, use the offline register function directly
                if (window.apiIntegration && !window.apiIntegration.isServerAvailable) {
                    console.log('📡 Using offline registration mode');

                    // Format userData to match expected structure
                    const formattedUserData = {
                        name: userData.name || userData.username || 'User',
                        email: userData.email,
                        password: userData.password
                    };

                    return await window.apiIntegration.offlineRegister(formattedUserData);
                }

                // Otherwise try regular registration
                return await originalRegister.call(this, userData);
            } catch (error) {
                console.error('❌ Registration error:', error);

                // If server error occurs during registration, try offline registration
                if (window.apiIntegration) {
                    console.log('🔄 Falling back to offline registration');
                    try {
                        // Format userData to match expected structure
                        const formattedUserData = {
                            name: userData.name || userData.username || 'User',
                            email: userData.email,
                            password: userData.password
                        };

                        return await window.apiIntegration.offlineRegister(formattedUserData);
                    } catch (offlineError) {
                        console.error('❌ Offline registration failed:', offlineError);
                        throw offlineError;
                    }
                } else {
                    throw error;
                }
            }
        };

        // Fix the window.AuthManager class for handling registration
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (window.authManager) {
                    const originalHandleRegistration = window.authManager.handleRegistration;

                    // Override the registration handler to correctly format user data
                    window.authManager.handleRegistration = async function (e) {
                        e.preventDefault();

                        const username = document.getElementById('register-username').value;
                        const email = document.getElementById('register-email').value;
                        const password = document.getElementById('register-password').value;
                        const confirm = document.getElementById('register-confirm').value;
                        const terms = document.getElementById('register-terms').checked;
                        const errorDisplay = document.getElementById('register-error');

                        // Validate form
                        if (password !== confirm) {
                            if (errorDisplay) {
                                errorDisplay.textContent = 'Passwords do not match.';
                                errorDisplay.style.display = 'block';
                            }
                            return;
                        }

                        if (!terms) {
                            if (errorDisplay) {
                                errorDisplay.textContent = 'You must agree to the Terms of Service and Privacy Policy.';
                                errorDisplay.style.display = 'block';
                            }
                            return;
                        }

                        try {
                            // Show loading state
                            const submitBtn = e.target.querySelector('button[type="submit"]');
                            if (submitBtn) {
                                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
                                submitBtn.disabled = true;
                            }

                            // Format user data correctly for registration
                            const userData = {
                                name: username,
                                username: username,
                                email: email,
                                password: password
                            };

                            // Attempt registration with properly formatted data
                            if (window.apiClient) {
                                await window.apiClient.register(userData);

                                // Auto-login after successful registration
                                try {
                                    await window.apiClient.login(email, password);
                                } catch (loginError) {
                                    console.warn('Post-registration login failed:', loginError);
                                }
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

                            // Update current user
                            this.initializeAuthState();

                        } catch (error) {
                            // Display error
                            if (errorDisplay) {
                                errorDisplay.textContent = error.message || 'Registration failed. Please try again.';
                                errorDisplay.style.display = 'block';
                            }

                        } finally {
                            // Reset button state
                            if (submitBtn) {
                                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                                submitBtn.disabled = false;
                            }
                        }
                    };

                    console.log('✅ Auth manager registration handler fixed');
                }
            }, 1000);
        });

        console.log('✅ Authentication system fix applied');
    }

    // Start the fix process
    initAuthFix();
})();