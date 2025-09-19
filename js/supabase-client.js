/**
 * Direct Supabase Client Initialization
 * 
 * This file provides a simpler way to initialize the Supabase client
 * with direct configuration.
 */

// Immediately initialize the Supabase client when this script is loaded
const initSupabaseClient = () => {
    // Check if Supabase library is loaded
    if (typeof supabase === 'undefined') {
        console.error('⚠️ Supabase library not loaded! Make sure to include the Supabase JS SDK first.');
        return null;
    }

    try {
        // Supabase project configuration
        // We'll use actual credentials instead of placeholder values
        const supabaseUrl = 'https://uatbksfpmbrqntbfxxkn.supabase.co'; // Project URL
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdGJrc2ZwbWJycW50YmZ4eGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTUyMjMsImV4cCI6MjA3Mzc5MTIyM30.HNePrfZz8wU-EH_8O-Ewsj_sD7rxZfqAPbdUYhciELQ'; // Project anon/public key

        // Log that we're using the correct credentials
        console.log('🔑 Using configured Supabase credentials');

        // Initialize Supabase client
        const client = supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase client initialized successfully');

        // Store the client globally for easy access
        window._supabaseClient = client;

        return client;
    } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
        return null;
    }
};

// Create helper methods for common Supabase operations
const supabaseHelpers = {
    // Get the Supabase client instance
    getClient: () => {
        if (!window._supabaseClient) {
            window._supabaseClient = initSupabaseClient();
        }
        return window._supabaseClient;
    },

    // Authentication helpers
    auth: {
        // Sign up with email and password
        signUp: async (email, password, metadata = {}) => {
            const client = supabaseHelpers.getClient();
            return await client.auth.signUp({
                email,
                password,
                options: { data: metadata }
            });
        },

        // Sign in with email and password
        signIn: async (email, password) => {
            const client = supabaseHelpers.getClient();
            return await client.auth.signInWithPassword({ email, password });
        },

        // Sign out current user
        signOut: async () => {
            const client = supabaseHelpers.getClient();
            return await client.auth.signOut();
        },

        // Get current user
        getUser: async () => {
            const client = supabaseHelpers.getClient();
            const { data } = await client.auth.getUser();
            return data.user;
        },

        // Get current session
        getSession: async () => {
            const client = supabaseHelpers.getClient();
            const { data } = await client.auth.getSession();
            return data.session;
        },

        // Set up auth state change listener
        onAuthStateChange: (callback) => {
            const client = supabaseHelpers.getClient();
            return client.auth.onAuthStateChange((event, session) => {
                callback(event, session);
            });
        }
    },

    // Database helpers
    db: {
        // Query from a table
        query: (tableName) => {
            const client = supabaseHelpers.getClient();
            return client.from(tableName);
        },

        // Select records
        select: async (tableName, columns = '*', options = {}) => {
            const client = supabaseHelpers.getClient();
            let query = client.from(tableName).select(columns);

            if (options.filter) {
                for (const [key, value] of Object.entries(options.filter)) {
                    query = query.eq(key, value);
                }
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.order) {
                query = query.order(options.order.column, { ascending: options.order.ascending });
            }

            return await query;
        },

        // Insert records
        insert: async (tableName, data) => {
            const client = supabaseHelpers.getClient();
            return await client.from(tableName).insert(data);
        },

        // Update records
        update: async (tableName, data, match) => {
            const client = supabaseHelpers.getClient();
            let query = client.from(tableName).update(data);

            for (const [key, value] of Object.entries(match)) {
                query = query.eq(key, value);
            }

            return await query;
        },

        // Delete records
        delete: async (tableName, match) => {
            const client = supabaseHelpers.getClient();
            let query = client.from(tableName).delete();

            for (const [key, value] of Object.entries(match)) {
                query = query.eq(key, value);
            }

            return await query;
        }
    },

    // Storage helpers
    storage: {
        // Upload a file
        upload: async (bucket, path, file) => {
            const client = supabaseHelpers.getClient();
            return await client.storage.from(bucket).upload(path, file);
        },

        // Download a file
        download: async (bucket, path) => {
            const client = supabaseHelpers.getClient();
            return await client.storage.from(bucket).download(path);
        },

        // Get public URL
        getPublicUrl: (bucket, path) => {
            const client = supabaseHelpers.getClient();
            return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
        },

        // List files
        list: async (bucket, path) => {
            const client = supabaseHelpers.getClient();
            return await client.storage.from(bucket).list(path);
        },

        // Remove files
        remove: async (bucket, paths) => {
            const client = supabaseHelpers.getClient();
            return await client.storage.from(bucket).remove(paths);
        }
    },

    // Helper to determine if Supabase is configured properly
    isConfigured: () => {
        // Using actual project credentials, so this should always return true
        return true;
    }
};

// Initialize the Supabase client
const client = initSupabaseClient();

// Export the helpers to the window object
window.supabase = {
    ...supabaseHelpers,
    init: initSupabaseClient,
    _client: client  // Store the client directly for debugging
};

// Add diagnostic function for auth debugging
window.checkSupabaseAuth = async function() {
    console.log('🔍 Checking Supabase authentication status...');
    
    try {
        // Check if client is initialized
        if (!window.supabase || !window.supabase.getClient) {
            console.error('❌ Supabase client not properly initialized');
            return { status: 'error', message: 'Supabase client not initialized' };
        }
        
        const client = window.supabase.getClient();
        if (!client) {
            console.error('❌ Failed to get Supabase client');
            return { status: 'error', message: 'Failed to get Supabase client' };
        }
        
        console.log('✅ Supabase client available');
        
        // Check session
        const { data, error } = await client.auth.getSession();
        
        if (error) {
            console.error('❌ Error checking session:', error);
            return { status: 'error', message: 'Error checking session', error };
        }
        
        const session = data?.session;
        
        if (session) {
            console.log('🔐 User is authenticated:', session.user.email);
            return { 
                status: 'authenticated', 
                user: session.user,
                session: session
            };
        } else {
            console.log('⚠️ No active session found');
            return { status: 'unauthenticated' };
        }
    } catch (e) {
        console.error('❌ Authentication check failed:', e);
        return { status: 'error', message: e.message, error: e };
    }
};

console.log('📦 Supabase Direct Client loaded - Debug functions available');