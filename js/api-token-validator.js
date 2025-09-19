/**
 * API Response Token Validator
 * 
 * This script adds a layer of validation for API responses to prevent the
 * "Unexpected token '<'" error by checking response types before parsing.
 * 
 * It provides utility functions for safely handling API responses and
 * validation functions for checking tokens in responses.
 */

(function () {
    console.log('🔍 API Token Validator: Initializing');

    // Global utility for safely handling API responses
    window.apiTokenValidator = {
        /**
         * Safely parse JSON with validation to prevent token errors
         * @param {string} text - Text to parse as JSON
         * @param {boolean} strict - Whether to throw error on invalid JSON
         * @returns {Object|null} Parsed object or null if invalid
         */
        safeParseJSON: function (text, strict = false) {
            if (!text) return null;

            // Check if text looks like HTML
            if (text.trim().startsWith('<') || text.includes('<!DOCTYPE html>')) {
                console.error('❌ API Token Validator: Received HTML when expecting JSON', text.substring(0, 200));

                if (strict) {
                    throw new Error('Received HTML when expecting JSON');
                }

                return null;
            }

            try {
                return JSON.parse(text);
            } catch (error) {
                console.error('❌ API Token Validator: JSON parse error', error);

                if (strict) {
                    throw error;
                }

                return null;
            }
        },

        /**
         * Safely process a fetch Response object to handle HTML and JSON properly
         * @param {Response} response - Fetch API response object
         * @returns {Promise<Object>} Parsed response or error object
         */
        safeProcessResponse: async function (response) {
            try {
                // Check content type first
                const contentType = response.headers.get('content-type');

                // If it's explicitly HTML, handle accordingly
                if (contentType && contentType.includes('text/html')) {
                    console.warn('⚠️ API Token Validator: Received HTML response', {
                        status: response.status,
                        url: response.url
                    });

                    const text = await response.text();
                    return {
                        success: false,
                        error: 'Received HTML response when expecting JSON',
                        htmlResponse: text.substring(0, 500), // First 500 chars for debugging
                        status: response.status
                    };
                }

                // If it's JSON or unknown, try to parse as JSON first
                try {
                    const result = await response.json();
                    return {
                        success: true,
                        data: result,
                        status: response.status
                    };
                } catch (jsonError) {
                    // If JSON parsing fails, try to get text
                    const text = await response.clone().text();

                    // Check if it's actually HTML
                    if (text.trim().startsWith('<') || text.includes('<!DOCTYPE html>')) {
                        console.error('❌ API Token Validator: Received HTML when content-type indicated JSON', {
                            status: response.status,
                            url: response.url
                        });

                        return {
                            success: false,
                            error: 'Received HTML when expecting JSON',
                            htmlResponse: text.substring(0, 500),
                            status: response.status
                        };
                    }

                    // It's not HTML but JSON parsing failed for some other reason
                    return {
                        success: false,
                        error: jsonError.message,
                        rawResponse: text.substring(0, 500),
                        status: response.status
                    };
                }
            } catch (error) {
                console.error('❌ API Token Validator: Error processing response', error);

                return {
                    success: false,
                    error: error.message,
                    status: response ? response.status : 0
                };
            }
        },

        /**
         * Enhanced fetch that validates responses before parsing
         * @param {string} url - URL to fetch
         * @param {Object} options - Fetch options
         * @returns {Promise<Object>} Processed response
         */
        safeFetch: async function (url, options = {}) {
            try {
                const response = await fetch(url, options);
                return await this.safeProcessResponse(response);
            } catch (error) {
                console.error('❌ API Token Validator: Fetch error', error);

                return {
                    success: false,
                    error: error.message,
                    status: 0
                };
            }
        },

        /**
         * Validate a token response from an authentication endpoint
         * @param {Object} response - Response to validate
         * @returns {Object} Validated response with success flag
         */
        validateTokenResponse: function (response) {
            // Check if response is HTML instead of JSON
            if (typeof response === 'string' &&
                (response.trim().startsWith('<') || response.includes('<!DOCTYPE html>'))) {

                console.error('❌ API Token Validator: Received HTML in token response');

                return {
                    success: false,
                    error: 'Invalid token format: HTML received',
                    isHtml: true
                };
            }

            // Check if it's already an object (might have been pre-parsed)
            if (typeof response === 'object' && response !== null) {
                // Check if it looks like a valid token response
                if (response.token || response.access_token || response.idToken) {
                    return {
                        success: true,
                        token: response.token || response.access_token || response.idToken,
                        userData: response.user || response.userData || {}
                    };
                }

                // Check if it's an error response
                if (response.error || response.message) {
                    return {
                        success: false,
                        error: response.error || response.message
                    };
                }

                // It's an object but doesn't look like a valid token response
                console.warn('⚠️ API Token Validator: Response is an object but lacks token fields', response);

                return {
                    success: false,
                    error: 'Invalid token response format',
                    response: response
                };
            }

            // If it's a string but not HTML, try parsing as JSON
            if (typeof response === 'string') {
                try {
                    const parsedResponse = JSON.parse(response);
                    // Recursively validate the parsed response
                    return this.validateTokenResponse(parsedResponse);
                } catch (error) {
                    console.error('❌ API Token Validator: Failed to parse token response as JSON', error);

                    return {
                        success: false,
                        error: 'Failed to parse token response',
                        parseError: error.message
                    };
                }
            }

            // If we get here, it's an unknown format
            console.error('❌ API Token Validator: Unknown token response format', response);

            return {
                success: false,
                error: 'Unknown token response format',
                response: typeof response
            };
        }
    };

    // Apply patches to global fetch to avoid token errors
    patchGlobalFetch();

    /**
     * Patch global fetch to handle token validation
     */
    function patchGlobalFetch() {
        // Only patch if not already patched by token validator
        if (window._tokenValidatorFetchPatched) return;
        window._tokenValidatorFetchPatched = true;

        const originalFetch = window.fetch;

        window.fetch = async function (...args) {
            const url = args[0];
            const options = args[1] || {};

            // Only intercept auth-related requests or specific APIs
            const isAuthRequest = typeof url === 'string' && (
                url.includes('/auth') ||
                url.includes('/login') ||
                url.includes('/token') ||
                url.includes('/signin') ||
                url.includes('/signup')
            );

            if (isAuthRequest) {
                console.log('🔍 API Token Validator: Intercepting auth request', url);

                try {
                    const response = await originalFetch.apply(this, args);

                    // For auth requests, we want to validate the response format
                    // Clone the response so we can read it multiple times if needed
                    const clonedResponse = response.clone();

                    // Check content type
                    const contentType = response.headers.get('content-type');

                    // If content type indicates HTML, that's a problem for auth requests
                    if (contentType && contentType.includes('text/html')) {
                        console.error('❌ API Token Validator: Auth endpoint returned HTML response', {
                            url,
                            status: response.status
                        });

                        // Create a custom response with an error
                        const errorData = {
                            success: false,
                            error: 'Authentication server returned HTML instead of JSON',
                            status: response.status
                        };

                        // We create a new Response object with our error data
                        return new Response(JSON.stringify(errorData), {
                            status: 500,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                    }

                    // Override the json method to catch parsing errors
                    const originalJson = response.json;

                    response.json = async function () {
                        try {
                            return await originalJson.apply(this);
                        } catch (error) {
                            console.error('❌ API Token Validator: Error parsing auth response as JSON', error);

                            // Check if it's HTML
                            const text = await clonedResponse.text();

                            if (text.trim().startsWith('<') || text.includes('<!DOCTYPE html>')) {
                                throw new Error('Authentication server returned HTML instead of JSON');
                            }

                            throw error;
                        }
                    };

                    return response;
                } catch (error) {
                    console.error('❌ API Token Validator: Auth request failed', error);
                    throw error;
                }
            }

            // For non-auth requests, use the original fetch
            return originalFetch.apply(this, args);
        };

        console.log('✅ API Token Validator: Patched global fetch');
    }

    console.log('✅ API Token Validator: Initialized');
})();