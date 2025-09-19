// ===== SUPABASE AUTHENTICATION SYSTEM =====

class SupabaseAuth {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Get Supabase client from the global supabase helper if available
            if (window.supabase && typeof window.supabase.getClient === 'function') {
                this.supabase = window.supabase.getClient();
                console.log('✅ Using existing Supabase client from window.supabase');
            } else {
                // Fallback to direct initialization
                const supabaseUrl = 'https://uatbksfpmbrqntbfxxkn.supabase.co';
                const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdGJrc2ZwbWJycW50YmZ4eGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTUyMjMsImV4cCI6MjA3Mzc5MTIyM30.HNePrfZz8wU-EH_8O-Ewsj_sD7rxZfqAPbdUYhciELQ';
                
                if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
                    console.warn('⚠️ Supabase credentials not configured. Using demo mode.');
                    this.initDemoMode();
                    return;
                }
                
                console.log('🔑 Creating new Supabase client with credentials');
                if (typeof supabase.createClient === 'function') {
                    this.supabase = supabase.createClient(supabaseUrl, supabaseKey);
                } else if (typeof window.supabase === 'object') {
                    this.supabase = window.supabase.getClient();
                }
            }
            
            // Check for existing session
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                this.triggerAuthStateChange(true);
            }

            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
                this.triggerAuthStateChange(!!session);
            });

            this.initialized = true;
            console.log('✅ Supabase Auth initialized');

        } catch (error) {
            console.error('❌ Supabase initialization failed:', error);
            this.initDemoMode();
        }
    }

    initDemoMode() {
        console.log('🔧 Running in demo mode - using localStorage');
        this.initialized = true;
        
        // Check for existing demo session
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
            this.currentUser = JSON.parse(demoUser);
            this.triggerAuthStateChange(true);
        }
    }

    async signUp(email, password, userData = {}) {
        if (!this.initialized) {
            throw new Error('Auth system not initialized');
        }

        if (!this.supabase) {
            return this.demoSignUp(email, password, userData);
        }

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

            // Initialize user wellness data
            if (data.user) {
                await this.initializeUserData(data.user.id);
            }

            return { user: data.user, session: data.session };

        } catch (error) {
            console.error('Sign up error:', error);
            throw new Error(error.message || 'Registration failed');
        }
    }

    async signIn(email, password) {
        if (!this.initialized) {
            throw new Error('Auth system not initialized');
        }

        if (!this.supabase) {
            return this.demoSignIn(email, password);
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { user: data.user, session: data.session };

        } catch (error) {
            console.error('Sign in error:', error);
            throw new Error(error.message || 'Login failed');
        }
    }

    async signOut() {
        if (!this.supabase) {
            localStorage.removeItem('demo_user');
            this.currentUser = null;
            this.triggerAuthStateChange(false);
            return;
        }

        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    // Demo mode methods
    demoSignUp(email, password, userData) {
        const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
        
        if (users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: 'demo_' + Date.now(),
            email,
            user_metadata: {
                full_name: userData.name || userData.username || email.split('@')[0],
                username: userData.username || email.split('@')[0]
            },
            created_at: new Date().toISOString()
        };

        users.push({ ...newUser, password: btoa(password) });
        localStorage.setItem('demo_users', JSON.stringify(users));
        
        this.currentUser = newUser;
        localStorage.setItem('demo_user', JSON.stringify(newUser));
        this.triggerAuthStateChange(true);

        return { user: newUser, session: { user: newUser } };
    }

    demoSignIn(email, password) {
        const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const user = users.find(u => u.email === email && atob(u.password) === password);
        
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const { password: _, ...userWithoutPassword } = user;
        this.currentUser = userWithoutPassword;
        localStorage.setItem('demo_user', JSON.stringify(userWithoutPassword));
        this.triggerAuthStateChange(true);

        return { user: userWithoutPassword, session: { user: userWithoutPassword } };
    }

    // Database operations
    async initializeUserData(userId) {
        if (!this.supabase) return;

        try {
            const { error } = await this.supabase
                .from('wellness_data')
                .insert([{
                    user_id: userId,
                    wellness_scores: {
                        sleep: 70,
                        exercise: 65,
                        mindfulness: 75
                    },
                    mood_data: [],
                    activities: [],
                    goals: [],
                    streaks: {
                        meditation: 0,
                        exercise: 0,
                        journaling: 0,
                        mood_tracking: 0
                    },
                    journal_entries: [],
                    gratitude_entries: []
                }]);

            if (error) throw error;
        } catch (error) {
            console.warn('Failed to initialize user data:', error);
        }
    }

    async getWellnessData() {
        if (!this.currentUser) return this.getDefaultWellnessData();

        if (!this.supabase) {
            // Demo mode - use localStorage
            const data = localStorage.getItem(`wellness_${this.currentUser.id}`);
            return data ? JSON.parse(data) : this.getDefaultWellnessData();
        }

        try {
            const { data, error } = await this.supabase
                .from('wellness_data')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) throw error;
            return data || this.getDefaultWellnessData();

        } catch (error) {
            console.warn('Failed to fetch wellness data:', error);
            return this.getDefaultWellnessData();
        }
    }

    async saveWellnessData(key, value) {
        if (!this.currentUser) return false;

        if (!this.supabase) {
            // Demo mode - use localStorage
            const currentData = await this.getWellnessData();
            currentData[key] = value;
            localStorage.setItem(`wellness_${this.currentUser.id}`, JSON.stringify(currentData));
            return true;
        }

        try {
            const { error } = await this.supabase
                .from('wellness_data')
                .upsert({
                    user_id: this.currentUser.id,
                    [key]: value,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            return true;

        } catch (error) {
            console.error('Failed to save wellness data:', error);
            return false;
        }
    }

    getDefaultWellnessData() {
        return {
            wellness_scores: { sleep: 70, exercise: 65, mindfulness: 75 },
            mood_data: [],
            activities: [],
            goals: [],
            streaks: { meditation: 0, exercise: 0, journaling: 0, mood_tracking: 0 },
            journal_entries: [],
            gratitude_entries: []
        };
    }

    // Utility methods
    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    triggerAuthStateChange(isAuthenticated) {
        const event = new CustomEvent('authStateChanged', {
            detail: {
                isAuthenticated,
                user: this.currentUser
            }
        });
        document.dispatchEvent(event);
    }
}

// Initialize global auth instance
window.supabaseAuth = new SupabaseAuth();

// Backward compatibility
window.db = {
    isLoggedIn: () => window.supabaseAuth.isAuthenticated(),
    getCurrentUser: () => window.supabaseAuth.getCurrentUser(),
    login: (email, password) => window.supabaseAuth.signIn(email, password),
    register: (username, email, password) => window.supabaseAuth.signUp(email, password, { username }),
    logout: () => window.supabaseAuth.signOut(),
    getWellnessData: () => window.supabaseAuth.getWellnessData(),
    saveWellnessData: (key, value) => window.supabaseAuth.saveWellnessData(key, value)
};

console.log('🔐 Supabase Auth System Loaded');