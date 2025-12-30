// src/pages/RobokiPage.js
import React from 'react';

// CSS để tùy chỉnh iframe
const styles = {
  iframe: {
    width: '100%', // Rộng 100%
    height: '80vh',  // Cao bằng 80% chiều cao màn hình
    border: '1px solid #ddd',
    borderRadius: '8px'
  },
  container: {
    textAlign: 'center'
  }
};

function RobokiPage() {
  return (
    <div style={styles.container}>
      <h2>AI Roboki</h2>
      <p>Đây là một ứng dụng web bên ngoài được nhúng vào.</p>
      
      <iframe 
        src="https://roboki.vn/" 
        style={styles.iframe}
        title="Roboki AI Chatbot"
      >
        Trình duyệt của bạn không hỗ trợ iframe.
      </iframe>
    </div>
  );
}

export default RobokiPage;