// src/pages/HomePage.js
import React, { useState } from 'react';
import { Container, Typography, Box, Grid, Paper, Fade, TextField } from '@mui/material';
import SystemGrid from '../components/SystemGrid';
import SystemDetail from '../components/SystemDetail';
import DynamicModelViewer from '../components/DynamicModelViewer';
import { motion } from 'framer-motion'; // <-- MỚI: Import motion

// Import Icons
import PsychologyIcon from '@mui/icons-material/Psychology';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import WcIcon from '@mui/icons-material/Wc';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

// === CẤU HÌNH MÀU SẮC MỚI (GRADIENT) ===
const systemConfig = {
  "Hệ Thần kinh": { 
    icon: <PsychologyIcon fontSize="large" />, 
    // Xanh lá đậm -> Xanh sáng
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
    shadow: 'rgba(56, 239, 125, 0.4)' 
  },
  "Hệ Tuần hoàn": { 
    icon: <FavoriteIcon fontSize="large" />, 
    // Đỏ hồng -> Đỏ cam
    gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b1f 100%)', 
    shadow: 'rgba(255, 75, 31, 0.4)' 
  },
  "Hệ Nội tiết": { 
    icon: <DeviceHubIcon fontSize="large" />, 
    // Tím đậm -> Tím xanh
    gradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', 
    shadow: 'rgba(74, 0, 224, 0.4)' 
  },
  "Hệ Sinh dục": { 
    icon: <WcIcon fontSize="large" />, 
    // Hồng đậm -> Hồng phấn
    gradient: 'linear-gradient(135deg, #ec008c 0%, #fc6767 100%)', 
    shadow: 'rgba(236, 0, 140, 0.4)' 
  },
  "Hệ Bài tiết": { 
    icon: <WaterDropIcon fontSize="large" />, 
    // Xanh ngọc
    gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)', 
    shadow: 'rgba(0, 176, 155, 0.4)' 
  },
  "Hệ Hô hấp": { 
    icon: <AirIcon fontSize="large" />, 
    // Xanh biển
    gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)', 
    shadow: 'rgba(33, 147, 176, 0.4)' 
  },
  "Hệ Tiêu hóa": { 
    icon: <FastfoodIcon fontSize="large" />, 
    // Cam đỏ -> Vàng
    gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', 
    shadow: 'rgba(245, 175, 25, 0.4)' 
  },
  "Hệ Vận động": { 
    icon: <FitnessCenterIcon fontSize="large" />, 
    // Xám đen (Titanium)
    gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)', 
    shadow: 'rgba(65, 67, 69, 0.4)' 
  },
};

// --- MỚI: Cấu hình hiệu ứng chuyển trang ---
const pageVariants = {
  initial: { opacity: 0, y: "2vh" },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: "-2vh" }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

function HomePage() {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State cho ô tìm kiếm

  const handleSystemClick = (system) => {
    setSelectedSystem(system);
  };

  const handleBackToSystems = () => {
    setSelectedSystem(null);
  };

  // Lọc các hệ cơ quan dựa trên searchTerm
  const filteredSystems = Object.keys(systemConfig).filter(systemName =>
    systemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, mt: 2, fontWeight: 'bold', color: '#1a237e' }}>
        WebApp Khám phá Cơ thể Người 3D
      </Typography>

      <Box sx={{ position: 'relative', minHeight: '620px' }}>
        
        {/* VIEW 1: TRANG CHỦ */}
        <Fade in={!selectedSystem} timeout={500} unmountOnExit>
          <Box sx={{ position: 'absolute', width: '100%' }}>
            <Grid container spacing={4} alignItems="stretch">
              
              {/* CỘT TRÁI: 3D MODEL */}
              <Grid item xs={12} md={7}>
                <Paper 
                  elevation={4} 
                  sx={{ 
                    height: { xs: '300px', md: '600px' }, 
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 4, // Bo tròn khung 3D
                    bgcolor: '#f0f2f5'
                  }}
                >
                  <DynamicModelViewer 
                    modelUrl="/models/human_body.glb"
                    // Không cần truyền scale/position nếu đã dùng <Stage> bên file kia
                  />
                </Paper>
              </Grid>

              {/* CỘT PHẢI: SYSTEM GRID */}
              <Grid item xs={12} md={5} sx={{ minHeight: { xs: 'auto', md: '600px' } }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Tìm kiếm hệ cơ quan..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                />
                {filteredSystems.length > 0 ? (
                  <SystemGrid
                    onSystemClick={handleSystemClick}
                    systemConfig={systemConfig}
                    filteredSystems={filteredSystems} // <-- Truyền danh sách đã lọc
                  />
                ) : (
                  <Typography align="center" sx={{ mt: 4, color: 'text.secondary' }}>
                    Không tìm thấy hệ cơ quan phù hợp.
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </Fade>

        {/* VIEW 2: CHI TIẾT */}
        <Fade in={!!selectedSystem} timeout={500} unmountOnExit>
          <Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
            {selectedSystem && (
              <SystemDetail 
                system={selectedSystem} 
                onBack={handleBackToSystems} 
              />
            )}
          </Box>
        </Fade>

      </Box>
      </Container>
    </motion.div>
  );
}

export default HomePage;