/**
 * Vercel Serverless Function - Chat API using Google Gemini
 * File này để deploy lên Vercel dạng serverless function
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    // Handling OPTIONS for preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*'); // Hoặc domain của bạn
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS handling for POST
  // Note: Vercel's vercel.json is a better place for these headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Hoặc domain của bạn
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { message, systemPrompt, model, temperature, maxTokens } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Lấy API key từ environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key not configured',
        message: 'Vui lòng cấu hình GEMINI_API_KEY trong Vercel environment variables'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

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
    
    const fullPrompt = (systemPrompt || defaultSystemPrompt) + "\n\n" + message;

    // For text-only input, use the gemini-pro model
    const geminiModel = genAI.getGenerativeModel({
        model: model || "gemini-pro",
        generationConfig: {
            temperature: temperature || 0.7,
            maxOutputTokens: maxTokens || 1000,
        }
    });

    const result = await geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    return res.status(200).json({
      success: true,
      response: aiResponse,
      model: model || "gemini-pro" // Return the model name used
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      response: 'Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.'
    });
  }
}