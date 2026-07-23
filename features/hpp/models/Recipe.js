export class Recipe {
    constructor({ id, name, category, yieldQty, rawWeight, cookedWeight, waste, shrinkage, servingSize, ingredients, variableCosts, fixedCosts, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.yieldQty = Number(yieldQty) || 1;
        this.rawWeight = Number(rawWeight) || 0;
        this.cookedWeight = Number(cookedWeight) || 0;
        this.waste = Number(waste) || 0;
        this.shrinkage = Number(shrinkage) || 0;
        this.servingSize = Number(servingSize) || 0;
        this.ingredients = ingredients || []; // Array of RecipeIngredient
        this.variableCosts = variableCosts || [];
        this.fixedCosts = fixedCosts || [];
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class RecipeIngredient {
    constructor({ ingredientId, usedQty, usedUnit }) {
        this.ingredientId = ingredientId;
        this.usedQty = Number(usedQty) || 0;
        this.usedUnit = usedUnit;
    }
}
