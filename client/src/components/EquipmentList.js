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
    TextField,
    MenuItem,
    Alert
} from '@mui/material';
import axios from 'axios';

function EquipmentList({ user }) {
    const [equipment, setEquipment] = useState([]);
    const [filteredEquipment, setFilteredEquipment] = useState([]);
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEquipment();
        fetchTypes();
    }, []);

    useEffect(() => {
        filterEquipment();
    }, [equipment, selectedType, searchTerm]);

    const fetchEquipment = async () => {
        try {
            const response = await axios.get('/api/equipment');
            setEquipment(response.data);
        } catch (error) {
            setError('Ошибка загрузки снаряжения');
        } finally {
            setLoading(false);
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

    const filterEquipment = () => {
        let filtered = equipment;

        if (selectedType) {
            filtered = filtered.filter(item => item.type_name === selectedType);
        }

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEquipment(filtered);
    };

    if (loading) return <Typography>Загрузка...</Typography>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Снаряжение
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    label="Поиск по названию"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 200 }}
                />
                <TextField
                    select
                    label="Тип снаряжения"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">Все типы</MenuItem>
                    {types.map((type) => (
                        <MenuItem key={type.id_type} value={type.type_name}>
                            {type.type_name}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Тип</TableCell>
                            <TableCell>Количество</TableCell>
                            <TableCell>Цена залога</TableCell>
                            <TableCell>Цена проката/день</TableCell>
                            <TableCell>Статус</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEquipment.map((item) => (
                            <TableRow key={item.id_item}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.type_name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.deposit_price} ₽</TableCell>
                                <TableCell>{item.rental_price} ₽</TableCell>
                                <TableCell>
                                    <Chip
                                        label={item.quantity > 0 ? 'Доступно' : 'Нет в наличии'}
                                        color={item.quantity > 0 ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default EquipmentList;
