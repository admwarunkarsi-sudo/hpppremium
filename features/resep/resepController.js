import { goldenIngredients } from '../../tests/fixtures/warunkArsi/masterBahan.js';
import { CurrencyUtils } from '../../shared/utils/currency.js';

export const ResepController = {
    ingredients: [],

    init() {
        this.loadData();
        this.loadCategories();
        this.bindEvents();
        this.renderTable();
    },

    loadCategories() {
        let cats = [];
        try {
            const data = localStorage.getItem('warunk_arsi_categories');
            if (data) cats = JSON.parse(data);
        } catch(e) {}

        // Fallback if empty (should be initialized by PengaturanController, but just in case)
        if (cats.length === 0) {
            cats = [
                { name: 'PROTEIN' }, { name: 'KARBOHIDRAT' }, { name: 'SAYUR' },
                { name: 'BUMBU' }, { name: 'KERING' }, { name: 'CAIR' }, { name: 'LAINNYA' }
            ];
        }

        const selFilter = document.getElementById('selKategoriFilter');
        const inpForm = document.getElementById('inpBahanKategori');

        if (selFilter) {
            selFilter.innerHTML = '<option value="all">Semua Kategori</option>' + cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        }
        if (inpForm) {
            inpForm.innerHTML = cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
        }
    },

    loadData() {
        const stored = localStorage.getItem('warunk_arsi_master_ingredients');
        if (stored) {
            this.ingredients = JSON.parse(stored);
        } else {
            // Clone golden ingredients if local is empty
            this.ingredients = JSON.parse(JSON.stringify(goldenIngredients));
            this.saveData();
        }
    },

    saveData() {
        localStorage.setItem('warunk_arsi_master_ingredients', JSON.stringify(this.ingredients));
    },

    bindEvents() {
        const btnTambah = document.getElementById('btnTambahBahanMaster');
        const modalForm = document.getElementById('modalFormBahan');
        const btnClose = document.getElementById('btnCloseModalFormBahan');
        const btnCancel = document.getElementById('btnCancelFormBahan');
        const backdrop = document.getElementById('modalFormBahanBackdrop');
        const form = document.getElementById('formBahan');
        const inpSearch = document.getElementById('inpSearchMasterBahan');
        const selKategori = document.getElementById('selKategoriFilter');

        const closeModal = () => {
            modalForm.classList.add('hidden');
            form.reset();
            document.getElementById('inpBahanId').value = '';
            document.getElementById('modalBahanTitle').innerText = 'Tambah Bahan Baku';
        };

        if (btnTambah) btnTambah.addEventListener('click', () => {
            modalForm.classList.remove('hidden');
            document.getElementById('modalBahanTitle').innerText = 'Tambah Bahan Baku';
        });
        if (btnClose) btnClose.addEventListener('click', closeModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveIngredient();
                closeModal();
            });
        }

        if (inpSearch) inpSearch.addEventListener('input', () => this.renderTable());
        if (selKategori) selKategori.addEventListener('change', () => this.renderTable());
        
        // Expose functions globally for inline onclick
        window.resepControllerEdit = (id) => this.editIngredient(id);
        window.resepControllerDelete = (id) => this.deleteIngredient(id);
    },

    saveIngredient() {
        const id = document.getElementById('inpBahanId').value;
        const name = document.getElementById('inpBahanName').value;
        const category = document.getElementById('inpBahanKategori').value;
        const unit = document.getElementById('inpBahanSatuan').value;
        const baseQty = parseInt(document.getElementById('inpBahanKuantitas').value) || 1;
        const price = parseInt(document.getElementById('inpBahanHarga').value) || 0;

        // Calculate unitPrice (per base unit) - for simplicity we just store the given numbers
        // Actually, our engine expects unitPrice as (price / baseQty)
        const unitPrice = price / baseQty;

        const ingredient = {
            id: id || 'b' + Date.now(),
            name,
            category,
            unit,
            baseQty,
            price,
            unitPrice
        };

        if (id) {
            const idx = this.ingredients.findIndex(i => i.id === id);
            if (idx >= 0) this.ingredients[idx] = ingredient;
        } else {
            this.ingredients.push(ingredient);
        }

        this.saveData();
        this.renderTable();
    },

    editIngredient(id) {
        const ingredient = this.ingredients.find(i => i.id === id);
        if (!ingredient) return;

        document.getElementById('inpBahanId').value = ingredient.id;
        document.getElementById('inpBahanName').value = ingredient.name;
        document.getElementById('inpBahanKategori').value = ingredient.category;
        document.getElementById('inpBahanSatuan').value = ingredient.unit ?? ingredient.buyUnit ?? 'gram';
        document.getElementById('inpBahanKuantitas').value = ingredient.baseQty ?? ingredient.packagingSize ?? 1000;
        document.getElementById('inpBahanHarga').value = ingredient.price ?? ingredient.buyPrice ?? ((ingredient.unitPrice || 0) * (ingredient.baseQty || ingredient.packagingSize || 1));

        document.getElementById('modalBahanTitle').innerText = 'Edit Bahan Baku';
        document.getElementById('modalFormBahan').classList.remove('hidden');
    },

    deleteIngredient(id) {
        if(confirm('Apakah Anda yakin ingin menghapus bahan baku ini?')) {
            this.ingredients = this.ingredients.filter(i => i.id !== id);
            this.saveData();
            this.renderTable();
        }
    },

    renderTable() {
        const tbody = document.getElementById('tableBodyBahan');
        const emptyState = document.getElementById('emptyStateBahan');
        const inpSearch = document.getElementById('inpSearchMasterBahan');
        const selKategori = document.getElementById('selKategoriFilter');
        if (!tbody || !emptyState) return;

        const q = (inpSearch ? inpSearch.value : '').toLowerCase();
        const cat = selKategori ? selKategori.value : 'all';

        let filtered = this.ingredients;
        if (q) filtered = filtered.filter(i => i.name.toLowerCase().includes(q));
        if (cat !== 'all') filtered = filtered.filter(i => i.category === cat);

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        } else {
            emptyState.classList.add('hidden');
            emptyState.classList.remove('flex');
            
            filtered.forEach(i => {
                const totalHarga = i.price ?? i.buyPrice ?? ((i.unitPrice || 0) * (i.baseQty || i.packagingSize || 1));
                const qty = i.baseQty ?? i.packagingSize ?? 1000;
                const unit = i.unit ?? i.buyUnit ?? 'gram';
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 transition-colors group';
                tr.innerHTML = `
                    <td class="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-slate-800">${i.name}</td>
                    <td class="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4">
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 whitespace-nowrap">${i.category}</span>
                    </td>
                    <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">${qty} ${unit}</td>
                    <td class="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-slate-800 whitespace-nowrap">${CurrencyUtils.format(totalHarga)}</td>
                    <td class="px-3 sm:px-6 py-3 sm:py-4 text-center">
                        <div class="flex items-center justify-center gap-2 transition-opacity">
                            <button onclick="window.resepControllerEdit('${i.id}')" class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                <i data-lucide="edit-2" class="w-4 h-4"></i>
                            </button>
                            <button onclick="window.resepControllerDelete('${i.id}')" class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            if (window.lucide) window.lucide.createIcons();
        }
    }
};

window.resepController = ResepController;
