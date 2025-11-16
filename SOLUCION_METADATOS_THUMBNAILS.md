# Solución: Metadatos de Videos y Thumbnails Automáticos

## 📋 Resumen del Problema

**Problemas reportados:**
1. ❌ Los videos no tienen thumbnail automático
2. ❌ No se muestra la duración de los videos
3. ❌ La duración no aparece en la base de datos

**Causa raíz:** FFmpeg no está instalado en el servidor

## ✅ Soluciones Implementadas

### 1. Extracción de Metadatos con getID3

Se instaló y configuró **getID3**, una librería PHP que extrae metadatos de archivos multimedia sin necesidad de FFmpeg.

**Características:**
- ✅ Extrae duración de videos
- ✅ Obtiene resolución (ancho x alto)
- ✅ Detecta codec de video
- ✅ Calcula bitrate
- ✅ Determina FPS (frames por segundo)

**Archivos modificados:**
- `backend/utils/VideoProcessor.php` - Método `extraerMetadatosBasicos()`
- `backend/utils/getid3/` - Librería getID3 instalada

### 2. Thumbnails Automáticos (Requiere FFmpeg)

**Estado actual:** ⚠️ Requiere instalación de FFmpeg

**Sin FFmpeg:**
- Se usa el placeholder SVG profesional (ya implementado)
- Los videos se muestran con icono placeholder de Videoteca SFX

**Con FFmpeg:**
- Se generan thumbnails automáticamente al subir videos
- Se captura un frame del video en el segundo 5

## 🚀 Funcionamiento Actual

### Subida de Videos (Sin FFmpeg)

Cuando se sube un video, el sistema ahora:

1. ✅ **Guarda el archivo** en `uploads/videos/materia_X/grado_Y/`
2. ✅ **Extrae metadatos** con getID3:
   - Duración en segundos
   - Resolución (ej: 1920x1080)
   - Codec (ej: h264)
   - Bitrate y FPS
3. ✅ **Almacena en la BD**:
   - `duracion` - duración en segundos
   - `resolucion` - etiqueta (720p, 1080p, etc.)
   - `tamanio` - tamaño del archivo
   - `formato` - extensión (mp4, webm, etc.)
4. ⚠️ **Thumbnail**: Usa placeholder SVG (no genera imagen)

### Reproducción de Videos

1. ✅ **Muestra duración** formateada (MM:SS o HH:MM:SS)
2. ✅ **Muestra thumbnail** (placeholder SVG si no hay imagen)
3. ✅ **Streaming funciona** correctamente

## 📦 Instalación de FFmpeg (Opcional pero Recomendado)

Para habilitar thumbnails automáticos, instalar FFmpeg:

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y ffmpeg
```

### CentOS/RHEL
```bash
sudo yum install -y ffmpeg
```

### Windows (Laragon/XAMPP)
1. Descargar FFmpeg desde: https://www.gyan.dev/ffmpeg/builds/
2. Extraer a `C:\ffmpeg\`
3. Agregar `C:\ffmpeg\bin` al PATH del sistema
4. Reiniciar Apache

### Verificar Instalación
```bash
ffmpeg -version
ffprobe -version
```

## 🧪 Probar Extracción de Metadatos

Ejecutar script de prueba:

```bash
cd /home/user/videotecasfx/backend
php test_getid3.php
```

**Salida esperada:**
```
=== Test de getID3 ===

📹 Video encontrado: video_ejemplo.mp4
   Ruta: /path/to/video.mp4

✅ Análisis completado

📊 Metadatos extraídos:
-----------------------------------
⏱️  Duración: 5min 23s (323 segundos)
📐 Resolución: 1920x1080
🎬 Codec: h264
📊 Bitrate: 5.2 Mbps
🎞️  FPS: 30
💾 Tamaño: 125.5 MB
-----------------------------------

✅ getID3 está funcionando correctamente
   Los nuevos videos tendrán metadatos completos
```

## 🔧 Configuración

### Habilitar/Deshabilitar Thumbnails Automáticos

En `backend/config/app.php`:

```php
'video' => [
    // ...
    'auto_thumbnail' => true,  // Requiere FFmpeg
    'thumbnail_time' => 5,     // Segundo del video para capturar
],
```

## 📊 Actualizar Videos Existentes

Si hay videos en la BD sin metadatos, crear script para actualizarlos:

```php
<?php
// backend/scripts/actualizar_metadatos.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/VideoProcessor.php';

