// ===== AR MINDFULNESS OVERLAYS =====
// WebXR Augmented Reality for immersive mindfulness experiences

class ARMindfulnessSystem {
    constructor() {
        this.isInitialized = false;
        this.arSession = null;
        this.xrRefSpace = null;
        this.gl = null;
        this.programInfo = null;
        this.frameOfRef = null;

        // AR session state
        this.isARActive = false;
        this.isTrackingEnabled = false;
        this.currentExercise = null;

        // Mindfulness exercises
        this.exercises = {
            breathingGuide: {
                name: 'Breathing Guide',
                description: 'Visual breathing prompts overlaid on your environment',
                duration: 300, // 5 minutes
                type: 'breathing',
                elements: ['sphere', 'particles', 'text']
            },
            groundingAnchors: {
                name: 'Grounding Anchors',
                description: '5-4-3-2-1 sensory awareness technique in AR',
                duration: 600, // 10 minutes
                type: 'grounding',
                elements: ['markers', 'text', 'counters']
            },
            mindfulWalking: {
                name: 'Mindful Walking',
                description: 'AR footsteps and awareness prompts for walking meditation',
                duration: 900, // 15 minutes
                type: 'movement',
                elements: ['footsteps', 'path', 'prompts']
            },
            bodyScanning: {
                name: 'Body Scan AR',
                description: 'Progressive relaxation with 3D body visualization',
                duration: 1200, // 20 minutes
                type: 'relaxation',
                elements: ['body_outline', 'highlight_zones', 'instructions']
            },
            environmentalAwareness: {
                name: 'Environmental Mindfulness',
                description: 'AR overlays highlighting natural elements for awareness',
                duration: 450, // 7.5 minutes
                type: 'awareness',
                elements: ['highlight_nature', 'info_bubbles', 'sounds']
            }
        };

        // 3D models and assets
        this.assets = {
            breathingSphere: null,
            particles: null,
            textMeshes: {},
            anchors: [],
            footstepMarkers: []
        };

        // Animation states
        this.animations = {
            breathingCycle: {
                phase: 'inhale', // inhale, hold, exhale, pause
                progress: 0,
                duration: 4000, // 4 seconds per phase
                scale: 1.0
            },
            particles: {
                systems: [],
                count: 100
            }
        };

        // Tracking and interaction
        this.hitTestSource = null;
        this.placedObjects = new Map();
        this.userInteractions = [];

        this.init();
    }

    async init() {
        try {
            await this.checkWebXRSupport();
            this.setupUI();
            this.setupEventListeners();
            await this.initializeRenderer();
            this.isInitialized = true;

            console.log('🥽 AR Mindfulness System initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize AR system:', error);
            this.showFallbackMessage();
        }
    }

    async checkWebXRSupport() {
        if (!navigator.xr) {
            throw new Error('WebXR not supported in this browser');
        }

        const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
        if (!isSupported) {
            throw new Error('AR sessions not supported on this device');
        }

        // Check for required features
        const requiredFeatures = ['local', 'hit-test', 'anchors'];
        const optionalFeatures = ['dom-overlay', 'hand-tracking'];

        this.supportedFeatures = {
            required: requiredFeatures,
            optional: optionalFeatures
        };

        console.log('✅ WebXR AR support confirmed');
        return true;
    }

