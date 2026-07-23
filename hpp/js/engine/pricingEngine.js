export const PricingEngine = {
    calculateTotalPotonganPersentase(platformConfig) {
        // Komisi + PPN atas Komisi + Promo Merchant + Voucher Merchant + Biaya Layanan (%) + Buffer Keamanan
        const ppnNominalPersen = (platformConfig.komisi * platformConfig.ppn) / 100;
        return platformConfig.komisi + ppnNominalPersen + platformConfig.promo + platformConfig.voucher + platformConfig.biayaLayanan + platformConfig.buffer;
    },
    
    calculateTotalPotonganNominal(platformConfig) {
        return platformConfig.biayaTetap || 0;
    },
    
    calculateSellingPrice(hpp, targetLabaNominal, platformConfig) {
        const totalPotonganPersen = this.calculateTotalPotonganPersentase(platformConfig) / 100;
        const totalPotonganNominal = this.calculateTotalPotonganNominal(platformConfig);
        
        // Harga Jual = ((HPP + Target Laba + Total Potongan Nominal) ÷ (1 − Total Potongan Persentase))
        if (totalPotonganPersen >= 1) {
            return 0; // Invalid
        }
        
        return (hpp + targetLabaNominal + totalPotonganNominal) / (1 - totalPotonganPersen);
    },
    
    roundPrice(price, roundMultiple) {
        if (!roundMultiple || roundMultiple <= 0) return price;
        return Math.ceil(price / roundMultiple) * roundMultiple;
    },
    
    calculateMargin(hargaJual, hpp, platformConfig) {
        if (hargaJual <= 0) return 0;
        const netProfit = this.calculateNetProfit(hargaJual, hpp, platformConfig);
        return (netProfit / hargaJual) * 100;
    },
    
    calculateNetProfit(hargaJual, hpp, platformConfig) {
        const totalPotonganPersen = this.calculateTotalPotonganPersentase(platformConfig) / 100;
        const totalPotonganNominal = this.calculateTotalPotonganNominal(platformConfig);
        
        const potonganTotal = (hargaJual * totalPotonganPersen) + totalPotonganNominal;
        return hargaJual - hpp - potonganTotal;
    }
};
