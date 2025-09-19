# Migration from Firebase to Supabase

This document provides instructions on migrating from Firebase Authentication to Supabase Authentication in the Digital Wellbeing Platform.

## Why Supabase?

Supabase provides several advantages over Firebase:

- Open-source and self-hostable
- PostgreSQL database with full SQL access
- Simple API similar to Firebase
- Free tier with generous limits
- Row-level security policies
- Built-in authentication with multiple providers
- Storage, edge functions, and realtime subscriptions

## Migration Steps

### 1. Create a Supabase Project

1. Sign up at [supabase.com](https://supabase.com) or log in to your account
2. Create a new project
3. Choose your region and set a secure database password
4. Wait for your project to be set up (~2 minutes)

### 2. Configure Authentication

1. Go to Authentication > Settings in the Supabase dashboard
2. Configure Sign-in methods (Email, Social providers, etc.)
3. Customize email templates if needed
4. Set up any additional security settings

### 3. Project Configuration Complete

The Supabase configuration has been updated in your project with the following details:

1. Project URL: `https://uatbksfpmbrqntbfxxkn.supabase.co`
2. Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (key truncated for security)

The configuration has been updated in:
- `js/supabase-client.js`
- `js/supabase-config.js`
- `routes/supabase-auth.js`

### 4. Set Up Database Tables

1. Go to the SQL Editor in your Supabase dashboard
2. Run the following SQL to create a profiles table:

```sql
-- Create a table for public profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create a secure RLS policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create wellness_data table
CREATE TABLE wellness_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  wellness_scores JSONB DEFAULT '{"sleep": 80, "exercise": 65, "mindfulness": 70}'::jsonb,
  mood_data JSONB DEFAULT '[]'::jsonb,
  sleep_data JSONB DEFAULT '[]'::jsonb,
  activities JSONB DEFAULT '[]'::jsonb,
  journal_entries JSONB DEFAULT '[]'::jsonb,
  gratitude_entries JSONB DEFAULT '[]'::jsonb,
  cbt_thoughts JSONB DEFAULT '[]'::jsonb,
  goals JSONB DEFAULT '[]'::jsonb,
  streaks JSONB DEFAULT '{"meditation": 0, "exercise": 0, "journaling": 0, "mood_tracking": 0}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create a secure RLS policy for wellness data
ALTER TABLE wellness_data ENABLE ROW LEVEL SECURITY;

-- Create policies for wellness data
CREATE POLICY "Users can view own wellness data." 
  ON wellness_data FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness data." 
  ON wellness_data FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness data." 
  ON wellness_data FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a trigger function to update last_updated
CREATE OR REPLACE FUNCTION update_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamp on update
CREATE TRIGGER update_wellness_data_last_updated
  BEFORE UPDATE ON wellness_data
  FOR EACH ROW
  EXECUTE FUNCTION update_last_updated();

-- Create function to create default wellness data for new users
CREATE OR REPLACE FUNCTION create_default_wellness_data()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wellness_data (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create wellness data for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_wellness_data();
```

### 5. Update Server API Endpoints (Optional)

If you're using the server.js API endpoints with MongoDB, you'll need to update them to work with Supabase. This can be done gradually:

1. Add the Supabase client to server.js
2. Create equivalent API endpoints using Supabase queries
3. Use the `@supabase/supabase-js` package in your Node.js server

### 6. Testing the Migration

1. Use the `simple-supabase-login.html` file to test authentication
2. Try registering a new user and logging in
3. Verify the user is created in the Supabase Auth dashboard
4. Check if the profiles table contains the new user

### 7. Migrating Existing Users (If Applicable)

For migrating existing Firebase users to Supabase:

1. Export your users from Firebase Authentication
2. Transform the data to match Supabase's format
3. Use Supabase Admin API to import users
4. For detailed instructions, see [Supabase's documentation](https://supabase.com/docs/guides/auth/auth-helpers/migrating-from-firebase-auth)

## Client-Side Authentication

The `supabase-client.js` file provides helper methods for common authentication operations:

```javascript
// Sign up
const { data, error } = await supabase.auth.signUp(email, password, metadata);

// Sign in
const { data, error } = await supabase.auth.signIn(email, password);

// Sign out
await supabase.auth.signOut();

// Get current user
const user = await supabase.auth.getUser();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state change
});
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)
- [JavaScript Client Library](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)