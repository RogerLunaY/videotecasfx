-- =====================================================
-- Script: Verificar y Migrar a Tabla Asignaciones
-- Ejecutar este script para migrar de forma segura
-- =====================================================

-- PASO 1: Verificar estado actual
SELECT 'PASO 1: Verificando tablas existentes...' AS status;

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN 'EXISTE'
        ELSE 'NO EXISTE'
    END AS tabla_asignaciones
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'asignaciones';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN 'EXISTE'
        ELSE 'NO EXISTE'
    END AS tabla_docente_materias
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'docente_materias';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN 'EXISTE'
        ELSE 'NO EXISTE'
    END AS tabla_docente_grados
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name = 'docente_grados';

-- PASO 2: Contar registros en tablas antiguas (si existen)
SELECT 'PASO 2: Contando registros en tablas antiguas...' AS status;

SELECT COUNT(*) AS total_materias_asignadas
FROM docente_materias;

SELECT COUNT(*) AS total_grados_asignados
FROM docente_grados;

-- PASO 3: Crear tabla asignaciones
SELECT 'PASO 3: Creando tabla asignaciones...' AS status;

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

SELECT 'Tabla asignaciones creada exitosamente' AS resultado;

-- PASO 4: Migrar datos de docente_materias
SELECT 'PASO 4: Migrando materias asignadas...' AS status;

INSERT IGNORE INTO asignaciones (docente_id, tipo, recurso_id, fecha_asignacion, asignado_por)
SELECT
    docente_id,
    'materia' as tipo,
    materia_id as recurso_id,
    fecha_asignacion,
    asignado_por
FROM docente_materias;

SELECT ROW_COUNT() AS materias_migradas;

-- PASO 5: Migrar datos de docente_grados
SELECT 'PASO 5: Migrando grados asignados...' AS status;

INSERT IGNORE INTO asignaciones (docente_id, tipo, recurso_id, fecha_asignacion, asignado_por)
SELECT
    docente_id,
    'grado' as tipo,
    grado_id as recurso_id,
    fecha_asignacion,
    asignado_por
FROM docente_grados;

SELECT ROW_COUNT() AS grados_migrados;

-- PASO 6: Verificar migración
SELECT 'PASO 6: Verificando datos migrados...' AS status;

SELECT
    COUNT(*) as total_asignaciones,
    SUM(CASE WHEN tipo = 'materia' THEN 1 ELSE 0 END) as total_materias,
    SUM(CASE WHEN tipo = 'grado' THEN 1 ELSE 0 END) as total_grados
FROM asignaciones;

-- PASO 7: Eliminar tablas antiguas (COMENTADO POR SEGURIDAD)
SELECT 'PASO 7: Las tablas antiguas se mantienen por seguridad' AS status;
SELECT 'Si todo funciona correctamente, ejecuta manualmente:' AS instruccion;
SELECT 'DROP TABLE docente_materias; DROP TABLE docente_grados;' AS comando;

/*
-- Descomentar las siguientes líneas SOLO si estás seguro de eliminar las tablas antiguas:
DROP TABLE IF EXISTS docente_materias;
DROP TABLE IF EXISTS docente_grados;
*/

-- PASO 8: Resultado final
SELECT 'MIGRACIÓN COMPLETADA EXITOSAMENTE' AS resultado;
SELECT 'Las tablas antiguas se mantienen como respaldo' AS nota;
SELECT 'Prueba el sistema antes de eliminarlas' AS recomendacion;
