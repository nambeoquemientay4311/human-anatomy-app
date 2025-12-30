# ⚡ Hướng dẫn Deploy Nhanh (Tóm tắt)

## TL;DR: Push NGUYÊN PROJECT lên GitHub và Vercel ✅

---

## 🎯 3 Bước Đơn Giản

### 1️⃣ Push lên GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/human-anatomy-app.git
git push -u origin main
```

### 2️⃣ Deploy lên Vercel
1. Vào https://vercel.com/new
2. Import repository từ GitHub
3. Thêm Environment Variable:
   - Key: `OPENAI_API_KEY`
   - Value: API key của bạn
4. Click **Deploy**

### 3️⃣ Cập nhật Frontend
Tạo file `.env` trong thư mục gốc:
```env
REACT_APP_VERCEL_URL=https://your-project.vercel.app
```

Restart app: `npm start`

---

## ✅ Kết quả

- ✅ Vercel tự động chỉ deploy `api/chat.js` (nhờ `vercel.json`)
- ✅ Frontend vẫn chạy trên Firebase Hosting
- ✅ AI Chat hoạt động! 🎉

---

Xem chi tiết trong file `HUONG_DAN_DEPLOY.md`

