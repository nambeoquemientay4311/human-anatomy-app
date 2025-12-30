/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");

// Set global options for v2 functions
setGlobalOptions({
  maxInstances: 10,
});

// OpenAI API Cloud Function
// LƯU Ý: Bạn cần cài đặt OpenAI package: npm install openai --save trong thư mục functions
exports.chatWithOpenAI = onCall(
  {
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    try {
      const {message, systemPrompt} = request.data;

      if (!message) {
        throw new Error("Message is required");
      }

      // Kiểm tra xem đã cài đặt OpenAI chưa
      let OpenAI;
      try {
        OpenAI = require("openai");
      } catch (error) {
        logger.warn("OpenAI package not installed. Run: npm install openai in functions folder");
        // Trả về mock response nếu chưa cài OpenAI
        return {
          success: true,
          response: `Tính năng AI đang được cấu hình. Vui lòng cài đặt OpenAI package và thêm API key để sử dụng tính năng này.`,
        };
      }

      // Lấy API key từ environment variables
      const apiKey = process.env.OPENAI_API_KEY || request.data.apiKey;
      
      if (!apiKey) {
        logger.warn("OpenAI API key not found. Please set OPENAI_API_KEY in Firebase Functions config");
        return {
          success: false,
          response: "OpenAI API key chưa được cấu hình. Vui lòng thêm API key vào Firebase Functions configuration.",
        };
      }

      const openai = new OpenAI({
        apiKey: apiKey,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Hoặc "gpt-3.5-turbo" để tiết kiệm chi phí hơn
        messages: [
          {
            role: "system",
            content: systemPrompt || "Bạn là một trợ lý AI chuyên về giải phẫu học và sinh học cơ thể người. Trả lời bằng tiếng Việt một cách dễ hiểu và chính xác.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        success: true,
        response: completion.choices[0].message.content,
      };
    } catch (error) {
      logger.error("Error in chatWithOpenAI:", error);
      throw new Error(`Error: ${error.message}`);
    }
  }
);
