/**
 * CORS Error Handler for Firebase Integration
 * 
 * This script enhances our Firebase integration to detect and handle CORS errors, which can
 * often manifest as "Unexpected token '<'" errors when Firebase API calls receive HTML
 * error pages instead of JSON due to CORS restrictions.
 */

(function () {
    console.log('🔄 CORS Error Handler: Initializing...');

    // Store references to original methods we'll be modifying
    const originalFetch = window.fetch;

    // Track CORS errors
    const corsState = {
        errors: 0,
        lastError: null,
        recoveryAttempts: 0,
        corsHeaders: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    };

    /**
     * Checks if an error is likely a CORS error
     * @param {Error} error - The error to check
     * @returns {boolean} True if likely a CORS error
     */
    function isCorsError(error) {
        // Common CORS error signatures
        const corsSignatures = [
            // Error messages
            'has been blocked by CORS policy',
            'Access-Control-Allow-Origin',
            'cross-origin',
            'CORS',

            // Network error followed by HTML can indicate CORS issue
            'Failed to fetch',
            'NetworkError',

            // When servers respond with HTML error pages due to CORS issues
            'Unexpected token \'<\'',
            'Unexpected token <',
            'SyntaxError: Unexpected token',

            // Safari specific
            'Preflight response is not successful'
        ];

        // Check error message against signatures
        if (error && error.message) {
            for (const signature of corsSignatures) {
                if (error.message.includes(signature)) {
                    return true;
                }
            }
        }

        // Check if the response was HTML when JSON was expected
        if (error.isHtmlResponse || error.htmlTitle ||
            (error.responseText && error.responseText.trim().startsWith('<'))) {
            return true;
        }

        return false;
    }

    /**
     * Handle a CORS error
     * @param {Error} error - The CORS error
     * @param {string} url - The URL that caused the error
     * @param {Object} options - The original request options
     * @returns {Promise} A promise that resolves to the result or rejects with an enhanced error
     */
    function handleCorsError(error, url, options = {}) {
        corsState.errors++;
        corsState.lastError = {
            timestamp: new Date().toISOString(),
            url,
            message: error.message,
            responseText: error.responseText ? error.responseText.substring(0, 200) : null
        };

        console.error('🚫 CORS Error detected:', error);

        // Create a more informative error
        const corsError = new Error(`CORS error when accessing ${url}: ${error.message}`);
        corsError.originalError = error;
        corsError.url = url;
        corsError.isCors = true;

        // Enhanced error information
        corsError.possibleReasons = [
            'Firebase services accessed from unauthorized domain',
            'Missing or incorrect CORS configuration on the server',
            'Network or proxy interference',
            'Incorrect API endpoint',
            'Server returning HTML error page instead of proper CORS headers'
        ];

        corsError.solutions = [
            'Ensure the domain is authorized in Firebase Console',
            'Add proper CORS headers to the server response',
            'Use a CORS proxy for development',
            'Verify API endpoint URL is correct',
            'Check browser console for specific CORS error details'
        ];

        // Attempt recovery based on error type
        corsState.recoveryAttempts++;

        // Dispatch event for monitoring
        const corsEvent = new CustomEvent('firebase-cors-error', {
            detail: {
                error: corsError,
                url,
                timestamp: new Date().toISOString(),
                count: corsState.errors
            }
        });
        document.dispatchEvent(corsEvent);

        // Log to monitoring system if available
        if (window.errorMonitor && typeof window.errorMonitor.captureError === 'function') {
            window.errorMonitor.captureError(corsError, 'firebase-cors-error');
        }

        // For now, we can't actually fix CORS errors automatically
        // Just provide better diagnostics and error messages
        return Promise.reject(corsError);
    }

    /**
     * Enhanced fetch that detects CORS errors
     * @param {string} url - The URL to fetch
     * @param {Object} options - Fetch options
     * @returns {Promise} A promise that resolves to the fetch response
     */
    function corsAwareFetch(url, options = {}) {
        // First, check if this URL is likely to have CORS issues with Firebase
        const isFirebaseUrl = url.includes('firebaseio.com') ||
            url.includes('googleapis.com') ||
            url.includes('firebaseapp.com') ||
            url.includes('identitytoolkit.googleapis.com');

        // Only intercept Firebase URLs
        if (!isFirebaseUrl) {
            return originalFetch(url, options);
        }

        // Add CORS headers if needed for Firebase requests
        const enhancedOptions = { ...options };
        if (!enhancedOptions.headers) {
            enhancedOptions.headers = {};
        }

        // Call original fetch but catch errors
        return originalFetch(url, enhancedOptions)
            .then(response => {
                // Check response type for HTML which might indicate CORS error
                const contentType = response.headers.get('content-type') || '';

                if (!response.ok && contentType.includes('text/html')) {
                    // This might be a CORS error returning an HTML error page
                    return response.text().then(text => {
                        if (text.includes('<html') || text.startsWith('<!DOCTYPE')) {
                            const corsError = new Error('Received HTML response instead of JSON (possible CORS error)');
                            corsError.responseText = text.substring(0, 500);
                            corsError.status = response.status;
                            corsError.isHtmlResponse = true;

                            return handleCorsError(corsError, url, enhancedOptions);
                        }

                        // Not HTML or not a CORS issue, create new response with original content
                        return response;
                    });
                }

                return response;
            })
            .catch(error => {
                if (isCorsError(error)) {
                    return handleCorsError(error, url, enhancedOptions);
                }

                // Not a CORS error, pass through
                throw error;
            });
    }

    // Replace the global fetch with our enhanced version
    window.fetch = corsAwareFetch;

    // Create the public API
    window.corsErrorHandler = {
        isCorsError,
        handleCorsError,
        getStatus: () => ({
            errors: corsState.errors,
            lastError: corsState.lastError,
            recoveryAttempts: corsState.recoveryAttempts
        }),

        // Helper to check if a domain is properly configured for Firebase
        checkDomainCors: (domain) => {
            const url = `https://cors-test.firebaseapp.com/check?domain=${encodeURIComponent(domain)}`;

            return originalFetch(url)
                .then(response => response.json())
                .then(data => {
                    return {
                        authorized: data.authorized || false,
                        status: data.status,
                        message: data.message || 'Unknown status'
                    };
                })
                .catch(error => {
                    console.error('Error checking domain CORS status:', error);
                    return {
                        authorized: false,
                        status: 'error',
                        message: error.message
                    };
                });
        },

        // Display helpful guidance for CORS errors
        showCorsHelp: () => {
            console.log('%c 🚫 Firebase CORS Error Help ', 'background: #c62828; color: white; padding: 2px 5px; border-radius: 2px;');
            console.log('%cPossible causes:', 'font-weight: bold;');
            console.log('1. Your domain is not authorized in Firebase Console');
            console.log('2. You\'re using localhost or file:// URL (not allowed by default)');
            console.log('3. Missing or incorrect CORS configuration');
            console.log('4. Network or proxy interference');
            console.log('5. Server returning HTML error page instead of proper CORS headers');

            console.log('%cSolutions:', 'font-weight: bold;');
            console.log('1. Add your domain to Firebase Console: Project Settings → Authorized domains');
            console.log('2. Use Firebase Local Emulator for local development');
            console.log('3. Add proper CORS headers to your server responses');
            console.log('4. Verify API endpoint URLs are correct');
            console.log('5. For development, try a CORS proxy or browser extension to bypass CORS');
        }
    };

    console.log('✅ CORS Error Handler: Initialized');

    // Automatically register with error monitor if it exists
    if (window.errorMonitor && typeof window.errorMonitor.registerHandler === 'function') {
        window.errorMonitor.registerHandler('cors', function (error) {
            return isCorsError(error);
        });
    }
})();