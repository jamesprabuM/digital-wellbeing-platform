// Supabase Authentication Routes
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://uatbksfpmbrqntbfxxkn.supabase.co';
// Note: For server-side operations that need admin privileges, you should use a service role key
// For now, we'll use the anon key, but in production you should use a proper service role key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdGJrc2ZwbWJycW50YmZ4eGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTUyMjMsImV4cCI6MjA3Mzc5MTIyM30.HNePrfZz8wU-EH_8O-Ewsj_sD7rxZfqAPbdUYhciELQ';

// Log that we're using the provided credentials
console.log('🔑 Using provided Supabase project credentials for server-side operations');
// Note: For production, get a service role key from Supabase dashboard

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to check if user is authenticated with Supabase
const authenticateSupabaseToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        // Verify the token with Supabase
        const { data, error } = await supabase.auth.getUser(token);

        if (error) {
            throw error;
        }

        // Store user data
        req.user = data.user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Server-side signup handler (optional, for additional validation or events)
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Sign up the user with Supabase
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: { full_name: name }
        });

        if (error) {
            throw error;
        }

        // Check if we need to create a profile in our custom table
        try {
            // This is only needed if you use a custom profiles table separate from Supabase Auth
            await supabase.from('profiles').insert({
                id: data.user.id,
                full_name: name,
                email: email,
                created_at: new Date().toISOString()
            });
        } catch (profileError) {
            console.warn('Failed to create profile:', profileError);
            // We still continue even if profile creation fails
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(error.status || 500).json({
            message: error.message || 'Server error during registration',
            code: error.code
        });
    }
});

// Server-side login handler (optional)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sign in the user
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw error;
        }

        res.json({
            token: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: data.user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(error.status || 500).json({
            message: error.message || 'Server error during login',
            code: error.code
        });
    }
});

// Get current user (protected route)
router.get('/me', authenticateSupabaseToken, (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            email: req.user.email,
            name: req.user.user_metadata?.full_name || 'User',
            lastSignIn: req.user.last_sign_in_at,
            createdAt: req.user.created_at
        }
    });
});

// Server-side refresh token handler
router.post('/refresh', async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(400).json({ message: 'Refresh token required' });
        }

        // Refresh the session
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            throw error;
        }

        res.json({
            token: data.session.access_token,
            refreshToken: data.session.refresh_token
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(error.status || 500).json({
            message: error.message || 'Server error during token refresh',
            code: error.code
        });
    }
});

// Server-side password reset request
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Request password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${req.protocol}://${req.get('host')}/reset-password`
        });

        if (error) {
            throw error;
        }

        // For security, always return success even if email doesn't exist
        res.json({ message: 'If your email is registered, you will receive a password reset link' });

    } catch (error) {
        console.error('Forgot password error:', error);
        // For security, still return success message
        res.json({ message: 'If your email is registered, you will receive a password reset link' });
    }
});

// Server-side update password
router.post('/update-password', authenticateSupabaseToken, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Valid password is required (min 6 characters)' });
        }

        // Update password
        const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
            password
        });

        if (error) {
            throw error;
        }

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Update password error:', error);
        res.status(error.status || 500).json({
            message: error.message || 'Server error during password update',
            code: error.code
        });
    }
});

// Server-side update user profile
router.put('/profile', authenticateSupabaseToken, async (req, res) => {
    try {
        const { name, bio, website } = req.body;

        // Update user metadata
        if (name) {
            await supabase.auth.admin.updateUserById(req.user.id, {
                user_metadata: {
                    ...req.user.user_metadata,
                    full_name: name
                }
            });
        }

        // Update custom profile if it exists
        const profileData = {};
        if (name) profileData.full_name = name;
        if (bio !== undefined) profileData.bio = bio;
        if (website !== undefined) profileData.website = website;

        if (Object.keys(profileData).length > 0) {
            // Update the profile
            await supabase
                .from('profiles')
                .update({
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', req.user.id);
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: req.user.id,
                email: req.user.email,
                name: name || req.user.user_metadata?.full_name || 'User'
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(error.status || 500).json({
            message: error.message || 'Server error during profile update',
            code: error.code
        });
    }
});

module.exports = router;