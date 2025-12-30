// src/components/DynamicModelViewer.js
import React, { Suspense, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Stage, 
  Html, 
  useProgress,
  useAnimations
} from '@react-three/drei';
import { Box, Stack, Button, CircularProgress, Typography } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

// === BẮT BUỘC: Import Three.js để tính toán tâm quay ===
import * as THREE from 'three'; 

// === LOADER ===
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#555' }}>
        <CircularProgress size={40} thickness={4} sx={{ color: '#00796b' }} />
        <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold', color: '#00796b' }}>
          {progress.toFixed(0)}%
        </Typography>
      </Box>
    </Html>
  );
}

// === MODEL (Đã FIX LỖI TÂM QUAY VÀ CẬP NHẬT MATRIX) ===
function Model({ modelUrl, scale }) {
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, scene);
  
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // --- FIX LỖI TÂM QUAY TRIỆT ĐỂ ---
  useLayoutEffect(() => {
    // Chỉ chạy logic này một lần duy nhất cho mỗi model
    if (!clonedScene.userData.centerApplied) { 
        
        // 1. Tính toán Bounding Box (Phạm vi giới hạn)
        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = new THREE.Vector3();
        box.getCenter(center); // Lấy tọa độ trung tâm thực
        
        // 2. Dời vị trí của toàn bộ mô hình để tâm của nó nằm ngay tại (0, 0, 0)
        clonedScene.position.sub(center); 
        
        // 3. RẤT QUAN TRỌNG: Cập nhật Matrix World
        // Đảm bảo thay đổi vị trí được áp dụng ngay lập tức trước khi render
        clonedScene.updateWorldMatrix(true, true); 

        // 4. Đặt cờ
        clonedScene.userData.centerApplied = true;
    }
  }, [clonedScene]); 
  
  // Tắt animation (Đảm bảo nhân vật đứng yên)
  useEffect(() => {
    if (actions) {
      Object.keys(actions).forEach((key) => {
        actions[key].stop();
      });
    }
  }, [actions]);
  
  return <primitive object={clonedScene} scale={scale} />;
}

// === COMPONENT CHÍNH ===
const DynamicModelViewer = ({ 
  modelUrl, 
  scale = 1,
}) => {
  
  const controlsRef = useRef(); 

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: 'radial-gradient(circle at center, #ffffff 0%, #e0eafc 100%)',
        borderRadius: 4,
        overflow: 'hidden'
      }}
    >
      {/* NÚT ĐIỀU KHIỂN */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
      >
        <Button 
          size="small" 
          variant="contained" 
          onClick={handleReset}
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.8)', 
            color: '#333',
            minWidth: 'auto', 
            p: 1,
            '&:hover': { bgcolor: '#fff' }
          }}
          title="Về vị trí gốc"
        >
          <RotateLeftIcon fontSize="small" />
        </Button>
      </Stack>
    
      {/* KHUNG 3D */}
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
        <Suspense fallback={<Loader />}>
          
          <Stage 
            intensity={0.6} 
            environment="city" 
            preset="rembrandt" 
            adjustCamera={1.2} 
          >
            <group>
              <Model modelUrl={modelUrl} scale={scale} />
            </group>
          </Stage>

          <OrbitControls 
            ref={controlsRef}
            makeDefault 
            
            // Cấu hình Xoay 360 độ
            autoRotate={true}        
            autoRotateSpeed={1.0}    
            
            // Các cấu hình khác
            enablePan={false} // Tắt kéo màn hình        
            minPolarAngle={0}        
            maxPolarAngle={Math.PI / 1.8} // Chặn không cho nhìn dưới đáy
          />
          
        </Suspense>
      </Canvas>
    </Box>
  );
};

useGLTF.preload = (url) => useGLTF.getState().add(url)

export default DynamicModelViewer;