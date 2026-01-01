// src/components/AIChatFab.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Fab, Modal, Box, IconButton, TextField, Paper, Typography, 
  CircularProgress, Avatar, Chip, Drawer, List, ListItem, 
  ListItemButton, ListItemText, Divider, useTheme 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import QuizIcon from '@mui/icons-material/Quiz';
import StyleIcon from '@mui/icons-material/Style'; // Flashcard icon
import MicIcon from '@mui/icons-material/Mic';
import DownloadIcon from '@mui/icons-material/Download';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, limit, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { VERCEL_API_URL, OPENAI_API_KEY, OPENAI_MODEL, GEMINI_API_KEY, GEMINI_MODEL } from '../config/api';

const fabStyle = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 1000,
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  height: '80vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  p: 0,
};

function AIChatFab() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // *** CẤU HÌNH GEMINI RAG ***
  // Dán File URI bạn đã upload lên Google AI Studio vào đây
  const GEMINI_FILE_URI = "https://generativelanguage.googleapis.com/v1beta/files/a42mgd9k2tjj"; // <-- DÁN URI BẠN VỪA COPY VÀO ĐÂY
  const GEMINI_FILE_MIME_TYPE = "application/pdf"; // Đổi nếu là file khác

  // System prompt cho AI - tập trung vào giải phẫu học
  const SYSTEM_PROMPT = `Bạn là một trợ lý AI chuyên về giải phẫu học và sinh học cơ thể người, đặc biệt bám sát chương trình Sinh học lớp 8.

QUY TẮC QUAN TRỌNG:
1. Ưu tiên tuyệt đối kiến thức trong tài liệu (Sách giáo khoa) được cung cấp.
2. Nếu câu hỏi nằm ngoài tài liệu, hãy trả lời dựa trên kiến thức chuẩn xác nhưng cần chú thích rõ là "Kiến thức mở rộng".
3. Trả lời ngắn gọn, súc tích, dễ hiểu cho học sinh.

Chủ đề chính:
- Hệ Thần kinh
- Hệ Tuần hoàn
- Hệ Hô hấp
- Hệ Tiêu hóa
- Hệ Bài tiết
- Hệ Nội tiết
- Hệ Sinh dục
- Hệ Vận động

Hãy dùng các gạch đầu dòng và **in đậm** các từ khóa quan trọng.`;

  useEffect(() => {
    if (open) {
      loadChatHistory();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    const user = auth.currentUser;
    if (!user) {
      // Không có user, chỉ hiển thị welcome message
      setMessages([{
        role: 'assistant',
        content: 'Xin chào! Tôi là trợ lý AI chuyên về giải phẫu học. Bạn có thể hỏi tôi bất kỳ điều gì về cơ thể người và các hệ cơ quan. Làm thế nào tôi có thể giúp bạn hôm nay?',
        timestamp: new Date()
      }]);
      return;
    }

    try {
      const q = query(
        collection(db, 'aiChatHistory'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const history = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Firestore trả về đối tượng Timestamp, chúng ta cần đổi nó thành JS Date
          if (data.timestamp && typeof data.timestamp.toDate === 'function') {
            data.timestamp = data.timestamp.toDate();
          }
          return { id: doc.id, ...data };
        }).reverse(); // Reverse để có thứ tự từ cũ đến mới
        setMessages(history);
      } else {
        // Welcome message nếu chưa có lịch sử
        setMessages([{
          role: 'assistant',
          content: 'Xin chào! Tôi là trợ lý AI chuyên về giải phẫu học. Bạn có thể hỏi tôi bất kỳ điều gì về cơ thể người và các hệ cơ quan. Làm thế nào tôi có thể giúp bạn hôm nay?',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Lỗi load chat history:', error);
      setMessages([{
        role: 'assistant',
        content: 'Xin chào! Tôi là trợ lý AI chuyên về giải phẫu học. Bạn có thể hỏi tôi bất kỳ điều gì về cơ thể người và các hệ cơ quan.',
        timestamp: new Date()
      }]);
    }
  };

  const saveMessage = async (role, content) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'aiChatHistory'), {
        userId: user.uid,
        role,
        content,
        timestamp: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Lỗi lưu tin nhắn:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Tạm thời thêm vào UI với ID tạm thời để có key
    const tempUserMessage = { ...userMessage, id: `temp-user-${Date.now()}` };
    setMessages(prev => [...prev, tempUserMessage]);
    setInput('');
    setLoading(true);
    
    const userMsgId = await saveMessage('user', userMessage.content);
    // Cập nhật lại tin nhắn của user với ID thật từ Firebase
    if (userMsgId) {
      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMessage.id ? { ...msg, id: userMsgId } : msg
      ));
    }

    try {
      // Gọi OpenAI API qua proxy hoặc backend
      // LƯU Ý: Bạn cần tạo một backend endpoint để gọi OpenAI API
      // Hoặc sử dụng Firebase Cloud Functions
      const response = await fetchChatResponse(userMessage.content);
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      const assistantMsgId = await saveMessage('assistant', assistantMessage.content);
      // Thêm tin nhắn của AI với ID thật
      const finalAssistantMessage = { ...assistantMessage, id: assistantMsgId };
      setMessages(prev => [...prev, finalAssistantMessage]);
    } catch (error) {
      console.error('Lỗi gọi AI:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatResponse = async (userMessage) => {
    // Ưu tiên 0: Sử dụng Gemini API với File (RAG) nếu đã cấu hình
    if (GEMINI_API_KEY && GEMINI_FILE_URI) {
      return await chatWithGeminiRAG(userMessage);
    }
    // Ưu tiên 1: Gọi Vercel API. Nếu có lỗi, nó sẽ được `handleSend` bắt và hiển thị trong UI.
    if (VERCEL_API_URL) {
      // Loại bỏ dấu / ở cuối VERCEL_API_URL nếu có để tránh thành //api/chat
      const baseUrl = VERCEL_API_URL.endsWith('/') ? VERCEL_API_URL.slice(0, -1) : VERCEL_API_URL;
      const response = await fetch(`${baseUrl}/api/chat`, {
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.response;
      } else {
        throw new Error(data.error || 'Unknown Vercel API error');
      }
    }

    // Ưu tiên 2: Gọi trực tiếp OpenAI API (chỉ để test local, không an toàn)
    if (OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userMessage },
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
        return data.choices[0]?.message?.content || 'Không nhận được phản hồi từ AI';
      } catch (openaiError) {
        console.error('OpenAI API error (direct call):', openaiError);
        // Nếu lỗi, sẽ tự động rơi xuống fallback cuối cùng
      }
    }

    // Fallback cuối cùng: Mock response nếu không có API nào được cấu hình hoặc tất cả đều lỗi
    console.warn('⚠️ API chưa được cấu hình hoặc đã xảy ra lỗi. Đang sử dụng mock response.');
    return mockAIResponse(userMessage);
  };

  // --- HÀM XỬ LÝ GEMINI API VỚI FILE (RAG) ---
  const chatWithGeminiRAG = async (userMessage) => {
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: userMessage },
            { 
              file_data: { 
                mime_type: GEMINI_FILE_MIME_TYPE, 
                file_uri: GEMINI_FILE_URI 
              } 
            }
          ]
        }
      ],
      systemInstruction: {
        parts: { text: SYSTEM_PROMPT }
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(errorData.error?.message || 'Lỗi kết nối với Gemini API.');
      }

      const data = await response.json();
      // Kiểm tra xem có response trả về không
      const text = data.candidates?.[0]?.content.parts[0]?.text;
      return text || "AI không đưa ra phản hồi. Vui lòng thử lại.";
    } catch (error) {
      console.error("Lỗi khi gọi Gemini RAG:", error);
      // Ném lỗi để khối try...catch trong handleSend có thể bắt được
      throw error;
    }
  };

  // Mock response - THAY THẾ BẰNG GỌI OPENAI THẬT
  const mockAIResponse = async (userMessage) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('thần kinh')) {
      return 'Hệ thần kinh là hệ thống điều khiển và điều phối các hoạt động của cơ thể. Nó bao gồm não, tủy sống và các dây thần kinh. Hệ thần kinh được chia thành hệ thần kinh trung ương (não và tủy sống) và hệ thần kinh ngoại biên (các dây thần kinh).';
    } else if (lowerMessage.includes('tuần hoàn') || lowerMessage.includes('tim')) {
      return 'Hệ tuần hoàn bao gồm tim, mạch máu và máu. Tim bơm máu đến tất cả các bộ phận của cơ thể thông qua động mạch, và máu trở về tim qua tĩnh mạch. Máu vận chuyển oxy, chất dinh dưỡng và các chất thải.';
    } else if (lowerMessage.includes('hô hấp') || lowerMessage.includes('phổi')) {
      return 'Hệ hô hấp bao gồm mũi, khí quản, phế quản và phổi. Nó có chức năng trao đổi khí - lấy oxy vào cơ thể và thải carbon dioxide ra ngoài. Phổi là cơ quan chính thực hiện quá trình này.';
    } else if (lowerMessage.includes('tiêu hóa')) {
      return 'Hệ tiêu hóa bao gồm miệng, thực quản, dạ dày, ruột non, ruột già và các cơ quan phụ như gan, tụy. Nó có chức năng tiêu hóa thức ăn, hấp thu chất dinh dưỡng và thải chất thải.';
    } else {
      return `Cảm ơn bạn đã hỏi về "${userMessage}". Đây là một câu hỏi thú vị về giải phẫu học. Để tôi có thể trả lời chính xác hơn, bạn có thể mô tả cụ thể hơn về hệ cơ quan nào bạn muốn tìm hiểu không?`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleHistoryClick = (messageId) => {
    // Logic để scroll đến tin nhắn (nếu cần) hoặc load lại session cũ
    // Hiện tại danh sách messages là flat list, nên ta có thể highlight hoặc scroll
  };

  // --- CÁC TÍNH NĂNG MỚI ---

  // 1. Xóa một tin nhắn
  const handleDeleteMessage = async (messageId) => {
    if (!messageId || messageId.startsWith('temp-')) return;
    try {
      await deleteDoc(doc(db, 'aiChatHistory', messageId));
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Lỗi xóa tin nhắn:", error);
    }
  };

  // 2. Xóa toàn bộ lịch sử chat
  const handleClearChat = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat không? Hành động này không thể hoàn tác.")) return;
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const q = query(collection(db, 'aiChatHistory'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      setMessages([{
        role: 'assistant',
        content: 'Lịch sử chat đã được xóa. Tôi có thể giúp gì cho bạn?',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Lỗi xóa lịch sử chat:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Text-to-Speech (Đọc tin nhắn)
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN'; // Đảm bảo đọc tiếng Việt
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt của bạn không hỗ trợ tính năng đọc văn bản.");
    }
  };

  // 4. Tạo Quiz hoặc Flashcard nhanh
  const handleQuickAction = (type) => {
    const prompts = {
      quiz: "Tạo 5 câu hỏi trắc nghiệm về [TÊN HỆ CƠ QUAN] với 4 đáp án và giải thích đáp án đúng.",
      flashcard: "Tạo 5 flashcard về [TÊN HỆ CƠ QUAN] theo định dạng: 'Thuật ngữ: ... - Định nghĩa: ...'"
    };
    setInput(prompts[type]);
  };

  // 5. Nhập liệu bằng giọng nói (Voice Input)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN'; // Thiết lập tiếng Việt
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => setIsListening(false);
    
    recognition.onerror = (event) => {
      console.error("Lỗi nhận diện giọng nói:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      // Thêm nội dung nói vào ô nhập liệu hiện tại
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  // 6. Xuất lịch sử chat (Export)
  const handleExportChat = () => {
    if (messages.length === 0) return;
    const content = messages.map(m => `[${m.role.toUpperCase()} - ${new Date(m.timestamp).toLocaleString('vi-VN')}]\n${m.content}\n`).join('\n-------------------\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* FAB Button */}
      <Fab 
        color="primary" 
        sx={fabStyle} 
        onClick={handleOpen}
        aria-label="AI Chat"
      >
        <SmartToyIcon />
      </Fab>

      {/* Chat Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="ai-chat-modal"
      >
        <Box sx={modalStyle}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '16px 16px 0 0'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={toggleSidebar} sx={{ color: 'white' }}>
                <MenuIcon />
              </IconButton>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <SmartToyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  AI Trợ lý Giải phẫu học
                </Typography>
                <Typography variant="caption">
                  Hỏi tôi bất kỳ điều gì về cơ thể người
                </Typography>
              </Box>
            </Box>
            <Box>
              <IconButton onClick={handleExportChat} sx={{ color: 'white' }} title="Tải xuống lịch sử chat">
                <DownloadIcon />
              </IconButton>
              <IconButton onClick={handleClearChat} sx={{ color: 'white' }} title="Xóa toàn bộ cuộc trò chuyện">
                <DeleteSweepIcon />
              </IconButton>
              <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Main Content Area (Flex Row) */}
          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            
            {/* Sidebar (History) */}
            <Box 
              sx={{ 
                width: sidebarOpen ? 240 : 0, 
                transition: 'width 0.3s', 
                borderRight: 1, 
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight="bold">Lịch sử trò chuyện</Typography>
              </Box>
              <List sx={{ overflowY: 'auto', flexGrow: 1 }}>
                {messages.filter(m => m.role === 'user').map((msg) => (
                  <ListItem key={msg.id} disablePadding>
                    <ListItemButton onClick={() => handleHistoryClick(msg.id)}>
                      <ListItemText 
                        primary={msg.content} 
                        primaryTypographyProps={{ noWrap: true, fontSize: '0.9rem' }}
                        secondary={new Date(msg.timestamp).toLocaleDateString('vi-VN')}
                        secondaryTypographyProps={{ fontSize: '0.7rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Chat Area (Messages + Input) */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box
            ref={chatContainerRef}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={msg.id || index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <SmartToyIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '75%',
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    position: 'relative',
                    '&:hover .message-actions': {
                      opacity: 1,
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Typography>
                  <Box 
                    className="message-actions"
                    sx={{ 
                      position: 'absolute', 
                      top: -12, 
                      right: msg.role === 'user' ? 'auto' : -12,
                      left: msg.role === 'user' ? -12 : 'auto',
                      display: 'flex',
                      gap: 0.5,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      bgcolor: 'background.paper',
                      borderRadius: '50px',
                      boxShadow: 1,
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <IconButton size="small" onClick={() => handleSpeak(msg.content)} title={isSpeaking ? "Dừng đọc" : "Đọc to"}>
                        <VolumeUpIcon fontSize="inherit" color={isSpeaking ? "secondary" : "action"} />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleDeleteMessage(msg.id)} title="Xóa tin nhắn">
                      <DeleteIcon fontSize="inherit" color="error" />
                    </IconButton>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.7rem'
                    }}
                  >
                    {msg.timestamp?.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Paper>
                {msg.role === 'user' && (
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    <PersonIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )}
              </Box>
            ))}
            
            {loading && (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <SmartToyIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Paper elevation={1} sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                  <CircularProgress size={16} />
                </Paper>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Actions */}
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
             <Chip 
              icon={<QuizIcon />} 
              label="Tạo Quiz" 
              onClick={() => handleQuickAction('quiz')}
              size="small"
              color="primary"
              variant="outlined"
              clickable
            />
            <Chip 
              icon={<StyleIcon />} 
              label="Tạo Flashcard" 
              onClick={() => handleQuickAction('flashcard')}
              size="small"
              color="secondary"
              variant="outlined"
              clickable
            />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              borderRadius: '0 0 16px 16px'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                variant="outlined"
                size="small"
              />
              <IconButton
                color={isListening ? "secondary" : "default"}
                onClick={handleVoiceInput}
                sx={{ bgcolor: isListening ? 'secondary.light' : 'grey.100', '&:hover': { bgcolor: isListening ? 'secondary.main' : 'grey.200' } }}
                title="Nhập bằng giọng nói"
              >
                <MicIcon color={isListening ? "error" : "inherit"} />
              </IconButton>
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
            </Box> {/* End Chat Area */}
          </Box> {/* End Main Content Area */}
        </Box>
      </Modal>
    </>
  );
}

export default AIChatFab;
