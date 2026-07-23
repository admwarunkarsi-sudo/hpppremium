export class Platform {
    constructor({ id, name, color, presets, isActive }) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.presets = presets || [];
        this.isActive = isActive !== undefined ? isActive : true;
    }
}

export class PlatformPreset {
    constructor({ id, name, commission, tax, promo, voucher, serviceFee, buffer, fixedFee }) {
        this.id = id;
        this.name = name;
        this.commission = Number(commission) || 0;
        this.tax = Number(tax) || 0;
        this.promo = Number(promo) || 0;
        this.voucher = Number(voucher) || 0;
        this.serviceFee = Number(serviceFee) || 0;
        this.buffer = Number(buffer) || 0;
        this.fixedFee = Number(fixedFee) || 0;
    }
}
