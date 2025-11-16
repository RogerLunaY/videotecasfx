<?php
/**
 * Configuración General de la Aplicación
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

// Cargar variables de entorno
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

return [
    /**
     * Nombre de la aplicación
     */
    'name' => 'Videoteca San Francisco Xavier',

    /**
     * Versión de la aplicación
     */
    'version' => '1.0.0',

    /**
     * Entorno de ejecución
     * Valores: development, production
     */
    'env' => $_ENV['APP_ENV'] ?? 'development',

    /**
     * Modo debug
     * En producción siempre debe estar en false
     */
    'debug' => ($_ENV['APP_DEBUG'] ?? 'true') === 'true',

    /**
     * URL base de la aplicación
     */
    'url' => $_ENV['APP_URL'] ?? 'http://localhost',

    /**
     * Zona horaria
     */
    'timezone' => $_ENV['APP_TIMEZONE'] ?? 'America/La_Paz',

    /**
     * Locale por defecto
     */
    'locale' => 'es_BO',

    /**
     * Configuración de archivos de video
     */
    'video' => [
        /**
         * Filtrar videos sin archivo físico
         * Si está en true, oculta videos cuyo archivo no existe
         * Si está en false, muestra todos los videos de la BD
         */
        'filter_orphans' => ($_ENV['FILTER_ORPHAN_VIDEOS'] ?? 'false') === 'true',

        /**
         * Tamaño máximo de archivo en bytes
         * 500 MB = 524288000 bytes
         */
        'max_size' => (int)($_ENV['VIDEO_MAX_SIZE'] ?? 524288000),

        /**
         * Formatos permitidos
         */
        'allowed_formats' => ['mp4', 'webm', 'avi', 'mkv', 'mov'],

        /**
         * MIME types permitidos
         */
        'allowed_mimes' => [
            'video/mp4',
            'video/webm',
            'video/x-msvideo',
            'video/x-matroska',
            'video/quicktime'
        ],

        /**
         * Directorio de almacenamiento de videos
         */
        'storage_path' => __DIR__ . '/../uploads/videos/',

        /**
         * Directorio de thumbnails
         */
        'thumbnail_path' => __DIR__ . '/../uploads/thumbnails/',

        /**
         * Generar thumbnail automáticamente
         */
        'auto_thumbnail' => true,

        /**
         * Tiempo del video para capturar thumbnail (segundos)
         */
        'thumbnail_time' => 5,

        /**
         * Calidades de video disponibles
         */
        'qualities' => ['360p', '480p', '720p', '1080p'],

        /**
         * Habilitar transcodificación automática
         */
        'auto_transcode' => false
    ],

    /**
     * Configuración de seguridad
     */
    'security' => [
        /**
         * Costo de hash para bcrypt
         */
        'bcrypt_cost' => 12,

        /**
         * Número máximo de intentos de login
         */
        'max_login_attempts' => 5,

        /**
         * Tiempo de bloqueo tras intentos fallidos (minutos)
         */
        'lockout_time' => 15,

        /**
         * Tiempo de sesión inactiva (minutos)
         */
        'session_lifetime' => 120
    ],

    /**
     * Configuración de paginación
     */
    'pagination' => [
        /**
         * Items por página por defecto
         */
        'per_page' => 20,

        /**
         * Máximo de items por página
         */
        'max_per_page' => 100
    ],

    /**
     * Configuración de logging
     */
    'logging' => [
        /**
         * Habilitar logging
         */
        'enabled' => true,

        /**
         * Nivel de logging
         * Valores: debug, info, warning, error, critical
         */
        'level' => $_ENV['LOG_LEVEL'] ?? 'info',

        /**
         * Directorio de logs
         */
        'path' => __DIR__ . '/../logs/',

        /**
         * Archivo de log
         */
        'file' => 'app.log',

        /**
         * Rotación de logs (días)
         */
        'rotation_days' => 30
    ],

    /**
     * Configuración de estadísticas
     */
    'statistics' => [
        /**
         * Habilitar registro de estadísticas
         */
        'enabled' => true,

        /**
         * Registrar IP de visitantes
         */
        'track_ip' => true,

        /**
         * Registrar user agent
         */
        'track_user_agent' => true
    ],

    /**
     * Información institucional
     */
    'institution' => [
        'name' => 'Unidad Educativa San Francisco Xavier',
        'location' => 'Okinawa Uno, Bolivia',
        'director' => 'Sor Grethel Alvarez Mamani',
        'students_count' => 142,
        'teachers_count' => 20
    ],

    /**
     * Información del desarrollador
     */
    'developer' => [
        'name' => 'Roger Omar Luna Yujra',
        'ci' => '6734278 LP',
        'institution' => 'Instituto Técnico ATSI Bolivia',
        'tutor' => 'Lic. Vladimir Mamani'
    ]
];
