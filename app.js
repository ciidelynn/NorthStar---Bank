import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ==========================================
// ฟังก์ชันสำหรับแสดงบับเบิลแจ้งเตือน (Toast)
// ==========================================
function showCuteToast(message, isSuccess = true) {
    const existingToast = document.getElementById("cute-toast");
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.id = "cute-toast";
    toast.className = "cute-toast-bubble";
    
    const icon = isSuccess ? "✨" : "⚠️";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    if (!isSuccess) {
        toast.style.background = "linear-gradient(135deg, rgba(255, 75, 75, 0.95), rgba(220, 38, 38, 0.95))";
        toast.style.boxShadow = "0 10px 30px rgba(255, 75, 75, 0.4)";
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 50);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 2500);
}

// ==========================================
// 1. ระบบเข้าสู่ระบบ (Login & Admin Routing)
// ==========================================
const loginBtn = document.getElementById("btn-login");
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const usernameInput = document.getElementById("login-username")?.value.trim() || "";
        const passwordInput = document.getElementById("login-password")?.value || "";
        const errorBox = document.getElementById("error-message");

        if (!usernameInput || !passwordInput) {
            if (errorBox) {
                errorBox.style.display = "block";
                errorBox.innerText = "กรุณากรอก Username และรหัสผ่านให้ครบถ้วน";
            }
            showCuteToast("กรุณากรอกข้อมูลให้ครบถ้วน", false);
            return;
        }

        const fakeEmail = usernameInput + "@northstar.local";

        signInWithEmailAndPassword(auth, fakeEmail, passwordInput)
            .then(() => {
                showCuteToast("เข้าสู่ระบบสำเร็จ!", true);
                
                // ตรวจสอบว่าเป็นบัญชีแอดมินหรือไม่ ถ้าใช่ให้ไปหน้า admin.html
                setTimeout(() => {
                    if (usernameInput.toLowerCase() === "admin") {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "pin.html"; // หรือ home.html ตามโครงสร้างหน้าของคุณ
                    }
                }, 1200);
            })
            .catch((error) => {
                console.error("Login Error:", error.code);
                if (errorBox) {
                    errorBox.style.display = "block";
                    errorBox.innerText = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
                }
                showCuteToast("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", false);
            });
    });
}

// ==========================================
// 2. ระบบสมัครสมาชิก (Register)
// ==========================================
const registerBtn = document.getElementById("btn-register");
if (registerBtn) {
    registerBtn.addEventListener("click", () => {
        const usernameInput = document.getElementById("reg-username")?.value.trim() || "";
        const passwordInput = document.getElementById("reg-password")?.value || "";
        const errorBox = document.getElementById("reg-error-message");

        if (!usernameInput || !passwordInput) {
            if (errorBox) {
                errorBox.style.display = "block";
                errorBox.innerText = "กรุณากรอกข้อมูลให้ครบถ้วน";
            }
            showCuteToast("กรุณากรอกข้อมูลให้ครบถ้วน", false);
            return;
        }

        const fakeEmail = usernameInput + "@northstar.local";

        createUserWithEmailAndPassword(auth, fakeEmail, passwordInput)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const randomAccNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();

                await setDoc(doc(db, "users", user.uid), {
                    username: usernameInput,
                    accounts: [
                        { accountNumber: randomAccNum, balance: 0, accountName: "บัญชีหลัก" }
                    ],
                    createdAt: new Date()
                });

                showCuteToast("สมัครสมาชิกสำเร็จ!", true);
                setTimeout(() => {
                    window.location.href = "pin.html";
                }, 1400);
            })
            .catch((error) => {
                console.error("Register Error:", error.code);
                if (errorBox) {
                    errorBox.style.display = "block";
                    if (error.code === 'auth/email-already-in-use') {
                        errorBox.innerText = "Username นี้ถูกใช้งานไปแล้ว";
                    } else {
                        errorBox.innerText = "เกิดข้อผิดพลาด: " + error.message;
                    }
                }
                showCuteToast("เกิดข้อผิดพลาดในการสมัครสมาชิก", false);
            });
    });
}

// ==========================================
// 3. ระบบหน้า Home & จัดการบัญชี
// ==========================================
if (window.location.pathname.includes("home.html")) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const accounts = userData.accounts || [];

                const nameEl = document.getElementById("display-name");
                if (nameEl) nameEl.innerText = userData.username;

                if (accounts.length > 0) {
                    const accNumEl = document.getElementById("display-accnum");
                    const balanceEl = document.getElementById("display-balance");

                    if (accNumEl) accNumEl.innerText = accounts[0].accountNumber;
                    if (balanceEl) balanceEl.innerText = "฿" + accounts[0].balance.toLocaleString();
                }

                const createAccountBtn = document.getElementById("btn-create-account");
                if (createAccountBtn) {
                    if (accounts.length >= 3) {
                        createAccountBtn.style.display = "none";
                    } else {
                        createAccountBtn.style.display = "block";
                    }
                }
            }
        } else {
            window.location.href = "index.html";
        }
    });
}

// ==========================================
// 4. ฟังก์ชันสร้างบัญชีเพิ่ม
// ==========================================
window.handleCreateNewAccount = async function() {
    const user = auth.currentUser;
    if (!user) {
        showCuteToast("กรุณาเข้าสู่ระบบก่อน", false);
        window.location.href = "index.html";
        return;
    }

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
            accountName: `บัญชีที่ ${accounts.length + 1}`
        };

        await updateDoc(userDocRef, {
            accounts: arrayUnion(newAccountObj)
        });

        showCuteToast("✨ เปิดบัญชีใหม่สำเร็จ!", true);
        setTimeout(() => {
            window.location.href = "home.html";
        }, 1200);
    }
};

// ==========================================
// 5. ระบบออกจากระบบ
// ==========================================
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
