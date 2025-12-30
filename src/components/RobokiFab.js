// src/components/RobokiFab.js
import React, { useState } from 'react';
import { Fab, Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// CSS cho các component
const fabStyle = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 1000,
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '500px',
  height: '70vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  p: 0, // Bỏ padding
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '4px',
  borderBottom: '1px solid #ddd',
};

const iframeStyle = {
  width: '100%',
  height: '100%',
  border: 'none',
  flexGrow: 1, // Để iframe lấp đầy không gian còn lại
};

function RobokiFab() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {/* Nút tròn với logo của bạn */}
      <Fab color="primary" sx={fabStyle} onClick={handleOpen}>
        <img 
          src="/roboki-logo.jpg" // Trỏ đến file trong thư mục /public
          alt="Roboki AI" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </Fab>

      {/* Cửa sổ Modal bật lên */}
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box sx={modalStyle}>
          {/* Nút đóng (X) */}
          <Box sx={modalHeaderStyle}>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Iframe chứa Roboki */}
          <iframe 
            src="https://roboki.vn/" 
            style={iframeStyle}
            title="Roboki AI Chatbot"
          />
        </Box>
      </Modal>
    </>
  );
}

export default RobokiFab;