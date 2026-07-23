import { logger } from './logger.js';
import { eventBus } from './eventBus.js';
import { container } from './dependencyContainer.js';
import { AppConfig } from '../config/appConfig.js';

export const Bootstrap = {
    async init() {
        logger.system(`Starting Warunk Arsi ERP v${AppConfig.APP_VERSION}...`);
        
        // Register core services to DI container
        container.register('eventBus', eventBus);
        container.register('logger', logger);
        
        // Setup initial listeners
        eventBus.subscribe('appReady', () => {
            logger.system('Application is fully ready and UI is mounted.');
        });
        
        // Setup Dark Mode Toggle
        const btnDarkMode = document.getElementById('btnDarkMode');
        
        // Restore saved preference
        const isDark = localStorage.getItem('warunk_arsi_darkmode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-theme');
            const icon = document.querySelector('#btnDarkMode i');
            if (icon) icon.setAttribute('data-lucide', 'moon');
        }

        if (btnDarkMode) {
            btnDarkMode.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                const isNowDark = document.body.classList.contains('dark-theme');
                localStorage.setItem('warunk_arsi_darkmode', isNowDark);
                
                const icon = document.querySelector('#btnDarkMode i');
                if (icon) {
                    if (isNowDark) {
                        icon.setAttribute('data-lucide', 'moon');
                    } else {
                        icon.setAttribute('data-lucide', 'sun');
                    }
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        }

        // Setup Mobile Sidebar Toggle
        const btnMobileMenu = document.getElementById('btnMobileMenu');
        const btnCloseMobileMenu = document.getElementById('btnCloseMobileMenu');
        const sidebarMenu = document.getElementById('sidebarMenu');
        const sidebarBackdrop = document.getElementById('sidebarBackdrop');

        const toggleSidebar = () => {
            if (sidebarMenu && sidebarBackdrop) {
                sidebarMenu.classList.toggle('-translate-x-full');
                sidebarBackdrop.classList.toggle('hidden');
            }
        };

        if (btnMobileMenu) btnMobileMenu.addEventListener('click', toggleSidebar);
        if (btnCloseMobileMenu) btnCloseMobileMenu.addEventListener('click', toggleSidebar);
        if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', toggleSidebar);

        // Close sidebar on link click (mobile)
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768 && sidebarMenu && !sidebarMenu.classList.contains('-translate-x-full')) {
                    toggleSidebar();
                }
            });
        });

        // Setup Premium UI
        this.setupPremiumUI();

        // Future: Initialize storage adapters, caching, etc. here
        
        logger.system('Core initialized successfully.');
    },

    setupPremiumUI() {
        const PS = window.PremiumService;
        if (!PS) return;

        // Apply UI state based on current premium status
        this.applyPremiumState(PS.isPremium());

        // --- Modal Logic ---
        const modal = document.getElementById('modalPremium');
        const backdrop = document.getElementById('modalPremiumBackdrop');
        const btnClose = document.getElementById('btnClosePremiumModal');
        const btnActivate = document.getElementById('btnActivatePremium');
        const inpCode = document.getElementById('inpPremiumCode');
        const feedback = document.getElementById('premiumCodeFeedback');

        const openModal = () => {
            if (modal) {
                modal.classList.remove('hidden');
                if (inpCode) { inpCode.value = ''; inpCode.focus(); }
                if (feedback) feedback.classList.add('hidden');
                if (window.lucide) window.lucide.createIcons();
            }
        };

        const closeModal = () => {
            if (modal) modal.classList.add('hidden');
        };

        // Expose globally so hpp.html overlay button can call it
        window.openPremiumModal = openModal;

        if (backdrop) backdrop.addEventListener('click', closeModal);
        if (btnClose) btnClose.addEventListener('click', closeModal);

        if (btnActivate) {
            btnActivate.addEventListener('click', () => {
                if (!inpCode || !feedback) return;
                const code = inpCode.value.trim().toUpperCase();
                if (!code) return;

                const result = PS.unlock(code);

                feedback.classList.remove('hidden');
                if (result.success) {
                    feedback.textContent = '✅ ' + result.message;
                    feedback.className = 'text-xs font-bold mt-2 text-wa-700';
                    setTimeout(() => {
                        closeModal();
                        this.applyPremiumState(true);
                        // Show success toast
                        const toast = document.getElementById('toastNotification');
                        if (toast) {
                            document.getElementById('toastTitle').innerText = '✨ Premium Aktif!';
                            document.getElementById('toastMessage').innerText = 'Semua fitur premium sekarang terbuka.';
                            toast.classList.remove('translate-x-full', 'opacity-0');
                            setTimeout(() => toast.classList.add('translate-x-full', 'opacity-0'), 4000);
                        }
                    }, 1000);
                } else {
                    feedback.textContent = '❌ ' + result.message;
                    feedback.className = 'text-xs font-bold mt-2 text-red-600';
                    inpCode.classList.add('border-red-400', 'ring-1', 'ring-red-200');
                    setTimeout(() => inpCode.classList.remove('border-red-400', 'ring-1', 'ring-red-200'), 2000);
                }
            });
        }

        // Enter key support
        if (inpCode) {
            inpCode.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') btnActivate && btnActivate.click();
            });
        }

        // Premium-locked buttons in header open the modal
        document.querySelectorAll('.premium-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!window.PremiumService || !window.PremiumService.isPremium()) {
                    e.stopImmediatePropagation();
                    openModal();
                }
            }, true); // use capture to intercept before other listeners
        });
    },

    applyPremiumState(isPremium) {
        // Badge
        const badge = document.getElementById('premiumBadge');
        if (badge) {
            badge.classList.toggle('hidden', !isPremium);
            badge.classList.toggle('flex', isPremium);
        }

        // Lock icons on header buttons
        ['csvLockIcon', 'jsonLockIcon', 'saveLockIcon'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', isPremium);
        });

        // Step 4 Premium Overlay
        const overlay = document.getElementById('step4PremiumOverlay');
        if (overlay) overlay.classList.toggle('hidden', isPremium);

        // Render icons after changes
        if (window.lucide) window.lucide.createIcons();
    }
};

