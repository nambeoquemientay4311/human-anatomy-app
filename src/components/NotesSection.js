// src/components/NotesSection.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';

function NotesSection({ systemName }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  // Load notes khi component mount hoặc systemName thay đổi
  useEffect(() => {
    loadNotes();
  }, [systemName]);

  const loadNotes = async () => {
    const user = auth.currentUser;
    if (!user || !systemName) {
      setNotes([]);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid),
        where('systemName', '==', systemName),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const notesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesList);
    } catch (error) {
      console.error('Lỗi load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteContent(note.content);
    } else {
      setEditingNote(null);
      setNoteContent('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNote(null);
    setNoteContent('');
  };

  const handleSaveNote = async () => {
    const user = auth.currentUser;
    if (!user || !noteContent.trim()) {
      return;
    }

    try {
      if (editingNote) {
        // Cập nhật note
        await updateDoc(doc(db, 'notes', editingNote.id), {
          content: noteContent.trim(),
          updatedAt: new Date()
        });
      } else {
        // Tạo note mới
        await addDoc(collection(db, 'notes'), {
          userId: user.uid,
          systemName: systemName,
          content: noteContent.trim(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      handleCloseDialog();
      loadNotes();
    } catch (error) {
      console.error('Lỗi save note:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'notes', noteId));
      loadNotes();
    } catch (error) {
      console.error('Lỗi xóa note:', error);
      alert('Có lỗi xảy ra khi xóa ghi chú.');
    }
  };

  if (!auth.currentUser) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Vui lòng đăng nhập để sử dụng tính năng ghi chú.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
          Ghi chú cá nhân
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<NoteAddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm ghi chú
        </Button>
      </Box>

      {notes.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
          Chưa có ghi chú nào. Nhấn "Thêm ghi chú" để tạo ghi chú đầu tiên.
        </Typography>
      ) : (
        <List>
          {notes.map((note, index) => (
            <React.Fragment key={note.id}>
              <Paper elevation={1} sx={{ mb: 1, p: 1 }}>
                <ListItem>
                  <ListItemText
                    primary={note.content}
                    secondary={
                      note.updatedAt
                        ? `Cập nhật: ${new Date(note.updatedAt.seconds * 1000).toLocaleString('vi-VN')}`
                        : note.createdAt
                        ? `Tạo: ${new Date(note.createdAt.seconds * 1000).toLocaleString('vi-VN')}`
                        : ''
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleOpenDialog(note)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      color="error"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
              {index < notes.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Dialog thêm/sửa ghi chú */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingNote ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nội dung ghi chú"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Nhập ghi chú của bạn về hệ cơ quan này..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSaveNote} variant="contained" disabled={!noteContent.trim()}>
            {editingNote ? 'Cập nhật' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default NotesSection;

