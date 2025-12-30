# Hướng dẫn Setup AI Chat với Vercel (Miễn phí - Không cần Blaze Plan)

## Tại sao sử dụng Vercel?
- ✅ Miễn phí hoàn toàn
- ✅ Không cần nâng cấp Firebase lên Blaze plan
- ✅ Dễ deploy và quản lý
- ✅ Hỗ trợ Serverless Functions

## Bước 1: Chuẩn bị

1. Đăng ký tài khoản Vercel: https://vercel.com/signup
2. Cài đặt Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

## Bước 2: Lấy OpenAI API Key

1. Truy cập: https://platform.openai.com/api-keys
2. Tạo API key mới
3. Copy và lưu lại API key

## Bước 3: Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard (Dễ nhất)

1. Push code lên GitHub repository
2. Vào https://vercel.com/new
3. Import repository của bạn
4. Trong phần **Environment Variables**, thêm:
   - Key: `OPENAI_API_KEY`
   - Value: API key của bạn
5. Click **Deploy**

### Cách 2: Deploy qua CLI

```bash
# Trong thư mục project
vercel

# Khi hỏi, chọn:
# - Set up and deploy? Yes
# - Which scope? Chọn tài khoản của bạn
# - Link to existing project? No
# - Project name? human-anatomy-app (hoặc tên khác)
# - Directory? ./
# - Override settings? No

# Sau khi deploy xong, thêm environment variable:
vercel env add OPENAI_API_KEY
# Nhập API key khi được hỏi
# Chọn environment: Production, Preview, Development (chọn tất cả)

# Redeploy để áp dụng environment variable:
vercel --prod
```

## Bước 4: Cập nhật Frontend

Sau khi deploy, bạn sẽ nhận được URL như: `https://your-project.vercel.app`

Mở file `src/components/AIChatFab.js` và cập nhật:

```javascript
const fetchChatResponse = async (userMessage) => {
  try {
    // Thay YOUR_VERCEL_URL bằng URL Vercel của bạn
    const VERCEL_URL = 'https://your-project.vercel.app';
    
    const response = await fetch(`${VERCEL_URL}/api/chat`, {
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
      throw new Error('API request failed');
    }

    const data = await response.json();
    
    if (data.success) {
      return data.response;
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error calling AI API:', error);
    // Fallback to mock response
    return mockAIResponse(userMessage);
  }
};
```

## Bước 5: Test

1. Mở ứng dụng
2. Click vào nút AI Chat
3. Gửi tin nhắn test
4. Kiểm tra console nếu có lỗi

## Lưu ý về Chi phí

### Vercel:
- **Miễn phí**: 100GB bandwidth/tháng
- **Hobby plan**: Đủ cho hầu hết trường hợp

### OpenAI:
- **GPT-4o-mini**: ~$0.15 / 1M input tokens, ~$0.60 / 1M output tokens
- **GPT-3.5-turbo**: ~$0.50 / 1M input tokens, ~$1.50 / 1M output tokens
- Theo dõi usage tại: https://platform.openai.com/usage

## Troubleshooting

### Lỗi CORS:
- Kiểm tra `allowedOrigins` trong `api/chat.js`
- Thêm domain của bạn vào danh sách

### Lỗi API Key:
- Kiểm tra environment variable trong Vercel Dashboard
- Đảm bảo đã redeploy sau khi thêm environment variable

### Lỗi 504 Timeout:
- Tăng `maxDuration` trong `vercel.json`
- Hoặc sử dụng model nhẹ hơn như `gpt-3.5-turbo`

## Alternative: Sử dụng Railway/Render

Nếu không muốn dùng Vercel, có thể deploy lên:
- **Railway**: https://railway.app (có free tier)
- **Render**: https://render.com (có free tier)

Code sẽ tương tự, chỉ cần điều chỉnh cấu hình deployment.

