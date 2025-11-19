<?php
/**
 * Modelo Usuario
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase Usuario - Modelo para gestión de usuarios
 *
 * Maneja todas las operaciones CRUD relacionadas con usuarios
 * (administradores y docentes) del sistema.
 */
class Usuario
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Nombre de la tabla */
    private string $table = 'usuarios';

    // Propiedades del usuario
    public ?int $id = null;
    public ?string $nombre = null;
    public ?string $apellido_paterno = null;
    public ?string $apellido_materno = null;
    public ?string $ci = null;
    public ?string $email = null;
    public ?string $password = null;
    public ?string $password_hash = null;
    public ?int $rol_id = null;
    public ?int $grado_id = null;
    public ?int $materia_id = null;
    public ?string $telefono = null;
    public ?string $foto_perfil = null;
    public ?string $estado = 'activo';
    public ?string $ultimo_acceso = null;
    public int $intentos_login = 0;
    public ?string $bloqueado_hasta = null;
    public ?string $fecha_creacion = null;
    public ?string $fecha_actualizacion = null;

    /**
     * Constructor
     */
    public function __construct()
    {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Crea un nuevo usuario en la base de datos
     *
     * @return bool|int ID del usuario creado o false si falla
     */
    public function crear()
    {
        $query = "INSERT INTO {$this->table}
                (nombre, apellido_paterno, apellido_materno, ci, email, password_hash,
                 rol_id, telefono, estado)
                VALUES
                (:nombre, :apellido_paterno, :apellido_materno, :ci, :email, :password_hash,
                 :rol_id, :telefono, :estado)";

        try {
            $stmt = $this->conn->prepare($query);

            // Hash del password
            $hashed_password = password_hash($this->password, PASSWORD_BCRYPT, ['cost' => 12]);

            // Bind de parámetros
            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':apellido_paterno', $this->apellido_paterno);
            $stmt->bindParam(':apellido_materno', $this->apellido_materno);
            $stmt->bindParam(':ci', $this->ci);
            $stmt->bindParam(':email', $this->email);
            $stmt->bindParam(':password_hash', $hashed_password);
            $stmt->bindParam(':rol_id', $this->rol_id);
            $stmt->bindParam(':telefono', $this->telefono);
            $stmt->bindParam(':estado', $this->estado);

            if ($stmt->execute()) {
                return (int)$this->conn->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Usuario::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene todos los usuarios con filtros opcionales
     *
     * @param array $filtros Filtros opcionales (rol, estado, etc.)
     * @param int $limit Número de registros a retornar
     * @param int $offset Desplazamiento para paginación
     * @return array|false Array de usuarios o false si falla
     */
    public function obtenerTodos(array $filtros = [], int $limit = 20, int $offset = 0)
    {
        $where = [];
        $params = [];

        // Aplicar filtros
        if (!empty($filtros['rol_id'])) {
            $where[] = "u.rol_id = :rol_id";
            $params[':rol_id'] = $filtros['rol_id'];
        }

        if (!empty($filtros['estado'])) {
            $where[] = "u.estado = :estado";
            $params[':estado'] = $filtros['estado'];
        }

        if (!empty($filtros['materia_id'])) {
            $where[] = "EXISTS (SELECT 1 FROM asignaciones a WHERE a.docente_id = u.id AND a.materia_id = :materia_id AND a.estado = 'activa')";
            $params[':materia_id'] = $filtros['materia_id'];
        }

        if (!empty($filtros['grado_id'])) {
            $where[] = "EXISTS (SELECT 1 FROM asignaciones a WHERE a.docente_id = u.id AND a.grado_id = :grado_id AND a.estado = 'activa')";
            $params[':grado_id'] = $filtros['grado_id'];
        }

        if (!empty($filtros['busqueda'])) {
            $where[] = "(u.nombre LIKE :busqueda OR u.apellido_paterno LIKE :busqueda OR u.email LIKE :busqueda OR u.ci LIKE :busqueda)";
            $params[':busqueda'] = "%{$filtros['busqueda']}%";
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $query = "SELECT
                    u.id,
                    u.nombre,
                    u.apellido_paterno,
                    u.apellido_materno,
                    u.email,
                    u.ci,
                    u.telefono,
                    u.rol_id,
                    u.estado,
                    u.foto_perfil,
                    u.fecha_creacion,
                    u.fecha_actualizacion,
                    u.ultimo_acceso,
                    u.intentos_login,
                    r.nombre as rol,
                    r.nombre as rol_nombre,
                    GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') as materias_asignadas,
                    GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.orden SEPARATOR ', ') as grados_asignados,
                    COUNT(DISTINCT CASE WHEN a.estado = 'activa' THEN a.id END) as total_asignaciones
                FROM {$this->table} u
                LEFT JOIN roles r ON u.rol_id = r.id
                LEFT JOIN asignaciones a ON u.id = a.docente_id
                LEFT JOIN materias m ON a.materia_id = m.id AND a.estado = 'activa'
                LEFT JOIN grados g ON a.grado_id = g.id AND a.estado = 'activa'
                {$whereClause}
                GROUP BY u.id
                ORDER BY u.fecha_creacion DESC
                LIMIT :limit OFFSET :offset";

        try {
            $stmt = $this->conn->prepare($query);

            // Bind filtros
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            // Bind paginación
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Usuario::obtenerTodos] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un usuario por su ID
     *
     * @param int $id ID del usuario
     * @return array|false Datos del usuario o false si no existe
     */
    public function obtenerPorId(int $id)
    {
        $query = "SELECT
                    u.id,
                    u.nombre,
                    u.apellido_paterno,
                    u.apellido_materno,
                    u.email,
                    u.ci,
                    u.telefono,
                    u.rol_id,
                    u.estado,
                    u.foto_perfil,
                    u.fecha_creacion,
                    u.fecha_actualizacion,
                    u.ultimo_acceso,
                    u.intentos_login,
                    r.nombre as rol,
                    r.nombre as rol_nombre,
                    GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') as materias_asignadas,
                    GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.orden SEPARATOR ', ') as grados_asignados,
                    COUNT(DISTINCT CASE WHEN a.estado = 'activa' THEN a.id END) as total_asignaciones
                FROM {$this->table} u
                LEFT JOIN roles r ON u.rol_id = r.id
                LEFT JOIN asignaciones a ON u.id = a.docente_id
                LEFT JOIN materias m ON a.materia_id = m.id AND a.estado = 'activa'
                LEFT JOIN grados g ON a.grado_id = g.id AND a.estado = 'activa'
                WHERE u.id = :id
                GROUP BY u.id
                LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                // Eliminar el hash del password por seguridad
                unset($row['password_hash']);
                return $row;
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Usuario::obtenerPorId] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un usuario por email
     *
     * @param string $email Email del usuario
     * @return array|false Datos del usuario o false si no existe
     */
    public function obtenerPorEmail(string $email)
    {
        $query = "SELECT u.*, r.nombre as rol_nombre, r.permisos as rol_permisos
                FROM {$this->table} u
                LEFT JOIN roles r ON u.rol_id = r.id
                WHERE u.email = :email
                LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Usuario::obtenerPorEmail] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un usuario por CI (Cédula de Identidad)
     *
     * @param string $ci Cédula de identidad
     * @return array|false Datos del usuario o false si no existe
     */
    public function obtenerPorCI(string $ci)
    {
        $query = "SELECT * FROM {$this->table} WHERE ci = :ci LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':ci', $ci);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                unset($row['password_hash']);
                return $row;
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Usuario::obtenerPorCI] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza los datos de un usuario
     *
     * @return bool True si se actualizó correctamente, false en caso contrario
     */
    public function actualizar(): bool
    {
        $query = "UPDATE {$this->table}
                SET nombre = :nombre,
                    apellido_paterno = :apellido_paterno,
                    apellido_materno = :apellido_materno,
                    ci = :ci,
                    email = :email,
                    rol_id = :rol_id,
                    telefono = :telefono,
                    estado = :estado
                WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':apellido_paterno', $this->apellido_paterno);
            $stmt->bindParam(':apellido_materno', $this->apellido_materno);
            $stmt->bindParam(':ci', $this->ci);
            $stmt->bindParam(':email', $this->email);
            $stmt->bindParam(':rol_id', $this->rol_id);
            $stmt->bindParam(':telefono', $this->telefono);
            $stmt->bindParam(':estado', $this->estado);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Usuario::actualizar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza la contraseña de un usuario
     *
     * @param int $id ID del usuario
     * @param string $newPassword Nueva contraseña
     * @return bool
     */
    public function actualizarPassword(int $id, string $newPassword): bool
    {
        $query = "UPDATE {$this->table} SET password_hash = :password_hash WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $hashed_password = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

            $stmt->bindParam(':password_hash', $hashed_password);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Usuario::actualizarPassword] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina un usuario (soft delete - cambiar estado)
     *
     * @param int $id ID del usuario
     * @return bool
     */
    public function eliminar(int $id): bool
    {
        $query = "UPDATE {$this->table} SET estado = 'inactivo' WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Usuario::eliminar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina permanentemente un usuario
     *
     * @param int $id ID del usuario
     * @return bool
     */
    public function eliminarPermanente(int $id): bool
    {
        $query = "DELETE FROM {$this->table} WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Usuario::eliminarPermanente] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifica la contraseña de un usuario
     *
     * @param string $email Email del usuario
     * @param string $password Contraseña a verificar
     * @return array|false Datos del usuario si la contraseña es correcta, false en caso contrario
     */
    public function verificarPassword(string $email, string $password)
    {
        $usuario = $this->obtenerPorEmail($email);

        if (!$usuario) {
            return false;
        }

        if (password_verify($password, $usuario['password_hash'])) {
            // Eliminar el hash del password antes de retornar
            unset($usuario['password_hash']);
            return $usuario;
        }

        return false;
    }

    /**
     * Actualiza el último acceso del usuario
     *
     * @param int $id ID del usuario
     * @return bool
     */
    public function actualizarUltimoAcceso(int $id): bool
    {
        $query = "UPDATE {$this->table}
                SET ultimo_acceso = CURRENT_TIMESTAMP,
                    intentos_login = 0
                WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Usuario::actualizarUltimoAcceso] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Incrementa el contador de intentos de login fallidos
     *
     * @param string $email Email del usuario
     * @return bool
     */
    public function incrementarIntentosLogin(string $email): bool
    {
        $query = "UPDATE {$this->table}
                SET intentos_login = intentos_login + 1
                WHERE email = :email";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Usuario::incrementarIntentosLogin] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Bloquea un usuario temporalmente
     *
     * @param string $email Email del usuario
     * @param int $minutos Minutos de bloqueo
     * @return bool
     */
    public function bloquearUsuario(string $email, int $minutos = 15): bool
    {
        $query = "UPDATE {$this->table}
                SET bloqueado_hasta = DATE_ADD(NOW(), INTERVAL :minutos MINUTE)
                WHERE email = :email";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':minutos', $minutos, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Usuario::bloquearUsuario] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifica si un usuario está bloqueado
     *
     * @param string $email Email del usuario
     * @return bool
     */
    public function estaBloqueado(string $email): bool
    {
        $query = "SELECT bloqueado_hasta FROM {$this->table}
                WHERE email = :email AND bloqueado_hasta > NOW()
                LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("[Usuario::estaBloqueado] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cuenta el total de usuarios según filtros
     *
     * @param array $filtros Filtros opcionales
     * @return int
     */
    public function contar(array $filtros = []): int
    {
        $where = [];
        $params = [];

        if (!empty($filtros['rol_id'])) {
            $where[] = "u.rol_id = :rol_id";
            $params[':rol_id'] = $filtros['rol_id'];
        }

        if (!empty($filtros['estado'])) {
            $where[] = "u.estado = :estado";
            $params[':estado'] = $filtros['estado'];
        }

        if (!empty($filtros['materia_id'])) {
            $where[] = "EXISTS (SELECT 1 FROM asignaciones a WHERE a.docente_id = u.id AND a.materia_id = :materia_id AND a.estado = 'activa')";
            $params[':materia_id'] = $filtros['materia_id'];
        }

        if (!empty($filtros['grado_id'])) {
            $where[] = "EXISTS (SELECT 1 FROM asignaciones a WHERE a.docente_id = u.id AND a.grado_id = :grado_id AND a.estado = 'activa')";
            $params[':grado_id'] = $filtros['grado_id'];
        }

        if (!empty($filtros['busqueda'])) {
            $where[] = "(u.nombre LIKE :busqueda OR u.apellido_paterno LIKE :busqueda OR u.email LIKE :busqueda OR u.ci LIKE :busqueda)";
            $params[':busqueda'] = "%{$filtros['busqueda']}%";
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $query = "SELECT COUNT(DISTINCT u.id) as total FROM {$this->table} u {$whereClause}";

        try {
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['total'];
        } catch (PDOException $e) {
            error_log("[Usuario::contar] Error: " . $e->getMessage());
            return 0;
        }
    }
}
