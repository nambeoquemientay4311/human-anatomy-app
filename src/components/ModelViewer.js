// src/components/ModelViewer.js
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import './ModelViewer.css'; // File CSS để canvas có kích thước

/*
 * Component này tải mô hình 3D.
 */
function Model() {
  // Đường dẫn này phải khớp với file của bạn trong /public/models/
  const { scene } = useGLTF('/models/human_body.glb'); 
  return <primitive object={scene} />;
}

/*
 * Component chính thiết lập cảnh 3D
 */
function ModelViewer() {
  return (
    <div className="model-container">
      {/* ĐÂY LÀ THẺ ĐÚNG:
        Chúng ta thêm camera prop vào thẻ Canvas ở ngoài cùng.
      */}
      <Canvas camera={{ position: [0, 1, 4], fov: 50 }}>
        
        {/* 'Suspense' là một component của React 
            để hiển thị "đang tải..." (hiện tại là 'null')
            trong khi mô hình đang được tải về */}
        <Suspense fallback={null}>
        
          {/* Ánh sáng Môi trường (chiếu sáng đều) */}
          <ambientLight intensity={0.5} />
          
          {/* Ánh sáng có hướng (như Mặt trời) */}
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {/* Tải mô hình 3D của bạn */}
          <Model />
          
          {/* Điều khiển (Cho phép xoay/thu phóng bằng chuột) */}
          <OrbitControls />
          
        </Suspense>
        
      </Canvas> {/* <-- Đây là thẻ đóng cho Canvas ở trên */}
      
      {/* DÒNG <Canvas...> THỪA CỦA BẠN ĐÃ BỊ XÓA KHỎI ĐÂY
      */}
    </div>
  );
}

// Tự động tải trước file model (ĐÃ VÔ HIỆU HÓA ĐỂ SỬA LỖI)
// useGLTF.preload('/models/human_body.glb'); 

export default ModelViewer;