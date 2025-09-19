// ===== BACKEND SERVER FOR DIGITAL WELLBEING PLATFORM =====
// Using Supabase for authentication and data storage

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const supabaseAuthRoutes = require('./routes/supabase-auth');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4000;

// Load environment variables
require('dotenv').config();

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_KEY');
    console.error('Please set these variables in your .env file');
    process.exit(1);
}

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔑 Using Supabase for authentication and data storage');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Use Supabase auth routes
app.use('/api/auth', supabaseAuthRoutes);

// Middleware to check if user is authenticated with Supabase
const authenticateSupabaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Authentication required',
                details: 'No bearer token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify the token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            console.error('Token verification error:', error);
            return res.status(403).json({ 
                message: 'Invalid or expired token',
                details: error.message 
            });
        }

        if (!user) {
            return res.status(403).json({ 
                message: 'Invalid token',
                details: 'No user associated with token'
            });
        }

        // Store user data in request for use in routes
        req.user = user;
        req.token = token;  // Store token for potential use in supabase client calls

        // Log successful authentication
        console.log(`🔐 Authenticated user: ${user.email}`);
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ 
            message: 'Authentication failed',
            details: error.message
        });
    }
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Auth status endpoint for debugging
app.get('/api/auth/status', authenticateSupabaseToken, (req, res) => {
    res.json({
        authenticated: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            lastSignIn: req.user.last_sign_in_at,
            metadata: req.user.user_metadata
        }
    });
});

// Serve auth page
app.get('/supabase-auth.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'supabase-auth.html'));
});

// Serve diagnostic page
app.get('/diagnostic.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'diagnostic.html'));
});

// User profile routes
app.get('/api/user/profile', authenticateSupabaseToken, async (req, res) => {
    try {
        // Get user profile data from profiles table
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (profileError) {
            // If profile doesn't exist yet, return basic user data
            if (profileError.code === 'PGRST116') {
                return res.json({
                    id: req.user.id,
                    name: req.user.user_metadata?.full_name || 'User',
                    email: req.user.email,
                    createdAt: req.user.created_at,
                    lastLogin: req.user.last_sign_in_at
                });
            }
            throw profileError;
        }

        res.json({
            id: req.user.id,
            name: profileData.full_name || req.user.user_metadata?.full_name || 'User',
            email: req.user.email,
            createdAt: req.user.created_at,
            lastLogin: req.user.last_sign_in_at,
            bio: profileData.bio || '',
            website: profileData.website || ''
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

app.put('/api/user/profile', authenticateSupabaseToken, async (req, res) => {
    try {
        const { name, bio, website } = req.body;

        // Update profile data
        const profileData = {};
        if (name) profileData.full_name = name;
        if (bio !== undefined) profileData.bio = bio;
        if (website !== undefined) profileData.website = website;

        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', req.user.id)
            .single();

        let profileUpdateResult;

        if (existingProfile) {
            // Update existing profile
            profileUpdateResult = await supabase
                .from('profiles')
                .update({
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', req.user.id);
        } else {
            // Create new profile
            profileUpdateResult = await supabase
                .from('profiles')
                .insert({
                    id: req.user.id,
                    full_name: name || req.user.user_metadata?.full_name || 'User',
                    bio: bio || '',
                    website: website || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
        }

        if (profileUpdateResult.error) {
            throw profileUpdateResult.error;
        }

        // Update user metadata if name is provided
        if (name) {
            await supabase.auth.admin.updateUserById(req.user.id, {
                user_metadata: {
                    ...req.user.user_metadata,
                    full_name: name
                }
            });
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
        console.error('Error updating user profile:', error);
        res.status(500).json({
            message: error.message || 'Server error updating profile',
            code: error.code
        });
    }
});

// Wellness data routes
app.get('/api/wellness/data', authenticateSupabaseToken, async (req, res) => {
    try {
        // Get wellness data from wellness_data table
        const { data: wellnessData, error: wellnessDataError } = await supabase
            .from('wellness_data')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (wellnessDataError) {
            // If wellness data doesn't exist yet, create default
            if (wellnessDataError.code === 'PGRST116') {
                const defaultWellnessData = {
                    user_id: req.user.id,
                    wellness_scores: {
                        sleep: 80,
                        exercise: 65,
                        mindfulness: 70
                    },
                    streaks: {
                        meditation: 0,
                        exercise: 0,
                        journaling: 0,
                        mood_tracking: 0
                    },
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { error: insertError } = await supabase
                    .from('wellness_data')
                    .insert(defaultWellnessData);

                if (insertError) {
                    throw insertError;
                }

                return res.json(defaultWellnessData);
            }
            throw wellnessDataError;
        }

        // Get mood data entries
        const { data: moodData } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false });

        // Get sleep data entries
        const { data: sleepData } = await supabase
            .from('sleep_entries')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false });

        // Get activity entries
        const { data: activities } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false });

        // Get journal entries
        const { data: journalEntries } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false });

        // Get gratitude entries
        const { data: gratitudeEntries } = await supabase
            .from('gratitude_entries')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false });

        // Get CBT thought entries
        const { data: cbtThoughts } = await supabase
            .from('cbt_thoughts')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false });

        // Get goals
        const { data: goals } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        // Combine all data
        const completeWellnessData = {
            userId: req.user.id,
            wellnessData: wellnessData.wellness_scores || {
                sleep: 80,
                exercise: 65,
                mindfulness: 70
            },
            moodData: moodData || [],
            sleepData: sleepData || [],
            activities: activities || [],
            journalEntries: journalEntries || [],
            gratitudeEntries: gratitudeEntries || [],
            cbtThoughts: cbtThoughts || [],
            goals: goals || [],
            streaks: wellnessData.streaks || {
                meditation: 0,
                exercise: 0,
                journaling: 0,
                mood_tracking: 0
            },
            lastUpdated: wellnessData.updated_at
        };

        res.json(completeWellnessData);

    } catch (error) {
        console.error('Error fetching wellness data:', error);
        res.status(500).json({ message: 'Server error fetching wellness data' });
    }
});

