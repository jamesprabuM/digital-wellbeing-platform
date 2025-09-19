/**
 * API Client for Digital Wellbeing Platform
 * Integrates with Supabase for authentication and data management
 */

class ApiClient {
    constructor() {
        // Get Supabase client instance
        this.client = null;
        this.currentUser = null;

        // Initialize when Supabase is ready
        this.initSupabase();
    }

    initSupabase() {
        if (window.supabase && typeof window.supabase.getClient === 'function') {
            this.client = window.supabase.getClient();
            console.log('✅ API Client: Supabase client initialized');
            
            // Initialize auth state
            this.initAuthState();

            // Listen for auth state changes
            this.setupAuthListener();
        } else {
            console.warn('⚠️ API Client: Waiting for Supabase to initialize...');
            setTimeout(() => this.initSupabase(), 100);
        }
    }

    async initAuthState() {
        try {
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                this.triggerLoginStateChange(true, session.user);
                console.log('✅ API Client: User session restored');
            }
        } catch (error) {
            console.error('Error initializing auth state:', error);
        }
    }

    setupAuthListener() {
        this.client.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.triggerLoginStateChange(true, session.user);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.triggerLoginStateChange(false, null);
            }
        });
    }

    get isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Authentication Methods
    async login(email, password) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            return { user: data.user, session: data.session };
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed');
        }
    }

    async register(userData) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.name || userData.username,
                        avatar_url: userData.avatar || null
                    }
                }
            });

            if (error) throw error;

            // If email confirmation is not required, user will be auto-logged in
            if (data.session) {
                this.currentUser = data.user;
            }

            return { user: data.user, session: data.session };
        } catch (error) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Registration failed');
        }
    }

    async logout() {
        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error(error.message || 'Logout failed');
        }
    }

    async forgotPassword(email) {
        try {
            const { error } = await this.client.auth.resetPasswordForEmail(email);
            if (error) throw error;
            return { success: true, message: 'Password reset email sent' };
        } catch (error) {
            console.error('Forgot password error:', error);
            throw new Error(error.message || 'Failed to send reset email');
        }
    }

    async resetPassword(newPassword) {
        try {
            const { error } = await this.client.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            console.error('Reset password error:', error);
            throw new Error(error.message || 'Failed to reset password');
        }
    }

    // User Profile Methods
    async getProfile() {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Authentication required');
            }

            const { data: profile, error } = await this.client
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;

            return {
                user: {
                    ...this.currentUser,
                    ...profile
                }
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Return basic user info if profile fetch fails
            return { user: this.currentUser };
        }
    }

    async updateProfile(profileData) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Authentication required');
            }

            // Update auth metadata if name or avatar changes
            if (profileData.name || profileData.avatar_url) {
                const { error: userError } = await this.client.auth.updateUser({
                    data: {
                        full_name: profileData.name,
                        avatar_url: profileData.avatar_url
                    }
                });
                if (userError) throw userError;
            }

            // Update profile in profiles table
            const { data, error } = await this.client
                .from('profiles')
                .update({
                    ...profileData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id);

            if (error) throw error;

            return {
                user: {
                    ...this.currentUser,
                    ...profileData
                }
            };
        } catch (error) {
            console.error('Error updating profile:', error);
            throw new Error(error.message || 'Failed to update profile');
        }
    }

    // Wellness Data Methods
    async getWellnessScore() {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Authentication required');
            }

            const { data, error } = await this.client
                .from('wellness_scores')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching wellness score:', error);
            return { score: 70, status: 'Good Progress' }; // Default fallback
        }
    }

    async getWellnessHistory() {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Authentication required');
            }

            const { data, error } = await this.client
                .from('wellness_data')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(30);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching wellness history:', error);
            throw new Error(error.message || 'Failed to fetch wellness history');
        }
    }

    async recordMood(moodData) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Authentication required');
            }

            const { data, error } = await this.client
                .from('mood_entries')
                .insert([{
                    user_id: this.currentUser.id,
                    mood_score: moodData.score,
                    note: moodData.note || null,
                    tags: moodData.tags || [],
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error recording mood:', error);
            throw new Error(error.message || 'Failed to record mood');
        }
    }

    async logActivity(type, data = {}) {
        try {
            if (!this.isAuthenticated) {
                throw new Error('Authentication required');
            }

            const { data: result, error } = await this.client
                .from('wellness_activities')
                .insert([{
                    user_id: this.currentUser.id,
                    activity_type: type,
                    details: data,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return result;
        } catch (error) {
            console.error(`Error logging ${type} activity:`, error);
            throw new Error(error.message || `Failed to log ${type} activity`);
        }
    }

    // Wrapper methods for specific activities
    async logSleep(sleepData) {
        return this.logActivity('sleep', sleepData);
    }

    async logExercise(exerciseData) {
        return this.logActivity('exercise', exerciseData);
    }

    async logMindfulness(mindfulnessData) {
        return this.logActivity('mindfulness', mindfulnessData);
    }

    // Helper method to emit auth state changes
    triggerLoginStateChange(isLoggedIn, user) {
        const event = new CustomEvent('loginStateChanged', {
            detail: { isLoggedIn, user }
        });
        document.dispatchEvent(event);
    }
}

// Initialize API client when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.apiClient = new ApiClient();
});