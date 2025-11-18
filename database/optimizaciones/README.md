# Scripts de Optimización de Base de Datos

## Descripción

Esta carpeta contiene scripts SQL para optimizar el rendimiento de la base de datos del sistema de videoteca.

## Scripts Disponibles

### 1. `01_indices_videos.sql` - Optimización de Índices

**Propósito:** Agregar índices compuestos para mejorar el rendimiento de queries frecuentes en la tabla `videos`.

**Índices que crea:**
- `idx_estado_fecha (estado, fecha_subida)` - Para listado principal de videos
- `idx_docente_estado (docente_id, estado)` - Para videos de un docente específico

**Impacto Estimado:** 30-50% mejora en tiempo de respuesta de queries de listado

**Cómo Ejecutar:**
```bash
mysql -u root -p videoteca < 01_indices_videos.sql
```

**O desde MySQL:**
```sql
source /path/to/01_indices_videos.sql;
```

### 2. `02_verificacion_archivos.sql` - Sistema de Verificación de Archivos

**Propósito:** Implementar sistema eficiente de verificación de existencia de archivos de video.

**Cambios que hace:**
- Agrega columna `archivo_verificado` (BOOLEAN)
- Agrega columna `ultima_verificacion` (TIMESTAMP)
- Crea índice `idx_archivo_verificado`
- Crea índice compuesto `idx_estado_verificado`
- Inicializa datos existentes

**Impacto Estimado:** 60-80% reducción en tiempo de ejecución de `Video::obtenerTodos()`

**Cómo Ejecutar:**
```bash
mysql -u root -p videoteca < 02_verificacion_archivos.sql
```

## Orden de Ejecución Recomendado

1. **Primero:** `01_indices_videos.sql` (mejora inmediata)
2. **Segundo:** `02_verificacion_archivos.sql` (requiere cambios en código PHP)

## Verificación Post-Instalación

### Verificar Índices Creados

```sql
USE videoteca;

-- Ver todos los índices en tabla videos
SHOW INDEX FROM videos;

-- Ver índices específicos
SELECT INDEX_NAME, COLUMN_NAME, SEQ_IN_INDEX
FROM information_schema.statistics
WHERE table_schema = 'videoteca'
  AND table_name = 'videos'
  AND index_name IN ('idx_estado_fecha', 'idx_docente_estado', 'idx_archivo_verificado', 'idx_estado_verificado');
```

### Verificar Columnas Agregadas

```sql
DESCRIBE videos;

-- Verificar columnas específicas
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM information_schema.columns
WHERE table_schema = 'videoteca'
  AND table_name = 'videos'
  AND COLUMN_NAME IN ('archivo_verificado', 'ultima_verificacion');
```

## Cambios Necesarios en Código PHP

### Después de ejecutar `02_verificacion_archivos.sql`

#### 1. Modificar `backend/models/Video.php`

**En el método `obtenerTodos()` (línea ~120):**

```php
// ANTES
$where = ['v.estado = "activo"'];

// DESPUÉS
$where = ['v.estado = "activo"', 'v.archivo_verificado = TRUE'];
```

**Eliminar el filtrado en PHP (líneas ~196-214):**

```php
// ELIMINAR ESTE BLOQUE:
// $config = require __DIR__ . '/../config/app.php';
// if ($config['video']['filter_orphans']) {
//     $videosExistentes = array_filter($videos, function($video) {
//         ...
//         return file_exists($rutaCompleta);
//     });
//     return array_values($videosExistentes);
// }

// REEMPLAZAR CON:
return $videos;  // El filtro ya se hace en SQL
```

#### 2. Crear Script de Verificación Periódica

**Archivo:** `backend/scripts/verificar_archivos_videos.php`

```php
<?php
/**
 * Script de Verificación de Archivos de Videos
 * Ejecutar periódicamente vía cron
 */

require_once __DIR__ . '/../config/database.php';

$database = Database::getInstance();
$conn = $database->getConnection();

// Videos que necesitan verificación (más de 1 hora sin verificar)
$query = "SELECT id, archivo_path
          FROM videos
          WHERE ultima_verificacion IS NULL
             OR ultima_verificacion < DATE_SUB(NOW(), INTERVAL 1 HOUR)
          LIMIT 1000";

$stmt = $conn->query($query);
$videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

$actualizados = 0;
$noEncontrados = 0;

foreach ($videos as $video) {
    $rutaCompleta = __DIR__ . '/../' . $video['archivo_path'];
    $existe = file_exists($rutaCompleta);

    $updateQuery = "UPDATE videos
                    SET archivo_verificado = :existe,
                        ultima_verificacion = NOW()
                    WHERE id = :id";

    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->execute([
        ':existe' => $existe ? 1 : 0,
        ':id' => $video['id']
    ]);

    $actualizados++;
    if (!$existe) {
        $noEncontrados++;
        error_log("Video ID {$video['id']} - Archivo no encontrado: {$rutaCompleta}");
    }
}

echo "✓ Verificación completada\n";
echo "  Videos verificados: $actualizados\n";
echo "  Archivos no encontrados: $noEncontrados\n";
```

