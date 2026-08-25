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

    function getDateKey(dateValue) {
        if (!dateValue) return '';
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }

        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    allData.forEach(item => {
        if (!item.date) return;

        // แปลง ISO จาก Google Sheets เป็นวันที่ตาม timezone ของเครื่องก่อนจัดกลุ่ม
        const dateStr = getDateKey(item.date);
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