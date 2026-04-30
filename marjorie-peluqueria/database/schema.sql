-- Crear base de datos
CREATE DATABASE IF NOT EXISTS marjorie_peluqueria;
USE marjorie_peluqueria;

-- Tabla de usuarios (administradores)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol ENUM('admin', 'superadmin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NULL,
    direccion TEXT NULL,
    notas TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_telefono (telefono)
);

-- Tabla de tarjetas de fidelidad
CREATE TABLE IF NOT EXISTS tarjetas_fidelidad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    numero_tarjeta VARCHAR(20) UNIQUE NOT NULL,
    sellos INT DEFAULT 0,
    tipo_premio ENUM('servicio', 'producto', 'tratamiento') NOT NULL,
    premio_reclamado BOOLEAN DEFAULT FALSE,
    premio_reclamado_en TIMESTAMP NULL,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_numero (numero_tarjeta),
    INDEX idx_cliente (cliente_id)
);

-- Tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    categoria ENUM('peluqueria', 'unas', 'cejas', 'colorimetria', 'tratamientos') NOT NULL,
    descripcion TEXT,
    duracion_minutos INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NULL,
    nombre_cliente VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    servicio_id INT NOT NULL,
    servicio_nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'completada', 'cancelada') DEFAULT 'pendiente',
    notas TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado),
    INDEX idx_cliente (cliente_id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

-- Tabla de historial de actividad
CREATE TABLE IF NOT EXISTS historial (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NULL,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_fecha (created_at),
    INDEX idx_accion (accion)
);

-- Tabla de visitas (para sellos de fidelidad)
CREATE TABLE IF NOT EXISTS visitas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    reserva_id INT NULL,
    fecha DATE NOT NULL,
    servicio VARCHAR(100) NOT NULL,
    sello_otorgado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL,
    INDEX idx_cliente_fecha (cliente_id, fecha)
);

-- Insertar admin por defecto (contraseña: marjorie2024)
INSERT INTO usuarios (username, password_hash, nombre, email, rol) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.4lqZqZQR5gXqXqXqXqXqXqXqXq', 'Administrador', 'admin@marjorie.com', 'superadmin');

-- Insertar servicios predeterminados
INSERT INTO servicios (nombre, categoria, descripcion, duracion_minutos, precio) VALUES
('Corte Premium Dama', 'peluqueria', 'Corte personalizado con técnicas modernas', 45, 35.00),
('Peinado Profesional', 'peluqueria', 'Peinado para ocasiones especiales', 60, 45.00),
('Manicure Clásico', 'unas', 'Limado, cutículas y esmaltado', 40, 20.00),
('Uñas Acrílicas Premium', 'unas', 'Esculpidas con diseño personalizado', 90, 45.00),
('Diseño de Cejas', 'cejas', 'Diseño personalizado según tu rostro', 25, 18.00),
('Lifting de Pestañas', 'cejas', 'Elevación y curvatura natural', 60, 40.00),
('Color Global', 'colorimetria', 'Tinte profesional', 120, 65.00),
('Balayage Francés', 'colorimetria', 'Degradado natural luminoso', 180, 120.00),
('Botox Capilar', 'tratamientos', 'Tratamiento intensivo reparador', 90, 85.00);