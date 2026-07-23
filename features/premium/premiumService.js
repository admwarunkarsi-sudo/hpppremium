// ============================================================
// PremiumService — Sistem Kunci Fitur Freemium
// Validasi client-side untuk MVP. Untuk produksi, validasi
// harus dipindahkan ke backend/server.
// ============================================================

const PREMIUM_CODES = [
    'HPP-PREMIUM-WARUNKARSI-2026',
    'WARUNK-PREMIUM-2025',
    'ARSI-VIP-ACCESS',
    'HPPGRATIS30',
];

const STORAGE_KEY = 'warunk_arsi_premium_status';

export const PremiumService = {

    isPremium() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (!data) return false;
            // Cek expiry jika ada
            if (data.expiresAt && Date.now() > data.expiresAt) {
                localStorage.removeItem(STORAGE_KEY);
                return false;
            }
            return data.active === true;
        } catch {
            return false;
        }
    },

    unlock(code) {
        const trimmed = code.trim().toUpperCase();
        const found = PREMIUM_CODES.find(c => c === trimmed);
        if (!found) {
            return { success: false, message: 'Kode tidak valid. Periksa kembali atau hubungi admin.' };
        }

        // Simpan status premium (tanpa expiry untuk MVP)
        const payload = {
            active: true,
            code: trimmed,
            unlockedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return { success: true, message: 'Akses Premium berhasil diaktifkan!' };
    },

    revoke() {
        localStorage.removeItem(STORAGE_KEY);
    },

    getUnlockedCode() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            return data ? data.code : null;
        } catch {
            return null;
        }
    }
};
