# Hướng dẫn Tích hợp ChatGPT API

## 📍 Vị trí tích hợp API

API ChatGPT được tích hợp trong file **`src/components/AIChatFab.js`** - component AI Chat.

Có 3 cách để tích hợp:

---

## 🚀 Cách 1: Sử dụng Vercel API (Khuyến nghị - Miễn phí)

### Bước 1: Lấy OpenAI API Key
1. Truy cập: https://platform.openai.com/api-keys
2. Đăng nhập/Đăng ký tài khoản
3. Tạo API Key mới và copy lại

### Bước 2: Deploy lên Vercel
1. Đăng ký tài khoản Vercel: https://vercel.com/signup
2. Push code lên GitHub (nếu chưa có)
3. Vào https://vercel.com/new và import repository
4. Trong phần **Environment Variables**, thêm:
   - Key: `OPENAI_API_KEY`
   - Value: API key của bạn
5. Click **Deploy**

### Bước 3: Cập nhật Frontend
Sau khi deploy, bạn sẽ nhận được URL như: `https://your-project.vercel.app`

Tạo file `.env` trong thư mục gốc:
```env
REACT_APP_VERCEL_URL=https://your-project.vercel.app
```

Hoặc cập nhật trực tiếp trong `src/config/api.js`:
```javascript
export const VERCEL_API_URL = 'https://your-project.vercel.app';
```

### Bước 4: Restart ứng dụng
```bash
npm start
```

---

## 🔥 Cách 2: Sử dụng Firebase Cloud Functions (Cần Blaze Plan)

### Bước 1: Cài đặt OpenAI package
```bash
cd functions
npm install openai
```

### Bước 2: Cấu hình API Key
```bash
firebase functions:config:set openai.api_key="YOUR_API_KEY_HERE"
```

### Bước 3: Deploy Function
```bash
firebase deploy --only functions:chatWithOpenAI
```

### Bước 4: Uncomment code trong AIChatFab.js
Mở `src/components/AIChatFab.js` và uncomment phần Firebase Functions (dòng 186-198).

---

## ⚠️ Cách 3: Gọi trực tiếp từ Frontend (CHỈ ĐỂ TEST)

**CẢNH BÁO**: Không an toàn, chỉ dùng để test local!

### Bước 1: Tạo file `.env`
Tạo file `.env` trong thư mục gốc:
```env
REACT_APP_OPENAI_API_KEY=sk-your-api-key-here
```

### Bước 2: Restart ứng dụng
```bash
npm start
```

**Lưu ý**: Không commit file `.env` lên GitHub!

---

## ✅ Kiểm tra đã cấu hình đúng chưa

1. Mở ứng dụng
2. Click vào nút AI Chat (góc dưới bên phải)
3. Gửi một câu hỏi
4. Nếu nhận được phản hồi từ AI (không phải mock response) → Đã thành công!

---

## 📝 File cấu hình

Các file liên quan:
- **`src/config/api.js`** - File cấu hình API endpoints
- **`src/components/AIChatFab.js`** - Component AI Chat (đã tích hợp sẵn)
- **`api/chat.js`** - Vercel serverless function (đã có sẵn)

---

## 🆘 Xử lý lỗi

### Lỗi: "Chưa cấu hình API"
→ Kiểm tra file `.env` hoặc `src/config/api.js` đã được cấu hình đúng chưa

### Lỗi: "API request failed"
→ Kiểm tra:
- API key có đúng không
- Vercel URL có đúng không
- Đã deploy Vercel function chưa

### Lỗi: "OpenAI API key not configured"
→ Kiểm tra environment variable trong Vercel đã được thêm chưa

---

## 💡 Gợi ý

- **Development**: Dùng Vercel API (miễn phí, dễ setup)
- **Production**: Nên dùng Vercel API hoặc Firebase Functions
- **Testing**: Có thể dùng direct API call nhưng nhớ không commit API key

