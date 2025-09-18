// ===== BACKEND SERVER FOR DIGITAL WELLBEING PLATFORM =====
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindful-path', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Schema Definitions
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
});

const wellnessDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    wellnessData: {
        sleep: { type: Number, default: 80 },
        exercise: { type: Number, default: 65 },
        mindfulness: { type: Number, default: 70 }
    },
    moodData: [{ 
        date: String,
        mood: Number,
        timestamp: Number
    }],
    sleepData: [{ 
        id: String,
        date: String,
        bedtime: String,
        wakeTime: String,
        quality: Number,
        notes: String,
        timestamp: Number
    }],
    activities: [{ 
        id: String,
        type: String,
        title: String,
        timestamp: Number
    }],
    journalEntries: [{
        id: String,
        title: String,
        content: String,
        mood: String,
        date: String,
        timestamp: Number
    }],
    gratitudeEntries: [{
        id: String,
        items: [String],
        reflection: String,
        date: String,
        timestamp: Number
    }],
    cbtThoughts: [{
        id: String,
        situation: String,
        automaticThought: String,
        emotion: String,
        intensity: String,
        balancedThought: String,
        date: String,
        timestamp: Number
    }],
    goals: [{
        id: String,
        text: String,
        completed: Boolean,
        createdAt: Number,
        targetDate: Number,
        completedAt: Number
    }],
    streaks: {
        meditation: { type: Number, default: 0 },
        exercise: { type: Number, default: 0 },
        journaling: { type: Number, default: 0 },
        mood_tracking: { type: Number, default: 0 }
    },
    lastUpdated: { type: Date, default: Date.now }
});

// Define models
const User = mongoose.model('User', userSchema);
const WellnessData = mongoose.model('WellnessData', wellnessDataSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }
        
        // Generate username from email if not provided
        const username = name.toLowerCase().replace(/\s/g, '_') + Math.floor(Math.random() * 1000);
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user
        const user = new User({
            username,
            name,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        // Create default wellness data for new user
        const wellnessData = new WellnessData({
            userId: user._id
        });
        
        await wellnessData.save();
        
        res.status(201).json({ 
            success: true,
            message: 'User registered successfully' 
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Update last login
        user.lastLogin = Date.now();
        await user.save();
        
        // Generate tokens
        const token = jwt.sign({ 
            id: user._id,
            email: user.email,
            username: user.username
        }, JWT_SECRET, { expiresIn: '1d' });
        
        const refreshToken = jwt.sign({
            id: user._id
        }, JWT_SECRET + user.password, { expiresIn: '7d' });
        
        res.json({
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name || user.username,
                username: user.username,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Token refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token required' });
        }
        
        // Decode without verification to get user ID
        const decoded = jwt.decode(refreshToken);
        if (!decoded || !decoded.id) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }
        
        // Get user to access their password hash (used as part of the secret)
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Verify the refresh token using the combined secret
        try {
            jwt.verify(refreshToken, JWT_SECRET + user.password);
        } catch (err) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }
        
        // Generate new tokens
        const newToken = jwt.sign({ 
            id: user._id,
            email: user.email,
            username: user.username
        }, JWT_SECRET, { expiresIn: '1d' });
        
        const newRefreshToken = jwt.sign({
            id: user._id
        }, JWT_SECRET + user.password, { expiresIn: '7d' });
        
        res.json({
            token: newToken,
            refreshToken: newRefreshToken
        });
        
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ message: 'Server error during token refresh' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    // Client-side logout is sufficient for JWT auth
    // We don't need to do anything server-side for a simple logout
    res.json({ message: 'Logged out successfully' });
});

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            // For security reasons, don't reveal that the email doesn't exist
            return res.json({ message: 'If your email is registered, you will receive a password reset link' });
        }
        
        // Generate password reset token
        const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        
        // In a real implementation, you would send an email with the reset link
        // For this example, we'll just return the token
        console.log(`Reset token for ${email}: ${resetToken}`);
        
        res.json({ message: 'If your email is registered, you will receive a password reset link' });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }
        
        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        res.json({ message: 'Password has been reset successfully' });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});

// User routes (protected)
app.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
        
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            id: user._id,
            name: user.name || user.username,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        });
        
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        
        // Find user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update fields if provided
        if (name) user.name = name;
        if (email) {
            // Check if email is already in use by another user
            const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
            user.email = email;
        }
        
        await user.save();
        
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name || user.username,
                username: user.username,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Wellness data routes (protected)
