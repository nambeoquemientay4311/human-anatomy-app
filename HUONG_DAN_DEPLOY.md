# 🚀 Hướng dẫn Deploy API ChatGPT lên GitHub và Vercel

## ❓ Câu hỏi: Push nguyên project hay chỉ phần AI?

**Trả lời: Push NGUYÊN PROJECT** ✅

### Tại sao?
- Vercel đã có file `vercel.json` cấu hình sẵn
- Vercel sẽ **TỰ ĐỘNG chỉ deploy phần API** (`api/chat.js`)
- **KHÔNG cần build React app** trên Vercel
- Dễ quản lý và maintain hơn
- Frontend vẫn deploy lên Firebase Hosting như bình thường

---

## 📋 Bước 1: Chuẩn bị GitHub Repository

### 1.1. Kiểm tra .gitignore
Đảm bảo file `.gitignore` có các dòng sau (đã có sẵn):
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
node_modules/
build/
```

### 1.2. Tạo Repository trên GitHub
1. Vào https://github.com/new
2. Tạo repository mới (ví dụ: `human-anatomy-app`)
3. **KHÔNG** tích vào "Initialize with README"

### 1.3. Push code lên GitHub
```bash
# Trong thư mục project
git init
git add .
git commit -m "Initial commit - Human Anatomy App with AI Chat"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/human-anatomy-app.git
git push -u origin main
```

**Lưu ý**: Thay `YOUR_USERNAME` bằng username GitHub của bạn.

---

## 🚀 Bước 2: Deploy lên Vercel (Chỉ phần API)

### 2.1. Đăng ký/Đăng nhập Vercel
1. Truy cập: https://vercel.com/signup
2. Đăng nhập bằng GitHub account

### 2.2. Import Project
1. Vào https://vercel.com/new
2. Click **"Import Git Repository"**
3. Chọn repository `human-anatomy-app` vừa tạo
4. Click **"Import"**

### 2.3. Cấu hình Project
Vercel sẽ tự động detect:
- ✅ **Framework Preset**: Other (hoặc không cần)
- ✅ **Root Directory**: `./` (giữ nguyên)
- ✅ **Build Command**: Không cần (Vercel chỉ deploy API)
- ✅ **Output Directory**: Không cần

**QUAN TRỌNG**: Vercel sẽ **TỰ ĐỘNG** chỉ deploy file `api/chat.js` nhờ file `vercel.json` đã cấu hình sẵn!

### 2.4. Thêm Environment Variable
Trước khi Deploy, thêm OpenAI API Key:

1. Trong phần **"Environment Variables"**
2. Click **"Add"**
3. Thêm:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: API key của bạn (lấy từ https://platform.openai.com/api-keys)
4. Chọn tất cả environments: Production, Preview, Development

### 2.5. Deploy
1. Click **"Deploy"**
2. Đợi vài phút để Vercel deploy
3. Sau khi xong, bạn sẽ nhận được URL như: `https://your-project.vercel.app`

---

## ✅ Bước 3: Cập nhật Frontend

### 3.1. Lấy Vercel URL
Sau khi deploy xong, copy URL từ Vercel dashboard (ví dụ: `https://human-anatomy-app.vercel.app`)

### 3.2. Cập nhật cấu hình
Có 2 cách:

#### Cách 1: Tạo file `.env` (Khuyến nghị)
Tạo file `.env` trong thư mục gốc:
```env
REACT_APP_VERCEL_URL=https://your-project.vercel.app
```

#### Cách 2: Cập nhật trực tiếp trong code
Mở `src/config/api.js` và sửa:
```javascript
export const VERCEL_API_URL = 'https://your-project.vercel.app';
```

### 3.3. Restart ứng dụng
```bash
npm start
```

---

## 🎯 Kết quả

Sau khi hoàn thành:
- ✅ **API ChatGPT** chạy trên Vercel: `https://your-project.vercel.app/api/chat`
- ✅ **Frontend React** vẫn chạy trên Firebase Hosting như bình thường
- ✅ **AI Chat** trong app sẽ gọi API từ Vercel

---

## 📝 Lưu ý quan trọng

### ✅ Nên làm:
- Push toàn bộ project lên GitHub
- Deploy lên Vercel (Vercel tự động chỉ deploy API)
- Frontend vẫn deploy lên Firebase Hosting
- Thêm `.env` vào `.gitignore` (đã có sẵn)

### ❌ Không nên:
- Không commit file `.env` lên GitHub
- Không commit API keys vào code
- Không cần build React app trên Vercel

---

## 🔍 Kiểm tra

### Test API trực tiếp:
```bash
curl -X POST https://your-project.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hệ thần kinh là gì?"}'
```

### Test trong app:
1. Mở ứng dụng
2. Click nút AI Chat (góc dưới bên phải)
3. Gửi câu hỏi
4. Nếu nhận được phản hồi từ AI → Thành công! ✅

---

## 🆘 Xử lý lỗi

### Lỗi: "OpenAI API key not configured"
→ Kiểm tra Environment Variable trong Vercel đã thêm `OPENAI_API_KEY` chưa

### Lỗi: "API request failed"
→ Kiểm tra:
- Vercel URL có đúng không
- API đã deploy thành công chưa (xem Vercel dashboard)
- CORS có được cấu hình đúng không

### Lỗi: "Cannot find module"
→ Đảm bảo file `api/chat.js` tồn tại và có trong repository

---

## 💡 Tóm tắt

1. **Push toàn bộ project** lên GitHub ✅
2. **Import vào Vercel** → Vercel tự động chỉ deploy API
3. **Thêm OPENAI_API_KEY** vào Vercel Environment Variables
4. **Cập nhật REACT_APP_VERCEL_URL** trong frontend
5. **Test** → Xong! 🎉

