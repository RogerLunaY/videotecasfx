# Guía de Solución de Problemas (Troubleshooting)

Esta guía consolida las soluciones a problemas comunes encontrados durante el desarrollo y despliegue del sistema de Videoteca SFX.

## Tabla de Contenidos

- [Autenticación y Credenciales](#autenticación-y-credenciales)
- [Subida de Videos](#subida-de-videos)
- [Reproducción de Videos](#reproducción-de-videos)
- [Metadatos y Thumbnails](#metadatos-y-thumbnails)
- [Videos Huérfanos](#videos-huérfanos)
- [Errores Frontend](#errores-frontend)

---

## Autenticación y Credenciales

### Error 401 - No autorizado

**Problema:** El sistema retorna error 401 al intentar acceder a recursos protegidos.

**Soluciones:**

1. **Verificar token JWT:**
   - Revisar que el token no haya expirado
   - Verificar que el token se esté enviando en el header `Authorization: Bearer <token>`

2. **Credenciales de base de datos:**
   - Verificar archivo `backend/.env` con credenciales correctas
   - Verificar que la base de datos esté accesible
   - Probar conexión manual con las credenciales configuradas

3. **Middleware de autenticación:**
   - Verificar que `AuthMiddleware.php` esté correctamente configurado
   - Revisar logs en `backend/logs/` para detalles del error

**Credenciales por defecto:**
```
Administradores:
- vladimir.mamani@atsi.edu.bo / Password123!
- grethel.alvarez@sfx.edu.bo / Password123!

Docentes: (todos usan Password123!)
- juan.perez@sfx.edu.bo
- maria.lopez@sfx.edu.bo
- carlos.mamani@sfx.edu.bo
(ver seed_data.sql para lista completa)
```

### Problema de login en frontend

**Problema:** El formulario de login no procesa las credenciales correctamente.

**Soluciones:**

1. Verificar que el servicio de autenticación apunte a la URL correcta:
   ```javascript
   // frontend-web/src/services/api.js
   baseURL: 'http://localhost/backend'
   ```

2. Verificar CORS en el backend:
   ```php
   // backend/public/index.php
   header('Access-Control-Allow-Origin: *');
   ```

3. Revisar consola del navegador para errores de red

---

## Subida de Videos

### Error al subir archivos grandes

**Problema:** Los videos grandes (>100MB) fallan al subirse.

**Soluciones:**

1. **Aumentar límites PHP (php.ini):**
   ```ini
   upload_max_filesize = 500M
   post_max_size = 500M
   max_execution_time = 600
   max_input_time = 600
   memory_limit = 256M
   ```

2. **Configuración Laragon:**
   - Menu → PHP → php.ini
   - Reiniciar servicios después de cambiar configuración

3. **Verificar permisos de directorio:**
   ```bash
   chmod 755 backend/uploads/videos
   chmod 755 backend/uploads/thumbnails
   ```

### Videos no se guardan en el servidor

**Problema:** El video se sube pero no aparece en el directorio.

**Soluciones:**

1. Verificar ruta en configuración:
   ```php
   // backend/config/app.php
   'upload_path' => __DIR__ . '/../uploads/videos/'
   ```

2. Verificar que el directorio existe y tiene permisos de escritura

3. Revisar logs en `backend/logs/video_upload.log`

---

## Reproducción de Videos

### Videos no se reproducen en el navegador

**Problema:** El reproductor muestra error o pantalla negra.

**Soluciones:**

1. **Verificar codec del video:**
   - Formato recomendado: MP4 (H.264 video, AAC audio)
   - Convertir videos con FFmpeg si es necesario:
     ```bash
     ffmpeg -i input.mp4 -c:v libx264 -c:a aac output.mp4
     ```

2. **Verificar ruta del archivo:**
   - Confirmar que `archivo_path` en base de datos sea correcto
   - Probar acceso directo al archivo: `http://localhost/backend/uploads/videos/filename.mp4`

3. **Configurar MIME types correctos:**
   ```apache
   # .htaccess
   AddType video/mp4 .mp4
   AddType video/webm .webm
   ```

### Reproducción se detiene o buffering constante

**Problema:** El video se reproduce pero con interrupciones frecuentes.

**Soluciones:**

1. Implementar streaming por rangos (Range Requests)
2. Optimizar tamaño del video (compresión adecuada)
3. Verificar configuración del servidor web (Apache/Nginx)

---

## Metadatos y Thumbnails

### Thumbnails no se generan automáticamente

**Problema:** Al subir videos, no se crea la imagen de vista previa.

**Soluciones:**

1. **Sin FFmpeg (Solución implementada):**
   - El sistema permite subir thumbnails manualmente
   - Usar herramienta externa para generar thumbnails

2. **Con FFmpeg (Opcional):**
   ```bash
   # Instalar FFmpeg en Laragon
   ffmpeg -i video.mp4 -ss 00:00:01 -vframes 1 thumbnail.jpg
   ```

### Metadatos del video no se extraen

**Problema:** Duración, resolución u otros metadatos aparecen vacíos.

**Soluciones:**

1. **Usar getID3 (Implementado):**
   - Librería PHP para extraer metadatos sin FFmpeg
   - Instalada vía Composer: `getid3/getid3`

2. **Verificar instalación:**
   ```bash
   composer require james-heinrich/getid3
   ```

3. **Código de ejemplo:**
   ```php
   $getID3 = new getID3();
   $info = $getID3->analyze($videoPath);
   $duration = $info['playtime_seconds'];
   ```

---

## Videos Huérfanos

### Problema: Videos sin archivo físico en base de datos

**Descripción:** Registros en la tabla `videos` que apuntan a archivos que no existen en el servidor.

**Causas comunes:**
- Archivos eliminados manualmente del servidor
- Errores durante la subida
- Migración o reorganización de archivos

**Soluciones:**

1. **Filtrar automáticamente (Implementado):**
   ```php
   // VideoController usa configuración
   $config['video']['filter_orphans'] = true;
   ```

2. **Limpieza manual:**
   ```sql
   -- Marcar videos sin archivo como error
   UPDATE videos v
   SET estado = 'error'
   WHERE NOT EXISTS (
     SELECT 1 FROM ... -- verificación de archivo
   );
   ```

3. **Método del modelo Video:**
   ```php
   $videoModel->marcarVideosHuerfanos();
   ```

---

## Errores Frontend

### Errores de compilación en React

**Problema:** `npm start` falla con errores de compilación.

**Soluciones:**

1. **Limpiar cache y reinstalar:**
   ```bash
   cd frontend-web
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

2. **Verificar versión de Node.js:**
   ```bash
   node --version  # Debe ser v16+ o v18+
   ```

3. **Errores de importación:**
   - Verificar rutas de importación (case-sensitive)
   - Verificar que los componentes estén exportados correctamente

### Componentes no se actualizan

**Problema:** Cambios en el código no se reflejan en el navegador.

**Soluciones:**

1. Limpiar cache del navegador (Ctrl+Shift+R)
2. Reiniciar servidor de desarrollo
3. Verificar hot-reload en consola

---

## Configuración de Desarrollo

### Laragon no inicia servicios

**Soluciones:**

1. Verificar puertos no ocupados (80, 443, 3306)
2. Ejecutar Laragon como Administrador
3. Revisar logs en `C:\laragon\logs`

### Base de datos no importa correctamente

**Soluciones:**

1. Verificar orden de importación:
   ```bash
   mysql -u root -p videoteca < database/schema.sql
   mysql -u root -p videoteca < database/seed_data.sql
   ```

2. Verificar charset UTF-8:
   ```sql
   ALTER DATABASE videoteca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

## Contacto y Soporte

Si encuentras un problema no documentado aquí:

1. Revisar logs del sistema:
   - `backend/logs/`
   - Consola del navegador (F12)
   - Logs de Apache/MySQL en Laragon

2. Crear issue en el repositorio con:
   - Descripción detallada del problema
   - Pasos para reproducir
   - Logs relevantes
   - Versión del sistema

---

## Historial de Problemas Resueltos

### ✅ Noviembre 2024

- **Credenciales de base de datos:** Solucionado configurando correctamente .env
- **Error 401 en login:** Solucionado corrigiendo middleware de autenticación
- **Subida de archivos grandes:** Solucionado ajustando php.ini
- **Thumbnails sin FFmpeg:** Solucionado permitiendo subida manual
- **Metadatos sin FFmpeg:** Solucionado usando librería getID3
- **Videos huérfanos:** Solucionado con filtro automático en VideoController
- **Errores de compilación frontend:** Solucionado con reinstalación de dependencias
