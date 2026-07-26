import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ตรวจสอบสถานะการล็อกอินและดึงข้อมูลบัญชีมาแสดงผล
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const accounts = userData.accounts || [];

            // แสดงชื่อผู้ใช้
            const nameEl = document.getElementById("display-name");
            if (nameEl) nameEl.innerText = userData.username || "ผู้ใช้งาน";

            // เรนเดอร์รายการบัญชีทั้งหมด
            renderAccountList(accounts);

            // ซ่อนปุ่มเปิดบัญชีถ้าครบ 3 บัญชีแล้ว
            const createAccountBtn = document.getElementById("btn-create-account");
            if (createAccountBtn) {
                createAccountBtn.style.display = accounts.length >= 3 ? "none" : "block";
            }
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        showCuteToast("เกิดข้อผิดพลาดในการโหลดข้อมูล", false);
    }
});

// ฟังก์ชันเรนเดอร์การ์ดแสดงบัญชีธนาคาร
function renderAccountList(accounts) {
    const container = document.getElementById("account-list-box");
    if (!container) return;

    if (accounts.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #a0aec0; font-size: 13px; padding: 20px 0;">ยังไม่มีบัญชีในระบบ</p>`;
        return;
    }

    container.innerHTML = "";
    accounts.forEach((acc) => {
        const card = document.createElement("div");
        card.className = "account-card";
        card.innerHTML = `
            <div class="account-details">
                <h4>${acc.accountName || 'บัญชีธนาคาร'}</h4>
                <p>เลขที่: ${acc.accountNumber}</p>
            </div>
            <div class="account-balance">
                <h3>฿${Number(acc.balance || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</h3>
            </div>
        `;
        container.appendChild(card);
    });
}

// ฟังก์ชันเปิดบัญชีใหม่ (ผูกไว้กับ window เพื่อให้เรียกผ่าน onclick ใน HTML ได้)
window.handleCreateNewAccount = async function() {
    const user = auth.currentUser;
    if (!user) {
        showCuteToast("กรุณาเข้าสู่ระบบก่อน", false);
        window.location.href = "index.html";
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const accounts = userData.accounts || [];

            if (accounts.length >= 3) {
                showCuteToast("คุณมีบัญชีครบตามกำหนดสูงสุด 3 บัญชีแล้ว", false);
                return;
            }

            const newAccNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            const newAccountObj = {
                accountNumber: newAccNum,
                balance: 0,
                accountName: `บัญชีสำรองที่ ${accounts.length + 1}`
            };

            await updateDoc(userDocRef, {
                accounts: arrayUnion(newAccountObj)
            });

            showCuteToast("✨ เปิดบัญชีใหม่สำเร็จ!", true);
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    } catch (error) {
        console.error("Error creating account:", error);
        showCuteToast("เกิดข้อผิดพลาดในการเปิดบัญชี", false);
    }
};

// ระบบออกจากระบบ
const logoutBtn = document.getElementById("btn-logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            showCuteToast("ออกจากระบบแล้ว", true);
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        });
    });
}
