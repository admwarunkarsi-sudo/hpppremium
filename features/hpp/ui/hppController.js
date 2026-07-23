import { hppState } from '../state/hppState.js';
import { HPPService } from '../services/hppService.js';
import { ExportService } from '../services/exportService.js';
import { CurrencyUtils } from '../../../shared/utils/currency.js';
import { PerformanceProfiler } from '../../../shared/utils/performanceProfiler.js';
import { goldenRecipes } from '../../../tests/fixtures/warunkArsi/masterRecipe.js';
import { goldenIngredients } from '../../../tests/fixtures/warunkArsi/masterBahan.js';
import { goldenPlatforms } from '../../../tests/fixtures/warunkArsi/masterPlatform.js';
import { PricingEngine } from '../engine/pricingEngine.js';
import { HPPEngine } from '../engine/hppEngine.js';

export const HppController = {
    
    currentStep: 1,

    goToStep(stepInput) {
        if (stepInput === 'next') this.currentStep++;
        else if (stepInput === 'prev') this.currentStep--;
        else this.currentStep = parseInt(stepInput);
        
        if (this.currentStep < 1) this.currentStep = 1;
        if (this.currentStep > 4) this.currentStep = 4;
        
        // Hide all steps
        for(let i=1; i<=4; i++) {
            const stepEl = document.getElementById('step-' + i);
            if(stepEl) stepEl.classList.add('hidden');
        }
        
        // Show current step
        const activeStep = document.getElementById('step-' + this.currentStep);
        if(activeStep) activeStep.classList.remove('hidden');
        
        this.updateStepperUI();
    },

    updateStepperUI() {
        const progressLines = { 1: '0%', 2: '33%', 3: '66%', 4: '100%' };
        const progressEl = document.getElementById('stepper-progress');
        if(progressEl) progressEl.style.width = progressLines[this.currentStep];
        
        for(let i=1; i<=4; i++) {
            const stepperDiv = document.getElementById('stepper-' + i);
            if(!stepperDiv) continue;
            const circle = stepperDiv.querySelector('.stepper-circle');
            const text = stepperDiv.querySelector('.stepper-text');
            
            if (i < this.currentStep) {
                // Completed
                circle.className = 'stepper-circle w-10 h-10 rounded-full bg-wa-500 text-white flex items-center justify-center font-bold shadow-md ring-4 ring-[#f8fafc] transition-colors duration-300';
                text.className = 'font-bold text-[11px] text-wa-700 uppercase tracking-widest text-center stepper-text transition-colors duration-300';
            } else if (i === this.currentStep) {
                // Active
                circle.className = 'stepper-circle w-10 h-10 rounded-full bg-wa-800 text-white flex items-center justify-center font-bold shadow-lg shadow-wa-800/30 ring-4 ring-[#f8fafc] transition-colors duration-300';
                text.className = 'font-bold text-[11px] text-wa-900 uppercase tracking-widest text-center stepper-text transition-colors duration-300';
            } else {
                // Upcoming
                circle.className = 'stepper-circle w-10 h-10 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center font-bold ring-4 ring-[#f8fafc] transition-colors duration-300';
                text.className = 'font-bold text-[11px] text-slate-400 uppercase tracking-widest text-center stepper-text transition-colors duration-300';
            }
        }
        
        // Update Buttons
        const btnPrev = document.getElementById('btnPrevStep');
        const btnNext = document.getElementById('btnNextStep');
        if(!btnPrev || !btnNext) return;

        if (this.currentStep === 1) {
            btnPrev.classList.add('hidden');
            setTimeout(() => btnPrev.classList.remove('opacity-100'), 10);
            btnNext.innerHTML = 'Lanjut Kemasan <i data-lucide="arrow-right" class="w-4 h-4"></i>';
        } else {
            btnPrev.classList.remove('hidden');
            setTimeout(() => btnPrev.classList.add('opacity-100'), 10);
            
            if (this.currentStep === 2) btnNext.innerHTML = 'Lanjut Target Profit <i data-lucide="arrow-right" class="w-4 h-4"></i>';
            else if (this.currentStep === 3) btnNext.innerHTML = 'Lihat Hasil Akhir <i data-lucide="arrow-right" class="w-4 h-4"></i>';
            else if (this.currentStep === 4) btnNext.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> Simpan Resep';
        }
        
        if(window.lucide) lucide.createIcons();
    },

    currentRecipe: null,
    platforms: [],
    ingredientsDict: {},
    masterIngredients: [],

    init() {
        PerformanceProfiler.startTimer('ui-init');
        this.loadData();
        this.bindEvents();
        
        // Initial load
        this.switchRecipe('r01');
        this.updateStepperUI();
        
        PerformanceProfiler.endTimer('ui-init');
    },

    loadData() {
        const savedPlatforms = localStorage.getItem('warunk_arsi_platforms');
        if (savedPlatforms) {
            try {
                this.platforms = JSON.parse(savedPlatforms);
            } catch(e) {
                this.platforms = JSON.parse(JSON.stringify(goldenPlatforms));
            }
        } else {
            this.platforms = JSON.parse(JSON.stringify(goldenPlatforms));
        }

        const savedIngs = localStorage.getItem('warunk_arsi_master_ingredients');
        if (savedIngs) {
            try {
                this.masterIngredients = JSON.parse(savedIngs);
            } catch(e) {
                this.masterIngredients = JSON.parse(JSON.stringify(goldenIngredients));
            }
        } else {
            this.masterIngredients = JSON.parse(JSON.stringify(goldenIngredients));
        }

        this.masterIngredients.forEach(ing => {
            this.ingredientsDict[ing.id] = ing;
        });
    },

    bindEvents() {
        const selRecipe = document.getElementById('selRecipeMock');
        if (selRecipe) {
            selRecipe.addEventListener('change', (e) => {
                if(e.target.value === 'new') {
                    this.startNewRecipe();
                } else {
                    this.switchRecipe(e.target.value);
                }
            });
        }
        
        // Modal Events
        const btnOpenAddIngredient = document.getElementById('btnOpenAddIngredient');
        const modalAddIngredient = document.getElementById('modalAddIngredient');
        const btnCloseModalIngredient = document.getElementById('btnCloseModalIngredient');
        const modalBackdrop = document.getElementById('modalAddIngredientBackdrop');
        const inpSearchIngredient = document.getElementById('inpSearchIngredient');

        if(btnOpenAddIngredient && modalAddIngredient) {
            btnOpenAddIngredient.addEventListener('click', () => {
                modalAddIngredient.classList.remove('hidden');
                this.renderIngredientSearch(''); // Render all initially
                inpSearchIngredient.value = '';
                inpSearchIngredient.focus();
            });
            
            const closeModal = () => modalAddIngredient.classList.add('hidden');
            if(btnCloseModalIngredient) btnCloseModalIngredient.addEventListener('click', closeModal);
            if(modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
            
            if(inpSearchIngredient) {
                inpSearchIngredient.addEventListener('input', (e) => {
                    this.renderIngredientSearch(e.target.value.toLowerCase());
                });
            }
        }
        
        // Add Variable Cost
        const btnAddVarCost = document.getElementById('btnAddVarCost');
        if(btnAddVarCost) {
            btnAddVarCost.addEventListener('click', () => {
                this.addVariableCost();
            });
        }
        
        // Platform Config Modal Events
        const btnOpenPlatformConfig = document.getElementById('btnOpenPlatformConfig');
        const modalConfigPlatform = document.getElementById('modalConfigPlatform');
        const btnCloseModalConfig = document.getElementById('btnCloseModalConfig');
        const modalConfigPlatformBackdrop = document.getElementById('modalConfigPlatformBackdrop');
        const btnSavePlatform = document.getElementById('btnSavePlatform');
        const btnResetPlatform = document.getElementById('btnResetPlatform');

        if(btnOpenPlatformConfig && modalConfigPlatform) {
            btnOpenPlatformConfig.addEventListener('click', () => {
                modalConfigPlatform.classList.remove('hidden');
                this.renderPlatformConfig();
            });

            const closeConfigModal = () => modalConfigPlatform.classList.add('hidden');
            if(btnCloseModalConfig) btnCloseModalConfig.addEventListener('click', closeConfigModal);
            if(modalConfigPlatformBackdrop) modalConfigPlatformBackdrop.addEventListener('click', closeConfigModal);

            if(btnSavePlatform) btnSavePlatform.addEventListener('click', () => this.savePlatformConfig());
            if(btnResetPlatform) btnResetPlatform.addEventListener('click', () => this.resetPlatformConfig());
        }

        const inpYield = document.getElementById('inpYield');
        if (inpYield) {
            inpYield.addEventListener('input', (e) => {
                if(this.currentRecipe) {
                    this.currentRecipe.yieldQty = parseInt(e.target.value) || 1;
                    this.recalculate();
                }
            });
        }

        const inpWeight = document.getElementById('inpWeight');
        if (inpWeight) {
            inpWeight.addEventListener('input', (e) => {
                if(this.currentRecipe) {
                    this.currentRecipe.cookedWeight = parseInt(e.target.value) || 0;
                    // No need to recalculate HPP as weight is informational
                }
            });
        }

        const inpMargin = document.getElementById('inpMargin');
        const sliderMargin = document.getElementById('sliderMargin');
        if (inpMargin && sliderMargin) {
            inpMargin.addEventListener('input', (e) => {
                let val = parseInt(e.target.value);
                if(val > 100) val = 100; if(val < 0) val = 0;
                sliderMargin.value = val;
                document.getElementById('targetMarginLabel').innerText = val + '%';
                this.recalculate();
            });
            sliderMargin.addEventListener('input', (e) => {
                inpMargin.value = e.target.value;
                document.getElementById('targetMarginLabel').innerText = e.target.value + '%';
                this.recalculate();
            });
        }

        const btnExportCsv = document.getElementById('btnExportCsv');
        if (btnExportCsv) {
            btnExportCsv.addEventListener('click', () => {
                if (!window.PremiumService || !window.PremiumService.isPremium()) {
                    window.openPremiumModal && window.openPremiumModal();
                    return;
                }
                const results = hppState.get().calculationResults;
                if (!results) return;
                const recipeName = document.getElementById('selRecipeMock').options[document.getElementById('selRecipeMock').selectedIndex].text;
                ExportService.exportCSV(results, recipeName);
            });
        }
        
        const btnExportJson = document.getElementById('btnExportJson');
        if (btnExportJson) {
            btnExportJson.addEventListener('click', () => {
                if (!window.PremiumService || !window.PremiumService.isPremium()) {
                    window.openPremiumModal && window.openPremiumModal();
                    return;
                }
                const results = hppState.get().calculationResults;
                if (!results) return;
                const recipeName = document.getElementById('selRecipeMock').options[document.getElementById('selRecipeMock').selectedIndex].text;
                ExportService.exportJSON(results, recipeName);
            });
        }
        
        const btnSaveRecipeTop = document.getElementById('btnSaveRecipeTop');
        if (btnSaveRecipeTop) {
            btnSaveRecipeTop.addEventListener('click', () => {
                if (!window.PremiumService || !window.PremiumService.isPremium()) {
                    window.openPremiumModal && window.openPremiumModal();
                    return;
                }
                this.saveCurrentRecipe();
            });
        }
    },

    saveCurrentRecipe() {
        if (!this.currentRecipe) return;
        let saved = [];
        try {
            const existing = localStorage.getItem('warunk_arsi_recipes');
            if (existing) saved = JSON.parse(existing);
        } catch(e) {}
        
        // Check if exists
        const idx = saved.findIndex(r => r.id === this.currentRecipe.id);
        if (idx >= 0) saved[idx] = this.currentRecipe;
        else saved.push(this.currentRecipe);
        
        localStorage.setItem('warunk_arsi_recipes', JSON.stringify(saved));
        this.showToast('Resep Disimpan', 'Data resep berhasil disimpan ke memori lokal.');
    },

    showToast(title, message) {
        const toast = document.getElementById('toastNotification');
        if (!toast) return;
        document.getElementById('toastTitle').innerText = title;
        document.getElementById('toastMessage').innerText = message;
        
        toast.classList.remove('translate-x-full', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
        }, 3000);
    },

    switchRecipe(recipeId) {
        const recipe = goldenRecipes.find(r => r.id === recipeId);
        if(!recipe) return;
        
        // Deep copy
        this.currentRecipe = JSON.parse(JSON.stringify(recipe));
        document.getElementById('inpYield').value = this.currentRecipe.yieldQty;
        
        const inpWeight = document.getElementById('inpWeight');
        if (inpWeight) inpWeight.value = this.currentRecipe.cookedWeight || 250;
        
        this.renderIngredientsTable();
        this.renderVariableCosts();
        this.recalculate();
    },

    startNewRecipe() {
        this.currentRecipe = {
            id: 'new_' + Date.now(),
            name: 'Resep Baru',
            yieldQty: 1,
            cookedWeight: 250,
            ingredients: [],
            variableCosts: []
        };
        document.getElementById('inpYield').value = 1;
        const inpWeight = document.getElementById('inpWeight');
        if (inpWeight) inpWeight.value = 250;
        
        this.renderIngredientsTable();
        this.renderVariableCosts();
        this.recalculate();
    },

    renderIngredientSearch(query) {
        const list = document.getElementById('listSearchResults');
        if(!list) return;
        
        let html = '';
        this.masterIngredients.forEach(master => {
            if(query && !master.name.toLowerCase().includes(query) && !master.category.toLowerCase().includes(query)) {
                return; // skip
            }
            const price = master.price || (master.unitPrice * (master.baseQty || 1));
            const baseQty = master.baseQty || master.packagingSize || 1;
            const buyUnit = master.unit || master.buyUnit || 'gram';
            
            html += `
                <div class="p-3 border-b border-slate-100 hover:bg-slate-50 flex justify-between items-center cursor-pointer transition-colors" onclick="window.appController.addIngredient('${master.id}')">
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm">${master.name}</h4>
                        <p class="text-xs text-slate-500">${CurrencyUtils.format(price)} / ${baseQty} ${buyUnit}</p>
                    </div>
                    <button class="bg-wa-50 text-wa-800 p-1.5 rounded-lg hover:bg-wa-100 transition-colors">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
        });
        
        if(html === '') {
            html = '<div class="p-4 text-center text-slate-500 text-sm">Pencarian tidak ditemukan.</div>';
        }
        
        list.innerHTML = html;
        if(window.lucide) lucide.createIcons();
    },

    addIngredient(masterId) {
        if(!this.currentRecipe) return;
        
        // Check if already exists, just focus or something, but we allow duplicates for simplicity
        this.currentRecipe.ingredients.push({
            ingredientId: masterId,
            usedQty: 1
        });
        
        // Close modal
        document.getElementById('modalAddIngredient').classList.add('hidden');
        
        this.renderIngredientsTable();
        this.recalculate();
    },

    updateIngredientQty(idx, newQty) {
        if(this.currentRecipe && this.currentRecipe.ingredients[idx]) {
            this.currentRecipe.ingredients[idx].usedQty = parseFloat(newQty) || 0;
            this.renderIngredientsTable(); // Re-render to update row total
            this.recalculate();
        }
    },

    removeIngredient(idx) {
        if(this.currentRecipe) {
            this.currentRecipe.ingredients.splice(idx, 1);
            this.renderIngredientsTable();
            this.recalculate();
        }
    },

    renderIngredientsTable() {
        const tbody = document.getElementById('ingredientsTableBody');
        if(!tbody || !this.currentRecipe) return;
        
        let html = '';
        this.currentRecipe.ingredients.forEach((ing, idx) => {
            const master = this.ingredientsDict[ing.ingredientId] || this.ingredientsDict[ing.id];
            if(!master) return;
            
            const price = master.price || (master.unitPrice * (master.baseQty || 1));
            const baseQty = master.baseQty || master.packagingSize || 1;
            const buyUnit = master.unit || master.buyUnit || 'gram';
            
            const unitPrice = price / baseQty;
            const rowTotal = unitPrice * ing.usedQty;

            html += `
                <tr class="hover:bg-slate-50 transition-colors group">
                    <td class="p-5">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-wa-50 border border-wa-100 flex items-center justify-center shrink-0">
                                <i data-lucide="leaf" class="w-5 h-5 text-wa-600"></i>
                            </div>
                            <div>
                                <p class="font-bold text-slate-800 text-sm">${master.name}</p>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${master.category}</p>
                            </div>
                        </div>
                    </td>
                    <td class="p-5">
                        <input type="number" value="${ing.usedQty}" onchange="window.appController.updateIngredientQty(${idx}, this.value)" class="w-20 font-bold p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-wa-500 focus:border-transparent outline-none transition-shadow hover:shadow-sm bg-white text-slate-700">
                    </td>
                    <td class="p-5 text-sm font-medium text-slate-500">${buyUnit}</td>
                    <td class="p-5 text-right">
                        <div class="text-sm font-semibold text-slate-700">${CurrencyUtils.format(price)}</div>
                        <div class="text-[10px] font-medium text-slate-400 mt-0.5">per ${baseQty} ${buyUnit}</div>
                    </td>
                    <td class="p-5 text-right font-black text-slate-800">${CurrencyUtils.format(rowTotal)}</td>
                    <td class="p-5 text-center">
                        <button onclick="window.appController.removeIngredient(${idx})" class="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        if(window.lucide) lucide.createIcons();
    },

    renderVariableCosts() {
        const container = document.getElementById('additionalCostsContainer');
        if(!container || !this.currentRecipe) return;

        let html = '';
        this.currentRecipe.variableCosts.forEach((vc, idx) => {
            html += `
                <div class="flex items-center justify-between group bg-slate-50 border border-slate-100 p-2 rounded-xl hover:border-slate-300 transition-colors">
                    <div class="flex items-center gap-3 w-1/2">
                        <div class="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 shrink-0">
                            <i data-lucide="package-open" class="w-4 h-4"></i>
                        </div>
                        <input type="text" value="${vc.name}" oninput="window.appController.updateVarCostName(${idx}, this.value)" placeholder="Nama Biaya..." class="w-full bg-transparent text-sm font-bold text-slate-700 focus:outline-none focus:border-wa-500 border-b border-transparent focus:bg-white px-1">
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="number" value="${vc.amount}" oninput="window.appController.updateVarCostAmount(${idx}, this.value)" class="w-24 sm:w-28 p-1 bg-transparent text-right font-black text-slate-800 text-sm focus:outline-none focus:border-wa-500 border-b border-transparent focus:bg-white rounded transition-colors" placeholder="0">
                        <button onclick="window.appController.removeVariableCost(${idx})" class="text-slate-300 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100">
                            <i data-lucide="x" class="w-3.5 h-3.5"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        if(this.currentRecipe.variableCosts.length === 0) {
            html = '<div class="text-center text-sm text-slate-400 p-4 border border-dashed border-slate-200 rounded-xl">Belum ada biaya tambahan. Klik + Baris untuk menambah.</div>';
        }
        
        container.innerHTML = html;
        if(window.lucide) lucide.createIcons();
    },

    addVariableCost() {
        if(!this.currentRecipe) return;
        this.currentRecipe.variableCosts.push({
            name: 'Biaya Baru',
            amount: 0
        });
        this.renderVariableCosts();
        this.recalculate();
    },
    
    updateVarCostName(idx, newName) {
        if(this.currentRecipe && this.currentRecipe.variableCosts[idx]) {
            this.currentRecipe.variableCosts[idx].name = newName;
            // no need to recalculate for name change
        }
    },
    
    updateVarCostAmount(idx, newAmount) {
        if(this.currentRecipe && this.currentRecipe.variableCosts[idx]) {
            this.currentRecipe.variableCosts[idx].amount = parseFloat(newAmount) || 0;
            this.recalculate();
        }
    },
    
    removeVariableCost(idx) {
        if(this.currentRecipe) {
            this.currentRecipe.variableCosts.splice(idx, 1);
            this.renderVariableCosts();
            this.recalculate();
        }
    },

    recalculate() {
        if(!this.currentRecipe) return;

        PerformanceProfiler.startTimer('hpp-calc');
        
        let totalBahanCost = 0;
        const logs = [];
        this.currentRecipe.ingredients.forEach(ing => {
            const master = this.ingredientsDict[ing.ingredientId] || this.ingredientsDict[ing.id];
            if(master) {
                const price = master.price || (master.unitPrice * (master.baseQty || 1));
                const baseQty = master.baseQty || master.packagingSize || 1;
                const unitPrice = price / baseQty;
                
                const row = unitPrice * ing.usedQty;
                totalBahanCost += row;
                logs.push({ item: master.name, formula: 'live calculation', result: row });
            }
        });

        let totalVariable = 0;
        this.currentRecipe.variableCosts.forEach(vc => totalVariable += vc.amount);

        const grandTotal = totalBahanCost + totalVariable;
        const hppPorsi = HPPEngine.calculateHppPerPortion(grandTotal, this.currentRecipe.yieldQty);

        PerformanceProfiler.endTimer('hpp-calc');

        // Update UI
        document.getElementById('uiTotalBahan').innerText = CurrencyUtils.format(totalBahanCost);
        document.getElementById('sumBahan').innerText = CurrencyUtils.format(totalBahanCost);
        
        document.getElementById('uiTotalTambahan').innerText = CurrencyUtils.format(totalVariable);
        document.getElementById('sumTambahan').innerText = CurrencyUtils.format(totalVariable);
        
        document.getElementById('sumProduksi').innerText = CurrencyUtils.format(grandTotal);
        document.getElementById('sumHppPorsi').innerText = CurrencyUtils.format(hppPorsi);
        document.getElementById('sumPorsiDiv').innerText = `BERDASARKAN ${this.currentRecipe.yieldQty} PORSI`;

        this.renderPlatformCards(hppPorsi);
        
        hppState.setCalculationResults({
            totalBahanCost,
            totalVariable,
            totalFixed: 0,
            grandTotal,
            hppPerPortion: hppPorsi,
            logs
        });
    },

    renderPlatformCards(hppPorsi) {
        const containerOffline = document.getElementById('platformCardsOffline');
        const containerOnline = document.getElementById('platformCardsOnline');
        if(!containerOffline || !containerOnline) return;

        const targetMarginPct = parseFloat(document.getElementById('inpMargin').value) || 0;
        const targetProfitNominal = hppPorsi * (targetMarginPct / 100);

        let htmlOffline = '';
        let htmlOnline = '';
        
        this.platforms.forEach(platform => {
            const preset = platform.presets[0];
            
            let recommendedPrice = 0;
            let netProfit = 0;
            let finalMargin = 0;
            
            try {
                recommendedPrice = PricingEngine.calculateRecommendedPrice(hppPorsi, targetProfitNominal, preset);
                recommendedPrice = Math.ceil(recommendedPrice / 500) * 500; // Rounding
                
                netProfit = PricingEngine.calculateNetProfit(recommendedPrice, hppPorsi, preset);
                finalMargin = (netProfit / recommendedPrice) * 100;
            } catch(e) {
                recommendedPrice = 0;
            }

            // Colors based on platform name
            let badgeColors = 'bg-slate-100 text-slate-700';
            let iconColors = 'text-slate-600 bg-slate-100';
            let borderStyle = 'border-slate-200/60';
            let shadowStyle = 'shadow-[0_2px_12px_rgba(0,0,0,0.03)]';
            
            const isOffline = platform.id.includes('offline');
            
            if(isOffline) { 
                iconColors = 'text-wa-700 bg-wa-50'; 
                badgeColors = 'bg-wa-100 text-wa-800'; 
                borderStyle = 'border-wa-200';
                shadowStyle = 'shadow-[0_8px_24px_rgba(34,197,94,0.12)] ring-1 ring-wa-500/20'; 
            }
            if(platform.id.includes('shopeefood')) { iconColors = 'text-[#ee4d2d] bg-[#ee4d2d]/10'; badgeColors = 'bg-[#ee4d2d]/10 text-[#ee4d2d]'; }
            if(platform.id.includes('grabfood')) { iconColors = 'text-[#00b14f] bg-[#00b14f]/10'; badgeColors = 'bg-[#00b14f]/10 text-[#00b14f]'; }
            if(platform.id.includes('gofood')) { iconColors = 'text-[#ee2737] bg-[#ee2737]/10'; badgeColors = 'bg-[#ee2737]/10 text-[#ee2737]'; }

            const cardHtml = `
                <div class="hover-card bg-white rounded-2xl border ${borderStyle} ${shadowStyle} p-6 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-5">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl ${iconColors} flex items-center justify-center">
                                    <i data-lucide="store" class="w-5 h-5"></i>
                                </div>
                                <h4 class="font-extrabold text-slate-800">${platform.name}</h4>
                            </div>
                        </div>
                        
                        <div class="inline-block px-2.5 py-1 rounded-md ${badgeColors} text-[10px] font-extrabold uppercase tracking-widest mb-3">
                            ${preset.commission > 0 ? preset.commission+'% Komisi' : 'Tanpa Komisi'}
                        </div>
                        
                        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rekomendasi Harga</p>
                        <p class="text-3xl font-black text-slate-800 mb-2">${CurrencyUtils.format(recommendedPrice)}</p>
                    </div>
                    
                    <div class="mt-6 pt-5 border-t border-slate-100 border-dashed">
                        <div class="flex justify-between items-end mb-2">
                            <span class="text-xs font-semibold text-slate-500">Net Profit</span>
                            <span class="font-bold text-slate-800">${CurrencyUtils.format(netProfit)}</span>
                        </div>
                        <div class="flex justify-between items-end">
                            <span class="text-xs font-semibold text-slate-500">Real Margin</span>
                            <span class="font-black text-sm ${finalMargin >= targetMarginPct ? 'text-wa-600' : 'text-orange-500'}">
                                ${finalMargin.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            if(isOffline) {
                htmlOffline += cardHtml;
            } else {
                htmlOnline += cardHtml;
            }
        });
        
        containerOffline.innerHTML = htmlOffline;
        containerOnline.innerHTML = htmlOnline;
        if(window.lucide) lucide.createIcons();
    },

    renderPlatformConfig() {
        const container = document.getElementById('platformConfigContainer');
        if(!container) return;

        let html = '<div class="space-y-4">';
        this.platforms.forEach((platform, index) => {
            const preset = platform.presets[0];
            html += `
                <div class="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div class="w-full sm:w-1/3">
                        <h4 class="font-bold text-slate-800">${platform.name}</h4>
                    </div>
                    <div class="w-full sm:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Komisi (%)</label>
                            <input type="number" id="cfg_comm_${index}" value="${preset.commission}" min="0" max="100" class="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-wa-500 focus:border-wa-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service Fee (Rp)</label>
                            <input type="number" id="cfg_srv_${index}" value="${preset.serviceFee}" min="0" class="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-wa-500 focus:border-wa-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pajak (%)</label>
                            <input type="number" id="cfg_tax_${index}" value="${preset.tax}" min="0" max="100" class="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-wa-500 focus:border-wa-500 outline-none">
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    },

    savePlatformConfig() {
        this.platforms.forEach((platform, index) => {
            const commVal = parseFloat(document.getElementById(`cfg_comm_${index}`).value) || 0;
            const srvVal = parseFloat(document.getElementById(`cfg_srv_${index}`).value) || 0;
            const taxVal = parseFloat(document.getElementById(`cfg_tax_${index}`).value) || 0;
            
            platform.presets[0].commission = commVal;
            platform.presets[0].serviceFee = srvVal;
            platform.presets[0].tax = taxVal;
        });

        localStorage.setItem('warunk_arsi_platforms', JSON.stringify(this.platforms));
        document.getElementById('modalConfigPlatform').classList.add('hidden');
        
        this.recalculate();
    },

    resetPlatformConfig() {
        if(confirm('Anda yakin ingin mereset semua pengaturan platform ke versi standar (Golden Dataset)?')) {
            localStorage.removeItem('warunk_arsi_platforms');
            this.platforms = JSON.parse(JSON.stringify(goldenPlatforms));
            this.renderPlatformConfig();
            this.recalculate();
        }
    }
};
