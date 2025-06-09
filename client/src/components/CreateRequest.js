import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Box,
    Alert,
    Snackbar
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const CreateRequest = () => {
    const { user } = useAuth();
    const [equipment, setEquipment] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/equipment');
            if (response.ok) {
                const data = await response.json();
                setEquipment(data);
            } else {
                throw new Error('Ошибка загрузки снаряжения');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setSnackbar({
                open: true,
                message: 'Ошибка загрузки снаряжения',
                severity: 'error'
            });
        }
    };

    const addItem = (equipmentItem) => {
        const existingItem = selectedItems.find(item => item.id_equipment === equipmentItem.id_equipment);
        
        if (existingItem) {
            if (existingItem.quantity < equipmentItem.available_quantity) {
                setSelectedItems(selectedItems.map(item =>
                    item.id_equipment === equipmentItem.id_equipment
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            } else {
                setSnackbar({
                    open: true,
                    message: `Максимальное доступное количество: ${equipmentItem.available_quantity}`,
                    severity: 'warning'
                });
            }
        } else {
            setSelectedItems([...selectedItems, {
                id_equipment: equipmentItem.id_equipment,
                name_equipment: equipmentItem.name_equipment,
                rental_price: equipmentItem.rental_price,
                available_quantity: equipmentItem.available_quantity,
                quantity: 1
            }]);
        }
    };

    const removeItem = (equipmentId) => {
        const existingItem = selectedItems.find(item => item.id_equipment === equipmentId);
        
        if (existingItem && existingItem.quantity > 1) {
            setSelectedItems(selectedItems.map(item =>
                item.id_equipment === equipmentId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ));
        } else {
            setSelectedItems(selectedItems.filter(item => item.id_equipment !== equipmentId));
        }
    };

    const deleteItem = (equipmentId) => {
        setSelectedItems(selectedItems.filter(item => item.id_equipment !== equipmentId));
    };

    const calculateTotal = () => {
        if (!dateFrom || !dateTo) return 0;
        
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
        
        return selectedItems.reduce((total, item) => {
            return total + (item.rental_price * item.quantity * days);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!dateFrom || !dateTo || selectedItems.length === 0) {
            setSnackbar({
                open: true,
                message: 'Заполните все обязательные поля и выберите снаряжение',
                severity: 'error'
            });
            return;
        }

        if (new Date(dateFrom) >= new Date(dateTo)) {
            setSnackbar({
                open: true,
                message: 'Дата окончания должна быть позже даты начала',
                severity: 'error'
            });
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date_from: dateFrom,
                    date_to: dateTo,
                    purpose: purpose,
                    items: selectedItems.map(item => ({
                        id_equipment: item.id_equipment,
                        quantity: item.quantity,
                        rental_price: item.rental_price
                    }))
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({
                    open: true,
                    message: 'Заявка успешно создана!',
                    severity: 'success'
                });
                
                // Очищаем форму
                setSelectedItems([]);
                setDateFrom('');
                setDateTo('');
                setPurpose('');
                
                // Обновляем список снаряжения
                fetchEquipment();
            } else {
                throw new Error(data.message || 'Ошибка создания заявки');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setSnackbar({
                open: true,
                message: error.message || 'Ошибка создания заявки',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Создать заявку на снаряжение
            </Typography>

            <Grid container spacing={3}>
                {/* Форма заявки */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Параметры аренды
                        </Typography>
                        
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Дата начала"
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                                required
                            />
                            
                            <TextField
                                fullWidth
                                label="Дата окончания"
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                margin="normal"
                                required
                            />
                            
                            <TextField
                                fullWidth
                                label="Цель использования"
                                multiline
                                rows={3}
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                margin="normal"
                            />

                            {selectedItems.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="h6">
                                        Выбранное снаряжение:
                                    </Typography>
                                    {selectedItems.map((item) => (
                                        <Box key={item.id_equipment} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Typography sx={{ flexGrow: 1 }}>
                                                {item.name_equipment} x {item.quantity}
                                            </Typography>
                                            <IconButton onClick={() => removeItem(item.id_equipment)} size="small">
                                                <Remove />
                                            </IconButton>
                                            <IconButton onClick={() => addItem(item)} size="small">
                                                <Add />
                                            </IconButton>
                                            <IconButton onClick={() => deleteItem(item.id_equipment)} size="small" color="error">
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    
                                    <Typography variant="h6" sx={{ mt: 2 }}>
                                        Общая стоимость: {calculateTotal().toFixed(2)} ₽
                                    </Typography>
                                </Box>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ mt: 3 }}
                                disabled={loading || selectedItems.length === 0}
                            >
                                {loading ? 'Создание...' : 'Создать заявку'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Список снаряжения */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Доступное снаряжение
                    </Typography>
                    
                    <Grid container spacing={2}>
                        {equipment.map((item) => (
                            <Grid item xs={12} key={item.id_equipment}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">
                                            {item.name_equipment}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {item.description}
                                        </Typography>
                                        <Typography variant="body2">
                                            Тип: {item.type_name}
                                        </Typography>
                                        <Typography variant="body2">
                                            Доступно: {item.available_quantity} шт.
                                        </Typography>
                                        <Typography variant="body2">
                                            Цена: {item.rental_price} ₽/день
                                        </Typography>
                                        <Typography variant="body2">
                                            Состояние: {item.condition_equipment}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            onClick={() => addItem(item)}
                                            disabled={item.available_quantity === 0}
                                        >
                                            Добавить
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CreateRequest;
