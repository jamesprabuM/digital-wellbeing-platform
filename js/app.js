// ===== MAIN APPLICATION SCRIPT =====

// Global state management
const AppState = {
    currentUser: null,
    moodData: [],
    wellnessScore: 72,
    isOnline: navigator.onLine,
    theme: 'light'
};

// Utility functions
const Utils = {
    // Generate unique ID
    generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    },

    // Get time of day greeting
    getGreeting: () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML: (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Debounce function for performance
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Storage helpers - supports both database and local storage
    storage: {
        set: async (key, value) => {
            // First try to save to database if user is logged in
            if (window.db && window.db.isLoggedIn()) {
                try {
                    await window.db.saveWellnessData(key, value);
                } catch (e) {
                    console.warn('Database storage failed, falling back to localStorage:', e);
                }
            }

            // Always store in localStorage as fallback
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('Local storage not available:', e);
            }
        },
        get: async (key) => {
            // First try to get from database if user is logged in
            if (window.db && window.db.isLoggedIn()) {
                try {
                    const data = await window.db.getWellnessData();
                    if (data && data[key] !== undefined) {
                        return data[key];
                    }
                } catch (e) {
                    console.warn('Database fetch failed, falling back to localStorage:', e);
                }
            }

            // Fall back to localStorage
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.warn('Error reading from local storage:', e);
                return null;
            }
        },
        remove: async (key) => {
            // Remove from database if user is logged in
            if (window.db && window.db.isLoggedIn()) {
                try {
                    await window.db.saveWellnessData(key, null);
                } catch (e) {
                    console.warn('Database removal failed:', e);
                }
            }

            // Also remove from localStorage
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('Error removing from local storage:', e);
            }
        }
    }
};

// ===== NAVIGATION =====
class Navigation {
    constructor() {
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-menu a');

        this.init();
    }

    init() {
        // Mobile menu toggle
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Smooth scrolling for nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container')) {
                this.closeMobileMenu();
            }
        });

        // Handle scroll for navbar styling
        window.addEventListener('scroll', Utils.debounce(() => this.handleScroll(), 10));
    }

    toggleMobileMenu() {
        const isOpen = this.navMenu.classList.contains('active');

        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.navMenu.classList.add('active');
        this.navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    handleNavClick(e) {
        const href = e.target.getAttribute('href');

        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                this.closeMobileMenu();
            }
        }
    }

    handleScroll() {
        const navbar = document.querySelector('.navbar');
        const scrolled = window.scrollY > 50;

        if (navbar) {
            navbar.style.background = scrolled
                ? 'rgba(255, 255, 255, 0.98)'
                : 'rgba(255, 255, 255, 0.95)';
        }
    }
}

// ===== HERO SECTION ANIMATIONS =====
class HeroAnimations {
    constructor() {
        this.floatingElements = document.querySelectorAll('.floating-element');
        this.gradientOrbs = document.querySelectorAll('.gradient-orb');

        this.init();
    }

    init() {
        this.animateFloatingElements();
        this.animateGradientOrbs();
        this.setupIntersectionObserver();
    }

    animateFloatingElements() {
        this.floatingElements.forEach((element, index) => {
            // Add random movement
            setInterval(() => {
                const x = (Math.random() - 0.5) * 20;
                const y = (Math.random() - 0.5) * 20;
                element.style.transform = `translate(${x}px, ${y}px)`;
            }, 3000 + (index * 1000));
        });
    }

    animateGradientOrbs() {
        this.gradientOrbs.forEach((orb, index) => {
            // Add subtle rotation
            setInterval(() => {
                const rotation = Math.random() * 360;
                orb.style.transform = `rotate(${rotation}deg) scale(${0.8 + Math.random() * 0.4})`;
            }, 5000 + (index * 1500));
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                } else {
                    entry.target.style.animationPlayState = 'paused';
                }
            });
        }, observerOptions);

        // Observe animated elements
        document.querySelectorAll('[class*="animate"], .floating-element, .gradient-orb').forEach(el => {
            observer.observe(el);
        });
    }
}

