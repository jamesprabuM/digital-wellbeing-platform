// ===== AI DREAM JOURNAL ANALYSIS =====
// NLP-powered dream analysis for mental health insights

class DreamJournalAnalyzer {
    constructor() {
        this.dreams = [];
        this.analysisHistory = [];
        this.model = null; // Placeholder for NLP model
        this.symbolDictionary = this.loadSymbolDictionary();
        this.initUI();
    }

    initUI() {
        // Add Dream Journal UI to wellness tools or dashboard
        const section = document.querySelector('.wellness-tools') || document.querySelector('.dashboard') || document.body;
        const panel = document.createElement('div');
        panel.className = 'dream-journal-panel';
        panel.innerHTML = `
            <h3><i class="fas fa-moon"></i> AI Dream Journal</h3>
            <div class="dream-journal-input">
                <textarea id="dream-entry" placeholder="Describe your dream..."></textarea>
                <button id="analyze-dream" class="btn btn-primary">Analyze Dream</button>
            </div>
            <div id="dream-analysis-result" class="dream-analysis-result"></div>
            <div class="dream-history">
                <h4>Dream History</h4>
                <ul id="dream-history-list"></ul>
            </div>
        `;
        section.appendChild(panel);
        document.getElementById('analyze-dream').onclick = () => this.analyzeCurrentDream();
        this.updateDreamHistory();
    }

    analyzeCurrentDream() {
        const entry = document.getElementById('dream-entry').value.trim();
        if (!entry) return;
        const analysis = this.analyzeDream(entry);
        this.dreams.push({ entry, analysis, date: new Date().toLocaleDateString() });
        this.analysisHistory.push(analysis);
        this.showAnalysisResult(analysis);
        this.updateDreamHistory();
        document.getElementById('dream-entry').value = '';
    }

    analyzeDream(text) {
        // Basic NLP: sentiment, keyword, and symbol extraction
        const sentiment = this.analyzeSentiment(text);
        const symbols = this.extractSymbols(text);
        const summary = this.generateSummary(text, sentiment, symbols);
        return { sentiment, symbols, summary };
    }

    analyzeSentiment(text) {
        // Simple sentiment analysis (positive/negative/neutral)
        const positiveWords = ['happy', 'joy', 'love', 'peace', 'safe', 'excited', 'hope', 'beautiful', 'calm', 'fun'];
        const negativeWords = ['fear', 'sad', 'angry', 'lost', 'trapped', 'cry', 'pain', 'danger', 'alone', 'nightmare'];
        let score = 0;
        const words = text.toLowerCase().split(/\W+/);
        words.forEach(word => {
            if (positiveWords.includes(word)) score++;
            if (negativeWords.includes(word)) score--;
        });
        if (score > 1) return 'positive';
        if (score < -1) return 'negative';
        return 'neutral';
    }

    extractSymbols(text) {
        // Extract known dream symbols
        const found = [];
        for (const symbol in this.symbolDictionary) {
            if (text.toLowerCase().includes(symbol)) {
                found.push({
                    symbol,
                    meaning: this.symbolDictionary[symbol]
                });
            }
        }
        return found;
    }

    generateSummary(text, sentiment, symbols) {
        let summary = `Sentiment: <strong>${sentiment}</strong>.<br>`;
        if (symbols.length > 0) {
            summary += 'Symbols detected:<ul>';
            symbols.forEach(s => {
                summary += `<li><strong>${s.symbol}</strong>: ${s.meaning}</li>`;
            });
            summary += '</ul>';
        } else {
            summary += 'No common dream symbols detected.';
        }
        summary += '<br>Dream text: <em>' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</em>';
        return summary;
    }

    showAnalysisResult(analysis) {
        const resultDiv = document.getElementById('dream-analysis-result');
        if (!resultDiv) return;
        resultDiv.innerHTML = `
            <div class="dream-summary">
                <h4>Dream Analysis</h4>
                <div>${analysis.summary}</div>
            </div>
        `;
    }

    updateDreamHistory() {
        const list = document.getElementById('dream-history-list');
        if (!list) return;
        list.innerHTML = '';
        this.dreams.slice(-10).reverse().forEach(dream => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="dream-date">${dream.date}:</span> <span class="dream-text">${dream.entry.slice(0, 40)}${dream.entry.length > 40 ? '...' : ''}</span>`;
            li.onclick = () => this.showAnalysisResult(dream.analysis);
            list.appendChild(li);
        });
    }

    loadSymbolDictionary() {
        // Common dream symbols and meanings
        return {
            'water': 'Emotions, subconscious, cleansing',
            'flying': 'Freedom, ambition, escape',
            'teeth': 'Anxiety, self-image, loss',
            'chase': 'Avoidance, fear, stress',
            'falling': 'Loss of control, insecurity',
            'death': 'Change, transformation, endings',
            'baby': 'New beginnings, vulnerability',
            'snake': 'Hidden fears, transformation',
            'house': 'Self, mind, security',
            'car': 'Direction in life, control',
            'school': 'Learning, anxiety, self-evaluation',
            'money': 'Value, self-worth, opportunity',
            'fire': 'Passion, anger, destruction',
            'dog': 'Loyalty, friendship, protection',
            'cat': 'Independence, intuition, femininity',
            'mirror': 'Self-reflection, truth',
            'door': 'Opportunity, transition',
            'road': 'Journey, choices, direction',
            'mountain': 'Obstacles, goals, challenge',
            'exam': 'Evaluation, stress, fear of failure',
            'blood': 'Vitality, loss, emotional pain'
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dreamJournalAnalyzer = new DreamJournalAnalyzer();
    console.log('🌙 AI Dream Journal Analyzer loaded');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DreamJournalAnalyzer };
}
