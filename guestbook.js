
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// 1. Firebase 설정값 입력
const firebaseConfig = {
   apiKey: "AIzaSyB4pen3nF0o7Q31LFLoJOzaxJhsnWwQqbA",
  authDomain: "wedding-52de6.firebaseapp.com",
  projectId: "wedding-52de6",
  storageBucket: "wedding-52de6.firebasestorage.app",
  messagingSenderId: "1072839288156",
  appId: "1:1072839288156:web:e28a10d3803b0c7f590d99",
  measurementId: "G-W1YF76ETDS"
};

// 2. 관리자 UID 입력
const ADMIN_UID = "JLFCs3WOOsUQcCKi7L43Vt4O7SS2";

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const guestbookRef = collection(db, "guestbook");

const form = document.getElementById("guestbookForm");
const nameInput = document.getElementById("guestName");
const messageInput = document.getElementById("guestMessage");
const submitBtn = document.getElementById("guestSubmit");
const guestList = document.getElementById("guestbookList");
const guestCount = document.getElementById("guestCount");

const loginBtn = document.getElementById("adminLoginBtn");
const logoutBtn = document.getElementById("adminLogoutBtn");
const adminStatus = document.getElementById("adminStatus");

let isAdmin = false;

// 3. 방명록 작성
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!name || !message) {
    alert("이름과 메시지를 입력해주세요.");
    return;
  }

  if (name.length > 20 || message.length > 300) {
    alert("입력 가능한 글자 수를 확인해주세요.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "등록 중...";

  try {
    await addDoc(guestbookRef, {
      name,
      message,
      createdAt: serverTimestamp()
    });

    form.reset();
    alert("축하 메시지가 등록되었습니다.");
  } catch (error) {
    console.error(error);
    alert("등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "방명록 남기기";
  }
});

// 4. 방명록 실시간 불러오기
const guestQuery = query(
  guestbookRef,
  orderBy("createdAt", "desc"),
  limit(50)
);

onSnapshot(guestQuery, (snapshot) => {
  guestList.replaceChildren();

  guestCount.textContent =
    `${snapshot.size}개의 메시지`;

  if (snapshot.empty) {
    const empty = document.createElement("p");
    empty.className = "guestbook__loading";
    empty.textContent = "첫 번째 축하 메시지를 남겨주세요 ❤️";
    guestList.appendChild(empty);
    return;
  }

  snapshot.forEach((guestDoc) => {
    const data = guestDoc.data();

    const item = document.createElement("article");
    item.className = "guestbook__item";

    const top = document.createElement("div");
    top.className = "guestbook__item-top";

    const name = document.createElement("span");
    name.className = "guestbook__item-name";
    name.textContent = data.name || "하객";

    const date = document.createElement("span");
    date.className = "guestbook__item-date";

    if (data.createdAt) {
      date.textContent = data.createdAt
        .toDate()
        .toLocaleDateString("ko-KR");
    } else {
      date.textContent = "등록 중";
    }

    const message = document.createElement("p");
    message.className = "guestbook__item-message";
    message.textContent = data.message || "";

    top.append(name, date);
    item.append(top, message);

    // 관리자에게만 삭제 버튼 표시
    if (isAdmin) {
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "guestbook__delete";
      deleteBtn.textContent = "삭제";

      deleteBtn.addEventListener("click", async () => {
        if (!confirm("이 방명록을 삭제할까요?")) return;

        try {
          await deleteDoc(doc(db, "guestbook", guestDoc.id));
        } catch (error) {
          console.error(error);
          alert("삭제하지 못했습니다.");
        }
      });

      item.appendChild(deleteBtn);
    }

    guestList.appendChild(item);
  });
}, (error) => {
  console.error(error);
  guestList.textContent =
    "방명록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
});

// 관리자 로그인
loginBtn.addEventListener("click", async () => {
  const email = prompt("관리자 이메일을 입력하세요.");
  if (!email) return;

  const password = prompt("관리자 비밀번호를 입력하세요.");
  if (!password) return;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.reload();
  } catch (error) {
    alert("관리자 로그인에 실패했습니다.");
  }
});

// 관리자 로그아웃
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    location.reload();
  } catch (error) {
    alert("로그아웃에 실패했습니다.");
  }
});

// 관리자 상태 확인
onAuthStateChanged(auth, (user) => {
  isAdmin = !!user && user.uid === ADMIN_UID;

  loginBtn.hidden = isAdmin;
  logoutBtn.hidden = !isAdmin;

  adminStatus.textContent = isAdmin
    ? "관리자 로그인 상태"
    : "";
});

// 관리자 상태 확인
onAuthStateChanged(auth, (user) => {
  isAdmin = !!user && user.uid === ADMIN_UID;

  loginBtn.hidden = isAdmin;
  logoutBtn.hidden = !isAdmin;

  adminStatus.textContent = isAdmin
    ? "관리자 로그인 상태"
    : "";
});
