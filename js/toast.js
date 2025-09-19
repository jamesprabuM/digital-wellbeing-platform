/**
 * Toast Notification System
 * 
 * This script provides a simple toast notification system for providing user feedback.
 */

// Initialize toast container
function initToastContainer() {
    // Check if toast container already exists
    if (document.getElementById('toast-container')) return;
    
    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
    `;
    
    document.body.appendChild(toastContainer);
}

// Show a toast notification
window.showToast = function(message, type = 'info', duration = 4000) {
    // Initialize container if not exists
    initToastContainer();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        padding: 12px 16px;
        border-radius: 8px;
        margin: 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 14px;
        min-width: 200px;
        max-width: 320px;
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    `;
    
    // Set color based on type
    switch (type) {
        case 'success':
            toast.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            toast.style.color = 'white';
            break;
        case 'error':
            toast.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            toast.style.color = 'white';
            break;
        case 'warning':
            toast.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            toast.style.color = 'white';
            break;
        default: // info
            toast.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            toast.style.color = 'white';
    }
    
    // Add icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default: // info
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // Set content
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
    `;
    
    // Add to container
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Auto remove after duration
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
    
    return toast;
};

// Initialize toast system
document.addEventListener('DOMContentLoaded', initToastContainer);

console.log('🍞 Toast Notification System Loaded');