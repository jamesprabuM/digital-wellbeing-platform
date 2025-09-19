// ===== AI CHATBOT FOR MENTAL HEALTH SUPPORT =====

class MentalHealthChatbot {
    constructor() {
        this.container = document.getElementById('chatbot-container');
        this.toggle = document.getElementById('chatbot-toggle');
        this.messages = document.getElementById('chatbot-messages');
        this.input = document.getElementById('chatbot-input-field');
        this.sendBtn = document.getElementById('chatbot-send');
        this.notification = document.getElementById('chatbot-notification');

        this.isOpen = false;
        this.conversationHistory = [];
        this.currentContext = 'general';
        this.userProfile = {
            name: null,
            preferences: {},
            riskLevel: 'low'
        };

        // Crisis keywords that trigger immediate support
        this.crisisKeywords = [
            'suicide', 'kill myself', 'end it all', 'not worth living', 'harm myself',
            'hurt myself', 'die', 'death', 'overdose', 'cutting', 'self-harm'
        ];

        // Mental health topics and responses
        this.mentalHealthTopics = {
            anxiety: {
                keywords: ['anxious', 'anxiety', 'panic', 'worried', 'stress', 'nervous', 'overwhelmed'],
                responses: [
                    "I understand you're feeling anxious. Anxiety is very common and treatable. Have you tried any breathing exercises?",
                    "Anxiety can feel overwhelming, but there are effective ways to manage it. Would you like to try a quick grounding technique?",
                    "I hear that you're struggling with anxiety. Let's explore some coping strategies that might help you feel more grounded."
                ],
                suggestions: [
                    "Try the 4-7-8 breathing technique",
                    "Practice the 5-4-3-2-1 grounding method",
                    "Consider progressive muscle relaxation",
                    "Explore mindfulness meditation"
                ]
            },
            depression: {
                keywords: ['depressed', 'depression', 'sad', 'hopeless', 'empty', 'worthless', 'lonely'],
                responses: [
                    "I'm sorry you're feeling this way. Depression is a real and treatable condition. You're not alone in this.",
                    "Thank you for sharing that with me. Depression can make everything feel difficult, but there is hope and help available.",
                    "I hear that you're going through a tough time. It takes courage to reach out, and I'm here to support you."
                ],
                suggestions: [
                    "Connect with a mental health professional",
                    "Try gentle physical activity",
                    "Practice self-compassion",
                    "Consider joining a support group"
                ]
            },
            stress: {
                keywords: ['stressed', 'stress', 'pressure', 'overwhelmed', 'burden', 'exhausted'],
                responses: [
                    "Stress can really impact our daily lives. Let's work together to find some strategies that might help you cope.",
                    "It sounds like you're dealing with a lot right now. Stress management techniques can make a real difference.",
                    "I understand you're feeling stressed. There are many effective ways to reduce stress and build resilience."
                ],
                suggestions: [
                    "Try time management techniques",
                    "Practice stress-reduction breathing",
                    "Set healthy boundaries",
                    "Prioritize self-care activities"
                ]
            },
            sleep: {
                keywords: ['sleep', 'insomnia', 'tired', 'exhausted', 'can\'t sleep', 'sleepless'],
                responses: [
                    "Sleep issues can really affect your wellbeing. Good sleep hygiene can make a significant difference.",
                    "I understand sleep problems can be frustrating. There are evidence-based strategies that can help improve your sleep.",
                    "Sleep is crucial for mental health. Let's explore some techniques that might help you get better rest."
                ],
                suggestions: [
                    "Establish a consistent bedtime routine",
                    "Try sleep hygiene practices",
                    "Limit screen time before bed",
                    "Consider relaxation techniques"
                ]
            }
        };

        // Professional resources
        this.resources = {
            crisis: {
                title: "Crisis Support",
                options: [
                    { name: "National Suicide Prevention Lifeline", contact: "988", description: "24/7 crisis support" },
                    { name: "Crisis Text Line", contact: "Text HOME to 741741", description: "24/7 text-based support" },
                    { name: "Emergency Services", contact: "911", description: "For immediate danger" }
                ]
            },
            therapy: {
                title: "Professional Therapy",
                options: [
                    { name: "Psychology Today", url: "psychologytoday.com", description: "Find local therapists" },
                    { name: "BetterHelp", url: "betterhelp.com", description: "Online therapy platform" },
                    { name: "SAMHSA Treatment Locator", url: "findtreatment.samhsa.gov", description: "Find treatment facilities" }
                ]
            },
            support: {
                title: "Support Groups",
                options: [
                    { name: "NAMI Support Groups", description: "Peer support for mental health" },
                    { name: "Mental Health America", description: "Local support resources" },
                    { name: "Anxiety and Depression Association", description: "Specialized support groups" }
                ]
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadConversationHistory();
        this.setupAutoResponder();
    }

    setupEventListeners() {
        // Toggle chatbot
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleChatbot());
        }

        // Close chatbot
        const closeBtn = this.container?.querySelector('.chatbot-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Send message
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Enter key to send
        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Quick replies
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-reply')) {
                const message = e.target.textContent;
                this.processUserMessage(message);
                e.target.parentElement.remove();
            }
        });
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.container) {
            this.container.classList.add('active');
            this.container.setAttribute('aria-hidden', 'false');
            this.isOpen = true;

            // Hide notification
            if (this.notification) {
                this.notification.style.display = 'none';
            }

            // Focus input
            setTimeout(() => {
                if (this.input) {
                    this.input.focus();
                }
            }, 100);

            // Show welcome message if first time
            if (this.conversationHistory.length === 0) {
                this.showWelcomeMessage();
            }
        }
    }

    close() {
        if (this.container) {
            this.container.classList.remove('active');
            this.container.setAttribute('aria-hidden', 'true');
            this.isOpen = false;
        }
    }

    sendMessage() {
        const message = this.input?.value.trim();
        if (!message) return;

        // Clear input
        if (this.input) {
            this.input.value = '';
        }

        this.processUserMessage(message);
    }

    processUserMessage(message) {
        // Add user message to chat
        this.addMessage(message, 'user');

        // Store in conversation history
        this.conversationHistory.push({
            type: 'user',
            message,
            timestamp: Date.now()
        });

        // Check for crisis situations
        if (this.detectCrisis(message)) {
            this.handleCrisisResponse();
            return;
        }

        // Analyze message and respond
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response.message, 'bot');

            if (response.suggestions) {
                this.addSuggestions(response.suggestions);
            }

            if (response.resources) {
                this.addResources(response.resources);
            }

            // Store bot response
            this.conversationHistory.push({
                type: 'bot',
                message: response.message,
                timestamp: Date.now()
            });

            this.saveConversationHistory();
        }, 1000 + Math.random() * 1000); // Simulate thinking time
    }

    detectCrisis(message) {
        const lowerMessage = message.toLowerCase();
        return this.crisisKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    handleCrisisResponse() {
        const crisisMessage = `
            I'm very concerned about what you've shared. Your safety is the most important thing right now. 
            Please reach out to a crisis helpline immediately:
            
            🆘 **National Suicide Prevention Lifeline: 988**
            📱 **Crisis Text Line: Text HOME to 741741**
            🚨 **Emergency Services: 911**
            
            You don't have to go through this alone. There are people who want to help you right now.
        `;

        this.addMessage(crisisMessage, 'bot', true);

        // Mark as high risk
        this.userProfile.riskLevel = 'high';

        // Add crisis resources
        this.addResources(this.resources.crisis);

        // Notify if possible (in real app, would alert human moderator)
        console.warn('Crisis situation detected - user needs immediate support');
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Detect topic
        const detectedTopic = this.detectTopic(lowerMessage);

        if (detectedTopic) {
            const topic = this.mentalHealthTopics[detectedTopic];
            const response = topic.responses[Math.floor(Math.random() * topic.responses.length)];

            return {
                message: response,
                suggestions: topic.suggestions,
                resources: detectedTopic === 'depression' ? this.resources.therapy : null
            };
        }

        // General responses
        const generalResponses = [
            "Thank you for sharing that with me. Can you tell me more about how you're feeling?",
            "I hear you. It's important to acknowledge what you're going through. What would be most helpful for you right now?",
            "I appreciate you opening up. Mental health is just as important as physical health. How can I best support you today?",
            "That sounds challenging. Remember that seeking help is a sign of strength, not weakness. What kind of support are you looking for?"
        ];

        // Personalized responses based on conversation history
        if (this.conversationHistory.length > 2) {
            const personalizedResponses = [
                "I notice we've been talking for a bit. How are you feeling about our conversation so far?",
                "You've shared some important things with me. Is there anything specific you'd like to work on today?",
                "I'm here to listen and support you. What's the most pressing thing on your mind right now?"
            ];

            return {
                message: personalizedResponses[Math.floor(Math.random() * personalizedResponses.length)],
                suggestions: [
                    "Explore coping strategies",
                    "Learn about mental health resources",
                    "Practice mindfulness techniques",
                    "Connect with professional support"
                ]
            };
        }

        return {
            message: generalResponses[Math.floor(Math.random() * generalResponses.length)]
        };
    }

    detectTopic(message) {
        for (const [topic, data] of Object.entries(this.mentalHealthTopics)) {
            if (data.keywords.some(keyword => message.includes(keyword))) {
                return topic;
            }
        }
        return null;
    }

    addMessage(message, sender, isUrgent = false) {
        if (!this.messages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.setAttribute('role', 'listitem');

        if (isUrgent) {
            messageElement.classList.add('urgent-message');
            messageElement.setAttribute('aria-live', 'assertive');
        } else {
            messageElement.setAttribute('aria-live', 'polite');
        }

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user'
            ? '<i class="fas fa-user"></i>'
            : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        // Format message with markdown-like styling
        const formattedMessage = this.formatMessage(message);
        content.innerHTML = `<p>${formattedMessage}</p>`;

        messageElement.appendChild(avatar);
        messageElement.appendChild(content);

        this.messages.appendChild(messageElement);
        this.scrollToBottom();
    }

    formatMessage(message) {
        // Simple formatting for emphasis and structure
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/🆘|📱|🚨/g, '<span style="font-size: 1.2em;">$&</span>')
            .replace(/\n/g, '<br>');
    }

    addSuggestions(suggestions) {
        if (!this.messages || !suggestions) return;

        const suggestionsElement = document.createElement('div');
        suggestionsElement.className = 'message bot-message';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        const quickReplies = document.createElement('div');
        quickReplies.className = 'quick-replies';

        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'quick-reply';
            button.textContent = suggestion;
            button.onclick = () => this.sendQuickReply(suggestion);
            quickReplies.appendChild(button);
        });

        content.appendChild(quickReplies);
        suggestionsElement.appendChild(avatar);
        suggestionsElement.appendChild(content);

        this.messages.appendChild(suggestionsElement);
        this.scrollToBottom();
    }

    addResources(resources) {
        if (!this.messages || !resources) return;

        const resourcesElement = document.createElement('div');
        resourcesElement.className = 'message bot-message resources-message';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-info-circle"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';

        let resourcesHTML = `<h4>${resources.title}</h4><div class="resources-list">`;

        resources.options.forEach(option => {
            resourcesHTML += `
                <div class="resource-item">
                    <strong>${option.name}</strong>
                    ${option.contact ? `<br><span class="contact">${option.contact}</span>` : ''}
                    ${option.url ? `<br><a href="https://${option.url}" target="_blank" rel="noopener">${option.url}</a>` : ''}
                    <br><small>${option.description}</small>
                </div>
            `;
        });

        resourcesHTML += '</div>';
        content.innerHTML = resourcesHTML;

        resourcesElement.appendChild(avatar);
        resourcesElement.appendChild(content);

        this.messages.appendChild(resourcesElement);
        this.scrollToBottom();
    }

    sendQuickReply(reply) {
        this.processUserMessage(reply);
    }

    scrollToBottom() {
        if (this.messages) {
            this.messages.scrollTop = this.messages.scrollHeight;
        }
    }

    showWelcomeMessage() {
        const welcomeMessage = `
            Hello! I'm MindBot, your AI wellness companion. I'm here to provide support, 
            resources, and guidance for your mental health journey.
            
            I can help with:
            • Anxiety and stress management
            • Depression support and resources
            • Sleep and wellness tips
            • Crisis support and professional resources
            
            **Important:** I'm not a replacement for professional mental health care. 
            If you're in crisis, please contact emergency services or call 988.
            
            How are you feeling today?
        `;

        this.addMessage(welcomeMessage, 'bot');

        // Add initial quick replies
        const initialSuggestions = [
            "I'm feeling anxious",
            "I need help with sleep",
            "I'm feeling depressed",
            "I need crisis support"
        ];

        this.addSuggestions(initialSuggestions);
    }

    setupAutoResponder() {
        // Show notification periodically if chatbot is closed
        setInterval(() => {
            if (!this.isOpen && this.notification) {
                const messages = [
                    "How are you feeling today?",
                    "I'm here if you need support 💙",
                    "Remember to take care of yourself",
                    "Want to chat about wellness?"
                ];

                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                this.showNotification(randomMessage);
            }
        }, 300000); // Every 5 minutes
    }

    showNotification(message) {
        if (this.notification) {
            this.notification.style.display = 'flex';
            this.notification.textContent = '1';

            // Hide after 10 seconds
            setTimeout(() => {
                if (this.notification && !this.isOpen) {
                    this.notification.style.display = 'none';
                }
            }, 10000);
        }
    }

    saveConversationHistory() {
        // Keep only last 50 messages for privacy
        const recentHistory = this.conversationHistory.slice(-50);
        Utils.storage.set('chatbotHistory', recentHistory);
    }

    loadConversationHistory() {
        const saved = Utils.storage.get('chatbotHistory');
        if (saved && saved.length > 0) {
            this.conversationHistory = saved;

            // Restore recent messages (last 10)
            const recentMessages = saved.slice(-10);
            recentMessages.forEach(msg => {
                if (msg.type === 'user') {
                    this.addMessage(msg.message, 'user');
                } else {
                    this.addMessage(msg.message, 'bot');
                }
            });
        }
    }

    // Public methods for external use
    simulateUserMessage(message) {
        this.processUserMessage(message);
    }

    clearConversation() {
        if (this.messages) {
            this.messages.innerHTML = '';
        }
        this.conversationHistory = [];
        Utils.storage.remove('chatbotHistory');
        this.showWelcomeMessage();
    }
}

