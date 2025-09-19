// ===== NEURAL FEEDBACK VISUALIZATION =====
// Real-time particle system visualization of neural and biometric data

class NeuralFeedbackVisualizer {
    constructor() {
        // Core visualization properties
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.isActive = false;
        this.visualizationMode = 'brainwaves'; // Default mode

        // Animation properties
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 60; // Target 60fps

        // Data sources and processing
        this.biometricSystem = window.biometricSystem; // Reference to biometric integration
        this.emotionAI = window.emotionAI; // Reference to emotion AI
        this.dataBuffer = {
            heartRate: [],
            breathingRate: [],
            alpha: [], // 8-13Hz - relaxed
            beta: [],  // 13-30Hz - alert, active
            theta: [], // 4-8Hz - drowsy, meditative
            delta: [], // 0.5-4Hz - deep sleep
            gamma: []  // 30-100Hz - higher mental activity
        };
        this.bufferSize = 100; // Store last 100 readings

        // Particle systems configuration
        this.particleConfig = {
            brainwaves: {
                count: 800,
                speedFactor: 0.8,
                colorScheme: {
                    alpha: '#6366f1', // Indigo - relaxed
                    beta: '#ef4444',  // Red - alert
                    theta: '#8b5cf6', // Purple - meditative
                    delta: '#1e40af', // Dark blue - deep
                    gamma: '#f59e0b'  // Amber - high activity
                },
                size: { min: 2, max: 6 },
                opacity: { min: 0.3, max: 0.8 }
            },
            emotions: {
                count: 600,
                speedFactor: 1.2,
                colorScheme: {
                    happy: '#10b981', // Emerald - happy
                    sad: '#6b7280',   // Gray - sad
                    angry: '#dc2626', // Red - angry
                    fearful: '#7c3aed', // Violet - fearful
                    surprised: '#f59e0b', // Amber - surprised
                    neutral: '#60a5fa'  // Blue - neutral
                },
                size: { min: 3, max: 8 },
                opacity: { min: 0.4, max: 0.9 }
            },
            heartbeat: {
                count: 400,
                speedFactor: 1.5,
                colorScheme: {
                    base: '#ec4899', // Pink
                    low: '#0891b2',  // Cyan - calm
                    high: '#b91c1c', // Dark red - elevated
                    normal: '#8b5cf6' // Purple - normal
                },
                pulseIntensity: 0.8,
                size: { min: 4, max: 10 },
                opacity: { min: 0.5, max: 1.0 }
            },
            coherence: {
                count: 1000,
                speedFactor: 0.6,
                colorScheme: {
                    high: '#059669', // Emerald - high coherence
                    medium: '#4f46e5', // Indigo - medium coherence
                    low: '#9f1239'  // Rose - low coherence
                },
                size: { min: 1, max: 7 },
                opacity: { min: 0.3, max: 0.7 }
            }
        };

        // Create visual states based on mental/emotional patterns
        this.visualStates = {
            calm: {
                dominantWaves: ['alpha', 'theta'],
                particleSpeed: 0.6,
                flowDirection: 'upward',
                particleDensity: 0.7,
                particleSize: 1.2
            },
            focused: {
                dominantWaves: ['beta'],
                particleSpeed: 1.0,
                flowDirection: 'outward',
                particleDensity: 0.9,
                particleSize: 0.8
            },
            anxious: {
                dominantWaves: ['beta', 'gamma'],
                particleSpeed: 1.8,
                flowDirection: 'chaotic',
                particleDensity: 1.3,
                particleSize: 0.5
            },
            meditative: {
                dominantWaves: ['theta', 'alpha'],
                particleSpeed: 0.4,
                flowDirection: 'circular',
                particleDensity: 0.6,
                particleSize: 1.5
            },
            drowsy: {
                dominantWaves: ['theta', 'delta'],
                particleSpeed: 0.3,
                flowDirection: 'downward',
                particleDensity: 0.5,
                particleSize: 1.8
            }
        };

        // Data analysis parameters
        this.analysisParams = {
            coherenceThreshold: 0.7,    // HRV coherence threshold
            brainwaveRatio: {           // Ratio thresholds for determining mental states
                alphaBetaRatio: 1.0,    // Alpha/Beta ratio for relaxation assessment
                thetaBetaRatio: 0.5     // Theta/Beta ratio for focus assessment
            }
        };

        // Initialize the system
        this.init();
    }

