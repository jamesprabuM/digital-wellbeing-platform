/**
 * Global Error Monitor
 * 
 * This script implements a comprehensive error monitoring system
 * that specifically targets "Unexpected token '<'" errors and other
 * common issues with API responses and parsing.
 */

(function () {
    console.log('🛡️ Global Error Monitor initialized');

    // Track errors to prevent duplicates
    const errorTracker = {
        lastError: null,
        lastErrorTime: 0,
        errorCount: 0,
        notificationShown: false
    };

    // Common error patterns
    const errorPatterns = [
        {
            pattern: /Unexpected token '</i,
            type: 'unexpectedToken',
            message: 'API response format error detected. The server may have returned HTML instead of JSON.',
            recovery: recoverFromUnexpectedToken
        },
        {
            pattern: /Failed to fetch|NetworkError|Network Error/i,
            type: 'networkError',
            message: 'Network connection issue detected. Please check your internet connection.',
            recovery: recoverFromNetworkError
        },
        {
            pattern: /Firebase|firestore|auth.*not.*initialized/i,
            type: 'firebaseError',
            message: 'Firebase initialization error detected.',
            recovery: recoverFromFirebaseError
        },
        {
            pattern: /SyntaxError|JSON.parse/i,
            type: 'parsingError',
            message: 'Data parsing error detected.',
            recovery: recoverFromParsingError
        }
    ];

    // Handle all global errors
    window.addEventListener('error', function (event) {
        const error = event.error || new Error(event.message || 'Unknown error');
        const errorMessage = error.message || 'Unknown error';
        const errorStack = error.stack || '';

        console.group('🔍 Global Error Monitor');
        console.error('Error detected:', errorMessage);
        console.error('Stack:', errorStack);

        // Check if this is a duplicate error
        const now = Date.now();
        if (errorTracker.lastError === errorMessage && (now - errorTracker.lastErrorTime) < 5000) {
            errorTracker.errorCount++;
            console.log(`Duplicate error detected (${errorTracker.errorCount} occurrences)`);
            console.groupEnd();
            return;
        }

        // Update error tracker
        errorTracker.lastError = errorMessage;
        errorTracker.lastErrorTime = now;
        errorTracker.errorCount = 1;

        // Check for known error patterns
        for (const errorPattern of errorPatterns) {
            if (errorPattern.pattern.test(errorMessage) || errorPattern.pattern.test(errorStack)) {
                console.log(`Detected ${errorPattern.type} error`);

                // Only show one notification at a time
                if (!errorTracker.notificationShown) {
                    errorTracker.notificationShown = true;
                    showErrorNotification(errorPattern.message, function () {
                        errorTracker.notificationShown = false;
                    });
                }

                // Try to recover
                if (errorPattern.recovery) {
                    try {
                        errorPattern.recovery(error, errorMessage, errorStack);
                    } catch (recoveryError) {
                        console.error('Recovery attempt failed:', recoveryError);
                    }
                }

                console.groupEnd();
                return;
            }
        }

        console.log('Unknown error type, no specific recovery available');
        console.groupEnd();
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function (event) {
        const error = event.reason;
        const errorMessage = error && error.message ? error.message : String(error);
        const errorStack = error && error.stack ? error.stack : '';

        console.group('🔍 Global Error Monitor - Unhandled Rejection');
        console.error('Unhandled promise rejection:', errorMessage);
        console.error('Stack:', errorStack);

        // Check for known error patterns
        for (const errorPattern of errorPatterns) {
            if (errorPattern.pattern.test(errorMessage) || errorPattern.pattern.test(errorStack)) {
                console.log(`Detected ${errorPattern.type} error`);

                // Only show one notification at a time
                if (!errorTracker.notificationShown) {
                    errorTracker.notificationShown = true;
                    showErrorNotification(errorPattern.message, function () {
                        errorTracker.notificationShown = false;
                    });
                }

                // Try to recover
                if (errorPattern.recovery) {
                    try {
                        errorPattern.recovery(error, errorMessage, errorStack);
                    } catch (recoveryError) {
                        console.error('Recovery attempt failed:', recoveryError);
                    }
                }

                console.groupEnd();
                return;
            }
        }

        console.log('Unknown error type, no specific recovery available');
        console.groupEnd();
    });

    // Recovery functions

    // Recover from "Unexpected token '<'" errors
    function recoverFromUnexpectedToken(error, errorMessage, errorStack) {
        console.log('Attempting to recover from unexpected token error...');

        // Check if it's related to Firebase
        if (errorStack.includes('firebase') || errorStack.includes('auth')) {
            console.log('Error appears to be Firebase-related');

            // Try to reinitialize Firebase
            if (window.firebaseSafeInit) {
                console.log('Reinitializing Firebase...');
                setTimeout(function () {
                    window.firebaseSafeInit.recover();
                }, 1000);
            }
        }

        // Check if it's related to an API call
        if (errorStack.includes('fetch') || errorStack.includes('XMLHttpRequest')) {
            console.log('Error appears to be related to an API call');

            // Patch the fetch and XMLHttpRequest prototypes to better handle HTML responses
            patchFetchPrototype();
            patchXHRPrototype();
        }
    }

    // Recover from network errors
    function recoverFromNetworkError(error, errorMessage, errorStack) {
        console.log('Attempting to recover from network error...');

        // Check online status
        if (!navigator.onLine) {
            console.log('Device is offline, showing offline message');
            showOfflineMessage();
            return;
        }

        // If user is online but still getting network errors, could be a CORS issue
        // or server is down. Let's try to use cached data if available.
        if (window.caches && errorStack.includes('fetch')) {
            console.log('Attempting to use cached data...');
            // Implementation would depend on your caching strategy
        }
    }

    // Recover from Firebase errors
    function recoverFromFirebaseError(error, errorMessage, errorStack) {
        console.log('Attempting to recover from Firebase error...');

        // Use the firebase safe init if available
        if (window.firebaseSafeInit) {
            console.log('Using Firebase Safe Init to recover...');
            window.firebaseSafeInit.recover();
        }
    }

    // Recover from parsing errors
    function recoverFromParsingError(error, errorMessage, errorStack) {
        console.log('Attempting to recover from parsing error...');

        // Patch JSON.parse to be more resilient
        patchJSONParse();

        // If this is a fetch or XHR related parsing error, patch those too
        if (errorStack.includes('fetch') || errorStack.includes('XMLHttpRequest')) {
            patchFetchPrototype();
            patchXHRPrototype();
        }
    }

    // Utility functions

    // Show error notification
    function showErrorNotification(message, onClose) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';

        notification.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <div class="error-close">×</div>
            </div>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f44336;
            color: white;
            padding: 16px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Add close handler
        const closeBtn = notification.querySelector('.error-close');
        if (closeBtn) {
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.marginLeft = '8px';
            closeBtn.addEventListener('click', function () {
                notification.remove();
                if (onClose) onClose();
            });
        }

        // Auto-remove after 8 seconds
        setTimeout(function () {
            if (document.body.contains(notification)) {
                notification.remove();
                if (onClose) onClose();
            }
        }, 8000);
    }

    // Show offline message
    function showOfflineMessage() {
        // Create offline notification if not already shown
        if (document.querySelector('.offline-notification')) {
            return;
        }

        const notification = document.createElement('div');
        notification.className = 'offline-notification';

        notification.innerHTML = `
            <div class="offline-content">
                <div class="offline-icon">📶</div>
                <div class="offline-message">
                    <strong>You're offline</strong>
                    <p>Please check your internet connection</p>
                </div>
            </div>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: #333;
            color: white;
            padding: 16px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
        `;

        document.body.appendChild(notification);

        // Remove when back online
        window.addEventListener('online', function () {
            if (document.body.contains(notification)) {
                notification.remove();

                // Show back online message
                showOnlineMessage();
            }
        });
    }

    // Show online message
    function showOnlineMessage() {
        const notification = document.createElement('div');
        notification.className = 'online-notification';

        notification.innerHTML = `
            <div class="online-content">
                <div class="online-icon">✅</div>
                <div class="online-message">
                    <strong>You're back online</strong>
                </div>
            </div>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 16px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 10000;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(function () {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 3000);
    }

    // Patch fetch prototype
    function patchFetchPrototype() {
        console.log('Patching fetch prototype...');

        // Only patch if not already patched
        if (window._fetchPatched) return;
        window._fetchPatched = true;

        const originalFetch = window.fetch;

        window.fetch = async function (...args) {
            try {
                const response = await originalFetch.apply(this, args);

                // If response is not ok (not 2xx), throw an error
                if (!response.ok) {
                    const contentType = response.headers.get('content-type');

                    if (contentType && contentType.includes('text/html')) {
                        // Server returned HTML when probably should have returned JSON
                        throw new Error('Server returned HTML instead of expected data format');
                    }
                }

                // Create a copy of the response to patch its methods
                const responseClone = response.clone();

                // Patch the json method to handle HTML responses
                const originalJson = response.json;
                response.json = async function () {
                    try {
                        return await originalJson.apply(this);
                    } catch (error) {
                        console.warn('Error parsing JSON response, attempting to recover...');

                        // Try to read as text
                        const text = await responseClone.text();

                        if (text.trim().startsWith('<')) {
                            throw new Error('Server returned HTML instead of JSON');
                        }

                        try {
                            // Try to manually parse the text
                            return JSON.parse(text);
                        } catch (parseError) {
                            // Re-throw the original error
                            throw error;
                        }
                    }
                };

                return response;
            } catch (error) {
                console.error('Fetch error:', error);
                throw error;
            }
        };

        console.log('Fetch prototype patched');
    }

    // Patch XMLHttpRequest prototype
    function patchXHRPrototype() {
        console.log('Patching XMLHttpRequest prototype...');

        // Only patch if not already patched
        if (window._xhrPatched) return;
        window._xhrPatched = true;

        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        // Save the original methods
        XMLHttpRequest.prototype.open = function (...args) {
            this._method = args[0];
            this._url = args[1];
            return originalOpen.apply(this, args);
        };

        XMLHttpRequest.prototype.send = function (...args) {
            const xhr = this;

            // Save original onreadystatechange
            const originalOnReadyStateChange = xhr.onreadystatechange;

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    const contentType = xhr.getResponseHeader('Content-Type');

                    // Check if we expected JSON but got HTML
                    if (contentType && contentType.includes('application/json')) {
                        const responseText = xhr.responseText;

                        if (responseText && responseText.trim().startsWith('<')) {
                            console.error('XHR error: Server returned HTML when JSON was expected');

                            // Create a custom error event
                            const errorEvent = new ErrorEvent('error', {
                                error: new Error('XHR error: Unexpected HTML response'),
                                message: 'XHR error: Unexpected HTML response',
                                filename: window.location.href,
                                lineno: 1,
                                colno: 1
                            });

                            // Dispatch the error event
                            window.dispatchEvent(errorEvent);
                        }
                    }
                }

                // Call the original onreadystatechange
                if (originalOnReadyStateChange) {
                    originalOnReadyStateChange.apply(this, arguments);
                }
            };

            return originalSend.apply(this, args);
        };

        console.log('XMLHttpRequest prototype patched');
    }

    // Patch JSON.parse
    function patchJSONParse() {
        console.log('Patching JSON.parse...');

        // Only patch if not already patched
        if (window._jsonParsePatched) return;
        window._jsonParsePatched = true;

        const originalJSONParse = JSON.parse;

        JSON.parse = function (text, reviver) {
            try {
                return originalJSONParse.call(JSON, text, reviver);
            } catch (error) {
                console.warn('JSON.parse error, attempting to recover...');

                // Check if the text starts with HTML tags
                if (text && text.trim().startsWith('<')) {
                    throw new Error('Unexpected HTML in JSON: ' + error.message);
                }

                // Try some common recovery strategies

                // 1. Try to fix unquoted keys
                try {
                    const fixedText = text.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
                    return originalJSONParse.call(JSON, fixedText, reviver);
                } catch (e) {
                    // If that didn't work, continue to next strategy
                }

                // 2. Try to fix single quotes instead of double quotes
                try {
                    const fixedText = text.replace(/'/g, '"');
                    return originalJSONParse.call(JSON, fixedText, reviver);
                } catch (e) {
                    // If that didn't work, re-throw the original error
                    throw error;
                }
            }
        };

        console.log('JSON.parse patched');
    }

    // Initialize immediately
    patchFetchPrototype();
    patchXHRPrototype();
    patchJSONParse();

    // Listen for online/offline events
    window.addEventListener('offline', function () {
        console.log('Device went offline');
        showOfflineMessage();
    });

    window.addEventListener('online', function () {
        console.log('Device back online');
    });

    // Export the module for debugging
    window.errorMonitor = {
        errorTracker,
        patchFetch: patchFetchPrototype,
        patchXHR: patchXHRPrototype,
        patchJSONParse: patchJSONParse
    };
})();