export class Router {
    constructor() {
        this.appContent = document.getElementById('app-content');
        this.routes = {
            '/dashboard': 'dashboard.html',
            '/resep': 'resep.html',
            '/hpp': 'hpp.html',
            '/inventori': 'inventori.html',
            '/laporan': 'laporan.html',
            '/pengaturan': 'pengaturan.html'
        };
        
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Modal Bantuan
        const btnBantuan = document.getElementById('btnOpenBantuan');
        const modalBantuan = document.getElementById('modalBantuan');
        const closeBantuan = document.getElementById('btnCloseModalBantuan');
        const backdrop = document.getElementById('modalBantuanBackdrop');
        
        if(btnBantuan && modalBantuan) {
            btnBantuan.addEventListener('click', () => modalBantuan.classList.remove('hidden'));
            if(closeBantuan) closeBantuan.addEventListener('click', () => modalBantuan.classList.add('hidden'));
            if(backdrop) backdrop.addEventListener('click', () => modalBantuan.classList.add('hidden'));
        }
    }

    init() {
        // Default route
        if (!location.hash || location.hash === '#/') {
            location.hash = '#/dashboard';
        } else {
            this.handleRoute();
        }
    }

    async handleRoute() {
        let route = location.hash.replace('#', '');
        if (!this.routes[route]) route = '/dashboard';

        try {
            // Add loading state
            this.appContent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-wa-800"></div></div>';
            
            const response = await fetch('views/' + this.routes[route]);
            if (!response.ok) throw new Error('View not found');
            const html = await response.text();
            
            this.appContent.innerHTML = html;
            
            // Re-initialize Lucide Icons
            if (window.lucide) {
                window.lucide.createIcons();
            }

            this.updateActiveSidebar(route);
            
            // Call specific controllers if needed
            if (route === '/hpp' && window.appController) {
                if (!window.appController.isInitialized) {
                    window.appController.init();
                    window.appController.isInitialized = true;
                } else {
                    // Re-bind events because HTML was replaced
                    window.appController.bindEvents();
                    window.appController.updateStepperUI();
                    window.appController.recalculate();
                }
            }
            
            if (route === '/resep' && window.resepController) {
                window.resepController.init();
            }

            if (route === '/dashboard' && window.dashboardController) {
                window.dashboardController.init();
            }

            if (route === '/inventori' && window.inventoriController) {
                window.inventoriController.init();
            }

            if (route === '/laporan' && window.laporanController) {
                window.laporanController.init();
            }

            if (route === '/pengaturan' && window.pengaturanController) {
                window.pengaturanController.init();
            }

        } catch (error) {
            console.error('Routing error:', error);
            this.appContent.innerHTML = '<div class="p-8 text-center text-red-500">Gagal memuat halaman.</div>';
        }
    }

    updateActiveSidebar(currentRoute) {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            const route = link.getAttribute('data-route');
            const icon = link.querySelector('i');
            
            if (route === currentRoute) {
                // Active state
                link.classList.remove('text-slate-600', 'hover:bg-slate-50', 'hover:text-wa-800');
                link.classList.add('bg-wa-50', 'text-wa-800', 'font-semibold', 'shadow-sm', 'border', 'border-wa-100/50');
                if (icon) {
                    icon.classList.remove('text-slate-400', 'group-hover:text-wa-800');
                    icon.classList.add('text-wa-800');
                }
            } else {
                // Inactive state
                link.classList.remove('bg-wa-50', 'text-wa-800', 'font-semibold', 'shadow-sm', 'border', 'border-wa-100/50');
                link.classList.add('text-slate-600', 'hover:bg-slate-50', 'hover:text-wa-800');
                if (icon) {
                    icon.classList.remove('text-wa-800');
                    icon.classList.add('text-slate-400', 'group-hover:text-wa-800');
                }
            }
        });
    }
}
