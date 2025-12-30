// src/theme.js
import { grey } from '@mui/material/colors';

// Hàm sinh ra cấu hình Theme dựa trên chế độ 'light' hoặc 'dark'
export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // === MÀU SÁNG (LIGHT MODE) ===
          primary: {
            main: '#00796b', // Xanh Teal đậm
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#ff7043', // Cam san hô
          },
          background: {
            default: '#f0f2f5', 
            paper: '#ffffff',
          },
          text: {
            primary: '#1c2e4a',
            secondary: '#546e7a',
          },
        }
      : {
          // === MÀU TỐI (DARK MODE) ===
          primary: {
            main: '#80cbc4', // Xanh ngọc sáng (dễ nhìn trên nền đen)
            contrastText: '#000000',
          },
          secondary: {
            main: '#ffab91', // Cam nhạt
          },
          background: {
            default: '#0f172a', // Xanh đen đậm (Midnight Blue)
            paper: '#1e293b',   // Xám xanh
          },
          text: {
            primary: '#e2e8f0', // Trắng xám
            secondary: '#94a3b8',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      // Gradient chữ thay đổi theo mode
      background: mode === 'light' 
        ? '-webkit-linear-gradient(45deg, #00796b 30%, #48a999 90%)' 
        : '-webkit-linear-gradient(45deg, #80cbc4 30%, #b2dfdb 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h5: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12, // Bo tròn mặc định
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '24px', // Nút bo tròn kiểu Pill
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Tắt lớp phủ trắng mờ mặc định của MUI Dark Mode
          transition: 'background-color 0.3s ease', // Hiệu ứng chuyển màu mượt mà
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Hiệu ứng kính mờ (Glassmorphism)
          background: mode === 'light' 
            ? 'rgba(255, 255, 255, 0.8)' 
            : 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
          color: mode === 'light' ? '#00796b' : '#80cbc4',
          boxShadow: 'none',
        }
      }
    }
  },
});