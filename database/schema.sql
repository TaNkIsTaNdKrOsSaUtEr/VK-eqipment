-- Создание базы данных
CREATE DATABASE IF NOT EXISTS vk_equipment_db;
USE vk_equipment_db;

-- Таблица ролей
CREATE TABLE IF NOT EXISTS roles (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    name_role VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    fio VARCHAR(255) NOT NULL,
    vk_id BIGINT NOT NULL UNIQUE,
    address TEXT,
    password VARCHAR(255) NOT NULL,
    id_role INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_role) REFERENCES roles(id_role) ON DELETE RESTRICT
);

-- Таблица типов снаряжения
CREATE TABLE IF NOT EXISTS equipment_types (
    id_type INT AUTO_INCREMENT PRIMARY KEY,
    name_type VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица снаряжения
CREATE TABLE IF NOT EXISTS equipment (
    id_equipment INT AUTO_INCREMENT PRIMARY KEY,
    name_equipment VARCHAR(255) NOT NULL,
    description TEXT,
    id_type INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    available_quantity INT NOT NULL DEFAULT 0,
    condition_equipment ENUM('отличное', 'хорошее', 'удовлетворительное', 'требует ремонта') DEFAULT 'хорошее',
    rental_price DECIMAL(10,2) DEFAULT 0.00,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_type) REFERENCES equipment_types(id_type) ON DELETE RESTRICT
);

-- Таблица статусов заявок
CREATE TABLE IF NOT EXISTS request_statuses (
    id_status INT AUTO_INCREMENT PRIMARY KEY,
    name_status VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заявок
CREATE TABLE IF NOT EXISTS requests (
    id_request INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    purpose TEXT,
    id_status INT NOT NULL DEFAULT 1,
    admin_comment TEXT,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_status) REFERENCES request_statuses(id_status) ON DELETE RESTRICT
);

-- Таблица позиций заявок
CREATE TABLE IF NOT EXISTS request_items (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_request INT NOT NULL,
    id_equipment INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_per_item DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_request) REFERENCES requests(id_request) ON DELETE CASCADE,
    FOREIGN KEY (id_equipment) REFERENCES equipment(id_equipment) ON DELETE RESTRICT,
    UNIQUE KEY unique_request_equipment (id_request, id_equipment)
);

-- Вставка базовых данных
INSERT IGNORE INTO roles (name_role) VALUES 
('admin'), 
('user');

INSERT IGNORE INTO request_statuses (name_status, description) VALUES 
('новая', 'Заявка создана, ожидает рассмотрения'),
('на рассмотрении', 'Заявка рассматривается администратором'),
('одобрена', 'Заявка одобрена, ожидает выдачи'),
('выдана', 'Снаряжение выдано пользователю'),
('возвращена', 'Снаряжение возвращено'),
('отклонена', 'Заявка отклонена администратором'),
('просрочена', 'Срок возврата просрочен');

INSERT IGNORE INTO equipment_types (name_type, description) VALUES 
('Палатки', 'Туристические палатки различной вместимости'),
('Спальные мешки', 'Спальные мешки для различных температурных условий'),
('Рюкзаки', 'Туристические рюкзаки различного объема'),
('Горелки и посуда', 'Газовые горелки, котелки, посуда для похода'),
('Альпинистское снаряжение', 'Веревки, карабины, страховочные системы'),
('Одежда и обувь', 'Специализированная туристическая одежда и обувь'),
('Инструменты', 'Топоры, пилы, ножи и другие инструменты'),
('Электроника', 'Фонари, рации, GPS-навигаторы');

-- Создание администратора по умолчанию
INSERT IGNORE INTO users (fio, vk_id, password, id_role, address) VALUES 
('Администратор системы', 123456789, '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'Системный администратор');

-- Примеры снаряжения
INSERT IGNORE INTO equipment (name_equipment, description, id_type, quantity, available_quantity, condition_equipment, rental_price) VALUES 
('Палатка 2-местная "Турист"', 'Двухместная палатка для летнего туризма', 1, 5, 5, 'отличное', 200.00),
('Палатка 4-местная "Семейная"', 'Четырехместная палатка с тамбуром', 1, 3, 3, 'хорошее', 350.00),
('Спальник летний', 'Спальный мешок для температуры до +5°C', 2, 10, 10, 'хорошее', 150.00),
('Спальник зимний', 'Спальный мешок для температуры до -15°C', 2, 5, 5, 'отличное', 300.00),
('Рюкзак 60л', 'Туристический рюкзак объемом 60 литров', 3, 8, 8, 'хорошее', 100.00),
('Рюкзак 80л', 'Туристический рюкзак объемом 80 литров', 3, 4, 4, 'отличное', 150.00),
('Газовая горелка', 'Портативная газовая горелка с баллоном', 4, 6, 6, 'отличное', 80.00),
('Котелок 2л', 'Алюминиевый котелок объемом 2 литра', 4, 8, 8, 'хорошее', 50.00);
