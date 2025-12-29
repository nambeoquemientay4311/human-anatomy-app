// src/components/BookmarkButton.js
import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { auth, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

function BookmarkButton({ systemName }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kiểm tra bookmark khi component mount hoặc systemName thay đổi
  useEffect(() => {
    const checkBookmark = async () => {
      const user = auth.currentUser;
      if (!user || !systemName) {
        setIsBookmarked(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'bookmarks'),
          where('userId', '==', user.uid),
          where('systemName', '==', systemName)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setIsBookmarked(true);
          setBookmarkId(querySnapshot.docs[0].id);
        } else {
          setIsBookmarked(false);
          setBookmarkId(null);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra bookmark:', error);
      }
    };

    checkBookmark();
  }, [systemName]);

  const handleToggleBookmark = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng tính năng bookmark');
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked && bookmarkId) {
        // Xóa bookmark
        await deleteDoc(doc(db, 'bookmarks', bookmarkId));
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        // Thêm bookmark
        const docRef = await addDoc(collection(db, 'bookmarks'), {
          userId: user.uid,
          systemName: systemName,
          createdAt: new Date()
        });
        setIsBookmarked(true);
        setBookmarkId(docRef.id);
      }
    } catch (error) {
      console.error('Lỗi toggle bookmark:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!auth.currentUser) return null;

  return (
    <Tooltip title={isBookmarked ? "Bỏ đánh dấu" : "Đánh dấu"}>
      <IconButton
        onClick={handleToggleBookmark}
        disabled={loading}
        color={isBookmarked ? "primary" : "default"}
        sx={{ 
          color: isBookmarked ? '#1976d2' : 'inherit',
          '&:hover': { 
            color: isBookmarked ? '#1565c0' : '#1976d2' 
          }
        }}
      >
        {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default BookmarkButton;

