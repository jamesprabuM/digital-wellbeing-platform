/**
 * Dynamic Script Loader and Integrity Check
 * 
 * This script ensures that all required JavaScript files are loaded correctly
 * and in the right order, with fallback mechanisms for critical functionality.
 */

(function() {
    console.log('🔄 Script Loader and Integrity Check running...');
    
    // List of critical scripts with their dependencies
    const scripts = [
        { name: 'supabase-client.js', loaded: false, dependencies: [] },
        { name: 'supabase-auth.js', loaded: false, dependencies: ['supabase-client.js'] },
        { name: 'inline-auth.js', loaded: false, dependencies: ['supabase-auth.js', 'toast.js'] },
        { name: 'auth-system-connector.js', loaded: false, dependencies: ['supabase-auth.js', 'inline-auth.js'] }
    ];
    
    // Check if scripts are loaded
    function checkScriptsLoaded() {
        const allLoaded = scripts.every(script => script.loaded);
        console.log(`Script loading check: ${allLoaded ? '✅ All scripts loaded' : '❌ Some scripts missing'}`);
        
        if (!allLoaded) {
            const missing = scripts.filter(script => !script.loaded).map(script => script.name);
            console.warn('⚠️ Missing scripts:', missing);
            
            // Try to load missing scripts
            loadMissingScripts(missing);
        }
    }
    
    // Load missing scripts
    function loadMissingScripts(missing) {
        console.log('🔄 Attempting to load missing scripts...');
        
        missing.forEach(scriptName => {
            // Check dependencies first
            const script = scripts.find(s => s.name === scriptName);
            const dependencies = script.dependencies;
            
            // Make sure dependencies are loaded first
            const missingDeps = dependencies.filter(dep => {
                const depScript = scripts.find(s => s.name === dep);
                return !depScript.loaded;
            });
            
            if (missingDeps.length > 0) {
                console.log(`Cannot load ${scriptName} yet - missing dependencies:`, missingDeps);
                loadMissingScripts(missingDeps);
                return;
            }
            
            // Load the script
            const scriptEl = document.createElement('script');
            scriptEl.src = `js/${scriptName}`;
            scriptEl.async = false;
            
            scriptEl.onload = function() {
                console.log(`✅ Successfully loaded ${scriptName}`);
                const scriptObj = scripts.find(s => s.name === scriptName);
                if (scriptObj) scriptObj.loaded = true;
            };
            
            scriptEl.onerror = function() {
                console.error(`❌ Failed to load ${scriptName}`);
                
                // Try one more time
                setTimeout(() => {
                    console.log(`🔄 Retrying load of ${scriptName}...`);
                    document.head.appendChild(document.createElement('script')).src = `js/${scriptName}`;
                }, 1000);
            };
            
            document.head.appendChild(scriptEl);
        });
    }
    
    // Check which scripts are already loaded
    function checkExistingScripts() {
        const scriptTags = document.querySelectorAll('script');
        
        scriptTags.forEach(tag => {
            if (!tag.src) return;
            
            const src = tag.src.toLowerCase();
            
            scripts.forEach(script => {
                if (src.includes(script.name.toLowerCase())) {
                    script.loaded = true;
                    console.log(`✅ Found ${script.name} already loaded`);
                }
            });
        });
    }
    
    // Check for critical global objects
    function checkCriticalObjects() {
        setTimeout(() => {
            const checks = [
                { name: 'supabase', exists: typeof supabase !== 'undefined' },
                { name: 'supabaseAuth', exists: typeof window.supabaseAuth !== 'undefined' },
                { name: 'authManager', exists: typeof window.authManager !== 'undefined' },
                { name: 'showToast', exists: typeof window.showToast === 'function' }
            ];
            
            console.log('Critical object check:');
            checks.forEach(check => {
                console.log(`- ${check.name}: ${check.exists ? '✅' : '❌'}`);
            });
            
            // Fix missing objects if needed
            if (!checks[1].exists && checks[0].exists) {
                console.log('🔧 Creating supabaseAuth from supabase client...');
                try {
                    // Create minimal supabaseAuth if not exists
                    window.supabaseAuth = {
                        initialized: true,
                        supabase: supabase.getClient(),
                        currentUser: null,
                        
                        isAuthenticated: function() {
                            return !!this.currentUser;
                        },
                        
                        getCurrentUser: function() {
                            return this.currentUser;
                        },
                        
                        signIn: async function(email, password) {
                            try {
                                const { data, error } = await this.supabase.auth.signInWithPassword({
                                    email, password
                                });
                                
                                if (error) throw error;
                                
                                this.currentUser = data.user;
                                return { user: data.user, session: data.session };
                            } catch (error) {
                                console.error('Sign in error:', error);
                                throw new Error(error.message || 'Login failed');
                            }
                        },
                        
                        signUp: async function(email, password, userData) {
                            try {
                                const { data, error } = await this.supabase.auth.signUp({
                                    email,
                                    password,
                                    options: {
                                        data: {
                                            full_name: userData.name || userData.username || email.split('@')[0],
                                            username: userData.username || email.split('@')[0]
                                        }
                                    }
                                });
                                
                                if (error) throw error;
                                
                                return { user: data.user, session: data.session };
                            } catch (error) {
                                console.error('Sign up error:', error);
                                throw new Error(error.message || 'Registration failed');
                            }
                        },
                        
                        signOut: async function() {
                            try {
                                const { error } = await this.supabase.auth.signOut();
                                if (error) throw error;
                                
                                this.currentUser = null;
                            } catch (error) {
                                console.error('Sign out error:', error);
                                throw error;
                            }
                        },
                        
                        triggerAuthStateChange: function(isAuthenticated) {
                            const event = new CustomEvent('authStateChanged', {
                                detail: {
                                    isAuthenticated,
                                    user: this.currentUser
                                }
                            });
                            document.dispatchEvent(event);
                        }
                    };
                    
                    // Check session
                    window.supabaseAuth.supabase.auth.getSession().then(({ data, error }) => {
                        if (!error && data.session) {
                            window.supabaseAuth.currentUser = data.session.user;
                            window.supabaseAuth.triggerAuthStateChange(true);
                        }
                    });
                    
                    console.log('✅ Created minimal supabaseAuth');
                } catch (e) {
                    console.error('Failed to create supabaseAuth:', e);
                }
            }
            
            if (!checks[3].exists) {
                // Create minimal toast function
                window.showToast = function(message, type, duration) {
                    alert(message);
                    return console.log(`Toast (${type}):`, message);
                };
            }
        }, 2000);
    }
    
    // Wait for DOM to be fully loaded
    window.addEventListener('DOMContentLoaded', function() {
        checkExistingScripts();
        checkScriptsLoaded();
        checkCriticalObjects();
    });
    
    // Add global diagnostic function
    window.checkScriptIntegrity = function() {
        checkExistingScripts();
        
        const results = {
            scriptsLoaded: scripts.filter(s => s.loaded).map(s => s.name),
            scriptsMissing: scripts.filter(s => !s.loaded).map(s => s.name),
            criticalObjects: {
                supabase: typeof supabase !== 'undefined',
                supabaseAuth: typeof window.supabaseAuth !== 'undefined',
                authManager: typeof window.authManager !== 'undefined',
                showToast: typeof window.showToast === 'function',
                checkSupabaseAuth: typeof window.checkSupabaseAuth === 'function'
            }
        };
        
        console.log('📊 Script Integrity Check Results:', results);
        return results;
    };
})();

console.log('✅ Script Loader and Integrity Check loaded');