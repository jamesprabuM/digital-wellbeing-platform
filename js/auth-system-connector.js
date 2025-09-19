/**
 * Authentication System Connector
 * 
 * This script ensures that all authentication components are properly connected
 * and handles cross-compatibility between different auth implementations.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Initializing Authentication System Connector...');
    
    // Check if required auth components are available
    const hasSupabase = typeof supabase !== 'undefined';
    const hasSupabaseAuth = typeof window.supabaseAuth !== 'undefined';
    const hasLegacyAuth = typeof window.authManager !== 'undefined';
    
    console.log(`- Supabase Client: ${hasSupabase ? '✅' : '❌'}`);
    console.log(`- Supabase Auth: ${hasSupabaseAuth ? '✅' : '❌'}`);
    console.log(`- Legacy Auth: ${hasLegacyAuth ? '✅' : '❌'}`);
    
    // Connect components together if needed
    if (hasSupabaseAuth && hasLegacyAuth) {
        // Create bridge between the two auth systems
        const authBridge = {
            // Map legacy auth manager methods to Supabase Auth
            openAuthModal: () => {
                // If we have inline auth, focus on that instead of opening a modal
                const authSidebar = document.getElementById('auth-sidebar');
                if (authSidebar) {
                    authSidebar.style.display = 'flex';
                    document.getElementById('inline-login-email').focus();
                    return;
                }
                
                // Fallback to legacy modal if available
                if (typeof window.authManager.openAuthModal === 'function') {
                    window.authManager.openAuthModal();
                }
            },
            
            // Toggle user dropdown menu
            toggleUserDropdown: () => {
                const dropdown = document.getElementById('user-dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('show');
                }
            },
            
            // Get user profile
            navigateToProfile: () => {
                window.location.href = '#dashboard';
                if (window.showToast) {
                    window.showToast('Profile section coming soon', 'info');
                }
            },
            
            // Navigate to settings
            navigateToSettings: () => {
                window.location.href = '#dashboard';
                if (window.showToast) {
                    window.showToast('Settings section coming soon', 'info');
                }
            },
            
            // Sign out
            logout: () => {
                window.supabaseAuth.signOut()
                    .then(() => {
                        if (window.showToast) {
                            window.showToast('You have been signed out successfully', 'success');
                        }
                        setTimeout(() => {
                            window.location.href = '#home';
                            location.reload();
                        }, 1000);
                    })
                    .catch(error => {
                        console.error('Logout error:', error);
                        if (window.showToast) {
                            window.showToast('Error signing out', 'error');
                        }
                    });
            },
            
            // Update UI based on auth state
            updateUI: (isAuthenticated, user) => {
                // This method can be extended to update any UI elements
                // based on authentication state
                console.log('Updating UI for auth state:', isAuthenticated ? 'authenticated' : 'unauthenticated');
                
                // Update login button and user menu
                const loginButton = document.getElementById('login-button');
                const userMenu = document.getElementById('user-menu');
                
                if (loginButton) {
                    loginButton.style.display = isAuthenticated ? 'none' : 'flex';
                }
                
                if (userMenu) {
                    userMenu.classList.toggle('hidden', !isAuthenticated);
                    
                    // Update user info if authenticated
                    if (isAuthenticated && user) {
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
                }
            },
            
            // Check authentication on page load
            checkAuthState: () => {
                const isAuthenticated = window.supabaseAuth.isAuthenticated();
                const user = window.supabaseAuth.getCurrentUser();
                
                // Update UI based on auth state
                authBridge.updateUI(isAuthenticated, user);
                
                return { isAuthenticated, user };
            }
        };
        
        // Override legacy auth manager with our bridge
        window.authManager = {
            ...window.authManager,
            ...authBridge
        };
        
        // Register auth state change listener
        document.addEventListener('authStateChanged', (event) => {
            const { isAuthenticated, user } = event.detail;
            authBridge.updateUI(isAuthenticated, user);
        });
        
        // Check auth state on page load
        authBridge.checkAuthState();
        
        console.log('✅ Authentication systems connected successfully');
    } else if (hasSupabaseAuth) {
        // Create a new auth manager if legacy one doesn't exist
        window.authManager = {
            openAuthModal: () => {
                const authSidebar = document.getElementById('auth-sidebar');
                if (authSidebar) {
                    authSidebar.style.display = 'flex';
                    document.getElementById('inline-login-email').focus();
                } else {
                    console.warn('Auth sidebar not found');
                }
            },
            
            toggleUserDropdown: () => {
                const dropdown = document.getElementById('user-dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('show');
                }
            },
            
            navigateToProfile: () => {
                window.location.href = '#dashboard';
                if (window.showToast) {
                    window.showToast('Profile section coming soon', 'info');
                }
            },
            
            navigateToSettings: () => {
                window.location.href = '#dashboard';
                if (window.showToast) {
                    window.showToast('Settings section coming soon', 'info');
                }
            },
            
            logout: async () => {
                try {
                    await window.supabaseAuth.signOut();
                    if (window.showToast) {
                        window.showToast('You have been signed out successfully', 'success');
                    }
                    setTimeout(() => {
                        window.location.href = '#home';
                        location.reload();
                    }, 1000);
                } catch (error) {
                    console.error('Logout error:', error);
                    if (window.showToast) {
                        window.showToast('Error signing out', 'error');
                    }
                }
            },
            
            checkAuthState: () => {
                const isAuthenticated = window.supabaseAuth.isAuthenticated();
                const user = window.supabaseAuth.getCurrentUser();
                
                // Update UI based on auth state
                const loginButton = document.getElementById('login-button');
                const userMenu = document.getElementById('user-menu');
                
                if (loginButton) {
                    loginButton.style.display = isAuthenticated ? 'none' : 'flex';
                }
                
                if (userMenu) {
                    userMenu.classList.toggle('hidden', !isAuthenticated);
                    
                    // Update user info if authenticated
                    if (isAuthenticated && user) {
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
                }
                
                return { isAuthenticated, user };
            }
        };
        
        // Register auth state change listener
        document.addEventListener('authStateChanged', (event) => {
            const { isAuthenticated, user } = event.detail;
            window.authManager.checkAuthState();
        });
        
        // Check auth state on page load
        window.authManager.checkAuthState();
        
        console.log('✅ New auth manager created');
    } else {
        console.warn('⚠️ No authentication system available');
    }
    
    // Add login button click handler if not already set
    const loginButton = document.getElementById('login-button');
    if (loginButton && !loginButton.onclick) {
        loginButton.onclick = function() {
            if (window.authManager && typeof window.authManager.openAuthModal === 'function') {
                window.authManager.openAuthModal();
            } else {
                console.warn('Auth manager not available');
                
                // Try to show auth sidebar directly
                const authSidebar = document.getElementById('auth-sidebar');
                if (authSidebar) {
                    authSidebar.style.display = 'flex';
                    const loginEmail = document.getElementById('inline-login-email');
                    if (loginEmail) loginEmail.focus();
                }
            }
        };
    }
});

// Add debug function
window.debugAuthSystem = function() {
    console.group('🔍 Auth System Debug');
    
    // Check required components
    const hasSupabase = typeof supabase !== 'undefined';
    const hasSupabaseAuth = typeof window.supabaseAuth !== 'undefined';
    const hasAuthManager = typeof window.authManager !== 'undefined';
    
    console.log('Component Availability:');
    console.log(`- Supabase Client: ${hasSupabase ? '✅' : '❌'}`);
    console.log(`- Supabase Auth: ${hasSupabaseAuth ? '✅' : '❌'}`);
    console.log(`- Auth Manager: ${hasAuthManager ? '✅' : '❌'}`);
    
    // Check auth state
    if (hasSupabaseAuth) {
        const isAuthenticated = window.supabaseAuth.isAuthenticated();
        const user = window.supabaseAuth.getCurrentUser();
        
        console.log('\nAuth State:');
        console.log(`- Authenticated: ${isAuthenticated ? '✅' : '❌'}`);
        console.log('- Current User:', user);
    }
    
    // Check UI elements
    console.log('\nUI Elements:');
    console.log(`- Login Button: ${document.getElementById('login-button') ? '✅' : '❌'}`);
    console.log(`- User Menu: ${document.getElementById('user-menu') ? '✅' : '❌'}`);
    console.log(`- Auth Sidebar: ${document.getElementById('auth-sidebar') ? '✅' : '❌'}`);
    console.log(`- Login Form: ${document.getElementById('inline-login-form') ? '✅' : '❌'}`);
    console.log(`- Register Form: ${document.getElementById('inline-register-form') ? '✅' : '❌'}`);
    
    console.groupEnd();
    
    // Also run Supabase auth check if available
    if (window.checkSupabaseAuth) {
        window.checkSupabaseAuth().then(result => {
            console.log('Supabase Auth Check Result:', result);
        });
    }
    
    return {
        hasSupabase,
        hasSupabaseAuth,
        hasAuthManager,
        isAuthenticated: hasSupabaseAuth ? window.supabaseAuth.isAuthenticated() : false,
        user: hasSupabaseAuth ? window.supabaseAuth.getCurrentUser() : null
    };
};

console.log('🔗 Auth System Connector Loaded');