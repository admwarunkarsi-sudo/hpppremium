import { storageAdapter } from '../../../shared/adapters/localStorageAdapter.js';
import { IngredientMapper } from './ingredientMapper.js';
import { globalCache } from '../../../shared/cache/cacheLayer.js';
import { STORAGE_KEYS } from '../../../shared/constants/storageKeys.js';

export const MasterBahanRepository = {
    CACHE_KEY: 'cache_master_bahan',

    getAll() {
        let cached = globalCache.get(this.CACHE_KEY);
        if (cached) return cached;

        let data = storageAdapter.get(STORAGE_KEYS.MASTER_BAHAN, []);
        
        // Mock data injection for Phase 1 testing
        if (data.length === 0) {
            data = [
                { id: 'mock_ayam', name: 'Daging Ayam Fillet', buyPrice: 45000, packagingSize: 1000, buyUnit: 'g' },
                { id: 'mock_cabe', name: 'Cabai Rawit Merah', buyPrice: 60000, packagingSize: 1000, buyUnit: 'g' }
            ];
            storageAdapter.set(STORAGE_KEYS.MASTER_BAHAN, data);
        }

        const entities = data.map(obj => IngredientMapper.toEntity(obj));
        
        globalCache.set(this.CACHE_KEY, entities);
        return entities;
    },

    saveAll(entities) {
        const data = entities.map(ent => IngredientMapper.toStorage(ent));
        storageAdapter.set(STORAGE_KEYS.MASTER_BAHAN, data);
        globalCache.invalidate(this.CACHE_KEY);
    }
};
