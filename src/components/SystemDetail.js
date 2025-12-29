// src/components/SystemDetail.js
import React, { useState, useEffect, useRef } from 'react';
import DynamicModelViewer from './DynamicModelViewer'; 

// Import Firebase
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase'; 

// Import MUI
import { 
  Typography, Box, Grid, List, ListItem, ListItemIcon, 
  ListItemText, Divider, Paper, Tabs, Tab, Button, CircularProgress, Alert
} from '@mui/material';

// Import Icons
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import Components
import BookmarkButton from './BookmarkButton';
import NotesSection from './NotesSection';
import QuizComponent from './QuizComponent';
import FlashcardComponent from './FlashcardComponent';

// ===================================================================
// === 1. COMPONENT CON: GIAO DIỆN NỘI DUNG (Stateless) ===
// ===================================================================
function SystemContentLayout({ systemData, isPlaying, onToggleAudio, systemName }) { 
  
  const fullTextToSpeak = `
    ${systemData.name || systemData.tabName}.
    ${systemData.description || ""}.
    ${systemData.structure || ""}.
  `;

  return (
    <Grid container spacing={3}>
      {/* CỘT 1: MODEL 3D */}
      <Grid item xs={12} md={7} sx={{ height: { xs: '350px', md: 'calc(100vh - 200px)' }, minHeight: '400px' }}>
        <Paper elevation={4} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 2, bgcolor: '#f5f5f5' }}>
          <DynamicModelViewer modelUrl={systemData.modelURL || systemData.modelUrl || "/models/human_body.glb"} />
        </Paper>
      </Grid>

      {/* CỘT 2: THÔNG TIN */}
      <Grid item xs={12} md={5} sx={{ height: { xs: 'auto', md: 'calc(100vh - 200px)' }, overflowY: 'auto' }}>
        <Paper elevation={0} sx={{ p: 1, backgroundColor: 'transparent' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 0, flexGrow: 1, color: '#00796b', fontWeight: 'bold' }}>
              {systemData.name || systemData.tabName}
            </Typography>
            
            {/* Nút Bookmark */}
            {systemName && <BookmarkButton systemName={systemName} />}
            
            {/* Nút Nghe/Dừng */}
            <Button 
              variant={isPlaying ? "contained" : "outlined"} 
              color={isPlaying ? "error" : "primary"}
              startIcon={isPlaying ? <StopIcon /> : <VolumeUpIcon />}
              onClick={() => onToggleAudio(fullTextToSpeak, systemData.audioUrl)}
              sx={{ ml: 1 }}
            >
              {isPlaying ? "Dừng" : "Nghe"}
            </Button>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <ContentSection title="Mô tả chung" content={systemData.description} />
          <ContentSection title="Cấu tạo" content={systemData.structure} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>Bệnh liên quan</Typography>
            {systemData.diseases && Array.isArray(systemData.diseases) ? (
                <List dense>
                {systemData.diseases.map((disease, index) => (
                    <ListItem key={index} sx={{p: 0}}>
                    <ListItemIcon sx={{minWidth: 32}}><WarningAmberOutlinedIcon color="error" fontSize="small" /></ListItemIcon>
                    <ListItemText primary={disease.name || disease} />
                    </ListItem>
                ))}
                </List>
            ) : <Typography>Đang cập nhật...</Typography>}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>Thông tin thú vị</Typography>
            {systemData.funFacts && Array.isArray(systemData.funFacts) ? (
                <List dense>
                {systemData.funFacts.map((fact, index) => (
                    <ListItem key={index} sx={{p: 0}}>
                    <ListItemIcon sx={{minWidth: 32}}><InfoOutlinedIcon color="info" fontSize="small" /></ListItemIcon>
                    <ListItemText primary={fact} />
                    </ListItem>
                ))}
                </List>
            ) : <Typography>Đang cập nhật...</Typography>}
          </Box>

          {/* Ghi chú cá nhân */}
          {systemName && <NotesSection systemName={systemName} />}

          {/* Quiz Component */}
          {systemName && <QuizComponent systemName={systemName} />}

          {/* Flashcard Component */}
          {systemName && <FlashcardComponent systemName={systemName} />}
        </Paper>
      </Grid>
    </Grid>
  );
}

function ContentSection({ title, content }) {
    if (!content) return null;
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>{title}</Typography>
            <Typography variant="body1" sx={{ textAlign: 'justify' }}>{content}</Typography>
        </Box>
    )
}

