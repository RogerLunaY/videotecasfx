<?php
/**
 * Sistema de Logging
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase Logger - Sistema de logging
 *
 * Proporciona funcionalidades para registrar eventos, errores
 * y acciones del sistema tanto en archivos como en base de datos.
 */
class Logger
{
    /** @var PDO|null Conexión a la base de datos */
    private ?PDO $conn = null;

    /** @var array Configuración */
    private array $config;

    /** @var string Ruta del archivo de log */
    private string $logFile;

    /** @var bool Habilitar logging en BD */
    private bool $dbLogging = true;

    /**
     * Constructor
     *
     * @param bool $dbLogging Habilitar logging en base de datos
     */
    public function __construct(bool $dbLogging = true)
    {
        $this->config = require __DIR__ . '/../config/app.php';
        $this->dbLogging = $dbLogging;

        // Configurar archivo de log
        $logPath = $this->config['logging']['path'];
        $logFile = $this->config['logging']['file'];

        // Crear directorio de logs si no existe
        if (!is_dir($logPath)) {
            mkdir($logPath, 0755, true);
        }

        $this->logFile = $logPath . $logFile;

        // Inicializar conexión a BD si está habilitado
        if ($this->dbLogging) {
            try {
                $database = Database::getInstance();
                $this->conn = $database->getConnection();
            } catch (Exception $e) {
                $this->dbLogging = false;
                error_log("Logger: No se pudo conectar a la BD - " . $e->getMessage());
            }
        }
    }

    /**
     * Registra un mensaje de información
     *
     * @param string $accion Acción realizada
     * @param string $descripcion Descripción del evento
     * @param int|null $usuarioId ID del usuario
     * @param array $datosAdicionales Datos adicionales
     * @return bool
     */
    public function info(string $accion, string $descripcion, ?int $usuarioId = null, array $datosAdicionales = []): bool
    {
        return $this->log('info', $accion, $descripcion, $usuarioId, $datosAdicionales);
    }

    /**
     * Registra una advertencia
     *
     * @param string $accion Acción realizada
     * @param string $descripcion Descripción de la advertencia
     * @param int|null $usuarioId ID del usuario
     * @param array $datosAdicionales Datos adicionales
     * @return bool
     */
    public function warning(string $accion, string $descripcion, ?int $usuarioId = null, array $datosAdicionales = []): bool
    {
        return $this->log('warning', $accion, $descripcion, $usuarioId, $datosAdicionales);
    }

    /**
     * Registra un error
     *
     * @param string $accion Acción que causó el error
     * @param string $descripcion Descripción del error
     * @param int|null $usuarioId ID del usuario
     * @param array $datosAdicionales Datos adicionales
     * @return bool
     */
    public function error(string $accion, string $descripcion, ?int $usuarioId = null, array $datosAdicionales = []): bool
    {
        return $this->log('error', $accion, $descripcion, $usuarioId, $datosAdicionales);
    }

    /**
     * Registra un error crítico
     *
     * @param string $accion Acción que causó el error
     * @param string $descripcion Descripción del error crítico
     * @param int|null $usuarioId ID del usuario
     * @param array $datosAdicionales Datos adicionales
     * @return bool
     */
    public function critical(string $accion, string $descripcion, ?int $usuarioId = null, array $datosAdicionales = []): bool
    {
        return $this->log('critical', $accion, $descripcion, $usuarioId, $datosAdicionales);
    }

    /**
     * Registra un evento de autenticación
     *
     * @param string $accion Tipo de acción (login, logout, etc.)
     * @param string $email Email del usuario
     * @param bool $exitoso Si la acción fue exitosa
     * @param int|null $usuarioId ID del usuario
     * @return bool
     */
    public function auth(string $accion, string $email, bool $exitoso, ?int $usuarioId = null): bool
    {
        $descripcion = $exitoso
            ? "Autenticación exitosa: {$email}"
            : "Intento de autenticación fallido: {$email}";

        $nivel = $exitoso ? 'info' : 'warning';

        return $this->log($nivel, $accion, $descripcion, $usuarioId, [
            'email' => $email,
            'exitoso' => $exitoso
        ]);
    }

