/**
 * Authentication Error Handler for Supabase
 * 
 * This module handles authentication errors and provides user-friendly messages
 * as well as proper error logging and handling for token issues.
 */

(function () {
    // Define error messages for common Supabase auth errors
    const authErrorMessages = {
        'invalid-email': 'Please enter a valid email address.',
        'user-disabled': 'This account has been disabled. Please contact support.',
        'user-not-found': 'No account found with this email. Please check your email or sign up.',
        'invalid-credentials': 'Invalid credentials. Please check your email and password.',
        'email-already-in-use': 'This email is already registered. Please login instead.',
        'weak-password': 'Password is too weak. Please use a stronger password.',
        'auth/requires-recent-login': 'For security, please log out and log in again to perform this action.',
        'auth/duplicate-credential': 'An account already exists with the same email but different sign-in method.',
        'auth-unauthorized': 'This sign-in method is not allowed. Please contact support.',
        'too-many-requests': 'Too many unsuccessful login attempts. Please try again later.',
        'network-request-failed': 'Network error. Please check your internet connection.',
        'permission-denied': 'You do not have permission to access this resource.',
        'token-error': 'Authentication token error. Please log out and log in again.'
    };

    // Global error handler for token errors
    window.addEventListener('error', function (event) {
        const errorMsg = event.message || '';

        // Check for token related errors
        if (errorMsg.includes('token') ||
            errorMsg.includes('Unexpected token') ||
            errorMsg.includes('syntax error') ||
            errorMsg.includes('JSON') ||
            errorMsg.includes('auth')) {

            console.error('🔑 Token error detected:', errorMsg);

            // Check if error happened during API call
            const stack = event.error && event.error.stack ? event.error.stack : '';
            const isApiError = stack.includes('api') ||
                stack.includes('fetch') ||
                stack.includes('login') ||
                stack.includes('auth') ||
                stack.includes('supabase');

            if (isApiError) {
                console.warn('🔄 API error detected, attempting to refresh session...');

                // Attempt to refresh the session
                refreshSession().catch(e => {
                    console.error('❌ Session refresh failed:', e);
                    // If session refresh fails, show an error message
                    showAuthError('Authentication error. Please try logging in again.');
                });
            }
        }
    });

    // Show auth error message
    function showAuthError(message) {
        // Create a styled notification element
        const notification = document.createElement('div');
        notification.className = 'auth-error-notification';
        notification.innerHTML = `
            <div class="auth-error-content">
                <span class="auth-error-icon">⚠️</span>
                <span class="auth-error-message">${message}</span>
                <span class="auth-error-close">&times;</span>
            </div>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#f44336',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: '10000',
            maxWidth: '90%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        // Add the notification to the page
        document.body.appendChild(notification);

        // Add click event to close button
        const closeBtn = notification.querySelector('.auth-error-close');
        if (closeBtn) {
            closeBtn.style.marginLeft = '10px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontSize = '20px';
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }

        // Auto remove after 8 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 8000);
    }

    // Get a human-friendly error message
    function getAuthErrorMessage(error) {
        if (!error) return 'Unknown error occurred';

        // If it's a Supabase auth error with a code
        const errorCode = error.code?.toLowerCase?.() || error.error_description?.toLowerCase?.() || '';
        for (const [code, message] of Object.entries(authErrorMessages)) {
            if (errorCode.includes(code.toLowerCase())) {
                return message;
            }
        }

        // For other errors, use the message property or convert to string
        return error.message || error.toString();
    }

    // Refresh authentication session
    async function refreshSession() {
        try {
            // Check if Supabase client is available
            if (!window.apiClient?.client) {
                console.warn('⚠️ Supabase client not initialized');
                return Promise.reject(new Error('Supabase client not initialized'));
            }

            // Get current session
            const { data: { session }, error: sessionError } = await window.apiClient.client.auth.getSession();
            
            if (sessionError) throw sessionError;
            if (!session) {
                throw new Error('No active session');
            }

            // Check if session needs refresh
            const tokenExpiryTime = new Date(session.expires_at * 1000);
            const now = new Date();
            const timeUntilExpiry = tokenExpiryTime.getTime() - now.getTime();
            const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

            if (timeUntilExpiry > REFRESH_THRESHOLD) {
                console.log('✅ Session still valid');
                return session;
            }

            // Refresh the session
            console.log('🔄 Refreshing session...');
            const { data: { session: newSession }, error: refreshError } = 
                await window.apiClient.client.auth.refreshSession();

            if (refreshError) throw refreshError;
            if (!newSession) throw new Error('Failed to refresh session');

            console.log('✅ Session refreshed successfully');
            return newSession;

        } catch (error) {
            console.error('❌ Session refresh error:', error);

            // Handle specific refresh errors
            if (error.message?.includes('expired') || error.message?.includes('invalid')) {
                try {
                    // Sign out
                    await window.apiClient.client.auth.signOut();
                } catch (e) {
                    console.error('Signout error:', e);
                }

                // Show message to user
                showAuthError('For security reasons, please log in again.');

                // Redirect to home/login page
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }

            return Promise.reject(error);
        }
    }

    // Make the handler available globally
    window.authErrorHandler = {
        getErrorMessage: getAuthErrorMessage,
        showError: showAuthError,
        refreshSession: refreshSession
    };

    console.log('🛡️ Supabase auth error handler initialized');
})();