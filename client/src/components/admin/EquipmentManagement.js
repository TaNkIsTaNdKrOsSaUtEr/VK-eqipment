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

function EquipmentManagement() {
    const [equipment, setEquipment] = useState([]);
    const [types, setTypes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        id_type: '',
        quantity: '',
        deposit_price: '',
        rental_price: '',
        documentation: '',
        instructions: '',
        safety_info: '',
        composition: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchEquipment();
        fetchTypes();
    }, []);

    const fetchEquipment = async () => {
        try {
            const response = await axios.get('/api/admin/equipment');
            setEquipment(response.data);
        } catch (error) {
            setError('Ошибка загрузки снаряжения');
        }
    };

    const fetchTypes = async () => {
        try {
            const response = await axios.get('/api/equipment/types');
            setTypes(response.data);
        } catch (error) {
            console.error('Ошибка загрузки типов:', error);
        }
    };

    const handleOpenDialog = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                id_type: item.id_type,
                quantity: item.quantity,
                deposit_price: item.deposit_price,
                rental_price: item.rental_price,
                documentation: item.documentation || '',
                instructions: item.instructions || '',
                safety_info: item.safety_info || '',
                composition: item.composition || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                id_type: '',
                quantity: '',
                deposit_price: '',
                rental_price: '',
                documentation: '',
                instructions: '',
                safety_info: '',
                composition: ''
            });
        }
        setOpenDialog(true);
        setError('');
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingItem(null);
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
            if (editingItem) {
                await axios.put(`/api/admin/equipment/${editingItem.id_item}`, formData);
            } else {
                await axios.post('/api/admin/equipment', formData);
            }
            
            fetchEquipment();
            handleCloseDialog();
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка сохранения снаряжения');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Вы уверены, что хотите удалить это снаряжение?')) {
            try {
                await axios.delete(`/api/admin/equipment/${itemId}`);
                fetchEquipment();
            } catch (error) {
                setError('Ошибка удаления снаряжения');
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Управление снаряжением</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Добавить снаряжение
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Название</TableCell>
                            <TableCell>Тип</TableCell>
                            <TableCell>Количество</TableCell>
                            <TableCell>Залог</TableCell>
                            <TableCell>Прокат/день</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {equipment.map((item) => (
                            <TableRow key={item.id_item}>
                                <TableCell>{item.id_item}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.type_name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.deposit_price} ₽</TableCell>
                                <TableCell>{item.rental_price} ₽</TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(item)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(item.id_item)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingItem ? 'Редактировать снаряжение' : 'Добавить снаряжение'}
                </DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <TextField
                        fullWidth
                        label="Название"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />
                    
                    <TextField
                        fullWidth
                        select
                        label="Тип"
                        name="id_type"
                        value={formData.id_type}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    >
                        {types.map((type) => (
                            <MenuItem key={type.id_type} value={type.id_type}>
                                {type.type_name}
                            </MenuItem>
                        ))}
                    </TextField>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Количество"
                            name="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        
                        <TextField
                            label="Цена залога"
                            name="deposit_price"
                            type="number"
                            step="0.01"
                            value={formData.deposit_price}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        
                        <TextField
                            label="Цена проката/день"
                            name="rental_price"
                            type="number"
                            step="0.01"
                            value={formData.rental_price}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                    </Box>
                    
                    <TextField
                        fullWidth
                        label="Документация"
                        name="documentation"
                        value={formData.documentation}
                        onChange={handleInputChange}
                        margin="normal"
                        multiline
                        rows={2}
                    />
                    
                    <TextField
                        fullWidth
                        label="Инструкции"
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleInputChange}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    
                    <TextField
                        fullWidth
                        label="Техника безопасности"
                        name="safety_info"
                        value={formData.safety_info}
                        onChange={handleInputChange}
                        margin="normal"
                        multiline
                        rows={2}
                    />
                    
                    <TextField
                        fullWidth
                        label="Состав"
                        name="composition"
                        value={formData.composition}
                        onChange={handleInputChange}
                        margin="normal"
                        multiline
                        rows={2}
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

export default EquipmentManagement;
