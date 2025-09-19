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

3. **MongoDB** (optional - for local database)
   - Download from: https://www.mongodb.com/try/download/community
   - Alternative: Use MongoDB Atlas (cloud database)

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

### Step 3: Database Setup (Choose One Option)

#### Option A: Local MongoDB (Recommended for development)
1. Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - **Windows**: MongoDB should start automatically after installation
   - **macOS**: `brew services start mongodb/brew/mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

#### Option B: MongoDB Atlas (Cloud Database)
1. Create a free account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get your connection string
4. Replace the `MONGODB_URI` in Step 4 with your Atlas connection string

### Step 4: Environment Configuration

Create a `.env` file in the root directory of your project:

```bash
# Create .env file
touch .env  # On Windows, you can create this file in your text editor
```

Add the following content to your `.env` file:

```env
# Server Configuration
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mindful-path

# Security Configuration
JWT_SECRET=your-super-secure-secret-key-change-this-in-production

# Optional: Supabase Configuration (for advanced features)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

**Important:** Change `your-super-secure-secret-key-change-this-in-production` to a strong, random string for security.

### Step 5: Start the Application

Now you're ready to run the application:

```bash
# Start the server
npm start
```

**Expected output:**
```
Server running on port 3001
Connected to MongoDB
```

### Step 6: Access the Application

Open your web browser and navigate to:
```
http://localhost:3001
```

You should see the MindfulPath Digital Wellbeing Platform homepage!

## 🎯 Quick Test

To verify everything is working:

1. **Homepage Test**: Visit `http://localhost:3001` - you should see the platform interface
2. **Registration Test**: Click "Login" → "Register" and create a test account
3. **Login Test**: Log in with your test account
4. **Dashboard Test**: After login, you should see your personal wellness dashboard

## 🔧 Troubleshooting Common Issues

### Issue 1: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Option A: Use a different port
# Edit your .env file and change PORT=3001 to PORT=3002

# Option B: Kill the process using the port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# macOS/Linux:
lsof -ti:3001 | xargs kill -9
```

### Issue 2: MongoDB Connection Error
**Error:** `MongoDB connection error`

**Solutions:**
- Ensure MongoDB is running on your system
- Check if the `MONGODB_URI` in your `.env` file is correct
- For MongoDB Atlas, verify your connection string and IP whitelist

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
   http://YOUR_IP_ADDRESS:3001
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