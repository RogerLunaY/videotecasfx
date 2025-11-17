# Migración: Optimización de Tablas de Asignaciones

## Descripción

Esta migración optimiza la estructura de la base de datos consolidando las tablas `docente_materias` y `docente_grados` en una única tabla `asignaciones` más flexible y mantenible.

## Beneficios

- **Menos redundancia**: Un solo conjunto de lógica para todas las asignaciones
- **Más flexible**: Fácil agregar nuevos tipos de asignaciones en el futuro
- **Mejor rendimiento**: Menos JOINs complejos
- **Código más limpio**: Modelo simplificado en el backend

## Estructura Nueva

```sql
CREATE TABLE asignaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    docente_id INT UNSIGNED NOT NULL,
    tipo ENUM('materia', 'grado') NOT NULL,
    recurso_id INT UNSIGNED NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INT UNSIGNED,

    UNIQUE KEY (docente_id, tipo, recurso_id)
);
```

## Ejecución de la Migración

### Opción 1: Desde la línea de comandos MySQL

```bash
mysql -u tu_usuario -p videoteca_db < database/migrations/optimize_asignaciones.sql
```

### Opción 2: Desde phpMyAdmin

1. Abrir phpMyAdmin
2. Seleccionar la base de datos `videoteca_db`
3. Ir a la pestaña "SQL"
4. Copiar y pegar el contenido del archivo `optimize_asignaciones.sql`
5. Hacer clic en "Ejecutar"

### Opción 3: Desde PHP script (si la conexión está configurada)

```bash
php database/migrations/run_migration.php
```

## Verificación

Después de ejecutar la migración, verificar:

1. La tabla `asignaciones` existe y contiene todos los datos
2. Las tablas `docente_materias` y `docente_grados` han sido eliminadas
3. El modelo `DocenteAsignacion.php` v2.0 funciona correctamente

```sql
-- Verificar datos migrados
SELECT
    COUNT(*) as total,
    SUM(CASE WHEN tipo = 'materia' THEN 1 ELSE 0 END) as materias,
    SUM(CASE WHEN tipo = 'grado' THEN 1 ELSE 0 END) as grados
FROM asignaciones;

-- Verificar que las tablas antiguas no existen
SHOW TABLES LIKE 'docente_%';
```

## Rollback

Si necesitas revertir la migración (NO recomendado después de usar el sistema):

```sql
-- Recrear tablas antiguas
CREATE TABLE docente_materias AS
SELECT
    id,
    docente_id,
    recurso_id as materia_id,
    fecha_asignacion,
    asignado_por
FROM asignaciones
WHERE tipo = 'materia';

CREATE TABLE docente_grados AS
SELECT
    id,
    docente_id,
    recurso_id as grado_id,
    fecha_asignacion,
    asignado_por
FROM asignaciones
WHERE tipo = 'grado';

-- Restaurar constraints
ALTER TABLE docente_materias ADD UNIQUE KEY (docente_id, materia_id);
ALTER TABLE docente_grados ADD UNIQUE KEY (docente_id, grado_id);
```

## Archivos Modificados

- `database/schema.sql` - Actualizado con nueva estructura
- `database/migrations/optimize_asignaciones.sql` - Script de migración
- `backend/models/DocenteAsignacion.php` - Modelo v2.0 optimizado
- `backend/controllers/DocenteAsignacionController.php` - Sin cambios (compatible)

## Fecha

2025-11-17
