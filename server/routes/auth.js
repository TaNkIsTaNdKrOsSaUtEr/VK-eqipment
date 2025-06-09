const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../models/database');
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
    try {
        console.log('Попытка регистрации:', req.body);
        
        const { fio, vk_id, password, address } = req.body;

        if (!fio || !vk_id || !password) {
            return res.status(400).json({ message: 'Заполните все обязательные поля' });
        }

        // Проверяем, существует ли пользователь
        const [existingUsers] = await pool.execute(
            'SELECT id_user FROM users WHERE vk_id = ?',
            [vk_id]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким VK ID уже существует' });
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создаем пользователя (роль user = 2)
        const [result] = await pool.execute(
            'INSERT INTO users (fio, vk_id, password, address, id_role) VALUES (?, ?, ?, ?, ?)',
            [fio, vk_id, hashedPassword, address || null, 2]
        );

        console.log('Пользователь создан с ID:', result.insertId);

        // Получаем созданного пользователя с ролью
        const [users] = await pool.execute(
            `SELECT u.id_user, u.fio, u.vk_id, u.address, r.name_role 
             FROM users u 
             JOIN roles r ON u.id_role = r.id_role 
             WHERE u.id_user = ?`,
            [result.insertId]
        );

        const user = users[0];

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user.id_user, role: user.name_role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: {
                id: user.id_user,
                fio: user.fio,
                vk_id: user.vk_id,
                address: user.address,
                role_name: user.name_role
            }
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера: ' + error.message });
    }
});

// Вход
router.post('/login', async (req, res) => {
    try {
        console.log('Попытка входа:', { vk_id: req.body.vk_id });
        
        const { vk_id, password } = req.body;

        if (!vk_id || !password) {
            return res.status(400).json({ message: 'Введите VK ID и пароль' });
        }

        // Находим пользователя
        const [users] = await pool.execute(
            `SELECT u.id_user, u.fio, u.vk_id, u.password, u.address, r.name_role 
             FROM users u 
             JOIN roles r ON u.id_role = r.id_role 
             WHERE u.vk_id = ?`,
            [vk_id]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Неверный VK ID или пароль' });
        }

        const user = users[0];

        // Проверяем пароль
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Неверный VK ID или пароль' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user.id_user, role: user.name_role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log('Успешный вход пользователя:', user.fio);

        res.json({
            message: 'Успешный вход',
            token,
            user: {
                id: user.id_user,
                fio: user.fio,
                vk_id: user.vk_id,
                address: user.address,
                role_name: user.name_role
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера: ' + error.message });
    }
});

module.exports = router;
