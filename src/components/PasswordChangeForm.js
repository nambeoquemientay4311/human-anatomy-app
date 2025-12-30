// src/components/PasswordChangeForm.js
import React, { useState } from 'react';
import { auth } from '../firebase'; // Đảm bảo đúng đường dẫn
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

// MUI Imports
import { 
  Box, TextField, Button, Typography, Paper, Alert, 
  IconButton, InputAdornment, CircularProgress 
} from '@mui/material';

// Icon Imports
import { Visibility, VisibilityOff } from '@mui/icons-material';

function PasswordChangeForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Kiểm tra đầu vào cơ bản
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError("Vui lòng điền đầy đủ cả 3 trường.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới và xác thực mật khẩu không khớp.");
      return;
    }

    const user = auth.currentUser;
    // Kiểm tra xem user có đăng nhập bằng Email/Password không
    if (!user || !user.email) {
        setError("Lỗi xác thực: Tính năng này chỉ áp dụng cho tài khoản đăng nhập bằng Email/Mật khẩu.");
        return;
    }

    setIsLoading(true);

    try {
      // 1. RE-AUTHENTICATE (Xác thực lại mật khẩu cũ)
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential); // Lỗi sẽ bị bắt ở catch nếu sai MK
      
      // 2. UPDATE PASSWORD (Cập nhật mật khẩu mới)
      await updatePassword(user, newPassword);

      setSuccess("Thay đổi mật khẩu thành công!");
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

    } catch (err) {
      // Xử lý lỗi Firebase
      if (err.code === 'auth/wrong-password') {
        setError("Mật khẩu hiện tại không chính xác.");
      } else if (err.code === 'auth/weak-password') {
        setError("Mật khẩu quá yếu (cần ít nhất 6 ký tự).");
      } else if (err.code === 'auth/requires-recent-login') {
        // Lỗi này xảy ra nếu người dùng đăng nhập quá lâu
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại.");
      } else {
        console.error("Lỗi đổi mật khẩu:", err);
        setError("Lỗi hệ thống khi đổi mật khẩu.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hàm tạo InputField dùng chung (để có nút xem/ẩn)
  const PasswordInput = ({ label, value, onChange, autoFocus = false }) => (
    <TextField
      label={label}
      type={showPassword ? 'text' : 'password'}
      fullWidth
      margin="normal"
      required
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <Paper elevation={4} sx={{ padding: {xs: 2, md: 3}, width: '100%', maxWidth: 400, margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Đổi Mật Khẩu
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit}>
        <PasswordInput
          label="Mật khẩu hiện tại"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          autoFocus={true}
        />
        <PasswordInput
          label="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordInput
          label="Xác thực mật khẩu mới"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
        
        <Button 
          type="submit"
          variant="contained" 
          fullWidth 
          size="large"
          sx={{ mt: 3 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Cập nhật Mật khẩu'}
        </Button>
      </Box>
    </Paper>
  );
}

export default PasswordChangeForm;