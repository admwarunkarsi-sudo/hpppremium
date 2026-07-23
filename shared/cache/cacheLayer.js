export class CacheLayer {
    constructor() {
        this.cache = new Map();
    }

    get(key) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        return null;
    }

    set(key, value) {
        this.cache.set(key, value);
    }

    invalidate(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }
}

export const globalCache = new CacheLayer();
