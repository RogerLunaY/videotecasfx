-- ==================================================
-- Optimizaciones de Índices - Tabla Videos
-- Sistema de Biblioteca Digital de Videos Educativos
-- U.E. San Francisco Xavier
-- ==================================================
--
-- Propósito: Mejorar el rendimiento de queries en la tabla videos
-- Fecha: 2025-01-18
-- Autor: Roger Omar Luna Yujra
--
-- Índices a crear:
-- 1. idx_estado_fecha: Para query principal de listado de videos
-- 2. idx_docente_estado: Para queries de videos por docente
--
-- Impacto Estimado: 30-50% mejora en queries de listado
-- ==================================================

USE videoteca;

-- ==================================================
-- 1. Índice Compuesto: estado + fecha_subida
-- ==================================================
-- Beneficia: Video::obtenerTodos() que filtra por estado y ordena por fecha_subida
-- Query típica: SELECT ... WHERE estado = 'activo' ORDER BY fecha_subida DESC

SELECT 'Creando índice idx_estado_fecha...' as status;

-- Verificar si el índice ya existe
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = 'videoteca'
      AND table_name = 'videos'
      AND index_name = 'idx_estado_fecha'
);

-- Crear índice solo si no existe
SET @sql = IF(
    @index_exists = 0,
    'ALTER TABLE videos ADD INDEX idx_estado_fecha (estado, fecha_subida)',
    'SELECT "Índice idx_estado_fecha ya existe" as info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar creación
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ Índice idx_estado_fecha creado/existe'
        ELSE '✗ Error: Índice idx_estado_fecha no existe'
    END as resultado
FROM information_schema.statistics
WHERE table_schema = 'videoteca'
  AND table_name = 'videos'
  AND index_name = 'idx_estado_fecha';

-- ==================================================
-- 2. Índice Compuesto: docente_id + estado
-- ==================================================
-- Beneficia: Queries de videos de un docente específico filtrados por estado
-- Query típica: SELECT ... WHERE docente_id = ? AND estado = 'activo'

SELECT 'Creando índice idx_docente_estado...' as status;

-- Verificar si el índice ya existe
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = 'videoteca'
      AND table_name = 'videos'
      AND index_name = 'idx_docente_estado'
);

-- Crear índice solo si no existe
SET @sql = IF(
    @index_exists = 0,
    'ALTER TABLE videos ADD INDEX idx_docente_estado (docente_id, estado)',
    'SELECT "Índice idx_docente_estado ya existe" as info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar creación
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ Índice idx_docente_estado creado/existe'
        ELSE '✗ Error: Índice idx_docente_estado no existe'
    END as resultado
FROM information_schema.statistics
WHERE table_schema = 'videoteca'
  AND table_name = 'videos'
  AND index_name = 'idx_docente_estado';

-- ==================================================
-- 3. Análisis de Índices
-- ==================================================

SELECT 'Análisis de índices en tabla videos:' as info;

-- Mostrar todos los índices actuales
SELECT
    INDEX_NAME as 'Índice',
    COLUMN_NAME as 'Columna',
    SEQ_IN_INDEX as 'Posición',
    CARDINALITY as 'Cardinalidad',
    INDEX_TYPE as 'Tipo'
FROM information_schema.statistics
WHERE table_schema = 'videoteca'
  AND table_name = 'videos'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- ==================================================
-- 4. Estadísticas de la Tabla
-- ==================================================

SELECT 'Estadísticas de tabla videos:' as info;

SELECT
    TABLE_ROWS as 'Total Registros',
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as 'Tamaño Total (MB)',
    ROUND(DATA_LENGTH / 1024 / 1024, 2) as 'Datos (MB)',
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) as 'Índices (MB)',
    ROUND(INDEX_LENGTH / DATA_LENGTH * 100, 2) as 'Ratio Índices/Datos (%)'
FROM information_schema.tables
WHERE table_schema = 'videoteca'
  AND table_name = 'videos';

-- ==================================================
-- 5. Recomendaciones
-- ==================================================

SELECT '
RECOMENDACIONES POST-OPTIMIZACIÓN:

1. MONITOREAR RENDIMIENTO:
   - Ejecutar queries de listado y medir tiempo de respuesta
   - Comparar con tiempos anteriores
   - Esperado: 30-50% mejora

2. ANALIZAR QUERIES:
   - Usar EXPLAIN en queries frecuentes
   - Verificar que se usen los nuevos índices
   - Ejemplo: EXPLAIN SELECT * FROM videos WHERE estado = "activo" ORDER BY fecha_subida DESC LIMIT 20

3. MANTENIMIENTO:
   - Ejecutar OPTIMIZE TABLE videos mensualmente
   - Actualizar estadísticas: ANALYZE TABLE videos

4. PRÓXIMOS PASOS:
   - Implementar columna archivo_verificado (Script 02)
   - Considerar caché para estadísticas frecuentes

' as recomendaciones;

-- ==================================================
-- Fin del Script
-- ==================================================

SELECT '✓ Script de optimización completado exitosamente' as status;
