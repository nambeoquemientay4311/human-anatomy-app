// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// ======================================================
// DÁN CẤU HÌNH BẠN SAO CHÉP TỪ FIREBASE VÀO ĐÂY
const firebaseConfig = {
    apiKey: "AIzaSyCrtXAA5RlbN8QwEWgtMRlPnWE2mzLQj7k",
    authDomain: "human-anatomy-app-4483b.firebaseapp.com",
    projectId: "human-anatomy-app-4483b",
    storageBucket: "human-anatomy-app-4483b.firebasestorage.app",
    messagingSenderId: "703173863913",
    appId: "1:703173863913:web:9fc2a443a003b22dc74378"

};
// ======================================================

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Xuất các dịch vụ để sử dụng
export { db, storage, auth, functions };