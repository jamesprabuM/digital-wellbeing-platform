// ===== DASHBOARD FUNCTIONALITY =====

class DashboardManager {
    constructor() {
        this.dashboardData = {
            mood: Utils.storage.get('moodData') || [],
            wellness: Utils.storage.get('wellnessData') || {
                sleep: 80,
                exercise: 65,
                mindfulness: 70
            },
            activities: Utils.storage.get('recentActivities') || [],
            goals: Utils.storage.get('wellnessGoals') || [],
            streaks: Utils.storage.get('wellnessStreaks') || {
                meditation: 0,
                exercise: 0,
                journaling: 0,
                mood_tracking: 0
            }
        };

        this.charts = {};
        this.animationFrameId = null;

        this.init();
    }

    init() {
        this.setupDashboardCards();
        this.initializeCharts();
        this.setupGoalsTracking();
        this.setupStreaksTracking();
        this.startPeriodicUpdates();
    }

    setupDashboardCards() {
        this.setupMoodTracker();
        this.setupWellnessScore();
        this.setupQuickActions();
        this.setupRecentActivity();
        this.setupProgressTracking();
    }

    setupMoodTracker() {
        const moodCard = document.querySelector('.mood-tracker');
        if (!moodCard) return;

        // Enhanced mood tracking with emotions
        const moodSelector = moodCard.querySelector('.mood-selector');
        if (moodSelector) {
            // Add emotion labels
            const moodButtons = moodSelector.querySelectorAll('.mood-btn');
            const emotions = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

            moodButtons.forEach((btn, index) => {
                btn.setAttribute('title', emotions[index]);
                btn.addEventListener('mouseenter', () => {
                    this.showMoodTooltip(btn, emotions[index]);
                });
                btn.addEventListener('mouseleave', () => {
                    this.hideMoodTooltip();
                });
            });
        }

        // Add mood insights
        this.updateMoodInsights();

        // Setup mood chart with enhanced visualization
        this.initializeMoodChart();
    }

    initializeMoodChart() {
        const canvas = document.getElementById('moodChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth * 2; // Retina display support
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        this.charts.mood = {
            canvas,
            ctx,
            data: this.dashboardData.mood.slice(-14), // Last 14 days
            animation: 0
        };

        this.renderMoodChart();
    }

    renderMoodChart() {
        const chart = this.charts.mood;
        if (!chart) return;

        const { ctx, canvas, data } = chart;
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;

        ctx.clearRect(0, 0, width, height);

        if (data.length === 0) {
            this.drawEmptyState(ctx, width, height, 'Start tracking your mood to see patterns');
            return;
        }

        // Chart settings
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        const maxMood = 5;

        // Draw background gradient
        this.drawChartBackground(ctx, padding, width, height);

        // Draw grid
        this.drawGrid(ctx, padding, chartWidth, chartHeight, 5);

        // Draw mood line with animation
        if (data.length > 1) {
            this.drawMoodLine(ctx, data, padding, chartWidth, chartHeight, maxMood);
            this.drawMoodPoints(ctx, data, padding, chartWidth, chartHeight, maxMood);
        }

        // Draw labels
        this.drawMoodLabels(ctx, data, padding, chartWidth, chartHeight);
    }

    drawChartBackground(ctx, padding, width, height) {
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.05)');

        ctx.fillStyle = gradient;
        ctx.fillRect(padding, padding, width - padding * 2, height - padding * 2);
    }

