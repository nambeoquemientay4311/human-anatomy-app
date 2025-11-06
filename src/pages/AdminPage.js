// src/pages/AdminPage.js
import React, { useState } from 'react';
import CloudinaryUploadWidget from '../components/CloudinaryUploadWidget';
import { db } from '../firebase'; // Import Firestore db
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 

function AdminPage() {
  const [uploadMessage, setUploadMessage] = useState('');

  // *** HÃY THAY THẾ BẰNG THÔNG TIN CỦA BẠN ***
  const CLOUD_NAME = "dtg50wwuu"; // Cloud Name bạn đã lấy
  const UPLOAD_PRESET = "xaul0vkj"; // (Tên preset "Unsigned" bạn đã tạo)
  
  const handleUploadSuccess = async (fileInfo) => {
    setUploadMessage('Đang lưu thông tin file vào cơ sở dữ liệu...');
    try {
      const { name, url } = fileInfo;
      const docCollectionRef = collection(db, "documents");
      
      await addDoc(docCollectionRef, {
        fileName: name,    
        fileUrl: url,     
        uploadedAt: serverTimestamp() 
      });

      console.log("Đã lưu link vào Firestore!");
      setUploadMessage(`Upload thành công: ${name}`);
      
    } catch (error) {
      console.error("Lỗi khi lưu vào Firestore:", error);
      setUploadMessage('Lỗi: Không thể lưu link vào cơ sở dữ liệu.');
    }
  };

  return (
    <div>
      <h2>Trang Quản lý Admin</h2>
      <p>Sử dụng nút bên dưới để upload Sách giáo khoa hoặc file PDF.</p>
      
      <CloudinaryUploadWidget 
        cloudName={CLOUD_NAME}
        uploadPreset={UPLOAD_PRESET}
        onUploadSuccess={handleUploadSuccess}
      />
      
      {uploadMessage && <p>{uploadMessage}</p>}
    </div>
  );
}

export default AdminPage;