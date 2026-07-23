import { logger } from '../../core/logger.js';

export const PerformanceProfiler = {
    metrics: {
        renders: 0,
        events: 0,
        cacheHits: 0,
        cacheMisses: 0,
        storageReads: 0,
        storageWrites: 0
    },

    startTimer(label) {
        if (typeof performance !== 'undefined') {
            performance.mark(`${label}-start`);
        }
    },

    endTimer(label) {
        if (typeof performance !== 'undefined') {
            performance.mark(`${label}-end`);
            performance.measure(label, `${label}-start`, `${label}-end`);
            const measure = performance.getEntriesByName(label).pop();
            
            if (measure && measure.duration > 150) {
                logger.system(`[PERFORMANCE WARNING] ${label} took ${measure.duration.toFixed(2)}ms (Target < 150ms)`);
            }
        }
    },

    track(metricName) {
        if (this.metrics[metricName] !== undefined) {
            this.metrics[metricName]++;
        }
    },

    report() {
        console.table(this.metrics);
    }
};
