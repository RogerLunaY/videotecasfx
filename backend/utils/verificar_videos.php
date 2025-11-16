<?php
/**
 * Script de Verificación: Estado de Videos
 * Muestra cuántos videos tienen archivo y cuántos no
 *
 * Uso: php utils/verificar_videos.php
 */

require_once __DIR__ . '/../models/Video.php';

echo "=== VERIFICACIÓN DE VIDEOS ===\n";
echo "Fecha: " . date('Y-m-d H:i:s') . "\n\n";

try {
    $videoModel = new Video();
    $database = Database::getInstance();
    $conn = $database->getConnection();

    // Obtener todos los videos activos de la BD
    $query = "SELECT id, titulo, archivo_path, estado FROM videos WHERE estado = 'activo' ORDER BY id DESC";
    $stmt = $conn->query($query);
    $todosBD = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "📊 ESTADÍSTICAS\n";
    echo "──────────────────────────────────────\n";
    echo "Videos activos en BD: " . count($todosBD) . "\n\n";

    $conArchivo = 0;
    $sinArchivo = 0;
    $sinArchivos = [];

    foreach ($todosBD as $video) {
        if (empty($video['archivo_path'])) {
            $sinArchivo++;
            $sinArchivos[] = $video;
            continue;
        }

        $rutaCompleta = __DIR__ . '/../' . $video['archivo_path'];

        if (file_exists($rutaCompleta)) {
            $conArchivo++;
        } else {
            $sinArchivo++;
            $sinArchivos[] = $video;
        }
    }

    echo "✓ Videos con archivo: {$conArchivo}\n";
    echo "✗ Videos sin archivo: {$sinArchivo}\n\n";

    if ($sinArchivo > 0) {
        echo "⚠️  VIDEOS SIN ARCHIVO FÍSICO:\n";
        echo "──────────────────────────────────────\n";

        foreach ($sinArchivos as $video) {
            echo "  ID: {$video['id']}\n";
            echo "  Título: {$video['titulo']}\n";
            echo "  Ruta: " . ($video['archivo_path'] ?: '(vacío)') . "\n";
            echo "  ────────────────────────────\n";
        }

        echo "\n💡 RECOMENDACIÓN:\n";
        echo "Ejecuta: php utils/limpiar_videos_huerfanos.php\n";
        echo "Para marcar estos videos como 'error'\n";
    } else {
        echo "✓ Todos los videos tienen su archivo físico\n";
    }

    // Verificar cuántos videos se muestran en la API
    echo "\n📡 VERIFICACIÓN API\n";
    echo "──────────────────────────────────────\n";

    $videosAPI = $videoModel->obtenerTodos([], 1000, 0);
    $countAPI = is_array($videosAPI) ? count($videosAPI) : 0;

    echo "Videos retornados por API: {$countAPI}\n";

    if ($countAPI < count($todosBD)) {
        $diferencia = count($todosBD) - $countAPI;
        echo "✓ Filtro funcionando: {$diferencia} video(s) oculto(s)\n";
    } else {
        echo "✓ Todos los videos de BD tienen archivo\n";
    }

    echo "\n=== VERIFICACIÓN COMPLETADA ===\n";

} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
