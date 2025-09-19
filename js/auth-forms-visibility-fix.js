/**
 * Auth Forms Visibility Fix - Extra Aggressive Fix
 * This script ensures auth forms are visible by applying inline styles
 */

(function() {
    console.log('🔧 Running extra aggressive auth forms visibility fix...');
    
    // Function to ensure auth forms are visible
    function fixAuthFormVisibility() {
        // Fix auth sidebar
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
        }
        
        // Fix auth panel
        const authPanel = document.getElementById('auth-panel');
        if (authPanel) {
            authPanel.style.cssText = `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                flex-direction: column !important;
                width: 100% !important;
                max-width: 400px !important;
                background: white !important;
                border-radius: 12px !important;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
                overflow: hidden !important;
            `;
        }
        
        // Fix auth tabs
        const authTabs = document.querySelector('.auth-tabs');
        if (authTabs) {
            authTabs.style.cssText = `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 100% !important;
            `;
        }
        
        // Fix individual tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.style.cssText = `
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex: 1 !important;
                padding: 1rem !important;
                font-weight: 600 !important;
                color: #4a5568 !important;
                background: #f7fafc !important;
                border: none !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
            `;
            
            if (tab.classList.contains('active')) {
                tab.style.cssText += `
                    color: #667eea !important;
                    background: white !important;
                    border-bottom: 2px solid #667eea !important;
                `;
            }
        });
        
        // Fix login form container
        const loginFormContainer = document.getElementById('login-form-container');
        if (loginFormContainer) {
            const isActive = loginFormContainer.classList.contains('active');
            loginFormContainer.style.cssText = `
                display: ${isActive ? 'flex' : 'none'} !important;
                visibility: visible !important;
                opacity: ${isActive ? '1' : '0'} !important;
                flex-direction: column !important;
                padding: 2rem !important;
                width: 100% !important;
                position: ${isActive ? 'relative' : 'absolute'} !important;
                transform: ${isActive ? 'translateX(0)' : 'translateX(-9999px)'} !important;
            `;
        }
        
        // Fix register form container
        const registerFormContainer = document.getElementById('register-form-container');
        if (registerFormContainer) {
            const isActive = registerFormContainer.classList.contains('active');
            registerFormContainer.style.cssText = `
                display: ${isActive ? 'flex' : 'none'} !important;
                visibility: visible !important;
                opacity: ${isActive ? '1' : '0'} !important;
                flex-direction: column !important;
                padding: 2rem !important;
                width: 100% !important;
                position: ${isActive ? 'relative' : 'absolute'} !important;
                transform: ${isActive ? 'translateX(0)' : 'translateX(-9999px)'} !important;
            `;
        }
        
        // Fix form inputs
        document.querySelectorAll('.auth-form input').forEach(input => {
            input.style.cssText = `
                display: block !important;
                width: 100% !important;
                padding: 0.75rem !important;
                border-radius: 0.375rem !important;
                border: 1px solid #e2e8f0 !important;
                background-color: #fff !important;
                color: #4a5568 !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
        });
        
        // Fix form buttons
        document.querySelectorAll('.btn-auth').forEach(button => {
            button.style.cssText = `
                width: 100% !important;
                padding: 0.75rem !important;
                margin-top: 1rem !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
        });
        
        // Fix error messages
        document.querySelectorAll('.auth-error').forEach(error => {
            error.style.cssText = `
                display: block !important;
                color: #e53e3e !important;
                margin-bottom: 1rem !important;
                font-size: 0.875rem !important;
            `;
        });
        
        // Fix hero layout
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
        
        // Fix hero content
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
        
        console.log('✅ Extra aggressive auth forms visibility fix applied');
    }
    
    // Execute fixes
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixAuthFormVisibility);
    } else {
        fixAuthFormVisibility();
    }
    
    // Run again after a short delay to catch any dynamic changes
    setTimeout(fixAuthFormVisibility, 500);
    setTimeout(fixAuthFormVisibility, 1000);
    setTimeout(fixAuthFormVisibility, 2000);
    
    // Expose function globally for debugging and manual triggering
    window.fixAuthFormVisibility = fixAuthFormVisibility;
    
})();