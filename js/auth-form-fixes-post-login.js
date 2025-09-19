/**
 * Auth Form Fixes Post-Login
 * This script handles hiding the register form after login and ensuring
 * proper display of login forms for authenticated users
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated (using supabase or local storage token)
    const checkAuthStatus = () => {
        // Look for authentication token in localStorage or session
        const token = localStorage.getItem('supabase.auth.token') || 
                     sessionStorage.getItem('supabase.auth.token');
        
        return !!token; // Return true if token exists
    };

    const updateAuthUI = () => {
        const isAuthenticated = checkAuthStatus();
        const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
        const registerFormContainer = document.getElementById('register-form-container');
        const loginFormContainer = document.getElementById('login-form-container');
        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
        
        if (isAuthenticated) {
            // If user is authenticated, hide the register tab and form completely
            if (registerTab) registerTab.style.display = 'none';
            if (registerFormContainer) registerFormContainer.style.display = 'none';
            
            // Update login form to show welcome back message
            if (loginFormContainer) {
                const loginTitle = loginFormContainer.querySelector('.auth-title');
                if (loginTitle) loginTitle.textContent = 'Welcome Back';
                
                const loginSubtitle = loginFormContainer.querySelector('.auth-subtitle');
                if (loginSubtitle) loginSubtitle.textContent = 'You are currently signed in';
            }
            
            // Ensure login tab is active
            if (loginTab) {
                loginTab.classList.add('active');
                // Show login form container
                if (loginFormContainer) {
                    loginFormContainer.classList.add('active');
                }
            }
        } else {
            // If not authenticated, ensure register tab is visible
            if (registerTab) registerTab.style.display = '';
            if (registerFormContainer) registerFormContainer.style.display = '';
        }
    };
    
    // Run initially
    updateAuthUI();
    
    // Listen for auth state changes (if applicable)
    window.addEventListener('storage', (event) => {
        if (event.key && event.key.includes('supabase.auth')) {
            updateAuthUI();
        }
    });
    
    // If using Supabase with events, you can also listen to auth state changes
    if (window.supabaseAuth) {
        try {
            window.supabaseAuth.onAuthStateChange(() => {
                updateAuthUI();
            });
        } catch (e) {
            console.log('Supabase auth events not available');
        }
    }
});