    init() {
        this.createUIElements();
        this.setupEventListeners();

        // Attempt to connect to biometric system if available
        if (this.biometricSystem && this.biometricSystem.isConnected) {
            console.log('Neural visualization connected to biometric system');
            this.subscribeToBiometricData();
        } else {
            console.log('Biometric system not connected, using simulated data');
            this.setupSimulatedData();
        }
    }

    createUIElements() {
        const container = document.createElement('div');
        container.className = 'neural-feedback-container';
        container.innerHTML = `
            <div class="neural-feedback-header">
                <h3><i class="fas fa-brain"></i> Neural Feedback</h3>
                <div class="visualization-controls">
                    <button data-mode="brainwaves" class="visualization-mode-btn active">Brainwaves</button>
                    <button data-mode="emotions" class="visualization-mode-btn">Emotions</button>
                    <button data-mode="heartbeat" class="visualization-mode-btn">Heart Coherence</button>
                    <button data-mode="coherence" class="visualization-mode-btn">Mind-Body Coherence</button>
                </div>
            </div>
            <div class="neural-feedback-canvas-container">
                <canvas id="neural-feedback-canvas"></canvas>
                <div class="data-overlay">
                    <div class="data-item">
                        <span class="data-label">State:</span>
                        <span class="data-value" id="mental-state-value">Analyzing...</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Calm:</span>
                        <div class="data-meter">
                            <div class="meter-fill" id="calm-meter" style="width: 20%"></div>
                        </div>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Focus:</span>
                        <div class="data-meter">
                            <div class="meter-fill" id="focus-meter" style="width: 20%"></div>
                        </div>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Coherence:</span>
                        <div class="data-meter">
                            <div class="meter-fill" id="coherence-meter" style="width: 20%"></div>
                        </div>
                    </div>
                </div>
                <div class="legend" id="visualization-legend"></div>
            </div>
            <div class="neural-insights">
                <h4>Neural Insights</h4>
                <div id="neural-insights-content">
                    <p>Start the visualization to see real-time neural feedback and insights.</p>
                </div>
            </div>
            <div class="visualization-actions">
                <button id="start-visualization" class="btn btn-primary">
                    <i class="fas fa-play"></i> Start Visualization
                </button>
                <button id="capture-snapshot" class="btn btn-secondary" disabled>
                    <i class="fas fa-camera"></i> Capture Snapshot
                </button>
            </div>
        `;

        // Add to wellness tools section or dashboard
        const wellnessSection = document.querySelector('.wellness-tools') || document.querySelector('.dashboard');
        if (wellnessSection) {
            wellnessSection.appendChild(container);
        } else {
            document.body.appendChild(container);
        }

        // Set up canvas
        this.canvas = document.getElementById('neural-feedback-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Create legend based on initial mode
        this.updateLegend('brainwaves');
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.width = container.clientWidth;
        this.height = container.clientHeight || 400; // Default height

        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    setupEventListeners() {
        // Start/Stop visualization
        document.getElementById('start-visualization').addEventListener('click', (e) => {
            if (!this.isActive) {
                this.startVisualization();
                e.target.innerHTML = '<i class="fas fa-pause"></i> Pause Visualization';
                document.getElementById('capture-snapshot').removeAttribute('disabled');
            } else {
                this.stopVisualization();
                e.target.innerHTML = '<i class="fas fa-play"></i> Start Visualization';
                document.getElementById('capture-snapshot').setAttribute('disabled', true);
            }
        });

        // Capture snapshot
        document.getElementById('capture-snapshot').addEventListener('click', () => {
            this.captureSnapshot();
        });

        // Switch visualization modes
        document.querySelectorAll('.visualization-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                document.querySelectorAll('.visualization-mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Change mode
                this.visualizationMode = e.target.dataset.mode;
                this.updateLegend(this.visualizationMode);

                // Reset particles for new mode
                if (this.isActive) {
                    this.resetParticles();
                }
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (this.isActive) {
                this.resetParticles();
            }
        });
    }

    updateLegend(mode) {
        const legend = document.getElementById('visualization-legend');
        legend.innerHTML = '';

        const colorScheme = this.particleConfig[mode].colorScheme;

        for (const [key, color] of Object.entries(colorScheme)) {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <span class="color-sample" style="background-color: ${color}"></span>
                <span class="legend-label">${this.getLegendLabel(mode, key)}</span>
            `;
            legend.appendChild(item);
        }
    }

    getLegendLabel(mode, key) {
        const labels = {
            brainwaves: {
                alpha: 'Alpha (Relaxed)',
                beta: 'Beta (Alert)',
                theta: 'Theta (Meditative)',
                delta: 'Delta (Deep)',
                gamma: 'Gamma (High Activity)'
            },
            emotions: {
                happy: 'Happy',
                sad: 'Sad',
                angry: 'Angry',
                fearful: 'Fearful',
                surprised: 'Surprised',
                neutral: 'Neutral'
            },
            heartbeat: {
                base: 'Base Rhythm',
                low: 'Low HR (Calm)',
                high: 'High HR (Active)',
                normal: 'Normal Range'
            },
            coherence: {
                high: 'High Coherence',
                medium: 'Medium Coherence',
                low: 'Low Coherence'
            }
        };

        return labels[mode][key] || key;
    }

    subscribeToBiometricData() {
        if (!this.biometricSystem) return;

        this.biometricSystem.addDataListener('heartRate', (data) => {
            this.updateDataBuffer('heartRate', data);
        });

        this.biometricSystem.addDataListener('breathingRate', (data) => {
            this.updateDataBuffer('breathingRate', data);
        });

        // If EEG data is available from biometric system
        const brainwaveTypes = ['alpha', 'beta', 'theta', 'delta', 'gamma'];
        brainwaveTypes.forEach(type => {
            this.biometricSystem.addDataListener(type, (data) => {
                this.updateDataBuffer(type, data);
            });
        });
    }

    updateDataBuffer(dataType, value) {
        if (!this.dataBuffer[dataType]) return;

        this.dataBuffer[dataType].push(value);
        if (this.dataBuffer[dataType].length > this.bufferSize) {
            this.dataBuffer[dataType].shift();
        }

        if (this.isActive) {
            this.updateVisualizationMetrics();
        }
    }

    setupSimulatedData() {
        // Simulated brainwave data
        this.simulationInterval = setInterval(() => {
            const brainwaveTypes = ['alpha', 'beta', 'theta', 'delta', 'gamma'];
            const dominantType = brainwaveTypes[Math.floor(Math.random() * brainwaveTypes.length)];

            // Generate values with dominant type having higher values
            brainwaveTypes.forEach(type => {
                let value = Math.random() * 10; // Base value
                if (type === dominantType) value *= 2; // Dominant type
                this.updateDataBuffer(type, value);
            });

            // Simulated heart and breathing rate
            const heartRate = 60 + Math.random() * 40; // 60-100 bpm
            const breathingRate = 12 + Math.random() * 6; // 12-18 breaths per minute

            this.updateDataBuffer('heartRate', heartRate);
            this.updateDataBuffer('breathingRate', breathingRate);

        }, 1000); // Update every second
    }

    startVisualization() {
        if (this.isActive) return;

        this.isActive = true;
        this.resetParticles();
        this.updateVisualizationMetrics();
        this.animate();
    }

    stopVisualization() {
        this.isActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resetParticles() {
        const config = this.particleConfig[this.visualizationMode];
        this.particles = [];

        for (let i = 0; i < config.count; i++) {
            this.particles.push(this.createParticle(config));
        }
    }

    createParticle(config) {
        // Base particle properties
        const particle = {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * (config.size.max - config.size.min) + config.size.min,
            opacity: Math.random() * (config.opacity.max - config.opacity.min) + config.opacity.min,
            speed: (Math.random() * 2 - 1) * config.speedFactor,
            vx: (Math.random() * 2 - 1) * config.speedFactor,
            vy: (Math.random() * 2 - 1) * config.speedFactor,
            type: this.getRandomParticleType(),
            angle: Math.random() * Math.PI * 2,
            angularVelocity: (Math.random() * 0.1 - 0.05) * config.speedFactor
        };

        return particle;
    }

    getRandomParticleType() {
        const config = this.particleConfig[this.visualizationMode];
        const types = Object.keys(config.colorScheme);

        // For brainwaves, bias toward current dominant wave
        if (this.visualizationMode === 'brainwaves') {
            const dominantWave = this.getDominantBrainwave();
            if (dominantWave && Math.random() < 0.7) { // 70% chance to use dominant wave
                return dominantWave;
            }
        }

        // For emotions, use data from emotion AI if available
        if (this.visualizationMode === 'emotions' && this.emotionAI && this.emotionAI.currentEmotion) {
            if (Math.random() < 0.7) { // 70% chance to use detected emotion
                return this.emotionAI.currentEmotion.toLowerCase();
            }
        }

        // Default: random selection
        return types[Math.floor(Math.random() * types.length)];
    }

    getDominantBrainwave() {
        const waves = ['alpha', 'beta', 'theta', 'delta', 'gamma'];
        let maxValue = -1;
        let dominant = null;

        waves.forEach(wave => {
            const buffer = this.dataBuffer[wave];
            if (buffer && buffer.length > 0) {
                // Calculate average of recent values
                const avg = buffer.slice(-5).reduce((sum, val) => sum + val, 0) /
                    Math.min(buffer.length, 5);

                if (avg > maxValue) {
                    maxValue = avg;
                    dominant = wave;
                }
            }
        });

        return dominant;
    }

    animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - this.lastFrameTime;

        if (elapsed > this.frameInterval) {
            this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
            this.updateParticles();
            this.drawParticles();
        }

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        const mentalState = this.detectMentalState();
        const visualState = this.visualStates[mentalState];

        this.particles.forEach(particle => {
            // Apply flow direction based on mental state
            this.applyFlowDirection(particle, visualState.flowDirection);

            // Apply mental state modifiers
            particle.vx *= visualState.particleSpeed;
            particle.vy *= visualState.particleSpeed;

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.angle += particle.angularVelocity;

            // Wrap around screen edges
            if (particle.x < 0) particle.x = this.width;
            if (particle.x > this.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.height;
            if (particle.y > this.height) particle.y = 0;

            // Dynamic size based on mental state
            particle.displaySize = particle.size * visualState.particleSize;

            // Occasionally change particle type based on current state
            if (Math.random() < 0.01) { // 1% chance each frame
                particle.type = this.getRandomParticleType();
            }
        });
    }

    applyFlowDirection(particle, direction) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        switch (direction) {
            case 'upward':
                particle.vy -= 0.01;
                break;
            case 'downward':
                particle.vy += 0.01;
                break;
            case 'outward':
                if (distance > 0) {
                    particle.vx += dx / distance * 0.02;
                    particle.vy += dy / distance * 0.02;
                }
                break;
            case 'circular':
                const angle = Math.atan2(dy, dx);
                particle.vx = -Math.sin(angle) * 0.5;
                particle.vy = Math.cos(angle) * 0.5;
                break;
            case 'chaotic':
                if (Math.random() < 0.05) {
                    particle.vx = (Math.random() * 2 - 1) * 2;
                    particle.vy = (Math.random() * 2 - 1) * 2;
                }
                break;
        }

        // Add slight damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background gradient
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, 'rgba(10, 10, 30, 0.8)');
        gradient.addColorStop(1, 'rgba(5, 5, 20, 0.9)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.save();

            // Set color based on particle type and mode
            const colorScheme = this.particleConfig[this.visualizationMode].colorScheme;
            const color = colorScheme[particle.type] || colorScheme.base || '#ffffff';

            // Draw based on visualization mode
            if (this.visualizationMode === 'heartbeat') {
                this.drawHeartbeatParticle(particle, color);
            } else if (this.visualizationMode === 'coherence') {
                this.drawCoherenceParticle(particle, color);
            } else {
                this.drawStandardParticle(particle, color);
            }

            this.ctx.restore();
        });

        // Draw connections between nearby particles for coherence visualization
        if (this.visualizationMode === 'coherence') {
            this.drawParticleConnections();
        }
    }

    drawStandardParticle(particle, color) {
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = color;

        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.displaySize, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw subtle glow
        const glow = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.displaySize * 2
        );
        glow.addColorStop(0, color);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.globalAlpha = particle.opacity * 0.3;
        this.ctx.fillStyle = glow;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.displaySize * 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawHeartbeatParticle(particle, color) {
        this.ctx.globalAlpha = particle.opacity;

        // Pulsing effect based on heart rate
        const heartRate = this.getAverageValue('heartRate') || 70;
        const pulseSpeed = heartRate / 60; // Beats per second
        const pulsePhase = (Date.now() % (1000 / pulseSpeed)) / (1000 / pulseSpeed);
        const pulseFactor = 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.3;

        // Draw pulsing circle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.displaySize * pulseFactor, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw trail based on heart rate variability
        const hrv = this.calculateHRV();
        if (hrv > 50) { // Good HRV - draw flowing trail
            this.ctx.globalAlpha = particle.opacity * 0.3;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = particle.displaySize / 3;

            this.ctx.beginPath();
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(
                particle.x - particle.vx * 10,
                particle.y - particle.vy * 10
            );
            this.ctx.stroke();
        }
    }

    drawCoherenceParticle(particle, color) {
        this.ctx.globalAlpha = particle.opacity;

        // Rotation based on coherence score
        const coherence = this.calculateCoherence();
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.angle);

        // Draw shape based on coherence
        if (coherence > this.analysisParams.coherenceThreshold) {
            // High coherence - draw hexagon
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = Math.PI * 2 / 6 * i;
                const x = Math.cos(angle) * particle.displaySize;
                const y = Math.sin(angle) * particle.displaySize;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
        } else {
            // Lower coherence - draw irregular shape
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = Math.PI * 2 / 5 * i;
                const distortFactor = 1 - coherence;
                const radius = particle.displaySize * (1 + (Math.random() - 0.5) * distortFactor);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    drawParticleConnections() {
        const coherence = this.calculateCoherence();
        const connectionDistance = 50 + coherence * 50; // Higher coherence = longer connections

        this.ctx.globalAlpha = 0.15;
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i < this.particles.length; i++) {
            const p1 = this.particles[i];

            // Limit connections for performance
            if (Math.random() > 0.1) continue;

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    // Higher coherence = more opacity
                    const opacity = (1 - distance / connectionDistance) * coherence;

                    // Get colors from both particles
                    const colorScheme = this.particleConfig[this.visualizationMode].colorScheme;
                    const color1 = colorScheme[p1.type] || '#ffffff';
                    const color2 = colorScheme[p2.type] || '#ffffff';

                    // Create gradient line
                    const gradient = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    gradient.addColorStop(0, color1);
                    gradient.addColorStop(1, color2);

                    this.ctx.strokeStyle = gradient;
                    this.ctx.globalAlpha = opacity * 0.3;

                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    detectMentalState() {
        // Simple detection based on dominant brainwaves
        const dominantWave = this.getDominantBrainwave();
        const alpha = this.getAverageValue('alpha') || 5;
        const beta = this.getAverageValue('beta') || 5;
        const theta = this.getAverageValue('theta') || 5;
        const delta = this.getAverageValue('delta') || 5;

        // Alpha/Beta ratio for relaxation assessment
        const alphaBetaRatio = alpha / (beta || 1);

        // Theta/Beta ratio for focus vs. drowsiness
        const thetaBetaRatio = theta / (beta || 1);

        if (alphaBetaRatio > 1.2 && thetaBetaRatio > 0.8) {
            return 'meditative';
        } else if (alphaBetaRatio > 1.2) {
            return 'calm';
        } else if (beta > alpha && beta > theta) {
            return beta > 15 ? 'anxious' : 'focused';
        } else if (theta > alpha && theta > beta) {
            return 'drowsy';
        }

        return 'calm'; // Default state
    }

    getAverageValue(dataType) {
        const buffer = this.dataBuffer[dataType];
        if (!buffer || buffer.length === 0) return null;

        return buffer.reduce((sum, val) => sum + val, 0) / buffer.length;
    }

    calculateHRV() {
        // Simple heart rate variability calculation
        const heartRateData = this.dataBuffer.heartRate;
        if (heartRateData.length < 10) return 50; // Default value

        // Calculate adjacent RR interval differences
        let rmssd = 0;
        for (let i = 1; i < heartRateData.length; i++) {
            const diff = heartRateData[i] - heartRateData[i - 1];
            rmssd += diff * diff;
        }
        rmssd = Math.sqrt(rmssd / (heartRateData.length - 1));

        // Scale to 0-100 range (higher is better)
        return Math.min(100, Math.max(0, rmssd * 5));
    }

    calculateCoherence() {
        // Calculate coherence between heart rate and breathing rate
        const heartRateData = this.dataBuffer.heartRate;
        const breathingRateData = this.dataBuffer.breathingRate;

        if (heartRateData.length < 10 || breathingRateData.length < 10) {
            return 0.5; // Default medium coherence
        }

        // Simple coherence metric based on the relationship between
        // heart rate and breathing rate patterns
        const hrAvg = this.getAverageValue('heartRate');
        const brAvg = this.getAverageValue('breathingRate');

        // Expected ratio for good coherence (4-6 heartbeats per breath)
        const expectedRatio = 5;
        const actualRatio = hrAvg / brAvg;

        // Calculate coherence score (0 to 1)
        const coherence = 1 - Math.min(1, Math.abs(actualRatio - expectedRatio) / expectedRatio);

        return coherence;
    }

    updateVisualizationMetrics() {
        // Update mental state display
        const mentalState = this.detectMentalState();
        const stateElement = document.getElementById('mental-state-value');
        if (stateElement) {
            stateElement.textContent = mentalState.charAt(0).toUpperCase() + mentalState.slice(1);
            stateElement.className = 'data-value state-' + mentalState;
        }

        // Update meters
        const alpha = this.getAverageValue('alpha') || 5;
        const beta = this.getAverageValue('beta') || 5;
        const alphaBetaRatio = alpha / (beta || 1);
        const calmScore = Math.min(100, Math.max(0, alphaBetaRatio * 50));

        const focusScore = Math.min(100, Math.max(0, beta * 5));
        const coherenceScore = this.calculateCoherence() * 100;

        const calmMeter = document.getElementById('calm-meter');
        const focusMeter = document.getElementById('focus-meter');
        const coherenceMeter = document.getElementById('coherence-meter');

        if (calmMeter) calmMeter.style.width = calmScore + '%';
        if (focusMeter) focusMeter.style.width = focusScore + '%';
        if (coherenceMeter) coherenceMeter.style.width = coherenceScore + '%';

        // Update insights
        this.updateInsights(mentalState);
    }

    updateInsights(mentalState) {
        const insightsContent = document.getElementById('neural-insights-content');
        if (!insightsContent) return;

        const insights = {
            calm: "Your brain is in a relaxed alpha state. This is ideal for creative thinking, reflection, and stress reduction.",
            focused: "Your brain shows strong beta activity indicating alert focus. This state is good for problem-solving and analytical tasks.",
            anxious: "Your neural patterns suggest elevated stress or anxiety. Consider taking slow, deep breaths to regulate your nervous system.",
            meditative: "You've achieved a balanced meditative state with strong alpha-theta activity. This deep relaxation is excellent for mental restoration.",
            drowsy: "Your brain shows predominant theta waves, indicating drowsiness or deep relaxation. If you're not meditating, consider a short break or some movement."
        };

        // Add coherence insight
        const coherence = this.calculateCoherence();
        let coherenceInsight = "";

        if (coherence > 0.8) {
            coherenceInsight = "Your heart and breathing are highly synchronized, indicating excellent physiological coherence and emotional regulation.";
        } else if (coherence > 0.5) {
            coherenceInsight = "Your heart rhythm and breathing show moderate coherence. This balanced state supports emotional stability.";
        } else {
            coherenceInsight = "Your physiological coherence is low. Focused breathing exercises may help improve heart-brain synchronization.";
        }

        insightsContent.innerHTML = `
            <p><strong>Neural State:</strong> ${insights[mentalState] || "Analyzing your neural patterns..."}</p>
            <p><strong>Coherence:</strong> ${coherenceInsight}</p>
            <div class="recommendation">
                <h5>Recommendation</h5>
                <p>${this.getRecommendation(mentalState, coherence)}</p>
            </div>
        `;
    }

    getRecommendation(mentalState, coherence) {
        // Generate personalized recommendations
        if (mentalState === 'anxious') {
            return "Try the breathing visualization exercise for 5 minutes to help calm your nervous system.";
        } else if (mentalState === 'drowsy' && coherence < 0.5) {
            return "Consider a short movement break or exposure to bright light to increase alertness.";
        } else if (mentalState === 'focused' && coherence > 0.7) {
            return "You're in an optimal state for challenging cognitive tasks. This is a good time to work on complex problems.";
        } else if (mentalState === 'meditative') {
            return "Your current state is excellent for mindfulness practice. Consider extending your session to deepen benefits.";
        } else if (coherence < 0.4) {
            return "Practice heart-focused breathing for 3-5 minutes to improve your heart-brain coherence.";
        } else {
            return "Maintain your current practice. Your neural patterns show a balanced state.";
        }
    }

    captureSnapshot() {
        try {
            // Create snapshot image
            const dataUrl = this.canvas.toDataURL('image/png');

            // Create snapshot info
            const mentalState = this.detectMentalState();
            const coherence = this.calculateCoherence();
            const timestamp = new Date().toLocaleString();

            // Display modal with snapshot
            this.showSnapshotModal(dataUrl, {
                timestamp,
                mentalState,
                coherence,
                notes: this.getRecommendation(mentalState, coherence)
            });

            // Show notification
            if (window.showNotification) {
                window.showNotification('Neural snapshot captured!', 'success');
            }
        } catch (error) {
            console.error('Error capturing snapshot:', error);
            if (window.showNotification) {
                window.showNotification('Failed to capture neural snapshot', 'error');
            }
        }
    }

    showSnapshotModal(imageUrl, info) {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'neural-snapshot-modal';
        modal.innerHTML = `
            <div class="neural-snapshot-content">
                <div class="snapshot-header">
                    <h3>Neural Pattern Snapshot</h3>
                    <button class="close-button">&times;</button>
                </div>
                <div class="snapshot-image-container">
                    <img src="${imageUrl}" alt="Neural pattern snapshot">
                </div>
                <div class="snapshot-info">
                    <div class="info-item">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${info.timestamp}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Mental State:</span>
                        <span class="info-value state-${info.mentalState}">${info.mentalState.charAt(0).toUpperCase() + info.mentalState.slice(1)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Coherence:</span>
                        <span class="info-value">${Math.round(info.coherence * 100)}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Notes:</span>
                        <span class="info-value">${info.notes}</span>
                    </div>
                </div>
                <div class="snapshot-actions">
                    <button class="btn download-btn">Download Image</button>
                    <button class="btn save-btn">Save to Journal</button>
                </div>
            </div>
        `;

        // Add to body
        document.body.appendChild(modal);

        // Set up event listeners
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Download image
        const downloadBtn = modal.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `neural-snapshot-${new Date().getTime()}.png`;
            link.href = imageUrl;
            link.click();
        });

        // Save to journal
        const saveBtn = modal.querySelector('.save-btn');
        saveBtn.addEventListener('click', () => {
            this.saveToJournal({
                imageUrl,
                timestamp: info.timestamp,
                mentalState: info.mentalState,
                coherence: info.coherence,
                notes: info.notes
            });

            document.body.removeChild(modal);

            if (window.showNotification) {
                window.showNotification('Snapshot saved to journal!', 'success');
            }
        });
    }

    saveToJournal(data) {
        // Get existing journal entries or create new array
        let journal = JSON.parse(localStorage.getItem('neuralJournal') || '[]');

        // Add new entry
        journal.push(data);

        // Save back to storage (limit to latest 50 entries)
        localStorage.setItem('neuralJournal', JSON.stringify(journal.slice(-50)));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.neuralFeedback = new NeuralFeedbackVisualizer();
    console.log('🧠 Neural Feedback Visualizer loaded');
});

// Export for other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NeuralFeedbackVisualizer };
}