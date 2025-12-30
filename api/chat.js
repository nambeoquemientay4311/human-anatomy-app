// api/chat.js - Vercel Serverless Function
// Deploy this to Vercel for free OpenAI API integration

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Kiểm tra CORS
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://human-anatomy-app-4483b.web.app',
    'https://human-anatomy-app-4483b.firebaseapp.com',
    // Thêm domain của bạn nếu có
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
    const { message, systemPrompt } = req.body;

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

    // Gọi OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Hoặc 'gpt-3.5-turbo' để tiết kiệm hơn
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'Bạn là một trợ lý AI chuyên về giải phẫu học và sinh học cơ thể người. Trả lời bằng tiếng Việt một cách dễ hiểu và chính xác.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Không nhận được phản hồi từ AI';

    return res.status(200).json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      response: 'Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.',
    });
  }
}

