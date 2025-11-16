# Solución al Error de Subida de Videos

## Problema Identificado

El error al subir videos se debe a que **PHP tiene límites muy bajos configurados**:

- `upload_max_filesize`: **2M** (debería ser 500M o más)
- `post_max_size`: **8M** (debería ser 500M o más)
- `max_execution_time`: **0** (debería ser al menos 300)

Esto significa que **cualquier video mayor a 2MB es rechazado automáticamente** por PHP antes de que llegue a la aplicación.

## Soluciones Implementadas

Se han creado archivos de configuración para intentar solucionar el problema:

### 1. Archivo `.htaccess` (Actualizado)
- Ruta: `/backend/.htaccess`
- Configuración añadida para PHP 7.x y PHP 8.x
- Funciona si el servidor usa **mod_php**

### 2. Archivo `.user.ini` (Nuevo)
- Ruta: `/backend/.user.ini`
- Funciona si el servidor usa **PHP-FPM**
- **Requiere reiniciar PHP-FPM** para que tome efecto

## Cómo Aplicar la Solución

### Opción 1: Reiniciar el Servidor Web

Si tienes acceso al servidor, reinicia Apache o Nginx:

```bash
# Para Apache
sudo systemctl restart apache2
# o
sudo service apache2 restart

# Para Nginx con PHP-FPM
sudo systemctl restart php-fpm
sudo systemctl restart nginx
```

### Opción 2: Modificar php.ini Directamente

Si tienes acceso al archivo `php.ini` del sistema:

1. Localiza tu archivo php.ini:
   ```bash
   php --ini
   ```

2. Edita el archivo:
   ```bash
   sudo nano /etc/php/8.x/fpm/php.ini
   # o
   sudo nano /etc/php/8.x/apache2/php.ini
   ```

3. Busca y modifica estas líneas:
   ```ini
   upload_max_filesize = 500M
   post_max_size = 500M
   max_execution_time = 600
   max_input_time = 600
   memory_limit = 512M
   ```

4. Guarda y reinicia el servicio:
   ```bash
   sudo systemctl restart php8.x-fpm
   sudo systemctl restart apache2  # o nginx
   ```

### Opción 3: Usar Docker (Recomendado)

Si el sistema está corriendo en Docker, necesitas:

1. Crear un archivo `php.ini` personalizado en tu Dockerfile:
   ```dockerfile
   COPY custom-php.ini /usr/local/etc/php/conf.d/uploads.ini
   ```

2. O agregar variables de entorno:
   ```yaml
   # docker-compose.yml
   environment:
     - PHP_UPLOAD_MAX_FILESIZE=500M
     - PHP_POST_MAX_SIZE=500M
   ```

3. Reconstruir y reiniciar el contenedor:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## Verificar la Solución

Ejecuta el script de diagnóstico:

```bash
cd backend
php check_upload.php
```

Deberías ver:
```
upload_max_filesize      : 500M   ✓
post_max_size            : 500M   ✓
max_execution_time       : 600    ✓
```

## Solución Temporal (Sin Acceso al Servidor)

Si no tienes acceso para modificar la configuración de PHP:

1. **Reducir tamaño de videos antes de subir**
   - Comprimir videos a menos de 2MB (no ideal para contenido educativo)
   - Usar herramientas como HandBrake o FFmpeg

2. **Contactar al proveedor de hosting**
   - Solicitar aumento de límites de PHP
   - Muchos hosting permiten configurar límites desde cPanel

## Notas Importantes

- Los archivos `.htaccess` y `.user.ini` creados solo funcionan si el servidor lo permite
- Algunos proveedores de hosting bloquean la modificación de estos valores por seguridad
- Si nada funciona, **debes contactar a tu proveedor de hosting** para que ajuste los límites de PHP

## Estado Actual

✅ Archivos de configuración creados
⚠️ **Requiere reinicio del servidor para aplicar cambios**
⚠️ Si el problema persiste, verifica con tu administrador de sistemas

---

**Creado:** 2025-11-16
**Sistema:** Videoteca San Francisco Xavier
**Desarrollador:** Roger Omar Luna Yujra
