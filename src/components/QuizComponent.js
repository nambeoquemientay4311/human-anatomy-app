// src/components/QuizComponent.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc
} from 'firebase/firestore';

// Sample quiz questions - In production, this should come from Firestore
const SAMPLE_QUIZZES = {
  "Hệ Thần kinh": [
    {
      question: "Bộ phận nào của não điều khiển trí nhớ và cảm xúc?",
      options: ["Thùy trán", "Hồi hải mã", "Tiểu não", "Thân não"],
      correctAnswer: 1,
      explanation: "Hồi hải mã (hippocampus) là bộ phận chính của não điều khiển trí nhớ và cảm xúc."
    },
    {
      question: "Tế bào thần kinh nào truyền tín hiệu từ não đến cơ?",
      options: ["Nơ-ron cảm giác", "Nơ-ron vận động", "Nơ-ron liên kết", "Tất cả đều đúng"],
      correctAnswer: 1,
      explanation: "Nơ-ron vận động (motor neuron) truyền tín hiệu từ não đến cơ để thực hiện các chuyển động."
    },
    {
      question: "Chất dẫn truyền thần kinh nào liên quan đến cảm giác vui vẻ?",
      options: ["Serotonin", "Dopamine", "Acetylcholine", "GABA"],
      correctAnswer: 1,
      explanation: "Dopamine là chất dẫn truyền thần kinh liên quan đến cảm giác vui vẻ, động lực và phần thưởng."
    }
  ],
  "Hệ Tuần hoàn": [
    {
      question: "Buồng nào của tim bơm máu đến phổi?",
      options: ["Tâm nhĩ trái", "Tâm thất phải", "Tâm nhĩ phải", "Tâm thất trái"],
      correctAnswer: 1,
      explanation: "Tâm thất phải bơm máu nghèo oxy đến phổi để trao đổi khí."
    },
    {
      question: "Mạch máu nào có thành mỏng nhất?",
      options: ["Động mạch", "Tĩnh mạch", "Mao mạch", "Tất cả đều như nhau"],
      correctAnswer: 2,
      explanation: "Mao mạch có thành mỏng nhất, chỉ một lớp tế bào, để trao đổi chất hiệu quả."
    }
  ]
};

function QuizComponent({ systemName }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizResults, setQuizResults] = useState([]);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [systemName]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      // Try to load from Firestore first
      const quizQuery = query(
        collection(db, 'quizzes'),
        where('systemName', '==', systemName)
      );
      const querySnapshot = await getDocs(quizQuery);

      if (!querySnapshot.empty) {
        const quizData = querySnapshot.docs[0].data();
        setQuestions(quizData.questions || []);
      } else {
        // Fallback to sample questions
        setQuestions(SAMPLE_QUIZZES[systemName] || []);
      }
    } catch (error) {
      console.error('Lỗi load quiz:', error);
      // Fallback to sample questions
      setQuestions(SAMPLE_QUIZZES[systemName] || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !questions || questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setQuizResults(prev => [
      ...prev,
      {
        question: currentQuestion.question,
        userAnswer: selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect,
        explanation: currentQuestion.explanation
      }
    ]);

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz finished
      setShowResult(true);
      setShowSummaryDialog(true);
      saveQuizResult();
    }
  };

  const saveQuizResult = async () => {
    const user = auth.currentUser;
    if (!user || !questions || questions.length === 0) return;

    try {
      const currentQuestion = questions[currentQuestionIndex];
      const finalScore = currentQuestion 
        ? score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0)
        : score;
      
      const quizResultRef = doc(db, 'quizResults', `${user.uid}_${systemName}_${Date.now()}`);
      await setDoc(quizResultRef, {
        userId: user.uid,
        systemName: systemName,
        score: finalScore,
        totalQuestions: questions.length,
        percentage: (finalScore / questions.length) * 100,
        completedAt: new Date(),
        results: quizResults
      });
    } catch (error) {
      console.error('Lỗi lưu kết quả quiz:', error);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setQuizResults([]);
    setShowSummaryDialog(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Đang tải quiz...</Typography>
      </Box>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Chưa có câu hỏi quiz cho hệ cơ quan này. Quiz sẽ được cập nhật sớm!
      </Alert>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Có lỗi xảy ra khi tải câu hỏi.
      </Alert>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
        Kiểm tra kiến thức - {systemName}
      </Typography>

      {!showResult && (
        <Paper elevation={2} sx={{ p: 3 }}>
          {/* Progress */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Câu hỏi {currentQuestionIndex + 1} / {questions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm: {score}/{currentQuestionIndex}
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
          </Box>

          {/* Question */}
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            {currentQuestion.question}
          </Typography>

          {/* Options */}
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={selectedAnswer}
              onChange={(e) => handleAnswerSelect(parseInt(e.target.value))}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={option}
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    border: selectedAnswer === index ? '2px solid' : '1px solid',
                    borderColor: selectedAnswer === index ? 'primary.main' : 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Submit Button */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              size="large"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Summary Dialog */}
      <Dialog open={showSummaryDialog} onClose={() => setShowSummaryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" align="center">
            Kết quả Quiz
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {questions && questions.length > 0 && (
              <>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {score + (selectedAnswer !== null && selectedAnswer === questions[currentQuestionIndex]?.correctAnswer ? 1 : 0)}/{questions.length}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Tỷ lệ đúng: {(((score + (selectedAnswer !== null && selectedAnswer === questions[currentQuestionIndex]?.correctAnswer ? 1 : 0)) / questions.length) * 100).toFixed(0)}%
                </Typography>
              </>
            )}
          </Box>

          {quizResults.map((result, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {result.isCorrect ? (
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  ) : (
                    <CancelIcon color="error" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Câu {index + 1}
                  </Typography>
                  <Chip
                    label={result.isCorrect ? 'Đúng' : 'Sai'}
                    color={result.isCorrect ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {result.question}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {result.explanation}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestart} variant="contained" color="primary">
            Làm lại
          </Button>
          <Button onClick={() => setShowSummaryDialog(false)} variant="outlined">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default QuizComponent;

