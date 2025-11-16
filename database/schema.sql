-- =====================================================
-- Sistema de Biblioteca Digital de Videos Educativos
-- Unidad Educativa San Francisco Xavier
-- Estudiante: Roger Omar Luna Yujra (CI: 6734278 LP)
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS videoteca_sfx
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE videoteca_sfx;

-- =====================================================
-- TABLA: roles
-- Descripción: Define los roles del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    permisos JSON NOT NULL COMMENT 'Permisos en formato JSON',
    descripcion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: grados
-- Descripción: Niveles educativos de secundaria
-- =====================================================
CREATE TABLE IF NOT EXISTS grados (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nivel INT NOT NULL COMMENT 'Número del grado (1-6 para secundaria)',
    sigla VARCHAR(10),
    descripcion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    orden INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nivel (nivel),
    INDEX idx_nivel (nivel),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: materias
-- Descripción: Asignaturas del currículo educativo
-- =====================================================
CREATE TABLE IF NOT EXISTS materias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    sigla VARCHAR(20) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) COMMENT 'Color en hexadecimal para UI',
    icono VARCHAR(50) COMMENT 'Nombre del icono para UI',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_sigla (sigla),
    INDEX idx_nombre (nombre),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: temas
-- Descripción: Temas específicos dentro de cada materia
-- =====================================================
CREATE TABLE IF NOT EXISTS temas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    nombre_corto VARCHAR(100),
    descripcion TEXT,
    materia_id INT UNSIGNED,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    orden INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    INDEX idx_materia (materia_id),
    INDEX idx_nombre (nombre),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: usuarios
