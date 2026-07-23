/**
 * PURE PRICING ENGINE
 * Testable, no DOM, no Side Effects.
 */

export const PricingEngine = {
    /**
     * Menghitung total potongan persentase dari sebuah platform
     * @param {object} preset - PlatformPreset instance
     * @returns {number} Total persentase (e.g. 23.2)
     */
    calculateTotalDeductionPercentage(preset) {
        const taxOnCommission = (preset.commission * preset.tax) / 100;
        return preset.commission + taxOnCommission + preset.promo + preset.voucher + preset.buffer;
    },

    /**
     * Menghitung harga jual yang disarankan untuk mencapai laba nominal tertentu
     * Formula: (HPP + Laba Nominal + Biaya Tetap + Service Fee) / (1 - Total Potongan Persen)
     * @param {number} hpp 
     * @param {number} targetProfitNominal 
     * @param {object} preset - PlatformPreset instance
     * @returns {number} Harga Jual Raw
     */
    calculateRecommendedPrice(hpp, targetProfitNominal, preset) {
        const totalDeductionPercent = this.calculateTotalDeductionPercentage(preset) / 100;
        
        if (totalDeductionPercent >= 1) {
            throw new Error("Potongan persentase >= 100%, tidak mungkin mendapatkan keuntungan.");
        }
        
        return (hpp + targetProfitNominal + preset.fixedFee + preset.serviceFee) / (1 - totalDeductionPercent);
    },

    /**
     * Membulatkan harga sesuai kelipatan
     * @param {number} price 
     * @param {number} multiple (e.g. 1000)
     * @returns {number} Rounded price
     */
    roundPrice(price, multiple) {
        if (!multiple || multiple <= 0) return price;
        return Math.ceil(price / multiple) * multiple;
    },

    /**
     * Menghitung laba bersih dari suatu harga jual
     * @param {number} sellingPrice 
     * @param {number} hpp 
     * @param {object} preset 
     * @returns {number} Net Profit
     */
    calculateNetProfit(sellingPrice, hpp, preset) {
        const totalDeductionPercent = this.calculateTotalDeductionPercentage(preset) / 100;
        const totalDeductions = (sellingPrice * totalDeductionPercent) + preset.fixedFee + preset.serviceFee;
        return sellingPrice - hpp - totalDeductions;
    }
};