app.post('/api/wellness/data', authenticateSupabaseToken, async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key) {
            return res.status(400).json({ message: 'Key is required' });
        }

        // Get existing wellness data
        const { data: wellnessData } = await supabase
            .from('wellness_data')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        let updateData = {};
        let tableName = 'wellness_data';

        // Special handling for different data types
        if (key === 'wellnessData') {
            updateData = {
                wellness_scores: value,
                updated_at: new Date().toISOString()
            };
        } else if (key === 'streaks') {
            updateData = {
                streaks: value,
                updated_at: new Date().toISOString()
            };
        } else {
            // For other keys, we assume the table name matches the key
            tableName = key;
            updateData = value;
        }

        if (tableName === 'wellness_data') {
            // Update wellness data table
            if (wellnessData) {
                // Update existing record
                const { error } = await supabase
                    .from('wellness_data')
                    .update(updateData)
                    .eq('user_id', req.user.id);

                if (error) throw error;
            } else {
                // Insert new record if doesn't exist
                const { error } = await supabase
                    .from('wellness_data')
                    .insert({
                        user_id: req.user.id,
                        ...updateData,
                        created_at: new Date().toISOString()
                    });

                if (error) throw error;
            }
        } else {
            // Handle specific data types in their respective tables
            const { error } = await supabase
                .from(tableName)
                .insert({
                    ...updateData,
                    user_id: req.user.id,
                    timestamp: Date.now()
                });

            if (error) throw error;
        }

        res.json({ message: 'Wellness data updated successfully' });

    } catch (error) {
        console.error('Error updating wellness data:', error);
        res.status(500).json({ message: 'Server error updating wellness data' });
    }
});

