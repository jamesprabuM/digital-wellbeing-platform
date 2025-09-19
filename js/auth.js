// ===== AUTHENTICATION COMPONENTS =====

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authModalVisible = false;

        this.init();
    }

    init() {
        // Create authentication modals
        this.createLoginModal();
        this.createRegistrationModal();

        // Add listener for login state changes
        document.addEventListener('loginStateChanged', (e) => {
            this.handleLoginStateChange(e.detail);
        });

        // Initialize auth state from available backends
        this.initializeAuthState().finally(() => {
            // Sync the nav UI once state is known
            this.addAuthButtonsToNav();

            // Simple smoke test via URL hash (#auth | #login | #register)
            const hash = (window.location.hash || '').toLowerCase();
            if (hash === '#auth' || hash === '#login') {
                this.showLoginModal();
            } else if (hash === '#register') {
                this.showRegistrationModal();
            }
        });
    }

    async initializeAuthState() {
        try {
            if (window.apiClient && window.apiClient.isAuthenticated) {
                // Try to fetch profile; be tolerant of shape
                const profile = await window.apiClient.getProfile().catch(() => null);
                const user = profile?.user || profile?.data || profile || null;
                if (user) {
                    this.currentUser = user;
                    this.handleLoginStateChange({ isLoggedIn: true, user });
                    return;
                }
            }
            // Fallback to legacy local DB
            if (window.db && window.db.isLoggedIn()) {
                const user = window.db.getCurrentUser();
                this.currentUser = user;
                this.handleLoginStateChange({ isLoggedIn: true, user });
            }
        } catch (e) {
            console.warn('Auth init warning:', e);
        }
    }

    createLoginModal() {
        const loginModal = document.createElement('div');
        loginModal.id = 'login-modal';
        loginModal.className = 'modal';
        loginModal.setAttribute('aria-labelledby', 'login-title');
        loginModal.setAttribute('aria-hidden', 'true');

        loginModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="login-title">Log In to MindfulPath</h3>
                    <button class="modal-close" aria-label="Close login form">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="login-error" class="auth-error" style="display: none;"></div>
                    
                    <form id="login-form" class="auth-form">
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" name="email" required 
                                placeholder="Enter your email address" autocomplete="email">
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" name="password" required 
                                placeholder="Enter your password" autocomplete="current-password">
                        </div>
                        <div class="form-group forgot-password">
                            <a href="#" onclick="authManager.showForgotPassword(event)">Forgot password?</a>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary login-btn">
                                <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                                Log In
                            </button>
                        </div>
                    </form>
                    
                    <div class="auth-alt-action">
                        <p>Don't have an account? <a href="#" onclick="authManager.showRegistrationModal()">Sign Up</a></p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(loginModal);

        // Add event listeners
        const loginForm = document.getElementById('login-form');
        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));

        const closeBtn = loginModal.querySelector('.modal-close');
        closeBtn?.addEventListener('click', () => this.hideLoginModal());
    }

    createRegistrationModal() {
        const registerModal = document.createElement('div');
        registerModal.id = 'register-modal';
        registerModal.className = 'modal';
        registerModal.setAttribute('aria-labelledby', 'register-title');
        registerModal.setAttribute('aria-hidden', 'true');

        registerModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="register-title">Create an Account</h3>
                    <button class="modal-close" aria-label="Close registration form">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="register-error" class="auth-error" style="display: none;"></div>
                    
                    <form id="register-form" class="auth-form">
                        <div class="form-group">
                            <label for="register-username">Username</label>
                            <input type="text" id="register-username" name="username" required 
                                placeholder="Choose a username" autocomplete="username">
                        </div>
                        <div class="form-group">
                            <label for="register-email">Email</label>
                            <input type="email" id="register-email" name="email" required 
                                placeholder="Enter your email address" autocomplete="email">
                        </div>
                        <div class="form-group">
                            <label for="register-password">Password</label>
                            <input type="password" id="register-password" name="password" required 
                                placeholder="Create a password" autocomplete="new-password"
                                pattern=".{8,}" title="Password must be at least 8 characters long">
                        </div>
                        <div class="form-group">
                            <label for="register-confirm">Confirm Password</label>
                            <input type="password" id="register-confirm" name="confirm" required 
                                placeholder="Confirm your password" autocomplete="new-password">
                        </div>
                        <div class="form-group consent-check">
                            <input type="checkbox" id="register-terms" required>
                            <label for="register-terms">I agree to the <a href="#terms" target="_blank">Terms of Service</a> and <a href="#privacy" target="_blank">Privacy Policy</a></label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary register-btn">
                                <i class="fas fa-user-plus" aria-hidden="true"></i>
                                Create Account
                            </button>
                        </div>
                    </form>
                    
                    <div class="auth-alt-action">
                        <p>Already have an account? <a href="#" onclick="authManager.showLoginModal()">Log In</a></p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(registerModal);

        // Add event listeners
        const registerForm = document.getElementById('register-form');
        registerForm?.addEventListener('submit', (e) => this.handleRegistration(e));

        // Validate password match
        const confirmPassword = document.getElementById('register-confirm');
        confirmPassword?.addEventListener('input', () => {
            const password = document.getElementById('register-password').value;
            const confirm = confirmPassword.value;

            if (password !== confirm) {
                confirmPassword.setCustomValidity("Passwords don't match");
            } else {
                confirmPassword.setCustomValidity("");
            }
        });

        const closeBtn = registerModal.querySelector('.modal-close');
        closeBtn?.addEventListener('click', () => this.hideRegistrationModal());
    }

    addAuthButtonsToNav() {
        // If the new nav-actions container exists, control it; otherwise no-op
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        this.updateNavActionsUI();
    }

    updateNavActionsUI() {
        const loginBtn = document.getElementById('login-button');
        const userMenu = document.getElementById('user-menu');
        const initialsEl = document.getElementById('user-initials');
        const nameEl = document.getElementById('user-dropdown-name');
        const emailEl = document.getElementById('user-dropdown-email');

        const isLoggedIn = !!this.currentUser || (window.apiClient?.isAuthenticated) || (window.db?.isLoggedIn?.());

        if (!loginBtn || !userMenu) return;

        if (isLoggedIn) {
            // Prefer the user we track locally
            let user = this.currentUser;
            if (!user) {
                try { user = window.db?.getCurrentUser?.() || null; } catch { }
            }

            const displayName = user?.name || user?.username || 'User';
            const email = user?.email || '';
            const initials = displayName.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

            loginBtn.style.display = 'none';
            userMenu.style.display = 'flex';

            if (initialsEl) initialsEl.textContent = initials;
            if (nameEl) nameEl.textContent = displayName;
            if (emailEl) emailEl.textContent = email;
        } else {
            loginBtn.style.display = '';
            userMenu.style.display = 'none';
        }
    }

    toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');

            // Close dropdown when clicking outside
            if (dropdown.classList.contains('active')) {
                setTimeout(() => {
                    const clickHandler = (event) => {
                        if (!event.target.closest('.user-dropdown')) {
                            dropdown.classList.remove('active');
                            document.removeEventListener('click', clickHandler);
                        }
                    };
                    document.addEventListener('click', clickHandler);
                }, 0);
            }
        }
    }

    showLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            // Hide registration modal if open
            this.hideRegistrationModal();

            loginModal.classList.add('active');
            loginModal.setAttribute('aria-hidden', 'false');

            // Focus the email input
            setTimeout(() => {
                const emailInput = document.getElementById('login-email');
                if (emailInput) {
                    emailInput.focus();
                }
            }, 100);

            this.authModalVisible = true;
        }
    }

    hideLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.remove('active');
            loginModal.setAttribute('aria-hidden', 'true');

            // Clear form and errors
            const form = document.getElementById('login-form');
            const error = document.getElementById('login-error');

            if (form) form.reset();
            if (error) error.style.display = 'none';

            this.authModalVisible = false;
        }
    }

    showRegistrationModal() {
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            // Hide login modal if open
            this.hideLoginModal();

            registerModal.classList.add('active');
            registerModal.setAttribute('aria-hidden', 'false');

            // Focus the username input
            setTimeout(() => {
                const usernameInput = document.getElementById('register-username');
                if (usernameInput) {
                    usernameInput.focus();
                }
            }, 100);

            this.authModalVisible = true;
        }
    }

    hideRegistrationModal() {
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.classList.remove('active');
            registerModal.setAttribute('aria-hidden', 'true');

            // Clear form and errors
            const form = document.getElementById('register-form');
            const error = document.getElementById('register-error');

            if (form) form.reset();
            if (error) error.style.display = 'none';

            this.authModalVisible = false;
        }
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDisplay = document.getElementById('login-error');

        try {
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

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
            // Display error
            if (errorDisplay) {
                errorDisplay.textContent = error.message || 'Login failed. Please check your credentials and try again.';
                errorDisplay.style.display = 'block';
            }

        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Log In';
                submitBtn.disabled = false;
            }
        }
    }

    async handleRegistration(e) {
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
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            submitBtn.disabled = true;

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
    }

    handleLoginStateChange(detail) {
        const { isLoggedIn, user } = detail;
        this.currentUser = isLoggedIn ? user : null;

        // Update new nav UI
        this.updateNavActionsUI();

        // Refresh wellness data if logged in
        if (isLoggedIn && window.dashboard) {
            window.dashboard.loadUserData();
        }
    }

    handleLogout() {
        if (window.apiClient) {
            window.apiClient.logout();
        } else if (window.db) {
            window.db.logout();
        }

        // Clear current user
        this.currentUser = null;

        // Update UI
        this.addAuthButtonsToNav();
        this.showAuthSidebar();

        // Clear forms
        this.clearInlineForms();

        // Show notification
        if (window.showNotification) {
            window.showNotification('You have been logged out successfully.', 'info');
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    clearInlineForms() {
        // Clear login form
        const loginForm = document.getElementById('inline-login-form');
        if (loginForm) loginForm.reset();

        // Clear register form
        const registerForm = document.getElementById('inline-register-form');
        if (registerForm) registerForm.reset();

        // Clear error messages
        const loginError = document.getElementById('login-error');
        const registerError = document.getElementById('register-error');
        if (loginError) loginError.style.display = 'none';
        if (registerError) registerError.style.display = 'none';

        // Reset to login tab
        switchAuthTab('login');
    }

    // Public helpers used by markup
    openAuthModal() { this.showLoginModal(); }
    logout() { this.handleLogout(); }

    navigateToProfile() {
        this.showProfileModal();
    }

    navigateToSettings() {
        this.showSettingsModal();
    }

    showForgotPassword(e) {
        e.preventDefault();
        this.showForgotPasswordModal();
    }

    async showProfileModal() {
        // Create profile modal if it doesn't exist
        if (!document.getElementById('profile-modal')) {
            this.createProfileModal();
        }

        const modal = document.getElementById('profile-modal');
        if (modal) {
            // Load current user data
            try {
                let user = this.currentUser;
                if (window.apiClient && window.apiClient.isAuthenticated) {
                    const profile = await window.apiClient.getProfile();
                    user = profile?.user || profile?.data || profile || user;
                }

                // Populate form with current data
                if (user) {
                    document.getElementById('profile-name').value = user.name || user.username || '';
                    document.getElementById('profile-email').value = user.email || '';
                }

                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
            } catch (error) {
                console.error('Error loading profile:', error);
                if (window.showNotification) {
                    window.showNotification('Unable to load profile data.', 'error');
                }
            }
        }
    }

    createProfileModal() {
        const modal = document.createElement('div');
        modal.id = 'profile-modal';
        modal.className = 'modal';
        modal.setAttribute('aria-labelledby', 'profile-title');
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="profile-title">Your Profile</h3>
                    <button class="modal-close" aria-label="Close profile">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="profile-error" class="auth-error" style="display: none;"></div>
                    
                    <form id="profile-form" class="auth-form">
                        <div class="form-group">
                            <label for="profile-name">Full Name</label>
                            <input type="text" id="profile-name" name="name" required 
                                placeholder="Enter your full name">
                        </div>
                        <div class="form-group">
                            <label for="profile-email">Email Address</label>
                            <input type="email" id="profile-email" name="email" required 
                                placeholder="Enter your email address">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save" aria-hidden="true"></i>
                                Save Changes
                            </button>
                            <button type="button" class="btn btn-outline" onclick="this.closest('.modal').classList.remove('active')">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const form = document.getElementById('profile-form');
        form?.addEventListener('submit', (e) => this.handleProfileUpdate(e));

        const closeBtn = modal.querySelector('.modal-close');
        closeBtn?.addEventListener('click', () => this.hideProfileModal());
    }

    async handleProfileUpdate(e) {
        e.preventDefault();

        const name = document.getElementById('profile-name').value;
        const email = document.getElementById('profile-email').value;
        const errorDisplay = document.getElementById('profile-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            submitBtn.disabled = true;

            // Update profile
            if (window.apiClient && window.apiClient.isAuthenticated) {
                await window.apiClient.updateProfile({ name, email });

                // Update current user data
                this.currentUser = { ...this.currentUser, name, email };
                this.updateNavActionsUI();

                if (window.showNotification) {
                    window.showNotification('Profile updated successfully!', 'success');
                }
            } else {
                throw new Error('Authentication required to update profile');
            }

            this.hideProfileModal();

        } catch (error) {
            // Display error
            if (errorDisplay) {
                errorDisplay.textContent = error.message || 'Failed to update profile. Please try again.';
                errorDisplay.style.display = 'block';
            }

        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                submitBtn.disabled = false;
            }
        }
    }

    hideProfileModal() {
        const modal = document.getElementById('profile-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');

            // Clear form and errors
            const form = document.getElementById('profile-form');
            const error = document.getElementById('profile-error');

            if (error) error.style.display = 'none';
        }
    }

    showSettingsModal() {
        if (window.showNotification) {
            window.showNotification('Settings panel coming soon! We\'re working on preferences, notifications, and more.', 'info');
        }
    }

    showForgotPasswordModal() {
        if (window.showNotification) {
            window.showNotification('Password recovery feature coming soon! For now, please contact support if you need help.', 'info');
        }
    }

    // ===== INLINE AUTHENTICATION METHODS =====

    initInlineAuth() {
        // Bind inline form events
        this.bindInlineAuthEvents();

        // Show/hide sidebar based on auth state
        if (this.currentUser) {
            this.hideAuthSidebar();
        } else {
            this.showAuthSidebar();
        }

        console.log('Inline auth initialized, current user:', this.currentUser);
    }

    bindInlineAuthEvents() {
        // Bind inline login form
        const inlineLoginForm = document.getElementById('inline-login-form');
        if (inlineLoginForm) {
            inlineLoginForm.addEventListener('submit', (e) => this.handleInlineLogin(e));
        }

        // Bind inline register form
        const inlineRegisterForm = document.getElementById('inline-register-form');
        if (inlineRegisterForm) {
            inlineRegisterForm.addEventListener('submit', (e) => this.handleInlineRegister(e));
        }
    }

    async handleInlineLogin(e) {
        e.preventDefault();

        const email = document.getElementById('inline-login-email').value;
        const password = document.getElementById('inline-login-password').value;
        const remember = document.getElementById('inline-remember-me').checked;
        const errorDisplay = document.getElementById('login-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Clear previous errors
        if (errorDisplay) errorDisplay.style.display = 'none';

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            submitBtn.disabled = true;

            // Attempt login via API client
            if (window.apiClient) {
                const response = await window.apiClient.login(email, password);
                this.handleInlineLoginSuccess(response, remember);
            } else {
                throw new Error('API client not available');
            }

        } catch (error) {
            this.handleInlineError(error, errorDisplay, 'login');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                submitBtn.disabled = false;
            }
        }
    }

    async handleInlineRegister(e) {
        e.preventDefault();

        const name = document.getElementById('inline-register-name').value;
        const email = document.getElementById('inline-register-email').value;
        const password = document.getElementById('inline-register-password').value;
        const confirmPassword = document.getElementById('inline-register-confirm').value;
        const terms = document.getElementById('inline-terms').checked;
        const errorDisplay = document.getElementById('register-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        // Clear previous errors
        if (errorDisplay) errorDisplay.style.display = 'none';

        // Validate passwords match
        if (password !== confirmPassword) {
            this.showInlineError('Passwords do not match.', errorDisplay);
            return;
        }

        // Validate terms acceptance
        if (!terms) {
            this.showInlineError('Please accept the Terms of Service.', errorDisplay);
            return;
        }

        try {
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            submitBtn.disabled = true;

            // Attempt registration via API client
            if (window.apiClient) {
                const response = await window.apiClient.register(name, email, password);
                this.handleInlineRegistrationSuccess(response);
            } else {
                throw new Error('API client not available');
            }

        } catch (error) {
            this.handleInlineError(error, errorDisplay, 'register');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                submitBtn.disabled = false;
            }
        }
    }

    handleInlineLoginSuccess(response, remember = false) {
        // Store user data
        this.currentUser = response.user || response.data?.user || response;

        // Handle "remember me" option
        if (remember && window.apiClient) {
            localStorage.setItem('remember_login', 'true');
        }

        // Update UI
        this.addAuthButtonsToNav();
        this.hideAuthSidebar();

        // Show success notification
        if (window.showNotification) {
            window.showNotification(`Welcome back, ${this.currentUser.name || this.currentUser.email}!`, 'success');
        }

        // Navigate to dashboard
        this.navigateToDashboard();
    }

    handleInlineRegistrationSuccess(response) {
        // Store user data and auto-login
        this.currentUser = response.user || response.data?.user || response;

        // Update UI
        this.addAuthButtonsToNav();
        this.hideAuthSidebar();

        // Show success notification
        if (window.showNotification) {
            window.showNotification(`Welcome to MindfulPath, ${this.currentUser.name}!`, 'success');
        }

        // Navigate to dashboard
        this.navigateToDashboard();
    }

    handleInlineError(error, errorDisplay, type) {
        const message = error.message || `${type === 'login' ? 'Login' : 'Registration'} failed. Please try again.`;
        this.showInlineError(message, errorDisplay);

        if (window.showNotification) {
            window.showNotification(message, 'error');
        }
    }

    showInlineError(message, errorDisplay) {
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
        }
    }

    hideAuthSidebar() {
        const authSidebar = document.getElementById('auth-sidebar');
        if (authSidebar) {
            authSidebar.style.display = 'none';
        }
    }

    showAuthSidebar() {
        const authSidebar = document.getElementById('auth-sidebar');
        if (authSidebar) {
            authSidebar.style.display = 'flex';
        }
    }

    navigateToDashboard() {
        // Scroll to dashboard section
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Database to be initialized
    setTimeout(() => {
        window.authManager = new AuthManager();
        // Initialize inline authentication after DOM is ready
        if (window.authManager) {
            window.authManager.initInlineAuth();
        }
    }, 500);
});

// Global function for tab switching
function switchAuthTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update form containers
    document.querySelectorAll('.auth-form-container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(`${tabName}-form-container`).classList.add('active');

    // Clear any error messages
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    if (loginError) loginError.style.display = 'none';
    if (registerError) registerError.style.display = 'none';
}