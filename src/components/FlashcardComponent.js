// src/components/FlashcardComponent.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import FlipIcon from '@mui/icons-material/FlipCameraAndroid';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Sample flashcards - In production, this should come from Firestore
const SAMPLE_FLASHCARDS = {
  "Hệ Thần kinh": [
    {
      term: "Neuron",
      definition: "Tế bào thần kinh, đơn vị cơ bản của hệ thần kinh, có chức năng truyền tín hiệu điện và hóa học."
    },
    {
      term: "Synapse",
      definition: "Khớp thần kinh - nơi hai neuron gặp nhau để truyền tín hiệu."
    },
    {
      term: "Dopamine",
      definition: "Chất dẫn truyền thần kinh liên quan đến cảm giác vui vẻ, động lực và hệ thống phần thưởng."
    },
    {
      term: "Cerebrum",
      definition: "Đại não - phần lớn nhất của não, điều khiển tư duy, cảm xúc và vận động tự ý."
    }
  ],
  "Hệ Tuần hoàn": [
    {
      term: "Tim",
      definition: "Cơ quan bơm máu đến toàn bộ cơ thể, có 4 buồng: 2 tâm nhĩ và 2 tâm thất."
    },
    {
      term: "Động mạch",
      definition: "Mạch máu dẫn máu từ tim đến các cơ quan, có thành dày và đàn hồi."
    },
    {
      term: "Tĩnh mạch",
      definition: "Mạch máu dẫn máu từ các cơ quan về tim, có van để ngăn máu chảy ngược."
    },
    {
      term: "Mao mạch",
      definition: "Mạch máu nhỏ nhất, nơi diễn ra trao đổi chất giữa máu và tế bào."
    }
  ],
  "Hệ Tiêu hóa": [
    {
      term: "Dạ dày",
      definition: "Cơ quan tiêu hóa chứa axit và enzyme để phân hủy thức ăn."
    },
    {
      term: "Ruột non",
      definition: "Nơi hấp thụ chất dinh dưỡng từ thức ăn đã được tiêu hóa."
    },
    {
      term: "Enzyme",
      definition: "Protein xúc tác các phản ứng phân hủy thức ăn thành các chất đơn giản hơn."
    }
  ]
};

function FlashcardComponent({ systemName }) {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState('all'); // 'all', 'random', 'difficult'

  useEffect(() => {
    loadFlashcards();
  }, [systemName]);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      // Try to load from Firestore first
      const flashcardQuery = query(
        collection(db, 'flashcards'),
        where('systemName', '==', systemName)
      );
      const querySnapshot = await getDocs(flashcardQuery);

      if (!querySnapshot.empty) {
        const flashcardData = querySnapshot.docs[0].data();
        let loadedCards = flashcardData.cards || [];
        
        if (studyMode === 'random') {
          loadedCards = [...loadedCards].sort(() => Math.random() - 0.5);
        }
        
        setFlashcards(loadedCards);
      } else {
        // Fallback to sample flashcards
        let sampleCards = SAMPLE_FLASHCARDS[systemName] || [];
        if (studyMode === 'random') {
          sampleCards = [...sampleCards].sort(() => Math.random() - 0.5);
        }
        setFlashcards(sampleCards);
      }
    } catch (error) {
      console.error('Lỗi load flashcards:', error);
      // Fallback to sample flashcards
      setFlashcards(SAMPLE_FLASHCARDS[systemName] || []);
    } finally {
      setLoading(false);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    if (studyMode === 'random') {
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      setFlashcards(shuffled);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Chưa có flashcard cho hệ cơ quan này. Flashcard sẽ được cập nhật sớm!
      </Alert>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          Flashcard - {systemName}
        </Typography>
        <Chip 
          label={`${currentIndex + 1}/${flashcards.length}`} 
          color="primary" 
          variant="outlined" 
        />
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
          <Box
            sx={{
              width: `${progress}%`,
              bgcolor: 'primary.main',
              height: 8,
              borderRadius: 1,
              transition: 'width 0.3s ease'
            }}
          />
        </Box>
      </Box>

      {/* Flashcard */}
      <Paper
        elevation={3}
        sx={{
          perspective: '1000px',
          height: { xs: '300px', md: '400px' },
          mb: 2
        }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d'
          }}
        >
          <Card
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backfaceVisibility: 'hidden',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              position: isFlipped ? 'absolute' : 'relative',
              cursor: 'pointer'
            }}
            onClick={handleFlip}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {isFlipped ? 'Định nghĩa' : 'Thuật ngữ'}
              </Typography>
              <Typography 
                variant={isFlipped ? "body1" : "h6"} 
                align="center" 
                sx={{ mt: 3, px: 2 }}
              >
                {isFlipped ? currentCard.definition : currentCard.term}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Nhấn để lật
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Paper>

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          color="primary"
          size="large"
        >
          <ArrowBackIosIcon />
        </IconButton>

        <Button
          variant="outlined"
          startIcon={<FlipIcon />}
          onClick={handleFlip}
          size="large"
        >
          Lật thẻ
        </Button>

        <IconButton
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          color="primary"
          size="large"
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* Restart Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="text"
          onClick={handleRestart}
          size="small"
        >
          Bắt đầu lại
        </Button>
      </Box>
    </Box>
  );
}

export default FlashcardComponent;

