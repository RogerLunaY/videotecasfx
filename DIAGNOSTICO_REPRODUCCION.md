# Diagnóstico: Problema de Reproducción de Videos

## ✅ Problemas Corregidos

### 1. URLs de Streaming Duplicadas
**Problema:** VideoPlayer construía URLs con `/api` duplicado
- ❌ Antes: `http://videotecasfx.test/api/api/videos/1/stream`
- ✅ Ahora: `http://videotecasfx.test/api/videos/1/stream`

**Solución:** Usar `getStreamUrl()` del servicio en lugar de construcción manual

### 2. URLs de Thumbnails Incorrectas
**Problema:** Construcción manual de URLs no consideraba que VITE_API_URL incluye `/api`
- ❌ Antes: `http://videotecasfx.test/api/uploads/thumbnails/thumb.jpg`
- ✅ Ahora: `http://videotecasfx.test/uploads/thumbnails/thumb.jpg`

**Solución:** Usar `getThumbnailUrl()` que elimina `/api` de la ruta base

### 3. Manejo Incorrecto de Respuestas del API
**Problema:** VideoDetailPage esperaba `response.video` pero el servicio ya retornaba el objeto directo
**Solución:** Corregido para usar el objeto video directamente

## 🔍 Verificación de la Solución

### Paso 1: Verificar URLs en el Navegador

Abre las herramientas de desarrollo (F12) y ve a la pestaña Network:

1. **Carga un video**
2. **Busca la petición al endpoint de streaming**
   - Debería ser: `GET http://videotecasfx.test/api/videos/{id}/stream`
   - Status: `200` o `206` (Partial Content)
3. **Verifica los thumbnails**
   - Deberían ser: `GET http://videotecasfx.test/uploads/thumbnails/{file}.jpg`
   - Status: `200`

### Paso 2: Verificar CORS (Si hay errores de CORS)

Si ves errores en la consola como:
```
Access to video at 'http://...' from origin 'http://...' has been blocked by CORS policy
```

**Solución:**

Verifica la configuración de CORS en `/backend/config/cors.php`:

```php
$allowedOrigins = [
    'http://localhost:5173',     // Vite dev server
    'http://localhost',
    'http://videotecasfx.test',  // Tu dominio
    'http://192.168.1.100',      // Tu IP local si accedes desde otro dispositivo
];
```

### Paso 3: Verificar Permisos de Archivos

Los archivos de video deben ser accesibles por el servidor web:

```bash
# Verificar permisos del directorio de videos
ls -la /home/user/videotecasfx/backend/uploads/videos/

# Deberían tener permisos 644 (rw-r--r--)
# Los directorios deberían tener permisos 755 (rwxr-xr-x)

# Si no, corregir:
sudo find backend/uploads -type f -exec chmod 644 {} \;
sudo find backend/uploads -type d -exec chmod 755 {} \;
sudo chown -R www-data:www-data backend/uploads  # o tu usuario de Apache/Nginx
```

### Paso 4: Verificar que el Archivo Existe

```bash
# Listar videos subidos
ls -lh backend/uploads/videos/

# Verificar un video específico
php -r "echo mime_content_type('backend/uploads/videos/nombre_archivo.mp4');"
# Debería mostrar: video/mp4 (o el tipo correspondiente)
```

### Paso 5: Probar el Streaming Directamente

Abre en el navegador:
```
http://videotecasfx.test/api/videos/1/stream
```

**Resultado esperado:**
- El video debería empezar a descargarse/reproducirse
- Si ves un error 404: el archivo no existe o la ruta es incorrecta
- Si ves un error 500: revisa los logs de PHP

### Paso 6: Verificar Logs del Servidor

```bash
# Logs de Apache
sudo tail -f /var/log/apache2/error.log

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Logs de PHP-FPM
sudo tail -f /var/log/php8.x-fpm.log

# Logs de la aplicación
tail -f backend/logs/app.log
```

