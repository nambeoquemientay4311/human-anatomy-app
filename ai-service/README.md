# 🤖 AI Service - Human Anatomy App

Dự án AI Service riêng cho Human Anatomy App. Service này cung cấp API endpoint để tích hợp ChatGPT/OpenAI vào ứng dụng.

## 📋 Tính năng

- ✅ API endpoint đơn giản để chat với OpenAI
- ✅ Hỗ trợ system prompt tùy chỉnh
- ✅ CORS đã được cấu hình sẵn
- ✅ Error handling đầy đủ
- ✅ Có thể deploy lên Vercel, Railway, Render, hoặc chạy standalone

## 🚀 Cài đặt

### Bước 1: Cài đặt dependencies

```bash
cd ai-service
npm install
```

### Bước 2: Cấu hình Environment Variables

Copy file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

**Lấy OpenAI API Key:**
1. Truy cập: https://platform.openai.com/api-keys
2. Đăng nhập/Đăng ký
3. Tạo API Key mới
4. Copy và paste vào `.env`

## 🏃 Chạy Local

### Chạy bằng Node.js

```bash
npm start
```

Service sẽ chạy tại: `http://localhost:3001`

### Chạy với Nodemon (Auto-reload)

```bash
npm run dev
```

## 📡 API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "ai-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Chat API

```http
POST /api/chat
Content-Type: application/json

{
  "message": "Giải thích về hệ thần kinh",
  "systemPrompt": "Bạn là trợ lý AI...", // Optional
  "model": "gpt-4o-mini", // Optional
  "temperature": 0.7, // Optional
  "maxTokens": 1000 // Optional
}
```

Response:
```json
{
  "success": true,
  "response": "Hệ thần kinh là hệ thống điều khiển...",
  "model": "gpt-4o-mini",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100,
    "total_tokens": 150
  }
}
```

## 🚀 Deploy

### Deploy lên Vercel (Khuyến nghị - Miễn phí)

1. **Cài đặt Vercel CLI** (nếu chưa có):
```bash
npm i -g vercel
```

2. **Login vào Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd ai-service
vercel
```

4. **Thêm Environment Variable**:
   - Vào Vercel Dashboard → Project → Settings → Environment Variables
   - Thêm: `OPENAI_API_KEY` = `your_api_key`

5. **Deploy lại** (nếu cần):
```bash
vercel --prod
```

**Lưu ý:** Khi deploy lên Vercel, Vercel sẽ tự động nhận diện file `api/chat.js` như một serverless function.

### Deploy lên Railway

1. Tạo tài khoản tại: https://railway.app
2. Tạo New Project → Deploy from GitHub repo
3. Chọn thư mục `ai-service`
4. Thêm Environment Variable: `OPENAI_API_KEY`
5. Deploy tự động!

### Deploy lên Render

1. Tạo tài khoản tại: https://render.com
2. Tạo New → Web Service
3. Connect GitHub repo
4. Chọn thư mục `ai-service`
5. Build Command: `npm install`
6. Start Command: `node server.js`
7. Thêm Environment Variable: `OPENAI_API_KEY`
8. Deploy!

### Deploy lên VPS/Docker

#### Dockerfile

Tạo file `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

#### Docker Compose

Tạo file `docker-compose.yml`:

```yaml
version: '3.8'

services:
  ai-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PORT=3001
    restart: unless-stopped
```

Chạy:
```bash
docker-compose up -d
```

## 🔗 Tích hợp vào Main App

Sau khi deploy, bạn sẽ có URL của service (ví dụ: `https://your-ai-service.vercel.app`)

### Cách 1: Cập nhật config trong main app

Mở `src/config/api.js` và thêm:

```javascript
// AI Service URL (sau khi deploy)
export const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'https://your-ai-service.vercel.app';

// Hoặc sử dụng AI Service thay vì Vercel API
export const USE_AI_SERVICE = true;
```

### Cách 2: Cập nhật AIChatFab.js

Trong `src/components/AIChatFab.js`, thêm vào `fetchChatResponse`:

```javascript
// Option: Sử dụng AI Service
if (AI_SERVICE_URL && USE_AI_SERVICE) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        systemPrompt: SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      throw new Error('AI Service request failed');
    }

    const data = await response.json();
    
    if (data.success) {
      return data.response;
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (aiServiceError) {
    console.error('AI Service error:', aiServiceError);
    // Fall through to other options
  }
}
```

### Cách 3: Tạo file .env trong main app

Tạo file `.env` trong thư mục gốc của main app:

```env
REACT_APP_AI_SERVICE_URL=https://your-ai-service.vercel.app
```

## 🔒 Security

- ✅ API key được lưu trong environment variables (không hardcode)
- ✅ CORS đã được cấu hình để chỉ cho phép các domain được phép
- ✅ Input validation đã được thêm
- ✅ Error handling không expose thông tin nhạy cảm

## 💰 Chi phí

### OpenAI API
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **GPT-3.5-turbo**: ~$0.50 per 1M tokens

### Hosting
- **Vercel**: Miễn phí (với giới hạn)
- **Railway**: Có free tier
- **Render**: Có free tier

**Ước tính**: Với 1000 requests/tháng, chi phí khoảng $1-5 tùy độ dài câu trả lời.

## 📝 Cấu trúc Project

```
ai-service/
├── api/
│   └── chat.js          # Vercel serverless function
├── server.js            # Express server (standalone)
├── package.json
├── .env.example
├── .gitignore
├── vercel.json          # Vercel config
└── README.md
```

## 🆘 Troubleshooting

### Lỗi: "OpenAI API key not configured"

**Giải pháp**: Đảm bảo đã set `OPENAI_API_KEY` trong environment variables.

### Lỗi: CORS error

**Giải pháp**: Thêm domain của bạn vào `ALLOWED_ORIGINS` trong `.env`.

### Lỗi: Module not found

**Giải pháp**: Chạy `npm install` lại.

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong console
2. Kiểm tra environment variables
3. Kiểm tra API key có hợp lệ không tại: https://platform.openai.com/api-keys

---

**Lưu ý**: Đây là một service riêng, có thể deploy độc lập và tích hợp vào bất kỳ ứng dụng nào cần AI chat functionality.

