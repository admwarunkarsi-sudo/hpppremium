import { eventBus } from '../../../core/eventBus.js';

class HPPState {
    constructor() {
        this.state = {
            activeRecipe: null,
            calculationResults: null,
            platforms: [],
            isDirty: false
        };
    }

    setRecipe(recipeEntity) {
        this.state.activeRecipe = recipeEntity;
        this.state.isDirty = true;
        eventBus.publish('state:recipeChanged', recipeEntity);
    }

    setCalculationResults(results) {
        this.state.calculationResults = results;
        eventBus.publish('state:calculationUpdated', results);
    }

    get() {
        return this.state;
    }
}

export const hppState = new HPPState();
