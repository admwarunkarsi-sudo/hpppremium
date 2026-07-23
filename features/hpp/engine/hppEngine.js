/**
 * PURE CALCULATION ENGINE
 * Testable, no DOM, no Side Effects.
 */

export const HPPEngine = {
    /**
     * @param {number} totalCost - Total biaya bahan baku & produksi
     * @param {number} yieldQty - Jumlah porsi yang dihasilkan
     * @returns {number} HPP per porsi
     */
    calculateHppPerPortion(totalCost, yieldQty) {
        if (yieldQty <= 0) return 0;
        return totalCost / yieldQty;
    },

    /**
     * Menghitung persentase food cost terhadap harga jual
     * @param {number} hppPerPortion 
     * @param {number} sellingPrice 
     * @returns {number} Persentase Food Cost
     */
    calculateFoodCostPercentage(hppPerPortion, sellingPrice) {
        if (sellingPrice <= 0) return 0;
        return (hppPerPortion / sellingPrice) * 100;
    },

    /**
     * Menghitung nilai penyusutan (shrinkage) dari berat mentah ke matang
     * @param {number} rawWeight 
     * @param {number} cookedWeight 
     * @returns {number} Shrinkage percentage
     */
    calculateShrinkage(rawWeight, cookedWeight) {
        if (rawWeight <= 0) return 0;
        return ((rawWeight - cookedWeight) / rawWeight) * 100;
    }
};
