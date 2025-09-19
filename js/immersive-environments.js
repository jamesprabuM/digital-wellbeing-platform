// ===== 3D IMMERSIVE MEDITATION ENVIRONMENTS =====
// Revolutionary WebGL-based 3D meditation spaces with interactive environments

class ImmersiveMeditationEnvironments {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.currentEnvironment = null;
        this.audioContext = null;
        this.soundSources = {};
        this.isActive = false;
        this.environmentSettings = {
            timeOfDay: 'day',
            weather: 'clear',
            intensity: 0.7,
            interactivity: true
        };

        // Available environments
        this.environments = {
            forest: {
                name: "Enchanted Forest",
                description: "A peaceful woodland with gentle streams and bird songs",
                colors: ["#1B5E20", "#2E7D32", "#4CAF50", "#8BC34A"],
                sounds: ["birds", "stream", "wind"],
                effects: ["particles", "lightRays", "swayingTrees"]
            },
            ocean: {
                name: "Tranquil Ocean",
                description: "Calm blue waters with gentle waves and distant seagulls",
                colors: ["#0D47A1", "#1976D2", "#2196F3", "#81D4FA"],
                sounds: ["waves", "seagulls", "oceanWind"],
                effects: ["wavesAnimation", "caustics", "floatingParticles"]
            },
            mountain: {
                name: "Mountain Peak",
                description: "Serene mountain vista with flowing clouds and distant valleys",
                colors: ["#3E2723", "#5D4037", "#795548", "#BCAAA4"],
                sounds: ["mountainWind", "distantEcho", "silence"],
                effects: ["cloudMovement", "parallax", "atmosphere"]
            },
            space: {
                name: "Cosmic Meditation",
                description: "Peaceful journey through the cosmos with swirling galaxies",
                colors: ["#0A0A0A", "#1A237E", "#3F51B5", "#9C27B0"],
                sounds: ["cosmicDrone", "stellarHum", "deepSpace"],
                effects: ["starField", "galaxyRotation", "nebulaGlow"]
            },
            garden: {
                name: "Zen Garden",
                description: "Traditional Japanese garden with koi pond and bamboo",
                colors: ["#1B5E20", "#4CAF50", "#8BC34A", "#FFC107"],
                sounds: ["bambooChimes", "waterDrop", "gentleBreeze"],
                effects: ["koiSwimming", "bambooSway", "cherryBlossoms"]
            },
            aurora: {
                name: "Northern Lights",
                description: "Mesmerizing aurora borealis dancing across the arctic sky",
                colors: ["#0D47A1", "#00BCD4", "#4CAF50", "#8BC34A"],
                sounds: ["arcticWind", "crystalTones", "harmonics"],
                effects: ["auroraAnimation", "starTwinkle", "snowfall"]
            }
        };

