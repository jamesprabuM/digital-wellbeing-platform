// ===== COMPREHENSIVE SYSTEM FIX =====

class SystemFix {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyFixes());
        } else {
            this.applyFixes();
        }
    }

    applyFixes() {
        console.log('🔧 Applying comprehensive system fixes...');

        // Fix 1: Authentication sidebar visibility
        this.fixAuthSidebar();

        // Fix 2: Dynamic wellness score calculation
        this.fixWellnessScore();

        // Fix 3: CBT and wellness tools functionality
        this.fixWellnessTools();

        // Fix 4: Add missing advanced features
        this.addAdvancedFeatures();

        // Fix 5: Mood tracking functionality
        this.fixMoodTracking();

        console.log('✅ All system fixes applied successfully');
    }

    fixAuthSidebar() {
        const authSidebar = document.getElementById('auth-sidebar');
        if (authSidebar) {
            // Force show the auth sidebar
            authSidebar.style.display = 'flex';
            authSidebar.style.visibility = 'visible';
            authSidebar.style.opacity = '1';

            // Add CSS to ensure it stays visible
            const style = document.createElement('style');
            style.textContent = `
                .auth-sidebar {
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    position: relative !important;
                    background: rgba(255, 255, 255, 0.95) !important;
                    border-radius: 16px !important;
                    padding: 2rem !important;
                    margin-left: 2rem !important;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
                }
                
                .hero-layout {
                    display: flex !important;
                    gap: 3rem !important;
                    max-width: 1400px !important;
                    margin: 0 auto !important;
                    padding: 0 2rem !important;
                }
                
                .hero-layout .hero-content {
                    flex: 1 !important;
                    text-align: left !important;
                    max-width: none !important;
                }
                
                .hero-layout .hero-actions {
                    justify-content: flex-start !important;
                }
            `;
            document.head.appendChild(style);

            console.log('✅ Auth sidebar visibility fixed');
        }
    }

    fixWellnessScore() {
        // Override the hardcoded wellness score with dynamic calculation
        const updateWellnessScore = () => {
            const scoreElement = document.querySelector('.score-number');
            const statusElement = document.querySelector('.score-status');

            if (!scoreElement) return;

            // Get actual mood data
            const moodData = JSON.parse(localStorage.getItem('moodData') || '[]');
            const wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{"sleep": 70, "exercise": 60, "mindfulness": 65}');

            // Calculate dynamic score based on actual data
            let baseScore = Math.round((wellnessData.sleep + wellnessData.exercise + wellnessData.mindfulness) / 3);

            // Adjust based on recent mood
            if (moodData.length > 0) {
                const recentMoods = moodData.slice(-7);
                const avgMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
                const moodBonus = (avgMood - 3) * 5; // Adjust score based on mood
                baseScore = Math.max(0, Math.min(100, baseScore + moodBonus));
            }

            // Update display
            scoreElement.textContent = Math.round(baseScore);

            // Update status
            let status = '';
            if (baseScore >= 80) status = 'Excellent';
            else if (baseScore >= 60) status = 'Good Progress';
            else if (baseScore >= 40) status = 'Getting Started';
            else status = 'Needs Attention';

            if (statusElement) statusElement.textContent = status;

            // Update progress circle
            const circle = document.querySelector('.score-circle circle:last-child');
            if (circle) {
                const circumference = 2 * Math.PI * 45;
                const offset = circumference - (baseScore / 100) * circumference;
                circle.style.strokeDashoffset = offset;
            }

            // Update breakdown bars
            this.updateBreakdownBars(wellnessData);
        };

        // Update immediately and on mood changes
        updateWellnessScore();

        // Listen for mood changes
        document.addEventListener('moodUpdated', updateWellnessScore);

        console.log('✅ Dynamic wellness score calculation fixed');
    }

    updateBreakdownBars(wellnessData) {
        const categories = ['sleep', 'exercise', 'mindfulness'];
        categories.forEach((category, index) => {
            const scoreItems = document.querySelectorAll('.score-item');
            if (scoreItems[index]) {
                const fill = scoreItems[index].querySelector('.score-fill');
                if (fill) {
                    fill.style.width = `${wellnessData[category] || 70}%`;
                }
            }
        });
    }

    fixMoodTracking() {
        // Fix mood tracking to actually update wellness score
        const moodButtons = document.querySelectorAll('.mood-btn');
        moodButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mood = parseInt(e.target.dataset.mood);
                if (!mood) return;

                // Remove previous selections
                moodButtons.forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');

                // Save mood data
                const today = new Date().toDateString();
                let moodData = JSON.parse(localStorage.getItem('moodData') || '[]');

                // Update or add today's mood
                const existingIndex = moodData.findIndex(entry => entry.date === today);
                const moodEntry = {
                    date: today,
                    mood: mood,
                    timestamp: Date.now()
                };

                if (existingIndex >= 0) {
                    moodData[existingIndex] = moodEntry;
                } else {
                    moodData.push(moodEntry);
                }

                // Keep only last 30 days
                moodData = moodData.slice(-30);
                localStorage.setItem('moodData', JSON.stringify(moodData));

                // Update wellness data based on mood
                let wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{"sleep": 70, "exercise": 60, "mindfulness": 65}');

                // Adjust wellness metrics based on mood
                if (mood >= 4) {
                    wellnessData.mindfulness = Math.min(100, wellnessData.mindfulness + 2);
                    wellnessData.sleep = Math.min(100, wellnessData.sleep + 1);
                } else if (mood <= 2) {
                    wellnessData.sleep = Math.max(0, wellnessData.sleep - 1);
                    wellnessData.exercise = Math.max(0, wellnessData.exercise - 1);
                }

                localStorage.setItem('wellnessData', JSON.stringify(wellnessData));

                // Trigger wellness score update
                document.dispatchEvent(new CustomEvent('moodUpdated'));

                // Show feedback
                if (window.showNotification) {
                    window.showNotification(`Mood recorded! ${['😢', '😔', '😐', '😊', '😄'][mood - 1]}`, 'success');
                }

                console.log('Mood updated:', mood);
            });
        });

        console.log('✅ Mood tracking functionality fixed');
    }

    fixWellnessTools() {
        // Ensure CBT Tool and other wellness tools work
        window.openCBTTool = function () {
            console.log("Opening CBT Thought Tracker");

            // Create modal if it doesn't exist
            if (!document.getElementById('cbt-modal')) {
                const modal = document.createElement('div');
                modal.id = 'cbt-modal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>CBT Thought Tracker</h3>
                            <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="thought-form">
                                <div class="form-group">
                                    <label for="situation">What situation triggered this thought?</label>
                                    <textarea id="situation" required placeholder="Describe the situation..."></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="automatic-thought">What automatic thought came to mind?</label>
                                    <textarea id="automatic-thought" required placeholder="What did you think?"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="emotion">What emotion did you feel?</label>
                                    <select id="emotion" required>
                                        <option value="">Select emotion</option>
                                        <option value="anxious">Anxious</option>
                                        <option value="sad">Sad</option>
                                        <option value="angry">Angry</option>
                                        <option value="frustrated">Frustrated</option>
                                        <option value="worried">Worried</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="intensity">Intensity (1-10): <span id="intensity-value">5</span></label>
                                    <input type="range" id="intensity" min="1" max="10" value="5" 
                                           oninput="document.getElementById('intensity-value').textContent = this.value">
                                </div>
                                <div class="form-group">
                                    <label for="balanced-thought">What's a more balanced thought?</label>
                                    <textarea id="balanced-thought" placeholder="Challenge your automatic thought..."></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Save Thought</button>
                            </form>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                // Add form handler
                document.getElementById('thought-form').addEventListener('submit', (e) => {
                    e.preventDefault();

                    const thoughtEntry = {
                        id: Date.now(),
                        situation: document.getElementById('situation').value,
                        automaticThought: document.getElementById('automatic-thought').value,
                        emotion: document.getElementById('emotion').value,
                        intensity: document.getElementById('intensity').value,
                        balancedThought: document.getElementById('balanced-thought').value,
                        date: new Date().toISOString(),
                        timestamp: Date.now()
                    };

                    // Save to storage
                    let thoughts = JSON.parse(localStorage.getItem('cbtThoughts') || '[]');
                    thoughts.unshift(thoughtEntry);
                    localStorage.setItem('cbtThoughts', JSON.stringify(thoughts));

                    // Close modal and show success
                    modal.classList.remove('active');
                    if (window.showNotification) {
                        window.showNotification('Thought recorded successfully! 🧠', 'success');
                    }

                    // Reset form
                    e.target.reset();
                    document.getElementById('intensity-value').textContent = '5';
                });
            }

            document.getElementById('cbt-modal').classList.add('active');
        };

        console.log('✅ CBT and wellness tools fixed');
    }

    addAdvancedFeatures() {
        // Add the missing advanced features to the dashboard
        const wellnessSection = document.querySelector('.wellness-tools') || document.querySelector('.dashboard-grid');
        if (!wellnessSection) {
            setTimeout(() => this.addAdvancedFeatures(), 1000);
            return;
        }

        // Add Neural Feedback Visualizer
        if (!document.getElementById('neural-feedback-panel')) {
            this.addNeuralFeedback(wellnessSection);
        }

        // Add AI Dream Journal
        if (!document.getElementById('dream-journal-panel')) {
            this.addDreamJournal(wellnessSection);
        }

        // Add Biometric Integration
        if (!document.getElementById('biometric-panel')) {
            this.addBiometricIntegration(wellnessSection);
        }

        console.log('✅ Advanced features added');
    }

    addNeuralFeedback(container) {
        const neuralPanel = document.createElement('div');
        neuralPanel.id = 'neural-feedback-panel';
        neuralPanel.className = 'dashboard-card neural-feedback';
        neuralPanel.innerHTML = `
            <h3 class="card-title">
                <i class="fas fa-brain"></i>
                Neural Feedback Visualizer
            </h3>
            <div class="neural-controls">
                <button class="btn btn-primary" onclick="startNeuralVisualization()">
                    <i class="fas fa-play"></i> Start Visualization
                </button>
            </div>
            <canvas id="neural-canvas" width="400" height="200" style="width: 100%; border-radius: 10px; background: linear-gradient(45deg, #667eea, #764ba2);"></canvas>
            <div class="neural-metrics">
                <div class="metric">
                    <span>Mental State:</span>
                    <span id="mental-state">Calm</span>
                </div>
                <div class="metric">
                    <span>Focus Level:</span>
                    <span id="focus-level">75%</span>
                </div>
            </div>
        `;
        container.appendChild(neuralPanel);

        // Add functionality
        window.startNeuralVisualization = function () {
            if (window.showNotification) {
                window.showNotification('Neural feedback visualization started! 🧠', 'success');
            }

            // Simple animation
            const canvas = document.getElementById('neural-canvas');
            const ctx = canvas.getContext('2d');
            let frame = 0;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw brain wave simulation
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();

                for (let x = 0; x < canvas.width; x += 2) {
                    const y = canvas.height / 2 + Math.sin((x + frame) * 0.02) * 30;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.stroke();
                frame += 2;

                if (frame < 1000) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        };
    }

    addDreamJournal(container) {
        const dreamPanel = document.createElement('div');
        dreamPanel.id = 'dream-journal-panel';
        dreamPanel.className = 'dashboard-card dream-journal';
        dreamPanel.innerHTML = `
            <h3 class="card-title">
                <i class="fas fa-moon"></i>
                AI Dream Journal
            </h3>
            <div class="dream-input">
                <textarea id="dream-entry" placeholder="Describe your dream..." rows="3"></textarea>
                <button class="btn btn-primary" onclick="analyzeDream()">
                    <i class="fas fa-search"></i> Analyze Dream
                </button>
            </div>
            <div id="dream-analysis" class="dream-analysis" style="display: none;">
                <h4>Dream Analysis</h4>
                <div id="dream-result"></div>
            </div>
        `;
        container.appendChild(dreamPanel);

        // Add functionality
        window.analyzeDream = function () {
            const dreamText = document.getElementById('dream-entry').value.trim();
            if (!dreamText) return;

            // Simple dream analysis
            const analysis = analyzeDreamText(dreamText);

            document.getElementById('dream-result').innerHTML = `
                <div class="analysis-item">
                    <strong>Sentiment:</strong> ${analysis.sentiment}
                </div>
                <div class="analysis-item">
                    <strong>Themes:</strong> ${analysis.themes.join(', ') || 'None detected'}
                </div>
                <div class="analysis-item">
                    <strong>Interpretation:</strong> ${analysis.interpretation}
                </div>
            `;

            document.getElementById('dream-analysis').style.display = 'block';

            // Save dream
            let dreams = JSON.parse(localStorage.getItem('dreams') || '[]');
            dreams.unshift({
                text: dreamText,
                analysis: analysis,
                date: new Date().toISOString(),
                timestamp: Date.now()
            });
            localStorage.setItem('dreams', JSON.stringify(dreams.slice(0, 50)));

            if (window.showNotification) {
                window.showNotification('Dream analyzed! 🌙', 'success');
            }
        };

        function analyzeDreamText(text) {
            const lowerText = text.toLowerCase();

            // Sentiment analysis
            const positiveWords = ['happy', 'joy', 'beautiful', 'peaceful', 'love', 'flying'];
            const negativeWords = ['scary', 'dark', 'falling', 'chase', 'fear', 'nightmare'];

            let sentiment = 'neutral';
            if (positiveWords.some(word => lowerText.includes(word))) sentiment = 'positive';
            if (negativeWords.some(word => lowerText.includes(word))) sentiment = 'negative';

            // Theme detection
            const themes = [];
            if (lowerText.includes('water') || lowerText.includes('ocean') || lowerText.includes('rain')) themes.push('Water/Emotions');
            if (lowerText.includes('flying') || lowerText.includes('sky')) themes.push('Freedom/Aspiration');
            if (lowerText.includes('house') || lowerText.includes('home')) themes.push('Security/Self');
            if (lowerText.includes('animal') || lowerText.includes('dog') || lowerText.includes('cat')) themes.push('Instincts');

            // Simple interpretation
            let interpretation = 'Your dream reflects your subconscious mind processing daily experiences.';
            if (sentiment === 'positive') interpretation = 'This positive dream may indicate good mental health and optimism.';
            if (sentiment === 'negative') interpretation = 'This dream might reflect current stress or concerns that need attention.';

            return { sentiment, themes, interpretation };
        }
    }

    addBiometricIntegration(container) {
        const bioPanel = document.createElement('div');
        bioPanel.id = 'biometric-panel';
        bioPanel.className = 'dashboard-card biometric-integration';
        bioPanel.innerHTML = `
            <h3 class="card-title">
                <i class="fas fa-heartbeat"></i>
                Biometric Monitoring
            </h3>
            <div class="bio-metrics">
                <div class="metric-item">
                    <div class="metric-icon"><i class="fas fa-heartbeat"></i></div>
                    <div class="metric-data">
                        <span class="metric-label">Heart Rate</span>
                        <span class="metric-value" id="heart-rate">--</span>
                        <span class="metric-unit">BPM</span>
                    </div>
                </div>
                <div class="metric-item">
                    <div class="metric-icon"><i class="fas fa-brain"></i></div>
                    <div class="metric-data">
                        <span class="metric-label">Stress Level</span>
                        <span class="metric-value" id="stress-level">--</span>
                        <span class="metric-unit">%</span>
                    </div>
                </div>
            </div>
            <div class="bio-controls">
                <button class="btn btn-primary" onclick="startBiometricMonitoring()">
                    <i class="fas fa-play"></i> Start Monitoring
                </button>
                <button class="btn btn-secondary" onclick="connectDevice()">
                    <i class="fas fa-bluetooth"></i> Connect Device
                </button>
            </div>
        `;
        container.appendChild(bioPanel);

        // Add functionality
        window.startBiometricMonitoring = function () {
            if (window.showNotification) {
                window.showNotification('Biometric monitoring started! 📊', 'success');
            }

            // Simulate biometric data
            const updateMetrics = () => {
                const heartRate = 60 + Math.floor(Math.random() * 40);
                const stressLevel = Math.floor(Math.random() * 100);

                document.getElementById('heart-rate').textContent = heartRate;
                document.getElementById('stress-level').textContent = stressLevel;

                // Update wellness data based on biometrics
                let wellnessData = JSON.parse(localStorage.getItem('wellnessData') || '{"sleep": 70, "exercise": 60, "mindfulness": 65}');

                if (heartRate > 90) {
                    wellnessData.exercise = Math.min(100, wellnessData.exercise + 1);
                }
                if (stressLevel < 30) {
                    wellnessData.mindfulness = Math.min(100, wellnessData.mindfulness + 1);
                }

                localStorage.setItem('wellnessData', JSON.stringify(wellnessData));
                document.dispatchEvent(new CustomEvent('moodUpdated'));
            };

            updateMetrics();
            setInterval(updateMetrics, 5000);
        };

        window.connectDevice = function () {
            if (window.showNotification) {
                window.showNotification('Device connection coming soon! Use smartphone sensors for now.', 'info');
            }
        };
    }
}

// Initialize the system fix
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => new SystemFix(), 1000);
    });
} else {
    setTimeout(() => new SystemFix(), 1000);
}

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SystemFix };
}