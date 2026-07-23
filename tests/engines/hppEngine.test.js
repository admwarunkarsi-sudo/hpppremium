import { TestRunner } from '../testRunner.js';
import { HPPEngine } from '../../features/hpp/engine/hppEngine.js';

const { describe, it, expect } = TestRunner;

export function runHPPEngineTests() {
    describe('HPPEngine Tests', () => {
        
        // AAA Pattern: Arrange, Act, Assert
        it('should calculate HPP per portion correctly (Normal Case)', () => {
            // Arrange
            const totalCost = 15000;
            const yieldQty = 5;
            
            // Act
            const result = HPPEngine.calculateHppPerPortion(totalCost, yieldQty);
            
            // Assert
            expect(result).toEqual(3000);
        });

        it('should handle zero yield (Extreme Case)', () => {
            // Arrange
            const totalCost = 15000;
            const yieldQty = 0;
            
            // Act
            const result = HPPEngine.calculateHppPerPortion(totalCost, yieldQty);
            
            // Assert
            expect(result).toEqual(0);
        });

        it('should calculate food cost percentage (Normal Case)', () => {
            // Arrange
            const hpp = 3000;
            const sellingPrice = 10000;
            
            // Act
            const fc = HPPEngine.calculateFoodCostPercentage(hpp, sellingPrice);
            
            // Assert
            expect(fc).toEqual(30);
        });

        it('should calculate shrinkage correctly (Normal Case)', () => {
            // Arrange
            const raw = 1000;
            const cooked = 800;
            
            // Act
            const shrink = HPPEngine.calculateShrinkage(raw, cooked);
            
            // Assert
            expect(shrink).toEqual(20);
        });

        it('should handle zero selling price when calculating FC (Extreme Case)', () => {
            // Arrange
            const hpp = 3000;
            const sellingPrice = 0;
            
            // Act
            const fc = HPPEngine.calculateFoodCostPercentage(hpp, sellingPrice);
            
            // Assert
            expect(fc).toEqual(0);
        });
    });
}
