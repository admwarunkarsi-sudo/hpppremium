import { BaseMapper } from '../../../shared/mappers/baseMapper.js';
import { Ingredient } from '../models/Ingredient.js';

export class IngredientMapper extends BaseMapper {
    static toEntity(obj) {
        if (!obj) return null;
        return new Ingredient({
            id: obj.id,
            name: obj.name,
            category: obj.category,
            supplierId: obj.supplierId,
            brand: obj.brand,
            barcode: obj.barcode,
            buyPrice: obj.buyPrice,
            packagingSize: obj.packagingSize,
            buyUnit: obj.buyUnit,
            minimumStock: obj.minimumStock,
            priceHistory: obj.priceHistory,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt
        });
    }

    static toStorage(entity) {
        return {
            id: entity.id,
            name: entity.name,
            category: entity.category,
            supplierId: entity.supplierId,
            brand: entity.brand,
            barcode: entity.barcode,
            buyPrice: entity.buyPrice,
            packagingSize: entity.packagingSize,
            buyUnit: entity.buyUnit,
            minimumStock: entity.minimumStock,
            priceHistory: entity.priceHistory,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        };
    }
}
