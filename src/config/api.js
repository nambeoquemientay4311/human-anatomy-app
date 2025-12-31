export const VERCEL_API_URL = process.env.REACT_APP_VERCEL_URL || 'https://human-anatomy-app.vercel.app';

export const AI_SERVICE_URL = '';
export const USE_AI_SERVICE = false;
export const USE_FIREBASE_FUNCTIONS = false;
export const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY; // Chỉ dùng test local
export const OPENAI_MODEL = 'gpt-3.5-turbo';

// Hàm kiểm tra xem đã cấu hình API chưa
export const isAPIConfigured = () => !!VERCEL_API_URL || !!OPENAI_API_KEY;