    /**
     * Registra una acción sobre un video
     *
     * @param string $accion Acción realizada
     * @param int $videoId ID del video
     * @param string $titulo Título del video
     * @param int $usuarioId ID del usuario
     * @return bool
     */
    public function video(string $accion, int $videoId, string $titulo, int $usuarioId): bool
    {
        $descripcion = "Video '{$titulo}': {$accion}";

        return $this->log('info', $accion, $descripcion, $usuarioId, [
            'entidad' => 'video',
            'entidad_id' => $videoId,
            'titulo' => $titulo
        ]);
    }

    /**
     * Registra una acción sobre un usuario
     *
     * @param string $accion Acción realizada
     * @param int $usuarioAfectadoId ID del usuario afectado
     * @param string $nombre Nombre del usuario afectado
     * @param int|null $usuarioActorId ID del usuario que realiza la acción
     * @return bool
     */
    public function usuario(string $accion, int $usuarioAfectadoId, string $nombre, ?int $usuarioActorId = null): bool
    {
        $descripcion = "Usuario '{$nombre}': {$accion}";

        return $this->log('info', $accion, $descripcion, $usuarioActorId, [
            'entidad' => 'usuario',
            'entidad_id' => $usuarioAfectadoId,
            'nombre' => $nombre
        ]);
    }

    /**
     * Método principal de logging
     *
     * @param string $nivel Nivel del log
     * @param string $accion Acción realizada
     * @param string $descripcion Descripción del evento
     * @param int|null $usuarioId ID del usuario
     * @param array $datosAdicionales Datos adicionales
     * @return bool
     */
    private function log(
        string $nivel,
        string $accion,
        string $descripcion,
        ?int $usuarioId = null,
        array $datosAdicionales = []
    ): bool {
        // Verificar si está habilitado el logging
        if (!$this->config['logging']['enabled']) {
            return true;
        }

        // Verificar nivel de logging configurado
        $nivelesPermitidos = ['debug', 'info', 'warning', 'error', 'critical'];
        $nivelConfigurado = $this->config['logging']['level'];
        $nivelActualIndex = array_search($nivel, $nivelesPermitidos);
        $nivelConfiguradoIndex = array_search($nivelConfigurado, $nivelesPermitidos);

        if ($nivelActualIndex < $nivelConfiguradoIndex) {
            return true; // No registrar niveles menores al configurado
        }

        // Obtener información adicional
        $ip = $this->obtenerIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

        // Agregar datos adicionales
        $datosAdicionales['ip'] = $ip;
        $datosAdicionales['user_agent'] = $userAgent;

        // Registrar en archivo
        $this->logToFile($nivel, $accion, $descripcion, $usuarioId);

        // Registrar en base de datos
        if ($this->dbLogging && $this->conn) {
            $this->logToDatabase($nivel, $accion, $descripcion, $usuarioId, $datosAdicionales);
        }

        return true;
    }

    /**
     * Registra en archivo
     *
     * @param string $nivel Nivel del log
     * @param string $accion Acción
     * @param string $descripcion Descripción
     * @param int|null $usuarioId ID del usuario
     * @return void
     */
    private function logToFile(string $nivel, string $accion, string $descripcion, ?int $usuarioId = null): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $nivelUpper = strtoupper($nivel);
        $usuario = $usuarioId ? "Usuario:{$usuarioId}" : "Sistema";

        $mensaje = "[{$timestamp}] [{$nivelUpper}] [{$usuario}] {$accion} - {$descripcion}" . PHP_EOL;

        file_put_contents($this->logFile, $mensaje, FILE_APPEND | LOCK_EX);

