<?php
/**
 * Configuración de JWT (JSON Web Tokens)
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Configuración de JWT para autenticación
 *
 * Define las constantes y configuraciones necesarias para
 * la generación y validación de tokens JWT en el sistema.
 */

// Cargar variables de entorno si no están cargadas
if (!isset($_ENV['JWT_SECRET'])) {
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

return [
    /**
     * Clave secreta para firmar los tokens JWT
     * IMPORTANTE: Cambiar esta clave en producción y mantenerla segura
     */
    'secret' => $_ENV['JWT_SECRET'] ?? 'videoteca_sfx_secret_key_change_in_production_2024',

    /**
     * Algoritmo de encriptación
     * Opciones: HS256, HS384, HS512, RS256, RS384, RS512
     */
    'algorithm' => $_ENV['JWT_ALGORITHM'] ?? 'HS256',

    /**
     * Emisor del token (issuer)
     * Identifica quien emitió el token
     */
    'issuer' => $_ENV['JWT_ISSUER'] ?? 'videoteca_sfx_api',

    /**
     * Audiencia del token (audience)
     * Identifica para quien está destinado el token
     */
    'audience' => $_ENV['JWT_AUDIENCE'] ?? 'videoteca_sfx_frontend',

    /**
     * Tiempo de vida del Access Token (en segundos)
     * Por defecto: 1 hora (3600 segundos)
     */
    'access_token_lifetime' => (int)($_ENV['JWT_ACCESS_LIFETIME'] ?? 3600),

    /**
     * Tiempo de vida del Refresh Token (en segundos)
     * Por defecto: 7 días (604800 segundos)
     */
    'refresh_token_lifetime' => (int)($_ENV['JWT_REFRESH_LIFETIME'] ?? 604800),

    /**
     * Margen de tiempo para la validación del token (segundos)
     * Permite una pequeña diferencia de tiempo entre servidores
     */
    'leeway' => (int)($_ENV['JWT_LEEWAY'] ?? 60),

    /**
     * Habilitar/deshabilitar la validación del tiempo de emisión
     */
    'validate_iat' => true,

    /**
     * Habilitar/deshabilitar la validación del emisor
     */
    'validate_issuer' => true,

    /**
     * Habilitar/deshabilitar la validación de audiencia
     */
    'validate_audience' => true,

    /**
     * Claims personalizados permitidos
     */
    'allowed_custom_claims' => [
        'user_id',
        'email',
        'rol',
        'nombre',
        'tipo' // 'access' o 'refresh'
    ],

    /**
     * Configuración de headers del token
     */
    'headers' => [
        'typ' => 'JWT',
        'alg' => $_ENV['JWT_ALGORITHM'] ?? 'HS256'
    ]
];