-- Descripción: Administradores y docentes del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    ci VARCHAR(20) NOT NULL UNIQUE COMMENT 'Cédula de identidad',
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT UNSIGNED NOT NULL,
    grado_id INT UNSIGNED COMMENT 'Grado asignado al docente',
    materia_id INT UNSIGNED COMMENT 'Materia que enseña el docente',
    telefono VARCHAR(20),
    foto_perfil VARCHAR(255),
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    ultimo_acceso TIMESTAMP NULL,
    intentos_login INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_ci (ci),
    INDEX idx_rol (rol_id),
    INDEX idx_estado (estado),
    INDEX idx_grado (grado_id),
    INDEX idx_materia (materia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: videos
-- Descripción: Catálogo de videos educativos
-- =====================================================
CREATE TABLE IF NOT EXISTS videos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    archivo_path VARCHAR(500) NOT NULL COMMENT 'Ruta del archivo de video',
    archivo_nombre VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo',
    thumbnail_path VARCHAR(500) COMMENT 'Ruta de la miniatura',
    duracion INT COMMENT 'Duración en segundos',
    tamanio BIGINT COMMENT 'Tamaño en bytes',
    formato VARCHAR(20) COMMENT 'Formato del video (mp4, webm, etc)',
    resolucion VARCHAR(20) COMMENT 'Resolución del video (720p, 1080p, etc)',
    codec VARCHAR(50) COMMENT 'Codec utilizado',
    tema_id INT UNSIGNED,
    materia_id INT UNSIGNED NOT NULL,
    grado_id INT UNSIGNED NOT NULL,
    docente_id INT UNSIGNED NOT NULL,
    visualizaciones INT UNSIGNED DEFAULT 0,
    estado ENUM('activo', 'inactivo', 'procesando', 'error') DEFAULT 'procesando',
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE RESTRICT,
    FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE RESTRICT,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_titulo (titulo),
    INDEX idx_materia (materia_id),
    INDEX idx_grado (grado_id),
    INDEX idx_tema (tema_id),
    INDEX idx_docente (docente_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_subida (fecha_subida),
    INDEX idx_visualizaciones (visualizaciones),
    FULLTEXT INDEX ft_titulo_descripcion (titulo, descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: reproducciones
-- Descripción: Registro de reproducciones de videos
-- =====================================================
CREATE TABLE IF NOT EXISTS reproducciones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    video_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED COMMENT 'NULL para estudiantes anónimos',
    ip_address VARCHAR(45),
    user_agent TEXT,
    tiempo_reproducido INT COMMENT 'Tiempo reproducido en segundos',
    porcentaje_visto DECIMAL(5,2) COMMENT 'Porcentaje del video visto',
    completado BOOLEAN DEFAULT FALSE,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NULL,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_video (video_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_completado (completado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: estadisticas
-- Descripción: Estadísticas agregadas del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS estadisticas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('diaria', 'semanal', 'mensual', 'anual', 'general') NOT NULL,
    categoria VARCHAR(50) NOT NULL COMMENT 'videos, usuarios, reproducciones, etc',
    datos_json JSON NOT NULL COMMENT 'Datos estadísticos en formato JSON',
    fecha_referencia DATE NOT NULL COMMENT 'Fecha a la que corresponden las estadísticas',
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tipo_fecha (tipo, fecha_referencia),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: logs_sistema
-- Descripción: Registro de eventos y acciones del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS logs_sistema (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED,
    nivel ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    entidad VARCHAR(50) COMMENT 'Tipo de entidad afectada (video, usuario, etc)',
    entidad_id INT UNSIGNED COMMENT 'ID de la entidad afectada',
    ip VARCHAR(45),
    user_agent TEXT,
    datos_adicionales JSON COMMENT 'Información adicional en formato JSON',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_nivel (nivel),
    INDEX idx_accion (accion),
    INDEX idx_fecha (fecha),
    INDEX idx_entidad (entidad, entidad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: tokens_refresh
-- Descripción: Tokens de refresco para autenticación JWT
-- =====================================================
CREATE TABLE IF NOT EXISTS tokens_refresh (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(45),
    user_agent TEXT,
    expira_en TIMESTAMP NOT NULL,
    revocado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_token (token_hash),
    INDEX idx_expira (expira_en),
    INDEX idx_revocado (revocado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Incrementar visualizaciones al registrar reproducción
DELIMITER $$
CREATE TRIGGER after_reproduccion_insert
AFTER INSERT ON reproducciones
FOR EACH ROW
BEGIN
    UPDATE videos
    SET visualizaciones = visualizaciones + 1
    WHERE id = NEW.video_id;
END$$
DELIMITER ;

-- Trigger: Registrar log al crear usuario
DELIMITER $$
CREATE TRIGGER after_usuario_insert
AFTER INSERT ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (usuario_id, nivel, accion, descripcion, entidad, entidad_id)
    VALUES (NEW.id, 'info', 'usuario_creado',
            CONCAT('Usuario creado: ', NEW.nombre, ' ', NEW.apellido_paterno),
            'usuario', NEW.id);
END$$
DELIMITER ;

-- Trigger: Registrar log al crear video
DELIMITER $$
CREATE TRIGGER after_video_insert
AFTER INSERT ON videos
FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (usuario_id, nivel, accion, descripcion, entidad, entidad_id)
    VALUES (NEW.docente_id, 'info', 'video_subido',
            CONCAT('Video subido: ', NEW.titulo),
            'video', NEW.id);
END$$
DELIMITER ;

-- Trigger: Registrar log al eliminar video
DELIMITER $$
CREATE TRIGGER before_video_delete
BEFORE DELETE ON videos
FOR EACH ROW
BEGIN
    INSERT INTO logs_sistema (usuario_id, nivel, accion, descripcion, entidad, entidad_id)
    VALUES (OLD.docente_id, 'warning', 'video_eliminado',
            CONCAT('Video eliminado: ', OLD.titulo),
            'video', OLD.id);
END$$
DELIMITER ;

-- =====================================================
-- VISTAS
-- =====================================================

-- Vista: Videos con información completa
CREATE OR REPLACE VIEW vista_videos_completos AS
SELECT
    v.id,
    v.titulo,
    v.descripcion,
    v.archivo_path,
    v.thumbnail_path,
    v.duracion,
    v.tamanio,
    v.formato,
    v.resolucion,
    v.visualizaciones,
    v.estado,
    v.fecha_subida,
    m.nombre AS materia_nombre,
    m.sigla AS materia_sigla,
    m.color AS materia_color,
    g.nombre AS grado_nombre,
    g.nivel AS grado_nivel,
    t.nombre AS tema_nombre,
    t.nombre_corto AS tema_corto,
    CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) AS docente_nombre,
    u.email AS docente_email
FROM videos v
INNER JOIN materias m ON v.materia_id = m.id
INNER JOIN grados g ON v.grado_id = g.id
LEFT JOIN temas t ON v.tema_id = t.id
INNER JOIN usuarios u ON v.docente_id = u.id;

-- Vista: Estadísticas de videos por materia
CREATE OR REPLACE VIEW vista_stats_por_materia AS
SELECT
    m.id,
    m.nombre AS materia,
    m.sigla,
    COUNT(DISTINCT v.id) AS total_videos,
    IFNULL(SUM(v.visualizaciones), 0) AS total_visualizaciones,
    IFNULL(AVG(v.visualizaciones), 0) AS promedio_visualizaciones,
    COUNT(DISTINCT v.docente_id) AS total_docentes
FROM materias m
LEFT JOIN videos v ON m.id = v.materia_id AND v.estado = 'activo'
GROUP BY m.id, m.nombre, m.sigla;

-- Vista: Estadísticas de videos por grado
CREATE OR REPLACE VIEW vista_stats_por_grado AS
SELECT
    g.id,
    g.nombre AS grado,
    g.nivel,
    COUNT(DISTINCT v.id) AS total_videos,
    IFNULL(SUM(v.visualizaciones), 0) AS total_visualizaciones,
    IFNULL(AVG(v.visualizaciones), 0) AS promedio_visualizaciones
FROM grados g
LEFT JOIN videos v ON g.id = v.grado_id AND v.estado = 'activo'
GROUP BY g.id, g.nombre, g.nivel;

-- Vista: Videos más populares
CREATE OR REPLACE VIEW vista_videos_populares AS
SELECT
    v.id,
    v.titulo,
    v.visualizaciones,
    m.nombre AS materia,
    g.nombre AS grado,
    CONCAT(u.nombre, ' ', u.apellido_paterno) AS docente,
    v.fecha_subida
FROM videos v
INNER JOIN materias m ON v.materia_id = m.id
INNER JOIN grados g ON v.grado_id = g.id
INNER JOIN usuarios u ON v.docente_id = u.id
WHERE v.estado = 'activo'
ORDER BY v.visualizaciones DESC
LIMIT 10;

-- Vista: Actividad reciente del sistema
CREATE OR REPLACE VIEW vista_actividad_reciente AS
SELECT
    l.id,
    l.nivel,
    l.accion,
    l.descripcion,
    CONCAT(u.nombre, ' ', u.apellido_paterno) AS usuario,
    l.fecha
FROM logs_sistema l
LEFT JOIN usuarios u ON l.usuario_id = u.id
ORDER BY l.fecha DESC
LIMIT 50;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento: Obtener estadísticas generales
DELIMITER $$
CREATE PROCEDURE sp_estadisticas_generales()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM usuarios WHERE estado = 'activo') AS total_usuarios_activos,
        (SELECT COUNT(*) FROM videos WHERE estado = 'activo') AS total_videos_activos,
        (SELECT COUNT(*) FROM reproducciones) AS total_reproducciones,
        (SELECT SUM(visualizaciones) FROM videos) AS total_visualizaciones,
        (SELECT COUNT(*) FROM materias WHERE estado = 'activo') AS total_materias,
        (SELECT COUNT(*) FROM grados WHERE estado = 'activo') AS total_grados;
END$$
DELIMITER ;

-- Procedimiento: Limpiar tokens expirados
DELIMITER $$
CREATE PROCEDURE sp_limpiar_tokens_expirados()
BEGIN
    DELETE FROM tokens_refresh
    WHERE expira_en < NOW() OR revocado = TRUE;

    SELECT ROW_COUNT() AS tokens_eliminados;
END$$
DELIMITER ;

-- Procedimiento: Obtener videos por filtros
DELIMITER $$
CREATE PROCEDURE sp_buscar_videos(
    IN p_materia_id INT,
    IN p_grado_id INT,
    IN p_tema_id INT,
    IN p_busqueda VARCHAR(255),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT * FROM vista_videos_completos
    WHERE
        (p_materia_id IS NULL OR materia_id = p_materia_id) AND
        (p_grado_id IS NULL OR grado_id = p_grado_id) AND
        (p_tema_id IS NULL OR tema_id = p_tema_id) AND
        (p_busqueda IS NULL OR titulo LIKE CONCAT('%', p_busqueda, '%')
         OR descripcion LIKE CONCAT('%', p_busqueda, '%'))
        AND estado = 'activo'
    ORDER BY fecha_subida DESC
    LIMIT p_limit OFFSET p_offset;
END$$
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX idx_video_materia_grado_estado ON videos(materia_id, grado_id, estado);
CREATE INDEX idx_reproduccion_video_fecha ON reproducciones(video_id, fecha_inicio);

-- =====================================================
-- EVENTOS PROGRAMADOS
-- =====================================================

-- Habilitar el programador de eventos
SET GLOBAL event_scheduler = ON;

-- Evento: Limpiar tokens expirados diariamente
DELIMITER $$
CREATE EVENT IF NOT EXISTS evento_limpiar_tokens
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    CALL sp_limpiar_tokens_expirados();
END$$
DELIMITER ;

-- Evento: Generar estadísticas diarias
DELIMITER $$
CREATE EVENT IF NOT EXISTS evento_estadisticas_diarias
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 HOUR
DO
BEGIN
    INSERT INTO estadisticas (tipo, categoria, datos_json, fecha_referencia)
    SELECT
        'diaria',
        'resumen',
        JSON_OBJECT(
            'videos_subidos', COUNT(DISTINCT v.id),
            'reproducciones', COUNT(r.id),
            'usuarios_activos', COUNT(DISTINCT l.usuario_id)
        ),
        CURDATE() - INTERVAL 1 DAY
    FROM videos v
    LEFT JOIN reproducciones r ON r.video_id = v.id
        AND DATE(r.fecha_inicio) = CURDATE() - INTERVAL 1 DAY
    LEFT JOIN logs_sistema l ON DATE(l.fecha) = CURDATE() - INTERVAL 1 DAY;
END$$
DELIMITER ;
