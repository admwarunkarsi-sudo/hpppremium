import { masterUnit } from '../database/masterUnit.js';

export const UnitEngine = {
    getUnit(id) {
        return masterUnit.find(u => u.id === id) || null;
    },
    convert(value, fromUnitId, toUnitId) {
        const fromUnit = this.getUnit(fromUnitId);
        const toUnit = this.getUnit(toUnitId);
        if (!fromUnit || !toUnit) return value;
        
        // Konversi berdasarkan base multiplier
        let baseValue = value * fromUnit.baseMultiplier;
        return baseValue / toUnit.baseMultiplier;
    },
    calculateCost(hargaBeli, qtyBeli, satuanBeliId, qtyPakai, satuanPakaiId) {
        const qtyBeliInBase = this.convert(qtyBeli, satuanBeliId, satuanPakaiId);
        if (qtyBeliInBase === 0) return 0;
        const hargaPerSatuanPakai = hargaBeli / qtyBeliInBase;
        return hargaPerSatuanPakai * qtyPakai;
    }
};