// ===== CRISIS INTERVENTION SYSTEM =====
class CrisisInterventionSystem {
    constructor() {
        this.alertLevel = 'normal';
        this.interventionHistory = [];
        this.resources = {
            immediate: [
                { name: "Emergency Services", number: "911", description: "For immediate danger" },
                { name: "National Suicide Prevention Lifeline", number: "988", description: "24/7 suicide prevention" },
                { name: "Crisis Text Line", number: "741741", description: "Text HOME for crisis support" }
            ],
            professional: [
                { name: "SAMHSA Helpline", number: "1-800-662-4357", description: "Treatment referral service" },
                { name: "NAMI Helpline", number: "1-800-950-6264", description: "Information and support" }
            ]
        };
    }

    assessRisk(message, conversationHistory) {
        const riskFactors = {
            high: ['suicide', 'kill myself', 'end it all', 'not worth living', 'want to die'],
            medium: ['hopeless', 'worthless', 'burden', 'painful', 'escape'],
            low: ['sad', 'difficult', 'hard', 'struggling']
        };

        const lowerMessage = message.toLowerCase();

        for (const [level, keywords] of Object.entries(riskFactors)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return level;
            }
        }

        return 'normal';
    }

    triggerIntervention(riskLevel, userMessage) {
        const intervention = {
            id: Utils.generateId(),
            riskLevel,
            message: userMessage,
            timestamp: Date.now(),
            actions: []
        };

        switch (riskLevel) {
            case 'high':
                intervention.actions = this.handleHighRisk();
                break;
            case 'medium':
                intervention.actions = this.handleMediumRisk();
                break;
            default:
                intervention.actions = this.handleLowRisk();
        }

        this.interventionHistory.push(intervention);
        return intervention;
    }

    handleHighRisk() {
        return [
            'display_crisis_resources',
            'encourage_immediate_help',
            'provide_safety_planning',
            'log_high_risk_event'
        ];
    }

    handleMediumRisk() {
        return [
            'display_support_resources',
            'suggest_professional_help',
            'provide_coping_strategies',
            'monitor_conversation'
        ];
    }

    handleLowRisk() {
        return [
            'provide_emotional_support',
            'suggest_self_care',
            'offer_resources'
        ];
    }
}

