// src/components/CloudinaryUploadWidget.js
import React, { useEffect, useRef } from 'react';

function CloudinaryUploadWidget({ cloudName, uploadPreset, onUploadSuccess }) {
  const cloudinaryWidget = useRef(null);
  
  // Tải script của Cloudinary khi component được tải
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = () => {
      // Script đã tải, giờ chúng ta khởi tạo widget
      cloudinaryWidget.current = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          sources: ['local'], // Chỉ cho phép upload từ máy tính
          multiple: false,    // Chỉ cho upload 1 file 1 lần
          // folder: 'pdfs', // Tùy chọn: lưu vào 1 thư mục trên Cloudinary
          // acceptedFiles: 'application/pdf', // Tùy chọn: chỉ cho phép PDF
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            // Upload thành công!
            console.log('Upload thành công! Dữ liệu:', result.info);
            // Gọi hàm callback (onUploadSuccess) với thông tin file
            if (onUploadSuccess) {
              onUploadSuccess({
                name: result.info.original_filename,
                url: result.info.secure_url
              });
            }
          }
        }
      );
    };
    document.body.appendChild(script);

    // Dọn dẹp script khi component bị gỡ bỏ
    return () => {
      document.body.removeChild(script);
    };
  }, [cloudName, uploadPreset, onUploadSuccess]);

  // Hàm này được gọi bởi nút bấm bên dưới
  const openWidget = () => {
    if (cloudinaryWidget.current) {
      cloudinaryWidget.current.open();
    }
  };

  return (
    <button onClick={openWidget} className="upload-widget-button">
      Upload File PDF
    </button>
  );
}

export default CloudinaryUploadWidget;