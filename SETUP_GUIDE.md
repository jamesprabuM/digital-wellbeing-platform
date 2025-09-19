# 🚀 Complete Setup Guide for MindfulPath Digital Wellbeing Platform

This guide will help you set up and run the MindfulPath Digital Wellbeing Platform from scratch in a new folder.

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your system:

### Required Software
1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

3. **Supabase Account** (for database and authentication)
   - Create a free account at: https://supabase.com
   - No local database installation required

4. **A modern web browser** (Chrome, Firefox, Safari, or Edge)

## 🛠️ Step-by-Step Setup Instructions

### Step 1: Clone the Repository

Open your terminal/command prompt and navigate to where you want to create the project folder:

```bash
# Navigate to your desired directory (e.g., Documents)
cd Documents

# Clone the repository
git clone https://github.com/jamesprabuM/digital-wellbeing-platform.git

# Navigate into the project folder
cd digital-wellbeing-platform
```

### Step 2: Install Dependencies

Install all required Node.js packages:

```bash
# Install all dependencies
npm install
```

**Expected output:** You should see packages being downloaded and installed. This may take a few minutes.

### Step 3: Supabase Setup

1. **Create a Supabase Account**:
   - Go to https://supabase.com and sign up for a free account
   - Create a new project
   - Choose a database password when prompted

2. **Get Your Supabase Credentials**:
   - In your Supabase dashboard, go to **Settings** → **API**
   - Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy your **Service Role Key** (anon public key for client-side, service_role for server-side)
   - **Important**: Use the `service_role` key for the server setup

3. **Database Tables** (Optional):
   - Supabase will automatically create tables as needed
   - The application will handle table creation through the API

### Step 4: Environment Configuration

Create a `.env` file in the root directory of your project:

```bash
# Create .env file from the example template
cp .env.example .env  # On Windows: copy .env.example .env
```

Or create it manually and add the following content to your `.env` file:

```env
# Server Configuration
PORT=4000

# Supabase Configuration (Required)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Optional: Additional Security
JWT_SECRET=your-super-secure-secret-key-change-this-in-production
```

**Important:** Replace the placeholder values with your actual Supabase credentials:

- Replace `https://your-project-id.supabase.co` with your actual Supabase URL
- Replace `your-service-role-key-here` with your actual service role key
- Change `your-super-secure-secret-key-change-this-in-production` to a strong, random string for security

**To get your Supabase credentials:**
1. Log into your Supabase dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **URL** and **service_role** key (NOT the anon key for server setup)

### Step 5: Start the Application

Now you're ready to run the application:

```bash
# Start the server
npm start
```

**Expected output:**
```
🔑 Using Supabase for authentication and data storage
Server running on port 4000
```

### Step 6: Access the Application

Open your web browser and navigate to:
```
http://localhost:4000
```

You should see the MindfulPath Digital Wellbeing Platform homepage!

## 🎯 Quick Test

To verify everything is working:

1. **Homepage Test**: Visit `http://localhost:4000` - you should see the platform interface
2. **Registration Test**: Click "Login" → "Register" and create a test account
3. **Login Test**: Log in with your test account
4. **Dashboard Test**: After login, you should see your personal wellness dashboard

## 🔧 Troubleshooting Common Issues

### Issue 1: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Option A: Use a different port
# Edit your .env file and change PORT=4000 to PORT=4001

# Option B: Kill the process using the port
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F

# macOS/Linux:
lsof -ti:4000 | xargs kill -9
```

### Issue 2: Supabase Connection Error
**Error:** `Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_KEY`

**Solutions:**
- Verify your `.env` file contains the correct `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Check that your Supabase project is active and the credentials are correct
- Ensure you're using the `service_role` key, not the `anon` key for server setup
- Verify your Supabase project URL format: `https://xxxxx.supabase.co`

### Issue 3: Missing Dependencies
**Error:** `Cannot find module 'express'` or similar

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules  # On Windows: rmdir /s node_modules
npm install
```

### Issue 4: Permission Errors
**Error:** Permission denied or access errors

**Solution:**
```bash
# Run with administrator/sudo privileges
# Windows: Run Command Prompt as Administrator
# macOS/Linux: Use sudo for npm install if needed
sudo npm install
```

### Issue 5: Missing Environment Variables
**Error:** `Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_KEY`

**Solution:**
- Ensure your `.env` file exists in the root directory
- Verify that `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set correctly
- Make sure there are no extra spaces or quotes around the values
- Restart the server after updating the `.env` file

## 📂 Project Structure Overview

After setup, your project folder should look like this:

```
digital-wellbeing-platform/
├── 📁 assets/                 # Images and static files
├── 📁 css/                    # Stylesheets
├── 📁 js/                     # JavaScript files
├── 📁 node_modules/           # Dependencies (created after npm install)
├── 📄 .env                    # Environment variables (you create this)
├── 📄 .gitignore             # Git ignore rules
├── 📄 index.html             # Main HTML file
├── 📄 manifest.json          # PWA manifest
├── 📄 package.json           # Project configuration
├── 📄 README.md              # Project documentation
├── 📄 server.js              # Main server file
├── 📄 SETUP_GUIDE.md         # This setup guide
└── 📄 sw.js                  # Service worker
```

## 🚀 Development Workflow

### For Development
```bash
# Install nodemon for auto-restart during development
npm install -g nodemon

# Start with auto-restart
npm run dev
```

### For Production
```bash
# Regular start
npm start
```

## 🔒 Security Notes

1. **Change Default Secrets**: Always change the `JWT_SECRET` in your `.env` file
2. **Environment Variables**: Never commit your `.env` file to version control
3. **Database Security**: Use strong passwords for production databases
4. **HTTPS**: Use HTTPS in production environments

## 📱 Accessing from Other Devices

To access the application from other devices on your network:

1. Find your computer's IP address:
   ```bash
   # Windows:
   ipconfig
   
   # macOS/Linux:
   ifconfig
   ```

2. Access from other devices using:
   ```
   http://YOUR_IP_ADDRESS:4000
   ```

## 🔄 Updating the Application

To get the latest updates:

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart the server
npm start
```

## 📞 Getting Help

If you encounter issues not covered in this guide:

1. Check the main [README.md](README.md) for additional information
2. Look at the browser console for JavaScript errors (F12 → Console)
3. Check the server terminal for error messages
4. Create an issue on the GitHub repository

## 🎉 Next Steps

Once you have the platform running:

1. **Explore Features**: Try the mood tracker, breathing exercises, and meditation tools
2. **Customize**: Modify the CSS files to change the appearance
3. **Extend**: Add new features by modifying the JavaScript files
4. **Deploy**: Consider deploying to platforms like Heroku, Vercel, or AWS

---

**Congratulations! 🎊** You now have the MindfulPath Digital Wellbeing Platform running locally. Start your wellness journey today!

**Made with 💚 for mental wellness**