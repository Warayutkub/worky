document.addEventListener('DOMContentLoaded', () => {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuYocIR2BmScJPHFV2QmUlOF55bqCweefEFNq8TZdqn9CzgVp1ywz7_b1n1StyGVk1/exec';

    const displayHrMin = document.getElementById('display-hr-min');
    const displayMin = document.getElementById('display-min');
    const displayDecimal = document.getElementById('display-decimal');
    
    const loadingOverlay = document.getElementById('loading-overlay');
    const btnRefresh = document.getElementById('btn-refresh');
    const refreshIcon = document.getElementById('refresh-icon');

    // ฟังก์ชันคำนวณและอัปเดต UI จาก Array ข้อมูล
    function updateUI(allData) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const currentMonthData = allData.filter(item => {
            if (!item.date) return false;
            const dateStr = typeof item.date === 'string' ? item.date.split('T')[0] : '';
            const [yearStr, monthStr] = dateStr.split('-');
            
            if (!yearStr || !monthStr) return false;

            const itemYear = parseInt(yearStr, 10);
            const itemMonth = parseInt(monthStr, 10) - 1;

            return itemYear === currentYear && itemMonth === currentMonth;
        });

        const totalHoursDecimal = currentMonthData.reduce((sum, item) => sum + (parseFloat(item.totalTime) || 0), 0);

        const totalMinutes = Math.round(totalHoursDecimal * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (displayHrMin) displayHrMin.textContent = `${hours} Hr.`;
        if (displayMin) displayMin.textContent = `${minutes} min.`;
        if (displayDecimal) displayDecimal.textContent = totalHoursDecimal.toFixed(2);
    }

    // ฟังก์ชันดึงข้อมูลจาก API + บันทุึกลง localStorage
    async function fetchFreshData() {
        showLoading(true);
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const result = await response.json();

            if (result.status === 'success') {
                // บันทึก Cache ลง localStorage
                localStorage.setItem('worky_data_cache', JSON.stringify(result.data));
                updateUI(result.data);
            }
        } catch (error) {
            console.error('Error fetching fresh data:', error);
        } finally {
            showLoading(false);
        }
    }

    // ฟังก์ชันเปิด/ปิด Loading
    function showLoading(isLoading) {
        if (isLoading) {
            if (loadingOverlay) loadingOverlay.classList.remove('hidden');
            if (refreshIcon) refreshIcon.classList.add('animate-spin');
            if (btnRefresh) btnRefresh.disabled = true;
        } else {
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            if (refreshIcon) refreshIcon.classList.remove('animate-spin');
            if (btnRefresh) btnRefresh.disabled = false;
        }
    }

    // --- เริ่มการทำงาน ---
    const cachedData = localStorage.getItem('worky_data_cache');

    if (cachedData) {
        // มี Cache ➔ แสดงผลทันที 0s ไม่ต้องยิง API
        updateUI(JSON.parse(cachedData));
    } else {
        // ไม่มี Cache (เข้าครั้งแรก) ➔ ยิงดึงข้อมูล
        fetchFreshData();
    }

    // กดปุ่ม Refresh ➔ บังคับยิง API เพื่ออัปเดต Cache ใหม่
    if (btnRefresh) {
        btnRefresh.addEventListener('click', fetchFreshData);
    }
});