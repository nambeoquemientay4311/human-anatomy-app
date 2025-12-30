// src/pages/AddDocumentPage.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Paper, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';

function AddDocumentPage() {
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  
  const [canUpload, setCanUpload] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Thay bằng UID thật của bạn (để Admin luôn có quyền)
  const ADMIN_UID = "Ca2PJoQgksbNOMLIayHS6KQj4x82"; 

  // Link Beacons của bạn
  const BIO_LINK = "https://beacons.ai/ivannamne"; 

  useEffect(() => {
    const checkPermission = async () => {
      const user = auth.currentUser;
      if (!user) {
        setCanUpload(false);
        setIsCheckingPermission(false);
        return;
      }

      // Admin luôn được phép
      if (user.uid === ADMIN_UID) {
        setCanUpload(true);
        setIsCheckingPermission(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        // Kiểm tra field 'canUpload' trong database
        if (userDocSnap.exists() && userDocSnap.data().canUpload === true) {
          setCanUpload(true);
        } else {
          setCanUpload(false);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra quyền:", err);
        setCanUpload(false);
      } finally {
        setIsCheckingPermission(false);
      }
    };

    checkPermission();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileName || !fileUrl) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!fileUrl.startsWith('http')) {
        setError('Link không hợp lệ (phải bắt đầu bằng http/https).');
        return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await addDoc(collection(db, "documents"), {
        fileName: fileName,    
        fileUrl: fileUrl,      
        uploadedAt: serverTimestamp(),
        uploaderUid: auth.currentUser.uid,
        uploaderEmail: auth.currentUser.email
      });

      setSuccess(`Đã thêm thành công: "${fileName}"`);
      setFileName('');
      setFileUrl('');
    } catch (error) {
      console.error("Lỗi:", error);
      setError('Lỗi: Không thể lưu vào cơ sở dữ liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingPermission) {
    return <Box sx={{display: 'flex', justifyContent: 'center', mt: 5}}><CircularProgress /></Box>;
  }

  // --- NẾU KHÔNG CÓ QUYỀN UPLOAD ---
  if (!canUpload) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom sx={{fontWeight: 'bold'}}>
            Không có quyền truy cập
          </Typography>
          <Typography paragraph>
            Tài khoản của bạn chưa được cấp quyền đăng tải tài liệu.
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            Bạn cần liên hệ với Admin để được cấp quyền "Upload".
          </Alert>

          {/* Nút mở link Beacons */}
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => window.open(BIO_LINK, '_blank')}
            sx={{ borderRadius: 20 }}
          >
            Liên hệ Admin qua Beacons
          </Button>
        </Paper>
      </Box>
    );
  }

  // --- NẾU CÓ QUYỀN UPLOAD ---
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={4} sx={{ padding: {xs: 2, md: 4}, width: '100%', maxWidth: 600 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
          Thêm Tài liệu mới
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Tên tài liệu"
            fullWidth
            margin="normal"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={isLoading}
          />
          <TextField
            label="Link chia sẻ (OneDrive/Google Drive)"
            fullWidth
            margin="normal"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            disabled={isLoading}
          />
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          
          <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng tải'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default AddDocumentPage;