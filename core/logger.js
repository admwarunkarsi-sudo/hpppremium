export const LogTypes = {
    AUDIT: 'AUDIT',
    CALCULATION: 'CALCULATION',
    SYSTEM: 'SYSTEM',
    ERROR: 'ERROR'
};

class Logger {
    log(type, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, type, message, data };
        
        // For Phase 1, just log to console.
        // In Phase 3, this will persist to LocalStorage or Backend.
        switch(type) {
            case LogTypes.ERROR:
                console.error(`[${type}] ${timestamp}: ${message}`, data || '');
                break;
            case LogTypes.AUDIT:
            case LogTypes.CALCULATION:
                console.info(`[${type}] ${timestamp}: ${message}`, data || '');
                break;
            default:
                console.log(`[${type}] ${timestamp}: ${message}`, data || '');
        }
    }

    audit(message, data) { this.log(LogTypes.AUDIT, message, data); }
    calc(message, data) { this.log(LogTypes.CALCULATION, message, data); }
    system(message, data) { this.log(LogTypes.SYSTEM, message, data); }
    error(message, errorObj) { this.log(LogTypes.ERROR, message, errorObj); }
}

export const logger = new Logger();
