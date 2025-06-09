import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    vk_id: '',
    password: '',
    fio: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Регистрация
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="VK ID"
          name="vk_id"
          value={formData.vk_id}
          onChange={handleChange}
          margin="normal"
          required
        />
        
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
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
        
        <Button
          fullWidth
          variant="text"
          onClick={onSwitchToLogin}
        >
          Уже есть аккаунт? Войти
        </Button>
      </Box>
    </Paper>
  );
};

export default Register;