// ===== WELLNESS CONTENT PROVIDER =====
class WellnessContentProvider {
    constructor() {
        this.content = {
            anxietyTips: [
                "Practice deep breathing exercises",
                "Try the 5-4-3-2-1 grounding technique",
                "Challenge negative thoughts",
                "Engage in regular physical activity",
                "Limit caffeine and alcohol"
            ],
            depressionSupport: [
                "Maintain a daily routine",
                "Stay connected with supportive people",
                "Engage in enjoyable activities",
                "Practice self-compassion",
                "Consider professional therapy"
            ],
            stressManagement: [
                "Practice time management",
                "Set realistic goals",
                "Learn to say no",
                "Take regular breaks",
                "Use relaxation techniques"
            ],
            sleepHygiene: [
                "Keep a consistent sleep schedule",
                "Create a relaxing bedtime routine",
                "Limit screen time before bed",
                "Keep bedroom cool and dark",
                "Avoid caffeine late in the day"
            ]
        };
    }

    getContentForTopic(topic) {
        return this.content[topic] || [];
    }

    getRandomTip(category) {
        const tips = this.content[category];
        if (!tips || tips.length === 0) return null;

        return tips[Math.floor(Math.random() * tips.length)];
    }
}

// ===== GLOBAL FUNCTIONS =====
window.toggleChatbot = () => {
    if (window.chatbot) {
        window.chatbot.toggleChatbot();
    }
};

window.openChatbot = () => {
    if (window.chatbot) {
        window.chatbot.open();
    }
};

window.closeChatbot = () => {
    if (window.chatbot) {
        window.chatbot.close();
    }
};

window.sendQuickReply = (message) => {
    if (window.chatbot) {
        window.chatbot.sendQuickReply(message);
    }
};

window.sendMessage = () => {
    if (window.chatbot) {
        window.chatbot.sendMessage();
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chatbot system
    window.chatbot = new MentalHealthChatbot();
    window.crisisSystem = new CrisisInterventionSystem();
    window.wellnessContent = new WellnessContentProvider();

    // Show initial notification after delay
    setTimeout(() => {
        if (window.chatbot && window.chatbot.notification) {
            window.chatbot.showNotification("Hi! I'm here if you need support 💙");
        }
    }, 5000);

    console.log('🤖 Mental Health Chatbot Initialized Successfully!');
});