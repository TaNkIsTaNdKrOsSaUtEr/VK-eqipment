import React, { useState, useEffect } from 'react';
import {
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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    IconButton,
    Collapse
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import axios from 'axios';

function RequestsList({ user }) {
    const [requests, setRequests] = useState([]);
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [requestItems, setRequestItems] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/api/requests');
            setRequests(response.data);
        } catch (error) {
            setError('Ошибка загрузки заявок');
        } finally {
            setLoading(false);
        }
    };

    const fetchRequestItems = async (requestId) => {
        if (requestItems[requestId]) return;

        try {
            const response = await axios.get(`/api/requests/${requestId}/items`);
            setRequestItems(prev => ({
                ...prev,
                [requestId]: response.data
            }));
        } catch (error) {
            console.error('Ошибка загрузки позиций заявки:', error);
        }
    };

    const toggleExpanded = (requestId) => {
        if (expandedRequest === requestId) {
            setExpandedRequest(null);
        } else {
            setExpandedRequest(requestId);
            fetchRequestItems(requestId);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Не рассмотрена':
                return 'warning';
            case 'Одобрена':
                return 'info';
            case 'Отклонена':
                return 'error';
            case 'Выдана':
                return 'success';
            case 'Возвращена':
                return 'default';
            default:
                return 'default';
        }
    };

    const canEditRequest = (request) => {
        return request.status_name === 'Не рассмотрена' && request.id_user === user.id;
    };

    const updateRequestStatus = async (requestId, newStatus) => {
        try {
            await axios.put(`/api/requests/${requestId}/status`, { status: newStatus });
            fetchRequests();
        } catch (error) {
            setError('Ошибка обновления статуса заявки');
        }
    };

    if (loading) return <Typography>Загрузка...</Typography>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {user.role === 'Заведующий снаряжением' ? 'Все заявки' : 'Мои заявки'}
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>№</TableCell>
                            {user.role === 'Заведующий снаряжением' && <TableCell>Пользователь</TableCell>}
                            <TableCell>Дата создания</TableCell>
                            <TableCell>Период аренды</TableCell>
                            <TableCell>Сумма</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <React.Fragment key={request.id_request}>
                                <TableRow>
                                    <TableCell>{request.id_request}</TableCell>
                                    {user.role === 'Заведующий снаряжением' && (
                                        <TableCell>{request.fio}</TableCell>
                                    )}
                                                                        <TableCell>
                                        {new Date(request.created_at).toLocaleDateString('ru-RU')}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(request.date_from).toLocaleDateString('ru-RU')} - {new Date(request.date_to).toLocaleDateString('ru-RU')}
                                    </TableCell>
                                    <TableCell>{request.total_amount} ₽</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={request.status_name}
                                            color={getStatusColor(request.status_name)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => toggleExpanded(request.id_request)}
                                            size="small"
                                        >
                                            {expandedRequest === request.id_request ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                        {user.role === 'Заведующий снаряжением' && (
                                            <Box sx={{ display: 'inline-flex', gap: 1, ml: 1 }}>
                                                {request.status_name === 'Не рассмотрена' && (
                                                    <>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="success"
                                                            onClick={() => updateRequestStatus(request.id_request, 2)}
                                                        >
                                                            Одобрить
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => updateRequestStatus(request.id_request, 3)}
                                                        >
                                                            Отклонить
                                                        </Button>
                                                    </>
                                                )}
                                                {request.status_name === 'Одобрена' && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={() => updateRequestStatus(request.id_request, 4)}
                                                    >
                                                        Выдать
                                                    </Button>
                                                )}
                                                {request.status_name === 'Выдана' && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => updateRequestStatus(request.id_request, 5)}
                                                    >
                                                        Возвращено
                                                    </Button>
                                                )}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={user.role === 'Заведующий снаряжением' ? 7 : 6}>
                                        <Collapse in={expandedRequest === request.id_request} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1 }}>
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Состав заявки
                                                </Typography>
                                                {requestItems[request.id_request] && (
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>Название</TableCell>
                                                                <TableCell>Тип</TableCell>
                                                                <TableCell>Количество</TableCell>
                                                                <TableCell>Цена за день</TableCell>
                                                                <TableCell>Сумма</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {requestItems[request.id_request].map((item) => {
                                                                const days = Math.ceil((new Date(request.date_to) - new Date(request.date_from)) / (1000 * 60 * 60 * 24));
                                                                const itemTotal = item.rental_price * item.quantity * days;
                                                                return (
                                                                    <TableRow key={item.id_request_item}>
                                                                        <TableCell>{item.name}</TableCell>
                                                                        <TableCell>{item.type_name}</TableCell>
                                                                        <TableCell>{item.quantity}</TableCell>
                                                                        <TableCell>{item.rental_price} ₽</TableCell>
                                                                        <TableCell>{itemTotal} ₽</TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                )}
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default RequestsList;
