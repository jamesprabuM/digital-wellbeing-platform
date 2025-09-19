// ===== DIGITAL WELLBEING PLATFORM FIXES =====
// This script fixes issues with interactive elements like the CBT Thought Tracker

document.addEventListener('DOMContentLoaded', () => {
    console.log("🔧 Applying fixes to the Digital Wellbeing Platform...");

    // Fix for openCBTTool and other wellness tools
    fixWellnessToolGlobalFunctions();

    // Make sure modal functions work properly
    ensureModalFunctionality();

    // Fix any broken links or buttons
    repairBrokenInteractions();

    // Fix "coming soon" notifications for functioning features
    fixComingSoonFeatures();

    console.log("✅ Fixes applied successfully!");
});

// Fix missing global functions for wellness tools
function fixWellnessToolGlobalFunctions() {
    // Make sure the openCBTTool function correctly opens the CBT modal
    window.openCBTTool = function () {
        console.log("Opening CBT Thought Tracker");
        if (window.cbtTracker) {
            window.cbtTracker.open();
        } else {
            console.log("Initializing CBT Tracker");
            // Try to initialize the CBT Tracker if it doesn't exist
            window.cbtTracker = new CBTThoughtTracker();
            setTimeout(() => {
                if (window.cbtTracker && window.cbtTracker.open) {
                    window.cbtTracker.open();
                }
            }, 200);
        }
    };

    // Ensure other tool functions are correctly set
    window.openGratitudeJournal = function () {
        console.log("Opening Gratitude Journal");
        if (window.gratitudeJournal) {
            window.gratitudeJournal.open();
        } else {
            console.log("Initializing Gratitude Journal");
            window.gratitudeJournal = new GratitudeJournal();
            setTimeout(() => {
                if (window.gratitudeJournal && window.gratitudeJournal.open) {
                    window.gratitudeJournal.open();
                }
            }, 200);
        }
    };

    window.openSleepTool = function () {
        console.log("Opening Sleep Tool");
        if (window.sleepTracker) {
            window.sleepTracker.open();
        } else {
            console.log("Initializing Sleep Tracker");
            window.sleepTracker = new SleepTracker();
            setTimeout(() => {
                if (window.sleepTracker && window.sleepTracker.open) {
                    window.sleepTracker.open();
                }
            }, 200);
        }
    };

    // Create failsafe for breathing exercise
    window.startBreathingExercise = function () {
        console.log("Starting Breathing Exercise");
        if (window.breathingExercise) {
            window.breathingExercise.open();
        } else {
            console.log("Initializing Breathing Exercise");
            window.breathingExercise = new BreathingExercise();
            setTimeout(() => {
                if (window.breathingExercise && window.breathingExercise.open) {
                    window.breathingExercise.open();
                }
            }, 200);
        }
    };

    // Create failsafe for meditation
    window.startMeditation = function () {
        console.log("Starting Meditation");
        if (window.meditationTimer) {
            window.meditationTimer.open();
        } else {
            console.log("Initializing Meditation Timer");
            window.meditationTimer = new MeditationTimer();
            setTimeout(() => {
                if (window.meditationTimer && window.meditationTimer.open) {
                    window.meditationTimer.open();
                }
            }, 200);
        }
    };

    console.log("🛠️ Wellness tool global functions fixed");
}

// Ensure modal functionality works properly
function ensureModalFunctionality() {
    // Fix modal class issues
    document.querySelectorAll('.modal').forEach(modal => {
        if (!modal.classList.contains('active') && modal.style.display === 'block') {
            modal.classList.add('active');
        }

        // Make sure close buttons work
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        });

        // Add ESC key support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });

        // Close when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    console.log("🛠️ Modal functionality fixed");
}

