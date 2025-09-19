// ===== VOICE AI THERAPY ASSISTANT =====
// Revolutionary Web Speech API integration for voice conversations with emotional analysis

class VoiceAITherapist {
    constructor() {
        this.recognition = null;
        this.synthesis = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.conversationHistory = [];
        this.voiceProfile = {
            pitch: 1.0,
            rate: 0.9,
            volume: 0.8,
            voice: null
        };
        this.emotionalContext = null;
        this.sessionData = {
            startTime: null,
            duration: 0,
            emotionalJourney: [],
            keyInsights: [],
            recommendations: []
        };

        // Advanced therapeutic responses
        this.therapeuticFrameworks = {
            cbt: {
                name: "Cognitive Behavioral Therapy",
                techniques: ["thought challenging", "behavioral activation", "cognitive restructuring"],
                responses: {
                    negative_thought: [
                        "I hear that you're having some challenging thoughts. Let's examine the evidence for and against this thought together.",
                        "That sounds like a difficult thought to have. Can we explore whether this thought is helpful or realistic?",
                        "I notice this thought might be causing you distress. What would you tell a friend who had this same thought?"
                    ],
                    behavioral_pattern: [
                        "I'm noticing a pattern in your behavior. How do you think this behavior is affecting your mood?",
                        "Let's explore what happens before and after this behavior. Can we identify any triggers?",
                        "What small step could you take today to change this pattern in a positive way?"
                    ]
                }
            },
            dbt: {
                name: "Dialectical Behavior Therapy",
                techniques: ["mindfulness", "distress tolerance", "emotional regulation", "interpersonal effectiveness"],
                responses: {
                    intense_emotion: [
                        "I can hear the intensity in your voice. Let's practice some grounding techniques together. Can you name 5 things you can see right now?",
                        "It sounds like you're experiencing a strong emotion. Remember, emotions are temporary. Let's breathe through this together.",
                        "This emotion is valid and understandable. Let's use some distress tolerance skills to help you through this moment."
                    ],
                    relationship_issue: [
                        "Relationships can be challenging. Let's think about what you need from this situation and how you might communicate that effectively.",
                        "I hear that this relationship is causing you distress. What would be the most skillful way to handle this?",
                        "Let's explore your feelings about this relationship while considering the other person's perspective too."
                    ]
                }
            },
            humanistic: {
                name: "Humanistic Therapy",
                techniques: ["active listening", "unconditional positive regard", "empathetic reflection"],
                responses: {
                    self_discovery: [
                        "It sounds like you're really exploring who you are. How does it feel to share this with me?",
                        "I hear you discovering something important about yourself. What does this mean to you?",
                        "You're showing such courage in examining your inner world. How can you honor this part of yourself?"
                    ],
                    personal_growth: [
                        "I can hear the growth in your voice. What's it like to recognize this change in yourself?",
                        "You're becoming more aware of your authentic self. How does that feel?",
                        "This insight shows your wisdom and strength. How can you build on this understanding?"
                    ]
                }
            }
        };

        // Emotion analysis patterns
        this.emotionVoicePatterns = {
            anxiety: {
                indicators: ["fast", "high pitch", "breathless", "rushed", "shaky"],
                vocalFeatures: { speed: "fast", pitch: "high", pauses: "few" },
                response: "I notice some anxiety in your voice. Let's slow down together and take a few deep breaths."
            },
            depression: {
                indicators: ["slow", "low energy", "quiet", "monotone", "long pauses"],
                vocalFeatures: { speed: "slow", pitch: "low", pauses: "many" },
                response: "I hear that you're feeling low energy today. Thank you for sharing with me despite how difficult it might be to speak."
            },
            anger: {
                indicators: ["loud", "sharp", "clipped", "tense", "raised"],
                vocalFeatures: { volume: "high", tone: "sharp", speed: "variable" },
                response: "I can hear the frustration in your voice. These feelings are valid. Let's explore what's underneath this anger."
            },
            excitement: {
                indicators: ["fast", "animated", "varied", "energetic", "expressive"],
                vocalFeatures: { speed: "fast", pitch: "varied", energy: "high" },
                response: "I can hear the positive energy in your voice! Tell me more about what's creating this excitement for you."
            }
        };

        this.init();
    }

