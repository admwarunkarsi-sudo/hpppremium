import { AppState, AppController } from './hpp.js';
import { ChartEngine } from './charts.js';
import { formatRupiah, parseRupiah } from './utils/currency.js';
import { formatPercent } from './utils/formatter.js';
import { HPPEngine } from './engine/hppEngine.js';
import { PricingEngine } from './engine/pricingEngine.js';
import { PlatformEngine } from './engine/platformEngine.js';
import { SimulationEngine } from './engine/simulationEngine.js';
import { debounce } from './utils/debounce.js';

const UI = {
    init() {
        ChartEngine.init();
        this.bindEvents();
        this.renderInitialData();
        this.recalculateAll();
    },

    bindEvents() {
        // Recipe inputs
        document.getElementById('recipeName').addEventListener('input', debounce(() => this.recalculateAll(), 300));
        document.getElementById('recipeYield').addEventListener('input', debounce(() => this.recalculateAll(), 300));
        
        // Modal Bahan
        document.getElementById('btnAddBahan').addEventListener('click', () => {
            document.getElementById('modalBahan').classList.remove('hidden');
            this.renderMasterBahanList();
        });
        document.getElementById('btnCloseModalBahan').addEventListener('click', () => {
            document.getElementById('modalBahan').classList.add('hidden');
        });
        document.getElementById('searchBahan').addEventListener('input', debounce((e) => {
            this.renderMasterBahanList(e.target.value);
        }, 300));

        // Fixed/Variable Costs
        document.getElementById('btnAddVariableCost').addEventListener('click', () => this.addCostItem('variable'));
        document.getElementById('toggleFixedCost').addEventListener('change', (e) => {
            AppState.uiConfig.includeFixedCost = e.target.checked;
            this.recalculateAll();
        });

        // Profit
        document.getElementById('profitType').addEventListener('change', () => this.recalculateAll());
        document.getElementById('profitValue').addEventListener('input', debounce(() => this.recalculateAll(), 300));
        document.getElementById('roundingConfig').addEventListener('change', () => this.recalculateAll());

        // Simulations
        document.getElementById('simMaterial').addEventListener('input', (e) => {
            document.getElementById('lblSimMaterial').innerText = `${e.target.value}%`;
            AppState.uiConfig.materialIncrease = parseInt(e.target.value);
            this.recalculateAll();
        });
        document.getElementById('simProfit').addEventListener('input', (e) => {
            document.getElementById('lblSimProfit').innerText = `${e.target.value}%`;
            AppState.uiConfig.profitTargetSim = parseInt(e.target.value);
            this.recalculateAll();
        });

        // Export PDF
        document.getElementById('btnExportPdf').addEventListener('click', () => {
            const element = document.getElementById('exportContent');
            const opt = {
                margin:       0.5,
                filename:     'Kalkulator-HPP-Warunk-Arsi.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });

        // Print
        document.getElementById('btnPrint').addEventListener('click', () => {
            window.print();
        });
    },

    renderInitialData() {
        if (AppState.recipe) {
            document.getElementById('recipeName').value = AppState.recipe.name || "";
            document.getElementById('recipeCategory').value = AppState.recipe.kategori || "";
            document.getElementById('recipeYield').value = AppState.recipe.yield || 1;
            document.getElementById('recipeRawWeight').value = AppState.recipe.beratMentah || 0;
            
            this.renderRecipeBahan(AppState.recipe.bahan);
        }
        
        this.renderPlatformConfig();
    },

    renderRecipeBahan(bahanList) {
        const tbody = document.getElementById('tableBahanBody');
        tbody.innerHTML = '';
        
        bahanList.forEach((rb, index) => {
            const master = AppState.bahan.find(b => b.id === rb.id);
            if (!master) return;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-4 py-3 font-medium">${master.name}</td>
                <td class="px-4 py-3 text-right">${formatRupiah(master.hargaBeli)}</td>
                <td class="px-4 py-3 text-right">
                    <input type="number" class="w-20 border rounded px-2 py-1 text-right qty-bahan" data-index="${index}" value="${rb.jumlahDipakai}"> ${rb.satuanPakai}
                </td>
                <td class="px-4 py-3 text-right subtotal-bahan">...</td>
                <td class="px-4 py-3 text-center">
                    <button class="text-danger hover:text-red-700 btn-hapus-bahan" data-index="${index}"><i data-lucide="trash-2" class="w-4 h-4 mx-auto"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        lucide.createIcons();
        
        document.querySelectorAll('.qty-bahan').forEach(input => {
            input.addEventListener('input', debounce((e) => {
                const idx = e.target.getAttribute('data-index');
                AppState.recipe.bahan[idx].jumlahDipakai = parseFloat(e.target.value) || 0;
                this.recalculateAll();
            }, 300));
        });

        document.querySelectorAll('.btn-hapus-bahan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                AppState.recipe.bahan.splice(idx, 1);
                this.renderRecipeBahan(AppState.recipe.bahan);
                this.recalculateAll();
            });
        });
    },

    renderMasterBahanList(query = '') {
        const list = document.getElementById('listBahan');
        list.innerHTML = '';
        let filtered = AppState.bahan;
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(b => b.name.toLowerCase().includes(lowerQuery));
        }
        
        filtered.forEach(b => {
            const div = document.createElement('div');
            div.className = "flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer";
            div.innerHTML = `
                <div>
                    <p class="font-medium text-gray-800">${b.name}</p>
                    <p class="text-xs text-gray-500">${formatRupiah(b.hargaBeli)} / ${b.isiKemasan} ${b.satuanBeli}</p>
                </div>
                <button class="px-3 py-1 bg-secondary text-white rounded text-sm btn-pilih-bahan" data-id="${b.id}">Pilih</button>
            `;
            list.appendChild(div);
        });
        
        document.querySelectorAll('.btn-pilih-bahan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (!AppState.recipe) AppState.recipe = { bahan: [] };
                if (!AppState.recipe.bahan) AppState.recipe.bahan = [];
                
                AppState.recipe.bahan.push({
                    id: id,
                    jumlahDipakai: 100,
                    satuanPakai: "u_g"
                });
                
                document.getElementById('modalBahan').classList.add('hidden');
                this.renderRecipeBahan(AppState.recipe.bahan);
                this.recalculateAll();
            });
        });
    },
    
    addCostItem(type) {
        console.log("Add cost item:", type);
    },

    renderPlatformConfig() {
        const container = document.getElementById('platformConfigContainer');
        container.innerHTML = '';
        const platforms = PlatformEngine.getPlatforms();
        
        platforms.forEach(p => {
            const defaultPreset = p.presets[0];
            const div = document.createElement('div');
            div.className = "p-3 border border-gray-100 rounded-lg bg-gray-50 flex flex-col gap-2";
            div.innerHTML = `
                <div class="flex justify-between items-center font-bold" style="color: ${p.warna}">
                    ${p.name}
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                        <label class="text-xs text-gray-500">Komisi (%)</label>
                        <input type="number" class="w-full border rounded p-1 text-right cfg-komisi" data-id="${p.id}" value="${defaultPreset.komisi}">
                    </div>
                    <div>
                        <label class="text-xs text-gray-500">Potongan Nominal</label>
                        <input type="number" class="w-full border rounded p-1 text-right cfg-nominal" data-id="${p.id}" value="${defaultPreset.biayaTetap}">
                    </div>
                </div>
            `;
            container.appendChild(div);
        });
    },

    recalculateAll() {
        if (!AppState.recipe) return;
        
        // 1. Calculate Bahan
        const bahanCalculation = HPPEngine.calculateBahanCost(AppState.recipe.bahan || [], AppState.bahan);
        document.getElementById('totalBiayaBahan').innerText = formatRupiah(bahanCalculation.totalCost);
        
        const subtotalCells = document.querySelectorAll('.subtotal-bahan');
        bahanCalculation.details.forEach((d, i) => {
            if (subtotalCells[i]) subtotalCells[i].innerText = formatRupiah(d.cost);
        });
        
        // 2. Simulate material increase
        const simTotalBahanCost = SimulationEngine.simulateMaterialCostIncrease(bahanCalculation.totalCost, AppState.uiConfig.materialIncrease);
        
        // 3. Calculate Total HPP
        const vCosts = []; 
        const fCosts = []; 
        let totalHpp = HPPEngine.calculateTotalHPP(simTotalBahanCost, vCosts, fCosts, AppState.uiConfig.includeFixedCost);
        
        const yieldQty = parseInt(document.getElementById('recipeYield').value) || 1;
        const hppPerPorsi = totalHpp / yieldQty;
        
        // 4. Update UI KPIs
        document.getElementById('kpiTotalHpp').innerText = formatRupiah(totalHpp);
        document.getElementById('kpiHppPerPorsi').innerText = formatRupiah(hppPerPorsi);
        
        // 5. Calculate Pricing for each platform
        const profitType = document.getElementById('profitType').value;
        const profitValueInput = parseFloat(document.getElementById('profitValue').value) || 0;
        
        const simProfit = AppState.uiConfig.profitTargetSim;
        const actualProfitVal = simProfit !== 20 ? simProfit : profitValueInput;
        
        let targetLabaNominal = 0;
        if (profitType === 'percentage' || simProfit !== 20) {
            targetLabaNominal = hppPerPorsi * (actualProfitVal / 100);
        } else {
            targetLabaNominal = actualProfitVal;
        }
        
        const rounding = parseInt(document.getElementById('roundingConfig').value) || 0;
        
        const priceCardsContainer = document.getElementById('priceCardsContainer');
        priceCardsContainer.innerHTML = '';
        
        const platforms = PlatformEngine.getPlatforms();
        let maxOnlinePrice = 0;
        let offlinePrice = 0;
        let offlineMargin = 0;
        
        const marginsForChart = [];
        const aiInsights = [];
        
        platforms.forEach(p => {
            const config = p.presets[0]; 
            let rawPrice = PricingEngine.calculateSellingPrice(hppPerPorsi, targetLabaNominal, config);
            let finalPrice = PricingEngine.roundPrice(rawPrice, rounding);
            
            const margin = PricingEngine.calculateMargin(finalPrice, hppPerPorsi, config);
            const netProfit = PricingEngine.calculateNetProfit(finalPrice, hppPerPorsi, config);
            
            marginsForChart.push(margin);
            
            if (p.id === 'plat_offline') {
                offlinePrice = finalPrice;
                offlineMargin = margin;
            } else {
                if (finalPrice > maxOnlinePrice) maxOnlinePrice = finalPrice;
            }
            
            // Insight Engine Rules
            if (margin < 10) aiInsights.push(`Margin ${p.name} terlalu rendah (${formatPercent(margin)}). Pertimbangkan naikkan harga.`);
            if (margin > 35) aiInsights.push(`Harga ${p.name} cukup tinggi (${formatPercent(margin)}). Pastikan kompetitif.`);
            
            // Render Price Card
            const card = document.createElement('div');
            card.className = "p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4";
            
            let badgeClass = "badge-success";
            let statusText = "Margin Aman";
            if (margin < 15) { badgeClass = "badge-warning"; statusText = "Margin Tipis"; }
            if (margin < 0) { badgeClass = "badge-danger"; statusText = "Rugi"; }
            
            card.innerHTML = `
                <div>
                    <p class="font-bold text-gray-800" style="color: ${p.warna}">${p.name}</p>
                    <p class="text-2xl font-black text-gray-900">${formatRupiah(finalPrice)}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500">Laba Bersih: <span class="font-bold text-gray-800">${formatRupiah(netProfit)}</span></p>
                    <div class="mt-1">
                        <span class="badge ${badgeClass}">${statusText} (${formatPercent(margin)})</span>
                    </div>
                </div>
            `;
            priceCardsContainer.appendChild(card);
        });
        
        // AI Rules Cross-Platform
        if (maxOnlinePrice > offlinePrice * 1.25) {
            aiInsights.push(`Perbedaan harga offline dan online cukup besar (>25%). Pertimbangkan strategi komunikasi ke pelanggan.`);
        }
        
        // Update Insights
        const insightContainer = document.getElementById('aiInsightContainer');
        insightContainer.innerHTML = '';
        if (aiInsights.length === 0) {
            insightContainer.innerHTML = `<div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">Analisis normal, semua perhitungan dalam batas wajar.</div>`;
        } else {
            aiInsights.forEach(insight => {
                insightContainer.innerHTML += `
                    <div class="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex gap-2">
                        <i data-lucide="info" class="w-4 h-4 shrink-0 mt-0.5 text-blue-500"></i>
                        <p>${insight}</p>
                    </div>
                `;
            });
        }
        lucide.createIcons();

        // Update KPIs
        document.getElementById('kpiHargaOffline').innerText = formatRupiah(offlinePrice);
        document.getElementById('kpiHargaOnline').innerText = formatRupiah(maxOnlinePrice);
        
        document.getElementById('kpiNetProfit').innerText = formatRupiah(targetLabaNominal); 
        document.getElementById('kpiMargin').innerText = formatPercent(offlineMargin);
        
        const fcPerc = HPPEngine.calculateFoodCostPercentage(hppPerPorsi, offlinePrice);
        document.getElementById('kpiFoodCost').innerText = formatPercent(fcPerc);
        
        let totalFixed = 0; 
        let contributionMargin = offlinePrice - hppPerPorsi;
        let bep = contributionMargin > 0 ? Math.ceil(totalFixed / contributionMargin) : 0;
        document.getElementById('kpiBEP').innerText = `${bep} Porsi`;
        
        // Update Charts
        ChartEngine.updateHppPieChart(simTotalBahanCost, 0, 0); 
        ChartEngine.updateMarginBarChart(marginsForChart);
    }
};

document.addEventListener('appReady', () => {
    UI.init();
});
