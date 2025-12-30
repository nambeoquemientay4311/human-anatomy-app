# Hướng dẫn Setup OpenAI API cho AI Chat

## Bước 1: Cài đặt OpenAI Package

Trong thư mục `functions`, chạy lệnh:

```bash
cd functions
npm install openai
```

## Bước 2: Lấy OpenAI API Key

1. Truy cập https://platform.openai.com/
2. Đăng ký/Đăng nhập tài khoản
3. Vào API Keys: https://platform.openai.com/api-keys
4. Tạo API Key mới
5. Copy API Key (chỉ hiển thị 1 lần, lưu lại cẩn thận!)

## Bước 3: Thêm API Key vào Firebase Functions

### Cách 1: Sử dụng Firebase CLI

```bash
firebase functions:config:set openai.api_key="YOUR_API_KEY_HERE"
```

### Cách 2: Sử dụng Firebase Console

1. Vào Firebase Console → Functions → Configuration
2. Thêm environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: API key của bạn

## Bước 4: Cập nhật Cloud Function

Mở file `functions/index.js` và uncomment phần code OpenAI:

```javascript
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

Và uncomment phần gọi API trong function `chatWithOpenAI`.

## Bước 5: Deploy Cloud Function

```bash
firebase deploy --only functions:chatWithOpenAI
```

## Bước 6: Cập nhật Frontend

Mở file `src/components/AIChatFab.js` và uncomment phần code gọi Cloud Function:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const chatFunction = httpsCallable(functions, 'chatWithOpenAI');

const result = await chatFunction({ 
  message: userMessage, 
  systemPrompt: SYSTEM_PROMPT 
});
return result.data.response;
```

## Lưu ý về Chi phí

- **GPT-4o-mini**: Rẻ hơn, phù hợp cho chat
- **GPT-3.5-turbo**: Rất rẻ, đủ cho hầu hết trường hợp
- Theo dõi usage tại: https://platform.openai.com/usage

## Testing

Sau khi deploy, test bằng cách:
1. Mở ứng dụng
2. Click vào nút AI Chat (góc dưới bên phải)
3. Gửi tin nhắn test
4. Kiểm tra console để xem có lỗi không

## Troubleshooting

- Nếu lỗi "Function not found": Đảm bảo đã deploy function
- Nếu lỗi "API key invalid": Kiểm tra lại API key trong Firebase config
- Nếu lỗi CORS: Đảm bảo đã set `cors: true` trong function options

