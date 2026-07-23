import { HPPEngine } from '../engine/hppEngine.js';

export const HPPDomain = {
    /**
     * Business Rule: Menentukan apakah Food Cost berada di batas sehat.
     * Standar F&B umumnya 25% - 35%
     * @param {number} fcPercentage 
     * @returns {string} Status kesehatan ('EXCELLENT', 'GOOD', 'WARNING', 'RISK')
     */
    evaluateFoodCostHealth(fcPercentage) {
        if (fcPercentage <= 0) return 'UNKNOWN';
        if (fcPercentage >= 25 && fcPercentage <= 30) return 'EXCELLENT';
        if (fcPercentage > 30 && fcPercentage <= 35) return 'GOOD';
        if (fcPercentage > 35 && fcPercentage <= 45) return 'WARNING';
        return 'RISK';
    },

    /**
     * Business Rule: Toleransi waste default jika tidak diset
     */
    getDefaultWasteTolerance() {
        return 5; // 5%
    }
};
