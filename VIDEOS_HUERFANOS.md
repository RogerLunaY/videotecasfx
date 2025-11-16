# Manejo de Videos Huérfanos

## ¿Qué son los Videos Huérfanos?

Videos huérfanos son registros en la base de datos que **ya no tienen su archivo físico** en el servidor. Esto puede suceder cuando:

1. Se elimina manualmente un archivo del directorio `uploads/videos/`
2. Hay errores durante la subida que crean el registro pero no guardan el archivo
3. Se restaura un backup de la base de datos pero no de los archivos
4. Se mueven o renombran archivos manualmente

## Solución Implementada

### 🔍 Detección Automática

El sistema ahora **verifica automáticamente** la existencia de archivos antes de mostrar videos en cualquier listado:

- ✅ Solo se muestran videos cuyo archivo existe físicamente
- ✅ Los videos sin archivo son ocultados automáticamente
- ✅ No requiere intervención manual para ocultar videos

### 📋 Métodos Afectados

Los siguientes métodos del modelo `Video` ahora filtran videos sin archivo:

1. **`obtenerTodos()`** - Listado general de videos
2. **`obtenerPorId()`** - Video individual (retorna `false` si no existe el archivo)
3. **`obtenerMasPopulares()`** - Videos más vistos
4. **`obtenerRecientes()`** - Videos recientes (usa `obtenerTodos()`)
5. **`buscar()`** - Búsqueda de videos

### 🛠️ Herramienta de Limpieza

Se ha creado un script de utilidad para marcar videos huérfanos en la base de datos:

```bash
# Ejecutar desde la raíz del proyecto
cd backend
php utils/limpiar_videos_huerfanos.php
```

**¿Qué hace?**
- Revisa todos los videos con estado `activo`
- Verifica si su archivo físico existe
- Marca como `error` los que no tienen archivo
- Registra cada cambio en los logs

**Ejemplo de salida:**
```
=== LIMPIEZA DE VIDEOS HUÉRFANOS ===
Fecha: 2025-11-16 14:30:00

Buscando videos sin archivo físico...

✓ Se marcaron 3 video(s) como 'error' (archivo no encontrado)

Estos videos ya no se mostrarán en el listado público.
Puedes revisarlos en el panel de administración.

=== PROCESO COMPLETADO ===
```

## Flujo de Funcionamiento

### Antes (Problema)

```
1. Usuario sube video → Registro BD + Archivo guardado ✓
2. Alguien elimina archivo manualmente
3. Video sigue apareciendo en listados ❌
4. Al intentar reproducir: Error 404 ❌
```

### Ahora (Solución)

```
1. Usuario sube video → Registro BD + Archivo guardado ✓
2. Alguien elimina archivo manualmente
3. Sistema detecta que archivo no existe
4. Video NO aparece en listados ✓
5. Si acceden directamente: Error 404 (pero registrado en logs) ✓
```

## Verificación Manual

### Listar Videos en Base de Datos

```bash
# Conectar a MySQL
mysql -u usuario -p nombre_bd

# Ver videos activos
SELECT id, titulo, archivo_path, estado
FROM videos
WHERE estado = 'activo'
ORDER BY id DESC
LIMIT 10;
```

### Verificar Archivos Físicos

```bash
# Listar archivos en directorio
ls -lh backend/uploads/videos/

# Contar archivos
ls -1 backend/uploads/videos/ | wc -l

# Buscar un archivo específico
find backend/uploads/videos/ -name "nombre_archivo.mp4"
```

### Verificar Logs

```bash
# Ver logs de videos marcados como huérfanos
tail -f backend/logs/app.log | grep "marcarVideosHuerfanos"

# Ver logs de videos no encontrados al acceder
tail -f backend/logs/app.log | grep "Archivo no encontrado"
```

## Prevención de Videos Huérfanos

### ✅ Buenas Prácticas

1. **Nunca eliminar archivos manualmente** del directorio `uploads/videos/`
2. **Usar siempre la API** para eliminar videos (elimina registro + archivo)
3. **Hacer backups completos** (base de datos + archivos)
4. **Restaurar ambos** al recuperar de un backup

### 🔧 API para Eliminar Videos Correctamente

```bash
# Eliminar video usando la API (elimina registro Y archivo)
curl -X DELETE \
  -H "Authorization: Bearer TOKEN" \
  http://videotecasfx.test/api/videos/123
```

### 📅 Mantenimiento Periódico

Se recomienda ejecutar el script de limpieza periódicamente:

```bash
# Crear un cron job (cada semana)
0 2 * * 0 cd /ruta/backend && php utils/limpiar_videos_huerfanos.php >> logs/limpieza.log 2>&1
```

## Impacto en el Usuario

### Usuario Final
- ✅ **Mejora**: Solo ve videos que funcionan
- ✅ **Evita**: Frustración de videos que no reproducen
- ✅ **Transparente**: No nota ningún cambio

### Administrador/Docente
- ✅ **Control**: Puede ver videos marcados como 'error'
- ✅ **Decisión**: Re-subir o eliminar definitivamente
- ✅ **Logs**: Registro de todos los cambios

## Recuperación de Videos Huérfanos

Si marcaste un video como error por accidente o recuperaste el archivo:

```sql
-- Ver videos marcados como error
SELECT id, titulo, archivo_path, estado
FROM videos
WHERE estado = 'error';

-- Reactivar un video (después de verificar que el archivo existe)
UPDATE videos
SET estado = 'activo'
WHERE id = 123;
```

## Código Técnico

### Método de Filtrado

```php
private function filtrarVideosExistentes(array $videos): array
{
    $videosExistentes = array_filter($videos, function($video) {
        if (empty($video['archivo_path'])) {
            return false;
        }
        $rutaCompleta = __DIR__ . '/../' . $video['archivo_path'];
        return file_exists($rutaCompleta);
    });

    return array_values($videosExistentes);
}
```

### Uso en Método

```php
public function obtenerTodos(/* ... */) {
    // ... consulta SQL ...

    $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Filtrar videos cuyos archivos no existen
    $videosExistentes = array_filter($videos, function($video) {
        if (empty($video['archivo_path'])) {
            return false;
        }
        $rutaCompleta = __DIR__ . '/../' . $video['archivo_path'];
        return file_exists($rutaCompleta);
    });

    return array_values($videosExistentes);
}
```

## Preguntas Frecuentes

### ¿Los videos huérfanos se eliminan de la base de datos?
No, se marcan como `error` pero permanecen en la BD. Esto permite auditoria y recuperación.

### ¿Puedo revertir un video marcado como error?
Sí, si recuperas el archivo físico, puedes cambiar el estado manualmente a `activo`.

### ¿Afecta el rendimiento verificar cada archivo?
Mínimamente. `file_exists()` es muy rápido. Para listados grandes considera cachear resultados.

### ¿Se puede automatizar la limpieza?
Sí, usando un cron job para ejecutar `limpiar_videos_huerfanos.php` periódicamente.

### ¿Qué pasa si un video está procesándose?
Videos con estado `procesando` no se filtran hasta que estén `activo`.

---

**Última actualización:** 2025-11-16
**Sistema:** Videoteca San Francisco Xavier
**Desarrollador:** Roger Omar Luna Yujra
