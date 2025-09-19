# MindfulPath - Digital Wellbeing Platform

A comprehensive digital mental health platform offering mood tracking, wellness assessments, meditation tools, and 24/7 AI support for your mental wellbeing journey.

## Features

### 🧠 **Intelligent AI Companion**
- 24/7 mental health support chatbot with crisis detection
- Personalized conversations and resource recommendations
- Evidence-based responses for anxiety, depression, and stress
- Crisis intervention system with immediate support resources

### 📊 **Personal Wellness Dashboard**
- Interactive mood tracking with visual charts
- Comprehensive wellness score with detailed breakdown
- Activity tracking and progress visualization
- Goal setting and streak tracking

### 🛠️ **Evidence-Based Wellness Tools**
- **Guided Breathing Exercises**: 4-7-8, Box Breathing, Coherent Breathing
- **Meditation Timer**: Customizable sessions with ambient sounds
- **CBT Thought Tracker**: Cognitive Behavioral Therapy tools
- **Sleep Optimization**: Sleep hygiene tracking and tips
- **Gratitude Practice**: Daily gratitude journaling
- **Crisis Support**: Immediate access to professional resources

### 🌟 **Unique Features**
- Animated gradient backgrounds with floating wellness elements
- Real-time mood pattern analysis and insights
- Personalized wellness recommendations
- Accessibility-first design with full keyboard navigation
- Progressive Web App capabilities for offline use

### 🎨 **Modern Design**
- Calming gradient backgrounds with unique animations
- Responsive design for all devices
- Glassmorphism effects and smooth transitions
- Intuitive user interface with wellness-focused colors

## Mental Health Resources

### Crisis Support
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

### Professional Support
- Licensed therapist directory
- Online therapy platform integration
- Support group finder
- Psychiatric care resources

### Educational Content
- Understanding anxiety and depression
- Stress management techniques
- Sleep hygiene best practices
- Work-life balance strategies

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Authentication**: Supabase Authentication (migrated from Firebase)
- **Database**: Supabase (PostgreSQL) and MongoDB
- **Design**: CSS Grid, Flexbox, CSS Custom Properties
- **Animations**: CSS Animations, Canvas API
- **Storage**: Supabase Storage and Local Storage
- **Accessibility**: WCAG 2.1 AA compliant

## Key Wellness Components

### Mood Tracking
Track daily emotions with visual feedback and pattern recognition. The interactive mood chart helps identify triggers and positive patterns over time.

### Breathing Exercises
Three scientifically-backed breathing techniques:
- **4-7-8 Breathing**: For anxiety relief and better sleep
- **Box Breathing**: For focus and stress reduction (used by Navy SEALs)
- **Coherent Breathing**: For emotional balance and heart rate variability

### Meditation Tools
Customizable meditation sessions with:
- Flexible duration (5-30 minutes)
- Background sound options
- Progress tracking
- Mindfulness guidance

### CBT Tools
Cognitive Behavioral Therapy features include:
- Thought pattern analysis
- Automatic thought tracking
- Balanced thinking exercises
- Emotional intensity monitoring

### Sleep Optimization
Comprehensive sleep tracking with:
- Sleep quality assessment
- Bedtime routine suggestions
- Sleep hygiene education
- Personalized insights

## Privacy & Security

- User data stored securely in Supabase with row-level security
- JWT authentication for secure API access
- Encrypted user credentials with Supabase Auth
- Optional local storage for offline capabilities
- No personal information shared with third parties
- Anonymous usage analytics only
- HIPAA-compliant design principles

## Accessibility Features

- Full keyboard navigation support
- Screen reader compatibility
- High contrast mode
- Reduced motion preferences
- ARIA labels and semantic HTML
- Skip navigation links

## Crisis Prevention

Advanced crisis detection system that:
- Monitors for crisis keywords in conversations
- Provides immediate access to professional resources
- Offers safety planning tools
- Connects users with 24/7 support services

## Evidence-Based Approach

All wellness tools and content are based on:
- Peer-reviewed research
- Clinical psychology best practices
- Cognitive Behavioral Therapy principles
- Mindfulness-based interventions
- Positive psychology research

## Getting Started

### Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/digital-wellbeing-platform.git
   cd digital-wellbeing-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/mindful-path
   JWT_SECRET=your-secret-key-change-in-production
   SUPABASE_URL=https://uatbksfpmbrqntbfxxkn.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   ```

