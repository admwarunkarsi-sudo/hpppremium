import { UnitEngine } from './unitEngine.js';

export const HPPEngine = {
    calculateBahanCost(recipeBahanList, masterBahanList) {
        let totalCost = 0;
        const details = [];
        for (const rb of recipeBahanList) {
            const mb = masterBahanList.find(b => b.id === rb.id);
            if (!mb) continue;
            
            const cost = UnitEngine.calculateCost(mb.hargaBeli, mb.isiKemasan, mb.satuanBeli, rb.jumlahDipakai, rb.satuanPakai);
            totalCost += cost;
            details.push({
                bahan: mb,
                cost: cost
            });
        }
        return { totalCost, details };
    },
    
    calculateTotalHPP(bahanCost, variableCosts, fixedCosts, includeFixed) {
        let total = bahanCost;
        const vCostSum = variableCosts.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
        total += vCostSum;
        
        if (includeFixed) {
            const fCostSum = fixedCosts.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
            total += fCostSum;
        }
        
        return total;
    },
    
    calculateFoodCostPercentage(hppTotal, sellingPrice) {
        if (sellingPrice <= 0) return 0;
        return (hppTotal / sellingPrice) * 100;
    }
};
