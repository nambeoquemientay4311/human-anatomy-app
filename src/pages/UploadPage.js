// src/pages/UploadPage.js
import React, { useState } from 'react';
import CloudinaryUploadWidget from '../components/CloudinaryUploadWidget';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Paper, Typography } from '@mui/material';

function UploadPage() {
  const [uploadMessage, setUploadMessage] = useState('');

  // *** THAY THẾ BẰNG THÔNG TIN CỦA BẠN ***
  const CLOUD_NAME = "dtg50wwuu"; // (Tên Cloudinary của bạn)
  
  // === THAY ĐỔI TÊN PRESET ===
  const UPLOAD_PRESET = "document_uploads"; // <-- Đổi từ "pdf_uploads" thành tên này
  
  // (Hàm handleUploadSuccess giữ nguyên)
  const handleUploadSuccess = async (fileInfo) => {
    // ... code y như cũ ...
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Upload Tài liệu
      </Typography>
      <Typography paragraph>
        Upload Sách giáo khoa, PDF, Word, hoặc các tệp tài liệu khác.
      </Typography>
      
      <CloudinaryUploadWidget 
        cloudName={CLOUD_NAME}
        uploadPreset={UPLOAD_PRESET} // <-- Tên mới đã được cập nhật
        onUploadSuccess={handleUploadSuccess}
      />
      
      {uploadMessage && <Typography sx={{ mt: 2 }}>{uploadMessage}</Typography>}
    </Paper>
  );
}

export default UploadPage;