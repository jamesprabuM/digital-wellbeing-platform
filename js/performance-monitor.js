
// ===== PERFORMANCE MONITORING UTILITY =====

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: null,
            interactions: [],
            errors: 0,
            memoryUsage: []
        };

        this.init();
    }

    init() {
        // Monitor page load performance
        this.monitorPageLoad();

        // Monitor user interactions
        this.monitorInteractions();

        // Monitor memory usage periodically
        this.monitorMemory();

        // Monitor long tasks
        this.monitorLongTasks();
    }

    monitorPageLoad() {
        window.addEventListener('load', () => {
            // Use Performance API if available
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                this.metrics.pageLoad = {
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    loadComplete: timing.loadEventEnd - timing.navigationStart,
                    domReady: timing.domComplete - timing.navigationStart,
                    timestamp: Date.now()
                };

                console.log('📊 Page Load Metrics:', this.metrics.pageLoad);
            }
        });
    }

    monitorInteractions() {
        // Monitor click interactions
        document.addEventListener('click', (event) => {
            this.recordInteraction('click', event.target);
        });

        // Monitor form submissions
        document.addEventListener('submit', (event) => {
            this.recordInteraction('submit', event.target);
        });

        // Monitor input focus (for form analytics)
        document.addEventListener('focus', (event) => {
            if (event.target.matches('input, textarea, select')) {
                this.recordInteraction('focus', event.target);
            }
        }, true);
    }

    recordInteraction(type, element) {
        const interaction = {
            type,
            element: this.getElementSelector(element),
            timestamp: Date.now()
        };

        this.metrics.interactions.push(interaction);

        // Keep only last 100 interactions
        if (this.metrics.interactions.length > 100) {
            this.metrics.interactions = this.metrics.interactions.slice(-100);
        }
    }

    getElementSelector(element) {
        if (!element) return 'unknown';

        // Try to get a meaningful selector
        if (element.id) return `#${element.id}`;
        if (element.className) return `.${element.className.split(' ')[0]}`;
        return element.tagName.toLowerCase();
    }

    monitorMemory() {
        if (window.performance && window.performance.memory) {
            const recordMemory = () => {
                const memory = window.performance.memory;
                this.metrics.memoryUsage.push({
                    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
                    timestamp: Date.now()
                });

                // Keep only last 20 measurements
                if (this.metrics.memoryUsage.length > 20) {
                    this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-20);
                }
            };

            // Record memory usage every 30 seconds
            recordMemory();
            setInterval(recordMemory, 30000);
        }
    }

    monitorLongTasks() {
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.duration > 50) { // Tasks longer than 50ms
                            console.warn('⚠️ Long Task Detected:', {
                                duration: entry.duration,
                                startTime: entry.startTime,
                                name: entry.name
                            });
                        }
                    });
                });

                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.log('Long task monitoring not supported');
            }
        }
    }

    // Measure function execution time
    measureFunction(fn, name = 'function') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();

        console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }

    // Measure async function execution time
    async measureAsyncFunction(fn, name = 'async function') {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();

        console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    }

    // Get performance summary
    getPerformanceSummary() {
        const summary = {
            pageLoad: this.metrics.pageLoad,
            totalInteractions: this.metrics.interactions.length,
            recentInteractions: this.metrics.interactions.slice(-10),
            currentMemory: this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1],
            memoryTrend: this.getMemoryTrend()
        };

        return summary;
    }

    getMemoryTrend() {
        if (this.metrics.memoryUsage.length < 2) return 'insufficient data';

        const recent = this.metrics.memoryUsage.slice(-5);
        const first = recent[0].used;
        const last = recent[recent.length - 1].used;

        if (last > first * 1.2) return 'increasing';
        if (last < first * 0.8) return 'decreasing';
        return 'stable';
    }

    // Export performance data for analysis
    exportPerformanceData() {
        const data = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            metrics: this.metrics,
            summary: this.getPerformanceSummary()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `mindfulpath-performance-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Check if performance is degraded
    checkPerformanceHealth() {
        const issues = [];

        // Check memory usage
        const currentMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
        if (currentMemory && currentMemory.used > currentMemory.limit * 0.8) {
            issues.push('High memory usage detected');
        }

        // Check for too many interactions (might indicate UI issues)
        const recentInteractions = this.metrics.interactions.filter(
            i => Date.now() - i.timestamp < 60000 // Last minute
        );
        if (recentInteractions.length > 50) {
            issues.push('High interaction rate detected');
        }

        return {
            healthy: issues.length === 0,
            issues
        };
    }
}

// Initialize performance monitor
window.performanceMonitor = new PerformanceMonitor();

// Add global utility functions
window.measurePerformance = (fn, name) => window.performanceMonitor.measureFunction(fn, name);
window.measureAsyncPerformance = (fn, name) => window.performanceMonitor.measureAsyncFunction(fn, name);

console.log('📊 Performance Monitor Initialized Successfully!');