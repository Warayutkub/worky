let averageChartInstance = null; // ตัวแปรเก็บ Instance กราฟ เพื่ออัปเดตใหม่ได้เวลากด Refresh

// ฟังก์ชันสำหรับ Render หรือ Update กราฟ
function renderAverageChart(labels, dataValues) {
    const ctx = document.getElementById('AverageChartMain')?.getContext('2d');
    if (!ctx) return;

    // ถ้ามีกราฟเดิมอยู่แล้ว ให้ลบทิ้งก่อนสร้างใหม่ (ป้องกันกราฟซ้อนกัน)
    if (averageChartInstance) {
        averageChartInstance.destroy();
    }

    averageChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.length > 0 ? labels : ['ไม่มีข้อมูล'],
            datasets: [{
                label: 'Hours Worked',
                data: dataValues.length > 0 ? dataValues : [0],
                backgroundColor: '#1e90ff',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }, // ซ่อน Legend เพื่อความสะอาดของ UI
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.raw} Hr.`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${value}h`
                    }
                }
            },
            maintainAspectRatio: false
        }
    });
}

// ฟังก์ชันประมวลผลข้อมูลจาก Array ทั้งหมด เพื่อจัดกลุ่มตามเดือน
function processChartData(allData) {
    if (!Array.isArray(allData) || allData.length === 0) {
        renderAverageChart([], []);
        return;
    }

    const monthTotals = {};

    allData.forEach(item => {
        if (!item.date) return;

        // ดึง YYYY-MM ออกมาจาก date string (รองรับทั้ง "YYYY-MM-DD" และ ISO String)
        const dateStr = typeof item.date === 'string' ? item.date.split('T')[0] : '';
        const parts = dateStr.split('-');
        if (parts.length < 2) return;

        const year = parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1;

        // ชื่อเดือนแบบย่อ
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthKey = `${monthNames[monthIndex]} ${year.slice(-2)}`; // เช่น "Aug 26"

        const hours = parseFloat(item.totalTime) || 0;
        monthTotals[monthKey] = (monthTotals[monthKey] || 0) + hours;
    });

    // แยก Label และ Data สรุปผล
    const labels = Object.keys(monthTotals);
    const dataValues = Object.values(monthTotals).map(val => parseFloat(val.toFixed(2)));

    renderAverageChart(labels, dataValues);
}

// โหลดข้อมูลเข้ากราฟเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    const cachedData = localStorage.getItem('worky_data_cache');
    if (cachedData) {
        processChartData(JSON.parse(cachedData));
    }
});