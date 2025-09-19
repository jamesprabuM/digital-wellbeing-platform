-- Digital Wellbeing Platform Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable Row Level Security
-- Note: Supabase automatically creates auth.users table

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness data table for tracking overall scores and streaks
CREATE TABLE IF NOT EXISTS wellness_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wellness_scores JSONB DEFAULT '{"sleep": 80, "exercise": 65, "mindfulness": 70}',
    streaks JSONB DEFAULT '{"meditation": 0, "exercise": 0, "journaling": 0, "mood_tracking": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Mood entries table
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sleep entries table
CREATE TABLE IF NOT EXISTS sleep_entries (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    bedtime TEXT NOT NULL,
    wake_time TEXT NOT NULL,
    quality INTEGER CHECK (quality >= 1 AND quality <= 10),
    notes TEXT DEFAULT '',
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (for exercise and mindfulness)
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'exercise' or 'mindfulness'
    title TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT DEFAULT '',
    date DATE NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gratitude entries table
CREATE TABLE IF NOT EXISTS gratitude_entries (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL, -- Array of gratitude items
    reflection TEXT DEFAULT '',
    date DATE NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CBT thoughts table
CREATE TABLE IF NOT EXISTS cbt_thoughts (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    situation TEXT NOT NULL,
    automatic_thought TEXT NOT NULL,
    emotion TEXT NOT NULL,
    intensity TEXT NOT NULL,
    balanced_thought TEXT NOT NULL,
    date DATE NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at BIGINT NOT NULL,
    target_date BIGINT,
    completed_at BIGINT,
    created_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbt_thoughts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for wellness_data table
DROP POLICY IF EXISTS "Users can view own wellness data" ON wellness_data;
DROP POLICY IF EXISTS "Users can update own wellness data" ON wellness_data;
DROP POLICY IF EXISTS "Users can insert own wellness data" ON wellness_data;
CREATE POLICY "Users can view own wellness data" ON wellness_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wellness data" ON wellness_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wellness data" ON wellness_data FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for mood_entries table
DROP POLICY IF EXISTS "Users can view own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can insert own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can update own mood entries" ON mood_entries;
DROP POLICY IF EXISTS "Users can delete own mood entries" ON mood_entries;
CREATE POLICY "Users can view own mood entries" ON mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood entries" ON mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood entries" ON mood_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood entries" ON mood_entries FOR DELETE USING (auth.uid() = user_id);

-- Create policies for sleep_entries table
DROP POLICY IF EXISTS "Users can view own sleep entries" ON sleep_entries;
DROP POLICY IF EXISTS "Users can insert own sleep entries" ON sleep_entries;
DROP POLICY IF EXISTS "Users can update own sleep entries" ON sleep_entries;
DROP POLICY IF EXISTS "Users can delete own sleep entries" ON sleep_entries;
CREATE POLICY "Users can view own sleep entries" ON sleep_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sleep entries" ON sleep_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sleep entries" ON sleep_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sleep entries" ON sleep_entries FOR DELETE USING (auth.uid() = user_id);

-- Create policies for activities table
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON activities FOR DELETE USING (auth.uid() = user_id);

-- Create policies for journal_entries table
DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;
CREATE POLICY "Users can view own journal entries" ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries" ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries" ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Create policies for gratitude_entries table
DROP POLICY IF EXISTS "Users can view own gratitude entries" ON gratitude_entries;
DROP POLICY IF EXISTS "Users can insert own gratitude entries" ON gratitude_entries;
DROP POLICY IF EXISTS "Users can update own gratitude entries" ON gratitude_entries;
DROP POLICY IF EXISTS "Users can delete own gratitude entries" ON gratitude_entries;
CREATE POLICY "Users can view own gratitude entries" ON gratitude_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gratitude entries" ON gratitude_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gratitude entries" ON gratitude_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gratitude entries" ON gratitude_entries FOR DELETE USING (auth.uid() = user_id);

-- Create policies for cbt_thoughts table
DROP POLICY IF EXISTS "Users can view own cbt thoughts" ON cbt_thoughts;
DROP POLICY IF EXISTS "Users can insert own cbt thoughts" ON cbt_thoughts;
DROP POLICY IF EXISTS "Users can update own cbt thoughts" ON cbt_thoughts;
DROP POLICY IF EXISTS "Users can delete own cbt thoughts" ON cbt_thoughts;
CREATE POLICY "Users can view own cbt thoughts" ON cbt_thoughts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cbt thoughts" ON cbt_thoughts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cbt thoughts" ON cbt_thoughts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cbt thoughts" ON cbt_thoughts FOR DELETE USING (auth.uid() = user_id);

-- Create policies for goals table
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wellness_data_user_id ON wellness_data(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date);
CREATE INDEX IF NOT EXISTS idx_sleep_entries_user_id ON sleep_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_entries_date ON sleep_entries(date);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_user_id ON gratitude_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_cbt_thoughts_user_id ON cbt_thoughts(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Create a function to automatically create wellness_data entry for new users
CREATE OR REPLACE FUNCTION create_user_wellness_data()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wellness_data (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create wellness data for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_wellness_data();