// ===== WELLNESS DASHBOARD =====
class WellnessDashboard {
    constructor() {
        this.moodData = [];
        this.wellnessData = {
            sleep: 80,
            exercise: 65,
            mindfulness: 70
        };
        this.isLoadingData = false;

        // Load data asynchronously
        this.loadUserData();

        // Initialize UI
        this.init();
    }

    async loadUserData() {
        this.isLoadingData = true;

        // Show loading indicator if available
        this.showLoadingState(true);

        try {
            // Prefer server API if available and authenticated
            if (window.apiClient && window.apiClient.isAuthenticated) {
                console.log('Loading user data from API...');
                try {
                    const history = await window.apiClient.getWellnessHistory();
                    const score = await window.apiClient.getWellnessScore();
                    this.moodData = history?.moodData || [];
                    if (score && score.components) {
                        this.wellnessData = {
                            sleep: score.components.sleep ?? this.wellnessData.sleep,
                            exercise: score.components.exercise ?? this.wellnessData.exercise,
                            mindfulness: score.components.mindfulness ?? this.wellnessData.mindfulness
                        };
                    }
                } catch (e) {
                    console.warn('API fetch failed, falling back to legacy/local:', e);
                    // Fall back to legacy DB below
                    if (window.db && window.db.isLoggedIn()) {
                        const userData = await window.db.getWellnessData();
                        if (userData) {
                            this.moodData = userData.moodData || [];
                            this.wellnessData = userData.wellnessData || this.wellnessData;
                        }
                    } else {
                        this.moodData = await Utils.storage.get('moodData') || [];
                        this.wellnessData = await Utils.storage.get('wellnessData') || this.wellnessData;
                    }
                }
            } else if (window.db && window.db.isLoggedIn()) {
                console.log('Loading user data from database...');
                // Get wellness data from database
                const userData = await window.db.getWellnessData();

                if (userData) {
                    // Update local data with user data
                    this.moodData = userData.moodData || [];
                    this.wellnessData = userData.wellnessData || this.wellnessData;

                    console.log('User data loaded successfully');
                }
            } else {
                console.log('User not logged in, using local storage');
                // Fall back to local storage
                this.moodData = await Utils.storage.get('moodData') || [];
                this.wellnessData = await Utils.storage.get('wellnessData') || this.wellnessData;
            }

            // Update UI with loaded data
            this.updateUIWithLoadedData();

        } catch (error) {
            console.error('Error loading user data:', error);
            // Fall back to local storage on error
            this.moodData = await Utils.storage.get('moodData') || [];
            this.wellnessData = await Utils.storage.get('wellnessData') || this.wellnessData;
            this.updateUIWithLoadedData();

        } finally {
            this.isLoadingData = false;
            this.showLoadingState(false);
        }
    }

    updateUIWithLoadedData() {
        // Update all UI elements with loaded data
        this.updateMoodUI(this.getTodayMood());
        this.renderMoodChart();
        this.updateMoodInsight();
        this.updateWellnessScore();
        this.updateRecentActivity();
    }

    showLoadingState(isLoading) {
        // Show loading indicators in dashboard widgets
        const dashboardCards = document.querySelectorAll('.dashboard-card');

        dashboardCards.forEach(card => {
            if (isLoading) {
                // Add loading class
                card.classList.add('loading');

                // Create and append loading spinner if doesn't exist
                if (!card.querySelector('.loading-spinner')) {
                    const spinner = document.createElement('div');
                    spinner.className = 'loading-spinner';
                    spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
                    card.appendChild(spinner);
                }
            } else {
                // Remove loading class and spinner
                card.classList.remove('loading');
                const spinner = card.querySelector('.loading-spinner');
                if (spinner) spinner.remove();
            }
        });
    }

    init() {
        this.setupMoodTracker();
        this.setupWellnessScore();
        this.updateRecentActivity();
        this.loadStoredData();

        // Add loading spinner styles
        const style = document.createElement('style');
        style.textContent = `
            .dashboard-card.loading {
                position: relative;
            }
            
            .loading-spinner {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
            }
            
            .loading-spinner i {
                font-size: 2rem;
                color: #667eea;
            }
        `;
        document.head.appendChild(style);
    }

