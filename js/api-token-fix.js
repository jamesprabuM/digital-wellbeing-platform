ok/**
 * API Token Fix for Supabase
 * 
 * This script patches the API client to properly handle Supabase token errors
 * and ensure proper response parsing.
 */

    (function () {
        console.log('🔧 Applying API Token Error Fix...');

        // Wait for API client to be available
        function waitForApiClient() {
            if (window.apiClient) {
                console.log('✅ API client detected, applying patches');
                patchApiClient();
            } else {
                console.log('⏳ Waiting for API client to load...');
                setTimeout(waitForApiClient, 100);
            }
        }

        // Patch the API client's request method to properly handle responses
        function patchApiClient() {
            // Save original request method
            const originalRequest = window.apiClient.request;

            // Override request method with improved error handling
            window.apiClient.request = async function (endpoint, options = {}) {
                try {
                    // Call Supabase client directly
                    const result = await this.client.functions.invoke(endpoint, {
                        body: options.body ? JSON.parse(options.body) : undefined,
                        headers: options.headers
                    });

                    if (result.error) throw result.error;
                    return result.data;

                } catch (error) {
                    console.error(`API Request Error (${endpoint}):`, error);

                    // Format error for user display
                    const enhancedError = new Error(
                        error.message || error.error || 'An error occurred during the API request'
                    );

                    // Add any additional error information
                    if (error.code) enhancedError.code = error.code;
                    if (error.status) enhancedError.status = error.status;

                    throw enhancedError;
                }
            };

            // Fix login method
            const originalLogin = window.apiClient.login;
            window.apiClient.login = async function (email, password) {
                try {
                    const { data, error } = await this.client.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (error) throw error;

                    // Return user data
                    return {
                        user: data.user,
                        session: data.session
                    };
                } catch (error) {
                    console.error('Login error:', error);
                    throw error;
                }
            };

            // Fix register method
            const originalRegister = window.apiClient.register;
            window.apiClient.register = async function (userData) {
                try {
                    // Register with Supabase Auth
                    const { data, error } = await this.client.auth.signUp({
                        email: userData.email,
                        password: userData.password,
                        options: {
                            data: {
                                full_name: userData.name || userData.username,
                                username: userData.username || userData.email.split('@')[0]
                            }
                        }
                    });

                    if (error) throw error;

                    // If email confirmation is not required, initialize user data
                    if (data.session) {
                        try {
                            // Initialize wellness data
                            const { error: profileError } = await this.client
                                .from('wellness_data')
                                .insert([{
                                    user_id: data.user.id,
                                    wellness_scores: {
                                        sleep: 70,
                                        exercise: 65,
                                        mindfulness: 75
                                    },
                                    streaks: {
                                        meditation: 0,
                                        exercise: 0,
                                        journaling: 0,
                                        mood_tracking: 0
                                    },
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                }]);

                            if (profileError) throw profileError;
                        } catch (initError) {
                            console.warn('Error initializing user data:', initError);
                            // Continue since the user was created successfully
                        }
                    }

                    return {
                        user: data.user,
                        session: data.session
                    };
                } catch (error) {
                    console.error('Registration error:', error);
                    throw error;
                }
            };

            console.log('✅ API client patched successfully');

            // Test the connection to make sure we have Supabase connectivity
            testSupabaseConnection();
        }

        // Test Supabase connection
        async function testSupabaseConnection() {
            if (!window.apiClient?.client) {
                console.warn('⚠️ Supabase client not initialized');
                return;
            }

            try {
                const { data, error } = await window.apiClient.client
                    .from('health_check')
                    .select('status')
                    .limit(1)
                    .single();

                if (error) throw error;

                console.log('✅ Supabase connection test successful');
            } catch (error) {
                console.warn('⚠️ Supabase connection test failed:', error);
                // Don't worry if health check table doesn't exist
                if (error.code === 'PGRST116') {
                    console.log('✅ Supabase is available (health check table not found)');
                }
            }
        }

        // Start the patch process
        waitForApiClient();
    })();