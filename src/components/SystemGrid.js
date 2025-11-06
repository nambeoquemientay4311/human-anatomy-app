// src/components/SystemGrid.js
import React, { useState, useEffect } from 'react'; // Import thêm useState và useEffect
import './SystemGrid.css';
import { db } from '../firebase'; // Import đối tượng 'db' từ file firebase.js
import { collection, getDocs } from 'firebase/firestore'; // Import các hàm của Firestore

function SystemGrid({ onSystemClick }) {
  // 1. DÙNG STATE: Tạo một state để lưu trữ danh sách các hệ cơ quan
  // Ban đầu, nó là một mảng rỗng
  const [organSystems, setOrganSystems] =useState([]);

  // 2. DÙNG USEEFFECT: Hook này sẽ chạy 1 lần khi component được tải
  useEffect(() => {
    
    // 3. Tạo một hàm async (bất đồng bộ) để lấy dữ liệu
    const fetchSystems = async () => {
      console.log("SYSTEMGRID.JS: Bắt đầu lấy dữ liệu từ Firebase...");
      
      // Tham chiếu đến collection 'organSystems' trên Firebase
      const systemsCollectionRef = collection(db, 'organSystems'); 
      
      // Lấy tất cả tài liệu (document) từ collection đó
      const data = await getDocs(systemsCollectionRef);
      
      // 4. Xử lý dữ liệu trả về:
      // Lặp qua từng 'doc' (tài liệu) và tạo một mảng đối tượng mới
      const systemsData = data.docs.map(doc => ({
        ...doc.data(), // Lấy tất cả dữ liệu (name, structure, description...)
        id: doc.id,     // Thêm ID của tài liệu vào (rất quan trọng cho 'key')
      }));
      
      // 5. Cập nhật state 'organSystems' bằng dữ liệu mới
      setOrganSystems(systemsData);
      console.log("SYSTEMGRID.JS: Đã lấy và cập nhật xong:", systemsData.length, "hệ");
    };

    fetchSystems(); // Gọi hàm để chạy
  }, []); // Dấu ngoặc vuông [] rỗng nghĩa là "chỉ chạy 1 lần khi component tải"

  // 6. HIỂN THỊ:
  // React sẽ tự động render lại phần này khi state 'organSystems' thay đổi
  return (
    <div className="system-grid-container">
      <h2>Khám phá các Hệ cơ quan</h2>
      <div className="system-grid">
        {organSystems.map((system) => (
          <div
            key={system.id} // Dùng ID từ Firebase làm key
            className="system-card"
            onClick={() => onSystemClick(system)} 
          >
            <h3>{system.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemGrid;