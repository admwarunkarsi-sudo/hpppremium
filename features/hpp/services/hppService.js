import { MasterBahanRepository } from '../repository/masterBahanRepo.js';
import { HPPEngine } from '../engine/hppEngine.js';
import { HPPDomain } from '../domain/hppDomain.js';
import { logger } from '../../../core/logger.js';

export const HPPService = {
    /**
     * Menghitung total HPP untuk sebuah resep
     * @param {object} recipeEntity 
     */
    calculateRecipeHpp(recipeEntity) {
        logger.calc(`Mulai menghitung HPP untuk resep: ${recipeEntity.name}`);
        
        const allIngredients = MasterBahanRepository.getAll();
        
        let totalBahanCost = 0;
        const calculationLog = [];

        // 1. Hitung biaya bahan baku
        recipeEntity.ingredients.forEach(ri => {
            const master = allIngredients.find(b => b.id === ri.ingredientId);
            if (!master) {
                logger.error(`Bahan dengan ID ${ri.ingredientId} tidak ditemukan.`);
                return;
            }

            // Simplifikasi konversi unit untuk v1.0
            // Harga per satuan = Harga Beli / Ukuran Kemasan
            const pricePerUnit = master.buyPrice / master.packagingSize;
            const cost = pricePerUnit * ri.usedQty;
            
            totalBahanCost += cost;
            
            calculationLog.push({
                item: master.name,
                formula: `(Rp${master.buyPrice} / ${master.packagingSize}) * ${ri.usedQty}`,
                result: cost
            });
        });

        // 2. Hitung biaya produksi (variable + fixed) jika ada
        let totalVariable = 0;
        recipeEntity.variableCosts.forEach(vc => totalVariable += (Number(vc.amount) || 0));
        
        let totalFixed = 0;
        recipeEntity.fixedCosts.forEach(fc => totalFixed += (Number(fc.amount) || 0));

        const grandTotal = totalBahanCost + totalVariable + totalFixed;

        // 3. Hitung HPP per Porsi
        const hppPerPortion = HPPEngine.calculateHppPerPortion(grandTotal, recipeEntity.yieldQty);

        logger.calc(`Total HPP = ${grandTotal}. HPP per porsi = ${hppPerPortion}`, calculationLog);

        return {
            totalBahanCost,
            totalVariable,
            totalFixed,
            grandTotal,
            hppPerPortion,
            logs: calculationLog
        };
    }
};
