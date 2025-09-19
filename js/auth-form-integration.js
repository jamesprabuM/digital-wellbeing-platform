/**
 * Authentication Form Integration
 * 
 * This script integrates all our error handling and token validation fixes
 * specifically with the authentication forms in the UI.
 * 
 * Enhanced version with better Firebase load sequence integration
 */

(function () {
    console.log('🔐 Auth Form Integration: Initializing');

    // Keep track of initialization state
    let formsInitialized = false;

    // Wait for both DOM content and Firebase to be loaded
    function startInit() {
        // Check if Firebase loader is available
        if (typeof window.waitForFirebase === 'function') {
            // Wait for Firebase to be ready before initializing
            window.waitForFirebase()
                .then(() => {
                    console.log('🔐 Auth Form Integration: Firebase is ready');
                    if (document.readyState !== 'loading') {
                        initAuthForms();
                    } else {
                        document.addEventListener('DOMContentLoaded', initAuthForms);
                    }
                })
                .catch(error => {
                    console.error('❌ Auth Form Integration: Firebase failed to load:', error);
                    // Still try to initialize forms, but mark Firebase as unavailable
                    if (document.readyState !== 'loading') {
                        initAuthForms(true);
                    } else {
                        document.addEventListener('DOMContentLoaded', () => initAuthForms(true));
                    }

                    // Add listener for when Firebase becomes available
                    if (window.firebaseLoader && typeof window.firebaseLoader.retry === 'function') {
                        document.addEventListener('firebase-load-failed', function retryHandler() {
                            // Only show retry UI if forms are initialized
                            if (formsInitialized) {
                                showFirebaseUnavailableMessage(true);
                            }
                        });
                    }
                });
        } else {
            // Firebase loader not available, initialize without Firebase integration
            console.warn('⚠️ Auth Form Integration: Firebase loader not available');
            document.addEventListener('DOMContentLoaded', () => initAuthForms(true));
        }
    }

    // Initialize auth forms
    function initAuthForms(firebaseUnavailable = false) {
        if (formsInitialized) return;
        formsInitialized = true;

        console.log('🔐 Auth Form Integration: Setting up auth forms');

        // Show warning if Firebase is unavailable
        if (firebaseUnavailable) {
            showFirebaseUnavailableMessage();
        }

        // Set up login form
        setupLoginForm();

        // Set up register form
        setupRegisterForm();

        // Add form validation
        addFormValidation();

        // Check auth state if Firebase is available
        if (!firebaseUnavailable && typeof firebase !== 'undefined' && firebase.auth) {
            checkAuthState();
        }

        console.log('✅ Auth Form Integration: Auth forms initialized');
    }

    // Show message when Firebase is unavailable with retry option
    function showFirebaseUnavailableMessage(addRetryOption = false) {
        const errorMessages = [
            'login-error',
            'register-error'
        ];

        errorMessages.forEach(id => {
            const errorEl = document.getElementById(id);
            if (errorEl) {
                if (addRetryOption) {
                    errorEl.innerHTML = 'Authentication service is currently unavailable. <button class="retry-firebase-btn">Retry</button>';

                    // Add retry button functionality
                    const retryBtn = errorEl.querySelector('.retry-firebase-btn');
                    if (retryBtn) {
                        retryBtn.addEventListener('click', function () {
                            errorEl.textContent = 'Reconnecting to authentication service...';

                            if (window.firebaseLoader && typeof window.firebaseLoader.retry === 'function') {
                                window.firebaseLoader.retry()
                                    .then(() => {
                                        errorEl.textContent = 'Connected! You can now log in.';
                                        errorEl.classList.add('success');
                                        setTimeout(() => {
                                            errorEl.textContent = '';
                                            errorEl.classList.remove('success');
                                        }, 3000);
                                    })
                                    .catch(() => {
                                        showFirebaseUnavailableMessage(true);
                                    });
                            }
                        });
                    }
                } else {
                    errorEl.textContent = 'Authentication service is currently unavailable. Please try again later.';
                }

                errorEl.style.display = 'block';
            }
        });

        // Disable submit buttons
        const submitButtons = document.querySelectorAll('form.auth-form button[type="submit"]');
        submitButtons.forEach(button => {
            if (addRetryOption) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Service Unavailable';
            }
        });
    }

    // Set up login form
    function setupLoginForm() {
        const loginForm = document.getElementById('inline-login-form');

        if (loginForm) {
            loginForm.addEventListener('submit', function (event) {
                event.preventDefault();

                console.log('🔐 Auth Form Integration: Login form submitted');

                // Get form data
                const email = document.getElementById('inline-login-email').value.trim();
                const password = document.getElementById('inline-login-password').value;

                // Validate form data
                if (!email || !password) {
                    showAuthError('login-error', 'Please enter your email and password.');
                    return;
                }

                // Disable form and show loading state
                setFormLoading(loginForm, true);

                // Clear previous errors
                showAuthError('login-error', '');

                // Try to sign in with Firebase
                loginWithFirebase(email, password);
            });
        }
    }

    // Set up register form
    function setupRegisterForm() {
        const registerForm = document.getElementById('inline-register-form');

        if (registerForm) {
            registerForm.addEventListener('submit', function (event) {
                event.preventDefault();

                console.log('🔐 Auth Form Integration: Register form submitted');

                // Get form data
                const name = document.getElementById('inline-register-name').value.trim();
                const email = document.getElementById('inline-register-email').value.trim();
                const password = document.getElementById('inline-register-password').value;
                const confirmPassword = document.getElementById('inline-register-confirm').value;
                const termsAccepted = document.getElementById('inline-terms').checked;

                // Validate form data
                if (!name || !email || !password) {
                    showAuthError('register-error', 'Please fill in all fields.');
                    return;
                }

                if (password !== confirmPassword) {
                    showAuthError('register-error', 'Passwords do not match.');
                    return;
                }

                if (password.length < 6) {
                    showAuthError('register-error', 'Password must be at least 6 characters.');
                    return;
                }

                if (!termsAccepted) {
                    showAuthError('register-error', 'You must accept the terms of service.');
                    return;
                }

                // Disable form and show loading state
                setFormLoading(registerForm, true);

                // Clear previous errors
                showAuthError('register-error', '');

                // Try to register with Firebase
                registerWithFirebase(name, email, password);
            });
        }
    }

    // Add form validation
    function addFormValidation() {
        // Add email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');

        emailInputs.forEach(input => {
            input.addEventListener('blur', function () {
                const email = input.value.trim();

                if (email && !isValidEmail(email)) {
                    input.classList.add('invalid');
                    const formGroup = input.closest('.form-group');

                    if (formGroup) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'form-error';
                        errorMsg.textContent = 'Please enter a valid email address';

                        // Remove existing error message
                        const existingError = formGroup.querySelector('.form-error');
                        if (existingError) {
                            existingError.remove();
                        }

                        formGroup.appendChild(errorMsg);
                    }
                } else {
                    input.classList.remove('invalid');
                    const formGroup = input.closest('.form-group');

                    if (formGroup) {
                        const existingError = formGroup.querySelector('.form-error');
                        if (existingError) {
                            existingError.remove();
                        }
                    }
                }
            });
        });

        // Add password validation
        const passwordInput = document.getElementById('inline-register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', function () {
                const password = passwordInput.value;

                if (password.length > 0 && password.length < 6) {
                    passwordInput.classList.add('weak');

                    const formGroup = passwordInput.closest('.form-group');
                    if (formGroup) {
                        const strengthIndicator = formGroup.querySelector('.password-strength');

                        if (!strengthIndicator) {
                            const indicator = document.createElement('div');
                            indicator.className = 'password-strength weak';
                            indicator.textContent = 'Weak password';
                            formGroup.appendChild(indicator);
                        } else {
                            strengthIndicator.className = 'password-strength weak';
                            strengthIndicator.textContent = 'Weak password';
                        }
                    }
                } else if (password.length >= 6) {
                    passwordInput.classList.remove('weak');
                    passwordInput.classList.add('strong');

                    const formGroup = passwordInput.closest('.form-group');
                    if (formGroup) {
                        const strengthIndicator = formGroup.querySelector('.password-strength');

                        if (!strengthIndicator) {
                            const indicator = document.createElement('div');
                            indicator.className = 'password-strength strong';
                            indicator.textContent = 'Strong password';
                            formGroup.appendChild(indicator);
                        } else {
                            strengthIndicator.className = 'password-strength strong';
                            strengthIndicator.textContent = 'Strong password';
                        }
                    }
                } else {
                    passwordInput.classList.remove('weak', 'strong');

                    const formGroup = passwordInput.closest('.form-group');
                    if (formGroup) {
                        const strengthIndicator = formGroup.querySelector('.password-strength');
                        if (strengthIndicator) {
                            strengthIndicator.remove();
                        }
                    }
                }
            });
        }

        // Add password confirmation validation
        const confirmInput = document.getElementById('inline-register-confirm');
        if (confirmInput && passwordInput) {
            confirmInput.addEventListener('input', function () {
                const password = passwordInput.value;
                const confirm = confirmInput.value;

                if (confirm && password !== confirm) {
                    confirmInput.classList.add('invalid');

                    const formGroup = confirmInput.closest('.form-group');
                    if (formGroup) {
                        const errorMsg = formGroup.querySelector('.form-error');

                        if (!errorMsg) {
                            const msg = document.createElement('div');
                            msg.className = 'form-error';
                            msg.textContent = 'Passwords do not match';
                            formGroup.appendChild(msg);
                        }
                    }
                } else {
                    confirmInput.classList.remove('invalid');

                    const formGroup = confirmInput.closest('.form-group');
                    if (formGroup) {
                        const errorMsg = formGroup.querySelector('.form-error');
                        if (errorMsg) {
                            errorMsg.remove();
                        }
                    }
                }
            });
        }
    }

    // Login with Firebase
    function loginWithFirebase(email, password) {
        console.log('🔐 Auth Form Integration: Attempting Firebase login');

        // Use our improved Firebase loader to ensure Firebase is ready
        if (typeof window.waitForFirebase === 'function') {
            window.waitForFirebase()
                .then(() => {
                    // Firebase is ready, proceed with login
                    proceedWithFirebaseLogin(email, password);
                })
                .catch(error => {
                    console.error('❌ Auth Form Integration: Firebase not available for login', error);
                    showAuthError('login-error', 'Authentication service is not available. Please try again later.');
                    setFormLoading(document.getElementById('inline-login-form'), false);

                    // Show retry option
                    if (window.firebaseLoader && typeof window.firebaseLoader.retry === 'function') {
                        showFirebaseUnavailableMessage(true);
                    }
                });
        } else {
            // No Firebase loader available, try direct login
            proceedWithFirebaseLogin(email, password);
        }
    }

    // Actually perform the Firebase login once Firebase is confirmed ready
    function proceedWithFirebaseLogin(email, password) {
        try {
            // Double check that Firebase is available
            if (typeof firebase === 'undefined' || !firebase.auth) {
                console.error('❌ Auth Form Integration: Firebase is not initialized');
                showAuthError('login-error', 'Authentication service is not available. Please try again later.');
                setFormLoading(document.getElementById('inline-login-form'), false);
                return;
            }

            // Use our enhanced Firebase auth with token validation
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function (userCredential) {
                    console.log('✅ Auth Form Integration: Login successful');

                    // Get ID token with Firebase
                    return userCredential.user.getIdToken()
                        .then(function (token) {
                            // Use our token validator to ensure the token is valid
                            if (window.apiTokenValidator && typeof window.apiTokenValidator.validateTokenResponse === 'function') {
                                const validatedToken = window.apiTokenValidator.validateTokenResponse({
                                    token: token,
                                    user: userCredential.user
                                });

                                if (validatedToken.success) {
                                    // Handle successful login
                                    handleSuccessfulLogin(userCredential.user);
                                } else {
                                    console.error('❌ Auth Form Integration: Token validation failed', validatedToken.error);
                                    showAuthError('login-error', 'Authentication failed. Please try again.');
                                    setFormLoading(document.getElementById('inline-login-form'), false);
                                }
                            } else {
                                // Token validator not available, proceed anyway
                                console.warn('⚠️ Auth Form Integration: Token validator not available, proceeding without validation');
                                handleSuccessfulLogin(userCredential.user);
                            }
                        });
                })
                .catch(function (error) {
                    console.error('❌ Auth Form Integration: Login error', error);

                    let errorMessage = 'Authentication failed. Please try again.';

                    // Handle specific error codes
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                        errorMessage = 'Invalid email or password.';
                    } else if (error.code === 'auth/too-many-requests') {
                        errorMessage = 'Too many failed login attempts. Please try again later.';
                    } else if (error.code === 'auth/user-disabled') {
                        errorMessage = 'This account has been disabled.';
                    } else if (error.message && error.message.includes('Unexpected token')) {
                        errorMessage = 'Authentication service error. Please try again later.';

                        // Try to recover Firebase using our new retry mechanism
                        if (window.firebaseLoader && typeof window.firebaseLoader.retry === 'function') {
                            window.firebaseLoader.retry()
                                .then(() => {
                                    showAuthError('login-error', 'Connection restored. Please try logging in again.');
                                })
                                .catch(() => {
                                    showFirebaseUnavailableMessage(true);
                                });
                        } else if (window.firebaseSafeInit && typeof window.firebaseSafeInit.reinitialize === 'function') {
                            // Fallback to old method
                            window.firebaseSafeInit.reinitialize();
                        }
                    }

                    showAuthError('login-error', errorMessage);
                    setFormLoading(document.getElementById('inline-login-form'), false);
                });
        } catch (error) {
            console.error('❌ Auth Form Integration: Unexpected error during login', error);
            showAuthError('login-error', 'An unexpected error occurred. Please try again later.');
            setFormLoading(document.getElementById('inline-login-form'), false);
        }
    }

    // Register with Firebase
    function registerWithFirebase(name, email, password) {
        console.log('🔐 Auth Form Integration: Attempting Firebase registration');

        // Use our improved Firebase loader to ensure Firebase is ready
        if (typeof window.waitForFirebase === 'function') {
            window.waitForFirebase()
                .then(() => {
                    // Firebase is ready, proceed with registration
                    proceedWithFirebaseRegistration(name, email, password);
                })
                .catch(error => {
                    console.error('❌ Auth Form Integration: Firebase not available for registration', error);
                    showAuthError('register-error', 'Registration service is not available. Please try again later.');
                    setFormLoading(document.getElementById('inline-register-form'), false);

                    // Show retry option
                    if (window.firebaseLoader && typeof window.firebaseLoader.retry === 'function') {
                        showFirebaseUnavailableMessage(true);
                    }
                });
        } else {
            // No Firebase loader available, try direct registration
            proceedWithFirebaseRegistration(name, email, password);
        }
    }

    // Actually perform the Firebase registration once Firebase is confirmed ready
    function proceedWithFirebaseRegistration(name, email, password) {
        try {
            // Double check that Firebase is available
            if (typeof firebase === 'undefined' || !firebase.auth) {
                console.error('❌ Auth Form Integration: Firebase is not initialized');
                showAuthError('register-error', 'Registration service is not available. Please try again later.');
                setFormLoading(document.getElementById('inline-register-form'), false);
                return;
            }

            // Create user with Firebase
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(function (userCredential) {
                    console.log('✅ Auth Form Integration: Registration successful');

                    // Update user profile with name
                    return userCredential.user.updateProfile({
                        displayName: name
                    }).then(function () {
                        // Try to save user data to Firestore if available
                        if (firebase.firestore) {
                            try {
                                firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                                    displayName: name,
                                    email: email,
                                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                                }).catch(firestoreError => {
                                    // Non-fatal error, just log it
                                    console.warn('⚠️ Failed to save user data to Firestore:', firestoreError);
                                });
                            } catch (firestoreError) {
                                // Non-fatal error, just log it
                                console.warn('⚠️ Error accessing Firestore:', firestoreError);
                            }
                        }

                        // Get ID token with Firebase
                        return userCredential.user.getIdToken()
                            .then(function (token) {
                                // Use our token validator to ensure the token is valid
                                if (window.apiTokenValidator && typeof window.apiTokenValidator.validateTokenResponse === 'function') {
                                    const validatedToken = window.apiTokenValidator.validateTokenResponse({
                                        token: token,
                                        user: userCredential.user
                                    });

                                    if (validatedToken.success) {
                                        // Handle successful registration
                                        handleSuccessfulRegistration(userCredential.user);
                                    } else {
                                        console.error('❌ Auth Form Integration: Token validation failed', validatedToken.error);
                                        showAuthError('register-error', 'Registration completed, but login failed. Please try logging in.');
                                        setFormLoading(document.getElementById('inline-register-form'), false);
                                    }
                                } else {
                                    // Token validator not available, proceed anyway
                                    console.warn('⚠️ Auth Form Integration: Token validator not available, proceeding without validation');
                                    handleSuccessfulRegistration(userCredential.user);
                                }
                            });
                    });
                })
                .catch(function (error) {
                    console.error('❌ Auth Form Integration: Registration error', error);

                    let errorMessage = 'Registration failed. Please try again.';

                    // Handle specific error codes
                    if (error.code === 'auth/email-already-in-use') {
                        errorMessage = 'This email is already registered. Try logging in instead.';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage = 'Please enter a valid email address.';
                    } else if (error.code === 'auth/weak-password') {
                        errorMessage = 'Password is too weak. Please use a stronger password.';
                    } else if (error.message && error.message.includes('Unexpected token')) {
                        errorMessage = 'Registration service error. Please try again later.';

                        // Try to recover Firebase using our new retry mechanism
                        if (window.firebaseLoader && typeof window.firebaseLoader.retry === 'function') {
                            window.firebaseLoader.retry()
                                .then(() => {
                                    showAuthError('register-error', 'Connection restored. Please try registering again.');
                                })
                                .catch(() => {
                                    showFirebaseUnavailableMessage(true);
                                });
                        } else if (window.firebaseSafeInit && typeof window.firebaseSafeInit.reinitialize === 'function') {
                            // Fallback to old method
                            window.firebaseSafeInit.reinitialize();
                        }
                    }

                    showAuthError('register-error', errorMessage);
                    setFormLoading(document.getElementById('inline-register-form'), false);
                });
        } catch (error) {
            console.error('❌ Auth Form Integration: Unexpected error during registration', error);
            showAuthError('register-error', 'An unexpected error occurred. Please try again later.');
            setFormLoading(document.getElementById('inline-register-form'), false);
        }
    }

    // Handle successful login
    function handleSuccessfulLogin(user) {
        console.log('✅ Auth Form Integration: Handling successful login', user.uid);

        // Show success message
        showLoginSuccess();

        // Reset form
        const loginForm = document.getElementById('inline-login-form');
        if (loginForm) {
            loginForm.reset();
            setFormLoading(loginForm, false);
        }

        // Update UI to show logged in state
        updateUIForLoggedInUser(user);

        // Store authentication state
        storeAuthState(user);

        // Redirect to dashboard or reload
        setTimeout(function () {
            window.location.href = '#dashboard';
        }, 1500);
    }

    // Handle successful registration
    function handleSuccessfulRegistration(user) {
        console.log('✅ Auth Form Integration: Handling successful registration', user.uid);

        // Show success message
        showRegistrationSuccess();

        // Reset form
        const registerForm = document.getElementById('inline-register-form');
        if (registerForm) {
            registerForm.reset();
            setFormLoading(registerForm, false);
        }

        // Update UI to show logged in state
        updateUIForLoggedInUser(user);

        // Store authentication state
        storeAuthState(user);

        // Redirect to dashboard or reload
        setTimeout(function () {
            window.location.href = '#dashboard';
        }, 1500);
    }

    // Update UI for logged in user
    function updateUIForLoggedInUser(user) {
        // Hide login/register buttons
        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            loginButton.classList.add('hidden');
        }

        // Show user menu
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.classList.remove('hidden');
        }

        // Set user initials
        const userInitials = document.getElementById('user-initials');
        if (userInitials) {
            const name = user.displayName || user.email || 'User';
            userInitials.textContent = name.charAt(0).toUpperCase();
        }

        // Set user info in dropdown
        const userDropdownName = document.getElementById('user-dropdown-name');
        if (userDropdownName) {
            userDropdownName.textContent = user.displayName || 'User';
        }

        const userDropdownEmail = document.getElementById('user-dropdown-email');
        if (userDropdownEmail) {
            userDropdownEmail.textContent = user.email || '';
        }

        // Hide the auth sidebar if it exists
        const authSidebar = document.getElementById('auth-sidebar');
        if (authSidebar) {
            authSidebar.style.display = 'none';
        }
    }

    // Store authentication state
    function storeAuthState(user) {
        // Store basic user info in localStorage
        try {
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                emailVerified: user.emailVerified,
                lastLogin: new Date().toISOString()
            };

            localStorage.setItem('auth_user', JSON.stringify(userData));

            // Also store in sessionStorage in case localStorage is cleared
            sessionStorage.setItem('auth_user', JSON.stringify(userData));

            console.log('✅ Auth Form Integration: User data stored successfully');
        } catch (error) {
            console.error('❌ Auth Form Integration: Error storing user data', error);
        }
    }

    // Set form loading state
    function setFormLoading(form, isLoading) {
        if (!form) return;

        const submitButton = form.querySelector('button[type="submit"]');

        if (submitButton) {
            if (isLoading) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            } else {
                submitButton.disabled = false;

                // Restore original button content based on form type
                if (form.id === 'inline-login-form') {
                    submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                } else if (form.id === 'inline-register-form') {
                    submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                } else {
                    submitButton.innerHTML = 'Submit';
                }
            }
        }

        // Disable/enable all inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = isLoading;
        });
    }

    // Show auth error
    function showAuthError(elementId, message) {
        const errorElement = document.getElementById(elementId);

        if (errorElement) {
            errorElement.textContent = message;

            if (message) {
                errorElement.style.display = 'block';

                // Add shake animation
                errorElement.classList.add('shake-error');

                // Remove animation class after animation completes
                setTimeout(function () {
                    errorElement.classList.remove('shake-error');
                }, 820); // Animation duration + a bit extra
            } else {
                errorElement.style.display = 'none';
            }
        }
    }

    // Show login success
    function showLoginSuccess() {
        // Create success toast
        const toast = document.createElement('div');
        toast.className = 'auth-toast success';

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">Login Successful</div>
                <div class="toast-message">Welcome back! You are now logged in.</div>
            </div>
        `;

        // Add to page
        document.body.appendChild(toast);

        // Animate in
        setTimeout(function () {
            toast.classList.add('show');
        }, 10);

        // Remove after delay
        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Show registration success
    function showRegistrationSuccess() {
        // Create success toast
        const toast = document.createElement('div');
        toast.className = 'auth-toast success';

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">Registration Successful</div>
                <div class="toast-message">Your account has been created successfully!</div>
            </div>
        `;

        // Style the toast
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #4CAF50, #8BC34A);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        `;

        // Add to page
        document.body.appendChild(toast);

        // Animate in
        setTimeout(function () {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // Remove after delay
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(function () {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Check if email is valid
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Export the module for debugging
    window.authFormIntegration = {
        loginWithFirebase,
        registerWithFirebase,
        showAuthError,
        updateUIForLoggedInUser,
        checkAuthState,
        retryFirebaseConnection: function () {
            if (window.firebaseLoader && typeof window.firebaseLoader.retry === 'function') {
                return window.firebaseLoader.retry();
            }
            return Promise.reject(new Error('Firebase retry not available'));
        }
    };

    // Start initialization
    startInit();
})();