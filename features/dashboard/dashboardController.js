import { CurrencyUtils } from '../../shared/utils/currency.js';

export const DashboardController = {
    init() {
        this.renderStats();
        this.renderRecentRecipes();
    },

    getIngredientsCount() {
        try {
            const data = localStorage.getItem('warunk_arsi_master_ingredients');
            if (data) return JSON.parse(data).length;
        } catch(e) {}
        return 0; // Default if not initialized yet, though ResepController clones golden data
    },

    getSavedRecipes() {
        try {
            const data = localStorage.getItem('warunk_arsi_recipes');
            if (data) return JSON.parse(data);
        } catch(e) {}
        return [];
    },

    renderStats() {
        const totalBahan = this.getIngredientsCount();
        const totalResep = this.getSavedRecipes().length;

        const elBahan = document.getElementById('statTotalBahan');
        const elResep = document.getElementById('statTotalResep');

        if (elBahan) elBahan.innerText = totalBahan;
        if (elResep) elResep.innerText = totalResep;
    },

    renderRecentRecipes() {
        const recipes = this.getSavedRecipes();
        const listEl = document.getElementById('listRecentRecipes');
        const emptyEl = document.getElementById('emptyRecentRecipes');

        if (!listEl || !emptyEl) return;

        if (recipes.length === 0) {
            emptyEl.classList.remove('hidden');
            emptyEl.classList.add('flex');
            listEl.innerHTML = '';
            return;
        }

        emptyEl.classList.add('hidden');
        emptyEl.classList.remove('flex');

        // Sort by id descending (assuming id is timestamp based or just reverse order)
        // Actually recipes might just be appended
        const recent = [...recipes].reverse().slice(0, 5); // Take top 5

        listEl.innerHTML = recent.map(r => {
            return `
                <li class="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-wa-100 flex items-center justify-center text-wa-800">
                            <i data-lucide="file-text" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800">${r.name}</h4>
                            <p class="text-xs text-slate-500 font-medium">Porsi/Yield: ${r.yieldQty} • ${r.ingredients ? r.ingredients.length : 0} Bahan</p>
                        </div>
                    </div>
                    <a href="#/hpp" onclick="window.dashboardController.openRecipe('${r.id}')" class="opacity-0 group-hover:opacity-100 px-4 py-2 text-sm font-bold text-wa-700 bg-wa-50 rounded-xl hover:bg-wa-100 transition-all">
                        Buka Resep
                    </a>
                </li>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    },
    
    openRecipe(id) {
        // We will just let the user go to #/hpp, and the HPP controller could theoretically load it
        // For now, since HPP loads from goldenRecipes, we would need to pass this ID to HPP controller
        // I will set a flag in localStorage so HPP controller knows which one to open
        localStorage.setItem('warunk_arsi_active_recipe_id', id);
    }
};

window.dashboardController = DashboardController;