4. Configure Supabase:
   - Create a project at [supabase.com](https://supabase.com) if you don't have one
   - Update the configuration in `js/supabase-config.js`
   - Note: Currently the app uses sample credentials for demonstration purposes

5. Start the server:
   ```bash
   npm start
   ```
   This will start the server on port 4000 using the server-supabase.js file

6. Access the application:
   Open your browser and navigate to `http://localhost:4000`

### Recent Updates

1. **Fixed Authentication System**:
   - Fixed issues with login and registration forms
   - Properly hiding register form after login
   - Improved form button styling and positioning

2. **Layout Improvements**:
   - Fixed footer positioning to always stay at the bottom of the page
   - Added responsive design improvements for various screen sizes
   - Enhanced user interface with better form validation and feedback

3. **User Experience Enhancements**:
   - Improved form interactions with subtle animations
   - Better visual feedback for form submissions
   - More intuitive authentication flow

### Troubleshooting

If you encounter any issues:

1. **Server won't start**:
   - Check if another process is using port 4000
   - Verify all dependencies are installed with `npm install`
   - Check for errors in the server console
   - Make sure .env file exists with the required configuration

### Development Todo List

1. **Authentication Fixes**:
   - ✅ Fix login and registration form issues
   - ✅ Hide register form after login
   - ✅ Fix footer positioning
   - 🔄 Fix Supabase authentication configuration (Currently using sample credentials)

2. **UI Improvements**:
   - ✅ Enhance submit button styling
   - ✅ Improve form weight and visual appearance
   - ✅ Fix footer layout
   - ✅ Update footer content

3. **Future Enhancements**:
   - Implement proper error handling for authentication failures
   - Add form validation with better error messages
   - Enhance mobile responsiveness
   - Implement offline mode capabilities

2. **Authentication issues**:
   - Clear browser cache and local storage
   - Check Supabase configuration in js/supabase-config.js
   - Review browser console for JavaScript errors

3. **Layout problems**:
   - Try different browsers to isolate browser-specific issues
   - Check if all CSS files are properly loading
   - Verify that footer-position-fix.css is included

### Code Structure

```
digital-wellbeing-platform/
│
├── assets/            # Static assets like images
│
├── css/               # All styling files
│   ├── styles.css     # Main stylesheet
│   ├── auth.css       # Authentication styling
│   ├── footer-position-fix.css  # Footer positioning fix
│   └── ...            # Various component-specific styles
│
├── js/                # JavaScript files
│   ├── app.js         # Main application logic
│   ├── supabase-config.js  # Supabase configuration
│   ├── auth-form-fixes-post-login.js  # Auth form fixes
│   └── ...            # Component and feature scripts
│
├── server-supabase.js # Main server file
├── package.json       # Project dependencies
└── README.md          # Project documentation
```

### Key Files

1. **Server**: 
   - `server-supabase.js` - Main server file that starts the application

2. **Authentication**:
   - `js/supabase-config.js` - Supabase configuration
   - `js/supabase-auth.js` - Authentication logic
   - `js/auth-form-fixes-post-login.js` - Fixes for auth forms after login

3. **Styling**:
   - `css/styles.css` - Main stylesheet
   - `css/footer-position-fix.css` - Footer positioning fix
   - `css/auth.css` - Authentication form styling

### Step-by-Step Usage Guide

1. **Start the Server**:
   ```bash
   npm start
   ```
   This will launch the server on port 4000.

2. **Access the Platform**:
   Open your browser and navigate to `http://localhost:4000`.

3. **Register a New Account**:
   - Click on the "Login" button in the top navigation
   - Click on the "Register" tab
   - Fill out the registration form with your details
   - Accept the Terms of Service
   - Click "Create Account"

4. **Login to Your Account**:
   - Click on the "Login" button in the top navigation
   - Enter your email and password
   - Click "Sign In"

5. **Using the Dashboard**:
   - After logging in, you'll be redirected to your personal dashboard
   - Track your mood, sleep, and other wellness metrics
   - Access meditation tools and wellness assessments
   - Chat with the AI companion for mental health support

6. **Wellness Tools**:
   - Access guided breathing exercises
   - Use the meditation timer
   - Track thoughts with the CBT thought tracker
   - Practice gratitude with the gratitude journal

### API Endpoints

The platform provides several API endpoints for managing wellness data:

1. **Authentication**:
   - `/api/auth/*` - Supabase authentication endpoints

2. **User Profile**:
   - `GET /api/user/profile` - Get user profile information
   - `PUT /api/user/profile` - Update user profile information

3. **Wellness Data**:
   - `GET /api/wellness/data` - Get all wellness data for the user
   - `POST /api/wellness/data` - Add new wellness data

4. **Specific Wellness Endpoints**:
   - `POST /api/wellness/mood` - Record mood
   - `POST /api/wellness/sleep` - Log sleep data
   - `POST /api/wellness/exercise` - Log exercise activity
   - `POST /api/wellness/mindfulness` - Log mindfulness practice
   - `POST /api/wellness/journal` - Create journal entry
   - `GET /api/wellness/journal` - Get journal entries
   - `POST /api/wellness/goals` - Create new goals
   - `GET /api/wellness/goals` - Get user goals

All API endpoints require authentication with a valid Supabase token.

### User Guide

1. Sign up or log in using Supabase authentication
2. Start with the mood tracker to establish baseline data
3. Explore wellness tools based on your current needs
4. Chat with MindBot for personalized support
5. Set wellness goals and track your progress

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is created for educational and wellness promotion purposes. Mental health resources and crisis support information are provided as public service.

---

**Disclaimer**: This platform provides educational content and support tools but is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with questions about medical conditions. If you're experiencing a mental health crisis, contact emergency services or call 988.

**Made with 💚 for mental wellness**