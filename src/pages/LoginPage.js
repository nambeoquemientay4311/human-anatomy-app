// src/pages/LoginPage.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook để chuyển trang

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Đăng nhập thành công!");
      navigate('/'); // Chuyển về trang chủ
    } catch (err) {
      setError(err.message);
      console.error("Lỗi đăng nhập:", err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Đăng ký thành công!");
      navigate('/'); // Chuyển về trang chủ
    } catch (err) {
      setError(err.message);
      console.error("Lỗi đăng ký:", err);
    }
  };

  return (
    <div>
      <h2>Đăng nhập hoặc Đăng ký</h2>
      <form>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
        />
        <br />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Mật khẩu (ít nhất 6 ký tự)" 
          required 
        />
        <br />
        <button onClick={handleLogin}>Đăng nhập</button>
        <button onClick={handleRegister}>Đăng ký</button>
      </form>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}

export default LoginPage;