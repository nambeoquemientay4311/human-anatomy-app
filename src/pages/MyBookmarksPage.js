// src/pages/MyBookmarksPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';

import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Box,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function MyBookmarksPage({ user }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadBookmarks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const bookmarksList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookmarks(bookmarksList);
    } catch (error) {
      console.error('Lỗi load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookmarkId) => {
    if (!window.confirm('Bạn có chắc chắn muốn bỏ đánh dấu này?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'bookmarks', bookmarkId));
      loadBookmarks();
    } catch (error) {
      console.error('Lỗi xóa bookmark:', error);
      alert('Có lỗi xảy ra khi xóa bookmark.');
    }
  };

  const handleSystemClick = (systemName) => {
    // Navigate to home and let user click on the system manually
    // In future, we can use URL state or context to auto-select
    navigate('/');
  };

  if (!user) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          Vui lòng đăng nhập để xem các hệ cơ quan đã đánh dấu của bạn.
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
    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Hệ cơ quan đã đánh dấu
      </Typography>

      {bookmarks.length === 0 ? (
        <Alert severity="info">
          Bạn chưa đánh dấu hệ cơ quan nào. Hãy quay lại trang chủ và đánh dấu những hệ cơ quan bạn muốn học!
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {bookmarks.map((bookmark) => (
            <Grid item xs={12} sm={6} md={4} key={bookmark.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BookmarkIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {bookmark.systemName}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Đánh dấu: {bookmark.createdAt
                      ? new Date(bookmark.createdAt.seconds * 1000).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleSystemClick(bookmark.systemName)}
                  >
                    Xem chi tiết
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(bookmark.id)}
                    title="Bỏ đánh dấu"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}

export default MyBookmarksPage;

