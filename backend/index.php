<?php
/**
 * Punto de Entrada Principal del API
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra (CI: 6734278 LP)
 * @tutor Lic. Vladimir Mamani
 * @institution Instituto Técnico ATSI Bolivia
 * @beneficiary U.E. San Francisco Xavier - Okinawa Uno, Bolivia
 * @version 1.0.0
 */

// =====================================================
// CONFIGURACIÓN INICIAL
// =====================================================

// Zona horaria
date_default_timezone_set('America/La_Paz');

// Manejo de errores
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Ocultar en producción
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/logs/php_errors.log');

// Registro de errores fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => 500,
                'message' => 'Error interno del servidor'
            ]
        ]);
    }
});

// Manejador de excepciones
set_exception_handler(function($exception) {
    error_log("[EXCEPTION] " . $exception->getMessage() . " in " . $exception->getFile() . ":" . $exception->getLine());

    http_response_code(500);
    header('Content-Type: application/json');

    $response = [
        'success' => false,
        'error' => [
            'code' => 500,
            'message' => 'Error interno del servidor'
        ]
    ];

    // En desarrollo, mostrar detalles del error
    if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
        $response['error']['details'] = $exception->getMessage();
        $response['error']['file'] = $exception->getFile();
        $response['error']['line'] = $exception->getLine();
        $response['error']['trace'] = $exception->getTraceAsString();
    }

    echo json_encode($response);
    exit;
});

// =====================================================
// CARGAR CONFIGURACIÓN
// =====================================================

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/cors.php';

// =====================================================
// APLICAR CONFIGURACIÓN CORS
// =====================================================

applyCorsHeaders();

// =====================================================
// MANEJO DE MÉTODOS HTTP
// =====================================================

// Permitir métodos PUT y DELETE simulados via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['_method'])) {
    $_SERVER['REQUEST_METHOD'] = strtoupper($_POST['_method']);
}

// =====================================================
// LOGGING DE PETICIONES (opcional en desarrollo)
// =====================================================

if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
    $logMessage = sprintf(
        "[%s] %s %s - IP: %s - User-Agent: %s\n",
        date('Y-m-d H:i:s'),
        $_SERVER['REQUEST_METHOD'],
        $_SERVER['REQUEST_URI'],
        $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    );

    file_put_contents(__DIR__ . '/logs/access.log', $logMessage, FILE_APPEND);
}

// =====================================================
// CARGAR Y EJECUTAR RUTAS
// =====================================================

try {
    $router = require __DIR__ . '/routes/api.php';
    $router->resolve();
} catch (Exception $e) {
    error_log("[ROUTER ERROR] " . $e->getMessage());

    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 500,
            'message' => 'Error al procesar la petición'
        ]
    ]);
}

// =====================================================
// FIN DEL SCRIPT
// =====================================================