    setupMoodTracker() {
        const moodButtons = document.querySelectorAll('.mood-btn');

        moodButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.recordMood(index + 1));
        });

        this.renderMoodChart();
    }

    recordMood(moodValue) {
        // Validate mood value using validation utility
        if (window.validator) {
            const validation = window.validator.validateMood(moodValue);
            if (!validation.valid) {
                console.error('Invalid mood value:', moodValue);
                if (window.showNotification) {
                    window.showNotification(validation.error, 'error');
                }
                return;
            }
            moodValue = validation.value;
        } else {
            // Fallback validation
            if (!moodValue || moodValue < 1 || moodValue > 5) {
                console.error('Invalid mood value:', moodValue);
                if (window.showNotification) {
                    window.showNotification('Please select a valid mood option.', 'error');
                }
                return;
            }
        }

        // Check if user is logged in, if not prompt to login
        if (window.db && !window.db.isLoggedIn() && window.authManager) {
            if (confirm('Please log in to save your mood and wellness data. Would you like to log in now?')) {
                window.authManager.showLoginModal();
                return;
            }
        }

        const today = new Date().toDateString();
        const existingEntry = this.moodData.find(entry => entry.date === today);

        if (existingEntry) {
            existingEntry.mood = moodValue;
        } else {
            this.moodData.push({
                date: today,
                mood: moodValue,
                timestamp: Date.now()
            });
        }

        // Keep only last 30 days
        this.moodData = this.moodData.slice(-30);

        // Persist: prefer API when authenticated
        if (window.apiClient && window.apiClient.isAuthenticated) {
            try {
                const todayISO = new Date().toISOString().split('T')[0];
                // Server expects 1-10; we send 1-5 from UI which is acceptable
                window.apiClient.recordMood({ mood: moodValue, date: todayISO });
            } catch (e) {
                console.warn('Failed to record mood via API, falling back to local storage:', e);
                Utils.storage.set('moodData', this.moodData);
            }
        } else {
            // Save to storage (database or localStorage)
            Utils.storage.set('moodData', this.moodData);
            // If logged in, also update via legacy DB
            if (window.db && window.db.isLoggedIn()) {
                window.db.saveWellnessData('wellnessData', {
                    ...this.wellnessData,
                    moodData: this.moodData
                });
            }
        }

        this.updateMoodUI(moodValue);
        this.renderMoodChart();
        this.updateMoodInsight();

        // Add to recent activity
        this.addActivity('mood', 'Mood Recorded', 'Just now');
    }

    updateMoodUI(selectedMood) {
        const moodButtons = document.querySelectorAll('.mood-btn');

        moodButtons.forEach((btn, index) => {
            btn.classList.toggle('active', index + 1 === selectedMood);
        });
    }

    renderMoodChart() {
        const canvas = document.getElementById('moodChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, width, height);

        if (this.moodData.length === 0) return;

        // Get last 7 days of data
        const last7Days = this.moodData.slice(-7);
        const maxMood = 5;
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // Draw grid lines
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw mood line
        if (last7Days.length > 1) {
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.beginPath();

            last7Days.forEach((data, index) => {
                const x = padding + (chartWidth / (last7Days.length - 1)) * index;
                const y = padding + chartHeight - (data.mood / maxMood) * chartHeight;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // Draw points
            ctx.fillStyle = '#667eea';
            last7Days.forEach((data, index) => {
                const x = padding + (chartWidth / (last7Days.length - 1)) * index;
                const y = padding + chartHeight - (data.mood / maxMood) * chartHeight;

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    updateMoodInsight() {
        const insightElement = document.getElementById('moodInsight');
        if (!insightElement || this.moodData.length === 0) return;

        const recentMoods = this.moodData.slice(-7);
        const avgMood = recentMoods.reduce((sum, data) => sum + data.mood, 0) / recentMoods.length;

        let insight = '';
        if (avgMood >= 4) {
            insight = '🌟 You\'ve been feeling great lately! Keep up the positive momentum.';
        } else if (avgMood >= 3) {
            insight = '😊 Your mood has been stable. Consider adding more activities you enjoy.';
        } else {
            insight = '💙 It looks like you\'ve been having some tough days. Remember, it\'s okay to seek support.';
        }

        insightElement.textContent = insight;
    }

    setupWellnessScore() {
        this.updateWellnessScore();
        this.animateScoreCircle();
    }

    updateWellnessScore() {
        const scoreElement = document.querySelector('.score-number');
        const statusElement = document.querySelector('.score-status');

        if (!scoreElement) return;

        const { sleep, exercise, mindfulness } = this.wellnessData;
        const overallScore = Math.round((sleep + exercise + mindfulness) / 3);

        scoreElement.textContent = overallScore;

        let status = '';
        if (overallScore >= 80) status = 'Excellent';
        else if (overallScore >= 60) status = 'Good Progress';
        else if (overallScore >= 40) status = 'Getting Started';
        else status = 'Needs Attention';

        if (statusElement) statusElement.textContent = status;

        // Update progress circle
        const circle = document.querySelector('.score-circle circle:last-child');
        if (circle) {
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (overallScore / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }

    animateScoreCircle() {
        const circle = document.querySelector('.score-circle circle:last-child');
        if (!circle) return;

        const circumference = 2 * Math.PI * 45;
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;

        // Animate on page load
        setTimeout(() => {
            this.updateWellnessScore();
        }, 500);
    }

    addActivity(type, title, time) {
        const activity = {
            id: Utils.generateId(),
            type,
            title,
            time,
            timestamp: Date.now()
        };

        let activities = Utils.storage.get('recentActivities') || [];
        activities.unshift(activity);
        activities = activities.slice(0, 10); // Keep only last 10

        Utils.storage.set('recentActivities', activities);
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activitiesList = document.querySelector('.activity-list');
        if (!activitiesList) return;

        const activities = Utils.storage.get('recentActivities') || [];

        activitiesList.innerHTML = activities.slice(0, 3).map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}" aria-hidden="true"></i>
                </div>
                <div class="activity-details">
                    <span class="activity-title">${Utils.sanitizeHTML(activity.title)}</span>
                    <span class="activity-time">${Utils.sanitizeHTML(activity.time)}</span>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            mood: 'smile',
            breathing: 'wind',
            meditation: 'leaf',
            journal: 'pen',
            assessment: 'clipboard-check',
            sleep: 'moon'
        };
        return icons[type] || 'circle';
    }

    getTodayMood() {
        const today = new Date().toDateString();
        const todayMood = this.moodData.find(entry => entry.date === today);
        return todayMood ? todayMood.mood : null;
    }

    loadStoredData() {
        // Load today's mood if exists
        const todayMood = this.getTodayMood();

        if (todayMood) {
            this.updateMoodUI(todayMood);
        }
    }
}

// ===== QUICK ACTIONS =====
class QuickActions {
    constructor() {
        this.dashboard = null;
        this.init();
    }

    setDashboard(dashboard) {
        this.dashboard = dashboard;
    }

    init() {
        this.setupActionButtons();
    }

    setupActionButtons() {
        const actionButtons = document.querySelectorAll('.action-btn');

        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.classList[1]; // Get second class
                this.executeAction(action);
            });
        });
    }

    executeAction(action) {
        switch (action) {
            case 'breathing':
                this.startBreathingExercise();
                break;
            case 'meditation':
                this.startMeditation();
                break;
            case 'journal':
                this.openJournal();
                break;
            case 'assessment':
                this.takeAssessment();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    startBreathingExercise() {
        if (window.breathingExercise) {
            window.breathingExercise.open();
        }

        if (this.dashboard) {
            this.dashboard.addActivity('breathing', 'Breathing Exercise', 'Just now');
        }
    }

    startMeditation() {
        // This will be implemented in wellness-tools.js
        if (window.meditationTimer) {
            window.meditationTimer.start();
        }

        if (this.dashboard) {
            this.dashboard.addActivity('meditation', 'Meditation Session', 'Just now');
        }
    }

    openJournal() {
        // Create a simple journal modal or redirect
        this.showComingSoon('Digital Journal');

        if (this.dashboard) {
            this.dashboard.addActivity('journal', 'Journal Entry', 'Just now');
        }
    }

    takeAssessment() {
        // Start wellness assessment
        this.showComingSoon('Wellness Assessment');

        if (this.dashboard) {
            this.dashboard.addActivity('assessment', 'Wellness Check', 'Just now');
        }
    }

    showComingSoon(feature) {
        const message = `${feature} feature is coming soon! We're working hard to bring you the best wellness tools.`;

        // Create a simple modal or use alert for now
        if (window.showNotification) {
            window.showNotification(message, 'info');
        } else {
            alert(message);
        }
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupReducedMotion();
    }

    setupKeyboardNavigation() {
        // Handle escape key for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        });

        // Tab navigation improvements
        this.setupTabTrap();
    }

    setupTabTrap() {
        const modals = document.querySelectorAll('.modal, .chatbot-container');

        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapTab(e, modal);
                }
            });
        });
    }

    trapTab(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    setupFocusManagement() {
        // Store focus before opening modals
        this.previousFocus = null;

        // Focus management for modals
        const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                this.previousFocus = document.activeElement;
            });
        });
    }

    setupScreenReaderSupport() {
        // Announce dynamic content changes
        this.createLiveRegion();

        // Enhance form labels
        this.enhanceFormAccessibility();
    }

    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;

            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    enhanceFormAccessibility() {
        // Add required field indicators
        const requiredFields = document.querySelectorAll('input[required], textarea[required], select[required]');

        requiredFields.forEach(field => {
            const label = document.querySelector(`label[for="${field.id}"]`);
            if (label && !label.textContent.includes('*')) {
                label.innerHTML += ' <span aria-label="required">*</span>';
            }
        });
    }

    setupReducedMotion() {
        // Respect user's motion preferences
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (mediaQuery.matches) {
            this.disableAnimations();
        }

        mediaQuery.addEventListener('change', () => {
            if (mediaQuery.matches) {
                this.disableAnimations();
            } else {
                this.enableAnimations();
            }
        });
    }

    disableAnimations() {
        document.documentElement.style.setProperty('--transition-fast', '0ms');
        document.documentElement.style.setProperty('--transition-base', '0ms');
        document.documentElement.style.setProperty('--transition-slow', '0ms');
    }

    enableAnimations() {
        document.documentElement.style.removeProperty('--transition-fast');
        document.documentElement.style.removeProperty('--transition-base');
        document.documentElement.style.removeProperty('--transition-slow');
    }

    closeActiveModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');

            // Return focus to previous element
            if (this.previousFocus) {
                this.previousFocus.focus();
                this.previousFocus = null;
            }
        }
    }
}