// Wellness score API
app.get('/api/wellness/score', authenticateSupabaseToken, async (req, res) => {
    try {
        const { data: wellnessData, error } = await supabase
            .from('wellness_data')
            .select('wellness_scores, updated_at')
            .eq('user_id', req.user.id)
            .single();

        if (error) {
            // If wellness data doesn't exist yet
            if (error.code === 'PGRST116') {
                return res.json({
                    overall: 72, // Default average
                    components: {
                        sleep: 80,
                        exercise: 65,
                        mindfulness: 70
                    },
                    lastUpdated: new Date().toISOString()
                });
            }
            throw error;
        }

        const { sleep, exercise, mindfulness } = wellnessData.wellness_scores;

        // Calculate overall wellness score as average of three components
        const overallScore = Math.round((sleep + exercise + mindfulness) / 3);

        res.json({
            overall: overallScore,
            components: {
                sleep,
                exercise,
                mindfulness
            },
            lastUpdated: wellnessData.updated_at
        });

    } catch (error) {
        console.error('Error calculating wellness score:', error);
        res.status(500).json({ message: 'Server error calculating wellness score' });
    }
});

// Wellness history API
app.get('/api/wellness/history', authenticateSupabaseToken, async (req, res) => {
    try {
        // Get mood data
        const { data: moodData } = await supabase
            .from('mood_entries')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false })
            .limit(30); // Last 30 entries

        // Get sleep data
        const { data: sleepData } = await supabase
            .from('sleep_entries')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false })
            .limit(30);

        // Get activities
        const { data: activities } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false })
            .limit(50);

        // Get streaks
        const { data: wellnessData } = await supabase
            .from('wellness_data')
            .select('streaks')
            .eq('user_id', req.user.id)
            .single();

        const streaks = wellnessData?.streaks || {
            meditation: 0,
            exercise: 0,
            journaling: 0,
            mood_tracking: 0
        };

        res.json({
            moodData: moodData || [],
            sleepData: sleepData || [],
            activities: activities || [],
            streaks
        });

    } catch (error) {
        console.error('Error fetching wellness history:', error);
        res.status(500).json({ message: 'Server error fetching wellness history' });
    }
});

