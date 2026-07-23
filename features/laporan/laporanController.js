import { CurrencyUtils } from '../../shared/utils/currency.js';
export const LaporanController = {
    recipes: [],
    
    init() {
        this.loadData();
        this.renderStats();
        this.renderTable();
    },

    loadData() {
        try {
            const data = localStorage.getItem('warunk_arsi_recipes');
            if (data) this.recipes = JSON.parse(data);
            else this.recipes = [];
        } catch(e) {
            this.recipes = [];
        }

        try {
            const data = localStorage.getItem('warunk_arsi_master_ingredients');
            const masters = data ? JSON.parse(data) : [];
            this.ingredientsDict = {};
            masters.forEach(i => {
                this.ingredientsDict[i.id] = i;
            });
        } catch(e) {
            this.ingredientsDict = {};
        }
    },

    getRecipeMetrics(r) {
        // We calculate total production cost
        const sumBahan = (r.ingredients || []).reduce((sum, item) => {
            const master = this.ingredientsDict[item.ingredientId];
            if (!master) return sum;
            const price = master.price ?? master.buyPrice ?? ((master.unitPrice || 0) * (master.baseQty || master.packagingSize || 1));
            const baseQty = master.baseQty ?? master.packagingSize ?? 1;
            const unitPrice = price / baseQty;
            return sum + (unitPrice * item.usedQty);
        }, 0);
        
        const sumTambahan = (r.variableCosts || []).reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalCost = sumBahan + sumTambahan;
        
        // HPP per Porsi
        const yieldQty = r.yieldQty || 1;
        const hppPerPorsi = totalCost / yieldQty;
        
        // Target Margin
        const targetMargin = parseFloat(r.targetMargin) || 30;
        
        // Price for Dine In (Margin is percentage of selling price)
        // Price = HPP / (1 - Margin%)
        const marginDecimal = targetMargin / 100;
        const priceDineIn = marginDecimal >= 1 ? hppPerPorsi : hppPerPorsi / (1 - marginDecimal);
        
        // Actual margin if sold at recommended price (should be equal to targetMargin)
        const actualMargin = targetMargin; // Since it's calculated precisely
        
        return {
            totalCost,
            hppPerPorsi,
            priceDineIn,
            margin: actualMargin,
            yieldQty
        };
    },

    renderStats() {
        if (this.recipes.length === 0) return;

        let totalMargin = 0;
        let totalPorsi = 0;
        let bestRecipe = null;
        let bestMargin = -1;

        this.recipes.forEach(r => {
            const metrics = this.getRecipeMetrics(r);
            totalMargin += metrics.margin;
            totalPorsi += metrics.yieldQty;
            
            if (metrics.margin > bestMargin) {
                bestMargin = metrics.margin;
                bestRecipe = r.name;
            }
        });

        const avgMargin = totalMargin / this.recipes.length;

        const elAvgMargin = document.getElementById('laporanAvgMargin');
        const elBestRecipe = document.getElementById('laporanBestRecipe');
        const elBestMargin = document.getElementById('laporanBestMargin');
        const elTotalPorsi = document.getElementById('laporanTotalPorsi');

        if (elAvgMargin) elAvgMargin.innerText = avgMargin.toFixed(1) + '%';
        if (elBestRecipe) elBestRecipe.innerText = bestRecipe || '-';
        if (elBestMargin) elBestMargin.innerText = 'Margin: ' + bestMargin.toFixed(1) + '%';
        if (elTotalPorsi) elTotalPorsi.innerText = totalPorsi;
    },

    renderTable() {
        const tbody = document.getElementById('tableBodyLaporan');
        const emptyState = document.getElementById('emptyStateLaporan');
        if (!tbody || !emptyState) return;

        if (this.recipes.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            tbody.innerHTML = '';
            return;
        }

        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        
        tbody.innerHTML = this.recipes.map(r => {
            const metrics = this.getRecipeMetrics(r);
            
            let statusBadge = '';
            if (metrics.margin >= 30) {
                statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600">Sangat Sehat</span>`;
            } else if (metrics.margin >= 20) {
                statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600">Sehat</span>`;
            } else {
                statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">Waspada</span>`;
            }

            return `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 font-semibold text-slate-800">${r.name}</td>
                    <td class="px-6 py-4 text-center">${metrics.yieldQty}</td>
                    <td class="px-6 py-4 text-right font-medium text-slate-600">${CurrencyUtils.format(metrics.totalCost)}</td>
                    <td class="px-6 py-4 text-right font-bold text-slate-800">${CurrencyUtils.format(metrics.priceDineIn)}</td>
                    <td class="px-6 py-4 text-center font-bold text-wa-600">${metrics.margin.toFixed(1)}%</td>
                    <td class="px-6 py-4 text-center">${statusBadge}</td>
                </tr>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    }
};

window.laporanController = LaporanController;
