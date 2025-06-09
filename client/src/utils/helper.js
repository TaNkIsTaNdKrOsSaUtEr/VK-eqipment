// Форматирование даты
export const formatDate = (date, locale = 'ru-RU') => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(locale);
};

// Форматирование даты и времени
export const formatDateTime = (date, locale = 'ru-RU') => {
    if (!date) return '';
    return new Date(date).toLocaleString(locale);
};

// Форматирование цены
export const formatPrice = (price) => {
    if (!price && price !== 0) return '';
    return `${price.toLocaleString('ru-RU')} ₽`;
};

// Вычисление количества дней между датами
export const calculateDays = (dateFrom, dateTo) => {
    if (!dateFrom || !dateTo) return 0;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
};

// Получение цвета статуса
export const getStatusColor = (status) => {
    const statusColors = {
        'Не рассмотрена': 'warning',
        'Одобрена': 'info',
        'Отклонена': 'error',
        'Выдана': 'success',
        'Возвращена': 'default',
    };
    return statusColors[status] || 'default';
};

// Валидация VK ID
export const validateVkId = (vkId) => {
    const id = parseInt(vkId);
    return !isNaN(id) && id > 0;
};

// Валидация email
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Дебаунс функция
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Проверка роли пользователя
export const hasRole = (user, requiredRole) => {
    if (!user || !user.role) return false;
    return user.role === requiredRole;
};

// Проверка прав администратора
export const isAdmin = (user) => {
    return hasRole(user, 'Заведующий снаряжением');
};

// Получение инициалов из ФИО
export const getInitials = (fio) => {
    if (!fio) return '';
    return fio
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase();
};

// Обрезка текста
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Генерация случайного ID
export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
};

// Проверка доступности снаряжения
export const isEquipmentAvailable = (equipment, requestedQuantity = 1) => {
    return equipment.quantity >= requestedQuantity;
};

// Вычисление общей стоимости заявки
export const calculateRequestTotal = (items, dateFrom, dateTo) => {
    if (!items || items.length === 0 || !dateFrom || !dateTo) return 0;
    
    const days = calculateDays(dateFrom, dateTo);
    return items.reduce((total, item) => {
        return total + (item.rental_price * item.quantity * days);
    }, 0);
};

// Группировка массива по ключу
export const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
    }, {});
};

// Сортировка массива объектов
export const sortBy = (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
        if (direction === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });
};

// Фильтрация массива по поисковому запросу
export const filterBySearch = (array, searchTerm, searchFields) => {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
        return searchFields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
};
