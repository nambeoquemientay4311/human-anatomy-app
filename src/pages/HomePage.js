// src/pages/HomePage.js
import React, { useState } from 'react';
import ModelViewer from '../components/ModelViewer';
import SystemGrid from '../components/SystemGrid';
import SystemDetail from '../components/SystemDetail';

function HomePage() {
  const [selectedSystem, setSelectedSystem] = useState(null);

  const handleSystemSelect = (system) => {
    setSelectedSystem(system);
  };

  const handleBackToGrid = () => {
    setSelectedSystem(null);
  };

  return (
    <>
      <ModelViewer />
      
      {selectedSystem === null ? (
        <SystemGrid onSystemClick={handleSystemSelect} />
      ) : (
        <SystemDetail 
          system={selectedSystem} 
          onBackClick={handleBackToGrid} 
        />
      )}
    </>
  );
}

export default HomePage;