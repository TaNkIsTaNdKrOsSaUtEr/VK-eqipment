import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Box,
    Alert,
    CircularProgress,
    Button
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const MyRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            } else {
                throw new Error('Ошибка загрузки заявок');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Ошибка загрузки заявок');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'новая':
                return 'primary';
            case 'одобрена':
                return 'success';
            case 'отклонена':
                return 'error';
            case 'в работе':
                return 'warning';
            case 'завершена':
                return 'default';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Мои заявки
                </Typography>
                <Button variant="outlined" onClick={fetchRequests}>
                    Обновить
                </Button>
            </Box>

            {requests.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        У вас пока нет заявок
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Перейдите на вкладку "Создать заявку" для оформления аренды снаряжения
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>№ заявки</TableCell>
                                <TableCell>Дата создания</TableCell>
                                <TableCell>Период аренды</TableCell>
                                <TableCell>Цель</TableCell>
                                <TableCell>Сумма</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Комментарий</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow key={request.id_request}>
                                    <TableCell>{request.id_request}</TableCell>
                                    <TableCell>{formatDate(request.request_date)}</TableCell>
                                    <TableCell>
                                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                    </TableCell>
                                    <TableCell>{request.purpose || '-'}</TableCell>
                                    <TableCell>{request.total_price} ₽</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={request.status_name} 
                                            color={getStatusColor(request.status_name)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{request.admin_comment || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default MyRequests;
