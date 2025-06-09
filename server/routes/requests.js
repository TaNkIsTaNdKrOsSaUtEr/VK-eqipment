const express = require('express');
const pool = require('../models/database');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Токен доступа отсутствует' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Недействительный токен' });
        }
        req.user = user;
        next();
    });
};

// Получить заявки пользователя
router.get('/', authenticateToken, async (req, res) => {
    try {
        console.log('Запрос заявок пользователя:', req.user.userId);
        
        const [requests] = await pool.execute(`
            SELECT 
                r.id_request,
                r.request_date,
                r.start_date,
                r.end_date,
                r.purpose,
                r.total_price,
                r.admin_comment,
                rs.name_status as status_name
            FROM requests r
            JOIN request_statuses rs ON r.id_status = rs.id_status
            WHERE r.id_user = ?
            ORDER BY r.request_date DESC
        `, [req.user.userId]);

        console.log(`Найдено ${requests.length} заявок`);
        res.json(requests);

    } catch (error) {
        console.error('Ошибка получения заявок:', error);
        res.status(500).json({ message: 'Ошибка загрузки заявок: ' + error.message });
    }
});

// Создать новую заявку
router.post('/', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        console.log('Создание заявки:', req.body);
        
        const { date_from, date_to, purpose, items } = req.body;
        
        if (!date_from || !date_to || !items || items.length === 0) {
            console.log('Отсутствуют обязательные поля:', { date_from, date_to, items_length: items?.length });
            return res.status(400).json({ message: 'Заполните все обязательные поля' });
        }

        // Проверяем, что в items есть id_equipment
        const itemsWithoutId = items.filter(item => !item.id_equipment);
        if (itemsWithoutId.length > 0) {
            console.log('В заявке есть позиции без id_equipment:', itemsWithoutId);
            return res.status(400).json({ message: 'В заявке есть позиции без указания снаряжения' });
        }

        await connection.beginTransaction();

        // Проверяем доступность снаряжения
        for (const item of items) {
            const [equipment] = await connection.execute(
                'SELECT name_equipment, available_quantity, rental_price FROM equipment WHERE id_equipment = ?',
                [item.id_equipment]
            );

            if (equipment.length === 0) {
                throw new Error(`Снаряжение с ID ${item.id_equipment} не найдено`);
            }

            const requestedQuantity = item.quantity || 1;
            if (equipment[0].available_quantity < requestedQuantity) {
                throw new Error(`Недостаточно снаряжения: ${equipment[0].name_equipment}. Доступно: ${equipment[0].available_quantity}, запрошено: ${requestedQuantity}`);
            }
        }

        // Вычисляем общую стоимость
        let totalPrice = 0;
        const startDate = new Date(date_from);
        const endDate = new Date(date_to);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;

        console.log(`Период аренды: ${days} дней`);

        for (const item of items) {
            const [equipment] = await connection.execute(
                'SELECT rental_price FROM equipment WHERE id_equipment = ?',
                [item.id_equipment]
            );
            
            const quantity = item.quantity || 1;
            const itemPrice = equipment[0].rental_price * quantity * days;
            totalPrice += itemPrice;
            
            console.log(`Позиция: ID=${item.id_equipment}, кол-во=${quantity}, цена за день=${equipment[0].rental_price}, итого=${itemPrice}`);
        }

        console.log(`Общая стоимость: ${totalPrice}`);

        // Создаем заявку
        const [requestResult] = await connection.execute(
            'INSERT INTO requests (id_user, start_date, end_date, purpose, total_price, id_status) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.userId, date_from, date_to, purpose || '', totalPrice, 1] // статус "новая"
        );

        const requestId = requestResult.insertId;

        // Добавляем позиции заявки
        for (const item of items) {
            const [equipment] = await connection.execute(
                'SELECT rental_price FROM equipment WHERE id_equipment = ?',
                [item.id_equipment]
            );
            
            const quantity = item.quantity || 1;
            const pricePerItem = equipment[0].rental_price * days;
            const itemTotalPrice = pricePerItem * quantity;

            await connection.execute(
                'INSERT INTO request_items (id_request, id_equipment, quantity, price_per_item, total_price) VALUES (?, ?, ?, ?, ?)',
                [requestId, item.id_equipment, quantity, pricePerItem, itemTotalPrice]
            );

            // Уменьшаем доступное количество
            await connection.execute(
                'UPDATE equipment SET available_quantity = available_quantity - ? WHERE id_equipment = ?',
                [quantity, item.id_equipment]
            );
        }

        await connection.commit();

        console.log(`Заявка создана с ID: ${requestId}`);
        res.status(201).json({
            message: 'Заявка успешно создана',
            requestId: requestId,
            totalPrice: totalPrice
        });

    } catch (error) {
        await connection.rollback();
        console.error('Ошибка создания заявки:', error);
        res.status(500).json({ message: 'Ошибка создания заявки: ' + error.message });
    } finally {
        connection.release();
    }
});

// Получить детали заявки
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Получаем заявку
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
                u.fio as user_name
            FROM requests r
            JOIN request_statuses rs ON r.id_status = rs.id_status
            JOIN users u ON r.id_user = u.id_user
            WHERE r.id_request = ? AND (r.id_user = ? OR ? = 'admin')
        `, [id, req.user.userId, req.user.role]);

        if (requests.length === 0) {
            return res.status(404).json({ message: 'Заявка не найдена' });
        }

        // Получаем позиции заявки
        const [items] = await pool.execute(`
            SELECT 
                ri.quantity,
                ri.price_per_item,
                ri.total_price,
                e.name_equipment,
                e.description,
                et.name_type
            FROM request_items ri
            JOIN equipment e ON ri.id_equipment = e.id_equipment
            JOIN equipment_types et ON e.id_type = et.id_type
            WHERE ri.id_request = ?
        `, [id]);

        res.json({
            request: requests[0],
            items: items
        });

    } catch (error) {
        console.error('Ошибка получения заявки:', error);
        res.status(500).json({ message: 'Ошибка загрузки заявки: ' + error.message });
    }
});

module.exports = router;