$db = Database::getInstance()->getConnection();
$processor = new VideoProcessor();

// Obtener videos sin duración
$stmt = $db->query("SELECT id, archivo_path FROM videos WHERE duracion IS NULL");
$videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Encontrados " . count($videos) . " videos sin metadatos\n";

foreach ($videos as $video) {
    $rutaCompleta = __DIR__ . '/../' . $video['archivo_path'];

    if (!file_exists($rutaCompleta)) {
        echo "⚠️  Video {$video['id']}: archivo no existe\n";
        continue;
    }

    $metadatos = $processor->extraerMetadatos($rutaCompleta);

    if ($metadatos && isset($metadatos['duracion'])) {
        $stmt = $db->prepare("
            UPDATE videos
            SET duracion = :duracion,
                resolucion = :resolucion,
                codec = :codec
            WHERE id = :id
        ");

        $stmt->execute([
            'duracion' => $metadatos['duracion'],
            'resolucion' => $processor->detectarResolucion($rutaCompleta),
            'codec' => $metadatos['codec'],
            'id' => $video['id']
        ]);

        echo "✅ Video {$video['id']}: metadatos actualizados\n";
    } else {
        echo "❌ Video {$video['id']}: no se pudieron extraer metadatos\n";
    }
}

echo "\n✅ Proceso completado\n";
```

Ejecutar:
```bash
php backend/scripts/actualizar_metadatos.php
```

## 📝 Checklist de Verificación

- [x] getID3 instalado en `backend/utils/getid3/`
- [x] VideoProcessor actualizado para usar getID3
- [x] Extracción de duración funciona
- [x] Placeholder SVG configurado para videos sin thumbnail
- [ ] FFmpeg instalado (opcional, para thumbnails automáticos)
- [ ] Videos existentes actualizados con metadatos (si aplica)

## ⚙️ Cómo Funciona

### Con getID3 (Sin FFmpeg)

```
Video subido
     ↓
FileHandler guarda archivo
     ↓
VideoProcessor.extraerMetadatos()
     ↓
¿FFmpeg disponible?
     ↓ NO
extraerMetadatosBasicos()
     ↓
getID3.analyze()
     ↓
Retorna: {duracion, resolucion, codec, bitrate, fps}
     ↓
VideoController guarda en BD
```

### Con FFmpeg (Completo)

```
Video subido
     ↓
FileHandler guarda archivo
     ↓
VideoProcessor.extraerMetadatos()
     ↓
¿FFmpeg disponible?
     ↓ SÍ
extraerMetadatosConFFprobe()
     ↓
Retorna metadatos completos
     ↓
VideoProcessor.generarThumbnail()
     ↓
FFmpeg captura frame
     ↓
Thumbnail guardado en uploads/thumbnails/
     ↓
VideoController guarda todo en BD
```

## 🐛 Solución de Problemas

### Duración sigue sin aparecer

**Verificar:**
1. getID3 está instalado: `ls backend/utils/getid3/getid3.php`
2. El video es un formato soportado (mp4, webm, avi, mkv, mov)
3. Ejecutar script de prueba: `php backend/test_getid3.php`

**Revisar logs:**
```bash
tail -f backend/logs/app.log
```

Buscar líneas como:
```
[VideoProcessor] Error con getID3: ...
```

### Thumbnails no se generan

**Sin FFmpeg:** ✅ Esto es normal, usa placeholder SVG

**Con FFmpeg instalado:**
1. Verificar instalación: `ffmpeg -version`
2. Verificar permisos: `ls -la backend/uploads/thumbnails/`
3. Revisar configuración en `app.php`: `'auto_thumbnail' => true`

### Error al subir videos

**Verificar:**
1. Permisos en `uploads/`: `chmod -R 755 backend/uploads/`
2. Límites PHP en `php.ini`:
   ```ini
   upload_max_filesize = 500M
   post_max_size = 500M
   max_execution_time = 300
   ```

## 📚 Documentación Relacionada

- `DIAGNOSTICO_REPRODUCCION.md` - Problemas de reproducción de videos
- `SOLUCION_ERROR_SUBIDA.md` - Configuración de límites de archivos
- `README.md` - Instalación y configuración general

---

**Última actualización:** 2025-11-16
**Sistema:** Videoteca San Francisco Xavier
**Desarrollador:** Roger Omar Luna Yujra
**Librería:** getID3 v2.x (https://github.com/JamesHeinrich/getID3)
