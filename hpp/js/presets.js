import { PlatformEngine } from './engine/platformEngine.js';

export const Presets = {
    getAllPresets() {
        const platforms = PlatformEngine.getPlatforms();
        const allPresets = [];
        platforms.forEach(p => {
            p.presets.forEach(preset => {
                allPresets.push({
                    platformId: p.id,
                    platformName: p.name,
                    ...preset
                });
            });
        });
        return allPresets;
    },
    
    getPreset(platformId, presetId) {
        const presets = PlatformEngine.getPresetsForPlatform(platformId);
        return presets.find(p => p.id === presetId) || null;
    }
};
