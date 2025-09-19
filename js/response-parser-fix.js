/**
 * Response Parser Fix
 * 
 * This script fixes the common "Unexpected token '<'" error by patching
 * the fetch API to properly handle HTML responses when JSON is expected.
 */

(function () {
    console.log('🛠️ Applying Response Parser Fix...');

    // Backup original fetch
    const originalFetch = window.fetch;

    // Override fetch to handle HTML responses better
    window.fetch = async function (...args) {
        console.log('🌐 Enhanced fetch called with URL:', args[0]);

        try {
            // Call original fetch
            const response = await originalFetch.apply(this, args);

            // Store original response methods
            const originalJson = response.json;
            const originalText = response.text;

            // Override response.json()
            response.json = async function () {
                try {
                    return await originalJson.apply(this);
                } catch (jsonError) {
                    // If JSON parsing fails, try to get the response as text
                    console.warn('⚠️ JSON parsing failed, attempting to get response as text');
                    const text = await originalText.apply(this);

                    // Check if it's HTML (which would cause the "Unexpected token '<'" error)
                    if (text.trim().startsWith('<') || text.includes('<!DOCTYPE html>')) {
                        console.error('🔴 Server returned HTML when JSON was expected:', text.substring(0, 150) + '...');

                        // Create a user-friendly error
                        const error = new Error('API returned HTML instead of JSON. The server may be misconfigured or the API endpoint may be incorrect.');
                        error.htmlResponse = text;
                        error.status = this.status;
                        error.statusText = this.statusText;
                        throw error;
                    }

                    // Try to parse the text as JSON, or throw the original error
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        console.error('🔴 Response is neither valid JSON nor HTML:', text);
                        throw jsonError; // Throw the original error
                    }
                }
            };

            return response;
        } catch (fetchError) {
            console.error('🔴 Fetch error:', fetchError);
            throw fetchError;
        }
    };

    // Patch XMLHttpRequest to handle HTML responses
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (...args) {
        this._requestMethod = args[0];
        this._requestUrl = args[1];
        return originalXhrOpen.apply(this, args);
    };

    XMLHttpRequest.prototype.send = function (...args) {
        const xhr = this;
        const originalOnReadyStateChange = xhr.onreadystatechange;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                // Check if we're expecting JSON based on content-type
                const contentType = xhr.getResponseHeader('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const responseText = xhr.responseText;

                        // Check if it's HTML when JSON was expected
                        if (responseText.trim().startsWith('<') || responseText.includes('<!DOCTYPE html>')) {
                            console.error('🔴 XMLHttpRequest received HTML when JSON was expected:', responseText.substring(0, 150) + '...');
                            console.warn('⚠️ Request URL that returned HTML:', xhr._requestUrl);
                        }
                    } catch (e) {
                        // Ignore parsing errors at this stage
                    }
                }
            }

            // Call the original handler
            if (originalOnReadyStateChange) {
                originalOnReadyStateChange.apply(this, arguments);
            }
        };

        return originalXhrSend.apply(this, args);
    };

    // Add global error handler for JSON parse errors
    window.addEventListener('error', function (event) {
        const errorMsg = event.message || '';

        // Check for JSON parse errors or unexpected token errors
        if (errorMsg.includes('Unexpected token') ||
            errorMsg.includes('JSON.parse') ||
            errorMsg.includes('SyntaxError') ||
            errorMsg.includes('token')) {

            console.group('🔍 Token Error Handler');
            console.warn('⚠️ Possible JSON parsing error detected:', errorMsg);
            console.log('Stack trace:', event.error ? event.error.stack : 'No stack trace available');
            console.groupEnd();

            // Show a user-friendly message if it looks like an API error
            const stack = event.error && event.error.stack ? event.error.stack : '';
            if (stack.includes('fetch') ||
                stack.includes('XMLHttpRequest') ||
                stack.includes('ajax') ||
                stack.includes('axios')) {

                // Create and show a notification
                const notification = document.createElement('div');
                notification.className = 'api-error-notification';
                notification.innerHTML = `
                    <div class="api-error-content">
                        <div class="api-error-icon">⚠️</div>
                        <div class="api-error-message">
                            <strong>API Error:</strong> There was a problem connecting to the server. 
                            Please try again or contact support if the issue persists.
                        </div>
                        <div class="api-error-close">&times;</div>
                    </div>
                `;

                // Style the notification
                Object.assign(notification.style, {
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    background: '#f44336',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    zIndex: '10000',
                    maxWidth: '350px',
                    animation: 'slideIn 0.3s ease-out'
                });

                // Add keyframes for animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);

                // Add to document
                document.body.appendChild(notification);

                // Add close functionality
                const closeBtn = notification.querySelector('.api-error-close');
                if (closeBtn) {
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.style.marginLeft = '10px';
                    closeBtn.style.fontSize = '20px';
                    closeBtn.addEventListener('click', () => {
                        notification.remove();
                    });
                }

                // Auto-remove after 8 seconds
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 8000);
            }
        }
    });

    console.log('✅ Response Parser Fix applied successfully');
})();