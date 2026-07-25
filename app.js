// ===================================
// NorthStar Bank
// Login System
// ===================================

function login() {
    // รับค่าจากช่องกรอก
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // 🔴 [ADMIN CHECK]
    if (username === "admin" && password === "admin1234") {
        sessionStorage.setItem("isAdminLoggedIn", "true");

        Swal.fire({
            title: '👑 ต้อนรับผู้ดูแลระบบ',
            text: 'กำลังเข้าสู่ระบบ Admin Control Panel...',
            icon: 'success',
            background: '#0f172a',
            color: '#ffffff',
            confirmButtonColor: '#38bdf8',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            window.location.href = "admin.html";
        });
        return;
    }

    // ค้นหาผู้ใช้
    const user = window.users.find(
        u => u.username === username && u.password === password
    );

    // ถ้าพบผู้ใช้
    if (user) {
        // เช็กสถานะถูกระงับบัญชี (Ban)
        if (user.isBanned) {
            Swal.fire({
                title: '❌ บัญชีถูกระงับ',
                text: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อแอดมิน',
                icon: 'error',
                background: '#0f172a',
                color: '#ffffff',
                confirmButtonColor: '#ef4444'
            });
            return;
        }

        // จำผู้ใช้ที่กำลัง Login
        localStorage.setItem("username", user.username);
        localStorage.setItem("currentUser", JSON.stringify(user));

        // ไปหน้าใส่ PIN
        Swal.fire({
            title: 'เข้าสู่ระบบสำเร็จ',
            text: 'กำลังนำคุณไปหน้ากรอก PIN...',
            icon: 'success',
            background: '#0f172a',
            color: '#ffffff',
            showConfirmButton: false,
            timer: 1200
        }).then(() => {
            window.location.href = "pin.html";
        });
    } else {
        Swal.fire({
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            text: 'Username หรือ Password ไม่ถูกต้อง',
            icon: 'warning',
            background: '#0f172a',
            color: '#ffffff',
            confirmButtonColor: '#38bdf8'
        });
    }
}

// เช็กและสร้างข้อมูล Default Users ใน LocalStorage
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(window.users));
}

// ===================================
// Event Listener (ดักจับการกดปุ่มเข้าสู่ระบบ)
// ===================================
document.addEventListener("DOMContentLoaded", () => {
    // กรณีที่ปุ่มล็อกอินอยู่ใน <form>
    const loginForm = document.querySelector("form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บ Refresh
            login();
        });
    }

    // กรณีที่ปุ่มเป็น <button> ทั่วไปนอก form
    const loginBtn = document.querySelector("button");
    if (loginBtn) {
        loginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            login();
        });
    }
});
