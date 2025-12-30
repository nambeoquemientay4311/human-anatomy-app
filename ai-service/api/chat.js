/**
 * Vercel Serverless Function - Chat API
 * File này để deploy lên Vercel dạng serverless function
 * 
 * Nếu deploy lên Vercel, Vercel sẽ tự động nhận diện file này trong thư mục /api
 */

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS handling
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://human-anatomy-app-4483b.web.app',
    'https://human-anatomy-app-4483b.firebaseapp.com'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { message, systemPrompt, model, temperature, maxTokens } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Lấy API key từ environment variable
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Vui lòng cấu hình OPENAI_API_KEY trong Vercel environment variables'
      });
    }

    // Import OpenAI (ES6)
    const OpenAI = (await import('openai')).default;

    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Default system prompt
    const defaultSystemPrompt = `Bạn là một trợ lý AI chuyên về giải phẫu học và sinh học cơ thể người. 
Bạn giúp học sinh lớp 8 học về các hệ cơ quan trong cơ thể người như:
- Hệ Thần kinh
- Hệ Tuần hoàn
- Hệ Hô hấp
- Hệ Tiêu hóa
- Hệ Bài tiết
- Hệ Nội tiết
- Hệ Sinh dục
- Hệ Vận động

Hãy trả lời một cách dễ hiểu, chính xác và thân thiện. Sử dụng tiếng Việt.`;

    // Gọi OpenAI API
    const completion = await openai.chat.completions.create({
      model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt || defaultSystemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 1000
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Không nhận được phản hồi từ AI';

    return res.status(200).json({
      success: true,
      response: aiResponse,
      model: completion.model,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        error: error.response.data?.error?.message || 'OpenAI API error',
        response: 'Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      response: 'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.'
    });
  }
}