    setupUI() {
        const arPanel = document.createElement('div');
        arPanel.id = 'ar-mindfulness-panel';
        arPanel.className = 'ar-mindfulness-panel';
        arPanel.innerHTML = `
            <div class="ar-header">
                <h3><i class="fas fa-eye"></i> AR Mindfulness</h3>
                <div class="ar-status">
                    <span class="status-indicator" id="ar-status-indicator"></span>
                    <span class="status-text" id="ar-status-text">Ready</span>
                </div>
            </div>
            
            <div class="ar-compatibility" id="ar-compatibility">
                <div class="compatibility-check">
                    <i class="fas fa-check-circle"></i>
                    <span>WebXR AR Compatible Device Detected</span>
                </div>
                <div class="device-requirements">
                    <h5>Requirements:</h5>
                    <ul>
                        <li>✅ Modern smartphone or AR headset</li>
                        <li>✅ Camera permissions</li>
                        <li>✅ Motion sensors</li>
                        <li>✅ WebXR support</li>
                    </ul>
                </div>
            </div>
            
            <div class="ar-exercises">
                <h4>Choose Your AR Experience</h4>
                <div class="exercises-grid">
                    ${Object.entries(this.exercises).map(([key, exercise]) => `
                        <div class="exercise-card" data-exercise="${key}">
                            <div class="exercise-icon">
                                ${this.getExerciseIcon(exercise.type)}
                            </div>
                            <div class="exercise-info">
                                <h5>${exercise.name}</h5>
                                <p>${exercise.description}</p>
                                <div class="exercise-meta">
                                    <span class="duration">${Math.floor(exercise.duration / 60)} min</span>
                                    <span class="type">${exercise.type}</span>
                                </div>
                            </div>
                            <button class="btn btn-primary exercise-start" data-exercise="${key}">
                                Start AR
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="ar-controls" id="ar-controls" style="display: none;">
                <div class="ar-session-info">
                    <h4>AR Session Active</h4>
                    <div class="session-details">
                        <div class="current-exercise" id="current-exercise">Breathing Guide</div>
                        <div class="session-timer" id="session-timer">0:00</div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="ar-progress-fill"></div>
                        </div>
                    </div>
                </div>
                
                <div class="ar-actions">
                    <button id="pause-ar-session" class="btn btn-secondary">
                        <i class="fas fa-pause"></i> Pause
                    </button>
                    <button id="end-ar-session" class="btn btn-danger">
                        <i class="fas fa-stop"></i> End Session
                    </button>
                </div>
                
                <div class="ar-instructions" id="ar-instructions">
                    <div class="instruction-text">
                        Point your device around to place mindfulness anchors in your space
                    </div>
                </div>
            </div>
            
            <div class="ar-settings">
                <h4>AR Settings</h4>
                <div class="settings-grid">
                    <div class="setting-item">
                        <label for="ar-scale">Object Scale</label>
                        <input type="range" id="ar-scale" min="0.5" max="2.0" step="0.1" value="1.0">
                        <span id="scale-value">100%</span>
                    </div>
                    <div class="setting-item">
                        <label for="ar-opacity">Overlay Opacity</label>
                        <input type="range" id="ar-opacity" min="0.3" max="1.0" step="0.1" value="0.8">
                        <span id="opacity-value">80%</span>
                    </div>
                    <div class="setting-item">
                        <label for="ar-sound">Ambient Sounds</label>
                        <input type="checkbox" id="ar-sound" checked>
                    </div>
                    <div class="setting-item">
                        <label for="ar-haptics">Haptic Feedback</label>
                        <input type="checkbox" id="ar-haptics" checked>
                    </div>
                </div>
            </div>
            
            <div class="ar-tips">
                <h4>AR Tips</h4>
                <div class="tips-content">
                    <div class="tip-item">
                        <i class="fas fa-lightbulb"></i>
                        <span>Find a well-lit space with good contrast for optimal tracking</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-mobile-alt"></i>
                        <span>Move your device slowly to maintain stable tracking</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-hand-point-up"></i>
                        <span>Tap on surfaces to place mindfulness anchors</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-eye"></i>
                        <span>Look around naturally - the AR elements will follow your gaze</span>
                    </div>
                </div>
            </div>
        `;

        // Add to wellness tools section
        const wellnessSection = document.querySelector('.wellness-tools') || document.querySelector('.dashboard');
        if (wellnessSection) {
            wellnessSection.appendChild(arPanel);
        } else {
            document.body.appendChild(arPanel);
        }
    }

    getExerciseIcon(type) {
        const icons = {
            breathing: '<i class="fas fa-lungs"></i>',
            grounding: '<i class="fas fa-anchor"></i>',
            movement: '<i class="fas fa-walking"></i>',
            relaxation: '<i class="fas fa-user-zen"></i>',
            awareness: '<i class="fas fa-leaf"></i>'
        };
        return icons[type] || '<i class="fas fa-circle"></i>';
    }

    setupEventListeners() {
        // Exercise start buttons
        document.querySelectorAll('.exercise-start').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exerciseKey = e.target.dataset.exercise;
                this.startARExercise(exerciseKey);
            });
        });

        // AR session controls
        const pauseBtn = document.getElementById('pause-ar-session');
        const endBtn = document.getElementById('end-ar-session');

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseARSession());
        }

        if (endBtn) {
            endBtn.addEventListener('click', () => this.endARSession());
        }

        // Settings
        const scaleSlider = document.getElementById('ar-scale');
        const opacitySlider = document.getElementById('ar-opacity');

        if (scaleSlider) {
            scaleSlider.addEventListener('input', (e) => {
                this.updateObjectScale(parseFloat(e.target.value));
                document.getElementById('scale-value').textContent = `${Math.round(e.target.value * 100)}%`;
            });
        }

        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                this.updateOverlayOpacity(parseFloat(e.target.value));
                document.getElementById('opacity-value').textContent = `${Math.round(e.target.value * 100)}%`;
            });
        }
    }

    async initializeRenderer() {
        // Create WebGL context for AR rendering
        const canvas = document.createElement('canvas');
        canvas.id = 'ar-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1000';
        canvas.style.display = 'none';
        canvas.style.pointerEvents = 'none';

        document.body.appendChild(canvas);

        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', { xrCompatible: true });

        if (!this.gl) {
            throw new Error('WebGL 2.0 not supported');
        }

        // Initialize shaders and programs
        await this.setupShaders();
        await this.loadAssets();

        console.log('✅ AR Renderer initialized');
    }

    async setupShaders() {
        const vertexShaderSource = `#version 300 es
            in vec4 a_position;
            in vec3 a_normal;
            in vec2 a_texcoord;
            
            uniform mat4 u_modelViewMatrix;
            uniform mat4 u_projectionMatrix;
            uniform mat4 u_normalMatrix;
            
            out vec3 v_normal;
            out vec2 v_texcoord;
            out vec3 v_position;
            
            void main() {
                gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
                v_normal = mat3(u_normalMatrix) * a_normal;
                v_texcoord = a_texcoord;
                v_position = (u_modelViewMatrix * a_position).xyz;
            }
        `;

        const fragmentShaderSource = `#version 300 es
            precision highp float;
            
            in vec3 v_normal;
            in vec2 v_texcoord;
            in vec3 v_position;
            
            uniform vec4 u_color;
            uniform float u_opacity;
            uniform float u_time;
            uniform vec3 u_lightDirection;
            
            out vec4 fragColor;
            
            void main() {
                vec3 normal = normalize(v_normal);
                float light = dot(normal, normalize(u_lightDirection)) * 0.5 + 0.5;
                
                // Breathing animation effect
                float pulse = sin(u_time * 2.0) * 0.1 + 0.9;
                
                vec4 color = u_color;
                color.rgb *= light * pulse;
                color.a *= u_opacity;
                
                fragColor = color;
            }
        `;

        this.programInfo = this.createProgramInfo(vertexShaderSource, fragmentShaderSource);
    }

    createProgramInfo(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error('Failed to link shader program: ' + this.gl.getProgramInfoLog(program));
        }

        return {
            program,
            attribLocations: {
                position: this.gl.getAttribLocation(program, 'a_position'),
                normal: this.gl.getAttribLocation(program, 'a_normal'),
                texcoord: this.gl.getAttribLocation(program, 'a_texcoord')
            },
            uniformLocations: {
                modelViewMatrix: this.gl.getUniformLocation(program, 'u_modelViewMatrix'),
                projectionMatrix: this.gl.getUniformLocation(program, 'u_projectionMatrix'),
                normalMatrix: this.gl.getUniformLocation(program, 'u_normalMatrix'),
                color: this.gl.getUniformLocation(program, 'u_color'),
                opacity: this.gl.getUniformLocation(program, 'u_opacity'),
                time: this.gl.getUniformLocation(program, 'u_time'),
                lightDirection: this.gl.getUniformLocation(program, 'u_lightDirection')
            }
        };
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('Failed to compile shader: ' + this.gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    async loadAssets() {
        // Create breathing sphere geometry
        this.assets.breathingSphere = this.createSphereGeometry(0.2, 16, 16);

        // Create particle system
        this.assets.particles = this.createParticleSystem(50);

        // Create text meshes for instructions
        this.assets.textMeshes = {
            inhale: this.createTextMesh("Breathe In"),
            exhale: this.createTextMesh("Breathe Out"),
            hold: this.createTextMesh("Hold"),
            relax: this.createTextMesh("Relax")
        };

        console.log('✅ AR Assets loaded');
    }

    createSphereGeometry(radius, widthSegments, heightSegments) {
        const positions = [];
        const normals = [];
        const texcoords = [];
        const indices = [];

        for (let lat = 0; lat <= heightSegments; lat++) {
            const theta = lat * Math.PI / heightSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= widthSegments; lon++) {
                const phi = lon * 2 * Math.PI / widthSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                positions.push(radius * x, radius * y, radius * z);
                normals.push(x, y, z);
                texcoords.push(lon / widthSegments, lat / heightSegments);
            }
        }

        for (let lat = 0; lat < heightSegments; lat++) {
            for (let lon = 0; lon < widthSegments; lon++) {
                const first = lat * (widthSegments + 1) + lon;
                const second = first + widthSegments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        return {
            positions: new Float32Array(positions),
            normals: new Float32Array(normals),
            texcoords: new Float32Array(texcoords),
            indices: new Uint16Array(indices)
        };
    }

    createParticleSystem(count) {
        const positions = [];
        const velocities = [];
        const colors = [];

        for (let i = 0; i < count; i++) {
            // Random position around origin
            positions.push(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );

            // Random velocity
            velocities.push(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            );

            // Calming colors
            const hue = Math.random() * 60 + 180; // Blue to cyan range
            colors.push(
                Math.sin(hue * Math.PI / 180),
                Math.cos(hue * Math.PI / 180),
                0.8
            );
        }

        return {
            positions: new Float32Array(positions),
            velocities: new Float32Array(velocities),
            colors: new Float32Array(colors),
            count
        };
    }

    createTextMesh(text) {
        // Simplified text rendering - in production, use a proper text rendering library
        return {
            text,
            width: text.length * 0.1,
            height: 0.1
        };
    }

    async startARExercise(exerciseKey) {
        if (!this.exercises[exerciseKey]) {
            console.error('Unknown exercise:', exerciseKey);
            return;
        }

        try {
            this.currentExercise = this.exercises[exerciseKey];

            // Request AR session
            this.arSession = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: this.supportedFeatures.required,
                optionalFeatures: this.supportedFeatures.optional
            });

            // Set up the session
            await this.setupARSession();

            // Update UI
            this.showARControls();
            this.updateSessionInfo();

            // Start the exercise
            this.startExerciseLogic(exerciseKey);

            if (window.showNotification) {
                window.showNotification(`🥽 AR ${this.currentExercise.name} started!`, 'success');
            }

        } catch (error) {
            console.error('Failed to start AR session:', error);

            if (window.showNotification) {
                window.showNotification('❌ Failed to start AR session. Please try again.', 'error');
            }
        }
    }

    async setupARSession() {
        // Set up XR reference space
        this.xrRefSpace = await this.arSession.requestReferenceSpace('local');

        // Set up hit testing
        this.hitTestSource = await this.arSession.requestHitTestSource({ space: this.xrRefSpace });

        // Configure WebGL for XR
        await this.gl.makeXRCompatible();
        this.arSession.updateRenderState({
            baseLayer: new XRWebGLLayer(this.arSession, this.gl)
        });

        // Start the render loop
        this.arSession.requestAnimationFrame(this.onXRFrame.bind(this));

        // Show AR canvas
        this.canvas.style.display = 'block';

        // Set up session event handlers
        this.arSession.addEventListener('end', () => {
            this.onARSessionEnd();
        });

        this.isARActive = true;
        this.sessionStartTime = Date.now();
    }

    onXRFrame(time, frame) {
        if (!this.arSession) return;

        const session = this.arSession;
        const pose = frame.getViewerPose(this.xrRefSpace);

        if (pose) {
            const layer = session.renderState.baseLayer;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, layer.framebuffer);

            // Clear the framebuffer
            this.gl.clearColor(0, 0, 0, 0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            // Render for each eye
            for (const view of pose.views) {
                const viewport = layer.getViewport(view);
                this.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

                this.renderARScene(view, time);
            }

            // Handle hit testing
            this.handleHitTesting(frame);

            // Update animations
            this.updateAnimations(time);
        }

        // Continue the render loop
        session.requestAnimationFrame(this.onXRFrame.bind(this));
    }

    renderARScene(view, time) {
        if (!this.currentExercise) return;

        // Set up matrices
        const projectionMatrix = view.projectionMatrix;
        const viewMatrix = view.transform.inverse.matrix;

        // Render based on exercise type
        switch (this.currentExercise.type) {
            case 'breathing':
                this.renderBreathingGuide(projectionMatrix, viewMatrix, time);
                break;
            case 'grounding':
                this.renderGroundingAnchors(projectionMatrix, viewMatrix, time);
                break;
            case 'movement':
                this.renderMindfulWalking(projectionMatrix, viewMatrix, time);
                break;
            case 'relaxation':
                this.renderBodyScanning(projectionMatrix, viewMatrix, time);
                break;
            case 'awareness':
                this.renderEnvironmentalAwareness(projectionMatrix, viewMatrix, time);
                break;
        }
    }

    renderBreathingGuide(projectionMatrix, viewMatrix, time) {
        // Render breathing sphere in front of user
        const modelMatrix = this.createModelMatrix([0, 0, -1.5], [0, 0, 0], this.animations.breathingCycle.scale);
        const modelViewMatrix = this.multiplyMatrices(viewMatrix, modelMatrix);

        this.renderSphere(projectionMatrix, modelViewMatrix, time);

        // Render breathing particles
        this.renderParticles(projectionMatrix, viewMatrix, time);

        // Render instruction text
        this.renderInstructionText(projectionMatrix, viewMatrix, this.getBreathingInstruction());
    }

    renderGroundingAnchors(projectionMatrix, viewMatrix, time) {
        // Render anchors at placed positions
        this.placedObjects.forEach((object, id) => {
            if (object.type === 'anchor') {
                const modelMatrix = this.createModelMatrix(object.position, [0, time * 0.001, 0], 0.1);
                const modelViewMatrix = this.multiplyMatrices(viewMatrix, modelMatrix);

                this.renderAnchor(projectionMatrix, modelViewMatrix, object.data);
            }
        });
    }

    renderMindfulWalking(projectionMatrix, viewMatrix, time) {
        // Render footstep markers and path
        this.assets.footstepMarkers.forEach((marker, index) => {
            const modelMatrix = this.createModelMatrix(marker.position, [0, 0, 0], 0.05);
            const modelViewMatrix = this.multiplyMatrices(viewMatrix, modelMatrix);

            this.renderFootstepMarker(projectionMatrix, modelViewMatrix, marker);
        });
    }

    renderBodyScanning(projectionMatrix, viewMatrix, time) {
        // Render body outline and highlight zones
        const bodyPosition = [0, 0, -2];
        const modelMatrix = this.createModelMatrix(bodyPosition, [0, 0, 0], 1.0);
        const modelViewMatrix = this.multiplyMatrices(viewMatrix, modelMatrix);

        this.renderBodyOutline(projectionMatrix, modelViewMatrix, time);
    }

    renderEnvironmentalAwareness(projectionMatrix, viewMatrix, time) {
        // Render awareness highlights and info bubbles
        this.placedObjects.forEach((object, id) => {
            if (object.type === 'awareness_point') {
                const modelMatrix = this.createModelMatrix(object.position, [0, time * 0.002, 0], 0.08);
                const modelViewMatrix = this.multiplyMatrices(viewMatrix, modelMatrix);

                this.renderAwarenessHighlight(projectionMatrix, modelViewMatrix, object.data);
            }
        });
    }

    renderSphere(projectionMatrix, modelViewMatrix, time) {
        const gl = this.gl;
        const programInfo = this.programInfo;

        gl.useProgram(programInfo.program);

        // Set uniforms
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniform4f(programInfo.uniformLocations.color, 0.3, 0.7, 1.0, 0.8);
        gl.uniform1f(programInfo.uniformLocations.opacity, 0.8);
        gl.uniform1f(programInfo.uniformLocations.time, time * 0.001);
        gl.uniform3f(programInfo.uniformLocations.lightDirection, 0, 1, 0);

        // Bind and draw sphere geometry
        this.bindAndDrawGeometry(this.assets.breathingSphere);
    }

    renderParticles(projectionMatrix, viewMatrix, time) {
        // Render floating particles around the breathing sphere
        const particles = this.assets.particles;

        for (let i = 0; i < particles.count; i++) {
            const offset = i * 3;
            const position = [
                particles.positions[offset] + Math.sin(time * 0.001 + i) * 0.1,
                particles.positions[offset + 1] + Math.cos(time * 0.001 + i) * 0.1,
                particles.positions[offset + 2] - 1.5
            ];

            const modelMatrix = this.createModelMatrix(position, [0, 0, 0], 0.02);
            const modelViewMatrix = this.multiplyMatrices(viewMatrix, modelMatrix);

            this.renderParticle(projectionMatrix, modelViewMatrix, particles.colors.slice(offset, offset + 3));
        }
    }

    renderParticle(projectionMatrix, modelViewMatrix, color) {
        // Simplified particle rendering
        const gl = this.gl;
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        gl.uniform4f(this.programInfo.uniformLocations.color, color[0], color[1], color[2], 0.6);

        // Draw a small sphere for each particle
        this.bindAndDrawGeometry(this.assets.breathingSphere);
    }

    bindAndDrawGeometry(geometry) {
        const gl = this.gl;

        // Create and bind buffers (simplified)
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.programInfo.attribLocations.position);
        gl.vertexAttribPointer(this.programInfo.attribLocations.position, 3, gl.FLOAT, false, 0, 0);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

        gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    }

    handleHitTesting(frame) {
        if (!this.hitTestSource) return;

        const hitTestResults = frame.getHitTestResults(this.hitTestSource);

        if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(this.xrRefSpace);

            if (pose) {
                // Store hit test result for user interaction
                this.lastHitTest = {
                    position: pose.transform.position,
                    orientation: pose.transform.orientation
                };
            }
        }
    }

    updateAnimations(time) {
        // Update breathing cycle animation
        this.updateBreathingCycle(time);

        // Update particle animations
        this.updateParticleSystem(time);

        // Update session timer
        this.updateSessionTimer();
    }

    updateBreathingCycle(time) {
        const cycle = this.animations.breathingCycle;
        const elapsed = time - (this.lastBreathingUpdate || time);
        this.lastBreathingUpdate = time;

        cycle.progress += elapsed;

        // 4-4-4-4 breathing pattern (4 seconds each phase)
        const phaseDuration = 4000;
        const totalCycle = phaseDuration * 4;

        const phaseIndex = Math.floor((cycle.progress % totalCycle) / phaseDuration);
        const phaseProgress = ((cycle.progress % totalCycle) % phaseDuration) / phaseDuration;

        const phases = ['inhale', 'hold', 'exhale', 'pause'];
        cycle.phase = phases[phaseIndex];

        // Scale animation based on phase
        switch (cycle.phase) {
            case 'inhale':
                cycle.scale = 0.8 + (phaseProgress * 0.4); // Scale from 0.8 to 1.2
                break;
            case 'hold':
                cycle.scale = 1.2; // Hold at maximum
                break;
            case 'exhale':
                cycle.scale = 1.2 - (phaseProgress * 0.4); // Scale from 1.2 to 0.8
                break;
            case 'pause':
                cycle.scale = 0.8; // Hold at minimum
                break;
        }

        // Update instruction text
        this.updateBreathingInstruction(cycle.phase);
    }

    updateParticleSystem(time) {
        const particles = this.assets.particles;
        const deltaTime = time - (this.lastParticleUpdate || time);
        this.lastParticleUpdate = time;

        // Update particle positions based on velocities
        for (let i = 0; i < particles.count; i++) {
            const offset = i * 3;

            particles.positions[offset] += particles.velocities[offset] * deltaTime;
            particles.positions[offset + 1] += particles.velocities[offset + 1] * deltaTime;
            particles.positions[offset + 2] += particles.velocities[offset + 2] * deltaTime;

            // Reset particles that drift too far
            const distance = Math.sqrt(
                particles.positions[offset] ** 2 +
                particles.positions[offset + 1] ** 2 +
                particles.positions[offset + 2] ** 2
            );

            if (distance > 3) {
                particles.positions[offset] = (Math.random() - 0.5) * 0.5;
                particles.positions[offset + 1] = (Math.random() - 0.5) * 0.5;
                particles.positions[offset + 2] = (Math.random() - 0.5) * 0.5;
            }
        }
    }

    updateSessionTimer() {
        if (!this.sessionStartTime) return;

        const elapsed = Date.now() - this.sessionStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const timerElement = document.getElementById('session-timer');
        if (timerElement) {
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // Update progress bar
        const progressElement = document.getElementById('ar-progress-fill');
        if (progressElement && this.currentExercise) {
            const progress = Math.min((elapsed / (this.currentExercise.duration * 1000)) * 100, 100);
            progressElement.style.width = `${progress}%`;
        }
    }

    getBreathingInstruction() {
        const phase = this.animations.breathingCycle.phase;
        const instructions = {
            inhale: 'Breathe In Slowly',
            hold: 'Hold Your Breath',
            exhale: 'Breathe Out Gently',
            pause: 'Pause and Relax'
        };
        return instructions[phase] || 'Focus on Your Breath';
    }

    updateBreathingInstruction(phase) {
        const instructionElement = document.getElementById('ar-instructions');
        if (instructionElement) {
            const instruction = this.getBreathingInstruction();
            instructionElement.querySelector('.instruction-text').textContent = instruction;
        }
    }

    // Utility methods
    createModelMatrix(position, rotation, scale) {
        const matrix = new Float32Array(16);

        // Create identity matrix
        matrix[0] = matrix[5] = matrix[10] = matrix[15] = 1;

        // Apply transformations
        this.translate(matrix, position[0], position[1], position[2]);
        this.rotateY(matrix, rotation[1]);
        this.scaleMatrix(matrix, scale, scale, scale);

        return matrix;
    }

    translate(matrix, x, y, z) {
        matrix[12] += x;
        matrix[13] += y;
        matrix[14] += z;
    }

    rotateY(matrix, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const temp = matrix[0];
        matrix[0] = temp * cos - matrix[8] * sin;
        matrix[8] = temp * sin + matrix[8] * cos;
    }

    scaleMatrix(matrix, x, y, z) {
        matrix[0] *= x;
        matrix[5] *= y;
        matrix[10] *= z;
    }

    multiplyMatrices(a, b) {
        const result = new Float32Array(16);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i * 4 + j] =
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }

        return result;
    }

    // Session management
    showARControls() {
        document.getElementById('ar-controls').style.display = 'block';
        document.querySelector('.ar-exercises').style.display = 'none';
    }

    hideARControls() {
        document.getElementById('ar-controls').style.display = 'none';
        document.querySelector('.ar-exercises').style.display = 'block';
    }

    updateSessionInfo() {
        if (this.currentExercise) {
            document.getElementById('current-exercise').textContent = this.currentExercise.name;
        }
    }

    pauseARSession() {
        // Pause functionality
        if (this.isARActive) {
            // Implementation for pausing AR session
            console.log('AR session paused');
        }
    }

    endARSession() {
        if (this.arSession) {
            this.arSession.end();
        }
    }

    onARSessionEnd() {
        this.isARActive = false;
        this.arSession = null;
        this.currentExercise = null;

        // Hide AR canvas
        if (this.canvas) {
            this.canvas.style.display = 'none';
        }

        // Update UI
        this.hideARControls();

        if (window.showNotification) {
            window.showNotification('✅ AR session completed', 'success');
        }
    }

    updateObjectScale(scale) {
        // Update scale for all AR objects
        this.objectScale = scale;
    }

    updateOverlayOpacity(opacity) {
        // Update opacity for all AR overlays
        this.overlayOpacity = opacity;
    }

    startExerciseLogic(exerciseKey) {
        // Initialize exercise-specific logic
        switch (exerciseKey) {
            case 'breathingGuide':
                this.initBreathingGuide();
                break;
            case 'groundingAnchors':
                this.initGroundingAnchors();
                break;
            case 'mindfulWalking':
                this.initMindfulWalking();
                break;
            case 'bodyScanning':
                this.initBodyScanning();
                break;
            case 'environmentalAwareness':
                this.initEnvironmentalAwareness();
                break;
        }
    }

    initBreathingGuide() {
        // Reset breathing animation
        this.animations.breathingCycle.progress = 0;
        this.lastBreathingUpdate = performance.now();
    }

    initGroundingAnchors() {
        // Set up 5-4-3-2-1 grounding exercise
        this.groundingSteps = [
            { type: 'see', count: 5, instruction: 'Find 5 things you can see' },
            { type: 'touch', count: 4, instruction: 'Find 4 things you can touch' },
            { type: 'hear', count: 3, instruction: 'Find 3 things you can hear' },
            { type: 'smell', count: 2, instruction: 'Find 2 things you can smell' },
            { type: 'taste', count: 1, instruction: 'Find 1 thing you can taste' }
        ];
        this.currentGroundingStep = 0;
    }

    initMindfulWalking() {
        // Set up walking meditation path
        this.walkingPath = [];
        this.currentPathStep = 0;
    }

    initBodyScanning() {
        // Set up body scan sequence
        this.bodyScanZones = [
            'feet', 'legs', 'torso', 'arms', 'head'
        ];
        this.currentScanZone = 0;
    }

    initEnvironmentalAwareness() {
        // Set up environmental mindfulness
        this.awarenessPoints = [];
    }

    showFallbackMessage() {
        const panel = document.getElementById('ar-mindfulness-panel');
        if (panel) {
            panel.innerHTML = `
                <div class="ar-header">
                    <h3><i class="fas fa-eye"></i> AR Mindfulness</h3>
                </div>
                <div class="ar-fallback">
                    <div class="fallback-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h4>AR Not Available</h4>
                        <p>WebXR AR is not supported on this device or browser.</p>
                        <div class="fallback-suggestions">
                            <h5>Try instead:</h5>
                            <ul>
                                <li>Use a modern smartphone or tablet</li>
                                <li>Enable camera permissions</li>
                                <li>Use Chrome or Firefox with WebXR support</li>
                                <li>Try our 3D Immersive Environments instead</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.arMindfulness = new ARMindfulnessSystem();
    console.log('🥽 AR Mindfulness System loaded');
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ARMindfulnessSystem };
}