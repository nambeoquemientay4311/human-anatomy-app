// src/pages/AboutPage.js
import React from 'react';
import { Container, Paper, Typography, Box, Divider } from '@mui/material';
import { motion } from 'framer-motion'; // <-- MỚI: Import motion
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SchoolIcon from '@mui/icons-material/School';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

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

function AboutPage() {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Paper 
        elevation={4} 
        sx={{ 
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          borderTop: '4px solid',
          borderColor: 'primary.main'
        }}
      >
        {/* TIÊU ĐỀ CHÍNH */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <InfoOutlinedIcon color="primary" sx={{ fontSize: { xs: 32, md: 40 }, mr: 1.5 }} />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: { xs: '1.8rem', md: '2.125rem' } }}
          >
            Giới thiệu Dự án
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {/* NỘI DUNG GIỚI THIỆU */}
        <ContentSection
          icon={<SchoolIcon color="action" />}
          title="Thực trạng dạy và học"
          text="Hiện nay, chương trình tìm hiểu về cơ thể người và các hệ cơ quan đã được đưa vào dạy học trong môn Sinh học lớp 8. Tuy nhiên, sách giáo khoa hiện nay chỉ sử dụng hình ảnh 2D (hình phẳng) để miêu tả, cộng thêm việc một số trường chưa có mô hình trực quan để phục vụ việc dạy và học."
        />

        <ContentSection
          icon={<WebAssetIcon color="action" />}
          title="Hạn chế của các giải pháp hiện có"
          text="Mặc dù đã có nhiều trang web chứa mô hình 3D cơ thể người, nhưng chúng vẫn còn rời rạc, chưa đồng bộ, dẫn đến việc phải tìm và tải về nhiều file 3D khác nhau, gây bất tiện cho người dùng."
        />

        <ContentSection
          icon={<RocketLaunchIcon color="action" />}
          title="Giải pháp của chúng tôi"
          text="Đáp ứng nhu cầu đó, WebApp Khám phá Cơ thể Người 3D đã được nghiên cứu và phát triển để hỗ trợ dạy học môn Khoa học tự nhiên (phân môn Sinh học) khối 8. Mục đích của dự án là giúp việc dạy và học trở nên dễ dàng, trực quan và sinh động hơn, thay thế cho việc phải tải nhiều file 3D riêng lẻ về máy."
        />
      </Paper>
    </motion.div>
  );
}

// Component con để tái sử dụng cho mỗi phần nội dung
function ContentSection({ icon, title, text }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
      <Box sx={{ mr: 2, mt: 0.5, color: 'primary.main' }}>{icon}</Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'justify' }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
}

export default AboutPage;