# 🔥 Hướng dẫn Setup ChatGPT API với Firebase Cloud Functions

## ✅ Ưu điểm của Firebase Functions

- ✅ Tất cả đều trên Firebase (không cần Vercel)
- ✅ Dễ quản lý và maintain
- ✅ Tích hợp tốt với Firebase Auth, Firestore
- ✅ Code đã có sẵn trong `functions/index.js`

## ⚠️ Yêu cầu

- Firebase project đã được tạo
- **Cần upgrade Firebase lên Blaze plan** (Pay-as-you-go) để sử dụng Cloud Functions
- Firebase CLI đã được cài đặt

---

## 📋 Bước 1: Cài đặt OpenAI Package

```bash
cd functions
npm install openai
```

**Lưu ý**: Package `openai` đã có trong `functions/package.json`, nhưng nếu chưa cài thì chạy lệnh trên.

---

## 🔑 Bước 2: Lấy OpenAI API Key

1. Truy cập: https://platform.openai.com/api-keys
2. Đăng nhập/Đăng ký tài khoản
3. Tạo API Key mới
4. Copy API Key (chỉ hiển thị 1 lần, lưu lại cẩn thận!)

---

## ⚙️ Bước 3: Thêm API Key vào Firebase

### Cách 1: Sử dụng Firebase CLI (Khuyến nghị)

```bash
# Trong thư mục gốc của project
firebase functions:secrets:set OPENAI_API_KEY
```

Khi được hỏi, paste API key của bạn vào.

### Cách 2: Sử dụng Firebase Console

1. Vào Firebase Console: https://console.firebase.google.com
2. Chọn project của bạn
3. Vào **Functions** → **Secrets** (hoặc **Configuration**)
4. Click **"Add secret"**
5. Thêm:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: API key của bạn
6. Click **"Save"**

### Cách 3: Sử dụng Environment Variables (Firebase Functions v2)

```bash
firebase functions:config:set openai.api_key="YOUR_API_KEY_HERE"
```

**Lưu ý**: Với Firebase Functions v2, nên dùng Secrets (Cách 1 hoặc 2).

---

## 🚀 Bước 4: Deploy Firebase Function

### 4.1. Đảm bảo đã login Firebase CLI

```bash
firebase login
```

### 4.2. Chọn project Firebase

```bash
firebase use your-project-id
```

### 4.3. Deploy function

```bash
# Deploy chỉ function chatWithOpenAI
firebase deploy --only functions:chatWithOpenAI

# Hoặc deploy tất cả functions
firebase deploy --only functions
```

### 4.4. Đợi deploy hoàn tất

Sẽ mất vài phút. Sau khi xong, bạn sẽ thấy URL của function.

---

## ✅ Bước 5: Kiểm tra Frontend

Code trong `src/components/AIChatFab.js` đã được cấu hình để **ưu tiên sử dụng Firebase Functions**.

### 5.1. Kiểm tra code

Mở `src/components/AIChatFab.js`, phần `fetchChatResponse` đã uncomment Firebase Functions:

```javascript
// Option 1: Sử dụng Firebase Cloud Functions (Ưu tiên)
try {
  const chatFunction = httpsCallable(functions, 'chatWithOpenAI');
  const result = await chatFunction({ 
    message: userMessage, 
    systemPrompt: SYSTEM_PROMPT 
  });
  // ...
}
```

### 5.2. Test trong app

1. Restart ứng dụng: `npm start`
2. Mở ứng dụng
3. Click nút AI Chat (góc dưới bên phải)
4. Gửi câu hỏi
5. Nếu nhận được phản hồi từ AI → Thành công! ✅

---

## 🔍 Kiểm tra Function đã hoạt động

### Cách 1: Xem logs trong Firebase Console

1. Vào Firebase Console → Functions
2. Click vào function `chatWithOpenAI`
3. Xem tab **Logs** để kiểm tra

### Cách 2: Test trực tiếp trong app

Gửi câu hỏi trong AI Chat và xem console log.

### Cách 3: Sử dụng Firebase CLI

```bash
firebase functions:log --only chatWithOpenAI
```

---

## 🆘 Xử lý lỗi

### Lỗi: "OpenAI API key not found"

**Nguyên nhân**: Chưa thêm API key vào Firebase Secrets.

**Giải pháp**:
1. Kiểm tra đã thêm `OPENAI_API_KEY` vào Firebase Secrets chưa
2. Nếu dùng Functions v2, đảm bảo đã set secret đúng cách
3. Redeploy function sau khi thêm secret:
   ```bash
   firebase deploy --only functions:chatWithOpenAI
   ```

### Lỗi: "OpenAI package not installed"

**Nguyên nhân**: Chưa cài package `openai` trong thư mục `functions`.

**Giải pháp**:
```bash
cd functions
npm install openai
cd ..
firebase deploy --only functions:chatWithOpenAI
```

### Lỗi: "Permission denied" hoặc "Billing required"

**Nguyên nhân**: Chưa upgrade Firebase lên Blaze plan.

**Giải pháp**:
1. Vào Firebase Console → Project Settings → Billing
2. Upgrade lên Blaze plan (Pay-as-you-go)
3. Lưu ý: Blaze plan có free tier, chỉ trả tiền khi sử dụng vượt quá free tier

### Lỗi: Function không được gọi

**Nguyên nhân**: Function chưa được deploy hoặc có lỗi trong code.

**Giải pháp**:
1. Kiểm tra function đã deploy thành công chưa
2. Xem logs trong Firebase Console
3. Kiểm tra code trong `functions/index.js` có lỗi không

---

## 💰 Chi phí

### Firebase Functions
- **Free tier**: 2 triệu invocations/tháng
- **Sau free tier**: $0.40 per 1 triệu invocations

### OpenAI API
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **GPT-3.5-turbo**: Rẻ hơn, ~$0.50 per 1M tokens

**Ước tính**: Với 1000 requests/tháng, chi phí khoảng $1-5 tùy độ dài câu trả lời.

---

## 📝 Tóm tắt

1. ✅ Cài `openai` package trong `functions`: `npm install openai`
2. ✅ Lấy OpenAI API Key từ https://platform.openai.com/api-keys
3. ✅ Thêm API key vào Firebase Secrets: `firebase functions:secrets:set OPENAI_API_KEY`
4. ✅ Deploy function: `firebase deploy --only functions:chatWithOpenAI`
5. ✅ Test trong app → Xong! 🎉

---

## 🔄 So sánh với Vercel

| Tính năng | Firebase Functions | Vercel API |
|-----------|-------------------|------------|
| Chi phí | Cần Blaze plan | Miễn phí |
| Setup | Phức tạp hơn | Đơn giản hơn |
| Tích hợp | Tốt với Firebase | Độc lập |
| Quản lý | Firebase Console | Vercel Dashboard |

**Khuyến nghị**: 
- Nếu đã có Blaze plan → Dùng Firebase Functions
- Nếu chưa có Blaze plan → Dùng Vercel API

