import axios from 'axios';

// Базовая конфигурация axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Токен истек или недействителен
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Методы для работы с API
export const authAPI = {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    logout: () => api.post('/api/auth/logout'),
};

export const equipmentAPI = {
    getAll: () => api.get('/api/equipment'),
    getTypes: () => api.get('/api/equipment/types'),
    getById: (id) => api.get(`/api/equipment/${id}`),
};

export const requestsAPI = {
    getAll: () => api.get('/api/requests'),
    getById: (id) => api.get(`/api/requests/${id}`),
    getItems: (id) => api.get(`/api/requests/${id}/items`),
    create: (requestData) => api.post('/api/requests', requestData),
    updateStatus: (id, status) => api.put(`/api/requests/${id}/status`, { status }),
    delete: (id) => api.delete(`/api/requests/${id}`),
};

export const adminAPI = {
    // Пользователи
    getUsers: () => api.get('/api/admin/users'),
    createUser: (userData) => api.post('/api/admin/users', userData),
    updateUser: (id, userData) => api.put(`/api/admin/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
    getRoles: () => api.get('/api/admin/roles'),

    // Снаряжение
    getEquipment: () => api.get('/api/admin/equipment'),
    createEquipment: (equipmentData) => api.post('/api/admin/equipment', equipmentData),
    updateEquipment: (id, equipmentData) => api.put(`/api/admin/equipment/${id}`, equipmentData),
    deleteEquipment: (id) => api.delete(`/api/admin/equipment/${id}`),

    // Заявки
    getRequests: () => api.get('/api/admin/requests'),
    getRequestStatuses: () => api.get('/api/admin/request-statuses'),
    updateRequestStatus: (id, status) => api.put(`/api/admin/requests/${id}/status`, { status }),
};

export default api;
