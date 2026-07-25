document.addEventListener("DOMContentLoaded", () => {
    // 1. ตรวจสอบสิทธิ์การเข้าใช้งานแอดมิน
    checkAdminAuth();

    // 2. โหลดและแสดงข้อมูลในตารางผู้ใช้ / ประวัติ
    renderAdminTables();
});

// ฟังก์ชันตรวจสอบสถานะการล็อกอิน
function checkAdminAuth() {
    const isAdmin = sessionStorage.getItem("isAdminLoggedIn") || localStorage.getItem("isAdminLoggedIn");
    if (!isAdmin) {
        window.location.href = "index.html";
    }
}

// ฟังก์ชันแสดงข้อมูลตารางผู้ใช้และประวัติการโอนเงิน
function renderAdminTables() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // Render ตารางผู้ใช้งานทั้งหมด
    const userTableBody = document.getElementById("userTableBody");
    if (userTableBody) {
        if (users.length === 0) {
            userTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #64748b; padding: 20px;">ยังไม่มีผู้ใช้งานในระบบ</td>
                </tr>`;
        } else {
            userTableBody.innerHTML = users.map(u => `
                <tr>
                    <td>${u.fullname || u.username}</td>
                    <td><code style="color:#38bdf8">${u.accountNo || '-'}</code></td>
                    <td style="font-weight: 600; color: #4ade80;">฿${(u.balance || 0).toLocaleString()}</td>
                    <td><span style="color: #4ade80;">ใช้งานปกติ</span></td>
                    <td>
                        <button class="action-btn btn-delete" onclick="deleteUser('${u.accountNo}')" style="padding: 6px 12px; font-size: 0.8rem;">ลบ</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Render ตารางประวัติการโอนเงินทั้งหมด
    const historyTableBody = document.getElementById("historyTableBody");
    if (historyTableBody) {
        if (transactions.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: #64748b; padding: 20px;">ยังไม่มีประวัติการโอนเงิน</td>
                </tr>`;
        } else {
            historyTableBody.innerHTML = transactions.map(tx => `
                <tr>
                    <td style="color: #94a3b8; font-size: 0.85rem;">${tx.date || '-'}</td>
                    <td>${tx.senderName || tx.senderAcc}</td>
                    <td>${tx.receiverName || tx.receiverAcc}</td>
                    <td style="color: #38bdf8; font-weight: 600;">฿${(tx.amount || 0).toLocaleString()}</td>
                    <td style="color: #cbd5e1;">${tx.note || '-'}</td>
                </tr>
            `).join('');
        }
    }
}

// ฟังก์ชันเพิ่ม / ลดเงินบัญชีผู้ใช้ (พร้อมบับเบิ้ลเด้งเตือนสวยๆ)
function processMoneyAction() {
    const accountNo = document.getElementById("adminAccountNo").value.trim();
    const action = document.getElementById("adminAction").value;
    const amount = parseFloat(document.getElementById("adminAmount").value);

    // 1. ตรวจสอบว่ากรอกข้อมูลครบถ้วนหรือไม่
    if (!accountNo || isNaN(amount) || amount <= 0) {
        Swal.fire({
            title: '⚠️ กรอกข้อมูลไม่ถูกต้อง',
            text: 'กรุณากรอกเลขบัญชีและจำนวนเงินให้ถูกต้อง',
            icon: 'warning',
            background: '#0f172a',
            color: '#ffffff',
            confirmButtonColor: '#38bdf8'
        });
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.accountNo === accountNo);

    // 2. ตรวจสอบว่ามีเลขบัญชีนี้ในระบบหรือไม่
    if (userIndex === -1) {
        Swal.fire({
            title: '❌ ไม่พบผู้ใช้',
            text: `ไม่พบเลขบัญชี ${accountNo} ในระบบ`,
            icon: 'error',
            background: '#0f172a',
            color: '#ffffff',
            confirmButtonColor: '#ef4444'
        });
        return;
    }

    // 3. ทำรายการเพิ่มหรือลดเงิน
    let actionText = "";
    if (action === "add") {
        users[userIndex].balance = (users[userIndex].balance || 0) + amount;
        actionText = `เพิ่มเงินจำนวน ฿${amount.toLocaleString()} บาท เข้าบัญชี ${accountNo} เรียบร้อยแล้ว`;
    } else if (action === "subtract") {
        if ((users[userIndex].balance || 0) < amount) {
            Swal.fire({
                title: '❌ ยอดเงินไม่พอ',
                text: 'ผู้ใช้มียอดเงินในบัญชีน้อยกว่าจำนวนที่ต้องการลด',
                icon: 'error',
                background: '#0f172a',
                color: '#ffffff',
                confirmButtonColor: '#ef4444'
            });
            return;
        }
        users[userIndex].balance -= amount;
        actionText = `ลดเงินจำนวน ฿${amount.toLocaleString()} บาท จากบัญชี ${accountNo} เรียบร้อยแล้ว`;
    }

    // 4. บันทึกข้อมูลกลับลง LocalStorage
    localStorage.setItem("users", JSON.stringify(users));

    // 5. บับเบิ้ลแจ้งเตือนทำรายการสำเร็จ (ธีมมืดเข้ากับหน้าเว็บ)
    Swal.fire({
        title: '🎉 ทำรายการสำเร็จ!',
        text: actionText,
        icon: 'success',
        background: '#0f172a',
        color: '#ffffff',
        confirmButtonColor: '#38bdf8',
        timer: 2000,
        timerProgressBar: true
    });

    // 6. เคลียร์ค่าในช่องกรอก และอัปเดตข้อมูลตารางทันที
    document.getElementById("adminAccountNo").value = '';
    document.getElementById("adminAmount").value = '';
    renderAdminTables();
}

// ฟังก์ชันลบผู้ใช้งาน
function deleteUser(accountNo) {
    Swal.fire({
        title: 'ยืนยันการลบ?',
        text: `คุณต้องการลบบัญชีเลขที่ ${accountNo} ใช่หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        background: '#0f172a',
        color: '#ffffff',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'ใช่, ลบเลย',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            let users = JSON.parse(localStorage.getItem("users")) || [];
            users = users.filter(u => u.accountNo !== accountNo);
            localStorage.setItem("users", JSON.stringify(users));

            Swal.fire({
                title: 'ลบเรียบร้อย!',
                text: 'ลบบัญชีผู้ใช้สำเร็จแล้ว',
                icon: 'success',
                background: '#0f172a',
                color: '#ffffff',
                confirmButtonColor: '#38bdf8',
                timer: 1500,
                timerProgressBar: true
            });

            renderAdminTables();
        }
    });
}

// ฟังก์ชันออกจากระบบแอดมิน
function adminLogout() {
    sessionStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "index.html";
}
