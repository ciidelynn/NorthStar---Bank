import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGDB_x2dpynWk7ZvHmxXDJ6P4PTNfhtfE",
  authDomain: "northstar-bank-23895.firebaseapp.com",
  projectId: "northstar-bank-23895",
  storageBucket: "northstar-bank-23895.firebasestorage.app",
  messagingSenderId: "1040359606999",
  appId: "1:1040359606999:web:2d6ec0ca70088c7d5ffe92",
  measurementId: "G-BFLFYLF8DW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ฟังก์ชันแสดง Toast แจ้งเตือน
function showCuteToast(message, isSuccess = true) {
    const existingToast = document.getElementById("cute-toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.id = "cute-toast";
    toast.className = "cute-toast-bubble";
    
    const icon = isSuccess ? "✨" : "⚠️";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    if (!isSuccess) {
        toast.style.background = "linear-gradient(135deg, rgba(255, 75, 75, 0.95), rgba(220, 38, 38, 0.95))";
    }

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 50);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// ตรวจสอบสถานะการล็อกอิน ถ้ายังไม่ล็อกอินให้ดีดกลับหน้า index.html
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    }
});

// ตรวจสอบการกดปุ่มยืนยันรหัส PIN
const pinForm = document.getElementById("pin-form");
if (pinForm) {
    pinForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const enteredPin = document.getElementById("user-pin")?.value.trim() || "";

        if (enteredPin.length !== 6 || isNaN(enteredPin)) {
            showCuteToast("กรุณากรอกรหัส PIN เป็นตัวเลข 6 หลัก", false);
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            showCuteToast("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่", false);
            window.location.href = "index.html";
            return;
        }

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const username = userData.username ? userData.username.toLowerCase() : "";

                showCuteToast("ยืนยัน PIN สำเร็จ!", true);

                // หากเป็นแอดมินให้พุ่งไปหน้า admin.html หากเป็นผู้ใช้ทั่วไปไปหน้า home.html
                setTimeout(() => {
                    if (username === "admin") {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "home.html";
                    }
                }, 1000);
            } else {
                showCuteToast("ไม่พบข้อมูลผู้ใช้งานในระบบ", false);
            }
        } catch (error) {
            console.error("PIN verification error:", error);
            showCuteToast("เกิดข้อผิดพลาดในการตรวจสอบ PIN", false);
        }
    });
}
