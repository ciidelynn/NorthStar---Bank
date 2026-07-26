import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "northstar-bank-23895",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserUid = null;
let userData = null;
let beneficiaries = [];

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserUid = user.uid;
        await loadUserData();
    } else {
        window.location.href = "index.html";
    }
});

async function loadUserData() {
    try {
        const docRef = doc(db, "users", currentUserUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            userData = docSnap.data();
            beneficiaries = userData.beneficiaries || [];
            renderBeneficiaries(beneficiaries);
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
    }
}

// เรนเดอร์รายชื่อผู้รับเงินลงในหน้าจอ
function renderBeneficiaries(list) {
    const container = document.getElementById('receiver-container');
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = `<div class="empty-text">ยังไม่มีรายชื่อผู้รับเงินในระบบ</div>`;
        return;
    }

    list.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'receiver-card';
        card.innerHTML = `
            <div class="receiver-info">
                <h4>${item.name}</h4>
                <small>${item.accountNumber}</small>
            </div>
            <div class="action-hint">โอนเงิน ➔</div>
        `;

        // เมื่อคลิกที่รายชื่อ จะเซฟเลขบัญชีลง localStorage แล้วเด้งไปหน้าโอนเงินทันทีโดยไม่ต้องกรอกเลขใหม่
        card.onclick = () => {
            localStorage.setItem('quickTransferAcc', item.accountNumber);
            window.location.href = "transfer.html";
        };

        container.appendChild(card);
    });
}

// ฟังก์ชันค้นหารายชื่อ
document.getElementById('search-input').oninput = (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    const filtered = beneficiaries.filter(item => 
        item.name.toLowerCase().includes(keyword) || 
        item.accountNumber.includes(keyword)
    );
    renderBeneficiaries(filtered);
};

// กดปุ่มบันทึกรายชื่อผู้รับใหม่
document.getElementById('btn-save-receiver').onclick = async () => {
    const nameInput = document.getElementById('new-name');
    const accInput = document.getElementById('new-acc');
    const errBox = document.getElementById('error-msg');

    const name = nameInput.value.trim();
    const accNumber = accInput.value.trim();

    errBox.innerText = "";

    if (!name || !accNumber) {
        errBox.innerText = "กรุณากรอกชื่อและเลขบัญชีให้ครบถ้วน";
        return;
    }

    if (accNumber.length !== 10) {
        errBox.innerText = "เลขบัญชีต้องมี 10 หลัก";
        return;
    }

    const newReceiver = {
        name: name,
        accountNumber: accNumber
    };

    try {
        const userRef = doc(db, "users", currentUserUid);
        await updateDoc(userRef, {
            beneficiaries: arrayUnion(newReceiver)
        });

        alert("บันทึกรายชื่อผู้รับเงินสำเร็จ!");
        nameInput.value = "";
        accInput.value = "";
        await loadUserData(); // โหลดข้อมูลอัปเดตใหม่
    } catch (error) {
        errBox.innerText = "เกิดข้อผิดพลาด: " + error.message;
    }
};
