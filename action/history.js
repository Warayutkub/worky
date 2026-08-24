document.addEventListener('DOMContentLoaded', () => {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuYocIR2BmScJPHFV2QmUlOF55bqCweefEFNq8TZdqn9CzgVp1ywz7_b1n1StyGVk1/exec';

    const historyContainer = document.getElementById('history-container');
    const grandTotalBadge = document.getElementById('grand-total-badge');
    const btnRefresh = document.getElementById('btn-refresh-history');
    const refreshIcon = document.getElementById('refresh-icon');

    // แปลงวันที่ "YYYY-MM-DD" เป็น "DD/MM/YYYY"
    function formatDateDisplay(dateStr) {
        if (!dateStr) return '';
        const cleanDate = typeof dateStr === 'string' ? dateStr.split('T')[0] : '';
        const parts = cleanDate.split('-');
        if (parts.length < 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    // แปลงเวลาจาก Google Sheets (เช่น "1899-12-29T22:12:56.000Z") ให้เหลือเฉพาะ "HH:mm"
    function formatTimeDisplay(timeStr) {
        if (!timeStr) return '--:--';

        // ถ้าเป็นรูปแบบ "HH:mm" อยู่แล้ว
        if (typeof timeStr === 'string' && timeStr.length === 5 && timeStr.includes(':')) {
            return timeStr;
        }

        try {
            const date = new Date(timeStr);
            if (isNaN(date.getTime())) return timeStr;

            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${hours}:${minutes}`;
        } catch (e) {
            return timeStr;
        }
    }

    // แปลงค่า totalTime ให้แสดงผลแม่นยำเหมือนฝั่ง Home
    function formatHoursDecimal(val) {
        const totalHoursDecimal = parseFloat(val) || 0;

        // แปลงเป็นนาทีก่อนเพื่อความแม่นยำ
        const totalMinutes = Math.round(totalHoursDecimal * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // คืนค่าทศนิยมที่คำนวณจาก (ชั่วโมง + นาที/60) หรือแสดงแบบทศนิยม 2 ตำแหน่ง
        // กรณีต้องการแสดงทศนิยม 2 ตำแหน่งเป๊ะๆ เหมือน Home (displayDecimal):
        return totalHoursDecimal.toFixed(2);
    }

    // ประมวลผลและสร้าง HTML แสดงรายการประวัติ
    function renderHistoryUI(allData) {
        if (!Array.isArray(allData) || allData.length === 0) {
            if (historyContainer) {
                historyContainer.innerHTML = '<p class="text-center text-gray-400 py-8">ไม่มีข้อมูลประวัติการทำงาน</p>';
            }
            if (grandTotalBadge) grandTotalBadge.textContent = 'Total 0.0 Hrs';
            return;
        }

        // เรียงลำดับจากวันที่ล่าสุดขึ้นก่อน
        const sortedData = [...allData].sort((a, b) => new Date(b.date) - new Date(a.date));

        const groups = {};
        let grandTotal = 0;

        // จัดกลุ่มตามเดือน
        sortedData.forEach(item => {
            if (!item.date) return;
            const cleanDate = typeof item.date === 'string' ? item.date.split('T')[0] : '';
            const parts = cleanDate.split('-');
            if (parts.length < 2) return;

            const year = parts[0];
            const monthIndex = parseInt(parts[1], 10) - 1;
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            const groupKey = `${monthNames[monthIndex]} ${year}`;

            if (!groups[groupKey]) {
                groups[groupKey] = { items: [], monthTotal: 0 };
            }

            const hours = parseFloat(item.totalTime) || 0;
            groups[groupKey].items.push(item);
            groups[groupKey].monthTotal += hours;
            grandTotal += hours;
        });

        // อัปเดต ยอดรวมทั้งหมด (Grand Total)
        if (grandTotalBadge) {
            grandTotalBadge.textContent = `Total ${formatHoursDecimal(grandTotal)} Hrs`;
        }

        // สร้าง HTML
        let html = '';
        Object.keys(groups).forEach(monthYear => {
            const group = groups[monthYear];

            html += `
                <div class="flex flex-col gap-3">
                    <!-- Header ของแต่ละเดือน -->
                    <div class="flex justify-between items-center border-b border-gray-200 pb-2 pt-2">
                        <h2 class="font-bold text-lg text-gray-800">${monthYear}</h2>
                        <span class="text-sm font-semibold text-gray-400">${formatHoursDecimal(group.monthTotal)} Hrs total</span>
                    </div>

                    <!-- รายการการทำงานในเดือนนั้น -->
                    <div class="flex flex-col gap-3">
            `;

            group.items.forEach(item => {
                const formattedDate = formatDateDisplay(item.date);
                const startTime = formatTimeDisplay(item.startTime);
                const endTime = formatTimeDisplay(item.endTime);
                const itemHours = formatHoursDecimal(item.totalTime);

                html += `
                    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                <span class="font-bold text-gray-800 text-base">${formattedDate}</span>
                            </div>
                            <span class="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full text-sm">
                                ${itemHours} Hr.
                            </span>
                        </div>
                        
                        <div class="flex justify-between items-center text-xs text-gray-400 pl-4">
                            <span>${startTime} - ${endTime}</span>
                            <span class="text-gray-600 font-medium truncate max-w-[180px]" title="${item.description || ''}">
                                ${item.description || '-'}
                            </span>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        if (historyContainer) {
            historyContainer.innerHTML = html;
        }
    }

    // ดึงข้อมูลใหม่จาก API
    async function fetchFreshData() {
        showLoading(true);
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            const result = await response.json();

            if (result.status === 'success') {
                localStorage.setItem('worky_data_cache', JSON.stringify(result.data));
                renderHistoryUI(result.data);
            }
        } catch (error) {
            console.error('Error fetching history data:', error);
        } finally {
            showLoading(false);
        }
    }

    function showLoading(isLoading) {
        if (isLoading) {
            if (refreshIcon) refreshIcon.classList.add('animate-spin');
            if (btnRefresh) btnRefresh.disabled = true;
        } else {
            if (refreshIcon) refreshIcon.classList.remove('animate-spin');
            if (btnRefresh) btnRefresh.disabled = false;
        }
    }

    // --- เริ่มการทำงาน ---
    const cachedData = localStorage.getItem('worky_data_cache');
    if (cachedData) {
        renderHistoryUI(JSON.parse(cachedData));
    } else {
        fetchFreshData();
    }

    if (btnRefresh) {
        btnRefresh.addEventListener('click', fetchFreshData);
    }
});