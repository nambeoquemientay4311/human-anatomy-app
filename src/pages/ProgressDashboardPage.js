// src/pages/ProgressDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ALL_SYSTEMS = [
  "Hệ Thần kinh",
  "Hệ Tuần hoàn",
  "Hệ Nội tiết",
  "Hệ Sinh dục",
  "Hệ Bài tiết",
  "Hệ Hô hấp",
  "Hệ Tiêu hóa",
  "Hệ Vận động"
];

function ProgressDashboardPage({ user }) {
  const [progress, setProgress] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load bookmarks
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid)
      );
      const bookmarksSnapshot = await getDocs(bookmarksQuery);
      const bookmarksList = bookmarksSnapshot.docs.map(doc => doc.data().systemName);
      setBookmarks(bookmarksList);

      // Load notes count
      const notesQuery = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid)
      );
      const notesSnapshot = await getDocs(notesQuery);
      const notesList = notesSnapshot.docs.map(doc => doc.data().systemName);
      setNotes(notesList);

      // Load viewing history (if exists)
      const progressDocRef = doc(db, 'userProgress', user.uid);
      const progressDocSnap = await getDoc(progressDocRef);
      
      if (progressDocSnap.exists()) {
        setProgress(progressDocSnap.data());
      } else {
        // Initialize progress
        const initialProgress = {};
        ALL_SYSTEMS.forEach(system => {
          initialProgress[system] = {
            viewed: false,
            bookmarked: false,
            hasNotes: false,
            lastViewed: null
          };
        });
        setProgress(initialProgress);
      }
    } catch (error) {
      console.error('Lỗi load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update progress when bookmarks/notes change
  useEffect(() => {
    if (user && Object.keys(progress).length > 0) {
      const updatedProgress = { ...progress };
      ALL_SYSTEMS.forEach(system => {
        updatedProgress[system] = {
          ...updatedProgress[system],
          bookmarked: bookmarks.includes(system),
          hasNotes: notes.filter(n => n === system).length > 0
        };
      });
      setProgress(updatedProgress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks, notes, user]);

  const updateSystemView = async (systemName) => {
    if (!user) return;

    try {
      const progressDocRef = doc(db, 'userProgress', user.uid);
      const currentProgress = progress[systemName] || {};
      
      await setDoc(progressDocRef, {
        ...progress,
        [systemName]: {
          ...currentProgress,
          viewed: true,
          lastViewed: new Date()
        }
      }, { merge: true });

      // Update local state
      setProgress(prev => ({
        ...prev,
        [systemName]: {
          ...prev[systemName],
          viewed: true,
          lastViewed: new Date()
        }
      }));
    } catch (error) {
      console.error('Lỗi update progress:', error);
    }
  };

  // Calculate statistics
  const viewedCount = Object.values(progress || {}).filter(p => p && p.viewed).length;
  const bookmarkedCount = bookmarks ? bookmarks.length : 0;
  const notesCount = notes ? notes.length : 0;
  const completionPercentage = ALL_SYSTEMS.length > 0 ? (viewedCount / ALL_SYSTEMS.length) * 100 : 0;

  if (!user) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          Vui lòng đăng nhập để xem tiến độ học tập của bạn.
        </Alert>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          Dashboard Tiến độ Học tập
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Đã xem</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {viewedCount}/{ALL_SYSTEMS.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hệ cơ quan
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Hoàn thành</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {completionPercentage.toFixed(0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={completionPercentage} 
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTimeIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Đánh dấu</Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {bookmarkedCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bookmark
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Ghi chú</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {notesCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ghi chú đã tạo
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Progress by System */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Tiến độ từng hệ cơ quan
        </Typography>
        <Grid container spacing={2}>
          {ALL_SYSTEMS.map((system) => {
            const systemProgress = progress[system] || {};
            const isViewed = systemProgress.viewed || false;
            const isBookmarked = bookmarks.includes(system);
            const hasNotes = notes.filter(n => n === system).length > 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={system}>
                <Card 
                  elevation={isViewed ? 2 : 1}
                  sx={{
                    height: '100%',
                    border: isViewed ? '2px solid' : '1px solid',
                    borderColor: isViewed ? 'primary.main' : 'divider',
                    opacity: isViewed ? 1 : 0.7
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {system}
                      </Typography>
                      {isViewed && (
                        <Chip 
                          icon={<CheckCircleIcon />} 
                          label="Đã xem" 
                          color="primary" 
                          size="small" 
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {isBookmarked && (
                        <Chip label="Đã đánh dấu" size="small" color="warning" />
                      )}
                      {hasNotes && (
                        <Chip label="Có ghi chú" size="small" color="info" />
                      )}
                    </Box>

                    {!isViewed && (
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => {
                          navigate('/');
                          // Note: In a real app, you'd trigger system selection here
                        }}
                      >
                        Bắt đầu học
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
}

export default ProgressDashboardPage;

