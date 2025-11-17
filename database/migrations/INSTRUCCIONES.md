# 🔄 Migración a Tabla Asignaciones Unificada

## ⚠️ PROBLEMA ACTUAL

El código backend está configurado para usar la tabla `asignaciones`, pero **esta tabla aún NO existe en tu base de datos**.

```
❌ Error: Table 'asignaciones' doesn't exist
```

## ✅ SOLUCIÓN: Ejecutar Migración

### Opción 1: Script de Verificación y Migración (RECOMENDADO)

Este script es **seguro** y muestra cada paso:

1. Abre **phpMyAdmin**
2. Selecciona tu base de datos
3. Ve a la pestaña **SQL**
4. Copia y pega el contenido completo de: `verificar_y_migrar.sql`
5. Haz clic en **Ejecutar**

El script hará:
- ✅ Crear tabla `asignaciones`
- ✅ Migrar todos los datos de `docente_materias` → `asignaciones` (tipo='materia')
- ✅ Migrar todos los datos de `docente_grados` → `asignaciones` (tipo='grado')
- ✅ Mantener las tablas antiguas como respaldo
- ✅ Mostrar estadísticas de la migración

### Opción 2: Migración Completa (Elimina tablas antiguas)

Si estás seguro y quieres eliminar las tablas antiguas inmediatamente:

1. Abre **phpMyAdmin**
2. Selecciona tu base de datos
3. Ve a la pestaña **SQL**
4. Copia y pega el contenido de: `optimize_asignaciones.sql`
5. Haz clic en **Ejecutar**

### Opción 3: Desde Terminal MySQL

```bash
# Opción segura (mantiene respaldo)
mysql -u usuario -p nombre_bd < verificar_y_migrar.sql

# O migración completa
mysql -u usuario -p nombre_bd < optimize_asignaciones.sql
```

## 📊 Después de la Migración

Verifica que funcionó ejecutando:

```sql
-- Ver estructura de la nueva tabla
DESCRIBE asignaciones;

-- Contar registros migrados
SELECT
    COUNT(*) as total,
    SUM(CASE WHEN tipo = 'materia' THEN 1 ELSE 0 END) as materias,
    SUM(CASE WHEN tipo = 'grado' THEN 1 ELSE 0 END) as grados
FROM asignaciones;
```

## 🎯 Estado del Sistema

| Componente | Estado | Comentario |
|------------|--------|------------|
| Frontend | ✅ | Listo para usar tabla `asignaciones` |
| Backend - Modelo | ✅ | Ya usa tabla `asignaciones` |
| Backend - Controlador | ✅ | Compatible |
| **Base de Datos** | ❌ | **FALTA EJECUTAR MIGRACIÓN** |

## ⚡ Una vez ejecutada la migración

- ✅ RegisterPage funcionará correctamente
- ✅ EditUsuarioPage funcionará correctamente
- ✅ Todas las asignaciones se guardarán en la tabla unificada
- ✅ No necesitas cambiar nada más en el código

## 🆘 Si tienes problemas

1. Verifica que estás conectado a la base de datos correcta
2. Asegúrate de tener permisos de CREATE TABLE y DROP TABLE
3. Revisa los logs de MySQL para ver el error específico
4. Las tablas antiguas se mantienen como respaldo por si algo falla
