import { Storage } from './storage.js';
import { initialBahan } from './database/masterBahan.js';
import { initialSupplier } from './database/supplier.js';
import { initialRecipe } from './database/recipe.js';
import { defaultSettings } from './database/settings.js';
import { STORAGE_KEYS } from './utils/constants.js';

// Application State
export const AppState = {
    settings: {},
    recipe: null,
    bahan: [],
    supplier: [],
    platforms: [],
    variableCosts: [],
    fixedCosts: [],
    targetLaba: {
        type: 'percentage', // or 'nominal'
        value: 20
    },
    uiConfig: {
        includeFixedCost: false,
        materialIncrease: 0,
        profitTargetSim: 20
    }
};

export const AppController = {
    init() {
        this.initializeStorage();
        this.loadState();
        console.log("App Controller Initialized", AppState);
    },
    
    initializeStorage() {
        if (!Storage.load(STORAGE_KEYS.MASTER_BAHAN)) {
            Storage.save(STORAGE_KEYS.MASTER_BAHAN, initialBahan);
        }
        if (!Storage.load(STORAGE_KEYS.MASTER_SUPPLIER)) {
            Storage.save(STORAGE_KEYS.MASTER_SUPPLIER, initialSupplier);
        }
        if (!Storage.load(STORAGE_KEYS.MASTER_RECIPE)) {
            Storage.save(STORAGE_KEYS.MASTER_RECIPE, initialRecipe);
        }
        if (!Storage.load(STORAGE_KEYS.SETTINGS)) {
            Storage.save(STORAGE_KEYS.SETTINGS, defaultSettings);
        }
    },
    
    loadState() {
        AppState.settings = Storage.load(STORAGE_KEYS.SETTINGS);
        AppState.bahan = Storage.load(STORAGE_KEYS.MASTER_BAHAN);
        AppState.supplier = Storage.load(STORAGE_KEYS.MASTER_SUPPLIER);
        
        // Load mock recipe for MVP demo
        const recipes = Storage.load(STORAGE_KEYS.MASTER_RECIPE);
        if (recipes && recipes.length > 0) {
            AppState.recipe = recipes[0];
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
    // Dispatch custom event that app is ready, UI can listen to it
    document.dispatchEvent(new CustomEvent('appReady'));
});
