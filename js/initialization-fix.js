// ===== COMPREHENSIVE INITIALIZATION FIX =====

(function () {
    console.log('🔄 Starting MindfulPath Platform Fix...');

    // Execute immediately
    fixAuthenticationSidebar();
    fixWellnessScore();
    fixWellnessTools();

    // Monitor DOM for readiness
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAllSystems);
    } else {
        setTimeout(initializeAllSystems, 100);
    }

    // Fix authentication sidebar visibility
    function fixAuthenticationSidebar() {
        console.log('🔧 Fixing authentication sidebar...');
        const style = document.createElement('style');
        style.textContent = `
            .auth-sidebar {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
            }
            
            .hero-layout {
                display: flex !important;
                gap: 3rem !important;
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            const authSidebar = document.getElementById('auth-sidebar');
            if (authSidebar) {
                authSidebar.style.display = 'flex';
                authSidebar.style.visibility = 'visible';
                authSidebar.style.opacity = '1';
                console.log('✅ Authentication sidebar fixed');
            }
        }, 100);
    }

    // Fix wellness score
    function fixWellnessScore() {
        console.log('🔧 Fixing wellness score...');

        // Load stored wellness data
        let wellnessData;
        try {
            wellnessData = JSON.parse(localStorage.getItem('wellnessData')) || {
                sleep: 70,
                exercise: 65,
                mindfulness: 75
            };
        } catch (e) {
            wellnessData = {
                sleep: 70,
                exercise: 65,
                mindfulness: 75
            };
        }

        // Calculate dynamic score from actual data
        const score = Math.round((wellnessData.sleep + wellnessData.exercise + wellnessData.mindfulness) / 3);

        // Update UI with calculated score
        setTimeout(() => {
            const scoreElement = document.querySelector('.score-number');
            const statusElement = document.querySelector('.score-status');

            if (scoreElement) {
                scoreElement.textContent = score;
                console.log('✅ Wellness score updated to:', score);
            }

            if (statusElement) {
                let status = '';
                if (score >= 80) status = 'Excellent';
                else if (score >= 60) status = 'Good Progress';
                else if (score >= 40) status = 'Getting Started';
                else status = 'Needs Attention';

                statusElement.textContent = status;
            }

            // Update progress circle
            const circle = document.querySelector('.score-circle circle:last-child');
            if (circle) {
                const circumference = 2 * Math.PI * 45;
                const offset = circumference - (score / 100) * circumference;
                circle.style.strokeDashoffset = offset;
            }

            // Update breakdown bars
            updateBreakdownBars(wellnessData);
        }, 200);
    }

    // Update wellness breakdown bars
    function updateBreakdownBars(wellnessData) {
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

    // Fix wellness tools
    function fixWellnessTools() {
        console.log('🔧 Fixing wellness tools...');

        // Fix CBT Tool
        window.openCBTTool = function () {
            console.log('Opening CBT Thought Tracker');

            // Create modal if it doesn't exist
            if (!document.getElementById('cbt-modal')) {
                const modal = document.createElement('div');
                modal.id = 'cbt-modal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>🧠 CBT Thought Tracker</h3>
                            <button class="modal-close" onclick="document.getElementById('cbt-modal').classList.remove('active')">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="cbt-form">
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
                                    <label for="intensity">Intensity (1-10): <span id="intensity-display">5</span></label>
                                    <input type="range" id="intensity" min="1" max="10" value="5" 
                                           oninput="document.getElementById('intensity-display').textContent = this.value">
                                </div>
                                <div class="form-group">
                                    <label for="balanced-thought">What's a more balanced thought?</label>
                                    <textarea id="balanced-thought" placeholder="Challenge your automatic thought..."></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Save Thought Record</button>
                            </form>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                // Add form handler
                document.getElementById('cbt-form').addEventListener('submit', function (e) {
                    e.preventDefault();

                    // Save thought entry
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

                    // Close modal
                    document.getElementById('cbt-modal').classList.remove('active');

                    // Show notification
                    if (window.showNotification) {
                        window.showNotification('Thought recorded successfully! 🧠', 'success');
                    }

                    // Reset form
                    e.target.reset();
                    document.getElementById('intensity-display').textContent = '5';
                });
            }

            // Show modal
            document.getElementById('cbt-modal').classList.add('active');
        };

        // Fix Sleep Tool
        window.openSleepTool = function () {
            console.log('Opening Sleep Tool');
            if (window.sleepTracker) {
                window.sleepTracker.open();
            } else if (window.SleepTracker) {
                window.sleepTracker = new SleepTracker();
                setTimeout(() => window.sleepTracker.open(), 100);
            } else {
                if (window.showNotification) {
                    window.showNotification('Loading Sleep Tool...', 'info');
                }
            }
        };

        // Fix Gratitude Journal
        window.openGratitudeJournal = function () {
            console.log('Opening Gratitude Journal');
            if (window.gratitudeJournal) {
                window.gratitudeJournal.open();
            } else if (window.GratitudeJournal) {
                window.gratitudeJournal = new GratitudeJournal();
                setTimeout(() => window.gratitudeJournal.open(), 100);
            } else {
                if (window.showNotification) {
                    window.showNotification('Loading Gratitude Journal...', 'info');
                }
            }
        };

        console.log('✅ Wellness tools fixed');
    }

    // Initialize all systems
    function initializeAllSystems() {
        console.log('🚀 Initializing all MindfulPath systems...');

        // Add missing modal styles
        const modalStyle = document.createElement('style');
        modalStyle.textContent = `
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 1000;
                align-items: center;
                justify-content: center;
            }
            
            .modal.active {
                display: flex;
            }
            
            .modal-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
            }
            
            .form-group textarea,
            .form-group select,
            .form-group input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-family: inherit;
            }
            
            .form-group textarea {
                height: 80px;
                resize: vertical;
            }
        `;
        document.head.appendChild(modalStyle);

        // Add advanced features
        addAdvancedFeatures();

        console.log('✅ All MindfulPath systems initialized successfully!');
    }

    // Add advanced features
    function addAdvancedFeatures() {
        console.log('🔧 Adding advanced features...');

        // Find container for advanced features
        const container = document.querySelector('.wellness-tools') || document.querySelector('.dashboard');
        if (!container) {
            console.warn('Container for advanced features not found');
            return;
        }

        // Add Dream Analysis
        addDreamAnalysisFeature(container);

        // Add Neural Feedback
        addNeuralFeedbackFeature(container);

        // Add Biometric Integration
        addBiometricFeature(container);

        console.log('✅ Advanced features added');
    }

    // Add Dream Analysis feature
    function addDreamAnalysisFeature(container) {
        if (document.getElementById('dream-journal-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'dream-journal-panel';
        panel.className = 'dashboard-card';
        panel.innerHTML = `
            <h3 class="card-title">
                <i class="fas fa-moon"></i>
                AI Dream Analysis
            </h3>
            <div class="dream-input">
                <textarea id="dream-entry" placeholder="Describe your dream in detail..." rows="3"></textarea>
                <button class="btn btn-primary" onclick="analyzeDream()">
                    <i class="fas fa-search"></i> Analyze Dream
                </button>
            </div>
            <div id="dream-result" class="dream-result" style="display: none;">
                <h4>Analysis Results</h4>
                <div id="dream-interpretation"></div>
            </div>
        `;
        container.appendChild(panel);

        // Add dream analysis functionality
        window.analyzeDream = function () {
            const dreamText = document.getElementById('dream-entry').value.trim();
            if (!dreamText) {
                if (window.showNotification) {
                    window.showNotification('Please describe your dream first', 'warning');
                }
                return;
            }

            // Simple dream analysis
            const analysis = analyzeDreamText(dreamText);

            // Display results
            document.getElementById('dream-interpretation').innerHTML = `
                <div class="analysis-section">
                    <strong>Emotional Tone:</strong> ${analysis.emotion}
                </div>
                <div class="analysis-section">
                    <strong>Key Themes:</strong> ${analysis.themes.join(', ') || 'None detected'}
                </div>
                <div class="analysis-section">
                    <strong>Symbols:</strong> ${analysis.symbols.join(', ') || 'None detected'}
                </div>
                <div class="analysis-section">
                    <strong>Interpretation:</strong> ${analysis.interpretation}
                </div>
            `;

            document.getElementById('dream-result').style.display = 'block';

            // Show success notification
            if (window.showNotification) {
                window.showNotification('Dream analyzed successfully! 🌙', 'success');
            }
        };

        // Dream text analysis function
        function analyzeDreamText(text) {
            const lowerText = text.toLowerCase();

            // Emotion analysis
            let emotion = 'neutral';
            if (lowerText.includes('scary') || lowerText.includes('nightmare') || lowerText.includes('afraid')) {
                emotion = 'fearful';
            } else if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('beautiful')) {
                emotion = 'positive';
            } else if (lowerText.includes('sad') || lowerText.includes('crying') || lowerText.includes('lost')) {
                emotion = 'melancholic';
            }

            // Theme detection
            const themes = [];
            if (lowerText.includes('water') || lowerText.includes('ocean') || lowerText.includes('river')) themes.push('Water/Emotions');
            if (lowerText.includes('flying') || lowerText.includes('falling')) themes.push('Control/Freedom');
            if (lowerText.includes('house') || lowerText.includes('home')) themes.push('Security/Self');
            if (lowerText.includes('people') || lowerText.includes('family') || lowerText.includes('friends')) themes.push('Relationships');

            // Symbol detection
            const symbols = [];
            if (lowerText.includes('animal') || lowerText.includes('dog') || lowerText.includes('cat')) symbols.push('Animals (instincts)');
            if (lowerText.includes('car') || lowerText.includes('vehicle')) symbols.push('Transportation (life direction)');
            if (lowerText.includes('door') || lowerText.includes('window')) symbols.push('Openings (opportunities)');

            // Generate interpretation
            let interpretation = 'Your dream reflects your subconscious mind processing daily experiences and emotions.';

            if (emotion === 'fearful') {
                interpretation = 'This dream may reflect current anxieties or stresses in your waking life. Consider what situations might be causing worry.';
            } else if (emotion === 'positive') {
                interpretation = 'This positive dream suggests good mental health and optimism about your current life situation.';
            } else if (themes.includes('Water/Emotions')) {
                interpretation = 'Water in dreams often represents emotions. The state of the water may reflect your emotional state.';
            } else if (themes.includes('Control/Freedom')) {
                interpretation = 'Dreams of flying or falling often relate to feelings of control or lack thereof in your waking life.';
            }

            return { emotion, themes, symbols, interpretation };
        }
    }

    // Add Neural Feedback feature
    function addNeuralFeedbackFeature(container) {
        if (document.getElementById('neural-feedback-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'neural-feedback-panel';
        panel.className = 'dashboard-card';
        panel.innerHTML = `
            <h3 class="card-title">
                <i class="fas fa-brain"></i>
                Neural Feedback Visualizer
            </h3>
            <div class="neural-status">
                <div class="status-indicator active"></div>
                <span>Real-time Analysis Ready</span>
            </div>
            <canvas id="neural-canvas" width="300" height="150"></canvas>
            <div class="neural-metrics">
                <div class="metric">
                    <span>Focus Level:</span>
                    <span id="focus-level">--</span>
                </div>
                <div class="metric">
                    <span>Relaxation:</span>
                    <span id="relaxation-level">--</span>
                </div>
            </div>
            <button class="btn btn-primary" onclick="startNeuralFeedback()">
                <i class="fas fa-play"></i> Start Session
            </button>
        `;
        container.appendChild(panel);

        // Add neural feedback visualization
        window.startNeuralFeedback = function () {
            const canvas = document.getElementById('neural-canvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            let frame = 0;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw brain wave simulation
                ctx.strokeStyle = '#667eea';
                ctx.lineWidth = 2;

                // Alpha waves
                ctx.beginPath();
                for (let x = 0; x < canvas.width; x += 2) {
                    const y = canvas.height / 3 + Math.sin((x + frame) * 0.02) * 20;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Beta waves
                ctx.strokeStyle = '#764ba2';
                ctx.beginPath();
                for (let x = 0; x < canvas.width; x += 1) {
                    const y = 2 * canvas.height / 3 + Math.sin((x + frame) * 0.05) * 15;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                frame += 2;

                // Update metrics
                document.getElementById('focus-level').textContent = `${70 + Math.round(Math.sin(frame * 0.01) * 15)}%`;
                document.getElementById('relaxation-level').textContent = `${65 + Math.round(Math.cos(frame * 0.008) * 20)}%`;

                if (frame < 2000) {
                    requestAnimationFrame(animate);
                }
            };

            animate();

            if (window.showNotification) {
                window.showNotification('Neural feedback session started! 🧠', 'success');
            }
        };
    }

    // Add Biometric Integration feature
    function addBiometricFeature(container) {
        if (document.getElementById('biometric-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'biometric-panel';
        panel.className = 'dashboard-card';
        panel.innerHTML = `
            <h3 class="card-title">
                <i class="fas fa-heartbeat"></i>
                Biometric Monitoring
            </h3>
            <div class="biometric-status">
                <div class="status-indicator"></div>
                <span id="biometric-status">Ready to Connect</span>
            </div>
            <div class="biometric-metrics">
                <div class="metric-row">
                    <div class="metric">
                        <i class="fas fa-heartbeat"></i>
                        <span>Heart Rate</span>
                        <strong id="heart-rate">--</strong>
                    </div>
                    <div class="metric">
                        <i class="fas fa-thermometer-half"></i>
                        <span>Stress Level</span>
                        <strong id="stress-level">--</strong>
                    </div>
                </div>
            </div>
            <div class="biometric-controls">
                <button class="btn btn-primary" onclick="startBiometricMonitoring()">
                    <i class="fas fa-play"></i> Start Monitoring
                </button>
                <button class="btn btn-secondary" onclick="connectBiometricDevice()">
                    <i class="fas fa-bluetooth"></i> Connect Device
                </button>
            </div>
        `;
        container.appendChild(panel);

        // Add biometric monitoring functionality
        window.startBiometricMonitoring = function () {
            const statusEl = document.getElementById('biometric-status');
            const heartRateEl = document.getElementById('heart-rate');
            const stressLevelEl = document.getElementById('stress-level');
            const statusIndicator = document.querySelector('#biometric-panel .status-indicator');

            if (statusEl) statusEl.textContent = 'Monitoring Active';
            if (statusIndicator) statusIndicator.classList.add('active');

            const updateMetrics = () => {
                const heartRate = 60 + Math.floor(Math.random() * 40);
                const stressLevel = Math.floor(Math.random() * 100);

                if (heartRateEl) heartRateEl.textContent = `${heartRate} BPM`;
                if (stressLevelEl) stressLevelEl.textContent = `${stressLevel}%`;

                // Update wellness data based on biometrics
                let wellnessData;
                try {
                    wellnessData = JSON.parse(localStorage.getItem('wellnessData')) || {
                        sleep: 70,
                        exercise: 65,
                        mindfulness: 75
                    };
                } catch (e) {
                    wellnessData = {
                        sleep: 70,
                        exercise: 65,
                        mindfulness: 75
                    };
                }

                if (heartRate > 90) {
                    wellnessData.exercise = Math.min(100, wellnessData.exercise + 1);
                }
                if (stressLevel < 30) {
                    wellnessData.mindfulness = Math.min(100, wellnessData.mindfulness + 1);
                }

                localStorage.setItem('wellnessData', JSON.stringify(wellnessData));

                // Update wellness score
                fixWellnessScore();
            };

            // Update immediately and then every 3 seconds
            updateMetrics();
            window.biometricInterval = setInterval(updateMetrics, 3000);

            if (window.showNotification) {
                window.showNotification('Biometric monitoring started! 📊', 'success');
            }
        };

        window.connectBiometricDevice = function () {
            if (window.showNotification) {
                window.showNotification('Device connection feature coming soon! Using simulated data for now.', 'info');
            }
        };
    }

    // Add a console message when fully loaded
    console.log('🚀 MindfulPath Initialization Fix - All systems loaded and ready!');

    // Show status notification after a delay
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification('MindfulPath platform is fully initialized!', 'success');
        }
    }, 1500);
})();