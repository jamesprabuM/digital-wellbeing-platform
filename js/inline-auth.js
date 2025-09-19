/**
 * Inline Authentication Handlers
 * 
 * This script handles the inline login and registration forms that appear on the homepage.
 * It connects to the Supabase authentication system.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 Initializing inline authentication system...');
    
    // Make sure auth sidebar is visible
    const authSidebar = document.getElementById('auth-sidebar');
    if (authSidebar) {
        authSidebar.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            flex: 0 0 400px !important;
            align-items: center !important;
            padding: 2rem 0 !important;
            background: transparent !important;
            z-index: 50 !important;
        `;
        console.log('✅ Auth sidebar visibility fixed');
    }
    const inlineLoginForm = document.getElementById('inline-login-form');
    const inlineRegisterForm = document.getElementById('inline-register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Enhanced function to switch between auth tabs
    window.switchAuthTab = function(tabName) {
        console.log(`📋 Switching to tab: ${tabName}`);
        
        // Remove active class from all tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to selected tab
        const selectedTab = document.querySelector(`.auth-tab[data-tab="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
            console.log(`✅ Tab activated: ${tabName}`);
        }
        
        // Hide all form containers
        document.querySelectorAll('.auth-form-container').forEach(container => {
            container.classList.remove('active');
            container.style.display = 'none';
        });
        
        // Show selected form container
        const formContainer = document.getElementById(`${tabName}-form-container`);
        if (formContainer) {
            formContainer.classList.add('active');
            formContainer.style.display = 'flex';
            formContainer.style.visibility = 'visible';
            formContainer.style.opacity = '1';
            console.log(`✅ Form container visible: ${tabName}`);
        }
    };

    // Handle login form submission
    if (inlineLoginForm) {
        inlineLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous errors
            if (loginError) loginError.textContent = '';
            
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            submitBtn.disabled = true;
            
            try {
                // Get form data
                const email = document.getElementById('inline-login-email').value;
                const password = document.getElementById('inline-login-password').value;
                
                // Validate inputs
                if (!email || !password) {
                    throw new Error('Please enter both email and password');
                }
                
                console.log('📧 Attempting login with:', email);
                
                // Attempt login using Supabase auth
                if (window.supabaseAuth) {
                    const { user, error } = await window.supabaseAuth.signIn(email, password);
                    
                    if (error) throw error;
                    
                    console.log('✅ Login successful:', user);
                    
                    // Show success message
                    if (window.showToast) {
                        window.showToast('Login successful! Welcome back.', 'success');
                    } else {
                        alert('Login successful! Welcome back.');
                    }
                    
                    // Redirect or update UI
                    setTimeout(() => {
                        window.location.href = '#dashboard';
                        location.reload();
                    }, 1000);
                    
                } else {
                    throw new Error('Authentication system not available');
                }
                
            } catch (error) {
                console.error('❌ Login error:', error);
                
                // Display error message
                if (loginError) {
                    loginError.textContent = error.message || 'Failed to login. Please try again.';
                }
                
                // Highlight fields with error
                document.getElementById('inline-login-email').classList.add('error');
                document.getElementById('inline-login-password').classList.add('error');
                
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Handle register form submission
    if (inlineRegisterForm) {
        inlineRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous errors
            if (registerError) registerError.textContent = '';
            
            // Show loading state
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            submitBtn.disabled = true;
            
            try {
                // Get form data
                const name = document.getElementById('inline-register-name').value;
                const email = document.getElementById('inline-register-email').value;
                const password = document.getElementById('inline-register-password').value;
                const confirmPassword = document.getElementById('inline-register-confirm').value;
                const termsChecked = document.getElementById('inline-terms').checked;
                
                // Validate inputs
                if (!name || !email || !password || !confirmPassword) {
                    throw new Error('Please fill in all fields');
                }
                
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                
                if (!termsChecked) {
                    throw new Error('Please accept the terms of service');
                }
                
                if (password.length < 8) {
                    throw new Error('Password must be at least 8 characters long');
                }
                
                console.log('📧 Attempting registration with:', email);
                
                // Attempt registration using Supabase auth
                if (window.supabaseAuth) {
                    const { user, error } = await window.supabaseAuth.signUp(email, password, { name });
                    
                    if (error) throw error;
                    
                    console.log('✅ Registration successful:', user);
                    
                    // Show success message
                    if (window.showToast) {
                        window.showToast('Account created successfully! Welcome to MindfulPath.', 'success');
                    } else {
                        alert('Account created successfully! Welcome to MindfulPath.');
                    }
                    
                    // Redirect or update UI
                    setTimeout(() => {
                        window.location.href = '#dashboard';
                        location.reload();
                    }, 1000);
                    
                } else {
                    throw new Error('Authentication system not available');
                }
                
            } catch (error) {
                console.error('❌ Registration error:', error);
                
                // Display error message
                if (registerError) {
                    registerError.textContent = error.message || 'Failed to create account. Please try again.';
                }
                
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Handle forgot password
    window.showForgotPassword = function(event) {
        if (event) event.preventDefault();
        
        // Implement password reset functionality
        const email = document.getElementById('inline-login-email').value;
        
        if (email) {
            // Show modal or prompt for confirming password reset
            if (window.confirm(`Send a password reset link to ${email}?`)) {
                resetPassword(email);
            }
        } else {
            alert('Please enter your email address first');
            document.getElementById('inline-login-email').focus();
        }
    };
    
    // Password reset function
    async function resetPassword(email) {
        try {
            if (window.supabaseAuth && window.supabaseAuth.supabase) {
                const { error } = await window.supabaseAuth.supabase.auth.resetPasswordForEmail(email);
                
                if (error) throw error;
                
                if (window.showToast) {
                    window.showToast('Password reset link sent to your email', 'success');
                } else {
                    alert('Password reset link sent to your email');
                }
            } else {
                alert('Password reset functionality is not available');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            
            if (window.showToast) {
                window.showToast(error.message || 'Failed to send reset link', 'error');
            } else {
                alert(error.message || 'Failed to send reset link');
            }
        }
    }

    // Check for auth state changes and update UI
    document.addEventListener('authStateChanged', (event) => {
        const { isAuthenticated, user } = event.detail;
        
        if (isAuthenticated && user) {
            // Update UI for authenticated state
            const authSidebar = document.getElementById('auth-sidebar');
            if (authSidebar) {
                authSidebar.style.display = 'none';
            }
            
            // Show user menu
            const loginButton = document.getElementById('login-button');
            const userMenu = document.getElementById('user-menu');
            
            if (loginButton) loginButton.style.display = 'none';
            if (userMenu) {
                userMenu.classList.remove('hidden');
                
                // Set user info
                const userInitials = document.getElementById('user-initials');
                const userDropdownName = document.getElementById('user-dropdown-name');
                const userDropdownEmail = document.getElementById('user-dropdown-email');
                
                if (userInitials) {
                    const name = user.user_metadata?.full_name || user.email.split('@')[0];
                    userInitials.textContent = name.charAt(0).toUpperCase();
                }
                
                if (userDropdownName) {
                    userDropdownName.textContent = user.user_metadata?.full_name || user.email.split('@')[0];
                }
                
                if (userDropdownEmail) {
                    userDropdownEmail.textContent = user.email;
                }
            }
        } else {
            // Update UI for unauthenticated state
            const authSidebar = document.getElementById('auth-sidebar');
            if (authSidebar) {
                authSidebar.style.display = 'flex';
            }
            
            // Show login button
            const loginButton = document.getElementById('login-button');
            const userMenu = document.getElementById('user-menu');
            
            if (loginButton) loginButton.style.display = 'flex';
            if (userMenu) userMenu.classList.add('hidden');
        }
    });

    // Fix login and registration form visibility
    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    
    if (loginFormContainer) {
        loginFormContainer.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            flex-direction: column !important;
            width: 100% !important;
        `;
        console.log('✅ Login form visibility fixed');
    }
    
    if (registerFormContainer) {
        registerFormContainer.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            flex-direction: column !important;
            width: 100% !important;
        `;
        console.log('✅ Register form visibility fixed');
    }

    // Check auth state on page load
    if (window.supabaseAuth) {
        const isAuthenticated = window.supabaseAuth.isAuthenticated();
        const user = window.supabaseAuth.getCurrentUser();
        
        // Trigger auth state change event
        document.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isAuthenticated, user }
        }));
    }
});

// Add diagnostic function for troubleshooting inline auth
window.debugInlineAuth = function() {
    console.log('🔍 Inline Auth Diagnostics:');
    
    // Check if forms exist
    const loginForm = document.getElementById('inline-login-form');
    const registerForm = document.getElementById('inline-register-form');
    
    console.log('- Login form exists:', !!loginForm);
    console.log('- Register form exists:', !!registerForm);
    
    // Check if auth system is available
    console.log('- Supabase Auth available:', !!window.supabaseAuth);
    console.log('- Auth initialized:', window.supabaseAuth?.initialized);
    
    // Check current auth state
    const isAuthenticated = window.supabaseAuth?.isAuthenticated();
    console.log('- Currently authenticated:', isAuthenticated);
    
    if (isAuthenticated) {
        const user = window.supabaseAuth.getCurrentUser();
        console.log('- Current user:', user?.email);
    }
    
    return {
        loginForm: !!loginForm,
        registerForm: !!registerForm,
        authAvailable: !!window.supabaseAuth,
        authInitialized: window.supabaseAuth?.initialized,
        isAuthenticated
    };
};

console.log('📝 Inline Authentication System Loaded');