// Record mood API
app.post('/api/wellness/mood', authenticateSupabaseToken, async (req, res) => {
    try {
        const { mood, date } = req.body;

        if (!mood || mood < 1 || mood > 10) {
            return res.status(400).json({ message: 'Valid mood value (1-10) is required' });
        }

        const moodEntry = {
            user_id: req.user.id,
            date: date || new Date().toISOString().split('T')[0],
            mood: parseInt(mood),
            timestamp: Date.now()
        };

        // Add new mood entry
        const { data, error } = await supabase
            .from('mood_entries')
            .insert(moodEntry)
            .select()
            .single();

        if (error) throw error;

        // Update streak for mood tracking
        const { data: wellnessData } = await supabase
            .from('wellness_data')
            .select('streaks')
            .eq('user_id', req.user.id)
            .single();

        const streaks = wellnessData?.streaks || {
            meditation: 0,
            exercise: 0,
            journaling: 0,
            mood_tracking: 0
        };

        streaks.mood_tracking += 1;

        // Update streaks in wellness_data
        await supabase
            .from('wellness_data')
            .upsert({
                user_id: req.user.id,
                streaks,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        res.json({
            message: 'Mood recorded successfully',
            entry: data
        });

    } catch (error) {
        console.error('Error recording mood:', error);
        res.status(500).json({ message: 'Server error recording mood' });
    }
});

// Log sleep API
app.post('/api/wellness/sleep', authenticateSupabaseToken, async (req, res) => {
    try {
        const { date, bedtime, wakeTime, quality, notes } = req.body;

        if (!date || !bedtime || !wakeTime || !quality) {
            return res.status(400).json({ message: 'Date, bedtime, wake time, and quality are required' });
        }

        const sleepEntry = {
            user_id: req.user.id,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            date,
            bedtime,
            wake_time: wakeTime,
            quality: parseInt(quality),
            notes: notes || '',
            timestamp: Date.now()
        };

        // Add new sleep entry
        const { data, error } = await supabase
            .from('sleep_entries')
            .insert(sleepEntry)
            .select()
            .single();

        if (error) throw error;

        // Update sleep score based on latest entries (average of last 7 days)
        const { data: recentEntries } = await supabase
            .from('sleep_entries')
            .select('quality')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false })
            .limit(7);

        let sleepScore = 80; // Default score

        if (recentEntries && recentEntries.length > 0) {
            const averageQuality = recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length;
            sleepScore = Math.round(averageQuality * 10); // Convert 1-10 scale to 0-100
        }

        // Get current wellness scores
        const { data: wellnessData } = await supabase
            .from('wellness_data')
            .select('wellness_scores')
            .eq('user_id', req.user.id)
            .single();

        const wellnessScores = wellnessData?.wellness_scores || {
            sleep: 80,
            exercise: 65,
            mindfulness: 70
        };

        wellnessScores.sleep = sleepScore;

        // Update wellness scores
        await supabase
            .from('wellness_data')
            .upsert({
                user_id: req.user.id,
                wellness_scores: wellnessScores,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        res.json({
            message: 'Sleep data recorded successfully',
            entry: data,
            updatedScore: sleepScore
        });

    } catch (error) {
        console.error('Error recording sleep data:', error);
        res.status(500).json({ message: 'Server error recording sleep data' });
    }
});

// Log exercise API
app.post('/api/wellness/exercise', authenticateSupabaseToken, async (req, res) => {
    try {
        const { type, duration, intensity, date } = req.body;

        if (!type || !duration || !intensity) {
            return res.status(400).json({ message: 'Exercise type, duration, and intensity are required' });
        }

        const exerciseEntry = {
            user_id: req.user.id,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            type: 'exercise',
            title: `${type} (${duration} min, ${intensity})`,
            timestamp: Date.now(),
            details: {
                type,
                duration: parseInt(duration),
                intensity,
                date: date || new Date().toISOString().split('T')[0]
            }
        };

        // Add new exercise entry
        const { data, error } = await supabase
            .from('activities')
            .insert(exerciseEntry)
            .select()
            .single();

        if (error) throw error;

        // Get current wellness data
        const { data: wellnessData } = await supabase
            .from('wellness_data')
            .select('wellness_scores, streaks')
            .eq('user_id', req.user.id)
            .single();

        const wellnessScores = wellnessData?.wellness_scores || {
            sleep: 80,
            exercise: 65,
            mindfulness: 70
        };

        const streaks = wellnessData?.streaks || {
            meditation: 0,
            exercise: 0,
            journaling: 0,
            mood_tracking: 0
        };

        // Update streak for exercise
        streaks.exercise += 1;

        // Get recent exercise activities to update exercise score
        const { data: recentActivities } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('type', 'exercise')
            .order('timestamp', { ascending: false })
            .limit(14); // Last 2 weeks

        let exerciseScore = 65; // Default score

        if (recentActivities && recentActivities.length > 0) {
            // Base score on frequency and recency
            const baseScore = Math.min(80, recentActivities.length * 10); // Max 80 for frequency
            const recencyBonus = Math.max(0, 20 - (Date.now() - recentActivities[0].timestamp) / (24 * 60 * 60 * 1000)); // Max 20 for recency
            exerciseScore = Math.round(baseScore + recencyBonus);
        }

        wellnessScores.exercise = exerciseScore;

        // Update wellness data
        await supabase
            .from('wellness_data')
            .upsert({
                user_id: req.user.id,
                wellness_scores: wellnessScores,
                streaks,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        res.json({
            message: 'Exercise recorded successfully',
            entry: data,
            updatedScore: exerciseScore
        });

    } catch (error) {
        console.error('Error recording exercise:', error);
        res.status(500).json({ message: 'Server error recording exercise' });
    }
});

// Log mindfulness API
app.post('/api/wellness/mindfulness', authenticateSupabaseToken, async (req, res) => {
    try {
        const { duration, type, date, notes } = req.body;

        if (!duration || !type) {
            return res.status(400).json({ message: 'Duration and type are required' });
        }

        const mindfulnessEntry = {
            user_id: req.user.id,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            type: 'mindfulness',
            title: `${type} meditation (${duration} min)`,
            timestamp: Date.now(),
            details: {
                type,
                duration: parseInt(duration),
                date: date || new Date().toISOString().split('T')[0],
                notes: notes || ''
            }
        };

        // Add new mindfulness entry
        const { data, error } = await supabase
            .from('activities')
            .insert(mindfulnessEntry)
            .select()
            .single();

        if (error) throw error;

        // Get current wellness data
        const { data: wellnessData } = await supabase
            .from('wellness_data')
            .select('wellness_scores, streaks')
            .eq('user_id', req.user.id)
            .single();

        const wellnessScores = wellnessData?.wellness_scores || {
            sleep: 80,
            exercise: 65,
            mindfulness: 70
        };

        const streaks = wellnessData?.streaks || {
            meditation: 0,
            exercise: 0,
            journaling: 0,
            mood_tracking: 0
        };

        // Update streak for meditation
        streaks.meditation += 1;

        // Get recent mindfulness activities
        const { data: recentMeditations } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('type', 'mindfulness')
            .order('timestamp', { ascending: false })
            .limit(10); // Last 10 sessions

        let mindfulnessScore = 70; // Default score

        if (recentMeditations && recentMeditations.length > 0) {
            // Calculate total minutes from recent sessions
            const totalMinutes = recentMeditations.reduce((sum, m) => sum + m.details.duration, 0);
            // Base score on frequency and total time
            const frequencyScore = Math.min(50, recentMeditations.length * 10); // Max 50 for frequency
            const durationScore = Math.min(50, totalMinutes / 2); // Max 50 for duration (100 minutes = 50 points)
            mindfulnessScore = Math.round(frequencyScore + durationScore);
        }

        wellnessScores.mindfulness = mindfulnessScore;

        // Update wellness data
        await supabase
            .from('wellness_data')
            .upsert({
                user_id: req.user.id,
                wellness_scores: wellnessScores,
                streaks,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        res.json({
            message: 'Mindfulness practice recorded successfully',
            entry: data,
            updatedScore: mindfulnessScore
        });

    } catch (error) {
        console.error('Error recording mindfulness practice:', error);
        res.status(500).json({ message: 'Server error recording mindfulness practice' });
    }
});

// Journal entry APIs
app.post('/api/wellness/journal', authenticateSupabaseToken, async (req, res) => {
    try {
        const { title, content, mood, date } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const journalEntry = {
            user_id: req.user.id,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            title,
            content,
            mood: mood || '',
            date: date || new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };

        // Add new journal entry
        const { data, error } = await supabase
            .from('journal_entries')
            .insert(journalEntry)
            .select()
            .single();

        if (error) throw error;

        // Update streak for journaling
        const { data: wellnessData } = await supabase
            .from('wellness_data')
            .select('streaks')
            .eq('user_id', req.user.id)
            .single();

        const streaks = wellnessData?.streaks || {
            meditation: 0,
            exercise: 0,
            journaling: 0,
            mood_tracking: 0
        };

        streaks.journaling += 1;

        // Update streaks
        await supabase
            .from('wellness_data')
            .upsert({
                user_id: req.user.id,
                streaks,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        res.json({
            message: 'Journal entry saved successfully',
            entry: data
        });

    } catch (error) {
        console.error('Error saving journal entry:', error);
        res.status(500).json({ message: 'Server error saving journal entry' });
    }
});

app.get('/api/wellness/journal', authenticateSupabaseToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        res.json(data || []);

    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ message: 'Server error fetching journal entries' });
    }
});

// Gratitude entry APIs
app.post('/api/wellness/gratitude', authenticateSupabaseToken, async (req, res) => {
    try {
        const { items, reflection, date } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'At least one gratitude item is required' });
        }

        const gratitudeEntry = {
            user_id: req.user.id,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            items,
            reflection: reflection || '',
            date: date || new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };

        // Add new gratitude entry
        const { data, error } = await supabase
            .from('gratitude_entries')
            .insert(gratitudeEntry)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Gratitude entry saved successfully',
            entry: data
        });

    } catch (error) {
        console.error('Error saving gratitude entry:', error);
        res.status(500).json({ message: 'Server error saving gratitude entry' });
    }
});