#### 3. Configurar Cron

```bash
# Abrir crontab
crontab -e

# Agregar línea para ejecutar cada hora
0 * * * * cd /path/to/videotecasfx && php backend/scripts/verificar_archivos_videos.php >> /var/log/videoteca_verificacion.log 2>&1

# O ejecutar solo de noche (menos carga)
0 2 * * * cd /path/to/videotecasfx && php backend/scripts/verificar_archivos_videos.php >> /var/log/videoteca_verificacion.log 2>&1
```

## Pruebas de Rendimiento

### Antes de Optimizaciones

```sql
-- Medir tiempo de query principal
SET profiling = 1;

SELECT v.*, m.nombre as materia_nombre
FROM videos v
INNER JOIN materias m ON v.materia_id = m.id
WHERE v.estado = 'activo'
ORDER BY v.fecha_subida DESC
LIMIT 20;

SHOW PROFILES;
```

### Después de Optimizaciones

```sql
-- Verificar uso de índices
EXPLAIN SELECT v.*, m.nombre as materia_nombre
FROM videos v
INNER JOIN materias m ON v.materia_id = m.id
WHERE v.estado = 'activo'
  AND v.archivo_verificado = TRUE
ORDER BY v.fecha_subida DESC
LIMIT 20;

-- Debe mostrar:
-- key: idx_estado_fecha o idx_estado_verificado
```

## Monitoreo

### Estadísticas de Verificación

```sql
-- Ver videos no verificados
SELECT id, titulo, archivo_path, ultima_verificacion
FROM videos
WHERE archivo_verificado = FALSE
ORDER BY fecha_subida DESC;

-- Estadísticas generales
SELECT
    COUNT(*) as total_videos,
    SUM(CASE WHEN archivo_verificado THEN 1 ELSE 0 END) as verificados,
    SUM(CASE WHEN NOT archivo_verificado THEN 1 ELSE 0 END) as no_verificados,
    ROUND(SUM(CASE WHEN archivo_verificado THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as porcentaje_verificados
FROM videos;

-- Tiempo promedio desde última verificación
SELECT
    AVG(TIMESTAMPDIFF(HOUR, ultima_verificacion, NOW())) as promedio_horas,
    MIN(ultima_verificacion) as verificacion_mas_antigua,
    MAX(ultima_verificacion) as verificacion_mas_reciente
FROM videos
WHERE ultima_verificacion IS NOT NULL;
```

### Tamaño de Índices

```sql
-- Ver tamaño de índices
SELECT
    INDEX_NAME as 'Índice',
    ROUND(STAT_VALUE * @@innodb_page_size / 1024 / 1024, 2) as 'Tamaño (MB)'
FROM mysql.innodb_index_stats
WHERE database_name = 'videoteca'
  AND table_name = 'videos'
  AND stat_name = 'size'
ORDER BY STAT_VALUE DESC;
```

## Rollback (Deshacer Cambios)

Si necesitas revertir los cambios:

### Eliminar Índices

```sql
USE videoteca;

-- Eliminar índices del Script 01
ALTER TABLE videos DROP INDEX idx_estado_fecha;
ALTER TABLE videos DROP INDEX idx_docente_estado;

-- Eliminar índices del Script 02
ALTER TABLE videos DROP INDEX idx_archivo_verificado;
ALTER TABLE videos DROP INDEX idx_estado_verificado;
```

### Eliminar Columnas

```sql
-- Eliminar columnas del Script 02
ALTER TABLE videos
DROP COLUMN archivo_verificado,
DROP COLUMN ultima_verificacion;
```

## Soporte y Problemas

Si encuentras problemas durante la ejecución:

1. **Error de permisos:** Asegúrate de tener privilegios ALTER en la base de datos
2. **Índice ya existe:** Los scripts verifican existencia antes de crear
3. **Timeout:** Para tablas muy grandes, aumenta el timeout de MySQL

## Notas Importantes

- ⚠️ Hacer backup de la base de datos antes de ejecutar
- ✅ Los scripts son idempotentes (se pueden ejecutar múltiples veces)
- ✅ Verifican existencia antes de crear índices/columnas
- 📊 Incluyen reportes de análisis y verificación

---

**Creado por:** Roger Omar Luna Yujra
**Fecha:** 2025-01-18
**Versión:** 1.0
