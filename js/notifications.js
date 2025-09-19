// Notification System for Digital Wellbeing Platform
// Provides toast-style notifications for user feedback

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.autoCloseDelay = 5000; // 5 seconds
        this.init();
    }

    init() {
        // Create notification container if it doesn't exist
        this.createContainer();
    }

    createContainer() {
        if (document.getElementById('notification-container')) return;

        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');

        document.body.appendChild(container);
    }

    show(message, type = 'info', options = {}) {
        const notification = this.createNotification(message, type, options);
        this.addNotification(notification);
        return notification;
    }

    createNotification(message, type, options) {
        const id = 'notification-' + Date.now() + Math.random().toString(36).substr(2, 9);
        const autoClose = options.autoClose !== false;
        const duration = options.duration || this.autoCloseDelay;

        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-atomic', 'true');

        const icon = this.getIconForType(type);

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="${icon}" aria-hidden="true"></i>
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" aria-label="Close notification">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(id));

        // Auto-close if enabled
        if (autoClose) {
            setTimeout(() => this.remove(id), duration);
        }

        return { element: notification, id, type, message };
    }

    getIconForType(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    addNotification(notification) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        // Remove oldest notification if at max capacity
        if (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            this.remove(oldest.id, false);
        }

        // Add to DOM and tracking array
        container.appendChild(notification.element);
        this.notifications.push(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.element.classList.add('notification-show');
        });
    }

    remove(id, updateArray = true) {
        const notification = document.getElementById(id);
        if (!notification) return;

        notification.classList.add('notification-hide');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300); // Match CSS transition duration

        if (updateArray) {
            this.notifications = this.notifications.filter(n => n.id !== id);
        }
    }

    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification.id, false);
        });
        this.notifications = [];
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }
}

// Initialize global notification manager
window.notificationManager = new NotificationManager();

// Global convenience function
window.showNotification = function (message, type = 'info', options = {}) {
    return window.notificationManager.show(message, type, options);
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}