app.get('/api/wellness/gratitude', authenticateSupabaseToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('gratitude_entries')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        res.json(data || []);

    } catch (error) {
        console.error('Error fetching gratitude entries:', error);
        res.status(500).json({ message: 'Server error fetching gratitude entries' });
    }
});

// CBT thought APIs
app.post('/api/wellness/cbt', authenticateSupabaseToken, async (req, res) => {
    try {
        const { situation, automaticThought, emotion, intensity, balancedThought, date } = req.body;

        if (!situation || !automaticThought || !emotion || !intensity || !balancedThought) {
            return res.status(400).json({ message: 'All CBT thought fields are required' });
        }

        const cbtEntry = {
            user_id: req.user.id,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            situation,
            automatic_thought: automaticThought,
            emotion,
            intensity,
            balanced_thought: balancedThought,
            date: date || new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };

        // Add new CBT entry
        const { data, error } = await supabase
            .from('cbt_thoughts')
            .insert(cbtEntry)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'CBT thought entry saved successfully',
            entry: data
        });

    } catch (error) {
        console.error('Error saving CBT thought entry:', error);
        res.status(500).json({ message: 'Server error saving CBT thought entry' });
    }
});

app.get('/api/wellness/cbt', authenticateSupabaseToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cbt_thoughts')
            .select('*')
            .eq('user_id', req.user.id)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        res.json(data || []);

    } catch (error) {
        console.error('Error fetching CBT thought entries:', error);
        res.status(500).json({ message: 'Server error fetching CBT thought entries' });
    }
});

