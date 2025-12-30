// src/config/api.js
// Cấu hình API endpoints cho ChatGPT

// CÁCH 1: Sử dụng AI Service riêng (Khuyến nghị - Dự án riêng)
// Deploy ai-service lên Vercel/Railway/Render và thêm URL vào đây
// Ví dụ: https://your-ai-service.vercel.app
export const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:3001';
export const USE_AI_SERVICE = process.env.REACT_APP_USE_AI_SERVICE !== 'false'; // Mặc định true

// CÁCH 2: Sử dụng Firebase Cloud Functions (Ưu tiên nếu đã setup)
// Firebase Functions đã được cấu hình sẵn trong functions/index.js
// Chỉ cần deploy function và thêm OPENAI_API_KEY vào Firebase
export const USE_FIREBASE_FUNCTIONS = process.env.REACT_APP_USE_FIREBASE_FUNCTIONS === 'true';

// CÁCH 3: Sử dụng Vercel API (Fallback - Miễn phí)
// Sau khi deploy lên Vercel, thay YOUR_VERCEL_URL bằng URL thực tế
// Ví dụ: https://your-project.vercel.app
export const VERCEL_API_URL = process.env.REACT_APP_VERCEL_URL || 'YOUR_VERCEL_URL_HERE';

// CÁCH 4: Gọi trực tiếp OpenAI API từ frontend (CHỈ DÙNG ĐỂ TEST - KHÔNG AN TOÀN)
// ⚠️ CẢNH BÁO: Không nên expose API key trong frontend code!
// Chỉ dùng để test local, sau đó chuyển sang AI Service, Vercel hoặc Firebase Functions
export const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || null;

// Cấu hình model
export const OPENAI_MODEL = 'gpt-4o-mini'; // Hoặc 'gpt-3.5-turbo' để tiết kiệm hơn

// Kiểm tra xem đã cấu hình API chưa
export const isAPIConfigured = () => {
  return AI_SERVICE_URL !== 'http://localhost:3001' || 
         VERCEL_API_URL !== 'YOUR_VERCEL_URL_HERE' || 
         OPENAI_API_KEY !== null ||
         USE_FIREBASE_FUNCTIONS;
};

