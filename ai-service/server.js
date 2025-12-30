/**
 * AI Service - Standalone API Server
 * Service API riêng cho Human Anatomy App
 * 
 * Có thể chạy độc lập hoặc deploy lên Vercel/Railway/Render
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://human-anatomy-app-4483b.web.app',
    'https://human-anatomy-app-4483b.firebaseapp.com'
  ],
  credentials: true
}));

app.use(express.json());

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    service: 'AI Service - Human Anatomy App',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      chat: 'POST /api/chat',
      chatInfo: 'GET /api/chat'
    },
    usage: {
      chat: {
        method: 'POST',
        url: '/api/chat',
        body: {
          message: 'string (required)',
          systemPrompt: 'string (optional)',
          model: 'string (optional)',
          temperature: 'number (optional)',
          maxTokens: 'number (optional)'
        }
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ai-service',
    timestamp: new Date().toISOString()
  });
});

// API info endpoint (GET /api/chat)
app.get('/api/chat', (req, res) => {
  res.json({
    message: 'AI Chat API Endpoint',
    method: 'POST',
    description: 'Gửi POST request đến endpoint này để chat với AI',
    example: {
      method: 'POST',
      url: '/api/chat',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        message: 'Giải thích về hệ thần kinh',
        systemPrompt: 'Bạn là trợ lý AI... (optional)',
        model: 'gpt-4o-mini (optional)',
        temperature: 0.7,
        maxTokens: 1000
      }
    },
    response: {
      success: true,
      response: 'AI response text',
      model: 'gpt-4o-mini',
      usage: {
        prompt_tokens: 50,
        completion_tokens: 100,
        total_tokens: 150
      }
    }
  });
});

// Redirect /chat to /api/chat info
app.get('/chat', (req, res) => {
  res.redirect('/api/chat');
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, systemPrompt, model, temperature, maxTokens } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured',
        message: 'Vui lòng cấu hình OPENAI_API_KEY trong environment variables'
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Default system prompt (focused on human anatomy)
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

    // Create chat completion
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

    res.json({
      success: true,
      response: aiResponse,
      model: completion.model,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    
    // Handle OpenAI API errors
    if (error.response) {
      return res.status(error.response.status || 500).json({
        success: false,
        error: error.response.data?.error?.message || 'OpenAI API error',
        response: 'Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      response: 'Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.'
    });
  }
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🤖 AI Service đang chạy tại http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  });
}

// Export for Vercel/serverless
module.exports = app;

