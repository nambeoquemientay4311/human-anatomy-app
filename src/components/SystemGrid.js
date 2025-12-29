// src/components/SystemGrid.js
import React from 'react';
import { Grid, Paper, Typography, Box, CardActionArea } from '@mui/material';
import BookmarkButton from './BookmarkButton';

function SystemGrid({ systemConfig, onSystemClick, filteredSystems }) {
  return (
    <Box sx={{ p: 1 }}>
      <Typography 
        variant="h5" 
        align="center" 
        sx={{ 
          mb: 3, 
          fontWeight: 'bold', 
          color: '#2e7d32',
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontSize: { xs: '1.2rem', md: '1.5rem' }
        }}
      >
        Khám phá các Hệ cơ quan
      </Typography>

      <Grid container spacing={2}>
        {/* Thay đổi: Lặp qua danh sách các hệ đã được lọc */}
        {filteredSystems.map((name) => {
          const config = systemConfig[name];
          if (!config) return null; // Bỏ qua nếu không tìm thấy config
          return (
            <Grid item xs={6} key={name}> {/* xs=6 để luôn chia 2 cột */}
            <Paper
              elevation={6}
              onClick={() => onSystemClick(name)}
              sx={{
                height: { xs: '120px', md: '140px' }, // Chiều cao responsive
                borderRadius: '20px', // Bo góc tròn trịa
                background: config.gradient, // Áp dụng màu gradient
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', // Animation mượt
                cursor: 'pointer',
                boxShadow: `0 8px 15px ${config.shadow}`, // Bóng màu theo thẻ
                
                // --- HIỆU ỨNG HOVER ---
                '&:hover': {
                  transform: 'translateY(-5px) scale(1.02)', // Bay lên
                  boxShadow: `0 15px 25px ${config.shadow}`,
                  zIndex: 2
                }
              }}
            >
              {/* Nút Bookmark */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  '& .MuiIconButton-root': {
                    color: '#1976d2'
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <BookmarkButton systemName={name} />
              </Box>

              {/* CardActionArea tạo hiệu ứng sóng nước (ripple) khi click */}
              <CardActionArea sx={{ height: '100%', p: 1 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    gap: 1
                  }}
                >
                  {/* Vòng tròn mờ sau icon */}
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: '50%', 
                      bgcolor: 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {config.icon}
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    align="center" 
                    sx={{ 
                      fontWeight: 'bold', 
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      textShadow: '0px 2px 2px rgba(0,0,0,0.2)' 
                    }}
                  >
                    {name}
                  </Typography>
                </Box>
              </CardActionArea>
            </Paper>
          </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default SystemGrid;