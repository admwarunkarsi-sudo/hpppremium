import { ErrorHandler, ErrorCodes, AppError } from '../../core/errorHandler.js';
import { logger } from '../../core/logger.js';

export class LocalStorageAdapter {
    constructor(prefix = 'warunkarsi_') {
        this.prefix = prefix;
    }

    _getKey(key) {
        return `${this.prefix}${key}`;
    }

    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this._getKey(key));
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            ErrorHandler.handle(
                new AppError(ErrorCodes.ERR_STORAGE_FAILED, "Gagal membaca dari LocalStorage", error),
                'LocalStorageAdapter.get'
            );
            return defaultValue;
        }
    }

    set(key, value) {
        try {
            localStorage.setItem(this._getKey(key), JSON.stringify(value));
            return true;
        } catch (error) {
            ErrorHandler.handle(
                new AppError(ErrorCodes.ERR_STORAGE_FAILED, "Gagal menyimpan ke LocalStorage", error),
                'LocalStorageAdapter.set'
            );
            return false;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(this._getKey(key));
            return true;
        } catch (error) {
            ErrorHandler.handle(
                new AppError(ErrorCodes.ERR_STORAGE_FAILED, "Gagal menghapus dari LocalStorage", error),
                'LocalStorageAdapter.remove'
            );
            return false;
        }
    }
}

export const storageAdapter = new LocalStorageAdapter();
