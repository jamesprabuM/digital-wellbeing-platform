// ===== SUPABASE CONFIGURATION =====

// Environment configuration
const SUPABASE_CONFIG = {
    // Replace these with your actual Supabase project credentials
    url: process.env.SUPABASE_URL || 'https://qjvlnqjxqxqxqxqxqxqx.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdmxucWp4cXhxeHF4cXhxeHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NzI4MDAsImV4cCI6MjA1MTI0ODgwMH0.example-key',
    
    // Database table names
    tables: {
        wellness_data: 'wellness_data',
        user_profiles: 'user_profiles',
        mood_entries: 'mood_entries',
        journal_entries: 'journal_entries'
    },
    
    // Auth configuration
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
};

// Supabase client initialization
let supabaseClient = null;

function initializeSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.warn('⚠️ Supabase library not loaded. Please include the Supabase CDN.');
        return null;
    }

    try {
        supabaseClient = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey,
            {
                auth: SUPABASE_CONFIG.auth
            }
        );
        
        console.log('✅ Supabase client initialized');
        return supabaseClient;
        
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return null;
    }
}

// Database schema setup (run this in Supabase SQL editor)
const DATABASE_SCHEMA = `
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create wellness_data table
CREATE TABLE IF NOT EXISTS wellness_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wellness_scores JSONB DEFAULT '{"sleep": 70, "exercise": 65, "mindfulness": 75}',
    mood_data JSONB DEFAULT '[]',
    activities JSONB DEFAULT '[]',
    goals JSONB DEFAULT '[]',
    streaks JSONB DEFAULT '{"meditation": 0, "exercise": 0, "journaling": 0, "mood_tracking": 0}',
    journal_entries JSONB DEFAULT '[]',
    gratitude_entries JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    mood_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    mood_score INTEGER,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
CREATE POLICY "Users can view own wellness data" ON wellness_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness data" ON wellness_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness data" ON wellness_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mood entries" ON mood_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries" ON mood_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE wellness_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wellness_data_user_id ON wellness_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
`;

// Export configuration and client
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.getSupabaseClient = () => supabaseClient || initializeSupabase();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();
});

console.log('📊 Supabase Configuration Loaded');
console.log('🔧 To set up your database, run the SQL schema in your Supabase dashboard');