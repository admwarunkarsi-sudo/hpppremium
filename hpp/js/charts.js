export const ChartEngine = {
    hppPieChart: null,
    marginBarChart: null,
    
    init() {
        const ctxPie = document.getElementById('hppPieChart');
        if (ctxPie) {
            this.hppPieChart = new Chart(ctxPie, {
                type: 'pie',
                data: {
                    labels: ['Bahan Baku', 'Biaya Variabel', 'Biaya Tetap'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#1e3f20', '#a3b18a', '#f4a261']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        const ctxBar = document.getElementById('marginBarChart');
        if (ctxBar) {
            this.marginBarChart = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['Offline', 'ShopeeFood', 'GrabFood', 'GoFood'],
                    datasets: [{
                        label: 'Margin (%)',
                        data: [0, 0, 0, 0],
                        backgroundColor: '#2a9d8f'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    },
    
    updateHppPieChart(bahanCost, variableCost, fixedCost) {
        if (this.hppPieChart) {
            this.hppPieChart.data.datasets[0].data = [bahanCost, variableCost, fixedCost];
            this.hppPieChart.update();
        }
    },
    
    updateMarginBarChart(margins) {
        if (this.marginBarChart) {
            this.marginBarChart.data.datasets[0].data = margins;
            this.marginBarChart.update();
        }
    }
};
