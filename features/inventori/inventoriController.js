export const InventoriController = {
    ingredients: [],
    
    init() {
        this.loadData();
        this.bindEvents();
        this.renderTable();
    },

    loadData() {
        const stored = localStorage.getItem('warunk_arsi_master_ingredients');
        if (stored) {
            this.ingredients = JSON.parse(stored);
        } else {
            this.ingredients = [];
        }
    },

    saveData() {
        localStorage.setItem('warunk_arsi_master_ingredients', JSON.stringify(this.ingredients));
        
        // Show Toast
        const toast = document.getElementById('toastNotification');
        if (toast) {
            document.getElementById('toastTitle').innerText = 'Inventori Diperbarui';
            document.getElementById('toastMessage').innerText = 'Data stok fisik berhasil disimpan.';
            toast.classList.remove('translate-x-full', 'opacity-0');
            setTimeout(() => toast.classList.add('translate-x-full', 'opacity-0'), 3000);
        }
    },

    bindEvents() {
        const btnSimpan = document.getElementById('btnSimpanInventori');
        const inpSearch = document.getElementById('inpSearchInventori');
        const selStatus = document.getElementById('selStatusInventori');

        if (btnSimpan) {
            btnSimpan.addEventListener('click', () => {
                this.saveStok();
            });
        }

        if (inpSearch) inpSearch.addEventListener('input', () => this.renderTable());
        if (selStatus) selStatus.addEventListener('change', () => this.renderTable());
    },

    saveStok() {
        // Grab all inputs
        const inputs = document.querySelectorAll('.inp-stok-fisik');
        inputs.forEach(input => {
            const id = input.getAttribute('data-id');
            const val = parseFloat(input.value) || 0;
            const item = this.ingredients.find(i => i.id === id);
            if (item) {
                item.stock = val;
            }
        });
        
        this.saveData();
        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('tableBodyInventori');
        const emptyState = document.getElementById('emptyStateInventori');
        const inpSearch = document.getElementById('inpSearchInventori');
        const selStatus = document.getElementById('selStatusInventori');
        
        if (!tbody || !emptyState) return;

        const q = (inpSearch ? inpSearch.value : '').toLowerCase();
        const stat = selStatus ? selStatus.value : 'all';

        let filtered = this.ingredients;
        
        // Filter text
        if (q) filtered = filtered.filter(i => i.name.toLowerCase().includes(q));
        
        // Filter status
        if (stat !== 'all') {
            filtered = filtered.filter(i => {
                const s = i.stock || 0;
                // Asumsi threshold low stock adalah 20% dari baseQty, atau statis < 500
                const threshold = (i.baseQty ?? i.packagingSize ?? 1000) * 0.2;
                if (stat === 'empty') return s <= 0;
                if (stat === 'low') return s > 0 && s <= threshold;
                return true;
            });
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');
            
            filtered.forEach(i => {
                const stock = i.stock || 0;
                const threshold = (i.baseQty ?? i.packagingSize ?? 1000) * 0.2;
                
                let statusBadge = '';
                if (stock <= 0) {
                    statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-600 flex items-center gap-1 w-max"><i data-lucide="alert-circle" class="w-3 h-3"></i> Habis</span>`;
                } else if (stock <= threshold) {
                    statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 flex items-center gap-1 w-max"><i data-lucide="alert-triangle" class="w-3 h-3"></i> Menipis</span>`;
                } else {
                    statusBadge = `<span class="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600 flex items-center gap-1 w-max"><i data-lucide="check-circle" class="w-3 h-3"></i> Aman</span>`;
                }

                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 transition-colors';
                tr.innerHTML = `
                    <td class="px-3 sm:px-6 py-4 font-semibold text-slate-800">${i.name}</td>
                    <td class="hidden sm:table-cell px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">${i.category}</span>
                    </td>
                    <td class="px-3 sm:px-6 py-4 text-center">
                        <div class="flex items-center justify-center gap-1 sm:gap-2">
                            <input type="number" min="0" data-id="${i.id}" value="${stock}" class="inp-stok-fisik w-20 sm:w-24 px-2 sm:px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-wa-500/20 focus:border-wa-500 outline-none transition-all">
                            <span class="text-[10px] sm:text-xs text-slate-500 font-medium w-8 text-left">${i.unit ?? i.buyUnit ?? 'gram'}</span>
                        </div>
                    </td>
                    <td class="px-3 sm:px-6 py-4">
                        ${statusBadge}
                    </td>
                `;
                tbody.appendChild(tr);
            });
            if (window.lucide) window.lucide.createIcons();
        }
    }
};

window.inventoriController = InventoriController;
