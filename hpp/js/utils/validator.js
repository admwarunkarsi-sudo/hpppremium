export const Validator = {
    isPositiveNumber(val) {
        const num = Number(val);
        return !isNaN(num) && num >= 0;
    },
    isValidCommission(val) {
        const num = Number(val);
        return !isNaN(num) && num >= 0 && num <= 100;
    },
    isNotEmptyString(val) {
        return typeof val === 'string' && val.trim().length > 0;
    },
    isGreaterThanZero(val) {
        const num = Number(val);
        return !isNaN(num) && num > 0;
    },
    validateRecipe(recipe) {
        const errors = [];
        if (!this.isNotEmptyString(recipe.name)) errors.push("Nama resep wajib diisi.");
        if (!this.isGreaterThanZero(recipe.yield)) errors.push("Jumlah porsi minimal 1.");
        return errors;
    },
    validateBahan(bahan) {
        const errors = [];
        if (!this.isNotEmptyString(bahan.name)) errors.push("Nama bahan wajib diisi.");
        if (!this.isPositiveNumber(bahan.hargaBeli)) errors.push("Harga beli tidak boleh negatif.");
        return errors;
    }
};
