// src/components/SystemDetail.js
import React from 'react';
import './SystemDetail.css'; // File CSS cho component này

// Component này nhận 2 props:
// 1. system: Object chứa toàn bộ thông tin của hệ (tên, mô tả, v.v.)
// 2. onBackClick: Một hàm để quay lại màn hình lưới (SystemGrid)
function SystemDetail({ system, onBackClick }) {
  return (
    <div className="system-detail-container">
      {/* Nút quay lại */}
      <button className="back-button" onClick={onBackClick}>
        &larr; Quay lại
      </button>

      {/* Tên hệ cơ quan */}
      <h1>{system.name}</h1>

      {/* Mô tả cấu tạo */}
      <div className="detail-section">
        <h2>Cấu tạo</h2>
        <p>{system.structure}</p>
      </div>

      {/* Mô tả chức năng */}
      <div className="detail-section">
        <h2>Chức năng</h2>
        <p>{system.description}</p>
      </div>

      {/* Một số bệnh liên quan */}
      <div className="detail-section">
        <h2>Một số bệnh liên quan</h2>
        <ul>
          {system.diseases.map((disease, index) => (
            <li key={index}>{disease.name}</li>
          ))}
        </ul>
      </div>

      {/* Thông tin thú vị */}
      <div className="detail-section">
        <h2>Thông tin thú vị</h2>
        <ul>
          {system.funFacts.map((fact, index) => (
            <li key={index}>{fact}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SystemDetail;