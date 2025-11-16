<?php
/**
 * Configuración de Conexión a Base de Datos
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Clase Database - Patrón Singleton para conexión PDO
 *
 * Proporciona una única instancia de conexión a la base de datos
 * utilizando PDO con configuraciones optimizadas para seguridad y rendimiento.
 */
class Database
{
    /** @var Database|null Instancia única de la clase */
    private static ?Database $instance = null;

    /** @var PDO|null Objeto de conexión PDO */
    private ?PDO $connection = null;

    /** @var string Host del servidor de base de datos */
    private string $host;

    /** @var string Nombre de la base de datos */
    private string $database;

    /** @var string Usuario de la base de datos */
    private string $username;

    /** @var string Contraseña de la base de datos */
    private string $password;

    /** @var string Charset para la conexión */
    private string $charset = 'utf8mb4';

    /** @var array Opciones de PDO */
    private array $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_PERSISTENT         => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];

    /**
     * Constructor privado para implementar Singleton
     * Lee las variables de entorno para la configuración
     */
    private function __construct()
    {
        // Cargar variables de entorno
        $this->loadEnv();

        // Configuración de conexión
        $this->host     = $_ENV['DB_HOST'] ?? 'localhost';
        $this->database = $_ENV['DB_NAME'] ?? 'videoteca_sfx';
        $this->username = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASS'] ?? '';

        // Conectar a la base de datos
        $this->connect();
    }

    /**
     * Carga las variables de entorno desde el archivo .env
     *
     * @return void
     */
    private function loadEnv(): void
    {
        $envFile = __DIR__ . '/../.env';

        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                // Ignorar comentarios
                if (strpos(trim($line), '#') === 0) {
                    continue;
                }

                // Parsear línea
                if (strpos($line, '=') !== false) {
                    list($key, $value) = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);

                    // Remover comillas si existen
                    $value = trim($value, '"\'');

                    // Establecer variable de entorno
                    $_ENV[$key] = $value;
                    putenv("$key=$value");
                }
            }
        }
    }

    /**
     * Prevenir la clonación del objeto
     *
     * @return void
     */
    private function __clone() {}

    /**
     * Prevenir la deserialización del objeto
     *
     * @return void
     * @throws Exception
     */
    public function __wakeup()
    {
        throw new Exception("No se puede deserializar un singleton.");
    }

    /**
     * Obtiene la instancia única de la clase Database
     *
     * @return Database Instancia de Database
     */
    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Establece la conexión a la base de datos
     *
     * @return void
     * @throws PDOException
     */
    private function connect(): void
    {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";
            $this->connection = new PDO($dsn, $this->username, $this->password, $this->options);

            // Log de conexión exitosa en modo desarrollo
            if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
                error_log("[DB] Conexión establecida exitosamente a {$this->database}");
            }
        } catch (PDOException $e) {
            // Log del error
            error_log("[DB ERROR] No se pudo conectar a la base de datos: " . $e->getMessage());

            // En producción, no revelar detalles de la base de datos
            if (($_ENV['APP_ENV'] ?? 'production') === 'production') {
                throw new PDOException("Error de conexión a la base de datos. Por favor, contacte al administrador.");
            } else {
                throw $e;
            }
        }
    }

    /**
     * Obtiene la conexión PDO
     *
     * @return PDO Objeto de conexión PDO
     */
    public function getConnection(): PDO
    {
        // Verificar si la conexión sigue activa
        if ($this->connection === null) {
            $this->connect();
        }

        return $this->connection;
    }

    /**
     * Ejecuta una consulta preparada
     *
     * @param string $query Consulta SQL
     * @param array $params Parámetros para la consulta
     * @return PDOStatement Resultado de la consulta
     */
    public function query(string $query, array $params = []): PDOStatement
    {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("[DB QUERY ERROR] " . $e->getMessage() . " | Query: " . $query);
            throw $e;
        }
    }

    /**
     * Inicia una transacción
     *
     * @return bool
     */
    public function beginTransaction(): bool
    {
        return $this->connection->beginTransaction();
    }

    /**
     * Confirma una transacción
     *
     * @return bool
     */
    public function commit(): bool
    {
        return $this->connection->commit();
    }

    /**
     * Revierte una transacción
     *
     * @return bool
     */
    public function rollBack(): bool
    {
        return $this->connection->rollBack();
    }

    /**
     * Obtiene el último ID insertado
     *
     * @return string
     */
    public function lastInsertId(): string
    {
        return $this->connection->lastInsertId();
    }

    /**
     * Cierra la conexión a la base de datos
     *
     * @return void
     */
    public function closeConnection(): void
    {
        $this->connection = null;
    }

    /**
     * Verifica si la conexión está activa
     *
     * @return bool
     */
    public function isConnected(): bool
    {
        try {
            if ($this->connection === null) {
                return false;
            }

            // Hacer una consulta simple para verificar la conexión
            $this->connection->query('SELECT 1');
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
}
