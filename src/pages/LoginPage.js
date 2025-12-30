// src/pages/LoginPage.js
import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Đảm bảo import đúng đường dẫn firebase
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';

import { 
  Box, TextField, Button, Typography, Paper, Divider, 
  IconButton, InputAdornment, Tabs, Tab, Alert, Link 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function LoginPage() {
  const [tabIndex, setTabIndex] = useState(0); // 0: Login, 1: Register
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Nhập lại MK
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError('');
    setSuccess('');
    setIsForgotPassword(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // Đăng nhập Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Lưu user vào Firestore (nếu chưa có)
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.displayName,
        lastLogin: new Date()
      }, { merge: true });

      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // Xử lý Quên mật khẩu
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Vui lòng nhập Email để đặt lại mật khẩu.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.");
      setError('');
    } catch (err) {
      setError("Lỗi: " + err.message);
    }
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (tabIndex === 0) {
        // --- ĐĂNG NHẬP ---
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/'); 
      } else {
        // --- ĐĂNG KÝ ---
        if (password !== confirmPassword) {
          setError("Mật khẩu nhập lại không khớp!");
          return;
        }
        if (password.length < 6) {
          setError("Mật khẩu phải có ít nhất 6 ký tự.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Tạo Document User mới với quyền canUpload: false
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: new Date(),
          canUpload: false, // Mặc định không được upload
          role: 'user'
        });

        setSuccess("Đăng ký thành công! Đang chuyển hướng...");
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      if(err.code === 'auth/email-already-in-use') setError('Email này đã được sử dụng.');
      else if(err.code === 'auth/wrong-password') setError('Sai mật khẩu.');
      else if(err.code === 'auth/user-not-found') setError('Tài khoản không tồn tại.');
      else setError(err.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 450, overflow: 'hidden' }}>
        
        {!isForgotPassword && (
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Đăng nhập" />
            <Tab label="Đăng ký" />
          </Tabs>
        )}

        <Box sx={{ p: 4 }}>
          <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            {isForgotPassword ? "Quên Mật Khẩu" : (tabIndex === 0 ? "Chào mừng trở lại!" : "Tạo tài khoản mới")}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {!isForgotPassword && (
              <>
                <TextField
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {tabIndex === 1 && (
                  <TextField
                    label="Nhập lại mật khẩu"
                    type="password"
                    fullWidth
                    margin="normal"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                )}
              </>
            )}

            {!isForgotPassword ? (
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3, mb: 2 }}>
                {tabIndex === 0 ? "Đăng nhập" : "Đăng ký"}
              </Button>
            ) : (
              <Button variant="contained" fullWidth size="large" sx={{ mt: 3, mb: 2 }} onClick={handleForgotPassword}>
                Gửi Email xác thực
              </Button>
            )}

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              {tabIndex === 0 && !isForgotPassword && (
                <Link component="button" variant="body2" onClick={() => { setIsForgotPassword(true); setError(''); }} sx={{ textDecoration: 'none' }}>
                  Quên mật khẩu?
                </Link>
              )}
              {isForgotPassword && (
                <Link component="button" variant="body2" onClick={() => setIsForgotPassword(false)} sx={{ textDecoration: 'none' }}>
                  Quay lại Đăng nhập
                </Link>
              )}
            </Box>
          </Box>

          {tabIndex === 0 && !isForgotPassword && (
            <>
              <Divider sx={{ my: 2 }}>HOẶC</Divider>
              <Button variant="outlined" fullWidth onClick={handleGoogleLogin} sx={{ color: '#DB4437', borderColor: '#DB4437' }}>
                Đăng nhập với Google
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;