// Fix any broken interactions
function repairBrokenInteractions() {
    // Fix notification system if broken
    if (!window.showNotification) {
        window.showNotification = function (message, type = 'info') {
            console.log(`[${type.toUpperCase()}] ${message}`);

            // Create a simple notification
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span>${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            `;

            // Style the notification
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: '9999',
                background: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                padding: '15px 20px',
                animation: 'slideInRight 0.3s forwards',
                maxWidth: '300px'
            });

            // Add border color based on type
            const colors = {
                info: '#3b82f6',
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444'
            };

            notification.style.borderLeft = `4px solid ${colors[type] || colors.info}`;

            // Add to document
            document.body.appendChild(notification);

            // Add close functionality
            const closeBtn = notification.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    notification.remove();
                });
            }

            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.remove();
            }, 5000);
        };
    }

    // Ensure Utils exists for storage operations
    if (!window.Utils) {
        window.Utils = {
            generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),
            storage: {
                set: (key, value) => {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                    } catch (e) {
                        console.warn('Local storage not available:', e);
                    }
                },
                get: (key) => {
                    try {
                        const item = localStorage.getItem(key);
                        return item ? JSON.parse(item) : null;
                    } catch (e) {
                        console.warn('Error reading from local storage:', e);
                        return null;
                    }
                },
                remove: (key) => {
                    try {
                        localStorage.removeItem(key);
                    } catch (e) {
                        console.warn('Error removing from local storage:', e);
                    }
                }
            }
        };
    }

    // Fix the CSS for modals to ensure they display properly
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            overflow: auto;
            align-items: center;
            justify-content: center;
        }
        
        .modal.active {
            display: flex !important;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 10px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            margin: 20px;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #374151;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #9ca3af;
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #374151;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.95rem;
        }
        
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 30px;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;

    document.head.appendChild(style);

    console.log("🛠️ Interactions and styles fixed");
}

// Fix "coming soon" notifications for features that should work
function fixComingSoonFeatures() {
    // Fix the Journal feature
    window.openJournal = function () {
        console.log("Opening Digital Journal");
        // Create a simple journal modal
        const journalModal = document.createElement('div');
        journalModal.id = 'journal-modal';
        journalModal.className = 'modal';
        journalModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Digital Journal</h3>
                    <button class="modal-close" aria-label="Close journal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="journal-container">
                        <div class="form-group">
                            <label for="journal-title">Entry Title:</label>
                            <input type="text" id="journal-title" placeholder="Give your entry a title...">
                        </div>
                        <div class="form-group">
                            <label for="journal-content">What's on your mind today?</label>
                            <textarea id="journal-content" rows="10" placeholder="Write freely about your thoughts, feelings, or experiences..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="journal-mood">Current Mood:</label>
                            <select id="journal-mood">
                                <option value="happy">Happy 😊</option>
                                <option value="calm">Calm 😌</option>
                                <option value="anxious">Anxious 😰</option>
                                <option value="sad">Sad 😢</option>
                                <option value="energetic">Energetic 🤩</option>
                                <option value="tired">Tired 😴</option>
                                <option value="frustrated">Frustrated 😤</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" onclick="saveJournalEntry()">Save Entry</button>
                            <button type="button" class="btn btn-outline" onclick="document.getElementById('journal-modal').classList.remove('active')">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add to DOM if not already there
        if (!document.getElementById('journal-modal')) {
            document.body.appendChild(journalModal);
        }

        // Display modal
        journalModal.classList.add('active');

        // Add save journal functionality
        window.saveJournalEntry = function () {
            const title = document.getElementById('journal-title').value;
            const content = document.getElementById('journal-content').value;
            const mood = document.getElementById('journal-mood').value;

            if (!content.trim()) {
                window.showNotification('Please write something in your journal entry.', 'warning');
                return;
            }

            const entry = {
                id: Utils.generateId(),
                title: title || `Journal Entry - ${new Date().toLocaleDateString()}`,
                content,
                mood,
                date: new Date().toISOString(),
                timestamp: Date.now()
            };

            // Save to storage
            let journalEntries = Utils.storage.get('journalEntries') || [];
            journalEntries.unshift(entry);
            Utils.storage.set('journalEntries', journalEntries);

            // Close modal
            document.getElementById('journal-modal').classList.remove('active');

            // Show confirmation
            window.showNotification('Journal entry saved successfully! 📝', 'success');

            // Add to recent activity if dashboard is available
            if (window.dashboard && typeof window.dashboard.addActivity === 'function') {
                window.dashboard.addActivity('journal', 'Journal Entry', 'Just now');
            }
        };
    };

    // Fix the Wellness Assessment feature
    window.takeAssessment = function () {
        console.log("Opening Wellness Assessment");
        // Create wellness assessment modal
        const assessmentModal = document.createElement('div');
        assessmentModal.id = 'assessment-modal';
        assessmentModal.className = 'modal';
        assessmentModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Wellness Check</h3>
                    <button class="modal-close" aria-label="Close assessment">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="assessment-container">
                        <p class="assessment-intro">Answer these questions to get a snapshot of your current wellbeing.</p>
                        <form id="wellness-assessment-form">
                            <div class="form-group">
                                <label for="sleep-quality">How would you rate your sleep quality in the past week?</label>
                                <div class="range-with-labels">
                                    <span>Poor</span>
                                    <input type="range" id="sleep-quality" min="1" max="10" value="5">
                                    <span>Excellent</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="stress-level">What's your current stress level?</label>
                                <div class="range-with-labels">
                                    <span>Low</span>
                                    <input type="range" id="stress-level" min="1" max="10" value="5">
                                    <span>High</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="social-connection">How connected do you feel to others?</label>
                                <div class="range-with-labels">
                                    <span>Disconnected</span>
                                    <input type="range" id="social-connection" min="1" max="10" value="5">
                                    <span>Very Connected</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="physical-activity">How physically active have you been?</label>
                                <div class="range-with-labels">
                                    <span>Not Active</span>
                                    <input type="range" id="physical-activity" min="1" max="10" value="5">
                                    <span>Very Active</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="mindful-minutes">How many minutes did you spend on mindfulness yesterday?</label>
                                <input type="number" id="mindful-minutes" min="0" value="0">
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-primary" onclick="submitWellnessCheck()">Submit Assessment</button>
                                <button type="button" class="btn btn-outline" onclick="document.getElementById('assessment-modal').classList.remove('active')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Add styles for range inputs
        const style = document.createElement('style');
        style.textContent = `
            .range-with-labels {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .range-with-labels input[type="range"] {
                flex-grow: 1;
            }
            .range-with-labels span {
                font-size: 0.8rem;
                color: #6b7280;
            }
        `;
        document.head.appendChild(style);

        // Add to DOM if not already there
        if (!document.getElementById('assessment-modal')) {
            document.body.appendChild(assessmentModal);
        }

        // Display modal
        assessmentModal.classList.add('active');

        // Add submit functionality
        window.submitWellnessCheck = function () {
            const sleepQuality = document.getElementById('sleep-quality').value;
            const stressLevel = document.getElementById('stress-level').value;
            const socialConnection = document.getElementById('social-connection').value;
            const physicalActivity = document.getElementById('physical-activity').value;
            const mindfulMinutes = document.getElementById('mindful-minutes').value;

            const assessment = {
                id: Utils.generateId(),
                date: new Date().toISOString(),
                timestamp: Date.now(),
                sleepQuality: parseInt(sleepQuality),
                stressLevel: parseInt(stressLevel),
                socialConnection: parseInt(socialConnection),
                physicalActivity: parseInt(physicalActivity),
                mindfulMinutes: parseInt(mindfulMinutes),
            };

            // Calculate wellness score (simple algorithm)
            const wellnessScore = Math.round(
                (parseInt(sleepQuality) +
                    (11 - parseInt(stressLevel)) + // Invert stress level (low is better)
                    parseInt(socialConnection) +
                    parseInt(physicalActivity) +
                    Math.min(parseInt(mindfulMinutes) / 10, 10)) / 5 * 10
            );

            assessment.wellnessScore = wellnessScore;

            // Save to storage
            let assessments = Utils.storage.get('wellnessAssessments') || [];
            assessments.unshift(assessment);
            Utils.storage.set('wellnessAssessments', assessments);

            // Update wellness data if needed
            let wellnessData = Utils.storage.get('wellnessData') || {
                sleep: 70,
                exercise: 60,
                mindfulness: 65
            };

            wellnessData.sleep = Math.round((wellnessData.sleep * 0.7) + (parseInt(sleepQuality) * 10 * 0.3));
            wellnessData.exercise = Math.round((wellnessData.exercise * 0.7) + (parseInt(physicalActivity) * 10 * 0.3));
            wellnessData.mindfulness = Math.round((wellnessData.mindfulness * 0.7) + (Math.min(parseInt(mindfulMinutes) / 5, 10) * 10 * 0.3));

            Utils.storage.set('wellnessData', wellnessData);

            // Close modal
            document.getElementById('assessment-modal').classList.remove('active');

            // Show result
            window.showNotification(`Assessment complete! Your wellness score is ${wellnessScore}/100`, 'success');

            // Add to recent activity if dashboard is available
            if (window.dashboard && typeof window.dashboard.addActivity === 'function') {
                window.dashboard.addActivity('assessment', 'Wellness Check', 'Just now');
            }

            // Reload dashboard if it exists to show updated score
            if (window.dashboard && typeof window.dashboard.updateWellnessScore === 'function') {
                window.dashboard.updateWellnessScore();
            }
        };
    };

    console.log("🛠️ Coming soon features fixed");
}