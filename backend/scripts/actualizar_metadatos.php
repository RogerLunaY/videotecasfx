#!/usr/bin/env php
<?php
/**
 * Script para actualizar metadatos de videos existentes
 * Videoteca San Francisco Xavier
 *
 * Uso: php backend/scripts/actualizar_metadatos.php
 *
 * @author Roger Omar Luna Yujra
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/VideoProcessor.php';

echo "\n";
echo "╔═══════════════════════════════════════════════════════════╗\n";
echo "║   Actualización de Metadatos de Videos                   ║\n";
echo "║   Videoteca San Francisco Xavier                         ║\n";
echo "╚═══════════════════════════════════════════════════════════╝\n";
echo "\n";

try {
    $db = Database::getInstance()->getConnection();
    $processor = new VideoProcessor();

    // Obtener videos sin duración
    $stmt = $db->query("SELECT id, titulo, archivo_path, duracion FROM videos ORDER BY id");
    $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total = count($videos);
    $sinMetadatos = 0;
    $actualizados = 0;
    $errores = 0;
    $sinArchivo = 0;

    echo "📊 Análisis inicial:\n";
    echo "   Total de videos en BD: $total\n";
    echo "\n";

    if ($total === 0) {
        echo "ℹ️  No hay videos en la base de datos.\n";
        echo "   Sube videos desde la interfaz web para probarlos.\n";
        exit(0);
    }

    // Analizar cada video
    foreach ($videos as $video) {
        $rutaCompleta = __DIR__ . '/../' . $video['archivo_path'];

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "📹 Video ID: {$video['id']}\n";
        echo "   Título: {$video['titulo']}\n";
        echo "   Ruta BD: {$video['archivo_path']}\n";

        // Verificar si existe el archivo
        if (!file_exists($rutaCompleta)) {
            echo "   ❌ Archivo no existe físicamente\n";
            echo "   💡 Marcar como 'error' en la BD\n";
            $sinArchivo++;

            $stmt = $db->prepare("UPDATE videos SET estado = 'error' WHERE id = :id");
            $stmt->execute(['id' => $video['id']]);
            continue;
        }

        // Verificar si ya tiene metadatos
        if ($video['duracion'] !== null && $video['duracion'] > 0) {
            echo "   ✅ Ya tiene metadatos (duración: {$video['duracion']}s)\n";
            continue;
        }

        echo "   ⚠️  Sin metadatos, extrayendo...\n";
        $sinMetadatos++;

        // Extraer metadatos
        $metadatos = $processor->extraerMetadatos($rutaCompleta);

        if ($metadatos && isset($metadatos['duracion']) && $metadatos['duracion'] > 0) {
            // Actualizar en la BD
            $resolucion = $processor->detectarResolucion($rutaCompleta);

            $stmt = $db->prepare("
                UPDATE videos
                SET duracion = :duracion,
                    resolucion = :resolucion,
                    codec = :codec
                WHERE id = :id
            ");

            $resultado = $stmt->execute([
                'duracion' => $metadatos['duracion'],
                'resolucion' => $resolucion,
                'codec' => $metadatos['codec'],
                'id' => $video['id']
            ]);

            if ($resultado) {
                echo "   ✅ Metadatos actualizados:\n";
                echo "      - Duración: {$metadatos['duracion']}s\n";
                echo "      - Resolución: {$resolucion}\n";
                echo "      - Codec: " . ($metadatos['codec'] ?? 'N/A') . "\n";
                $actualizados++;
            } else {
                echo "   ❌ Error al actualizar en BD\n";
                $errores++;
            }
        } else {
            echo "   ❌ No se pudieron extraer metadatos\n";
            echo "   💡 El archivo puede estar corrupto o en formato no soportado\n";
            $errores++;
        }
    }

    // Resumen final
    echo "\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📊 RESUMEN:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "   Total de videos:        $total\n";
    echo "   Sin metadatos inicial:  $sinMetadatos\n";
    echo "   ✅ Actualizados:        $actualizados\n";
    echo "   ❌ Errores:             $errores\n";
    echo "   📁 Sin archivo físico:  $sinArchivo\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "\n";

    if ($actualizados > 0) {
        echo "✅ Proceso completado exitosamente\n";
        echo "   Los videos ahora mostrarán su duración correctamente\n";
    } elseif ($sinMetadatos === 0) {
        echo "ℹ️  Todos los videos ya tienen metadatos\n";
    } else {
        echo "⚠️  Algunos videos no pudieron ser procesados\n";
        echo "   Verifica que los archivos no estén corruptos\n";
    }

    echo "\n";

} catch (Exception $e) {
    echo "\n";
    echo "❌ ERROR FATAL:\n";
    echo "   " . $e->getMessage() . "\n";
    echo "\n";
    exit(1);
}
