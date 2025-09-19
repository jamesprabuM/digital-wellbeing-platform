// ===== ERROR HANDLING UTILITY =====

class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.init();
    }

    init() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                message: event.reason?.message || 'Unknown promise rejection',
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });
    }

    logError(errorInfo) {
        // Add to error log
        this.errorLog.unshift(errorInfo);
        
        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }

        // Log to console in development
        if (this.isDevelopment()) {
            console.error('MindfulPath Error:', errorInfo);
        }

        // Store in localStorage for debugging
        try {
            localStorage.setItem('mindfulpath_errors', JSON.stringify(this.errorLog.slice(0, 10)));
        } catch (e) {
            console.warn('Could not store error log:', e);
        }

        // Show user-friendly notification for critical errors
        if (this.isCriticalError(errorInfo)) {
            this.showUserNotification(errorInfo);
        }
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    }

    isCriticalError(errorInfo) {
        const criticalKeywords = [
            'network error',
            'failed to fetch',
            'storage quota exceeded',
            'out of memory'
        ];

        const message = errorInfo.message?.toLowerCase() || '';
        return criticalKeywords.some(keyword => message.includes(keyword));
    }

    showUserNotification(errorInfo) {
        if (window.showNotification) {
            let userMessage = 'Something went wrong. Please try again.';
            
            if (errorInfo.message?.includes('network')) {
                userMessage = 'Network connection issue. Please check your internet connection.';
            } else if (errorInfo.message?.includes('storage')) {
                userMessage = 'Storage is full. Please clear some data or try again later.';
            }

            window.showNotification(userMessage, 'error');
        }
    }

    // Utility method for handling async operations safely
    async safeAsync(asyncFunction, fallbackValue = null, context = 'Unknown') {
        try {
            return await asyncFunction();
        } catch (error) {
            this.logError({
                type: 'Async Operation Error',
                context,
                message: error.message,
                stack: error.stack,
                timestamp: Date.now()
            });
            return fallbackValue;
        }
    }

    // Utility method for handling sync operations safely
    safe(syncFunction, fallbackValue = null, context = 'Unknown') {
        try {
            return syncFunction();
        } catch (error) {
            this.logError({
                type: 'Sync Operation Error',
                context,
                message: error.message,
                stack: error.stack,
                timestamp: Date.now()
            });
            return fallbackValue;
        }
    }

    // Get error statistics for debugging
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            recent: this.errorLog.slice(0, 5)
        };

        this.errorLog.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
        });

        return stats;
    }

    // Clear error log
    clearErrors() {
        this.errorLog = [];
        try {
            localStorage.removeItem('mindfulpath_errors');
        } catch (e) {
            console.warn('Could not clear error log from storage:', e);
        }
    }

    // Export errors for debugging
    exportErrors() {
        const errorData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errors: this.errorLog
        };

        const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mindfulpath-errors-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize global error handler
window.errorHandler = new ErrorHandler();

// Add global utility functions
window.safeAsync = (fn, fallback, context) => window.errorHandler.safeAsync(fn, fallback, context);
window.safe = (fn, fallback, context) => window.errorHandler.safe(fn, fallback, context);

console.log('🛡️ Error Handler Initialized Successfully!');