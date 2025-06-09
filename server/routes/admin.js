const express = require('express');
const pool = require('../models/database');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware для проверки админа
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Токен доступа отсутствует' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Недействительный токен' });
        }

        try {
            const [users] = await pool.execute(
                'SELECT u.*, r.name_role FROM users u JOIN roles r ON u.id_role = r.id_role WHERE u.id_user = ?',
                [decoded.userId]
            );

            if (users.length === 0 || users[0].name_role !== 'admin') {
                return res.status(403).json({ message: 'Недостаточно прав доступа' });
            }

            req.user = { ...decoded, role: users[0].name_role };
            next();
        } catch (error) {
            console.error('Ошибка проверки прав:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });
};

// Получить все заявки
router.get('/requests', authenticateAdmin, async (req, res) => {
    try {
        const [requests] = await pool.execute(`
            SELECT 
                r.id_request,
                r.request_date,
                r.start_date,
                r.end_date,
                r.purpose,
                r.total_price,
                r.admin_comment,
                rs.name_status as status_name,
                u.fio as user_name,
                u.vk_id
            FROM requests r
            JOIN request_statuses rs ON r.id_status = rs.id_status
            JOIN users u ON r.id_user = u.id_user
            ORDER BY r.request_date DESC
        `);

        res.json(requests);
    } catch (error) {
        console.error('Ошибка получения заявок:', error);
        res.status(500).json({ message: 'Ошибка загрузки заявок' });
    }
});

// Изменить статус заявки
router.put('/requests/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_comment } = req.body;

        // Получаем ID статуса
        const [statuses] = await pool.execute(
            'SELECT id_status FROM request_statuses WHERE name_status = ?',
            [status]
        );

        if (statuses.length === 0) {
            return res.status(400).json({ message: 'Неверный статус' });
        }

        const statusId = statuses[0].id_status;

        await pool.execute(
            'UPDATE requests SET id_status = ?, admin_comment = ? WHERE id_request = ?',
            [statusId, admin_comment || null, id]
        );

        res.json({ message: 'Статус заявки обновлен' });
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        res.status(500).json({ message: 'Ошибка обновления статуса' });
    }
});

module.exports = router;
