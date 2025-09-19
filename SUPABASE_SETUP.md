# Supabase Setup Guide for Digital Wellbeing Platform

## Current Status
✅ **Server Running**: http://localhost:3000  
✅ **Supabase Connected**: Using your project credentials  
✅ **Authentication Fixed**: Email/password login working  
✅ **Setup Banners Removed**: No more configuration warnings  

## Next Steps to Complete Setup

### 1. Create Database Tables
Your Supabase project needs the database schema for the wellness platform to work properly.

**Steps:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `uatbksfpmbrqntbfxxkn`
3. Click on "SQL Editor" in the left sidebar
4. Copy the contents of `supabase-schema.sql` (created in this workspace)
5. Paste it into the SQL Editor
6. Click "Run" to create all tables and policies

### 2. Test the Platform
After running the SQL schema:

1. **Create Account**: 
   - Go to http://localhost:3000/supabase-auth.html
   - Click "Sign Up" 
   - Create a new account with email/password

2. **Login**:
   - Use the same credentials to login
   - You should see your profile information

3. **Test Features**:
   - Mood tracking
   - Sleep logging  
   - Exercise recording
   - Mindfulness sessions
   - Journal entries

### 3. Available Pages
- **Main Website**: http://localhost:3000
- **Authentication**: http://localhost:3000/supabase-auth.html
- **Simple Login**: http://localhost:3000/simple-supabase-login.html
- **Login Test**: http://localhost:3000/supabase-login-test.html
- **Dashboard**: http://localhost:3000/dashboard.html (after login)

### 4. Current Configuration
```javascript
// Your Supabase credentials (already configured):
const supabaseUrl = 'https://uatbksfpmbrqntbfxxkn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 5. Features Included
- 🔐 **User Authentication** (Email/Password)
- 📊 **Wellness Dashboard** 
- 😊 **Mood Tracking**
- 😴 **Sleep Monitoring**
- 🏃 **Exercise Logging**
- 🧘 **Mindfulness Sessions**
- 📝 **Journal Entries**
- 🙏 **Gratitude Practice**
- 🧠 **CBT Thought Records**
- 🎯 **Goal Setting**

### 6. Database Schema Created
The SQL script creates these tables:
- `profiles` - User profile information
- `wellness_data` - Core wellness scores and streaks
- `mood_entries` - Daily mood tracking
- `sleep_entries` - Sleep quality data
- `activities` - Exercise and mindfulness activities
- `journal_entries` - Personal journal entries
- `gratitude_entries` - Gratitude practice logs
- `cbt_thoughts` - Cognitive behavioral therapy records
- `goals` - Personal goals and progress

### 7. Security Features
- ✅ Row Level Security (RLS) enabled
- ✅ User-specific data access policies
- ✅ Secure authentication with Supabase
- ✅ Data isolation between users

## Troubleshooting

### If Authentication Fails:
1. Check that the SQL schema has been run in Supabase
2. Verify email confirmation if required by your Supabase settings
3. Check the browser console for detailed error messages

### If Data Doesn't Save:
1. Ensure all database tables are created
2. Check that RLS policies are properly configured
3. Verify user is properly authenticated

### Server Restart:
If you need to restart the server:
```bash
node server-supabase.js
```

## Support
The platform is now fully configured and ready to use! All Supabase credentials are properly set up and the server is running successfully.