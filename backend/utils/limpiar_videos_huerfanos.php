<?php
/**
 * Script de Utilidad: Limpieza de Videos Huérfanos
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * Este script marca como 'error' los videos en la base de datos
 * cuyos archivos físicos ya no existen en el servidor.
 *
 * Uso:
 * php utils/limpiar_videos_huerfanos.php
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/Video.php';

echo "=== LIMPIEZA DE VIDEOS HUÉRFANOS ===\n";
echo "Fecha: " . date('Y-m-d H:i:s') . "\n\n";

try {
    $videoModel = new Video();

    echo "Buscando videos sin archivo físico...\n";

    $marcados = $videoModel->marcarVideosHuerfanos();

    if ($marcados > 0) {
        echo "\n✓ Se marcaron {$marcados} video(s) como 'error' (archivo no encontrado)\n";
        echo "\nEstos videos ya no se mostrarán en el listado público.\n";
        echo "Puedes revisarlos en el panel de administración.\n";
    } else {
        echo "\n✓ No se encontraron videos huérfanos.\n";
        echo "Todos los videos activos tienen sus archivos físicos.\n";
    }

    echo "\n=== PROCESO COMPLETADO ===\n";

} catch (Exception $e) {
    echo "\n✗ Error durante la limpieza: " . $e->getMessage() . "\n";
    exit(1);
}
