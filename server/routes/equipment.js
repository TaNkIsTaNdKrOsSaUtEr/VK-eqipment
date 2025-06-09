const express = require('express');
const pool = require('../models/database');
const router = express.Router();

// Получить все снаряжение
router.get('/', async (req, res) => {
    try {
        console.log('Запрос списка снаряжения');
        
        const [equipment] = await pool.execute(`
            SELECT 
                e.id_equipment,
                e.name_equipment,
                e.description,
                e.quantity,
                e.available_quantity,
                e.condition_equipment,
                e.rental_price,
                e.image_url,
                et.name_type as type_name
            FROM equipment e
            JOIN equipment_types et ON e.id_type = et.id_type
            ORDER BY e.name_equipment
        `);

        console.log(`Найдено ${equipment.length} единиц снаряжения`);
        res.json(equipment);

    } catch (error) {
        console.error('Ошибка получения снаряжения:', error);
        res.status(500).json({ message: 'Ошибка загрузки снаряжения: ' + error.message });
    }
});

// Получить снаряжение по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [equipment] = await pool.execute(`
            SELECT 
                e.id_equipment,
                e.name_equipment,
                e.description,
                e.quantity,
                e.available_quantity,
                e.condition_equipment,
                e.rental_price,
                e.image_url,
                et.name_type as type_name,
                et.id_type
            FROM equipment e
            JOIN equipment_types et ON e.id_type = et.id_type
            WHERE e.id_equipment = ?
        `, [id]);

        if (equipment.length === 0) {
            return res.status(404).json({ message: 'Снаряжение не найдено' });
        }

        res.json(equipment[0]);

    } catch (error) {
        console.error('Ошибка получения снаряжения:', error);
        res.status(500).json({ message: 'Ошибка загрузки снаряжения: ' + error.message });
    }
});

// Получить типы снаряжения
router.get('/types/all', async (req, res) => {
    try {
        const [types] = await pool.execute(`
            SELECT id_type, name_type, description
            FROM equipment_types
            ORDER BY name_type
        `);

        res.json(types);

    } catch (error) {
        console.error('Ошибка получения типов снаряжения:', error);
        res.status(500).json({ message: 'Ошибка загрузки типов снаряжения: ' + error.message });
    }
});

module.exports = router;
