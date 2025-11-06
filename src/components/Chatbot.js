// src/components/Chatbot.js
import React, { useState } from 'react';
import './Chatbot.css'; // Chúng ta sẽ tạo file này ngay sau đây

// -----------------------------------------------------------------
// *** THAY THẾ URL NÀY BẰNG LINK RENDER.COM CỦA BẠN ***
const RENDER_BACKEND_URL = "https://anatomy-ai-backend.onrender.com";
// -----------------------------------------------------------------

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false); // Trạng thái đóng/mở
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Chào bạn! Bạn cần tôi giúp gì về sinh học?' }
  ]);
  const [prompt, setPrompt] = useState(''); // Nội dung đang gõ
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý khi gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || !prompt) return; // Không gửi nếu đang tải hoặc input rỗng

    const userMessage = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]); // Thêm tin nhắn của user vào
    setPrompt(''); // Xóa input
    setIsLoading(true);

    try {
      // 1. Gọi backend "trung gian" trên Render
      const response = await fetch(`${RENDER_BACKEND_URL}/askGemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }), // Gửi câu hỏi
      });

      if (!response.ok) {
        throw new Error('Lỗi từ máy chủ');
      }

      // 2. Nhận câu trả lời từ backend
      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.answer };
      setMessages(prev => [...prev, botMessage]); // Thêm tin nhắn của bot
      
    } catch (error) {
      console.error("Lỗi khi gọi AI:", error);
      const errorMessage = { sender: 'bot', text: 'Xin lỗi, tôi gặp lỗi. Vui lòng thử lại.' };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  // Nút tròn để mở/đóng
  if (!isOpen) {
    return (
      <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
        🤖
      </button>
    );
  }

  // Giao diện chatbot khi mở
  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <h3>AI Trợ lý Sinh học</h3>
        <button onClick={() => setIsOpen(false)}>&times;</button>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="message bot">Đang suy nghĩ...</div>}
      </div>
      
      <form className="chatbot-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Hỏi tôi bất cứ điều gì..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Gửi</button>
      </form>
    </div>
  );
}

export default Chatbot;