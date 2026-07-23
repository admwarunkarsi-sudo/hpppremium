export const goldenPlatforms = [
    {
        id: "plat_offline", name: "Dine In / Takeaway", color: "#475569", isActive: true,
        presets: [{ id: "p_off", name: "Default", commission: 0, tax: 10, promo: 0, voucher: 0, serviceFee: 0, buffer: 0, fixedFee: 0 }]
    },
    {
        id: "plat_gofood", name: "GoFood", color: "#dc2626", isActive: true,
        presets: [{ id: "p_gf", name: "Regular", commission: 20, tax: 11, promo: 0, voucher: 0, serviceFee: 1000, buffer: 0, fixedFee: 0 }]
    },
    {
        id: "plat_grabfood", name: "GrabFood", color: "#16a34a", isActive: true,
        presets: [{ id: "p_gr", name: "Regular", commission: 20, tax: 11, promo: 0, voucher: 0, serviceFee: 2000, buffer: 0, fixedFee: 0 }]
    },
    {
        id: "plat_shopeefood", name: "ShopeeFood", color: "#ea580c", isActive: true,
        presets: [{ id: "p_sf", name: "Regular", commission: 20, tax: 11, promo: 0, voucher: 0, serviceFee: 0, buffer: 0, fixedFee: 0 }]
    }
];
