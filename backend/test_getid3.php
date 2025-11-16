<?php
/**
 * Script de prueba para getID3
 * Verifica que se puedan extraer metadatos de videos
 */

require_once __DIR__ . '/utils/getid3/getid3.php';

echo "=== Test de getID3 ===" . PHP_EOL;
echo PHP_EOL;

// Buscar un video de prueba
$videosDir = __DIR__ . '/uploads/videos';
$videoEncontrado = false;
$rutaVideo = null;

if (is_dir($videosDir)) {
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($videosDir, RecursiveDirectoryIterator::SKIP_DOTS)
    );

    foreach ($iterator as $file) {
        if ($file->isFile() && in_array(strtolower($file->getExtension()), ['mp4', 'webm', 'avi', 'mkv', 'mov'])) {
            $rutaVideo = $file->getPathname();
            $videoEncontrado = true;
            break;
        }
    }
}

if (!$videoEncontrado) {
    echo "❌ No se encontró ningún video en uploads/videos/" . PHP_EOL;
    echo "   Sube un video primero para probar la extracción de metadatos." . PHP_EOL;
    exit(1);
}

echo "📹 Video encontrado: " . basename($rutaVideo) . PHP_EOL;
echo "   Ruta: $rutaVideo" . PHP_EOL;
echo PHP_EOL;

// Analizar con getID3
try {
    $getID3 = new getID3();
    $fileInfo = $getID3->analyze($rutaVideo);

    echo "✅ Análisis completado" . PHP_EOL;
    echo PHP_EOL;

    // Mostrar información extraída
    echo "📊 Metadatos extraídos:" . PHP_EOL;
    echo "-----------------------------------" . PHP_EOL;

    if (isset($fileInfo['playtime_seconds'])) {
        $segundos = (int)round($fileInfo['playtime_seconds']);
        $minutos = floor($segundos / 60);
        $segs = $segundos % 60;
        echo "⏱️  Duración: {$minutos}min {$segs}s ($segundos segundos)" . PHP_EOL;
    } else {
        echo "⏱️  Duración: No disponible" . PHP_EOL;
    }

    if (isset($fileInfo['video']['resolution_x']) && isset($fileInfo['video']['resolution_y'])) {
        $ancho = $fileInfo['video']['resolution_x'];
        $alto = $fileInfo['video']['resolution_y'];
        echo "📐 Resolución: {$ancho}x{$alto}" . PHP_EOL;
    } else {
        echo "📐 Resolución: No disponible" . PHP_EOL;
    }

    if (isset($fileInfo['video']['codec'])) {
        echo "🎬 Codec: {$fileInfo['video']['codec']}" . PHP_EOL;
    } else {
        echo "🎬 Codec: No disponible" . PHP_EOL;
    }

    if (isset($fileInfo['video']['bitrate'])) {
        $bitrate = round($fileInfo['video']['bitrate'] / 1000000, 2);
        echo "📊 Bitrate: {$bitrate} Mbps" . PHP_EOL;
    } else {
        echo "📊 Bitrate: No disponible" . PHP_EOL;
    }

    if (isset($fileInfo['video']['frame_rate'])) {
        $fps = round($fileInfo['video']['frame_rate'], 2);
        echo "🎞️  FPS: {$fps}" . PHP_EOL;
    } else {
        echo "🎞️  FPS: No disponible" . PHP_EOL;
    }

    if (isset($fileInfo['filesize'])) {
        $tamanio = round($fileInfo['filesize'] / 1024 / 1024, 2);
        echo "💾 Tamaño: {$tamanio} MB" . PHP_EOL;
    }

    echo "-----------------------------------" . PHP_EOL;
    echo PHP_EOL;
    echo "✅ getID3 está funcionando correctamente" . PHP_EOL;
    echo "   Los nuevos videos tendrán metadatos completos" . PHP_EOL;

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
    exit(1);
}
