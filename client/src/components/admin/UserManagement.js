import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Alert,
    Box,
    Typography
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        fio: '',
        vk_id: '',
        address: '',
        id_role: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/admin/users');
            setUsers(response.data);
        } catch (error) {
            setError('Ошибка загрузки пользователей');
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/api/admin/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Ошибка загрузки ролей:', error);
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                fio: user.fio,
                vk_id: user.vk_id,
                address: user.address || '',
                id_role: user.id_role,
                password: ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                fio: '',
                vk_id: '',
                address: '',
                id_role: '',
                password: ''
            });
        }
        setOpenDialog(true);
        setError('');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setFormData({
            fio: '',
            vk_id: '',
            address: '',
            id_role: '',
            password: ''
        });
        setError('');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            if (editingUser) {
                await axios.put(`/api/admin/users/${editingUser.id_user}`, formData);
            } else {
                await axios.post('/api/admin/users', formData);
            }
            
            fetchUsers();
            handleCloseDialog();
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка сохранения пользователя');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await axios.delete(`/api/admin/users/${userId}`);
                fetchUsers();
            } catch (error) {
                setError('Ошибка удаления пользователя');
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Управление пользователями</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Добавить пользователя
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>ФИО</TableCell>
                            <TableCell>VK ID</TableCell>
                            <TableCell>Адрес</TableCell>
                            <TableCell>Роль</TableCell>
                            <TableCell>Дата создания</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id_user}>
                                <TableCell>{user.id_user}</TableCell>
                                <TableCell>{user.fio}</TableCell>
                                <TableCell>{user.vk_id}</TableCell>
                                <TableCell>{user.address}</TableCell>
                                <TableCell>{user.role_name}</TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(user)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(user.id_user)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <TextField
                        fullWidth
                        label="ФИО"
                        name="fio"
                        value={formData.fio}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    
                    <TextField
                        fullWidth
                        label="VK ID"
                        name="vk_id"
                        type="number"
                        value={formData.vk_id}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    
                    <TextField
                        fullWidth
                        label="Адрес"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        margin="normal"
                        multiline
                        rows={2}
                    />
                    
                    <TextField
                        fullWidth
                        select
                        label="Роль"
                        name="id_role"
                        value={formData.id_role}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    >
                        {roles.map((role) => (
                            <MenuItem key={role.id_role} value={role.id_role}>
                                {role.name_role}
                            </MenuItem>
                        ))}
                    </TextField>
                    
                    <TextField
                        fullWidth
                        label={editingUser ? "Новый пароль (оставьте пустым, чтобы не менять)" : "Пароль"}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        margin="normal"
                        required={!editingUser}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {loading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default UserManagement;
