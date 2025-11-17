-- =====================================================
-- Migración: Optimizar tablas de asignaciones
-- Fecha: 2025-11-17
-- Descripción: Consolidar docente_materias y docente_grados
--              en una única tabla asignaciones más flexible
-- =====================================================

-- 1. Crear nueva tabla asignaciones
CREATE TABLE IF NOT EXISTS asignaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    docente_id INT UNSIGNED NOT NULL,
    tipo ENUM('materia', 'grado') NOT NULL COMMENT 'Tipo de recurso asignado',
    recurso_id INT UNSIGNED NOT NULL COMMENT 'ID del recurso (materia_id o grado_id)',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INT UNSIGNED COMMENT 'Admin que realizó la asignación',

    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL,

    UNIQUE KEY unique_docente_tipo_recurso (docente_id, tipo, recurso_id),
    INDEX idx_docente (docente_id),
    INDEX idx_tipo (tipo),
    INDEX idx_recurso (recurso_id),
    INDEX idx_docente_tipo (docente_id, tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignaciones de materias y grados a docentes (tabla unificada)';

-- 2. Migrar datos de docente_materias a asignaciones
INSERT INTO asignaciones (docente_id, tipo, recurso_id, fecha_asignacion, asignado_por)
SELECT
    docente_id,
    'materia' as tipo,
    materia_id as recurso_id,
    fecha_asignacion,
    asignado_por
FROM docente_materias;

-- 3. Migrar datos de docente_grados a asignaciones
INSERT INTO asignaciones (docente_id, tipo, recurso_id, fecha_asignacion, asignado_por)
SELECT
    docente_id,
    'grado' as tipo,
    grado_id as recurso_id,
    fecha_asignacion,
    asignado_por
FROM docente_grados;

-- 4. Eliminar tablas antiguas
DROP TABLE IF EXISTS docente_materias;
DROP TABLE IF EXISTS docente_grados;

-- 5. Verificar migración
SELECT
    COUNT(*) as total_asignaciones,
    SUM(CASE WHEN tipo = 'materia' THEN 1 ELSE 0 END) as total_materias,
    SUM(CASE WHEN tipo = 'grado' THEN 1 ELSE 0 END) as total_grados
FROM asignaciones;
