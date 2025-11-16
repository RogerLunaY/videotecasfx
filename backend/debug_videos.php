<?php
/**
 * Script de Debug: Ver todos los videos en BD sin filtros
 */

require_once __DIR__ . '/config/database.php';

echo "=== DEBUG DE VIDEOS ===\n";
echo "Fecha: " . date('Y-m-d H:i:s') . "\n\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Ver todos los videos sin filtros
    $query = "SELECT id, titulo, archivo_path, archivo_nombre, estado, fecha_subida
              FROM videos
              ORDER BY id DESC
              LIMIT 20";

    $stmt = $conn->query($query);
    $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "📊 Total videos en BD: " . count($videos) . "\n\n";

    if (empty($videos)) {
        echo "⚠️  No hay videos en la base de datos\n";
        echo "Esto significa que los videos no se han subido correctamente\n";
        echo "o la tabla está vacía.\n";
        exit(0);
    }

    echo "📋 LISTADO DE VIDEOS:\n";
    echo str_repeat("=", 80) . "\n\n";

    foreach ($videos as $video) {
        echo "ID: {$video['id']}\n";
        echo "Título: {$video['titulo']}\n";
        echo "Estado: {$video['estado']}\n";
        echo "Archivo Path: " . ($video['archivo_path'] ?: '(VACÍO)') . "\n";
        echo "Archivo Nombre: " . ($video['archivo_nombre'] ?: '(VACÍO)') . "\n";
        echo "Fecha: {$video['fecha_subida']}\n";

        // Verificar si el archivo existe
        if (!empty($video['archivo_path'])) {
            $rutaCompleta = __DIR__ . '/' . $video['archivo_path'];
            $existe = file_exists($rutaCompleta);

            echo "Ruta completa: {$rutaCompleta}\n";
            echo "¿Existe?: " . ($existe ? '✓ SÍ' : '✗ NO') . "\n";

            if (!$existe) {
                // Verificar subdirectorios
                $dirBase = __DIR__ . '/uploads/videos';
                echo "Directorio base: {$dirBase}\n";
                echo "¿Dir existe?: " . (is_dir($dirBase) ? 'SÍ' : 'NO') . "\n";

                if (is_dir($dirBase)) {
                    $archivos = scandir($dirBase);
                    $archivos = array_diff($archivos, ['.', '..', '.gitkeep']);
                    echo "Archivos en dir: " . count($archivos) . "\n";
                    if (count($archivos) > 0) {
                        echo "Listado: " . implode(', ', array_slice($archivos, 0, 5)) . "\n";
                    }
                }
            }
        } else {
            echo "⚠️  Este video NO tiene archivo_path\n";
        }

        echo str_repeat("-", 80) . "\n\n";
    }

} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo "Tipo: " . get_class($e) . "\n";
    exit(1);
}