// Goals APIs
app.post('/api/wellness/goals', authenticateSupabaseToken, async (req, res) => {
    try {
        const { text, targetDate } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Goal text is required' });
        }

        const goalEntry = {
            user_id: req.user.id,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            text,
            completed: false,
            created_at: Date.now(),
            target_date: targetDate || null,
            completed_at: null
        };

        // Add new goal
        const { data, error } = await supabase
            .from('goals')
            .insert(goalEntry)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Goal added successfully',
            goal: data
        });

    } catch (error) {
        console.error('Error adding goal:', error);
        res.status(500).json({ message: 'Server error adding goal' });
    }
});

app.put('/api/wellness/goals/:id', authenticateSupabaseToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { completed, text, targetDate } = req.body;

        // Get current goal
        const { data: existingGoal, error: getError } = await supabase
            .from('goals')
            .select('*')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (getError) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        // Update goal
        const updateData = {};

        if (text !== undefined) updateData.text = text;
        if (targetDate !== undefined) updateData.target_date = targetDate;
        if (completed !== undefined) {
            updateData.completed = completed;
            updateData.completed_at = completed ? Date.now() : null;
        }

        const { data, error } = await supabase
            .from('goals')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Goal updated successfully',
            goal: data
        });

    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ message: 'Server error updating goal' });
    }
});

app.get('/api/wellness/goals', authenticateSupabaseToken, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data || []);

    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ message: 'Server error fetching goals' });
    }
});

app.delete('/api/wellness/goals/:id', authenticateSupabaseToken, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.json({ message: 'Goal deleted successfully' });

    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ message: 'Server error deleting goal' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Supabase integration active - using ${supabaseUrl}`);
});