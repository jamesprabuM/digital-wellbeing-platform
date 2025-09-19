/**
 * Login Button Icon Visibility Fix
 * This script ensures the login button icon is visible
 */

(function() {
    console.log('🔧 Running login button icon fix...');
    
    function fixLoginButtonIcon() {
        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            // Ensure the icon is present and visible
            let icon = loginButton.querySelector('i.fas');
            
            if (!icon) {
                // If icon is missing, add it
                icon = document.createElement('i');
                icon.className = 'fas fa-user-circle';
                loginButton.prepend(icon);
                console.log('✅ Login button icon added');
            }
            
            // Apply direct styling
            icon.style.cssText = `
                display: inline-block !important;
                visibility: visible !important;
                opacity: 1 !important;
                margin-right: 8px !important;
                font-size: 1rem !important;
                color: white !important;
            `;
            
            // Style the button itself
            loginButton.style.cssText = `
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 0.75rem 1.5rem !important;
                font-weight: 600 !important;
                color: white !important;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%) !important;
                border: none !important;
                border-radius: 50px !important;
                box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4) !important;
                transition: all 0.3s ease !important;
                margin-left: auto !important;
                height: 48px !important;
                min-width: 160px !important;
                font-size: 1rem !important;
            `;
            
            // Make sure the nav container has the right layout
            const navContainer = document.querySelector('.nav-container');
            if (navContainer) {
                navContainer.style.cssText = `
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    width: 100% !important;
                `;
            }
            
            // Push the nav-actions to the end
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                navActions.style.cssText = `
                    display: flex !important;
                    align-items: center !important;
                    margin-left: auto !important;
                `;
            }
            
            console.log('✅ Login button styling fixed');
        } else {
            console.warn('⚠️ Login button not found');
        }
    }
    
    // Execute immediately if document is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixLoginButtonIcon);
    } else {
        fixLoginButtonIcon();
    }
    
    // Run again after a short delay to ensure it applies after any other scripts
    setTimeout(fixLoginButtonIcon, 500);
    setTimeout(fixLoginButtonIcon, 1000);
})();