        this.init();
    }

    async init() {
        try {
            await this.loadThreeJS();
            this.setupUI();
            this.setupEventListeners();
            this.initAudioContext();
            console.log('🌌 3D Immersive Environments initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize 3D environments:', error);
            this.showFallbackMessage();
        }
    }

    async loadThreeJS() {
        return new Promise((resolve, reject) => {
            if (typeof THREE !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupUI() {
        const environmentPanel = document.createElement('div');
        environmentPanel.id = 'immersive-environments-panel';
        environmentPanel.className = 'immersive-panel';
        environmentPanel.innerHTML = `
            <div class="immersive-header">
                <h3><i class="fas fa-globe"></i> 3D Meditation Environments</h3>
                <button id="enter-immersive" class="btn btn-primary">
                    <i class="fas fa-vr-cardboard"></i> Enter Immersive Mode
                </button>
            </div>
            
            <div class="environment-selector">
                <h4>Choose Your Environment</h4>
                <div class="environment-grid" id="environment-grid">
                    ${Object.entries(this.environments).map(([key, env]) => `
                        <div class="environment-card" data-env="${key}">
                            <div class="environment-preview" id="preview-${key}"></div>
                            <div class="environment-info">
                                <h5>${env.name}</h5>
                                <p>${env.description}</p>
                                <div class="environment-features">
                                    ${env.sounds.map(sound => `<span class="feature-tag">${sound}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="environment-settings">
                <h4>Environment Settings</h4>
                <div class="settings-grid">
                    <div class="setting-item">
                        <label for="time-of-day">Time of Day</label>
                        <select id="time-of-day">
                            <option value="dawn">Dawn</option>
                            <option value="day" selected>Day</option>
                            <option value="dusk">Dusk</option>
                            <option value="night">Night</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label for="weather">Weather</label>
                        <select id="weather">
                            <option value="clear" selected>Clear</option>
                            <option value="cloudy">Cloudy</option>
                            <option value="rainy">Rainy</option>
                            <option value="misty">Misty</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label for="intensity">Intensity</label>
                        <input type="range" id="intensity" min="0.1" max="1" step="0.1" value="0.7">
                        <span id="intensity-value">70%</span>
                    </div>
                    <div class="setting-item">
                        <label for="interactivity">Interactive Elements</label>
                        <input type="checkbox" id="interactivity" checked>
                    </div>
                </div>
            </div>
        `;

        // Add to meditation section
        const meditationSection = document.querySelector('.meditation-section') || document.querySelector('.wellness-tools');
        if (meditationSection) {
            meditationSection.appendChild(environmentPanel);
        } else {
            document.body.appendChild(environmentPanel);
        }

        // Create immersive container (hidden by default)
        const immersiveContainer = document.createElement('div');
        immersiveContainer.id = 'immersive-container';
        immersiveContainer.className = 'immersive-container hidden';
        immersiveContainer.innerHTML = `
            <div class="immersive-canvas-container">
                <canvas id="immersive-canvas"></canvas>
                <div class="immersive-overlay">
                    <div class="immersive-controls">
                        <button id="exit-immersive" class="control-btn">
                            <i class="fas fa-times"></i> Exit
                        </button>
                        <button id="toggle-audio" class="control-btn">
                            <i class="fas fa-volume-up"></i> Audio
                        </button>
                        <button id="change-environment" class="control-btn">
                            <i class="fas fa-sync-alt"></i> Change
                        </button>
                    </div>
                    <div class="meditation-timer-overlay">
                        <div class="timer-display" id="immersive-timer">00:00</div>
                        <div class="breathing-guide" id="breathing-guide">
                            <div class="breathing-circle"></div>
                            <div class="breathing-text">Breathe In</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(immersiveContainer);

        this.generateEnvironmentPreviews();
    }

    generateEnvironmentPreviews() {
        Object.entries(this.environments).forEach(([key, env]) => {
            const preview = document.getElementById(`preview-${key}`);
            if (preview) {
                // Create CSS gradient based on environment colors
                const gradient = `linear-gradient(135deg, ${env.colors.join(', ')})`;
                preview.style.background = gradient;

                // Add animated elements
                const animationDiv = document.createElement('div');
                animationDiv.className = `preview-animation ${key}-animation`;
                preview.appendChild(animationDiv);
            }
        });
    }

    setupEventListeners() {
        // Enter immersive mode
        const enterBtn = document.getElementById('enter-immersive');
        if (enterBtn) {
            enterBtn.addEventListener('click', () => this.enterImmersiveMode());
        }

        // Exit immersive mode
        const exitBtn = document.getElementById('exit-immersive');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => this.exitImmersiveMode());
        }

        // Environment selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.environment-card')) {
                const envKey = e.target.closest('.environment-card').dataset.env;
                this.selectEnvironment(envKey);
            }
        });

        // Settings
        const timeSelect = document.getElementById('time-of-day');
        const weatherSelect = document.getElementById('weather');
        const intensitySlider = document.getElementById('intensity');
        const interactivityToggle = document.getElementById('interactivity');

        if (timeSelect) {
            timeSelect.addEventListener('change', (e) => {
                this.environmentSettings.timeOfDay = e.target.value;
                this.updateEnvironment();
            });
        }

        if (weatherSelect) {
            weatherSelect.addEventListener('change', (e) => {
                this.environmentSettings.weather = e.target.value;
                this.updateEnvironment();
            });
        }

        if (intensitySlider) {
            intensitySlider.addEventListener('input', (e) => {
                this.environmentSettings.intensity = parseFloat(e.target.value);
                document.getElementById('intensity-value').textContent = `${Math.round(e.target.value * 100)}%`;
                this.updateEnvironment();
            });
        }

        if (interactivityToggle) {
            interactivityToggle.addEventListener('change', (e) => {
                this.environmentSettings.interactivity = e.target.checked;
                this.updateEnvironment();
            });
        }

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.isActive) {
                switch (e.key) {
                    case 'Escape':
                        this.exitImmersiveMode();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.toggleBreathingGuide();
                        break;
                    case 'ArrowLeft':
                        this.previousEnvironment();
                        break;
                    case 'ArrowRight':
                        this.nextEnvironment();
                        break;
                }
            }
        });
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.loadSoundLibrary();
        } catch (error) {
            console.warn('⚠️ Audio not available:', error);
        }
    }

    async loadSoundLibrary() {
        const sounds = {
            birds: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            stream: 'https://www.soundjay.com/misc/sounds/water-1.wav',
            waves: 'https://www.soundjay.com/misc/sounds/waves.wav',
            wind: 'https://www.soundjay.com/misc/sounds/wind.wav'
        };

        // In a real implementation, you'd load actual sound files
        // For now, we'll use synthetic audio generation
        this.generateSyntheticSounds();
    }

    generateSyntheticSounds() {
        if (!this.audioContext) return;

        this.soundSources = {
            ocean: this.createOceanSound(),
            forest: this.createForestSound(),
            wind: this.createWindSound(),
            cosmic: this.createCosmicSound()
        };
    }

    createOceanSound() {
        if (!this.audioContext) return null;

        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(0.2, this.audioContext.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);

        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);

        return { oscillators: [oscillator1, oscillator2], gain: gainNode };
    }

    createForestSound() {
        // Similar synthetic sound generation for forest ambiance
        if (!this.audioContext) return null;

        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // Generate white noise for wind/leaves
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        noise.buffer = buffer;
        noise.loop = true;

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);

        noise.connect(filter);
        filter.connect(gainNode);

        return { source: noise, gain: gainNode };
    }

    createWindSound() {
        // Wind sound generation
        if (!this.audioContext) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);

        oscillator.connect(filter);
        filter.connect(gainNode);

        return { oscillator, gain: gainNode };
    }

    createCosmicSound() {
        // Cosmic/space ambient sound
        if (!this.audioContext) return null;

        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(40, this.audioContext.currentTime);
        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(80, this.audioContext.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);

        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);

        return { oscillators: [oscillator1, oscillator2], gain: gainNode };
    }

    selectEnvironment(envKey) {
        // Remove active class from all cards
        document.querySelectorAll('.environment-card').forEach(card => {
            card.classList.remove('active');
        });

        // Add active class to selected card
        const selectedCard = document.querySelector(`[data-env="${envKey}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }

        this.currentEnvironment = envKey;

        if (this.isActive) {
            this.loadEnvironment(envKey);
        }
    }

    async enterImmersiveMode() {
        if (!this.currentEnvironment) {
            this.currentEnvironment = 'forest'; // Default environment
        }

        const container = document.getElementById('immersive-container');
        const canvas = document.getElementById('immersive-canvas');

        if (!container || !canvas) return;

        // Show immersive container
        container.classList.remove('hidden');
        this.isActive = true;

        // Initialize Three.js scene
        this.initThreeJS(canvas);

        // Load environment
        await this.loadEnvironment(this.currentEnvironment);

        // Start audio
        this.startAudio();

        // Request fullscreen
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }

        // Start animation loop
        this.animate();

        // Start breathing guide
        this.startBreathingGuide();

        console.log('🌌 Entered immersive meditation mode');
    }

    exitImmersiveMode() {
        const container = document.getElementById('immersive-container');
        if (container) {
            container.classList.add('hidden');
        }

        this.isActive = false;

        // Stop audio
        this.stopAudio();

        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }

        // Clean up Three.js
        if (this.renderer) {
            this.renderer.dispose();
        }

        console.log('👋 Exited immersive meditation mode');
    }

    initThreeJS(canvas) {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setClearColor(0x000000);

        // Add basic lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Position camera
        this.camera.position.z = 5;

        // Handle resize
        window.addEventListener('resize', () => {
            if (this.isActive) {
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            }
        });
    }

    async loadEnvironment(envKey) {
        if (!this.scene) return;

        // Clear existing environment
        while (this.scene.children.length > 2) { // Keep lights
            this.scene.remove(this.scene.children[2]);
        }

        const env = this.environments[envKey];
        if (!env) return;

        // Load environment-specific geometry and materials
        switch (envKey) {
            case 'forest':
                this.createForestEnvironment();
                break;
            case 'ocean':
                this.createOceanEnvironment();
                break;
            case 'mountain':
                this.createMountainEnvironment();
                break;
            case 'space':
                this.createSpaceEnvironment();
                break;
            case 'garden':
                this.createGardenEnvironment();
                break;
            case 'aurora':
                this.createAuroraEnvironment();
                break;
        }

        console.log(`🌲 Loaded ${env.name} environment`);
    }

    createForestEnvironment() {
        // Create forest scene with trees, particles, and natural elements
        const forestGroup = new THREE.Group();

        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshLambertMaterial({
            color: 0x3d5a3d,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        forestGroup.add(ground);

        // Create trees
        for (let i = 0; i < 20; i++) {
            const tree = this.createTree();
            tree.position.x = (Math.random() - 0.5) * 30;
            tree.position.z = (Math.random() - 0.5) * 30;
            tree.position.y = -2;
            forestGroup.add(tree);
        }

        // Create floating particles (leaves, dust)
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 40;
            positions[i + 1] = Math.random() * 10;
            positions[i + 2] = (Math.random() - 0.5) * 40;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x88cc88,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        forestGroup.add(particles);

        this.scene.add(forestGroup);
        this.currentEnvironmentGroup = forestGroup;
    }

    createTree() {
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.2, 2);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        treeGroup.add(trunk);

        // Leaves
        const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 6);
        const leavesMaterial = new THREE.MeshLambertMaterial({
            color: 0x228B22,
            transparent: true,
            opacity: 0.8
        });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 2.5;
        leaves.scale.set(1, 0.8, 1);
        treeGroup.add(leaves);

        return treeGroup;
    }

    createOceanEnvironment() {
        // Create ocean scene with water, waves, and marine atmosphere
        const oceanGroup = new THREE.Group();

        // Create water surface
        const waterGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
        const waterMaterial = new THREE.MeshLambertMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -1;

        // Animate water vertices for wave effect
        const vertices = waterGeometry.attributes.position;
        water.userData = { vertices, time: 0 };

        oceanGroup.add(water);

        // Create sky
        const skyGeometry = new THREE.SphereGeometry(50, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.6
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        oceanGroup.add(sky);

        this.scene.add(oceanGroup);
        this.currentEnvironmentGroup = oceanGroup;
    }

    createSpaceEnvironment() {
        // Create cosmic environment with stars, nebulae, and cosmic phenomena
        const spaceGroup = new THREE.Group();

        // Create starfield
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 200;
            positions[i + 1] = (Math.random() - 0.5) * 200;
            positions[i + 2] = (Math.random() - 0.5) * 200;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        spaceGroup.add(stars);

        // Create nebula clouds
        for (let i = 0; i < 5; i++) {
            const cloudGeometry = new THREE.SphereGeometry(10, 16, 16);
            const cloudMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5),
                transparent: true,
                opacity: 0.1
            });
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80
            );
            spaceGroup.add(cloud);
        }

        this.scene.add(spaceGroup);
        this.currentEnvironmentGroup = spaceGroup;
    }

    createMountainEnvironment() {
        // Create mountain landscape
        const mountainGroup = new THREE.Group();

        // Create mountain peaks
        for (let i = 0; i < 8; i++) {
            const mountainGeometry = new THREE.ConeGeometry(3 + Math.random() * 2, 8 + Math.random() * 4, 8);
            const mountainMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(0.1, 0.3, 0.3 + Math.random() * 0.2)
            });
            const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
            mountain.position.x = (Math.random() - 0.5) * 60;
            mountain.position.z = -20 - Math.random() * 30;
            mountain.position.y = -2;
            mountainGroup.add(mountain);
        }

        this.scene.add(mountainGroup);
        this.currentEnvironmentGroup = mountainGroup;
    }

    createGardenEnvironment() {
        // Create zen garden with minimal, peaceful elements
        const gardenGroup = new THREE.Group();

        // Create zen rocks
        for (let i = 0; i < 5; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5);
            const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 10,
                -1.5,
                (Math.random() - 0.5) * 10
            );
            gardenGroup.add(rock);
        }

        this.scene.add(gardenGroup);
        this.currentEnvironmentGroup = gardenGroup;
    }

    createAuroraEnvironment() {
        // Create northern lights environment
        const auroraGroup = new THREE.Group();

        // Create aurora effect
        const auroraGeometry = new THREE.PlaneGeometry(50, 20, 16, 8);
        const auroraMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                color1: { value: new THREE.Color(0x00ff88) },
                color2: { value: new THREE.Color(0x0088ff) }
            },
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    pos.y += sin(time + position.x * 0.1) * 2.0;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                void main() {
                    vec3 color = mix(color1, color2, sin(time + vUv.x * 3.14159) * 0.5 + 0.5);
                    gl_FragColor = vec4(color, 0.6);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        const aurora = new THREE.Mesh(auroraGeometry, auroraMaterial);
        aurora.position.y = 10;
        aurora.position.z = -15;
        aurora.userData = { material: auroraMaterial };
        auroraGroup.add(aurora);

        this.scene.add(auroraGroup);
        this.currentEnvironmentGroup = auroraGroup;
    }

    animate() {
        if (!this.isActive) return;

        requestAnimationFrame(() => this.animate());

        // Animate environment-specific effects
        this.updateEnvironmentAnimations();

        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updateEnvironmentAnimations() {
        if (!this.currentEnvironmentGroup) return;

        const time = Date.now() * 0.001;

        // Rotate entire environment slowly
        this.currentEnvironmentGroup.rotation.y = time * 0.01;

        // Environment-specific animations
        switch (this.currentEnvironment) {
            case 'ocean':
                this.animateWaves(time);
                break;
            case 'forest':
                this.animateParticles(time);
                break;
            case 'space':
                this.animateStars(time);
                break;
            case 'aurora':
                this.animateAurora(time);
                break;
        }
    }

    animateWaves(time) {
        const water = this.currentEnvironmentGroup.children.find(child => child.userData.vertices);
        if (water) {
            const vertices = water.userData.vertices;
            for (let i = 0; i < vertices.count; i++) {
                const x = vertices.getX(i);
                const z = vertices.getZ(i);
                const y = Math.sin(time + x * 0.1) * 0.2 + Math.cos(time + z * 0.1) * 0.1;
                vertices.setY(i, y);
            }
            vertices.needsUpdate = true;
        }
    }

    animateParticles(time) {
        const particles = this.currentEnvironmentGroup.children.find(child => child.geometry?.attributes?.position);
        if (particles) {
            const positions = particles.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i) + Math.sin(time + x * 0.1) * 0.01;
                const z = positions.getZ(i);

                positions.setY(i, y);

                // Reset particles that fall too low
                if (y < -5) {
                    positions.setY(i, 10);
                }
            }
            positions.needsUpdate = true;
        }
    }

    animateStars(time) {
        const stars = this.currentEnvironmentGroup.children.find(child => child.material?.size !== undefined);
        if (stars) {
            stars.rotation.y = time * 0.02;
            stars.rotation.x = time * 0.01;
        }
    }

    animateAurora(time) {
        const aurora = this.currentEnvironmentGroup.children.find(child => child.userData.material);
        if (aurora) {
            aurora.userData.material.uniforms.time.value = time;
        }
    }

    startBreathingGuide() {
        const breathingGuide = document.getElementById('breathing-guide');
        if (!breathingGuide) return;

        const circle = breathingGuide.querySelector('.breathing-circle');
        const text = breathingGuide.querySelector('.breathing-text');

        let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
        let phaseTime = 0;
        const phases = [4000, 1000, 6000, 1000]; // 4-1-6-1 breathing pattern
        const phaseTexts = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];

        const updateBreathing = () => {
            if (!this.isActive) return;

            const now = Date.now();
            if (now - phaseTime > phases[phase]) {
                phase = (phase + 1) % 4;
                phaseTime = now;
                text.textContent = phaseTexts[phase];
            }

            const progress = (now - phaseTime) / phases[phase];
            const scale = phase === 0 ? 0.5 + progress * 0.5 : // Inhale: grow
                phase === 2 ? 1 - progress * 0.5 : // Exhale: shrink
                    phase === 0 ? 1 : 0.5; // Hold: maintain

            circle.style.transform = `scale(${scale})`;

            requestAnimationFrame(updateBreathing);
        };

        phaseTime = Date.now();
        updateBreathing();
    }

    toggleBreathingGuide() {
        const breathingGuide = document.getElementById('breathing-guide');
        if (breathingGuide) {
            breathingGuide.style.display = breathingGuide.style.display === 'none' ? 'block' : 'none';
        }
    }

    startAudio() {
        if (!this.audioContext || !this.soundSources[this.currentEnvironment]) return;

        const sound = this.soundSources[this.currentEnvironment];

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            sound.gain?.connect(this.audioContext.destination);

            if (sound.oscillators) {
                sound.oscillators.forEach(osc => osc.start());
            } else if (sound.oscillator) {
                sound.oscillator.start();
            } else if (sound.source) {
                sound.source.start();
            }
        } catch (error) {
            console.warn('⚠️ Audio start failed:', error);
        }
    }

    stopAudio() {
        Object.values(this.soundSources).forEach(sound => {
            try {
                if (sound.oscillators) {
                    sound.oscillators.forEach(osc => osc.stop());
                } else if (sound.oscillator) {
                    sound.oscillator.stop();
                } else if (sound.source) {
                    sound.source.stop();
                }

                sound.gain?.disconnect();
            } catch (error) {
                // Ignore errors when stopping audio
            }
        });
    }

    updateEnvironment() {
        if (!this.isActive) return;

        // Update environment based on settings
        const { timeOfDay, weather, intensity } = this.environmentSettings;

        // Adjust lighting based on time of day
        if (this.scene) {
            const ambientLight = this.scene.children.find(child => child.type === 'AmbientLight');
            const directionalLight = this.scene.children.find(child => child.type === 'DirectionalLight');

            if (ambientLight && directionalLight) {
                switch (timeOfDay) {
                    case 'dawn':
                        ambientLight.intensity = 0.3;
                        directionalLight.intensity = 0.5;
                        directionalLight.color.setHex(0xffaa88);
                        break;
                    case 'day':
                        ambientLight.intensity = 0.6;
                        directionalLight.intensity = 0.8;
                        directionalLight.color.setHex(0xffffff);
                        break;
                    case 'dusk':
                        ambientLight.intensity = 0.4;
                        directionalLight.intensity = 0.6;
                        directionalLight.color.setHex(0xff8844);
                        break;
                    case 'night':
                        ambientLight.intensity = 0.1;
                        directionalLight.intensity = 0.2;
                        directionalLight.color.setHex(0x4488ff);
                        break;
                }

                // Apply intensity multiplier
                ambientLight.intensity *= intensity;
                directionalLight.intensity *= intensity;
            }
        }
    }

    nextEnvironment() {
        const envKeys = Object.keys(this.environments);
        const currentIndex = envKeys.indexOf(this.currentEnvironment);
        const nextIndex = (currentIndex + 1) % envKeys.length;
        this.selectEnvironment(envKeys[nextIndex]);

        if (this.isActive) {
            this.loadEnvironment(envKeys[nextIndex]);
        }
    }

    previousEnvironment() {
        const envKeys = Object.keys(this.environments);
        const currentIndex = envKeys.indexOf(this.currentEnvironment);
        const prevIndex = currentIndex === 0 ? envKeys.length - 1 : currentIndex - 1;
        this.selectEnvironment(envKeys[prevIndex]);

        if (this.isActive) {
            this.loadEnvironment(envKeys[prevIndex]);
        }
    }

    showFallbackMessage() {
        const panel = document.getElementById('immersive-environments-panel');
        if (panel) {
            panel.innerHTML = `
                <div class="immersive-header">
                    <h3><i class="fas fa-globe"></i> 3D Meditation Environments</h3>
                </div>
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    3D environments require a modern browser with WebGL support. 
                    Traditional meditation tools are still available.
                </div>
            `;
        }
    }
}

// Initialize 3D Immersive Environments when page loads
document.addEventListener('DOMContentLoaded', () => {
    const immersiveEnvironments = new ImmersiveMeditationEnvironments();
    window.immersiveEnvironments = immersiveEnvironments;

    console.log('🌌 3D Immersive Meditation Environments loaded');
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ImmersiveMeditationEnvironments };
}