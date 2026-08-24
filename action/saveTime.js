document.addEventListener('DOMContentLoaded', () => {
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyuYocIR2BmScJPHFV2QmUlOF55bqCweefEFNq8TZdqn9CzgVp1ywz7_b1n1StyGVk1/exec';

    const form = document.querySelector('form');
    const timeStartInput = document.getElementById('time-start');
    const timeEndInput = document.getElementById('time-end');
    
    const displayHrMin = document.getElementById('display-hr-min');
    const displayMin = document.getElementById('display-min');
    const displayDecimal = document.getElementById('display-decimal');

    // ฟังก์ชันคำนวณและคืนค่าชั่วโมงทศนิยม
    function calculateTime() {
        const startVal = timeStartInput ? timeStartInput.value : '';
        const endVal = timeEndInput ? timeEndInput.value : '';

        if (!startVal || !endVal) {
            resetDisplay();
            return 0;
        }

        const [startH, startM] = startVal.split(':').map(Number);
        const [endH, endM] = endVal.split(':').map(Number);

        let startMinutes = startH * 60 + startM;
        let endMinutes = endH * 60 + endM;

        if (endMinutes < startMinutes) {
            endMinutes += 24 * 60;
        }

        const diffMinutes = endMinutes - startMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        const totalHoursDecimal = parseFloat((diffMinutes / 60).toFixed(2));

        if (displayHrMin) displayHrMin.textContent = `${hours} Hr.`;
        if (displayMin) displayMin.textContent = `${minutes} min.`;
        if (displayDecimal) displayDecimal.textContent = totalHoursDecimal.toFixed(1);

        return totalHoursDecimal;
    }

    function resetDisplay() {
        if (displayHrMin) displayHrMin.textContent = '0 Hr.';
        if (displayMin) displayMin.textContent = '0 min.';
        if (displayDecimal) displayDecimal.textContent = '0.0';
    }

    // คำนวณทันทีเมื่อมีการพิมพ์หรือเปลี่ยนค่าเวลา
    if (timeStartInput) {
        timeStartInput.addEventListener('change', calculateTime);
        timeStartInput.addEventListener('input', calculateTime);
    }
    if (timeEndInput) {
        timeEndInput.addEventListener('change', calculateTime);
        timeEndInput.addEventListener('input', calculateTime);
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // คำนวณค่าสดๆ ณ ตอนกด Submit ป้องกันปัญหาค่าไม่อัปเดต
            const currentTotalHours = calculateTime();

            const submitBtn = form.querySelector('button[type="submit"]');
            
            const payload = {
                date: document.getElementById('work-date')?.value || '',
                startTime: timeStartInput?.value || '',
                endTime: timeEndInput?.value || '',
                teachHour: parseFloat(document.getElementById('teaching-hour')?.value) || 0,
                description: document.getElementById('description')?.value || '',
                totalTime: currentTotalHours
            };

            if (!payload.date || !payload.startTime || !payload.endTime) {
                alert('กรุณากรอกวันที่ และเวลาเริ่ม-จบให้ครบถ้วน');
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'กำลังบันทึกข้อมูล...';
                    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
                }

                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    alert('บันทึกข้อมูลสำเร็จ!');
                    form.reset();
                    resetDisplay();
                    
                    const dateInput = document.getElementById('work-date');
                    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
                } else {
                    alert('เกิดข้อผิดพลาด: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save Work Time';
                    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        });
    }
});