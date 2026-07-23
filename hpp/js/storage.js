import { generateUUID } from '../utils/uuid.js';
import { STORAGE_KEYS, APP_INFO } from '../utils/constants.js';

export const Storage = {
    save(key, data) {
        const payload = {
            data: data,
            metadata: {
                appVersion: APP_INFO.VERSION,
                databaseVersion: APP_INFO.DB_VERSION,
                updatedAt: new Date().toISOString()
            }
        };
        try {
            localStorage.setItem(key, JSON.stringify(payload));
            return true;
        } catch (e) {
            console.error("Storage error:", e);
            return false;
        }
    },
    load(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.data || defaultValue;
            }
        } catch (e) {
            console.error("Storage load error:", e);
        }
        return defaultValue;
    },
    update(key, id, newData) {
        const list = this.load(key, []);
        const index = list.findIndex(item => item.id === id);
        if (index > -1) {
            list[index] = { ...list[index], ...newData, updatedAt: new Date().toISOString() };
            this.save(key, list);
            return true;
        }
        return false;
    },
    delete(key, id) {
        let list = this.load(key, []);
        list = list.filter(item => item.id !== id);
        this.save(key, list);
        return true;
    }
};
