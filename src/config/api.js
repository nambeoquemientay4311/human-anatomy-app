// src/config/api.js
// Cấu hình API endpoints cho ChatGPT

// CÁCH 1: Sử dụng Vercel API (Khuyến nghị - Miễn phí)
// Sau khi deploy lên Vercel, thay YOUR_VERCEL_URL bằng URL thực tế
// Ví dụ: https://your-project.vercel.app
export const VERCEL_API_URL = process.env.REACT_APP_VERCEL_URL || 'YOUR_VERCEL_URL_HERE';

// CÁCH 2: Sử dụng Firebase Cloud Functions
// Uncomment dòng dưới nếu muốn dùng Firebase Functions
// export const USE_FIREBASE_FUNCTIONS = true;

// CÁCH 3: Gọi trực tiếp OpenAI API từ frontend (CHỈ DÙNG ĐỂ TEST - KHÔNG AN TOÀN)
// ⚠️ CẢNH BÁO: Không nên expose API key trong frontend code!
// Chỉ dùng để test local, sau đó chuyển sang Vercel hoặc Firebase Functions
export const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || null;

// Cấu hình model
export const OPENAI_MODEL = 'gpt-4o-mini'; // Hoặc 'gpt-3.5-turbo' để tiết kiệm hơn

// Kiểm tra xem đã cấu hình API chưa
export const isAPIConfigured = () => {
  return VERCEL_API_URL !== 'YOUR_VERCEL_URL_HERE' || OPENAI_API_KEY !== null;
};