    async init() {
        try {
            await this.initializeSpeechAPIs();
            this.setupUI();
            this.setupEventListeners();
            this.selectOptimalVoice();
            console.log('🎤 Voice AI Therapist initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Voice AI:', error);
            this.showFallbackMessage();
        }
    }

    async initializeSpeechAPIs() {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 3;

            this.setupRecognitionEventListeners();
        } else {
            throw new Error('Speech Recognition not supported');
        }

        // Initialize Speech Synthesis
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;

            // Wait for voices to load
            await this.waitForVoices();
        } else {
            throw new Error('Speech Synthesis not supported');
        }
    }

    waitForVoices() {
        return new Promise((resolve) => {
            const loadVoices = () => {
                const voices = this.synthesis.getVoices();
                if (voices.length > 0) {
                    resolve();
                } else {
                    setTimeout(loadVoices, 100);
                }
            };

            if (this.synthesis.getVoices().length > 0) {
                resolve();
            } else {
                this.synthesis.addEventListener('voiceschanged', loadVoices);
                setTimeout(loadVoices, 100);
            }
        });
    }

    setupRecognitionEventListeners() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateListeningUI(true);
            console.log('🎤 Voice recognition started');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateListeningUI(false);
            console.log('🔇 Voice recognition ended');
        };

        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };

        this.recognition.onerror = (event) => {
            console.error('🎤 Speech recognition error:', event.error);
            this.handleRecognitionError(event.error);
        };

        this.recognition.onnomatch = () => {
            this.speak("I didn't quite catch that. Could you please repeat what you said?");
        };
    }

    setupUI() {
        const voicePanel = document.createElement('div');
        voicePanel.id = 'voice-ai-panel';
        voicePanel.className = 'voice-ai-panel';
        voicePanel.innerHTML = `
            <div class="voice-ai-header">
                <h3><i class="fas fa-microphone"></i> Voice AI Therapist</h3>
                <div class="session-info">
                    <span class="session-duration" id="session-duration">00:00</span>
                    <span class="session-status" id="session-status">Ready</span>
                </div>
            </div>
            
            <div class="voice-controls">
                <button id="start-voice-session" class="btn btn-primary voice-btn">
                    <i class="fas fa-microphone"></i>
                    <span>Start Voice Session</span>
                </button>
                <button id="end-voice-session" class="btn btn-danger voice-btn" style="display: none;">
                    <i class="fas fa-stop"></i>
                    <span>End Session</span>
                </button>
                <button id="toggle-voice-listening" class="btn btn-secondary voice-btn" style="display: none;">
                    <i class="fas fa-microphone-slash"></i>
                    <span>Push to Talk</span>
                </button>
            </div>
            
            <div class="voice-visualization">
                <div class="voice-wave-container">
                    <canvas id="voice-wave-canvas" width="400" height="100"></canvas>
                    <div class="voice-level-indicator">
                        <div class="voice-level-bar" id="voice-level-bar"></div>
                    </div>
                </div>
                
                <div class="speech-feedback">
                    <div class="transcription-display" id="transcription-display">
                        <div class="transcription-label">What you're saying:</div>
                        <div class="transcription-text" id="transcription-text">Click "Start Voice Session" to begin...</div>
                    </div>
                    
                    <div class="ai-response-display" id="ai-response-display">
                        <div class="response-label">AI Therapist:</div>
                        <div class="response-text" id="response-text">I'm here and ready to listen. How are you feeling today?</div>
                    </div>
                </div>
            </div>
            
            <div class="voice-settings">
                <h4>Voice Settings</h4>
                <div class="settings-row">
                    <div class="setting-group">
                        <label for="ai-voice-select">AI Voice</label>
                        <select id="ai-voice-select"></select>
                    </div>
                    <div class="setting-group">
                        <label for="speech-rate">Speaking Rate</label>
                        <input type="range" id="speech-rate" min="0.5" max="2" step="0.1" value="0.9">
                        <span id="rate-value">90%</span>
                    </div>
                    <div class="setting-group">
                        <label for="speech-pitch">Voice Pitch</label>
                        <input type="range" id="speech-pitch" min="0.5" max="2" step="0.1" value="1.0">
                        <span id="pitch-value">100%</span>
                    </div>
                </div>
            </div>
            
            <div class="emotion-analysis">
                <h4>Emotional Analysis</h4>
                <div class="emotion-indicators">
                    <div class="emotion-meter">
                        <div class="meter-label">Stress Level</div>
                        <div class="meter-bar">
                            <div class="meter-fill stress-meter" id="stress-meter"></div>
                        </div>
                        <span class="meter-value" id="stress-value">0%</span>
                    </div>
                    <div class="emotion-meter">
                        <div class="meter-label">Emotional Intensity</div>
                        <div class="meter-bar">
                            <div class="meter-fill intensity-meter" id="intensity-meter"></div>
                        </div>
                        <span class="meter-value" id="intensity-value">0%</span>
                    </div>
                    <div class="emotion-meter">
                        <div class="meter-label">Speaking Confidence</div>
                        <div class="meter-bar">
                            <div class="meter-fill confidence-meter" id="confidence-meter"></div>
                        </div>
                        <span class="meter-value" id="confidence-value">0%</span>
                    </div>
                </div>
                
                <div class="detected-emotions" id="detected-emotions">
                    <div class="emotion-tag">😊 Calm</div>
                </div>
            </div>
            
            <div class="session-insights" id="session-insights" style="display: none;">
                <h4>Session Insights</h4>
                <div class="insights-content" id="insights-content"></div>
            </div>
            
            <div class="therapeutic-framework">
                <h4>Therapeutic Approach</h4>
                <select id="therapy-framework">
                    <option value="cbt">Cognitive Behavioral Therapy (CBT)</option>
                    <option value="dbt">Dialectical Behavior Therapy (DBT)</option>
                    <option value="humanistic">Humanistic Therapy</option>
                </select>
            </div>
        `;

        // Add to main content area
        const chatSection = document.querySelector('.chat-section') || document.querySelector('.wellness-tools');
        if (chatSection) {
            chatSection.appendChild(voicePanel);
        } else {
            document.body.appendChild(voicePanel);
        }

        this.populateVoiceSelect();
        this.initializeWaveVisualization();
    }

    populateVoiceSelect() {
        const voiceSelect = document.getElementById('ai-voice-select');
        if (!voiceSelect) return;

        const voices = this.synthesis.getVoices();
        voiceSelect.innerHTML = '';

        // Filter for high-quality, natural-sounding voices
        const preferredVoices = voices.filter(voice =>
            voice.lang.startsWith('en') &&
            (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Alex') || voice.name.includes('Samantha'))
        );

        const voicesToShow = preferredVoices.length > 0 ? preferredVoices : voices.filter(voice => voice.lang.startsWith('en'));

        voicesToShow.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) option.selected = true;
            voiceSelect.appendChild(option);
        });
    }

    selectOptimalVoice() {
        const voices = this.synthesis.getVoices();

        // Prefer calm, professional-sounding voices
        const preferredNames = ['Google UK English Female', 'Microsoft Zira', 'Samantha', 'Alex', 'Google US English'];

        for (const name of preferredNames) {
            const voice = voices.find(v => v.name.includes(name));
            if (voice) {
                this.voiceProfile.voice = voice;
                break;
            }
        }

        // Fallback to first English voice
        if (!this.voiceProfile.voice) {
            this.voiceProfile.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
    }

    initializeWaveVisualization() {
        const canvas = document.getElementById('voice-wave-canvas');
        if (!canvas) return;

        this.waveCtx = canvas.getContext('2d');
        this.animationId = null;

        // Initialize audio context for real-time analysis
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.setupAudioAnalysis();
        }
    }

    async setupAudioAnalysis() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();

            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            source.connect(this.analyser);

            this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeData = new Uint8Array(this.analyser.fftSize);

            this.startWaveVisualization();
        } catch (error) {
            console.warn('⚠️ Audio analysis not available:', error);
        }
    }

    startWaveVisualization() {
        const animate = () => {
            if (!this.isListening) {
                this.animationId = requestAnimationFrame(animate);
                this.drawStaticWave();
                return;
            }

            this.analyser.getByteFrequencyData(this.audioData);
            this.analyser.getByteTimeDomainData(this.timeData);

            this.drawWaveform();
            this.analyzeVoiceCharacteristics();

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    drawWaveform() {
        const canvas = document.getElementById('voice-wave-canvas');
        if (!canvas || !this.waveCtx) return;

        const { width, height } = canvas;

        this.waveCtx.clearRect(0, 0, width, height);

        // Draw frequency visualization
        this.waveCtx.fillStyle = 'rgba(102, 126, 234, 0.6)';

        const barWidth = width / this.audioData.length;
        let x = 0;

        for (let i = 0; i < this.audioData.length; i++) {
            const barHeight = (this.audioData[i] / 255) * height * 0.8;

            this.waveCtx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }

        // Draw waveform
        this.waveCtx.strokeStyle = 'rgba(240, 147, 251, 0.8)';
        this.waveCtx.lineWidth = 2;
        this.waveCtx.beginPath();

        const sliceWidth = width / this.timeData.length;
        x = 0;

        for (let i = 0; i < this.timeData.length; i++) {
            const v = this.timeData[i] / 128.0;
            const y = v * height / 2;

            if (i === 0) {
                this.waveCtx.moveTo(x, y);
            } else {
                this.waveCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.waveCtx.stroke();
    }

    drawStaticWave() {
        const canvas = document.getElementById('voice-wave-canvas');
        if (!canvas || !this.waveCtx) return;

        const { width, height } = canvas;

        this.waveCtx.clearRect(0, 0, width, height);

        // Draw static baseline
        this.waveCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.waveCtx.lineWidth = 1;
        this.waveCtx.beginPath();
        this.waveCtx.moveTo(0, height / 2);
        this.waveCtx.lineTo(width, height / 2);
        this.waveCtx.stroke();

        // Add subtle pulse animation
        const time = Date.now() * 0.002;
        const pulse = Math.sin(time) * 0.3 + 0.7;

        this.waveCtx.strokeStyle = `rgba(102, 126, 234, ${pulse * 0.5})`;
        this.waveCtx.lineWidth = 2;
        this.waveCtx.beginPath();
        this.waveCtx.moveTo(0, height / 2);
        this.waveCtx.lineTo(width, height / 2);
        this.waveCtx.stroke();
    }

    analyzeVoiceCharacteristics() {
        if (!this.audioData || !this.timeData) return;

        // Calculate volume level
        const volume = this.audioData.reduce((sum, value) => sum + value, 0) / this.audioData.length;
        const volumePercent = Math.round((volume / 255) * 100);

        // Update voice level indicator
        const levelBar = document.getElementById('voice-level-bar');
        if (levelBar) {
            levelBar.style.width = `${volumePercent}%`;
        }

        // Analyze emotional characteristics
        this.analyzeEmotionalState(volume, this.audioData, this.timeData);
    }

    analyzeEmotionalState(volume, frequencyData, timeData) {
        // Simple emotional analysis based on voice characteristics
        const avgFrequency = frequencyData.reduce((sum, val) => sum + val, 0) / frequencyData.length;
        const variability = this.calculateVariability(timeData);

        // Estimate stress level (higher frequencies + higher variability = more stress)
        const stressLevel = Math.min(100, ((avgFrequency / 128) + (variability / 128)) * 50);

        // Estimate emotional intensity (volume + frequency range)
        const intensity = Math.min(100, (volume / 128 + avgFrequency / 128) * 50);

        // Estimate confidence (consistent volume + moderate frequency)
        const volumeConsistency = 100 - (this.calculateVariability(frequencyData) / 255 * 100);
        const confidence = Math.max(0, volumeConsistency);

        this.updateEmotionMeters(stressLevel, intensity, confidence);
        this.updateEmotionTags(stressLevel, intensity, volume);
    }

    calculateVariability(data) {
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        return Math.sqrt(variance);
    }

    updateEmotionMeters(stress, intensity, confidence) {
        const updateMeter = (id, value) => {
            const meter = document.getElementById(id);
            const valueSpan = document.getElementById(id.replace('-meter', '-value'));
            if (meter && valueSpan) {
                meter.style.width = `${value}%`;
                valueSpan.textContent = `${Math.round(value)}%`;
            }
        };

        updateMeter('stress-meter', stress);
        updateMeter('intensity-meter', intensity);
        updateMeter('confidence-meter', confidence);
    }

    updateEmotionTags(stress, intensity, volume) {
        const emotionsContainer = document.getElementById('detected-emotions');
        if (!emotionsContainer) return;

        const emotions = [];

        if (stress > 70) emotions.push('😰 Anxious');
        else if (stress > 40) emotions.push('😐 Tense');
        else emotions.push('😊 Calm');

        if (intensity > 60) emotions.push('🔥 Intense');
        else if (intensity < 20) emotions.push('😴 Low Energy');

        if (volume > 100) emotions.push('📢 Loud');
        else if (volume < 30) emotions.push('🤫 Quiet');

        emotionsContainer.innerHTML = emotions.map(emotion =>
            `<div class="emotion-tag">${emotion}</div>`
        ).join('');
    }

    setupEventListeners() {
        // Start voice session
        const startBtn = document.getElementById('start-voice-session');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startVoiceSession());
        }

        // End voice session
        const endBtn = document.getElementById('end-voice-session');
        if (endBtn) {
            endBtn.addEventListener('click', () => this.endVoiceSession());
        }

        // Toggle listening
        const toggleBtn = document.getElementById('toggle-voice-listening');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleListening());
        }

        // Voice settings
        const voiceSelect = document.getElementById('ai-voice-select');
        const rateSlider = document.getElementById('speech-rate');
        const pitchSlider = document.getElementById('speech-pitch');

        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                const voices = this.synthesis.getVoices();
                this.voiceProfile.voice = voices[e.target.value];
            });
        }

        if (rateSlider) {
            rateSlider.addEventListener('input', (e) => {
                this.voiceProfile.rate = parseFloat(e.target.value);
                document.getElementById('rate-value').textContent = `${Math.round(e.target.value * 100)}%`;
            });
        }

        if (pitchSlider) {
            pitchSlider.addEventListener('input', (e) => {
                this.voiceProfile.pitch = parseFloat(e.target.value);
                document.getElementById('pitch-value').textContent = `${Math.round(e.target.value * 100)}%`;
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return;

            if (e.code === 'Space' && e.ctrlKey) {
                e.preventDefault();
                this.toggleListening();
            }
        });
    }

    startVoiceSession() {
        this.sessionData.startTime = Date.now();

        // Update UI
        document.getElementById('start-voice-session').style.display = 'none';
        document.getElementById('end-voice-session').style.display = 'block';
        document.getElementById('toggle-voice-listening').style.display = 'block';
        document.getElementById('session-status').textContent = 'Active';

        // Start session timer
        this.sessionTimer = setInterval(() => {
            const duration = Date.now() - this.sessionData.startTime;
            const minutes = Math.floor(duration / 60000);
            const seconds = Math.floor((duration % 60000) / 1000);
            document.getElementById('session-duration').textContent =
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);

        // Start listening
        this.startListening();

        // Welcome message
        this.speak("Hello, I'm your AI therapy assistant. I'm here to listen and support you. How are you feeling today?");

        console.log('🎤 Voice therapy session started');
    }

    endVoiceSession() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }

        // Stop listening
        this.stopListening();

        // Update UI
        document.getElementById('start-voice-session').style.display = 'block';
        document.getElementById('end-voice-session').style.display = 'none';
        document.getElementById('toggle-voice-listening').style.display = 'none';
        document.getElementById('session-status').textContent = 'Ended';

        // Generate session insights
        this.generateSessionInsights();

        // Closing message
        this.speak("Thank you for sharing with me today. Remember, taking care of your mental health is a sign of strength. I'm here whenever you need support.");

        console.log('👋 Voice therapy session ended');
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.warn('⚠️ Could not start speech recognition:', error);
            }
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    handleSpeechResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;

            if (event.results[i].isFinal) {
                finalTranscript += transcript;
                this.processUserSpeech(transcript, confidence);
            } else {
                interimTranscript += transcript;
            }
        }

        // Update transcription display
        const transcriptionText = document.getElementById('transcription-text');
        if (transcriptionText) {
            transcriptionText.textContent = finalTranscript + interimTranscript;
        }
    }

    processUserSpeech(transcript, confidence) {
        // Add to conversation history
        this.conversationHistory.push({
            type: 'user',
            content: transcript,
            timestamp: Date.now(),
            confidence: confidence || 0.8
        });

        // Analyze speech for emotional content
        const emotionalAnalysis = this.analyzeTextEmotion(transcript);

        // Generate therapeutic response
        const response = this.generateTherapeuticResponse(transcript, emotionalAnalysis);

        // Speak the response
        this.speak(response);

        // Add to conversation history
        this.conversationHistory.push({
            type: 'ai',
            content: response,
            timestamp: Date.now(),
            framework: document.getElementById('therapy-framework')?.value || 'cbt'
        });

        // Update UI
        this.updateResponseDisplay(response);

        // Track emotional journey
        this.sessionData.emotionalJourney.push({
            timestamp: Date.now(),
            userEmotion: emotionalAnalysis.primaryEmotion,
            intensity: emotionalAnalysis.intensity,
            content: transcript.substring(0, 100)
        });
    }

    analyzeTextEmotion(text) {
        const lowerText = text.toLowerCase();

        // Emotion keywords
        const emotionKeywords = {
            sadness: ['sad', 'depressed', 'down', 'low', 'crying', 'tears', 'hopeless', 'empty'],
            anxiety: ['anxious', 'worried', 'nervous', 'panic', 'scared', 'afraid', 'overwhelmed', 'stress'],
            anger: ['angry', 'mad', 'furious', 'rage', 'hate', 'frustrated', 'annoyed', 'irritated'],
            happiness: ['happy', 'joy', 'excited', 'glad', 'pleased', 'good', 'great', 'wonderful'],
            fear: ['afraid', 'scared', 'terrified', 'frightened', 'fearful', 'worried', 'concerned'],
            guilt: ['guilty', 'shame', 'regret', 'sorry', 'fault', 'bad', 'wrong', 'terrible']
        };

        // Intensity indicators
        const intensityKeywords = {
            high: ['very', 'extremely', 'really', 'so', 'totally', 'completely', 'absolutely'],
            low: ['a little', 'somewhat', 'kind of', 'sort of', 'maybe', 'slightly']
        };

        let primaryEmotion = 'neutral';
        let maxScore = 0;
        let intensity = 'medium';

        // Score emotions
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            const score = keywords.reduce((count, keyword) => {
                return count + (lowerText.includes(keyword) ? 1 : 0);
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                primaryEmotion = emotion;
            }
        }

        // Determine intensity
        const hasHighIntensity = intensityKeywords.high.some(word => lowerText.includes(word));
        const hasLowIntensity = intensityKeywords.low.some(word => lowerText.includes(word));

        if (hasHighIntensity) intensity = 'high';
        else if (hasLowIntensity) intensity = 'low';

        return {
            primaryEmotion,
            intensity,
            confidence: maxScore > 0 ? Math.min(1, maxScore / 3) : 0.3
        };
    }

    generateTherapeuticResponse(userInput, emotionalAnalysis) {
        const framework = document.getElementById('therapy-framework')?.value || 'cbt';
        const therapeuticApproach = this.therapeuticFrameworks[framework];

        if (!therapeuticApproach) {
            return this.generateGenericResponse(userInput, emotionalAnalysis);
        }

        // Select appropriate response based on emotion and framework
        let responseCategory = 'general';

        if (['sadness', 'anxiety', 'fear'].includes(emotionalAnalysis.primaryEmotion)) {
            responseCategory = framework === 'cbt' ? 'negative_thought' :
                framework === 'dbt' ? 'intense_emotion' : 'self_discovery';
        } else if (emotionalAnalysis.primaryEmotion === 'anger') {
            responseCategory = framework === 'dbt' ? 'intense_emotion' : 'negative_thought';
        } else if (emotionalAnalysis.primaryEmotion === 'happiness') {
            responseCategory = 'personal_growth';
        }

        const responses = therapeuticApproach.responses[responseCategory] ||
            therapeuticApproach.responses[Object.keys(therapeuticApproach.responses)[0]];

        let response = responses[Math.floor(Math.random() * responses.length)];

        // Add emotional validation
        if (emotionalAnalysis.intensity === 'high') {
            response = `I can really hear the intensity of what you're experiencing. ${response}`;
        }

        // Add personalization based on conversation history
        if (this.conversationHistory.length > 4) {
            response = this.personalizeResponse(response, userInput);
        }

        return response;
    }

    personalizeResponse(response, userInput) {
        // Simple personalization based on conversation patterns
        const recentHistory = this.conversationHistory.slice(-6).filter(entry => entry.type === 'user');

        if (recentHistory.length > 2) {
            const commonThemes = this.identifyCommonThemes(recentHistory.map(entry => entry.content));

            if (commonThemes.includes('work')) {
                response += " It sounds like work has been on your mind quite a bit.";
            } else if (commonThemes.includes('relationship')) {
                response += " I notice relationships seem to be important to you.";
            } else if (commonThemes.includes('family')) {
                response += " Family seems to play a significant role in what you're experiencing.";
            }
        }

        return response;
    }

    identifyCommonThemes(texts) {
        const themeKeywords = {
            work: ['work', 'job', 'boss', 'colleague', 'office', 'career', 'project'],
            relationship: ['partner', 'boyfriend', 'girlfriend', 'spouse', 'husband', 'wife', 'relationship'],
            family: ['family', 'mother', 'father', 'parent', 'sister', 'brother', 'child', 'kids']
        };

        const themes = [];
        const combinedText = texts.join(' ').toLowerCase();

        for (const [theme, keywords] of Object.entries(themeKeywords)) {
            const count = keywords.reduce((sum, keyword) => {
                return sum + (combinedText.split(keyword).length - 1);
            }, 0);

            if (count >= 2) themes.push(theme);
        }

        return themes;
    }

    generateGenericResponse(userInput, emotionalAnalysis) {
        const responses = [
            "Thank you for sharing that with me. Can you tell me more about how that makes you feel?",
            "I hear you. What thoughts go through your mind when you experience this?",
            "That sounds important. How long have you been feeling this way?",
            "I appreciate your openness. What would be helpful for you right now?",
            "It takes courage to share these feelings. What support do you have in your life?"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    speak(text) {
        if (this.isSpeaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voiceProfile.voice;
        utterance.rate = this.voiceProfile.rate;
        utterance.pitch = this.voiceProfile.pitch;
        utterance.volume = this.voiceProfile.volume;

        utterance.onstart = () => {
            this.isSpeaking = true;
        };

        utterance.onend = () => {
            this.isSpeaking = false;
        };

        utterance.onerror = (event) => {
            console.error('🔊 Speech synthesis error:', event.error);
            this.isSpeaking = false;
        };

        this.synthesis.speak(utterance);
    }

    updateListeningUI(isListening) {
        const toggleBtn = document.getElementById('toggle-voice-listening');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            const span = toggleBtn.querySelector('span');

            if (isListening) {
                icon.className = 'fas fa-microphone';
                span.textContent = 'Listening...';
                toggleBtn.className = 'btn btn-success voice-btn';
            } else {
                icon.className = 'fas fa-microphone-slash';
                span.textContent = 'Push to Talk';
                toggleBtn.className = 'btn btn-secondary voice-btn';
            }
        }
    }

    updateResponseDisplay(response) {
        const responseText = document.getElementById('response-text');
        if (responseText) {
            responseText.textContent = response;
        }
    }

    handleRecognitionError(error) {
        const errorMessages = {
            'no-speech': "I didn't hear anything. Please try speaking again.",
            'audio-capture': "I couldn't access your microphone. Please check your audio settings.",
            'not-allowed': "Microphone access was denied. Please allow microphone access to use voice features.",
            'network': "There was a network error. Please check your internet connection."
        };

        const message = errorMessages[error] || "There was an error with speech recognition. Please try again.";
        this.speak(message);

        this.updateResponseDisplay(message);
    }

    generateSessionInsights() {
        const insights = document.getElementById('session-insights');
        const content = document.getElementById('insights-content');

        if (!insights || !content) return;

        const duration = Date.now() - this.sessionData.startTime;
        const minutes = Math.floor(duration / 60000);

        // Analyze emotional journey
        const emotions = this.sessionData.emotionalJourney.map(entry => entry.userEmotion);
        const emotionCounts = emotions.reduce((acc, emotion) => {
            acc[emotion] = (acc[emotion] || 0) + 1;
            return acc;
        }, {});

        const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
            emotionCounts[a] > emotionCounts[b] ? a : b
        );

        // Generate insights
        const insightsHTML = `
            <div class="insight-item">
                <h5>Session Duration</h5>
                <p>${minutes} minutes of meaningful conversation</p>
            </div>
            <div class="insight-item">
                <h5>Emotional Journey</h5>
                <p>Primary emotion explored: ${dominantEmotion}</p>
                <p>Emotional range: ${Object.keys(emotionCounts).join(', ')}</p>
            </div>
            <div class="insight-item">
                <h5>Key Observations</h5>
                <p>You showed courage in expressing your feelings and engaging in self-reflection.</p>
            </div>
            <div class="insight-item">
                <h5>Recommendations</h5>
                <p>Continue practicing self-awareness and consider regular check-ins with yourself.</p>
            </div>
        `;

        content.innerHTML = insightsHTML;
        insights.style.display = 'block';
    }

    showFallbackMessage() {
        const panel = document.getElementById('voice-ai-panel');
        if (panel) {
            panel.innerHTML = `
                <div class="voice-ai-header">
                    <h3><i class="fas fa-microphone"></i> Voice AI Therapist</h3>
                </div>
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    Voice features require a modern browser with microphone access. 
                    Text-based chat is still available.
                </div>
            `;
        }
    }
}

// Initialize Voice AI Therapist when page loads
document.addEventListener('DOMContentLoaded', () => {
    const voiceAI = new VoiceAITherapist();
    window.voiceAI = voiceAI;

    console.log('🎤 Voice AI Therapist loaded');
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoiceAITherapist };
}