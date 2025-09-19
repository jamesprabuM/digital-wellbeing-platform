// ===== SUPABASE DATABASE INTEGRATION =====

class Database {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.initialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Get Supabase configuration
            const supabaseUrl = 'https://qjvlnqjxqxqxqxqxqxqx.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdmxucWp4cXhxeHF4cXhxeHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.example-key';
            
            // Check if Supabase is available
            if (typeof window.supabase === 'undefined') {
                console.warn('⚠️ Supabase library not loaded. Using demo mode.');
                this.initDemoMode();
                return;
            }
            
            // Initialize Supabase client
            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
            
            // Check for existing session
            const { data: { session } } = await this.supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                this.triggerLoginStateChange(true);
            }
            
            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.currentUser = session?.user || null;
                this.triggerLoginStateChange(!!session);
            });
            
            this.initialized = true;
            console.log('✅ Supabase Database initialized');
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            this.initDemoMode();
        }
    }
    
    initDemoMode() {
        console.log('🔧 Running in demo mode');
        this.initialized = true;
        
        // Check for existing demo session
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
            this.currentUser = JSON.parse(demoUser);
            this.triggerLoginStateChange(true);
        }
    }
    
    // Register a new user
    async register(username, email, password) {
        if (!this.initialized) {
            throw new Error('Database not initialized');
        }
        
        if (!this.supabase) {
            return this.demoRegister(username, email, password);
        }
        
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: username,
                        username: username
                    }
                }
            });
            
            if (error) throw error;
            return data.user;
            
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Registration failed');
        }
    }
    
    // Login user
    async login(email, password) {
        if (!this.initialized) {
            throw new Error('Database not initialized');
        }
        
        if (!this.supabase) {
            return this.demoLogin(email, password);
        }
        
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return data.user;
            
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed');
        }
    }
    
    // Demo mode methods
    demoRegister(username, email, password) {
        const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
        
        if (users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }
        
        const newUser = {
            id: 'demo_' + Date.now(),
            email,
            user_metadata: { full_name: username, username },
            created_at: new Date().toISOString()
        };
        
        users.push({ ...newUser, password: btoa(password) });
        localStorage.setItem('demo_users', JSON.stringify(users));
        
        this.currentUser = newUser;
        localStorage.setItem('demo_user', JSON.stringify(newUser));
        this.triggerLoginStateChange(true);
        
        return newUser;
    }
    
    demoLogin(email, password) {
        const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const user = users.find(u => u.email === email && atob(u.password) === password);
        
        if (!user) {
            throw new Error('Invalid credentials');
        }
        
        const { password: _, ...userWithoutPassword } = user;
        this.currentUser = userWithoutPassword;
        localStorage.setItem('demo_user', JSON.stringify(userWithoutPassword));
        this.triggerLoginStateChange(true);
        
        return userWithoutPassword;
    }
    
    // Logout user
    async logout() {
        if (this.supabase) {
            await this.supabase.auth.signOut();
        } else {
            // Demo mode
            localStorage.removeItem('demo_user');
            this.currentUser = null;
            this.triggerLoginStateChange(false);
        }
    }
    
    // Get wellness data for current user
    async getWellnessData() {
        if (!this.isLoggedIn()) {
            return this.getDefaultWellnessData();
        }
        
        if (!this.supabase) {
            // Demo mode
            const stored = localStorage.getItem(`wellness_${this.currentUser.id}`);
            return stored ? JSON.parse(stored) : this.getDefaultWellnessData();
        }
        
        try {
            const { data, error } = await this.supabase
                .from('wellness_data')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (!data) {
                // Create initial wellness data
                const defaultData = this.getDefaultWellnessData();
                await this.supabase
                    .from('wellness_data')
                    .insert([{
                        user_id: this.currentUser.id,
                        wellness_scores: defaultData.wellness_scores,
                        streaks: defaultData.streaks
                    }]);
                return defaultData;
            }
            
            return {
                wellness_scores: data.wellness_scores || { sleep: 80, exercise: 65, mindfulness: 70 },
                streaks: data.streaks || { meditation: 0, exercise: 0, journaling: 0, mood_tracking: 0 },
                moodData: await this.getMoodEntries(),
                sleepData: await this.getSleepEntries(),
                activities: await this.getActivities(),
                goals: await this.getGoals(),
                journalEntries: await this.getJournalEntries(),
                gratitudeEntries: await this.getGratitudeEntries()
            };
            
        } catch (error) {
            console.error('Error fetching wellness data:', error);
            return this.getDefaultWellnessData();
        }
    }
    
    // Save wellness data for current user
    async saveWellnessData(key, value) {
        if (!this.isLoggedIn()) {
            console.warn('Cannot save data - user not logged in');
            return false;
        }
        
        if (!this.supabase) {
            // Demo mode
            const currentData = await this.getWellnessData();
            currentData[key] = value;
            localStorage.setItem(`wellness_${this.currentUser.id}`, JSON.stringify(currentData));
            return true;
        }
        
        try {
            // Handle different data types
            switch (key) {
                case 'moodData':
                    return await this.saveMoodEntries(value);
                case 'sleepData':
                    return await this.saveSleepEntries(value);
                case 'activities':
                    return await this.saveActivities(value);
                case 'goals':
                    return await this.saveGoals(value);
                case 'journalEntries':
                    return await this.saveJournalEntries(value);
                case 'gratitudeEntries':
                    return await this.saveGratitudeEntries(value);
                case 'wellness_scores':
                case 'streaks':
                    const { error } = await this.supabase
                        .from('wellness_data')
                        .upsert({
                            user_id: this.currentUser.id,
                            [key]: value,
                            updated_at: new Date().toISOString()
                        });
                    return !error;
                default:
                    console.warn(`Unknown data key: ${key}`);
                    return false;
            }
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }
    
    // Helper methods for specific data types
    async getMoodEntries() {
        if (!this.supabase) return [];
        const { data } = await this.supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('date', { ascending: false });
        return data || [];
    }
    
    async getSleepEntries() {
        if (!this.supabase) return [];
        const { data } = await this.supabase
            .from('sleep_entries')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('date', { ascending: false });
        return data || [];
    }
    
    async getActivities() {
        if (!this.supabase) return [];
        const { data } = await this.supabase
            .from('activities')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });
        return data || [];
    }
    
    async getGoals() {
        if (!this.supabase) return [];
        const { data } = await this.supabase
            .from('goals')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });
        return data || [];
    }
    
    async getJournalEntries() {
        if (!this.supabase) return [];
        const { data } = await this.supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('date', { ascending: false });
        return data || [];
    }
    
    async getGratitudeEntries() {
        if (!this.supabase) return [];
        const { data } = await this.supabase
            .from('gratitude_entries')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('date', { ascending: false });
        return data || [];
    }
    
    // Save methods for specific data types
    async saveMoodEntries(entries) {
        if (!Array.isArray(entries)) return false;
        
        try {
            // Delete existing entries and insert new ones
            await this.supabase.from('mood_entries').delete().eq('user_id', this.currentUser.id);
            
            if (entries.length > 0) {
                const { error } = await this.supabase
                    .from('mood_entries')
                    .insert(entries.map(entry => ({
                        ...entry,
                        user_id: this.currentUser.id
                    })));
                return !error;
            }
            return true;
        } catch (error) {
            console.error('Error saving mood entries:', error);
            return false;
        }
    }
    
    async saveGoals(goals) {
        if (!Array.isArray(goals)) return false;
        
        try {
            await this.supabase.from('goals').delete().eq('user_id', this.currentUser.id);
            
            if (goals.length > 0) {
                const { error } = await this.supabase
                    .from('goals')
                    .insert(goals.map(goal => ({
                        ...goal,
                        user_id: this.currentUser.id
                    })));
                return !error;
            }
            return true;
        } catch (error) {
            console.error('Error saving goals:', error);
            return false;
        }
    }
    
    getDefaultWellnessData() {
        return {
            wellness_scores: { sleep: 80, exercise: 65, mindfulness: 70 },
            streaks: { meditation: 0, exercise: 0, journaling: 0, mood_tracking: 0 },
            moodData: [],
            sleepData: [],
            activities: [],
            goals: [],
            journalEntries: [],
            gratitudeEntries: []
        };
    }
    
    // Helper to check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    // Get current user data
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Trigger login state change event
    triggerLoginStateChange(isLoggedIn) {
        const event = new CustomEvent('loginStateChanged', {
            detail: {
                isLoggedIn,
                user: this.currentUser
            }
        });
        document.dispatchEvent(event);
    }
}

// Initialize database connection
const db = new Database();

// Export database instance
window.db = db;

console.log('🗄️ Database system initialized with Supabase integration');