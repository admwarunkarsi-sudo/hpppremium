import { UUID } from '../../shared/utils/uuid.js';

export const PengaturanController = {
    categories: [],
    
    init() {
        this.loadData();
        this.bindEvents();
        this.renderTable();
    },

    loadData() {
        try {
            const data = localStorage.getItem('warunk_arsi_categories');
            if (data) {
                this.categories = JSON.parse(data);
            } else {
                // Initialize defaults
                this.categories = [
                    { id: UUID.generate(), name: 'PROTEIN' },
                    { id: UUID.generate(), name: 'KARBOHIDRAT' },
                    { id: UUID.generate(), name: 'SAYUR' },
                    { id: UUID.generate(), name: 'BUMBU' },
                    { id: UUID.generate(), name: 'KERING' },
                    { id: UUID.generate(), name: 'CAIR' },
                    { id: UUID.generate(), name: 'PACKAGING' },
                    { id: UUID.generate(), name: 'LAINNYA' }
                ];
                this.saveData();
            }
        } catch(e) {
            this.categories = [];
        }
    },

    saveData() {
        localStorage.setItem('warunk_arsi_categories', JSON.stringify(this.categories));
    },

    bindEvents() {
        const form = document.getElementById('formAddKategori');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const inp = document.getElementById('inpNamaKategori');
                if (inp && inp.value.trim()) {
                    this.addCategory(inp.value.trim().toUpperCase());
                    inp.value = '';
                }
            });
        }
    },

    addCategory(name) {
        if (this.categories.find(c => c.name === name)) {
            alert('Kategori sudah ada!');
            return;
        }
        this.categories.push({ id: UUID.generate(), name });
        this.saveData();
        this.renderTable();
        
        // Notify user
        const toast = document.getElementById('toastNotification');
        if (toast) {
            document.getElementById('toastTitle').innerText = 'Kategori Ditambahkan';
            document.getElementById('toastMessage').innerText = name;
            toast.classList.remove('translate-x-full', 'opacity-0');
            setTimeout(() => toast.classList.add('translate-x-full', 'opacity-0'), 3000);
        }
    },

    deleteCategory(id) {
        if (confirm('Yakin ingin menghapus kategori ini? (Bahan baku yang sudah menggunakan kategori ini tidak akan terhapus, namun kategorinya mungkin tidak muncul di filter)')) {
            this.categories = this.categories.filter(c => c.id !== id);
            this.saveData();
            this.renderTable();
        }
    },

    renderTable() {
        const tbody = document.getElementById('tableBodyKategori');
        const emptyState = document.getElementById('emptyStateKategori');
        if (!tbody || !emptyState) return;

        if (this.categories.length === 0) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            tbody.innerHTML = '';
            return;
        }

        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
        
        tbody.innerHTML = this.categories.map(c => `
            <tr class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4 font-bold text-slate-800">${c.name}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="window.pengaturanControllerDelete('${c.id}')" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Hapus">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }
};

window.pengaturanController = PengaturanController;
window.pengaturanControllerDelete = (id) => PengaturanController.deleteCategory(id);
