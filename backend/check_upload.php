<?php
/**
 * Script de diagnóstico para verificar configuración de subida de archivos
 */

// Valores críticos para subida de videos
$settings = [
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'max_execution_time' => ini_get('max_execution_time'),
    'max_input_time' => ini_get('max_input_time'),
    'memory_limit' => ini_get('memory_limit'),
    'file_uploads' => ini_get('file_uploads'),
    'max_file_uploads' => ini_get('max_file_uploads'),
];

echo "=== CONFIGURACIÓN PHP PARA SUBIDA DE ARCHIVOS ===\n\n";

foreach ($settings as $key => $value) {
    echo sprintf("%-25s: %s\n", $key, $value);
}

echo "\n=== DIRECTORIO DE SUBIDAS ===\n";
$uploadDir = __DIR__ . '/uploads/videos/';
echo "Ruta: $uploadDir\n";
echo "Existe: " . (is_dir($uploadDir) ? 'SÍ' : 'NO') . "\n";
echo "Es escribible: " . (is_writable($uploadDir) ? 'SÍ' : 'NO') . "\n";

$thumbnailDir = __DIR__ . '/uploads/thumbnails/';
echo "\nRuta thumbnails: $thumbnailDir\n";
echo "Existe: " . (is_dir($thumbnailDir) ? 'SÍ' : 'NO') . "\n";
echo "Es escribible: " . (is_writable($thumbnailDir) ? 'SÍ' : 'NO') . "\n";

echo "\n=== RECOMENDACIONES ===\n";

// Convertir a bytes para comparar
function convertToBytes($value) {
    $value = trim($value);
    $last = strtolower($value[strlen($value)-1]);
    $value = (int)$value;

    switch($last) {
        case 'g': $value *= 1024;
        case 'm': $value *= 1024;
        case 'k': $value *= 1024;
    }

    return $value;
}

$uploadMaxBytes = convertToBytes($settings['upload_max_filesize']);
$postMaxBytes = convertToBytes($settings['post_max_size']);
$requiredBytes = 524288000; // 500MB

if ($uploadMaxBytes < $requiredBytes) {
    echo "⚠ upload_max_filesize debe ser al menos 512M (actualmente: {$settings['upload_max_filesize']})\n";
}

if ($postMaxBytes < $requiredBytes) {
    echo "⚠ post_max_size debe ser al menos 512M (actualmente: {$settings['post_max_size']})\n";
}

if ($settings['max_execution_time'] < 300) {
    echo "⚠ max_execution_time debería ser al menos 300 segundos (actualmente: {$settings['max_execution_time']})\n";
}

if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
    echo "⚠ El directorio de uploads no existe o no es escribible\n";
}

echo "\n=== CONFIGURACIÓN RECOMENDADA PARA php.ini ===\n";
echo "upload_max_filesize = 512M\n";
echo "post_max_size = 512M\n";
echo "max_execution_time = 300\n";
echo "max_input_time = 300\n";
echo "memory_limit = 256M\n";