// ===== NOTIFICATION SYSTEM =====
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.setAttribute('aria-live', 'polite');
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.style.cssText = `
            background: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-left: 4px solid ${this.getTypeColor(type)};
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${this.getTypeIcon(type)}" style="color: ${this.getTypeColor(type)};"></i>
                <span style="flex: 1; color: #374151;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; cursor: pointer; color: #9ca3af;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        this.container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    getTypeColor(type) {
        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        return colors[type] || colors.info;
    }

    getTypeIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle'
        };
        return icons[type] || icons.info;
    }
}

// ===== PWA SERVICE WORKER =====
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered successfully:', registration);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                }
            });

            // Handle PWA install prompt
            setupPWAInstallPrompt();

            return registration;
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    }
}

function setupPWAInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // Show install button if not already installed
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            showInstallButton(deferredPrompt);
        }
    });

    window.addEventListener('appinstalled', () => {
        console.log('📱 PWA was installed');
        deferredPrompt = null;
    });
}

function showInstallButton(deferredPrompt) {
    const installButton = document.createElement('button');
    installButton.className = 'btn btn-secondary install-btn';
    installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
    installButton.setAttribute('aria-label', 'Install MindfulPath as an app');
    installButton.style.cssText = `
        margin-left: 10px;
        padding: 8px 16px;
        font-size: 14px;
    `;

    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult.outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
            } else {
                console.log('❌ User dismissed the install prompt');
            }

            deferredPrompt = null;
            installButton.remove();
        }
    });

    // Add to navigation
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        navActions.appendChild(installButton);
    }
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div style="background: var(--primary-color); color: white; padding: 16px; border-radius: 8px; position: fixed; top: 20px; right: 20px; z-index: 10001; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            <p style="margin: 0 0 10px 0; font-weight: 500;">🔄 Update Available!</p>
            <p style="margin: 0 0 10px 0; font-size: 14px;">A new version of MindfulPath is ready.</p>
            <button onclick="window.location.reload()" style="background: white; color: var(--primary-color); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;">
                Refresh Now
            </button>
            <button onclick="this.parentElement.parentElement.remove()" style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 8px;">
                Later
            </button>
        </div>
    `;
    document.body.appendChild(notification);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    // Register service worker for PWA functionality
    await registerServiceWorker();

    // Initialize all components
    const navigation = new Navigation();
    const heroAnimations = new HeroAnimations();
    const dashboard = new WellnessDashboard();
    const quickActions = new QuickActions();
    const accessibilityManager = new AccessibilityManager();
    const notificationSystem = new NotificationSystem();

    // Link components
    quickActions.setDashboard(dashboard);

    // Make notification system globally available
    window.showNotification = (message, type, duration) => {
        notificationSystem.show(message, type, duration);
    };

    // Make accessibility manager globally available
    window.accessibilityManager = accessibilityManager;

    // Global functions for buttons
    window.startWellnessJourney = () => {
        document.querySelector('#dashboard').scrollIntoView({ behavior: 'smooth' });
        notificationSystem.show('Welcome to your wellness journey! 🌟', 'success');
    };

    window.openChatbot = () => {
        if (window.chatbot) {
            window.chatbot.open();
        }
    };

    window.startBreathingExercise = () => {
        quickActions.startBreathingExercise();
    };

    window.startMeditation = () => {
        quickActions.startMeditation();
    };

    window.openJournal = () => {
        quickActions.openJournal();
    };

    window.takeAssessment = () => {
        quickActions.takeAssessment();
    };

    // CBT Tool is now implemented in initialization-fix.js
    // This placeholder is only used if the main implementation fails
    if (!window.openCBTTool) {
        window.openCBTTool = () => {
            notificationSystem.show('CBT Thought Tracker loading...', 'info');
        };
    }

    // Sleep Tool is now implemented in initialization-fix.js
    // This placeholder is only used if the main implementation fails
    if (!window.openSleepTool) {
        window.openSleepTool = () => {
            notificationSystem.show('Sleep Optimization tools loading...', 'info');
        };
    }

    // Gratitude Journal is now implemented in initialization-fix.js
    // This placeholder is only used if the main implementation fails
    if (!window.openGratitudeJournal) {
        window.openGratitudeJournal = () => {
            notificationSystem.show('Gratitude Practice loading...', 'info');
        };
    }

    window.openCrisisSupport = () => {
        if (confirm('You are about to access crisis support resources. Do you need immediate help?')) {
            // In a real app, this would open crisis resources
            notificationSystem.show('Crisis support resources are available 24/7. If this is an emergency, please call 911.', 'warning', 10000);
        }
    };

    // Show welcome message
    setTimeout(() => {
        notificationSystem.show(`${Utils.getGreeting()}! Welcome to MindfulPath 💚`, 'success');
    }, 1000);

    // Handle online/offline status
    window.addEventListener('online', () => {
        AppState.isOnline = true;
        notificationSystem.show('You\'re back online! 🌐', 'success');
    });

    window.addEventListener('offline', () => {
        AppState.isOnline = false;
        notificationSystem.show('You\'re offline. Some features may be limited.', 'warning');
    });

    console.log('🧠 MindfulPath Application Initialized Successfully!');
});