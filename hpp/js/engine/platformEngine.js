import { masterPlatform } from '../database/masterPlatform.js';

export const PlatformEngine = {
    getPlatforms() {
        return masterPlatform.filter(p => p.aktif);
    },
    
    getPlatformById(id) {
        return masterPlatform.find(p => p.id === id);
    },
    
    getPresetsForPlatform(platformId) {
        const platform = this.getPlatformById(platformId);
        return platform ? platform.presets : [];
    }
};
