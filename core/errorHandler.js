import { logger } from './logger.js';

export const ErrorCodes = {
    ERR_INVALID_PRICE: 'ERR_INVALID_PRICE',
    ERR_INVALID_UNIT: 'ERR_INVALID_UNIT',
    ERR_STORAGE_FAILED: 'ERR_STORAGE_FAILED',
    ERR_IMPORT_FAILED: 'ERR_IMPORT_FAILED',
    ERR_EXPORT_FAILED: 'ERR_EXPORT_FAILED',
    ERR_PLATFORM_NOT_FOUND: 'ERR_PLATFORM_NOT_FOUND',
    ERR_UNKNOWN: 'ERR_UNKNOWN'
};

export class AppError extends Error {
    constructor(code, message, details = null) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}

export const ErrorHandler = {
    handle(error, context = '') {
        const code = error instanceof AppError ? error.code : ErrorCodes.ERR_UNKNOWN;
        const message = error.message || 'An unknown error occurred';
        
        logger.error(`Error in ${context}: ${code} - ${message}`, {
            stack: error.stack,
            details: error instanceof AppError ? error.details : null
        });

        return { code, message };
    }
};