    drawGrid(ctx, padding, chartWidth, chartHeight, divisions) {
        ctx.strokeStyle = 'rgba(229, 231, 235, 0.8)';
        ctx.lineWidth = 1;

        // Horizontal lines
        for (let i = 0; i <= divisions; i++) {
            const y = padding + (chartHeight / divisions) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }

        // Vertical lines (for days)
        const dayCount = Math.min(this.charts.mood.data.length, 7);
        for (let i = 0; i <= dayCount; i++) {
            const x = padding + (chartWidth / dayCount) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, padding + chartHeight);
            ctx.stroke();
        }
    }

    drawMoodLine(ctx, data, padding, chartWidth, chartHeight, maxMood) {
        if (data.length < 2) return;

        const gradient = ctx.createLinearGradient(0, 0, chartWidth, 0);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Create smooth curve
        ctx.beginPath();

        data.forEach((entry, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = padding + chartHeight - (entry.mood / maxMood) * chartHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                // Use quadratic curves for smooth line
                const prevX = padding + (chartWidth / (data.length - 1)) * (index - 1);
                const prevY = padding + chartHeight - (data[index - 1].mood / maxMood) * chartHeight;
                const cpX = (prevX + x) / 2;
                ctx.quadraticCurveTo(cpX, prevY, x, y);
            }
        });

        ctx.stroke();

        // Add area fill
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.closePath();

        const areaGradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        areaGradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
        areaGradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');

        ctx.fillStyle = areaGradient;
        ctx.fill();
    }

    drawMoodPoints(ctx, data, padding, chartWidth, chartHeight, maxMood) {
        data.forEach((entry, index) => {
            const x = padding + (chartWidth / (data.length - 1)) * index;
            const y = padding + chartHeight - (entry.mood / maxMood) * chartHeight;

            // Point shadow
            ctx.shadowColor = 'rgba(102, 126, 234, 0.3)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 2;

            // Point
            ctx.fillStyle = '#667eea';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Inner highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawMoodLabels(ctx, data, padding, chartWidth, chartHeight) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';

        // Y-axis labels (mood levels)
        const moodLabels = ['😢', '😔', '😐', '😊', '😄'];
        moodLabels.forEach((label, index) => {
            const y = padding + chartHeight - (((index + 1) / 5) * chartHeight);
            ctx.fillText(label, padding - 20, y + 4);
        });

        // X-axis labels (dates)
        if (data.length > 0) {
            const recentDays = data.slice(-7);
            recentDays.forEach((entry, index) => {
                const x = padding + (chartWidth / (recentDays.length - 1)) * index;
                const date = new Date(entry.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                ctx.fillText(dayName, x, padding + chartHeight + 20);
            });
        }
    }

    setupWellnessScore() {
        this.updateWellnessScore();
        this.animateWellnessCircle();
        this.setupWellnessBreakdown();
    }

    updateWellnessScore() {
        const { sleep, exercise, mindfulness } = this.dashboardData.wellness;
        const overallScore = Math.round((sleep + exercise + mindfulness) / 3);

        const scoreElement = document.querySelector('.score-number');
        const statusElement = document.querySelector('.score-status');

        if (scoreElement) {
            this.animateNumber(scoreElement, 0, overallScore, 1500);
        }

        if (statusElement) {
            const status = this.getWellnessStatus(overallScore);
            statusElement.textContent = status;
            statusElement.className = `score-status ${status.toLowerCase().replace(' ', '-')}`;
        }

        // Update progress circle
        this.updateProgressCircle(overallScore);

        // Update breakdown bars
        this.updateWellnessBreakdown();
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.round(start + (end - start) * this.easeOutCubic(progress));
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    updateProgressCircle(score) {
        const circle = document.querySelector('.score-circle circle:last-child');
        if (!circle) return;

        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (score / 100) * circumference;

        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;

        // Animate the circle
        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 2s ease-out';
            circle.style.strokeDashoffset = offset;
        }, 500);
    }

    setupWellnessBreakdown() {
        const breakdown = document.querySelector('.score-breakdown');
        if (!breakdown) return;

        // Add interactive tooltips to breakdown items
        const scoreItems = breakdown.querySelectorAll('.score-item');
        scoreItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.showWellnessTooltip(item);
            });
            item.addEventListener('mouseleave', () => {
                this.hideWellnessTooltip();
            });
        });
    }

    updateWellnessBreakdown() {
        const { sleep, exercise, mindfulness } = this.dashboardData.wellness;
        const categories = [
            { name: 'sleep', value: sleep },
            { name: 'exercise', value: exercise },
            { name: 'mindfulness', value: mindfulness }
        ];

        categories.forEach((category, index) => {
            const scoreItems = document.querySelectorAll('.score-item');
            if (scoreItems[index]) {
                const fill = scoreItems[index].querySelector('.score-fill');
                if (fill) {
                    // Animate the fill
                    setTimeout(() => {
                        fill.style.transition = 'width 1.5s ease-out';
                        fill.style.width = `${category.value}%`;
                    }, 1000);
                }
            }
        });
    }

    setupQuickActions() {
        const actionButtons = document.querySelectorAll('.action-btn');

        actionButtons.forEach(btn => {
            // Add click animation
            btn.addEventListener('click', () => {
                this.animateActionButton(btn);
            });

            // Add hover effects
            btn.addEventListener('mouseenter', () => {
                this.addActionHoverEffect(btn);
            });

            btn.addEventListener('mouseleave', () => {
                this.removeActionHoverEffect(btn);
            });
        });
    }

    animateActionButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);

        // Add ripple effect
        this.createRippleEffect(button);
    }

    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupRecentActivity() {
        this.updateActivityList();
        this.setupActivityFilters();
    }

    updateActivityList() {
        const activitiesList = document.querySelector('.activity-list');
        if (!activitiesList) return;

        const activities = this.dashboardData.activities.slice(0, 5);

        if (activities.length === 0) {
            activitiesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>Start your wellness journey to see activities here</p>
                </div>
            `;
            return;
        }

        activitiesList.innerHTML = activities.map(activity => `
            <div class="activity-item" data-activity-id="${activity.id}">
                <div class="activity-icon ${activity.type}-icon">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <span class="activity-title">${activity.title}</span>
                    <span class="activity-time">${this.formatActivityTime(activity.timestamp)}</span>
                </div>
                <div class="activity-actions">
                    <button class="activity-repeat" onclick="dashboard.repeatActivity('${activity.id}')" title="Do again">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add click handlers for activity items
        this.setupActivityClickHandlers();
    }

    setupActivityClickHandlers() {
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.activity-actions')) {
                    this.showActivityDetails(item.dataset.activityId);
                }
            });
        });
    }

    formatActivityTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    setupGoalsTracking() {
        this.createGoalsWidget();
        this.updateGoalsProgress();
    }

    createGoalsWidget() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) return;

        const goalsCard = document.createElement('div');
        goalsCard.className = 'dashboard-card goals-tracker';
        goalsCard.innerHTML = `
            <h3 class="card-title">
                <i class="fas fa-target"></i>
                Wellness Goals
            </h3>
            <div class="goals-list" id="goals-list">
                <div class="empty-goals">
                    <p>Set your first wellness goal!</p>
                    <button class="btn btn-outline" onclick="dashboard.addGoal()">Add Goal</button>
                </div>
            </div>
            <div class="goals-actions">
                <button class="btn btn-primary" onclick="dashboard.addGoal()">
                    <i class="fas fa-plus"></i>
                    New Goal
                </button>
            </div>
        `;

        dashboardGrid.appendChild(goalsCard);
    }

    setupStreaksTracking() {
        this.updateStreaksDisplay();
    }

    updateStreaksDisplay() {
        // Create or update streaks widget
        const existing = document.querySelector('.streaks-tracker');
        if (existing) {
            this.refreshStreaksWidget(existing);
        } else {
            this.createStreaksWidget();
        }
    }

    createStreaksWidget() {
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (!dashboardGrid) return;

        const streaksCard = document.createElement('div');
        streaksCard.className = 'dashboard-card streaks-tracker';
        streaksCard.innerHTML = `
            <h3 class="card-title">
                <i class="fas fa-fire"></i>
                Current Streaks
            </h3>
            <div class="streaks-grid" id="streaks-grid">
                ${this.generateStreaksHTML()}
            </div>
        `;

        dashboardGrid.appendChild(streaksCard);
    }

    generateStreaksHTML() {
        const streaks = this.dashboardData.streaks;
        return Object.entries(streaks).map(([activity, count]) => `
            <div class="streak-item ${count > 0 ? 'active' : ''}">
                <div class="streak-icon">
                    <i class="fas fa-${this.getStreakIcon(activity)}"></i>
                </div>
                <div class="streak-info">
                    <span class="streak-name">${this.formatStreakName(activity)}</span>
                    <span class="streak-count">${count} days</span>
                </div>
            </div>
        `).join('');
    }

    getStreakIcon(activity) {
        const icons = {
            meditation: 'leaf',
            exercise: 'dumbbell',
            journaling: 'pen',
            mood_tracking: 'smile'
        };
        return icons[activity] || 'circle';
    }

    formatStreakName(activity) {
        return activity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    startPeriodicUpdates() {
        // Update dashboard every 5 minutes
        setInterval(() => {
            this.updateDashboardData();
        }, 300000);

        // Update time-sensitive elements every minute
        setInterval(() => {
            this.updateTimeElements();
        }, 60000);
    }

    updateDashboardData() {
        // Refresh data from storage
        this.dashboardData = {
            mood: Utils.storage.get('moodData') || [],
            wellness: Utils.storage.get('wellnessData') || this.dashboardData.wellness,
            activities: Utils.storage.get('recentActivities') || [],
            goals: Utils.storage.get('wellnessGoals') || [],
            streaks: Utils.storage.get('wellnessStreaks') || this.dashboardData.streaks
        };

        // Update displays
        this.updateActivityList();
        this.updateStreaksDisplay();
        this.renderMoodChart();
    }

    updateTimeElements() {
        // Update activity timestamps
        const timeElements = document.querySelectorAll('.activity-time');
        timeElements.forEach(element => {
            const activityItem = element.closest('.activity-item');
            if (activityItem) {
                const activityId = activityItem.dataset.activityId;
                const activity = this.dashboardData.activities.find(a => a.id === activityId);
                if (activity) {
                    element.textContent = this.formatActivityTime(activity.timestamp);
                }
            }
        });
    }

    // Public methods for external use
    addActivity(type, title, metadata = {}) {
        const activity = {
            id: Utils.generateId(),
            type,
            title,
            metadata,
            timestamp: Date.now()
        };

        this.dashboardData.activities.unshift(activity);
        this.dashboardData.activities = this.dashboardData.activities.slice(0, 50);

        Utils.storage.set('recentActivities', this.dashboardData.activities);
        this.updateActivityList();

        // Update streaks if applicable
        this.updateStreak(type);
    }

    updateStreak(activityType) {
        const streakMap = {
            breathing: 'meditation',
            meditation: 'meditation',
            journal: 'journaling',
            mood: 'mood_tracking',
            exercise: 'exercise'
        };

        const streakType = streakMap[activityType];
        if (streakType && this.dashboardData.streaks[streakType] !== undefined) {
            this.dashboardData.streaks[streakType]++;
            Utils.storage.set('wellnessStreaks', this.dashboardData.streaks);
            this.updateStreaksDisplay();
        }
    }

    repeatActivity(activityId) {
        const activity = this.dashboardData.activities.find(a => a.id === activityId);
        if (!activity) return;

        // Trigger the same activity
        switch (activity.type) {
            case 'breathing':
                if (window.startBreathingExercise) window.startBreathingExercise();
                break;
            case 'meditation':
                if (window.startMeditation) window.startMeditation();
                break;
            case 'journal':
                if (window.openJournal) window.openJournal();
                break;
            default:
                console.log('Repeating activity:', activity.type);
        }
    }

    addGoal() {
        // Simple goal creation (could be expanded with a modal)
        const goalText = prompt('What wellness goal would you like to set?');
        if (!goalText) return;

        const goal = {
            id: Utils.generateId(),
            text: goalText,
            completed: false,
            createdAt: Date.now(),
            targetDate: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days from now
        };

        this.dashboardData.goals.push(goal);
        Utils.storage.set('wellnessGoals', this.dashboardData.goals);
        this.updateGoalsProgress();
    }

    updateGoalsProgress() {
        const goalsList = document.getElementById('goals-list');
        if (!goalsList) return;

        const goals = this.dashboardData.goals;

        if (goals.length === 0) {
            goalsList.innerHTML = `
                <div class="empty-goals">
                    <p>Set your first wellness goal!</p>
                    <button class="btn btn-outline" onclick="dashboard.addGoal()">Add Goal</button>
                </div>
            `;
            return;
        }

        goalsList.innerHTML = goals.map(goal => {
            const safeText = goal.text ? goal.text.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            return `
                <div class="goal-item ${goal.completed ? 'completed' : ''}">
                    <div class="goal-checkbox">
                        <input type="checkbox" ${goal.completed ? 'checked' : ''} 
                               onchange="dashboard.toggleGoal('${goal.id}')">
                    </div>
                    <div class="goal-content">
                        <span class="goal-text">${safeText}</span>
                        <span class="goal-date">${this.formatGoalDate(goal.targetDate)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatGoalDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return `${diffDays} days left`;
    }

    toggleGoal(goalId) {
        const goal = this.dashboardData.goals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = !goal.completed;
            if (goal.completed) {
                goal.completedAt = Date.now();
            } else {
                delete goal.completedAt;
            }

            Utils.storage.set('wellnessGoals', this.dashboardData.goals);
            this.updateGoalsProgress();

            if (goal.completed && window.showNotification) {
                window.showNotification('🎉 Goal completed! Great job on your wellness journey!', 'success');
            }
        }
    }

    getWellnessStatus(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Great';
        if (score >= 70) return 'Good Progress';
        if (score >= 60) return 'Getting Better';
        if (score >= 50) return 'Making Progress';
        return 'Needs Attention';
    }

    getActivityIcon(type) {
        const icons = {
            mood: 'smile',
            breathing: 'wind',
            meditation: 'leaf',
            journal: 'pen',
            assessment: 'clipboard-check',
            sleep: 'moon',
            exercise: 'dumbbell',
            gratitude: 'heart'
        };
        return icons[type] || 'circle';
    }

    showMoodTooltip(element, emotion) {
        // Create and show tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'mood-tooltip';
        tooltip.textContent = emotion;
        tooltip.style.cssText = `
            position: absolute;
            background: #1f2937;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            pointer-events: none;
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';

        this.currentTooltip = tooltip;
    }

    hideMoodTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    drawEmptyState(ctx, width, height, message) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(message, width / 2, height / 2);
    }
}

// ===== INITIALIZE DASHBOARD =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard manager
    window.dashboard = new DashboardManager();

    // Add CSS animations for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .empty-state {
            text-align: center;
            padding: 2rem;
            color: #6b7280;
        }
        
        .empty-state i {
            font-size: 2rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        
        .goal-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: #f9fafb;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            transition: all 0.2s ease;
        }
        
        .goal-item:hover {
            background: #f3f4f6;
        }
        
        .goal-item.completed {
            opacity: 0.6;
        }
        
        .goal-item.completed .goal-text {
            text-decoration: line-through;
        }
        
        .goal-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .goal-text {
            font-weight: 500;
            color: #374151;
        }
        
        .goal-date {
            font-size: 0.75rem;
            color: #6b7280;
        }
        
        .streak-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            transition: all 0.2s ease;
        }
        
        .streak-item.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .streak-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .streak-info {
            display: flex;
            flex-direction: column;
        }
        
        .streak-name {
            font-weight: 500;
            font-size: 0.875rem;
        }
        
        .streak-count {
            font-size: 0.75rem;
            opacity: 0.8;
        }
        
        .activity-actions {
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .activity-item:hover .activity-actions {
            opacity: 1;
        }
        
        .activity-repeat {
            background: none;
            border: none;
            padding: 0.25rem;
            border-radius: 50%;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .activity-repeat:hover {
            background: #f3f4f6;
            color: #374151;
        }
    `;
    document.head.appendChild(style);

    console.log('📊 Dashboard Manager Initialized Successfully!');
});