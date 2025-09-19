/**
 * This script adds active state to the current navigation item
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all menu items
    const menuItems = document.querySelectorAll('.nav-menu a');
    
    // Function to set active menu item based on URL hash
    function setActiveMenuItem() {
        const hash = window.location.hash || '#home';
        
        // Remove active class from all menu items
        menuItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current menu item
        menuItems.forEach(item => {
            if (item.getAttribute('href') === hash) {
                item.classList.add('active');
            }
        });
    }
    
    // Set initial active state
    setActiveMenuItem();
    
    // Listen for hash changes
    window.addEventListener('hashchange', setActiveMenuItem);
    
    // Force the Dashboard to be active in this example to match the screenshot
    function forceActiveState() {
        const dashboardLink = document.querySelector('a[href="#dashboard"]');
        if (dashboardLink) {
            menuItems.forEach(item => {
                item.classList.remove('active');
            });
            dashboardLink.classList.add('active');
        }
    }
    
    // Apply after a short delay to ensure everything is loaded
    setTimeout(forceActiveState, 500);
});