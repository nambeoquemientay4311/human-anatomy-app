# ⚡ Setup Firebase Functions Nhanh (Tóm tắt)

## 🎯 4 Bước Đơn Giản

### 1️⃣ Cài OpenAI Package
```bash
cd functions
npm install openai
cd ..
```

### 2️⃣ Lấy OpenAI API Key
- Vào: https://platform.openai.com/api-keys
- Tạo API key mới và copy

### 3️⃣ Thêm API Key vào Firebase
```bash
firebase functions:secrets:set OPENAI_API_KEY
```
Paste API key khi được hỏi.

### 4️⃣ Deploy Function
```bash
firebase deploy --only functions:chatWithOpenAI
```

---

## ✅ Xong!

Restart app và test AI Chat. Code đã được cấu hình để **ưu tiên sử dụng Firebase Functions**.

---

## ⚠️ Lưu ý

- **Cần Blaze plan** để sử dụng Cloud Functions
- Xem hướng dẫn chi tiết trong `HUONG_DAN_FIREBASE.md`

