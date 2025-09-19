/**
 * Authentication Form Integration 
 * 
 * Connects the authentication forms directly to Firebase
 * to fix the "Unexpected token '<'" error and ensure proper functionality
 */

(function () {
    console.log('🔐 Setting up auth form integration...');

    // Wait for DOM to load before attaching event handlers
    document.addEventListener('DOMContentLoaded', function () {
        setupLoginForm();
        setupRegistrationForm();
        setupAuthErrorHandling();
        setupAuthUIEnhancements();

        console.log('✅ Auth form integration completed');
    });

    // Setup login form with Firebase integration
    function setupLoginForm() {
        const loginForm = document.getElementById('inline-login-form');
        if (!loginForm) {
            console.warn('⚠️ Login form not found');
            return;
        }

        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailInput = document.getElementById('inline-login-email');
            const passwordInput = document.getElementById('inline-login-password');
            const errorDisplay = document.getElementById('login-error');

            if (!emailInput || !passwordInput) {
                console.error('❌ Login form inputs not found');
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Clear previous errors
            if (errorDisplay) {
                errorDisplay.style.display = 'none';
                errorDisplay.textContent = '';
            }

            // Validate inputs
            if (!email) {
                showLoginError('Please enter your email address');
                return;
            }

            if (!password) {
                showLoginError('Please enter your password');
                return;
            }

            // Show loading state
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

            try {
                // Check if Firebase is available and initialized
                if (!window.firebaseServices || !window.firebaseServices.isInitialized()) {
                    await initializeFirebase();
                }

                // Get Firebase auth
                const auth = window.firebaseServices.auth();

                // Sign in with Firebase
                await auth.signInWithEmailAndPassword(email, password);

                // Login successful
                console.log('✅ Login successful');

                // Show success message
                showSuccessNotification('Login successful', 'Welcome back!');

                // Redirect to dashboard or refresh page
                setTimeout(() => {
                    window.location.href = '#dashboard';
                    // Refresh the page to ensure all auth state is properly updated
                    window.location.reload();
                }, 1000);

            } catch (error) {
                console.error('❌ Login error:', error);

                // Get user-friendly error message
                let errorMessage = 'Login failed. Please check your credentials and try again.';

                if (window.authErrorHandler && window.authErrorHandler.getErrorMessage) {
                    errorMessage = window.authErrorHandler.getErrorMessage(error);
                } else if (error.message) {
                    errorMessage = error.message;
                }

                // Show error in form
                showLoginError(errorMessage);

            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });

        console.log('✓ Login form handler attached');
    }

    // Setup registration form with Firebase integration
    function setupRegistrationForm() {
        const registerForm = document.getElementById('inline-register-form');
        if (!registerForm) {
            console.warn('⚠️ Registration form not found');
            return;
        }

        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const nameInput = document.getElementById('inline-register-name');
            const emailInput = document.getElementById('inline-register-email');
            const passwordInput = document.getElementById('inline-register-password');
            const confirmInput = document.getElementById('inline-register-confirm');
            const termsCheckbox = document.getElementById('inline-terms');
            const errorDisplay = document.getElementById('register-error');

            if (!nameInput || !emailInput || !passwordInput || !confirmInput || !termsCheckbox) {
                console.error('❌ Registration form inputs not found');
                return;
            }

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmInput.value;
            const termsAccepted = termsCheckbox.checked;

            // Clear previous errors
            if (errorDisplay) {
                errorDisplay.style.display = 'none';
                errorDisplay.textContent = '';
            }

            // Validate inputs
            if (!name) {
                showRegistrationError('Please enter your name');
                return;
            }

            if (!email) {
                showRegistrationError('Please enter your email address');
                return;
            }

            if (!password) {
                showRegistrationError('Please enter a password');
                return;
            }

            if (password !== confirmPassword) {
                showRegistrationError('Passwords do not match');
                return;
            }

            if (!termsAccepted) {
                showRegistrationError('Please accept the Terms of Service');
                return;
            }

            // Show loading state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

            try {
                // Check if Firebase is available and initialized
                if (!window.firebaseServices || !window.firebaseServices.isInitialized()) {
                    await initializeFirebase();
                }

                // Get Firebase services
                const auth = window.firebaseServices.auth();
                const db = window.firebaseServices.db();

                // Create user in Firebase Auth
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Update display name
                await user.updateProfile({
                    displayName: name
                });

                // Create user document in Firestore
                await db.collection('users').doc(user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Initialize wellness data document
                await db.collection('wellnessData').doc(user.uid).set({
                    userId: user.uid,
                    wellnessScore: 70,
                    wellnessData: {
                        sleep: 70,
                        exercise: 65,
                        mindfulness: 75
                    },
                    moodData: [],
                    sleepData: [],
                    activities: [],
                    journalEntries: [],
                    gratitudeEntries: [],
                    cbtThoughts: [],
                    goals: [],
                    streaks: {
                        meditation: 0,
                        exercise: 0,
                        journaling: 0,
                        mood_tracking: 0
                    },
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Registration successful
                console.log('✅ Registration successful');

                // Show success message
                showSuccessNotification('Account created!', 'Welcome to MindfulPath!');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '#dashboard';
                    // Refresh the page to ensure all auth state is properly updated
                    window.location.reload();
                }, 1000);

            } catch (error) {
                console.error('❌ Registration error:', error);

                // Get user-friendly error message
                let errorMessage = 'Registration failed. Please try again.';

                if (window.authErrorHandler && window.authErrorHandler.getErrorMessage) {
                    errorMessage = window.authErrorHandler.getErrorMessage(error);
                } else if (error.message) {
                    errorMessage = error.message;
                }

                // Show error in form
                showRegistrationError(errorMessage);

            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });

        console.log('✓ Registration form handler attached');
    }

    // Setup improved error handling for auth forms
    function setupAuthErrorHandling() {
        // Add input validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', function () {
                validateEmail(this);
            });
        });

        // Password validation
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            if (input.id.includes('register')) {
                input.addEventListener('input', function () {
                    validatePassword(this);
                });
            }
        });

        console.log('✓ Auth form validation attached');
    }

    // Set up UI enhancements for auth forms
    function setupAuthUIEnhancements() {
        // Add tab switching functionality
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const tabName = this.getAttribute('data-tab');
                switchTab(tabName);
            });
        });

        // Ensure "forgot password" link works
        const forgotLink = document.querySelector('.forgot-password');
        if (forgotLink) {
            forgotLink.addEventListener('click', function (e) {
                e.preventDefault();
                showForgotPasswordModal();
            });
        }

        console.log('✓ Auth UI enhancements attached');
    }

    // Helper functions

    // Initialize Firebase if not already initialized
    async function initializeFirebase() {
        if (window.firebaseServices) {
            try {
                await window.firebaseServices.initialize();
                return true;
            } catch (error) {
                console.error('❌ Firebase initialization error:', error);
                throw new Error('Unable to initialize Firebase. Please try again later.');
            }
        } else {
            throw new Error('Firebase services not available');
        }
    }

    // Show login error
    function showLoginError(message) {
        const errorDisplay = document.getElementById('login-error');
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
        }
    }

    // Show registration error
    function showRegistrationError(message) {
        const errorDisplay = document.getElementById('register-error');
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
        }
    }

    // Switch between login and registration tabs
    function switchTab(tabName) {
        // Update tab buttons
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update form containers
        const containers = document.querySelectorAll('.auth-form-container');
        containers.forEach(container => {
            if (container.id === tabName + '-form-container') {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        });
    }

    // Show success notification
    function showSuccessNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 320px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Show forgot password modal
    function showForgotPasswordModal() {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'forgot-password-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Reset Password</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Enter your email address below, and we'll send you a link to reset your password.</p>
                    <div class="forgot-error" style="display: none; color: #f44336; margin-bottom: 10px;"></div>
                    <div class="form-group">
                        <label for="forgot-email">Email Address</label>
                        <input type="email" id="forgot-email" name="email" required placeholder="Enter your email address">
                    </div>
                    <button class="btn btn-primary btn-block" id="forgot-submit">
                        <i class="fas fa-paper-plane"></i>
                        Send Reset Link
                    </button>
                </div>
            </div>
        `;

        // Style the modal
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        // Add to page
        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Handle form submission
        const submitBtn = modal.querySelector('#forgot-submit');
        const emailInput = modal.querySelector('#forgot-email');
        const errorDisplay = modal.querySelector('.forgot-error');

        submitBtn.addEventListener('click', async () => {
            const email = emailInput.value.trim();

            // Clear previous errors
            errorDisplay.style.display = 'none';
            errorDisplay.textContent = '';

            // Validate email
            if (!email) {
                errorDisplay.textContent = 'Please enter your email address';
                errorDisplay.style.display = 'block';
                return;
            }

            // Show loading state
            const originalButtonText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            try {
                // Check if Firebase is available and initialized
                if (!window.firebaseServices || !window.firebaseServices.isInitialized()) {
                    await initializeFirebase();
                }

                // Get Firebase auth
                const auth = window.firebaseServices.auth();

                // Send password reset email
                await auth.sendPasswordResetEmail(email);

                // Show success message
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Email Sent</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div style="text-align: center; padding: 20px;">
                                <i class="fas fa-check-circle" style="font-size: 48px; color: #28a745; margin-bottom: 20px;"></i>
                                <p>We've sent a password reset link to <strong>${email}</strong>.</p>
                                <p>Please check your inbox and follow the instructions to reset your password.</p>
                                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                                    If you don't see the email, check your spam folder or try again.
                                </p>
                            </div>
                            <button class="btn btn-primary btn-block close-modal-btn">
                                <i class="fas fa-check"></i>
                                Got it
                            </button>
                        </div>
                    </div>
                `;

                // Add close event listener to the new button
                const closeModalBtn = modal.querySelector('.close-modal-btn');
                closeModalBtn.addEventListener('click', () => {
                    modal.remove();
                });

                // Add close event listener to the new X button
                const newCloseBtn = modal.querySelector('.modal-close');
                newCloseBtn.addEventListener('click', () => {
                    modal.remove();
                });

            } catch (error) {
                console.error('❌ Password reset error:', error);

                // Get user-friendly error message
                let errorMessage = 'Failed to send password reset email. Please try again.';

                if (window.authErrorHandler && window.authErrorHandler.getErrorMessage) {
                    errorMessage = window.authErrorHandler.getErrorMessage(error);
                } else if (error.message) {
                    errorMessage = error.message;
                }

                // Show error
                errorDisplay.textContent = errorMessage;
                errorDisplay.style.display = 'block';

                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalButtonText;
            }
        });
    }

    // Email validation
    function validateEmail(input) {
        const email = input.value.trim();
        if (!email) return;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            input.classList.add('input-error');

            // Show validation message
            let errorSpan = input.parentNode.querySelector('.validation-error');

            if (!errorSpan) {
                errorSpan = document.createElement('span');
                errorSpan.className = 'validation-error';
                input.parentNode.appendChild(errorSpan);
            }

            errorSpan.textContent = 'Please enter a valid email address';
        } else {
            input.classList.remove('input-error');

            // Remove validation message
            const errorSpan = input.parentNode.querySelector('.validation-error');
            if (errorSpan) errorSpan.remove();
        }
    }

    // Password validation
    function validatePassword(input) {
        const password = input.value;
        if (!password) return;

        // Check if it's the confirmation field
        if (input.id === 'inline-register-confirm') {
            const mainPassword = document.getElementById('inline-register-password').value;

            if (password !== mainPassword) {
                input.classList.add('input-error');

                // Show validation message
                let errorSpan = input.parentNode.querySelector('.validation-error');

                if (!errorSpan) {
                    errorSpan = document.createElement('span');
                    errorSpan.className = 'validation-error';
                    input.parentNode.appendChild(errorSpan);
                }

                errorSpan.textContent = 'Passwords do not match';
            } else {
                input.classList.remove('input-error');

                // Remove validation message
                const errorSpan = input.parentNode.querySelector('.validation-error');
                if (errorSpan) errorSpan.remove();
            }

            return;
        }

        // Main password validation
        if (password.length < 6) {
            input.classList.add('input-error');

            // Show validation message
            let errorSpan = input.parentNode.querySelector('.validation-error');

            if (!errorSpan) {
                errorSpan = document.createElement('span');
                errorSpan.className = 'validation-error';
                input.parentNode.appendChild(errorSpan);
            }

            errorSpan.textContent = 'Password must be at least 6 characters';
        } else {
            input.classList.remove('input-error');

            // Remove validation message
            const errorSpan = input.parentNode.querySelector('.validation-error');
            if (errorSpan) errorSpan.remove();
        }
    }

    // Make these functions available globally
    window.authForms = {
        switchTab,
        showForgotPasswordModal,
        showLoginError,
        showRegistrationError,
        showSuccessNotification
    };
})();