        // Rotar logs si es necesario
        $this->rotarLogs();
    }

    /**
     * Registra en base de datos
     *
     * @param string $nivel Nivel del log
     * @param string $accion Acción
     * @param string $descripcion Descripción
     * @param int|null $usuarioId ID del usuario
     * @param array $datosAdicionales Datos adicionales
     * @return void
     */
    private function logToDatabase(
        string $nivel,
        string $accion,
        string $descripcion,
        ?int $usuarioId,
        array $datosAdicionales
    ): void {
        try {
            $query = "INSERT INTO logs_sistema
                    (usuario_id, nivel, accion, descripcion, entidad, entidad_id, ip, user_agent, datos_adicionales)
                    VALUES
                    (:usuario_id, :nivel, :accion, :descripcion, :entidad, :entidad_id, :ip, :user_agent, :datos_adicionales)";

            $stmt = $this->conn->prepare($query);

            $entidad = $datosAdicionales['entidad'] ?? null;
            $entidadId = $datosAdicionales['entidad_id'] ?? null;
            $ip = $datosAdicionales['ip'] ?? null;
            $userAgent = $datosAdicionales['user_agent'] ?? null;
            $datosJson = json_encode($datosAdicionales);

            $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
            $stmt->bindParam(':nivel', $nivel);
            $stmt->bindParam(':accion', $accion);
            $stmt->bindParam(':descripcion', $descripcion);
            $stmt->bindParam(':entidad', $entidad);
            $stmt->bindParam(':entidad_id', $entidadId, PDO::PARAM_INT);
            $stmt->bindParam(':ip', $ip);
            $stmt->bindParam(':user_agent', $userAgent);
            $stmt->bindParam(':datos_adicionales', $datosJson);

            $stmt->execute();
        } catch (PDOException $e) {
            // Si falla el log en BD, registrar en archivo
            error_log("Logger DB Error: " . $e->getMessage());
        }
    }

    /**
     * Obtiene la IP real del cliente
     *
     * @return string
     */
    private function obtenerIP(): string
    {
        $ip = '';

        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        }

        return $ip;
    }

    /**
     * Rota los archivos de log si superan el tamaño máximo
     *
     * @return void
     */
    private function rotarLogs(): void
    {
        if (!file_exists($this->logFile)) {
            return;
        }

        $tamanioMax = 10 * 1024 * 1024; // 10 MB

        if (filesize($this->logFile) > $tamanioMax) {
            $timestamp = date('Y-m-d_H-i-s');
            $archivoRotado = $this->config['logging']['path'] . "app_{$timestamp}.log";

            rename($this->logFile, $archivoRotado);

            // Comprimir archivo rotado
            if (function_exists('gzopen')) {
                $this->comprimirLog($archivoRotado);
            }

            // Limpiar logs antiguos
            $this->limpiarLogsAntiguos();
        }
    }

    /**
     * Comprime un archivo de log
     *
     * @param string $archivo Ruta del archivo
     * @return void
     */
    private function comprimirLog(string $archivo): void
    {
        $archivoGz = $archivo . '.gz';

        $fp = fopen($archivo, 'rb');
        $gz = gzopen($archivoGz, 'wb9');

        while (!feof($fp)) {
            gzwrite($gz, fread($fp, 1024 * 512));
        }

        fclose($fp);
        gzclose($gz);

        // Eliminar archivo original
        unlink($archivo);
    }

    /**
     * Limpia logs antiguos según configuración
     *
     * @return void
     */
    private function limpiarLogsAntiguos(): void
    {
        $diasRotacion = $this->config['logging']['rotation_days'] ?? 30;
        $directorioLogs = $this->config['logging']['path'];

        $archivos = glob($directorioLogs . 'app_*.log*');

        foreach ($archivos as $archivo) {
            if (filemtime($archivo) < strtotime("-{$diasRotacion} days")) {
                unlink($archivo);
            }
        }
    }

    /**
     * Obtiene los últimos logs del archivo
     *
     * @param int $lineas Número de líneas a obtener
     * @return array
     */
    public function obtenerUltimosLogs(int $lineas = 100): array
    {
        if (!file_exists($this->logFile)) {
            return [];
        }

        $file = new SplFileObject($this->logFile);
        $file->seek(PHP_INT_MAX);
        $totalLineas = $file->key();

        $inicio = max(0, $totalLineas - $lineas);
        $logs = [];

        $file->seek($inicio);
        while (!$file->eof()) {
            $linea = trim($file->current());
            if (!empty($linea)) {
                $logs[] = $linea;
            }
            $file->next();
        }

        return $logs;
    }
}
