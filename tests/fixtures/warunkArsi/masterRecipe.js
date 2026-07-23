export const goldenRecipes = [
    {
        id: "r01", name: "Ayam Geprek Spesial", yieldQty: 1, rawWeight: 200, cookedWeight: 150,
        ingredients: [
            { ingredientId: "b02", usedQty: 150 }, // Ayam
            { ingredientId: "b08", usedQty: 50 },  // Terigu
            { ingredientId: "b04", usedQty: 15 },  // Rawit
            { ingredientId: "b06", usedQty: 5 },   // Bawang putih
            { ingredientId: "b09", usedQty: 2 },   // Garam
            { ingredientId: "b07", usedQty: 30 }   // Minyak
        ],
        variableCosts: [{ name: "Box", amount: 1500 }],
        fixedCosts: []
    },
    {
        id: "r02", name: "Nasi Goreng Gila", yieldQty: 1, rawWeight: 350, cookedWeight: 330,
        ingredients: [
            { ingredientId: "b01", usedQty: 200 }, // Beras (asumsi belum jadi nasi utk testing raw calc)
            { ingredientId: "b16", usedQty: 50 },  // Telur
            { ingredientId: "b04", usedQty: 10 },
            { ingredientId: "b05", usedQty: 10 },
            { ingredientId: "b06", usedQty: 5 },
            { ingredientId: "b11", usedQty: 15 }
        ],
        variableCosts: [{ name: "Kertas Nasi", amount: 180 }],
        fixedCosts: []
    }
];