// ===================================================================
// === 2. COMPONENT CHA: SYSTEM DETAIL (Đã Fix lỗi ngắt âm thanh) ===
// ===================================================================
const SystemDetail = React.forwardRef(({ system, onBack }, ref) => { 
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState(null);       
  const [loading, setLoading] = useState(true);

  // --- QUẢN LÝ ÂM THANH ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [googleVoice, setGoogleVoice] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const foundVoice = voices.find(v => v.name === 'Google Tiếng Việt' || v.lang === 'vi-VN');
      if (foundVoice) setGoogleVoice(foundVoice);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    // Chỉ tắt âm thanh khi thoát hẳn khỏi trang chi tiết (nút Back)
    return () => { 
      stopAllAudio();
      window.speechSynthesis.onvoiceschanged = null; 
    };
  }, []);

  const stopAllAudio = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  // --- SỬA LỖI TẠI ĐÂY: KHÔNG STOP AUDIO KHI CHUYỂN TAB ---
  const handleTabChange = (event, newValue) => {
    // Nếu đang đọc bằng giọng máy (Google Voice) thì nên dừng vì nội dung chữ thay đổi
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
    
    // CÒN NẾU ĐANG PHÁT FILE MP3 (Audio Chung) THÌ KỆ NÓ, CHO PHÁT TIẾP
    
    setTabValue(newValue);
  };

  const handleToggleAudio = (textToRead, specificAudioUrl) => {
    // Nếu đang phát thì bấm lần nữa là Dừng
    if (isPlaying) {
      stopAllAudio();
      return;
    }

    setIsPlaying(true);

    // Tìm file audio: Ưu tiên riêng -> Chung -> Giọng máy
    const finalAudioUrl = specificAudioUrl || (data ? data.audioUrl : null);

    if (finalAudioUrl) {
      if (audioRef.current) {
        // Nếu file đang pause (do chưa chạy hết), cho chạy tiếp hoặc chạy lại
        // Ở đây mình set src mới để đảm bảo đúng file
        if (audioRef.current.src !== window.location.origin + finalAudioUrl && 
            audioRef.current.src !== finalAudioUrl) {
           audioRef.current.src = finalAudioUrl;
        }
        
        audioRef.current.play().catch(e => {
            console.error("Lỗi phát audio:", e);
            setIsPlaying(false);
        });
        audioRef.current.onended = () => setIsPlaying(false);
      }
    } else {
      // Giọng máy
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'vi-VN';
      if (googleVoice) utterance.voice = googleVoice;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Tải dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const collectionRef = collection(db, "organSystems");
        const q = query(collectionRef, where("name", "==", system));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setData(querySnapshot.docs[0].data());
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    if (system) fetchData();
  }, [system]);

  // Track progress khi user xem hệ cơ quan
  useEffect(() => {
    const trackView = async () => {
      const user = auth.currentUser;
      if (!user || !system) return;

      try {
        const { setDoc, doc } = await import('firebase/firestore');
        const progressDocRef = doc(db, 'userProgress', user.uid);
        const { getDoc } = await import('firebase/firestore');
        const progressDocSnap = await getDoc(progressDocRef);
        
        const currentProgress = progressDocSnap.exists() ? progressDocSnap.data() : {};
        const systemProgress = currentProgress[system] || {};
        
        await setDoc(progressDocRef, {
          ...currentProgress,
          [system]: {
            ...systemProgress,
            viewed: true,
            lastViewed: new Date()
          }
        }, { merge: true });
      } catch (error) {
        console.error('Lỗi track progress:', error);
      }
    };

    trackView();
  }, [system]);

  if (loading) {
      return (
        <Paper ref={ref} elevation={3} sx={{ height: '100%', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Đang tải dữ liệu...</Typography>
        </Paper>
      )
  }

  if (!data) {
      return (
        <Paper ref={ref} elevation={3} sx={{ p: 4, height: '100%', minHeight: '600px' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>Quay lại</Button>
            <Alert severity="warning">Không tìm thấy dữ liệu cho hệ: <strong>{system}</strong></Alert>
        </Paper>
      );
  }

  // Element Audio chung cho toàn bộ SystemDetail
  const AudioElement = <audio ref={audioRef} style={{ display: 'none' }} />;

  // TRƯỜNG HỢP 1: Không chia Tab
  if (!data.isSplit) {
    return (
      <Paper ref={ref} elevation={3} sx={{ height: '100%', minHeight: '600px', overflowY: 'auto' }}>
        {AudioElement}
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ m: 1, position: 'sticky', top: 0, left: 0, zIndex: 10, bgcolor: 'background.paper' }}>
          Quay lại
        </Button>
        <Box sx={{ p: { xs: 1, md: 3 } }}>
           <SystemContentLayout 
             systemData={data} 
             isPlaying={isPlaying} 
             onToggleAudio={handleToggleAudio}
             systemName={system}
           />
        </Box>
      </Paper>
    );
  }

  // TRƯỜNG HỢP 2: Chia Tab (Nam/Nữ)
  const subSystems = Object.values(data).filter(
    (value) => typeof value === 'object' && value !== null && value.tabName
  );

  return (
    <Paper ref={ref} elevation={3} sx={{ width: '100%', height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
      {AudioElement} {/* Loa nằm ở Cha nên không bị hủy khi chuyển tab con */}
      
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ m: 1, alignSelf: 'flex-start' }}>
        Quay lại
      </Button>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          {subSystems.map((sub, index) => (
            <Tab label={sub.tabName} key={index} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 1, md: 3 } }}>
        {subSystems.map((sub, index) => (
          <Box role="tabpanel" hidden={tabValue !== index} key={index} sx={{ height: '100%' }}>
            {tabValue === index && ( 
              <SystemContentLayout 
                 systemData={sub} 
                 isPlaying={isPlaying} 
                 onToggleAudio={handleToggleAudio}
                 systemName={system}
              />
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
});

export default SystemDetail;