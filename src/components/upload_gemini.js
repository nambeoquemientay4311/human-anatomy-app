// upload_gemini.js
// Chạy file này bằng lệnh: node upload_gemini.js

require('dotenv').config(); // Thêm dòng này để đọc file .env
const { GoogleAIFileManager } = require("@google/generative-ai/server");

// 1. API Key sẽ được tự động đọc từ file .env
const API_KEY = process.env.GEMINI_API_KEY;

// 2. Điền đường dẫn chính xác đến file PDF trên máy tính của bạn
// Lưu ý: Trên Windows dùng dấu gạch chéo / hoặc hai dấu gạch ngược \\
const FILE_PATH = "C:\\Users\\Admin\\human-anatomy-app\\tailieu\\khtn-8-kntt-sgk-chinh-thuc-ttb_262202515.pdf"; 

const fileManager = new GoogleAIFileManager(API_KEY);

async function run() {
  if (!API_KEY || API_KEY === "DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY") {
    console.error("❌ Vui lòng cung cấp GEMINI_API_KEY trong file .env");
    return;
  }
  try {
    console.log("⏳ Đang upload file lên Google Gemini...");
    
    const uploadResult = await fileManager.uploadFile(FILE_PATH, {
      mimeType: "application/pdf",
      displayName: "Sinh Hoc 8 Textbook",
    });

    console.log(`\n✅ Upload thành công!`);
    console.log(`👉 File URI: ${uploadResult.file.uri}`);
    console.log(`\nCopy dòng URI trên (bắt đầu bằng https://...) và dán vào biến GEMINI_FILE_URI trong file src/components/AIChatFab.js`);
  } catch (error) {
    console.error("❌ Lỗi upload:", error);
  }
}

run();