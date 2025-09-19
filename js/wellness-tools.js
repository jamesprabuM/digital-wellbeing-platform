// ===== WELLNESS TOOLS SCRIPT =====

// ===== BREATHING EXERCISE =====
class BreathingExercise {
    constructor() {
        this.modal = document.getElementById('breathing-modal');
        this.circle = document.getElementById('breathing-circle');
        this.text = document.getElementById('breathing-text');
        this.instruction = document.getElementById('breathing-instruction');
        this.startBtn = document.getElementById('breathing-start');
        this.pauseBtn = document.getElementById('breathing-pause');
        this.stopBtn = document.getElementById('breathing-stop');
        this.techniqueSelect = document.getElementById('breathing-technique');

        this.isActive = false;
        this.isPaused = false;
        this.currentCycle = 0;
        this.totalCycles = 0;
        this.animationId = null;
        this.currentTechnique = '478';

        this.techniques = {
            '478': {
                name: '4-7-8 Breathing',
                phases: [
                    { name: 'Inhale', duration: 4000, scale: 1.3, color: '#4facfe' },
                    { name: 'Hold', duration: 7000, scale: 1.3, color: '#00f2fe' },
                    { name: 'Exhale', duration: 8000, scale: 0.8, color: '#43e97b' }
                ],
                description: 'A calming technique that helps reduce anxiety and promote sleep.'
            },
            'box': {
                name: 'Box Breathing',
                phases: [
                    { name: 'Inhale', duration: 4000, scale: 1.3, color: '#667eea' },
                    { name: 'Hold', duration: 4000, scale: 1.3, color: '#764ba2' },
                    { name: 'Exhale', duration: 4000, scale: 0.8, color: '#f093fb' },
                    { name: 'Hold', duration: 4000, scale: 0.8, color: '#f5576c' }
                ],
                description: 'Used by Navy SEALs to maintain calm and focus under pressure.'
            },
            'coherent': {
                name: 'Coherent Breathing',
                phases: [
                    { name: 'Inhale', duration: 5000, scale: 1.2, color: '#4facfe' },
                    { name: 'Exhale', duration: 5000, scale: 0.9, color: '#43e97b' }
                ],
                description: 'Promotes heart rate variability and emotional balance.'
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTechniqueInfo();
    }

    setupEventListeners() {
        // Modal controls
        const closeBtn = this.modal?.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Button controls
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.start());
        }

        if (this.pauseBtn) {
            this.pauseBtn.addEventListener('click', () => this.pause());
        }

        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stop());
        }

        if (this.techniqueSelect) {
            this.techniqueSelect.addEventListener('change', (e) => {
                this.currentTechnique = e.target.value;
                this.updateTechniqueInfo();
                if (this.isActive) {
                    this.stop();
                }
            });
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.modal?.classList.contains('active')) {
                switch (e.key) {
                    case 'Escape':
                        this.close();
                        break;
                    case ' ':
                        e.preventDefault();
                        if (this.isActive && !this.isPaused) {
                            this.pause();
                        } else if (this.isPaused) {
                            this.resume();
                        } else {
                            this.start();
                        }
                        break;
                }
            }
        });
    }

    open() {
        if (this.modal) {
            this.modal.classList.add('active');
            this.modal.setAttribute('aria-hidden', 'false');

            // Focus the start button
            setTimeout(() => {
                if (this.startBtn) {
                    this.startBtn.focus();
                }
            }, 100);

            // Announce to screen reader
            if (window.accessibilityManager) {
                window.accessibilityManager.announceToScreenReader('Breathing exercise opened. Press spacebar to start or stop.');
            }
        }
    }

    close() {
        if (this.modal) {
            this.stop();
            this.modal.classList.remove('active');
            this.modal.setAttribute('aria-hidden', 'true');
        }
    }

    start() {
        if (this.isActive) return;

        try {
            this.isActive = true;
            this.isPaused = false;
            this.currentCycle = 0;
            this.totalCycles = 0;

            this.updateUI();
            this.startCycle();

            if (window.showNotification) {
                window.showNotification('Breathing exercise started. Focus on your breath.', 'success');
            }
        } catch (error) {
            console.error('Error starting breathing exercise:', error);
            if (window.showNotification) {
                window.showNotification('Unable to start breathing exercise. Please try again.', 'error');
            }
            this.isActive = false;
        }
    }

    pause() {
        if (!this.isActive || this.isPaused) return;

        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.updateUI();

        if (this.instruction) {
            this.instruction.textContent = 'Exercise paused. Click resume or press spacebar to continue.';
        }
    }

    resume() {
        if (!this.isPaused) return;

        this.isPaused = false;
        this.updateUI();
        this.startCycle();
    }

    stop() {
        this.isActive = false;
        this.isPaused = false;
        this.currentCycle = 0;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.resetCircle();
        this.updateUI();

        if (this.instruction) {
            this.instruction.textContent = 'Exercise completed. Take a moment to notice how you feel.';
        }

        if (this.text) {
            this.text.textContent = 'Breathe';
        }
    }

    startCycle() {
        if (!this.isActive || this.isPaused) return;

        const technique = this.techniques[this.currentTechnique];
        const currentPhase = technique.phases[this.currentCycle % technique.phases.length];

        this.animatePhase(currentPhase, () => {
            this.currentCycle++;

            if (this.currentCycle % technique.phases.length === 0) {
                this.totalCycles++;
            }

            // Continue the exercise
            if (this.isActive && !this.isPaused) {
                this.startCycle();
            }
        });
    }

    animatePhase(phase, callback) {
        if (!this.circle || !this.text) return;

        this.text.textContent = phase.name;

        if (this.instruction) {
            const technique = this.techniques[this.currentTechnique];
            this.instruction.textContent = `${technique.name} - Cycle ${this.totalCycles + 1}`;
        }

        // Animate circle
        this.circle.style.transform = `scale(${phase.scale})`;
        this.circle.style.background = `linear-gradient(135deg, ${phase.color}, ${this.lightenColor(phase.color, 20)})`;
        this.circle.style.transition = `all ${phase.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        // Complete phase after duration
        setTimeout(() => {
            if (callback && this.isActive && !this.isPaused) {
                callback();
            }
        }, phase.duration);
    }

    lightenColor(color, percent) {
        // Simple color lightening function
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const newR = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
        const newG = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
        const newB = Math.min(255, Math.floor(b + (255 - b) * percent / 100));

        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    resetCircle() {
        if (this.circle) {
            this.circle.style.transform = 'scale(1)';
            this.circle.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            this.circle.style.transition = 'all 0.3s ease';
        }
    }

    updateUI() {
        if (!this.startBtn || !this.pauseBtn) return;

        if (this.isActive && !this.isPaused) {
            this.startBtn.style.display = 'none';
            this.pauseBtn.classList.remove('hidden');
            this.pauseBtn.textContent = 'Pause';
        } else if (this.isPaused) {
            this.startBtn.style.display = 'none';
            this.pauseBtn.classList.remove('hidden');
            this.pauseBtn.textContent = 'Resume';
        } else {
            this.startBtn.style.display = 'inline-flex';
            this.pauseBtn.classList.add('hidden');
        }
    }

    updateTechniqueInfo() {
        const technique = this.techniques[this.currentTechnique];
        if (this.instruction && technique) {
            this.instruction.textContent = technique.description;
        }
    }
}

// ===== MEDITATION TIMER =====
class MeditationTimer {
    constructor() {
        this.isActive = false;
        this.duration = 5 * 60 * 1000; // 5 minutes default
        this.timeRemaining = this.duration;
        this.intervalId = null;

        this.sounds = {
            bell: '/assets/sounds/bell.mp3',
            nature: '/assets/sounds/nature.mp3',
            silence: null
        };

        this.currentSound = 'bell';
        this.init();
    }

    init() {
        this.createModal();
    }

    createModal() {
        // Create meditation timer modal dynamically
        const modal = document.createElement('div');
        modal.id = 'meditation-modal';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'meditation-title');
        modal.setAttribute('aria-hidden', 'true');

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h3 id="meditation-title">Meditation Timer</h3>
            <button class="modal-close" aria-label="Close meditation timer">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;

        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = `
            <div class="meditation-container">
                <div class="meditation-circle">
                    <div class="meditation-time" id="meditation-time">5:00</div>
                </div>
                <div class="meditation-controls">
                    <button id="meditation-start" class="btn btn-primary">Start</button>
                    <button id="meditation-pause" class="btn btn-secondary" style="display: none;">Pause</button>
                    <button id="meditation-stop" class="btn btn-outline">Stop</button>
                </div>
                <div class="meditation-settings">
                    <div class="setting-group">
                        <label for="meditation-duration">Duration:</label>
                        <select id="meditation-duration">
                            <option value="300000">5 minutes</option>
                            <option value="600000">10 minutes</option>
                            <option value="900000">15 minutes</option>
                            <option value="1200000">20 minutes</option>
                            <option value="1800000">30 minutes</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label for="meditation-sound">Background:</label>
                        <select id="meditation-sound">
                            <option value="silence">Silence</option>
                            <option value="bell">Bell</option>
                            <option value="nature">Nature</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        this.modal = modal;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const closeBtn = this.modal.querySelector('.modal-close');
        const startBtn = document.getElementById('meditation-start');
        const pauseBtn = document.getElementById('meditation-pause');
        const stopBtn = document.getElementById('meditation-stop');
        const durationSelect = document.getElementById('meditation-duration');
        const soundSelect = document.getElementById('meditation-sound');

        closeBtn?.addEventListener('click', () => this.close());
        startBtn?.addEventListener('click', () => this.start());
        pauseBtn?.addEventListener('click', () => this.togglePause());
        stopBtn?.addEventListener('click', () => this.stop());

        durationSelect?.addEventListener('change', (e) => {
            this.duration = parseInt(e.target.value);
            this.timeRemaining = this.duration;
            this.updateDisplay();
        });

        soundSelect?.addEventListener('change', (e) => {
            this.currentSound = e.target.value;
        });
    }

    open() {
        if (this.modal) {
            this.modal.classList.add('active');
            this.modal.setAttribute('aria-hidden', 'false');
            this.updateDisplay();
        }
    }

    close() {
        if (this.modal) {
            this.stop();
            this.modal.classList.remove('active');
            this.modal.setAttribute('aria-hidden', 'true');
        }
    }

    start() {
        if (this.isActive) return;

        this.isActive = true;
        this.intervalId = setInterval(() => {
            this.timeRemaining -= 1000;
            this.updateDisplay();

            if (this.timeRemaining <= 0) {
                this.complete();
            }
        }, 1000);

        this.updateButtons();

        if (window.showNotification) {
            window.showNotification('Meditation session started. Find a comfortable position.', 'success');
        }
    }

    togglePause() {
        if (this.isActive) {
            clearInterval(this.intervalId);
            this.isActive = false;
        } else {
            this.start();
        }
        this.updateButtons();
    }

    stop() {
        this.isActive = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.timeRemaining = this.duration;
        this.updateDisplay();
        this.updateButtons();
    }

    complete() {
        this.stop();

        if (window.showNotification) {
            window.showNotification('Meditation complete! Take a moment to notice how you feel.', 'success');
        }

        // Play completion sound
        this.playSound('bell');
    }

    updateDisplay() {
        const timeElement = document.getElementById('meditation-time');
        if (timeElement) {
            const minutes = Math.floor(this.timeRemaining / 60000);
            const seconds = Math.floor((this.timeRemaining % 60000) / 1000);
            timeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateButtons() {
        const startBtn = document.getElementById('meditation-start');
        const pauseBtn = document.getElementById('meditation-pause');

        if (this.isActive) {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-flex';
            pauseBtn.textContent = 'Pause';
        } else {
            startBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
        }
    }

    playSound(sound) {
        // Placeholder for sound playing functionality
        console.log(`Playing ${sound} sound`);
    }
}

// ===== CBT THOUGHT TRACKER =====
class CBTThoughtTracker {
    constructor() {
        this.thoughts = Utils.storage.get('cbtThoughts') || [];
        this.init();
    }

    init() {
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'cbt-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>CBT Thought Tracker</h3>
                    <button class="modal-close" aria-label="Close thought tracker">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="cbt-container">
                        <form id="thought-form">
                            <div class="form-group">
                                <label for="situation">Situation:</label>
                                <textarea id="situation" placeholder="Describe the situation that triggered your thoughts..."></textarea>
                            </div>
                            <div class="form-group">
                                <label for="automatic-thought">Automatic Thought:</label>
                                <textarea id="automatic-thought" placeholder="What thought went through your mind?"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="emotion">Emotion:</label>
                                <select id="emotion">
                                    <option value="">Select an emotion</option>
                                    <option value="anxious">Anxious</option>
                                    <option value="sad">Sad</option>
                                    <option value="angry">Angry</option>
                                    <option value="frustrated">Frustrated</option>
                                    <option value="overwhelmed">Overwhelmed</option>
                                    <option value="worried">Worried</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="intensity">Intensity (1-10):</label>
                                <input type="range" id="intensity" min="1" max="10" value="5">
                                <span id="intensity-value">5</span>
                            </div>
                            <div class="form-group">
                                <label for="balanced-thought">Balanced Thought:</label>
                                <textarea id="balanced-thought" placeholder="What's a more balanced way to think about this?"></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Save Thought</button>
                                <button type="button" class="btn btn-outline" onclick="this.closest('.modal').classList.remove('active')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('thought-form');
        const intensitySlider = document.getElementById('intensity');
        const intensityValue = document.getElementById('intensity-value');

        form?.addEventListener('submit', (e) => this.saveThought(e));

        intensitySlider?.addEventListener('input', (e) => {
            intensityValue.textContent = e.target.value;
        });
    }

    open() {
        if (this.modal) {
            this.modal.classList.add('active');
        }
    }

    saveThought(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const thought = {
            id: Utils.generateId(),
            situation: document.getElementById('situation').value,
            automaticThought: document.getElementById('automatic-thought').value,
            emotion: document.getElementById('emotion').value,
            intensity: document.getElementById('intensity').value,
            balancedThought: document.getElementById('balanced-thought').value,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        this.thoughts.unshift(thought);
        this.thoughts = this.thoughts.slice(0, 50); // Keep last 50 thoughts

        Utils.storage.set('cbtThoughts', this.thoughts);

        if (window.showNotification) {
            window.showNotification('Thought recorded successfully! 🧠', 'success');
        }

        this.modal.classList.remove('active');
        e.target.reset();
    }
}

// ===== GRATITUDE JOURNAL =====
class GratitudeJournal {
    constructor() {
        this.entries = Utils.storage.get('gratitudeEntries') || [];
        this.init();
    }

    init() {
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'gratitude-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Gratitude Practice</h3>
                    <button class="modal-close" aria-label="Close gratitude journal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="gratitude-container">
                        <p class="gratitude-prompt">What are you grateful for today?</p>
                        <form id="gratitude-form">
                            <div class="gratitude-items">
                                <div class="form-group">
                                    <label for="gratitude-1">1. I'm grateful for...</label>
                                    <input type="text" id="gratitude-1" placeholder="Something you're thankful for">
                                </div>
                                <div class="form-group">
                                    <label for="gratitude-2">2. I'm grateful for...</label>
                                    <input type="text" id="gratitude-2" placeholder="Another thing you appreciate">
                                </div>
                                <div class="form-group">
                                    <label for="gratitude-3">3. I'm grateful for...</label>
                                    <input type="text" id="gratitude-3" placeholder="One more thing you're thankful for">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="gratitude-reflection">Reflection:</label>
                                <textarea id="gratitude-reflection" placeholder="How do these things make you feel?"></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Save Entry</button>
                                <button type="button" class="btn btn-outline" onclick="this.closest('.modal').classList.remove('active')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const form = document.getElementById('gratitude-form');
        form?.addEventListener('submit', (e) => this.saveEntry(e));
    }

    open() {
        if (this.modal) {
            this.modal.classList.add('active');
            this.loadTodaysEntry();
        }
    }

    loadTodaysEntry() {
        const today = new Date().toDateString();
        const todaysEntry = this.entries.find(entry => new Date(entry.date).toDateString() === today);

        if (todaysEntry) {
            document.getElementById('gratitude-1').value = todaysEntry.items[0] || '';
            document.getElementById('gratitude-2').value = todaysEntry.items[1] || '';
            document.getElementById('gratitude-3').value = todaysEntry.items[2] || '';
            document.getElementById('gratitude-reflection').value = todaysEntry.reflection || '';
        }
    }

    saveEntry(e) {
        e.preventDefault();

        const items = [
            document.getElementById('gratitude-1').value,
            document.getElementById('gratitude-2').value,
            document.getElementById('gratitude-3').value
        ].filter(item => item.trim());

        if (items.length === 0) {
            if (window.showNotification) {
                window.showNotification('Please add at least one item you\'re grateful for.', 'warning');
            }
            return;
        }

        const entry = {
            id: Utils.generateId(),
            items,
            reflection: document.getElementById('gratitude-reflection').value,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        // Remove existing entry for today if exists
        const today = new Date().toDateString();
        this.entries = this.entries.filter(entry => new Date(entry.date).toDateString() !== today);

        this.entries.unshift(entry);
        this.entries = this.entries.slice(0, 365); // Keep one year of entries

        Utils.storage.set('gratitudeEntries', this.entries);

        if (window.showNotification) {
            window.showNotification('Gratitude entry saved! 🙏 Practicing gratitude regularly improves wellbeing.', 'success');
        }

        this.modal.classList.remove('active');
    }
}

// ===== SLEEP TRACKER =====
class SleepTracker {
    constructor() {
        this.sleepData = Utils.storage.get('sleepData') || [];
        this.init();
    }

    init() {
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'sleep-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Sleep Optimization</h3>
                    <button class="modal-close" aria-label="Close sleep tracker">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="sleep-container">
                        <div class="sleep-tabs">
                            <button class="tab-btn active" data-tab="log">Sleep Log</button>
                            <button class="tab-btn" data-tab="tips">Sleep Tips</button>
                            <button class="tab-btn" data-tab="insights">Insights</button>
                        </div>
                        
                        <div class="tab-content active" data-content="log">
                            <form id="sleep-form">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="bedtime">Bedtime:</label>
                                        <input type="time" id="bedtime" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="wake-time">Wake Time:</label>
                                        <input type="time" id="wake-time" required>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="sleep-quality">Sleep Quality (1-10):</label>
                                    <input type="range" id="sleep-quality" min="1" max="10" value="7">
                                    <span id="quality-value">7</span>
                                </div>
                                <div class="form-group">
                                    <label for="sleep-notes">Notes:</label>
                                    <textarea id="sleep-notes" placeholder="How did you sleep? Any factors that affected your sleep?"></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Log Sleep</button>
                            </form>
                        </div>
                        
                        <div class="tab-content" data-content="tips">
                            <div class="sleep-tips">
                                <h4>Sleep Hygiene Tips</h4>
                                <ul>
                                    <li>🌙 Keep a consistent sleep schedule</li>
                                    <li>📱 Avoid screens 1 hour before bed</li>
                                    <li>☕ Limit caffeine after 2 PM</li>
                                    <li>🏃‍♀️ Exercise regularly, but not before bed</li>
                                    <li>🌡️ Keep your bedroom cool (60-67°F)</li>
                                    <li>📚 Create a relaxing bedtime routine</li>
                                    <li>🛏️ Use your bed only for sleep</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="tab-content" data-content="insights">
                            <div class="sleep-insights" id="sleep-insights">
                                <p>Track your sleep for a few days to see personalized insights!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        const tabBtns = this.modal.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submission
        const form = document.getElementById('sleep-form');
        form?.addEventListener('submit', (e) => this.logSleep(e));

        // Quality slider
        const qualitySlider = document.getElementById('sleep-quality');
        const qualityValue = document.getElementById('quality-value');
        qualitySlider?.addEventListener('input', (e) => {
            qualityValue.textContent = e.target.value;
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        this.modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        this.modal.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.content === tabName);
        });

        if (tabName === 'insights') {
            this.updateInsights();
        }
    }

    async logSleep(e) {
        e.preventDefault();

        // Check if user is logged in
        const isAuthenticated = (window.apiClient && window.apiClient.isAuthenticated) || (window.db && window.db.isLoggedIn());
        if (!isAuthenticated && window.authManager) {
            if (confirm('Please log in to save your sleep data. Would you like to log in now?')) {
                window.authManager.showLoginModal();
                return;
            }
        }

        const bedtime = document.getElementById('bedtime').value;
        const wakeTime = document.getElementById('wake-time').value;
        const quality = document.getElementById('sleep-quality').value;
        const notes = document.getElementById('sleep-notes').value;

        const qualityValue = parseInt(quality);

        const sleepEntry = {
            id: Utils.generateId(),
            date: new Date().toDateString(),
            bedtime,
            wakeTime,
            quality: qualityValue,
            notes,
            timestamp: Date.now()
        };

        // Update local data
        this.sleepData.unshift(sleepEntry);
        this.sleepData = this.sleepData.slice(0, 30); // Keep last 30 days

        // Save to storage
        await Utils.storage.set('sleepData', this.sleepData);

        // Update wellness score based on sleep quality
        try {
            // Get current wellness data
            let wellnessData = await Utils.storage.get('wellnessData') || {
                sleep: 80,
                exercise: 65,
                mindfulness: 70
            };

            // Calculate new sleep score
            // Map quality 1-10 to percentage and use weighted average (70% old + 30% new)
            wellnessData.sleep = Math.round((wellnessData.sleep * 0.7) + (qualityValue * 10 * 0.3));

            // Save updated wellness data
            await Utils.storage.set('wellnessData', wellnessData);

            // If authenticated, send to server
            if (window.apiClient && window.apiClient.isAuthenticated) {
                try {
                    const todayISO = new Date().toISOString().split('T')[0];
                    await window.apiClient.logSleep({
                        date: todayISO,
                        bedtime,
                        wakeTime,
                        quality: qualityValue,
                        notes
                    });
                } catch (e) {
                    console.warn('Failed to sync sleep via API, will remain local:', e);
                }
            } else if (window.db && window.db.isLoggedIn()) {
                await window.db.saveWellnessData('wellnessData', {
                    ...wellnessData,
                    sleepData: this.sleepData
                });
            }

            // Update dashboard if available
            if (window.dashboard && typeof window.dashboard.updateWellnessScore === 'function') {
                window.dashboard.updateWellnessScore();
            }
        } catch (error) {
            console.error('Error updating wellness data:', error);
        }

        // Show success notification
        if (window.showNotification) {
            window.showNotification('Sleep logged successfully! 😴', 'success');
        }

        // Reset form
        e.target.reset();
        document.getElementById('quality-value').textContent = '7';
    }

    updateInsights() {
        const insightsContainer = document.getElementById('sleep-insights');
        if (!insightsContainer || this.sleepData.length < 3) return;

        const avgQuality = this.sleepData.reduce((sum, entry) => sum + entry.quality, 0) / this.sleepData.length;
        const totalNights = this.sleepData.length;

        let insights = `
            <h4>Your Sleep Insights (${totalNights} nights tracked)</h4>
            <div class="insight-item">
                <strong>Average Sleep Quality:</strong> ${avgQuality.toFixed(1)}/10
            </div>
        `;

        if (avgQuality >= 8) {
            insights += '<div class="insight-item">🌟 Excellent sleep quality! Keep up your good sleep habits.</div>';
        } else if (avgQuality >= 6) {
            insights += '<div class="insight-item">😊 Good sleep quality. Consider the sleep tips to improve further.</div>';
        } else {
            insights += '<div class="insight-item">💙 Your sleep could improve. Try implementing more sleep hygiene practices.</div>';
        }

        insightsContainer.innerHTML = insights;
    }

    open() {
        if (this.modal) {
            this.modal.classList.add('active');
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize wellness tools
    window.breathingExercise = new BreathingExercise();
    window.meditationTimer = new MeditationTimer();
    window.cbtTracker = new CBTThoughtTracker();
    window.gratitudeJournal = new GratitudeJournal();
    window.sleepTracker = new SleepTracker();

    // Global functions for wellness tools
    window.startBreathingExercise = () => {
        window.breathingExercise.open();
    };

    window.startMeditation = () => {
        window.meditationTimer.open();
    };

    window.openCBTTool = () => {
        window.cbtTracker.open();
    };

    window.openGratitudeJournal = () => {
        window.gratitudeJournal.open();
    };

    window.openSleepTool = () => {
        window.sleepTracker.open();
    };

    window.changeBreathingTechnique = () => {
        // This function is called from the breathing exercise
        if (window.breathingExercise) {
            window.breathingExercise.updateTechniqueInfo();
        }
    };

    window.startBreathing = () => {
        if (window.breathingExercise) {
            window.breathingExercise.start();
        }
    };

    window.pauseBreathing = () => {
        if (window.breathingExercise) {
            window.breathingExercise.pause();
        }
    };

    window.stopBreathing = () => {
        if (window.breathingExercise) {
            window.breathingExercise.stop();
        }
    };

    window.closeBreathingExercise = () => {
        if (window.breathingExercise) {
            window.breathingExercise.close();
        }
    };

    console.log('🧘‍♀️ Wellness Tools Initialized Successfully!');
});