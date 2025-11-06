// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth } from './firebase'; // Import auth từ firebase
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Import các "Trang" (Pages)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import DocumentsPage from './pages/DocumentsPage';

// Import các "Components" (Thành phần)
import Chatbot from './components/Chatbot'; // <-- Import Chatbot

import './App.css';

// *** ĐÂY LÀ CHÌA KHÓA ADMIN CỦA BẠN ***
// TODO: Thay thế chuỗi này bằng User UID của tài khoản Admin của bạn
const ADMIN_UID = "YOUR_ADMIN_UID_GOES_HERE"; 

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // State loading để chờ Firebase

  // Hook này sẽ tự động chạy khi trạng thái đăng nhập thay đổi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Người dùng đã đăng nhập
        setCurrentUser(user);
        // Kiểm tra xem có phải Admin không?
        if (user.uid === ADMIN_UID) {
          setIsAdmin(true);
          console.log("Xác thực thành công: ADMIN");
        } else {
          setIsAdmin(false);
          console.log("Xác thực thành công: USER");
        }
      } else {
        // Người dùng đã đăng xuất
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false); // Đánh dấu đã tải xong trạng thái auth
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần

  // Hàm Đăng xuất
  const handleLogout = () => {
    signOut(auth).catch((error) => console.error("Lỗi đăng xuất:", error));
  };

  // Hiển thị "Loading..." trong khi chờ xác thực
  if (isLoading) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Đang tải trang...</div>;
  }

  // Giao diện chính của ứng dụng
  return (
    <BrowserRouter>
      <div className="App">
        
        {/* THANH ĐIỀU HƯỚNG (NAVBAR) */}
        <header className="App-header">
          <h1>WebApp Khám phá Cơ thể Người 3D</h1>
          <nav>
            <Link to="/">Trang chủ</Link>
            <Link to="/documents">Tài liệu</Link>
            
            {/* Hiển thị link Admin nếu là Admin */}
            {isAdmin && <Link to="/admin">Trang Admin</Link>}
            
            {/* Hiển thị Đăng nhập hoặc Đăng xuất */}
            {currentUser ? (
              <button onClick={handleLogout} className="logout-button">
                Đăng xuất ({currentUser.email})
              </button>
            ) : (
              <Link to="/login">Đăng nhập</Link>
            )}
          </nav>
        </header>

        {/* PHẦN NỘI DUNG CHÍNH (ĐỊNH TUYẾN) */}
        <main>
          <Routes>
            {/* Trang chủ: / */}
            <Route path="/" element={<HomePage />} />
            
            {/* Trang Tài liệu: /documents */}
            <Route path="/documents" element={<DocumentsPage />} />
            
            {/* Trang Đăng nhập: /login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Trang Admin: /admin */}
            {/* Bảo vệ trang này: 
                Nếu là Admin -> cho vào AdminPage
                Nếu không phải -> Đá về Trang chủ
            */}
            <Route 
              path="/admin" 
              element={isAdmin ? <AdminPage /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>

        {/* CHÂN TRANG */}
        <footer>
          <p>Bản quyền © 2025</p>
        </footer>

        {/* CHATBOT (Hiển thị trên mọi trang) */}
        <Chatbot />
      
      </div>
    </BrowserRouter>
  );
}

export default App;