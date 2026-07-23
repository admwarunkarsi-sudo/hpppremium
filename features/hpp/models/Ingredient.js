export class Ingredient {
    constructor({ id, name, category, supplierId, brand, barcode, buyPrice, packagingSize, buyUnit, minimumStock, priceHistory, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.supplierId = supplierId;
        this.brand = brand;
        this.barcode = barcode;
        this.buyPrice = Number(buyPrice) || 0;
        this.packagingSize = Number(packagingSize) || 1;
        this.buyUnit = buyUnit;
        this.minimumStock = Number(minimumStock) || 0;
        this.priceHistory = priceHistory || [];
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Domain logic validasi entity
    isValid() {
        return this.name && this.buyPrice >= 0 && this.packagingSize > 0;
    }
}
