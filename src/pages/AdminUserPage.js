// src/pages/AdminUserPage.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { 
  Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Switch, Avatar, Box, Alert, CircularProgress 
} from '@mui/material';

function AdminUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ADMIN_UID = "Ca2PJoQgksbNOMLIayHS6KQj4x82"; // Thay bằng UID thật của bạn

  useEffect(() => {
    // Bảo mật client: Nếu không phải Admin thì chặn
    if (auth.currentUser?.uid !== ADMIN_UID) {
        setError("Bạn không có quyền truy cập trang này.");
        setLoading(false);
        return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (err) {
      console.error("Lỗi load users:", err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (userId, currentStatus) => {
    if (userId === ADMIN_UID) return; // Không cho phép tắt quyền Admin chính

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        canUpload: !currentStatus
      });
      
      // Cập nhật state UI ngay lập tức
      setUsers(users.map(user => 
        user.id === userId ? { ...user, canUpload: !currentStatus } : user
      ));
    } catch (err) {
      alert("Lỗi khi cập nhật: " + err.message);
    }
  };

  if (loading) return <Box sx={{display:'flex', justifyContent:'center'}}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{m: 2}}>{error}</Alert>;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold', color: 'primary.main'}}>
        Quản lý Người dùng & Quyền Upload
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead sx={{bgcolor: '#f5f5f5'}}>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell align="center">Quyền Upload</TableCell>
              <TableCell>Ngày tạo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Avatar>{user.email?.charAt(0).toUpperCase()}</Avatar>
                        <Box>
                          <Typography variant="body1">{user.email}</Typography>
                          {user.id === ADMIN_UID && <Typography variant="caption" sx={{bgcolor:'orange', color:'white', px:1, borderRadius:1}}>Admin</Typography>}
                        </Box>
                    </Box>
                </TableCell>
                <TableCell align="center">
                  <Switch
                    checked={user.canUpload || false}
                    onChange={() => handleTogglePermission(user.id, user.canUpload)}
                    color="success"
                    disabled={user.id === ADMIN_UID}
                  />
                  <Typography variant="caption" display="block">
                    {user.canUpload ? "Được phép" : "Bị chặn"}
                  </Typography>
                </TableCell>
                <TableCell>
                  {user.createdAt?.seconds 
                    ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('vi-VN') 
                    : '---'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default AdminUserPage;