/**
 * Supabase Auth Fix
 * 
 * This script fixes Supabase authentication issues by ensuring proper
 * client initialization and adding diagnostic functions.
 */

(function() {
    console.log('🔧 Running Supabase Auth Fix...');
    
    // Wait for DOM and scripts to load
    window.addEventListener('load', function() {
        // Wait a bit to ensure all scripts are properly loaded
        setTimeout(function() {
            // Check if required components are loaded
            const supabaseLoaded = typeof supabase !== 'undefined';
            const clientLoaded = window._supabaseClient || (window.supabase && window.supabase._client);
            const authLoaded = typeof window.supabaseAuth !== 'undefined';
            
            console.log('Checking Supabase components:');
            console.log(`- Supabase global object: ${supabaseLoaded ? '✅' : '❌'}`);
            console.log(`- Supabase client: ${clientLoaded ? '✅' : '❌'}`);
            console.log(`- Supabase auth: ${authLoaded ? '✅' : '❌'}`);
            
            // Fix client initialization if needed
            if (supabaseLoaded && !clientLoaded) {
                console.log('🔧 Fixing Supabase client initialization...');
                
                try {
                    // Initialize client
                    const client = supabase.init();
                    console.log('✅ Supabase client re-initialized');
                    
                    // Check if it worked
                    setTimeout(() => {
                        const clientNowLoaded = window._supabaseClient || (window.supabase && window.supabase._client);
                        console.log(`- Client available after fix: ${clientNowLoaded ? '✅' : '❌'}`);
                    }, 500);
                } catch (error) {
                    console.error('❌ Failed to fix Supabase client:', error);
                }
            }
            
            // Fix auth system if needed
            if (clientLoaded && !authLoaded) {
                console.log('🔧 Fixing Supabase auth system...');
                
                try {
                    // Create auth instance manually
                    window.supabaseAuth = new SupabaseAuth();
                    console.log('✅ Supabase auth system re-initialized');
                    
                    // Check if it worked
                    setTimeout(() => {
                        console.log(`- Auth available after fix: ${typeof window.supabaseAuth !== 'undefined' ? '✅' : '❌'}`);
                    }, 500);
                } catch (error) {
                    console.error('❌ Failed to fix Supabase auth:', error);
                }
            }
            
            // Add diagnostic function for complete check
            window.checkSupabaseSystemStatus = function() {
                return new Promise((resolve) => {
                    // Check all components
                    const components = {
                        supabaseObject: typeof supabase !== 'undefined',
                        supabaseClient: !!(window._supabaseClient || (window.supabase && window.supabase._client)),
                        supabaseAuth: typeof window.supabaseAuth !== 'undefined',
                        authManager: typeof window.authManager !== 'undefined'
                    };
                    
                    // Check if client methods are accessible
                    let clientMethods = { getClient: false, auth: false, db: false };
                    
                    if (components.supabaseObject && typeof supabase.getClient === 'function') {
                        clientMethods.getClient = true;
                        
                        const client = supabase.getClient();
                        if (client) {
                            clientMethods.client = true;
                            
                            // Check if auth methods are available
                            if (client.auth) {
                                clientMethods.auth = true;
                            }
                        }
                    }
                    
                    // Check authentication
                    let authStatus = { initialized: false, authenticated: false, user: null };
                    
                    if (components.supabaseAuth) {
                        authStatus.initialized = window.supabaseAuth.initialized;
                        authStatus.authenticated = window.supabaseAuth.isAuthenticated();
                        authStatus.user = window.supabaseAuth.getCurrentUser();
                    }
                    
                    // Try to get session using raw client
                    let sessionCheck = { attempted: false, success: false, session: null, error: null };
                    
                    if (components.supabaseClient) {
                        const client = window._supabaseClient || window.supabase._client;
                        
                        if (client && client.auth) {
                            sessionCheck.attempted = true;
                            
                            client.auth.getSession()
                                .then(({ data, error }) => {
                                    sessionCheck.success = !error;
                                    sessionCheck.session = data?.session;
                                    sessionCheck.error = error;
                                    
                                    // Complete the report
                                    resolve({
                                        components,
                                        clientMethods,
                                        authStatus,
                                        sessionCheck,
                                        status: sessionCheck.success && sessionCheck.session ? 'authenticated' : 'not-authenticated',
                                        timestamp: new Date().toISOString()
                                    });
                                })
                                .catch(error => {
                                    sessionCheck.error = error;
                                    
                                    // Complete the report with error
                                    resolve({
                                        components,
                                        clientMethods,
                                        authStatus,
                                        sessionCheck,
                                        status: 'error',
                                        error: error.message,
                                        timestamp: new Date().toISOString()
                                    });
                                });
                        } else {
                            resolve({
                                components,
                                clientMethods,
                                authStatus,
                                sessionCheck,
                                status: 'client-incomplete',
                                timestamp: new Date().toISOString()
                            });
                        }
                    } else {
                        resolve({
                            components,
                            clientMethods,
                            authStatus,
                            sessionCheck,
                            status: 'no-client',
                            timestamp: new Date().toISOString()
                        });
                    }
                });
            };
            
            // Run check once
            window.checkSupabaseSystemStatus().then(status => {
                console.log('📊 Supabase System Status:', status);
            });
        }, 1000);
    });
})();

console.log('🔧 Supabase Auth Fix Loaded');