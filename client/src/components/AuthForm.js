import React, { useState } from 'react'; //компонент на допроверку
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Tabs,
    Tab,
    Alert
} from '@mui/material';
import axios from 'axios';

function AuthForm({ onLogin }) {
    const [tab, setTab] = useState(0);
    const [formData, setFormData] = useState({
        vk_id: '',
        password: '',
        fio: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = tab === 0 ? '/api/auth/login' : '/api/auth/register';
            const response = await axios.post(endpoint, formData);

            if (tab === 0) {
                // Вход
                onLogin(response.data.user, response.data.token);
            } else {
                // Регистрация
                setTab(0);
                setError('');
                alert('Регистрация успешна! Теперь войдите в систему.');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Учёт снаряжения
            </Typography>
            
            <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
                <Tab label="Вход" />
                <Tab label="Регистрация" />
            </Tabs>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <TextField
                    fullWidth
                    label="ID ВКонтакте"
                    name="vk_id"
                    value={formData.vk_id}
                    onChange={handleChange}
                    margin="normal"
                    required
                    type="number"
                />

                <TextField
                    fullWidth
                    label="Пароль"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                />

                {tab === 1 && (
                    <>
                        <TextField
                            fullWidth
                            label="ФИО"
                            name="fio"
                            value={formData.fio}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Адрес"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={2}
                        />
                    </>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                >
                    {loading ? 'Загрузка...' : (tab === 0 ? 'Войти' : 'Зарегистрироваться')}
                </Button>
            </Box>
        </Paper>
    );
}

export default AuthForm;
