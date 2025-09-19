/**
 * UI Fix for Navigation and Authentication Elements
 * 
 * This script ensures that all navigation elements and authentication buttons
 * are properly visible and accessible.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Applying UI fixes for navigation and authentication...');
    
    // Fix login button visibility
    fixLoginButtonVisibility();
    
    // Fix debug button visibility
    fixDebugButtonVisibility();
    
    // Ensure auth sidebar is properly styled
    fixAuthSidebarVisibility();
    
    console.log('✅ UI fixes applied');
});

function fixLoginButtonVisibility() {
    // Get login button in nav
    const loginButton = document.getElementById('login-button');
    
    if (loginButton) {
        // Make sure button is visible
        loginButton.style.cssText = `
            display: flex !important;
            align-items: center !important;
            padding: 0.5rem 1.2rem !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            opacity: 1 !important;
            z-index: 100 !important;
            position: relative !important;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
            margin-left: auto !important;
        `;
        
        console.log('✅ Login button visibility fixed');
        
        // Add click event listener if not already present
        if (!loginButton.onclick) {
            loginButton.onclick = function() {
                // Try to open auth sidebar
                const authSidebar = document.getElementById('auth-sidebar');
                if (authSidebar) {
                    authSidebar.style.display = 'flex';
                    const loginEmail = document.getElementById('inline-login-email');
                    if (loginEmail) loginEmail.focus();
                    
                    // Log action
                    console.log('👆 Login button clicked - showing auth sidebar');
                } else {
                    console.warn('⚠️ Auth sidebar not found');
                }
            };
        }
    } else {
        console.warn('⚠️ Login button not found in the DOM');
        
        // Create login button if it doesn't exist
        createNavbarLoginButton();
    }
}

function createNavbarLoginButton() {
    // Find the navigation actions area
    const navActions = document.querySelector('.nav-actions');
    
    if (navActions) {
        // Create login button
        const loginButton = document.createElement('button');
        loginButton.id = 'login-button';
        loginButton.className = 'btn btn-secondary';
        loginButton.innerHTML = '<i class="fas fa-user"></i> Login / Register';
        
        loginButton.style.cssText = `
            display: flex !important;
            align-items: center !important;
            padding: 0.5rem 1.2rem !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            z-index: 100 !important;
        `;
        
        // Add click event listener
        loginButton.onclick = function() {
            // Try to open auth sidebar
            const authSidebar = document.getElementById('auth-sidebar');
            if (authSidebar) {
                authSidebar.style.display = 'flex';
                const loginEmail = document.getElementById('inline-login-email');
                if (loginEmail) loginEmail.focus();
            }
        };
        
        // Add button to navbar
        navActions.appendChild(loginButton);
        console.log('✅ Created new login button in navbar');
    } else {
        console.warn('⚠️ Could not find nav-actions to add login button');
    }
}

function fixDebugButtonVisibility() {
    // Check if debug button exists
    let debugButton = document.querySelector('button[id^="auth-debug"]');
    
    // If not found, look for one without ID but with debug in the text
    if (!debugButton) {
        debugButton = Array.from(document.querySelectorAll('button')).find(
            button => button.textContent && button.textContent.includes('Auth Debug')
        );
    }
    
    if (debugButton) {
        // Enhance visibility of debug button
        debugButton.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            left: 20px !important;
            z-index: 9999 !important;
            background: #667eea !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 8px 12px !important;
            font-size: 12px !important;
            cursor: pointer !important;
            opacity: 1 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        `;
        
        console.log('✅ Debug button visibility fixed');
    } else {
        console.log('Creating new debug button...');
        
        // Create debug button if it doesn't exist
        const debugButton = document.createElement('button');
        debugButton.id = 'auth-debug-button';
        debugButton.innerHTML = '<i class="fas fa-bug"></i> Auth Debug';
        
        debugButton.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            left: 20px !important;
            z-index: 9999 !important;
            background: #667eea !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            padding: 8px 12px !important;
            font-size: 12px !important;
            cursor: pointer !important;
            opacity: 1 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        `;
        
        // Add click handler
        debugButton.onclick = function() {
            console.log('🔍 Running authentication diagnostics...');
            
            // Run both debug functions for comprehensive diagnostics if they exist
            const debugFunctions = [
                window.checkSupabaseAuth,
                window.debugAuthSystem,
                window.checkScriptIntegrity,
                window.debugInlineAuth
            ];
            
            const results = {};
            
            // Execute all available debug functions
            Promise.all(
                debugFunctions
                    .filter(fn => typeof fn === 'function')
                    .map(fn => {
                        try {
                            const result = fn();
                            if (result instanceof Promise) {
                                return result;
                            }
                            return Promise.resolve(result);
                        } catch (e) {
                            return Promise.resolve({error: e.message});
                        }
                    })
            ).then(debugResults => {
                console.log('🔍 AUTHENTICATION DIAGNOSTICS RESULTS:');
                debugResults.forEach((result, index) => {
                    console.log(`Debug function ${index + 1} result:`, result);
                });
                
                // Try to show toast if available
                if (typeof window.showToast === 'function') {
                    // Check if we have authentication info
                    const authInfo = debugResults.find(r => r && r.status === 'authenticated');
                    
                    if (authInfo && authInfo.user) {
                        window.showToast(`Authenticated as ${authInfo.user.email}`, 'success', 5000);
                    } else {
                        window.showToast('Not authenticated - please log in', 'warning', 5000);
                    }
                } else {
                    // Fallback to alert
                    alert('Authentication diagnostics completed. Check console for details.');
                }
            });
        };
        
        // Add to document
        document.body.appendChild(debugButton);
        console.log('✅ New debug button created and added');
    }
}

function fixAuthSidebarVisibility() {
    // Find the auth sidebar
    const authSidebar = document.getElementById('auth-sidebar');
    
    if (authSidebar) {
        // Make sure it's properly styled
        authSidebar.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            flex: 0 0 400px !important;
            align-items: center !important;
            padding: 2rem 0 !important;
            background: transparent !important;
        `;
        
        // Fix auth panel inside sidebar
        const authPanel = document.getElementById('auth-panel');
        if (authPanel) {
            authPanel.style.cssText = `
                background: white !important;
                border-radius: 10px !important;
                box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
                width: 100% !important;
                padding: 1.5rem !important;
            `;
        }
        
        console.log('✅ Auth sidebar visibility fixed');
    } else {
        console.warn('⚠️ Auth sidebar not found in the DOM');
    }
    
    // Fix hero layout if it exists
    const heroLayout = document.querySelector('.hero-layout');
    if (heroLayout) {
        heroLayout.style.cssText = `
            display: flex !important;
            gap: 3rem !important;
            max-width: 1400px !important;
            margin: 0 auto !important;
            padding: 0 2rem !important;
            align-items: stretch !important;
            min-height: calc(100vh - 80px) !important;
        `;
    }
    
    // Fix hero content if it exists
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.cssText = `
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            text-align: left !important;
            max-width: none !important;
        `;
    }
}

// Run fixes immediately
document.addEventListener('DOMContentLoaded', function() {
    fixLoginButtonVisibility();
    fixDebugButtonVisibility();
    fixAuthSidebarVisibility();
});

// Also run on window load to ensure all elements are rendered
window.addEventListener('load', function() {
    setTimeout(() => {
        fixLoginButtonVisibility();
        fixDebugButtonVisibility();
        fixAuthSidebarVisibility();
    }, 500);
});

// Run periodically to ensure visibility
setInterval(() => {
    fixLoginButtonVisibility();
    fixDebugButtonVisibility();
}, 3000);

console.log('🔍 UI Fix Script Loaded');