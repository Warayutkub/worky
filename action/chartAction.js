const ctx = document.getElementById('AverageChartMain').getContext('2d');

new Chart(ctx, {
    type: 'bar', // ชนิดกราฟ: 'bar', 'line', 'pie', 'doughnut'
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], // แกน X
        datasets: [{
            label: 'Hours Worked',
            data: [220, 270, 152, 255, 198], // ข้อมูลแกน Y
            backgroundColor: '#1e90ff', // สีแท่งกราฟ (เข้ากับธีมแอปคุณ)
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: true },
            datalabels : {
                color: '#fff',
                anchor: 'center',
                align: 'center'
            },
        },
        maintainAspectRatio: false
    }
});