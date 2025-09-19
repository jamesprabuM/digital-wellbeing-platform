/**
 * MindfulPath API Integration
 * 
 * Ensures the platform works properly even when the backend server is unavailable
 * by providing fallback functionality.
 */

(function () {
    const API_BASE_URL = 'http://localhost:3000/api';

    class MindfulPathAPI {
        constructor() {
            this.isServerAvailable = false;
            this.checkServerStatus();

            // Setup global API client
            window.apiClient = this;

            console.log('🌐 MindfulPath API Integration initialized');
        }

        async checkServerStatus() {
            try {
                const response = await fetch(`${API_BASE_URL}/status`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    timeout: 2000
                });

                if (response.ok) {
                    this.isServerAvailable = true;
                    console.log('✅ Backend server is available');
                } else {
                    this.enableOfflineMode();
                }
            } catch (error) {
                console.log('⚠️ Backend server unavailable, enabling offline mode');
                this.enableOfflineMode();
            }
        }

        enableOfflineMode() {
            this.isServerAvailable = false;
            console.log('🔄 MindfulPath running in offline mode');

            // Mock all API endpoints with localStorage
            this.setupOfflineMocks();
        }

        setupOfflineMocks() {
            // Mock authentication
            if (!window.authManager) {
                window.authManager = {
                    isLoggedIn: false,
                    currentUser: null,

                    login: (email, password) => {
                        if (email && password) {
                            // Simple offline validation
                            const storedUsers = JSON.parse(localStorage.getItem('mindfulpath_users') || '[]');
                            const user = storedUsers.find(u => u.email === email);

                            if (user && user.password === password) {
                                this.currentUser = user;
                                this.isLoggedIn = true;
                                localStorage.setItem('mindfulpath_current_user', JSON.stringify(user));
                                return Promise.resolve({ success: true, user });
                            }

                            return Promise.reject({ message: 'Invalid credentials' });
                        }
                        return Promise.reject({ message: 'Email and password required' });
                    },

                    register: (data) => {
                        if (data.email && data.password) {
                            const storedUsers = JSON.parse(localStorage.getItem('mindfulpath_users') || '[]');

                            // Check if user already exists
                            if (storedUsers.some(u => u.email === data.email)) {
                                return Promise.reject({ message: 'User already exists' });
                            }

                            // Add new user
                            const newUser = {
                                id: Date.now(),
                                email: data.email,
                                password: data.password,
                                name: data.name || data.email.split('@')[0],
                                created: new Date().toISOString()
                            };

                            storedUsers.push(newUser);
                            localStorage.setItem('mindfulpath_users', JSON.stringify(storedUsers));

                            this.currentUser = newUser;
                            this.isLoggedIn = true;
                            localStorage.setItem('mindfulpath_current_user', JSON.stringify(newUser));

                            return Promise.resolve({ success: true, user: newUser });
                        }
                        return Promise.reject({ message: 'Email and password required' });
                    },

                    logout: () => {
                        this.currentUser = null;
                        this.isLoggedIn = false;
                        localStorage.removeItem('mindfulpath_current_user');
                        return Promise.resolve({ success: true });
                    },

                    checkAuth: () => {
                        const storedUser = localStorage.getItem('mindfulpath_current_user');
                        if (storedUser) {
                            this.currentUser = JSON.parse(storedUser);
                            this.isLoggedIn = true;
                            return Promise.resolve({ success: true, user: this.currentUser });
                        }
                        return Promise.resolve({ success: false });
                    }
                };
            }

            // Initialize with default data if needed
            this.initDefaultData();
        }

        initDefaultData() {
            // Initialize users if none exist
            if (!localStorage.getItem('mindfulpath_users')) {
                const defaultUsers = [
                    {
                        id: 1,
                        email: 'demo@mindfulpath.app',
                        password: 'demo123',
                        name: 'Demo User',
                        created: new Date().toISOString()
                    }
                ];
                localStorage.setItem('mindfulpath_users', JSON.stringify(defaultUsers));
                console.log('📝 Created default demo user: demo@mindfulpath.app / demo123');
            }

            // Initialize wellness data if none exists
            if (!localStorage.getItem('wellnessData')) {
                const defaultWellnessData = {
                    sleep: 70,
                    exercise: 65,
                    mindfulness: 75
                };
                localStorage.setItem('wellnessData', JSON.stringify(defaultWellnessData));
            }

            // Initialize mood data if none exists
            if (!localStorage.getItem('moodData')) {
                const now = new Date();
                const defaultMoodData = [
                    {
                        date: new Date(now.setDate(now.getDate() - 1)).toISOString(),
                        mood: 3,
                        notes: "Average day"
                    },
                    {
                        date: new Date(now.setDate(now.getDate() - 1)).toISOString(),
                        mood: 4,
                        notes: "Good progress on my goals"
                    },
                    {
                        date: new Date().toISOString(),
                        mood: 3,
                        notes: "Feeling neutral today"
                    }
                ];
                localStorage.setItem('moodData', JSON.stringify(defaultMoodData));
            }
        }

        // Utility function to safely store data
        storeData(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('Failed to store data:', error);
                return false;
            }
        }

        // Utility function to safely retrieve data
        getData(key, defaultValue = null) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : defaultValue;
            } catch (error) {
                console.error('Failed to retrieve data:', error);
                return defaultValue;
            }
        }
    }

    // Initialize API integration
    window.mindfulPathAPI = new MindfulPathAPI();
})();