## 🐛 Problemas Comunes y Soluciones

### Error: "Failed to load resource: net::ERR_CONNECTION_REFUSED"
**Causa:** El backend no está corriendo o la URL es incorrecta
**Solución:**
1. Verifica que Apache/Nginx esté corriendo: `sudo systemctl status apache2`
2. Verifica la URL en `.env`: `VITE_API_URL=http://videotecasfx.test/api`

### Error: "404 Not Found" en streaming
**Causas posibles:**
1. **Archivo no existe:** El video no está en `backend/uploads/videos/`
2. **Ruta incorrecta:** La ruta en la BD no coincide con el archivo físico
3. **Orden de rutas incorrecto:** El router captura la ruta antes del endpoint stream

**Soluciones:**
1. Verifica que el archivo existe: `ls backend/uploads/videos/`
2. Verifica la ruta en BD: `SELECT id, archivo_path FROM videos WHERE id=1;`
3. **CRÍTICO:** Asegúrate de que en `backend/routes/api.php` las rutas estén ordenadas así:
   ```php
   // Específicas primero
   $router->get('/api/videos/buscar', ...);
   $router->get('/api/videos/populares', ...);

   // Luego con ID y sub-ruta
   $router->get('/api/videos/{id}/stream', ...);  // Debe ir ANTES de /{id}
   $router->get('/api/videos/{id}', ...);         // Genérico al final
   ```
   Si `/api/videos/{id}` está antes de `/api/videos/{id}/stream`, el streaming NO funcionará.

### Error: "The element has no supported sources"
**Causa:** El formato del video no es compatible
**Solución:**
1. Verifica el formato del archivo: `file backend/uploads/videos/video.mp4`
2. Convierte a MP4 H.264 si es necesario:
   ```bash
   ffmpeg -i video_original.avi -c:v libx264 -c:a aac video.mp4
   ```

### Video se reproduce pero muy lento
**Causa:** Video muy grande o no optimizado
**Solución:**
1. Comprimir el video:
   ```bash
   ffmpeg -i input.mp4 -vcodec libx264 -crf 24 output.mp4
   ```
2. Verificar que el streaming con rangos esté habilitado en `.htaccess`

### CORS bloqueando requests
**Causa:** Origen no permitido en la configuración de CORS
**Solución:**
1. Agregar tu dominio a `backend/config/cors.php`
2. Reiniciar el servidor web

## 📋 Checklist de Verificación

- [ ] URLs de streaming no tienen `/api` duplicado
- [ ] Thumbnails se cargan correctamente
- [ ] CORS permite el origen del frontend
- [ ] Permisos de archivos correctos (644 para archivos, 755 para directorios)
- [ ] Archivos de video existen en `backend/uploads/videos/`
- [ ] Servidor web está corriendo
- [ ] Configuración de PHP permite archivos grandes (revisar SOLUCION_ERROR_SUBIDA.md)
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs del servidor
- [ ] No hay videos huérfanos (sin archivo físico) - ver VIDEOS_HUERFANOS.md

## 🔧 Herramientas Útiles

### Verificar Estado de Videos
```bash
# Ver estadísticas de videos con/sin archivo
php backend/utils/verificar_videos.php
```

### Limpiar Videos Huérfanos
```bash
# Marcar videos sin archivo como 'error'
php backend/utils/limpiar_videos_huerfanos.php
```

### Verificar Headers HTTP
```bash
curl -I http://videotecasfx.test/api/videos/1/stream
```

### Verificar CORS
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     --verbose \
     http://videotecasfx.test/api/videos/1/stream
```

### Probar descarga de video
```bash
wget http://videotecasfx.test/api/videos/1/stream -O test.mp4
```

---

**Última actualización:** 2025-11-16
**Sistema:** Videoteca San Francisco Xavier
**Desarrollador:** Roger Omar Luna Yujra
