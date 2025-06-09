import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';

const Equipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            setError('Ошибка загрузки снаряжения');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Доступное снаряжение
            </Typography>

            <Grid container spacing={3}>
                {equipment.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id_equipment}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {item.name_equipment}
                                </Typography>
                                
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {item.description}
                                </Typography>
                                
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Тип:</strong> {item.type_name}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Всего:</strong> {item.quantity} шт.
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Доступно:</strong> {item.available_quantity} шт.
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Состояние:</strong> {item.condition_equipment}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                        <strong>Цена:</strong> {item.rental_price} ₽/день
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {equipment.length === 0 && (
                <Box textAlign="center" sx={{ mt: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                        Снаряжение не найдено
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default Equipment;