app.get('/api/wellness/data', authenticateToken, async (req, res) => {
    try {
        const wellnessData = await WellnessData.findOne({ userId: req.user.id });
        
        if (!wellnessData) {
            // Create default wellness data if it doesn't exist
            const newWellnessData = new WellnessData({
                userId: req.user.id
            });
            
            await newWellnessData.save();
            return res.json(newWellnessData);
        }
        
        res.json(wellnessData);
        
    } catch (error) {
        console.error('Error fetching wellness data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/wellness/data', authenticateToken, async (req, res) => {
    try {
        const { key, value } = req.body;
        
        if (!key) {
            return res.status(400).json({ message: 'Key is required' });
        }
        
        let wellnessData = await WellnessData.findOne({ userId: req.user.id });
        
        if (!wellnessData) {
            // Create if doesn't exist
            wellnessData = new WellnessData({
                userId: req.user.id
            });
        }
        
        // Special handling for nested data
        if (key === 'wellnessData') {
            wellnessData.wellnessData = value;
        } else {
            wellnessData[key] = value;
        }
        
        wellnessData.lastUpdated = Date.now();
        
        await wellnessData.save();
        
        res.json({ message: 'Wellness data updated successfully' });
        
    } catch (error) {
        console.error('Error updating wellness data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Wellness score API
app.get('/api/wellness/score', authenticateToken, async (req, res) => {
    try {
        const wellnessData = await WellnessData.findOne({ userId: req.user.id });
        
        if (!wellnessData) {
            return res.status(404).json({ message: 'Wellness data not found' });
        }
        
        const { sleep, exercise, mindfulness } = wellnessData.wellnessData;
        
        // Calculate overall wellness score as average of three components
        const overallScore = Math.round((sleep + exercise + mindfulness) / 3);
        
        res.json({
            overall: overallScore,
            components: {
                sleep,
                exercise,
                mindfulness
            },
            lastUpdated: wellnessData.lastUpdated
        });
        
    } catch (error) {
        console.error('Error calculating wellness score:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Wellness history API
app.get('/api/wellness/history', authenticateToken, async (req, res) => {
    try {
        const wellnessData = await WellnessData.findOne({ userId: req.user.id });
        
        if (!wellnessData) {
            return res.status(404).json({ message: 'Wellness data not found' });
        }
        
        res.json({
            moodData: wellnessData.moodData || [],
            sleepData: wellnessData.sleepData || [],
            activities: wellnessData.activities || [],
            streaks: wellnessData.streaks || {}
        });
        
    } catch (error) {
        console.error('Error fetching wellness history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Record mood API
app.post('/api/wellness/mood', authenticateToken, async (req, res) => {
    try {
        const { mood, date } = req.body;
        
        if (!mood || mood < 1 || mood > 10) {
            return res.status(400).json({ message: 'Valid mood value (1-10) is required' });
        }
        
        let wellnessData = await WellnessData.findOne({ userId: req.user.id });
        
        if (!wellnessData) {
            wellnessData = new WellnessData({
                userId: req.user.id
            });
        }
        
        const moodEntry = {
            date: date || new Date().toISOString().split('T')[0],
            mood: parseInt(mood),
            timestamp: Date.now()
        };
        
        // Add new mood entry
        wellnessData.moodData.push(moodEntry);
        
        // Update streak for mood tracking
        wellnessData.streaks.mood_tracking += 1;
        
        wellnessData.lastUpdated = Date.now();
        await wellnessData.save();
        
        res.json({
            message: 'Mood recorded successfully',
            entry: moodEntry
        });
        
    } catch (error) {
        console.error('Error recording mood:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Log sleep API
app.post('/api/wellness/sleep', authenticateToken, async (req, res) => {
    try {
        const { date, bedtime, wakeTime, quality, notes } = req.body;
        
        if (!date || !bedtime || !wakeTime || !quality) {
            return res.status(400).json({ message: 'Date, bedtime, wake time, and quality are required' });
        }
        
        let wellnessData = await WellnessData.findOne({ userId: req.user.id });
        
        if (!wellnessData) {
            wellnessData = new WellnessData({
                userId: req.user.id
            });
        }
        
        const sleepEntry = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            date,
            bedtime,
            wakeTime,
            quality: parseInt(quality),
            notes: notes || '',
            timestamp: Date.now()
        };
        
        // Add new sleep entry
        wellnessData.sleepData.push(sleepEntry);
        
        // Update sleep score based on latest entries (average of last 7 days)
        const recentEntries = [...wellnessData.sleepData].sort((a, b) => b.timestamp - a.timestamp).slice(0, 7);
        if (recentEntries.length > 0) {
            const averageQuality = recentEntries.reduce((sum, entry) => sum + entry.quality, 0) / recentEntries.length;
            wellnessData.wellnessData.sleep = Math.round(averageQuality * 10); // Convert 1-10 scale to 0-100
        }
        
        wellnessData.lastUpdated = Date.now();
        await wellnessData.save();
        
        res.json({
            message: 'Sleep data recorded successfully',
            entry: sleepEntry,
            updatedScore: wellnessData.wellnessData.sleep
        });
        
    } catch (error) {
        console.error('Error recording sleep data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Log exercise API
app.post('/api/wellness/exercise', authenticateToken, async (req, res) => {
    try {
        const { type, duration, intensity, date } = req.body;
        
        if (!type || !duration || !intensity) {
            return res.status(400).json({ message: 'Exercise type, duration, and intensity are required' });
        }
        
        let wellnessData = await WellnessData.findOne({ userId: req.user.id });
        
        if (!wellnessData) {
            wellnessData = new WellnessData({
                userId: req.user.id
            });
        }
        
        const exerciseEntry = {
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
        wellnessData.activities.push(exerciseEntry);
        
        // Update streak for exercise
        wellnessData.streaks.exercise += 1;
        
        // Update exercise score based on frequency
        const recentActivities = wellnessData.activities
            .filter(a => a.type === 'exercise')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 14); // Last 2 weeks
            
        if (recentActivities.length > 0) {
            // Base score on frequency and recency
            const baseScore = Math.min(80, recentActivities.length * 10); // Max 80 for frequency
            const recencyBonus = Math.max(0, 20 - (Date.now() - recentActivities[0].timestamp) / (24 * 60 * 60 * 1000)); // Max 20 for recency
            wellnessData.wellnessData.exercise = Math.round(baseScore + recencyBonus);
        }
        
        wellnessData.lastUpdated = Date.now();
        await wellnessData.save();
        
        res.json({
            message: 'Exercise recorded successfully',
            entry: exerciseEntry,
            updatedScore: wellnessData.wellnessData.exercise
        });
        
    } catch (error) {
        console.error('Error recording exercise:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Log mindfulness API
app.post('/api/wellness/mindfulness', authenticateToken, async (req, res) => {
    try {
        const { duration, type, date, notes } = req.body;
        
        if (!duration || !type) {
            return res.status(400).json({ message: 'Duration and type are required' });
        }
        
        let wellnessData = await WellnessData.findOne({ userId: req.user.id });
        
        if (!wellnessData) {
            wellnessData = new WellnessData({
                userId: req.user.id
            });
        }
        
        const mindfulnessEntry = {
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
        wellnessData.activities.push(mindfulnessEntry);
        
        // Update streak for meditation
        wellnessData.streaks.meditation += 1;
        
        // Update mindfulness score based on frequency and duration
        const recentMeditations = wellnessData.activities
            .filter(a => a.type === 'mindfulness')
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10); // Last 10 sessions
            
        if (recentMeditations.length > 0) {
            // Calculate total minutes from recent sessions
            const totalMinutes = recentMeditations.reduce((sum, m) => sum + m.details.duration, 0);
            // Base score on frequency and total time
            const frequencyScore = Math.min(50, recentMeditations.length * 10); // Max 50 for frequency
            const durationScore = Math.min(50, totalMinutes / 2); // Max 50 for duration (100 minutes = 50 points)
            wellnessData.wellnessData.mindfulness = Math.round(frequencyScore + durationScore);
        }
        
        wellnessData.lastUpdated = Date.now();
        await wellnessData.save();
        
        res.json({
            message: 'Mindfulness practice recorded successfully',
            entry: mindfulnessEntry,
            updatedScore: wellnessData.wellnessData.mindfulness
        });
        
    } catch (error) {
        console.error('Error recording mindfulness practice:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});