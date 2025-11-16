<?php
/**
 * Configuración de CORS (Cross-Origin Resource Sharing)
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Configuración de CORS
 *
 * Define los orígenes permitidos, métodos HTTP, headers y otras
 * configuraciones relacionadas con las peticiones cross-origin.
 */

// Cargar variables de entorno si no están cargadas
if (!isset($_ENV['APP_ENV'])) {
    $envFile = __DIR__ . '/../.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $_ENV[trim($key)] = trim($value, '"\'');
            }
        }
    }
}

$config = [
    /**
     * Orígenes permitidos (Allowed Origins)
     *
     * Lista de URLs que pueden realizar peticiones al API.
     * En desarrollo se permite localhost, en producción solo dominios específicos.
     */
    'allowed_origins' => $_ENV['APP_ENV'] === 'development' ? [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://192.168.1.1:3000',
        'http://192.168.1.1:5173'
    ] : explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:3000'),

    /**
     * Permitir todos los orígenes (*)
     * ADVERTENCIA: Solo usar en desarrollo, NUNCA en producción
     */
    'allow_all_origins' => $_ENV['APP_ENV'] === 'development',

    /**
     * Métodos HTTP permitidos
     */
    'allowed_methods' => [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
        'PATCH'
    ],

    /**
     * Headers permitidos en las peticiones
     */
    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-CSRF-Token'
    ],

    /**
     * Headers expuestos al cliente
     */
    'exposed_headers' => [
        'Content-Length',
        'X-JSON',
        'X-Total-Count',
        'X-Page-Count'
    ],

    /**
     * Permitir credenciales (cookies, authorization headers)
     */
    'allow_credentials' => true,

    /**
     * Tiempo máximo de caché para la respuesta preflight (segundos)
     * 1 hora = 3600 segundos
     */
    'max_age' => 3600,

    /**
     * Habilitar/deshabilitar CORS
     */
    'enabled' => true
];

/**
 * Aplica los headers CORS a la respuesta actual
 *
 * @return void
 */
function applyCorsHeaders(): void
{
    global $config;

    if (!$config['enabled']) {
        return;
    }

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // Determinar el origen permitido
    if ($config['allow_all_origins']) {
        header('Access-Control-Allow-Origin: *');
    } elseif (in_array($origin, $config['allowed_origins'])) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
    } else {
        // Si el origen no está permitido, usar el primero de la lista como fallback
        if (!empty($config['allowed_origins'])) {
            header('Access-Control-Allow-Origin: ' . $config['allowed_origins'][0]);
        }
    }

    // Permitir credenciales
    if ($config['allow_credentials']) {
        header('Access-Control-Allow-Credentials: true');
    }

    // Métodos permitidos
    header('Access-Control-Allow-Methods: ' . implode(', ', $config['allowed_methods']));

    // Headers permitidos
    header('Access-Control-Allow-Headers: ' . implode(', ', $config['allowed_headers']));

    // Headers expuestos
    if (!empty($config['exposed_headers'])) {
        header('Access-Control-Expose-Headers: ' . implode(', ', $config['exposed_headers']));
    }

    // Max Age
    header('Access-Control-Max-Age: ' . $config['max_age']);

    // Manejar peticiones OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit(0);
    }
}

/**
 * Verifica si un origen está permitido
 *
 * @param string $origin Origen a verificar
 * @return bool
 */
function isOriginAllowed(string $origin): bool
{
    global $config;

    if ($config['allow_all_origins']) {
        return true;
    }

    return in_array($origin, $config['allowed_origins']);
}

/**
 * Agrega un origen a la lista de permitidos dinámicamente
 *
 * @param string $origin Origen a agregar
 * @return void
 */
function addAllowedOrigin(string $origin): void
{
    global $config;

    if (!in_array($origin, $config['allowed_origins'])) {
        $config['allowed_origins'][] = $origin;
    }
}

return $config;
