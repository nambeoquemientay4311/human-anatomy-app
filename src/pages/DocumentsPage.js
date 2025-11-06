// src/pages/DocumentsPage.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "documents"), orderBy("uploadedAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const docsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDocuments(docsList);

      } catch (error) {
        console.error("Lỗi khi lấy tài liệu:", error);
      }
      setIsLoading(false);
    };

    fetchDocuments();
  }, []);

  if (isLoading) {
    return <div>Đang tải danh sách tài liệu...</div>;
  }

  return (
    <div className="documents-container">
      <h2>Tài liệu & Sách giáo khoa</h2>
      <p>Đây là danh sách các tài liệu bạn có thể tải về.</p>
      
      {documents.length === 0 ? (
        <p>Chưa có tài liệu nào được upload.</p>
      ) : (
        <ul className="documents-list">
          {documents.map(doc => (
            <li key={doc.id}>
              <a 
                href={doc.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {doc.fileName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DocumentsPage;