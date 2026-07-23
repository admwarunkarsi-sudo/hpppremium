export const SimulationEngine = {
    simulateMaterialCostIncrease(baseCost, increasePercentage) {
        return baseCost * (1 + (increasePercentage / 100));
    },
    
    simulateProfitTargetChange(targetLabaNominal, newTargetPercentage, hpp) {
        return hpp * (newTargetPercentage / 100);
    }
};
