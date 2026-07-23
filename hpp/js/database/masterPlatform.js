export const masterPlatform = [
    {
        id: "plat_offline",
        name: "Offline",
        warna: "#1e3f20", // Dark Green
        presets: [
            { id: "p_off_reg", name: "Regular", komisi: 0, ppn: 0, promo: 0, voucher: 0, biayaLayanan: 0, buffer: 0, biayaTetap: 0 }
        ],
        aktif: true
    },
    {
        id: "plat_shopee",
        name: "ShopeeFood",
        warna: "#ee4d2d", // Shopee Orange
        presets: [
            { id: "p_spf_reg", name: "Regular", komisi: 20, ppn: 11, promo: 0, voucher: 0, biayaLayanan: 0, buffer: 2, biayaTetap: 0 },
            { id: "p_spf_sil", name: "Silver", komisi: 15, ppn: 11, promo: 0, voucher: 0, biayaLayanan: 0, buffer: 2, biayaTetap: 0 },
            { id: "p_spf_gol", name: "Gold", komisi: 12, ppn: 11, promo: 0, voucher: 0, biayaLayanan: 0, buffer: 2, biayaTetap: 0 }
        ],
        aktif: true
    },
    {
        id: "plat_grab",
        name: "GrabFood",
        warna: "#00b14f", // Grab Green
        presets: [
            { id: "p_grb_reg", name: "Regular", komisi: 20, ppn: 11, promo: 0, voucher: 0, biayaLayanan: 0, buffer: 2, biayaTetap: 1000 },
            { id: "p_grb_pri", name: "Priority", komisi: 15, ppn: 11, promo: 0, voucher: 0, biayaLayanan: 0, buffer: 2, biayaTetap: 1000 }
        ],
        aktif: true
    },
    {
        id: "plat_gojek",
        name: "GoFood",
        warna: "#00aa13", // Gojek Green
        presets: [
            { id: "p_gof_reg", name: "Regular", komisi: 20, ppn: 11, promo: 0, voucher: 0, biayaLayanan: 0, buffer: 2, biayaTetap: 1000 },
            { id: "p_gof_gbz", name: "GoBiz Plus", komisi: 15, ppn: 11, promo: 0, voucher: 0, biayaLayanan: 0, buffer: 2, biayaTetap: 1000 }
        ],
        aktif: true
    }
];
