// src/pages/DocumentsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Import các component MUI
import { 
  Typography, List, ListItem, ListItemText, ListItemIcon, 
  IconButton, Button, Paper, CircularProgress
} from '@mui/material';

// Import các Icon
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

function DocumentsPage({ user }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UID Admin để hiện nút xóa (Thay bằng UID thật của bạn)
  const ADMIN_UID = "Ca2PJoQgksbNOMLIayHS6KQj4x82"; 
  // Chỉ hiện nút Xóa nếu người đang xem là Admin
  const isAdmin = user && user.uid === ADMIN_UID;
  
  // Hàm lấy danh sách tài liệu
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "documents"), orderBy("uploadedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const docsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(docsList);
    } catch (error) {
      console.error("Lỗi khi lấy tài liệu:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Xử lý Xóa (Chỉ Admin mới xóa được)
  const handleDelete = async (docId) => {
    if (!isAdmin) return; 
    if (window.confirm("Bạn có chắc chắn muốn xóa file này?")) {
      try {
        await deleteDoc(doc(db, "documents", docId));
        // Load lại danh sách sau khi xóa
        fetchDocuments(); 
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Không thể xóa tài liệu này.");
      }
    }
  };
  
  // Hàm mở link (Cho phép TẤT CẢ mọi người)
  const handleOpenLink = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  return (
    <Paper elevation={3} sx={{ padding: { xs: 2, md: 4 } }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Tài liệu & Sách giáo khoa
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        Tất cả tài liệu đều được chia sẻ miễn phí. Bạn có thể xem hoặc tải về ngay lập tức.
      </Typography>
      
      {documents.length === 0 ? (
        <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>
          Chưa có tài liệu nào được đăng tải.
        </Typography>
      ) : (
        <List>
          {documents.map(doc => (
            <ListItem 
              key={doc.id}
              divider
              sx={{ 
                flexWrap: 'wrap',
                '& .MuiListItemSecondaryAction-root': { 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: 'wrap',
                  marginTop: { xs: 2, sm: 0 },
                  position: { xs: 'relative', sm: 'static' },
                  transform: { xs: 'none', sm: 'none' } // Sửa lỗi hiển thị trên mobile
                } 
              }}
              // Phần nút bấm hành động
              secondaryAction={
                <>
                  {/* Nút Xem: Ai cũng bấm được */}
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleOpenLink(doc.fileUrl)} 
                  >
                    Xem
                  </Button>
                  
                  {/* Nút Tải về: Ai cũng bấm được */}
                  <Button 
                    variant="contained" 
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleOpenLink(doc.fileUrl)} 
                  >
                    Tải về
                  </Button>
                  
                  {/* Nút Xóa: CHỈ HIỆN KHI LÀ ADMIN */}
                  {isAdmin && (
                    <IconButton 
                      edge="end" 
                      color="error" 
                      onClick={() => handleDelete(doc.id)}
                      title="Xóa tài liệu"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </>
              }
            >
              <ListItemIcon>
                <PictureAsPdfIcon color="error" fontSize="large" /> 
              </ListItemIcon>
              
              {/* Thông tin file */}
              <ListItemText 
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {doc.fileName}
                  </Typography>
                }
                secondary={
                  doc.uploadedAt 
                    ? `Đăng ngày: ${new Date(doc.uploadedAt.seconds * 1000).toLocaleDateString('vi-VN')}` 
                    : '...'
                }
                sx={{ 
                  paddingRight: { xs: 0, sm: '200px' }, // Tránh chữ đè lên nút trên màn hình lớn
                  mb: { xs: 1, sm: 0 } 
                }} 
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default DocumentsPage;