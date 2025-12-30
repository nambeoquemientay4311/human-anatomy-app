// src/App.js
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink, Navigate, useLocation } from 'react-router-dom';

// Import Firebase Auth
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DocumentsPage from './pages/DocumentsPage';
import AddDocumentPage from './pages/AddDocumentPage'; 
import AdminUserPage from './pages/AdminUserPage';
import MyBookmarksPage from './pages/MyBookmarksPage';
import ProgressDashboardPage from './pages/ProgressDashboardPage';

// Import Components
import AIChatFab from './components/AIChatFab';
import PasswordChangeForm from './components/PasswordChangeForm'; // <--- MỚI: Import Form Đổi MK
import { getDesignTokens } from './theme'; // <--- ĐÃ SỬA: Import hàm tạo theme

// --- MỚI: Import Framer Motion ---
import { motion, AnimatePresence } from 'framer-motion';


// Import MUI
import { 
  AppBar, Toolbar, Typography, Container, Button, Box, 
  ThemeProvider, CssBaseline, CircularProgress, GlobalStyles, createTheme,
  IconButton, Menu, MenuItem, Avatar, Tooltip, Divider, ListItemIcon
} from '@mui/material';

// Import Icons
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Icon trăng (Dark)
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Icon trời (Light)
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock'; // <--- MỚI: Icon Khóa
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AssessmentIcon from '@mui/icons-material/Assessment';

const ADMIN_UID = "Ca2PJoQgksbNOMLIayHS6KQj4x82"; // UID Admin của bạn

// --- MỚI: Cấu hình hiệu ứng chuyển trang ---
const pageVariants = {
  initial: {
    opacity: 0,
    y: "2vh", // Bắt đầu trượt nhẹ từ dưới lên
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: "-2vh", // Trượt nhẹ lên trên khi thoát
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};


function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. QUẢN LÝ DARK MODE ---
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  }), []);

  // Tạo theme động dựa trên mode hiện tại
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // --- 2. QUẢN LÝ MENU USER ---
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // --- 3. CHECK LOGIN ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser && currentUser.uid === ADMIN_UID);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      handleCloseUserMenu();
      await signOut(auth);
      setIsAdmin(false);
    }
  };

  if (isLoading) {
    return <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  // Component Wrapper để chứa Routes và Location
  const AppRoutes = () => {
    const location = useLocation();
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/documents" element={<DocumentsPage user={user} />} />
            <Route path="/add-document" element={user ? <AddDocumentPage /> : <Navigate to="/login" />} />
            
            {/* --- ROUTE MỚI: ĐỔI MẬT KHẨU --- */}
            <Route 
              path="/change-password" 
              element={user ? <PasswordChangeForm /> : <Navigate to="/login" />} 
            />
            
            <Route path="/admin-users" element={isAdmin ? <AdminUserPage /> : <Navigate to="/" />} />
            <Route path="/my-bookmarks" element={user ? <MyBookmarksPage user={user} /> : <Navigate to="/login" />} />
            <Route path="/progress" element={user ? <ProgressDashboardPage user={user} /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
      </AnimatePresence>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Background toàn trang thay đổi theo mode */}
      <GlobalStyles styles={{
        body: { 
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            : 'linear-gradient(135deg, #0f2027 0%, #203a43 100%, #2c5364 100%)',
          minHeight: '100vh',
          backgroundAttachment: 'fixed',
          transition: 'background 0.3s ease'
        } 
      }} />

      <Router>
        <AppBar position="sticky" elevation={0}>
          <Toolbar>
            {/* LOGO */}
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
              onClick={() => window.location.href='/'}
            >
              Anatomy 3D
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              
              {/* Nút Chuyển chế độ Sáng/Tối */}
              <Tooltip title={mode === 'dark' ? "Chuyển sang Sáng" : "Chuyển sang Tối"}>
                <IconButton onClick={colorMode.toggleColorMode} color="inherit" sx={{ mr: 1 }}>
                  {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              <Button color="inherit" component={RouterLink} to="/">Trang chủ</Button>
              <Button color="inherit" component={RouterLink} to="/documents">Tài liệu</Button>

              {user ? (
                <>
                  <Button color="inherit" component={RouterLink} to="/add-document" sx={{ display: { xs: 'none', md: 'block' } }}>
                    Thêm Tài Liệu
                  </Button>

                  {/* AVATAR USER - Bấm vào sẽ hiện Menu */}
                  <Tooltip title="Tài khoản">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                      <Avatar 
                        alt={user.email} 
                        src={user.photoURL} 
                        sx={{ bgcolor: 'secondary.main' }}
                      >
                        {user.email?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  
                  {/* MENU XỔ XUỐNG */}
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                    PaperProps={{
                      elevation: 3,
                      sx: { 
                        overflow: 'visible', 
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))', 
                        mt: 1.5,
                        '&:before': { // Mũi tên trỏ lên
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold' }}>
                        {user.displayName || "Người dùng"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {user.email}
                      </Typography>
                    </Box>
                    <Divider />
                    
                    {/* --- MỤC MỚI: ĐỔI MẬT KHẨU --- */}
                    <MenuItem component={RouterLink} to="/change-password" onClick={handleCloseUserMenu}>
                      <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
                      Đổi Mật Khẩu
                    </MenuItem>

                    {/* --- MỤC MỚI: BOOKMARKS --- */}
                    <MenuItem component={RouterLink} to="/my-bookmarks" onClick={handleCloseUserMenu}>
                      <ListItemIcon><BookmarkIcon fontSize="small" /></ListItemIcon>
                      Đánh dấu của tôi
                    </MenuItem>

                    {/* --- MỤC MỚI: PROGRESS DASHBOARD --- */}
                    <MenuItem component={RouterLink} to="/progress" onClick={handleCloseUserMenu}>
                      <ListItemIcon><AssessmentIcon fontSize="small" /></ListItemIcon>
                      Tiến độ học tập
                    </MenuItem>
                    
                    {/* Mục dành riêng cho Admin */}
                    {isAdmin && (
                      <MenuItem component={RouterLink} to="/admin-users" onClick={handleCloseUserMenu}>
                        <ListItemIcon><SupervisorAccountIcon fontSize="small" /></ListItemIcon>
                        Quản lý User
                      </MenuItem>
                    )}
                    
                    <MenuItem component={RouterLink} to="/add-document" onClick={handleCloseUserMenu}>
                       <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                       Thêm tài liệu mới
                    </MenuItem>

                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                      <Typography color="error">Đăng xuất</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button variant="contained" color="primary" component={RouterLink} to="/login" sx={{ ml: 1, px: 3, borderRadius: 5 }}>
                  Đăng nhập
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: '80vh' }}>
          <AppRoutes />
        </Container>
        
        <AIChatFab />
      </Router>
    </ThemeProvider>
  );
}

export default App;