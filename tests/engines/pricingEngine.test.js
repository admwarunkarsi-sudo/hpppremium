import { TestRunner } from '../testRunner.js';
import { PricingEngine } from '../../features/hpp/engine/pricingEngine.js';

const { describe, it, expect } = TestRunner;

export function runPricingEngineTests() {
    describe('PricingEngine Tests', () => {
        
        it('should calculate total deduction percentage correctly', () => {
            // Arrange
            const preset = { commission: 20, tax: 11, promo: 0, voucher: 0, serviceFee: 0, buffer: 0 };
            
            // Act
            const totalDeduction = PricingEngine.calculateTotalDeductionPercentage(preset);
            
            // Assert
            expect(totalDeduction).toEqual(22.2);
        });

        it('should calculate recommended price properly (Normal Case)', () => {
            // Arrange
            const hpp = 10000;
            const profit = 5000;
            const preset = { commission: 20, tax: 11, promo: 0, voucher: 0, serviceFee: 0, buffer: 0, fixedFee: 0 }; 
            
            // Act
            const recommended = PricingEngine.calculateRecommendedPrice(hpp, profit, preset);
            
            // Assert
            expect(Math.round(recommended)).toEqual(19280);
        });

        it('should throw error if deduction is 100% or more (Extreme Case)', () => {
            // Arrange
            const hpp = 10000;
            const profit = 5000;
            const preset = { commission: 90, tax: 20, promo: 0, voucher: 0, serviceFee: 0, buffer: 0, fixedFee: 0 };
            
            // Act
            const action = () => PricingEngine.calculateRecommendedPrice(hpp, profit, preset);
            
            // Assert
            expect(action).toThrow();
        });

        it('should calculate net profit accurately', () => {
            // Arrange
            const sellingPrice = 20000;
            const hpp = 10000;
            const preset = { commission: 20, tax: 11, promo: 0, voucher: 0, serviceFee: 0, buffer: 0, fixedFee: 0 }; 
            
            // Act
            const netProfit = PricingEngine.calculateNetProfit(sellingPrice, hpp, preset);
            
            // Assert
            expect(netProfit).toEqual(5560);
        });

        it('should match Snapshot for complex pricing calculation', () => {
            // Arrange
            const preset = { commission: 20, tax: 11, promo: 5, voucher: 0, serviceFee: 1000, buffer: 0, fixedFee: 0 };
            const hpp = 15450;
            const profit = 8000;
            
            // Act
            const recommended = Math.round(PricingEngine.calculateRecommendedPrice(hpp, profit, preset));
            
            // Assert
            expect(recommended).toMatchSnapshot("complex_pricing_shopeefood");
        });
    });
}
