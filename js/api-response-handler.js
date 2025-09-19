/**
 * API Response Handler
 * 
 * This utility provides better handling of API responses, specifically:
 * 1. Detecting unexpected HTML responses (e.g. the "Unexpected token <" issue)
 * 2. Proper content-type checking and validation
 * 3. Error handling for network issues
 * 4. Authentication token handling
 * 
 * This should be used by all components that make API requests.
 */

(function () {
    console.log('🌐 API Response Handler: Initializing...');

    // Store global API state
    const apiState = {
        initialized: false,
        baseUrl: window.API_BASE_URL || '',
        defaultHeaders: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        authToken: window._authToken || localStorage.getItem('jwt_token') || localStorage.getItem('authToken'),
        networkErrors: 0,
        serverErrors: 0,
        lastError: null
    };

    /**
     * Process API response with enhanced error handling
     * @param {Response} response - The fetch response object
     * @param {Object} options - Options for processing
     * @returns {Promise<Object>} The processed response data
     */
    function processApiResponse(response, options = {}) {
        // Default options
        const settings = {
            requireAuth: false,
            requireJson: true,
            acceptHtml: false,
            retryCount: 0,
            ...options
        };

        return new Promise((resolve, reject) => {
            // Check if response exists
            if (!response) {
                const error = new Error('No response received from server');
                logApiError('no-response', error);
                reject(error);
                return;
            }

            // Check HTTP status
            if (!response.ok) {
                handleHttpError(response, settings).then(reject).catch(reject);
                return;
            }

            // Check content type for unexpected HTML responses
            const contentType = response.headers.get('content-type') || '';

            if (settings.requireJson && !contentType.includes('application/json')) {
                if (contentType.includes('text/html') && !settings.acceptHtml) {
                    // This is likely the "Unexpected token <" issue
                    handleHtmlResponse(response).then(reject).catch(reject);
                    return;
                }

                // Log warning about unexpected content type
                console.warn(`⚠️ Unexpected content type: ${contentType}`);
            }

            // Process the response based on content type
            if (contentType.includes('application/json')) {
                response.json()
                    .then(data => {
                        // Check for API-specific error structure
                        if (data && data.error) {
                            const apiError = new Error(data.error.message || 'API returned an error');
                            apiError.code = data.error.code || 'api-error';
                            apiError.details = data.error.details;
                            apiError.status = response.status;
                            apiError.response = response;
                            apiError.data = data;

                            logApiError('api-error', apiError);
                            reject(apiError);
                            return;
                        }

                        // Success!
                        resolve(data);
                    })
                    .catch(error => {
                        // JSON parsing error
                        error.message = `JSON parsing error: ${error.message}`;
                        error.response = response;
                        error.status = response.status;

                        logApiError('json-parse', error);

                        // Try to get the response as text instead
                        response.text()
                            .then(text => {
                                error.responseText = text;
                                reject(error);
                            })
                            .catch(() => reject(error));
                    });
            } else {
                // For non-JSON responses, return the text
                response.text()
                    .then(text => {
                        if (settings.requireJson) {
                            try {
                                // Try to parse as JSON anyway
                                const data = JSON.parse(text);
                                resolve(data);
                            } catch (jsonError) {
                                // Not JSON, return as text if allowed
                                if (settings.acceptHtml) {
                                    resolve({ text });
                                } else {
                                    const error = new Error('Expected JSON but got text response');
                                    error.status = response.status;
                                    error.responseText = text;
                                    error.contentType = contentType;

                                    logApiError('invalid-content-type', error);
                                    reject(error);
                                }
                            }
                        } else {
                            // Text response was expected
                            resolve({ text });
                        }
                    })
                    .catch(error => {
                        error.message = `Text parsing error: ${error.message}`;
                        error.response = response;
                        error.status = response.status;

                        logApiError('text-parse', error);
                        reject(error);
                    });
            }
        });
    }

    /**
     * Handle HTTP error responses
     * @param {Response} response - The error response
     * @param {Object} settings - Processing options
     * @returns {Promise<Error>} A promise that resolves to an error
     */
    function handleHttpError(response, settings) {
        return new Promise((resolve, reject) => {
            const status = response.status;

            // Create base error
            const error = new Error(`HTTP Error ${status}`);
            error.status = status;
            error.response = response;

            // Process based on status code
            if (status === 401 || status === 403) {
                // Authentication error
                error.code = 'auth-error';
                error.message = status === 401 ? 'Unauthorized' : 'Forbidden';

                // Try to refresh auth token if this is an auth error
                if (settings.requireAuth && window.firebaseServices &&
                    typeof firebase !== 'undefined' && firebase.auth) {

                    const currentUser = firebase.auth().currentUser;
                    if (currentUser) {
                        // Try to get a fresh token
                        currentUser.getIdToken(true) // true forces a refresh
                            .then(newToken => {
                                // Update stored token
                                apiState.authToken = newToken;
                                localStorage.setItem('jwt_token', newToken);
                                localStorage.setItem('authToken', newToken);
                                window._authToken = newToken;

                                console.log('🔄 Auth token refreshed after 401/403 error');
                                error.message += ' (Token refreshed, please retry)';
                                error.tokenRefreshed = true;
                            })
                            .catch(tokenError => {
                                console.error('❌ Failed to refresh auth token:', tokenError);
                                error.tokenError = tokenError.message;
                            })
                            .finally(() => {
                                logApiError('auth', error);
                                resolve(error);
                            });

                        return; // Don't resolve immediately, wait for the token refresh
                    }
                }
            } else if (status === 404) {
                error.code = 'not-found';
                error.message = 'Resource not found';
            } else if (status >= 500) {
                error.code = 'server-error';
                error.message = 'Server error';
                apiState.serverErrors++;

                // Check if we should report server errors
                if (window.errorMonitor && typeof window.errorMonitor.captureError === 'function') {
                    window.errorMonitor.captureError(error, 'api-server-error');
                }
            } else {
                error.code = 'http-error';
            }

            // Try to get more info from response body
            response.text()
                .then(text => {
                    try {
                        // Try to parse as JSON
                        const data = JSON.parse(text);
                        error.responseData = data;

                        // Extract more detailed error info if available
                        if (data && data.error) {
                            error.message = data.error.message || error.message;
                            error.code = data.error.code || error.code;
                            error.details = data.error.details;
                        }
                    } catch (jsonError) {
                        // Not JSON, store as text
                        error.responseText = text;

                        // Check if this is an HTML response
                        if (text.includes('<html') || text.includes('<!DOCTYPE')) {
                            error.isHtmlResponse = true;

                            // This could be the "Unexpected token <" issue
                            error.code = 'html-response';
                            error.message = 'Received HTML instead of JSON (server error page)';

                            // Check for specific server error patterns in the HTML
                            if (text.includes('server error') || text.includes('500')) {
                                error.serverErrorPage = true;
                            } else if (text.includes('not found') || text.includes('404')) {
                                error.notFoundPage = true;
                            } else if (text.includes('maintenance')) {
                                error.maintenancePage = true;
                            }
                        }
                    }

                    logApiError('http', error);
                    resolve(error);
                })
                .catch(parseError => {
                    // Couldn't read response body
                    error.parseError = parseError.message;
                    logApiError('http', error);
                    resolve(error);
                });
        });
    }

    /**
     * Handle unexpected HTML responses
     * @param {Response} response - The HTML response
     * @returns {Promise<Error>} A promise that resolves to an error
     */
    function handleHtmlResponse(response) {
        return new Promise((resolve, reject) => {
            response.text()
                .then(html => {
                    const error = new Error('Received HTML response when expecting JSON');
                    error.code = 'unexpected-html';
                    error.status = response.status;
                    error.responseText = html.substring(0, 500) + '...'; // Truncate for logging
                    error.contentType = response.headers.get('content-type');

                    // Try to extract useful info from the HTML
                    let titleMatch = html.match(/<title>(.*?)<\/title>/i);
                    if (titleMatch && titleMatch[1]) {
                        error.htmlTitle = titleMatch[1];
                        error.message = `HTML response: ${titleMatch[1]}`;
                    }

                    // Check for specific error pages
                    if (html.includes('server error') || html.includes('500')) {
                        error.serverErrorPage = true;
                    } else if (html.includes('not found') || html.includes('404')) {
                        error.notFoundPage = true;
                    } else if (html.includes('maintenance')) {
                        error.maintenancePage = true;
                    }

                    // Report this error specifically since it's often the cause of "Unexpected token '<'" errors
                    if (window.errorMonitor && typeof window.errorMonitor.captureError === 'function') {
                        window.errorMonitor.captureError(error, 'api-html-response');
                    }

                    // Dispatch specific event for unexpected HTML response
                    const event = new CustomEvent('api-unexpected-html', {
                        detail: {
                            error,
                            url: response.url,
                            status: response.status
                        }
                    });
                    document.dispatchEvent(event);

                    logApiError('html-response', error);
                    resolve(error);
                })
                .catch(textError => {
                    // Couldn't even read the HTML
                    const error = new Error(`Failed to read HTML response: ${textError.message}`);
                    error.code = 'html-parse-error';
                    error.status = response.status;
                    error.originalError = textError;

                    logApiError('html-parse', error);
                    resolve(error);
                });
        });
    }

    /**
     * Log API error for monitoring and debugging
     * @param {string} category - The error category
     * @param {Error} error - The error object
     */
    function logApiError(category, error) {
        // Store the last error
        apiState.lastError = {
            category,
            message: error.message,
            code: error.code,
            status: error.status,
            timestamp: new Date().toISOString()
        };

        // Log to console
        console.error(`❌ API ${category} error:`, error);

        // Track network errors
        if (category === 'no-response' || error.message.includes('network')) {
            apiState.networkErrors++;
        }
    }

    /**
     * Make API request with enhanced error handling
     * @param {string} url - The API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} The API response data
     */
    function makeApiRequest(url, options = {}) {
        // Default options
        const fetchOptions = {
            method: 'GET',
            headers: { ...apiState.defaultHeaders },
            ...options
        };

        // Add auth token if available
        if (apiState.authToken) {
            fetchOptions.headers.Authorization = `Bearer ${apiState.authToken}`;
        }

        // Handle relative URLs
        const fullUrl = url.startsWith('http') ? url : `${apiState.baseUrl}${url}`;

        // Processing options
        const processingOptions = {
            requireAuth: options.requireAuth || false,
            requireJson: options.requireJson !== false,
            acceptHtml: options.acceptHtml || false,
            retryCount: options.retryCount || 0
        };

        return fetch(fullUrl, fetchOptions)
            .then(response => processApiResponse(response, processingOptions))
            .catch(error => {
                // Handle network errors
                if (error.name === 'TypeError' && error.message.includes('network')) {
                    apiState.networkErrors++;
                    error.code = 'network-error';

                    // Check if the client is offline
                    if (!navigator.onLine) {
                        error.code = 'offline';
                        error.message = 'You appear to be offline. Please check your internet connection.';
                    }
                }

                logApiError('request', error);
                throw error;
            });
    }

    // Create the public API
    window.apiResponseHandler = {
        // Core functionality
        process: processApiResponse,
        request: makeApiRequest,

        // Helper methods
        getAuthToken: () => apiState.authToken,

        setAuthToken: (token) => {
            apiState.authToken = token;
            localStorage.setItem('jwt_token', token);
            localStorage.setItem('authToken', token); // For backward compatibility
            window._authToken = token;
        },

        clearAuthToken: () => {
            apiState.authToken = null;
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('authToken');
            window._authToken = null;
        },

        setBaseUrl: (url) => {
            apiState.baseUrl = url;
        },

        // Status methods
        getStatus: () => ({
            networkErrors: apiState.networkErrors,
            serverErrors: apiState.serverErrors,
            lastError: apiState.lastError,
            online: navigator.onLine
        }),

        // Detect HTML responses in JSON data to prevent "Unexpected token '<'" errors
        validateJsonResponse: (text) => {
            // Check for common HTML indicators
            if (typeof text !== 'string') return true;

            const firstNonWhitespace = text.trim().charAt(0);

            if (firstNonWhitespace === '<') {
                // Likely HTML response
                const error = new Error('Received HTML response when expecting JSON');
                error.code = 'unexpected-html';
                error.responseText = text.substring(0, 500) + '...'; // Truncate for logging

                logApiError('json-validation', error);

                // Report to error monitoring
                if (window.errorMonitor && typeof window.errorMonitor.captureError === 'function') {
                    window.errorMonitor.captureError(error, 'api-unexpected-html-in-json');
                }

                return false;
            }

            return true;
        }
    };

    // Initialize the response handler
    function initApiResponseHandler() {
        apiState.initialized = true;

        // Try to get base URL from global config
        if (window.API_CONFIG && window.API_CONFIG.BASE_URL) {
            apiState.baseUrl = window.API_CONFIG.BASE_URL;
        }

        // Monitor online/offline events
        window.addEventListener('online', () => {
            console.log('🌐 Network is online');
            const event = new CustomEvent('api-network-status', {
                detail: { online: true }
            });
            document.dispatchEvent(event);
        });

        window.addEventListener('offline', () => {
            console.log('🔌 Network is offline');
            const event = new CustomEvent('api-network-status', {
                detail: { online: false }
            });
            document.dispatchEvent(event);
        });

        // Listen for auth changes to update token
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    user.getIdToken().then(token => {
                        apiState.authToken = token;
                    });
                } else {
                    apiState.authToken = null;
                }
            });
        }

        console.log('🌐 API Response Handler: Initialized');
    }

    // Initialize when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApiResponseHandler);
    } else {
        initApiResponseHandler();
    }
})();