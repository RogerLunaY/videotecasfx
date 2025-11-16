<?php
/**
 * Modelo Campo
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase Campo - Modelo para gestión de campos de saberes y conocimientos
 *
 * Maneja todas las operaciones CRUD relacionadas con campos
 * del currículo boliviano.
 */
class Campo
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Nombre de la tabla */
    private string $table = 'campos';

    // Propiedades del campo
    public ?int $id = null;
    public ?string $nombre = null;
    public ?string $descripcion = null;
    public ?string $color = null;
    public ?string $icono = null;
    public string $estado = 'activo';
    public int $orden = 0;
    public ?string $fecha_creacion = null;

    /**
     * Constructor
     */
    public function __construct()
    {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Obtiene todos los campos activos
     *
     * @param string $estado Estado de los campos (activo|inactivo|todos)
     * @return array|false
     */
    public function obtenerTodos(string $estado = 'activo')
    {
        $whereClause = $estado !== 'todos' ? "WHERE estado = :estado" : "";

        $query = "SELECT * FROM {$this->table}
                  {$whereClause}
                  ORDER BY orden ASC, nombre ASC";

        try {
            $stmt = $this->conn->prepare($query);

            if ($estado !== 'todos') {
                $stmt->bindParam(':estado', $estado);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Campo::obtenerTodos] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un campo por su ID
     *
     * @param int $id ID del campo
     * @return array|false
     */
    public function obtenerPorId(int $id)
    {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Campo::obtenerPorId] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un campo con sus materias asociadas
     *
     * @param int $id ID del campo
     * @return array|false
     */
    public function obtenerConMaterias(int $id)
    {
        $query = "SELECT
                    c.*,
                    COUNT(m.id) as total_materias
                  FROM {$this->table} c
                  LEFT JOIN materias m ON c.id = m.campo_id AND m.estado = 'activo'
                  WHERE c.id = :id
                  GROUP BY c.id
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $campo = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($campo) {
                // Obtener las materias del campo
                $queryMaterias = "SELECT * FROM materias
                                 WHERE campo_id = :campo_id AND estado = 'activo'
                                 ORDER BY nombre ASC";
                $stmtMaterias = $this->conn->prepare($queryMaterias);
                $stmtMaterias->bindParam(':campo_id', $id, PDO::PARAM_INT);
                $stmtMaterias->execute();
                $campo['materias'] = $stmtMaterias->fetchAll(PDO::FETCH_ASSOC);
            }

            return $campo;
        } catch (PDOException $e) {
            error_log("[Campo::obtenerConMaterias] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Crea un nuevo campo
     *
     * @return bool|int ID del campo creado o false si falla
     */
    public function crear()
    {
        $query = "INSERT INTO {$this->table}
                  (nombre, descripcion, color, icono, estado, orden)
                  VALUES
                  (:nombre, :descripcion, :color, :icono, :estado, :orden)";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':color', $this->color);
            $stmt->bindParam(':icono', $this->icono);
            $stmt->bindParam(':estado', $this->estado);
            $stmt->bindParam(':orden', $this->orden, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return (int)$this->conn->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Campo::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza un campo
     *
     * @return bool
     */
    public function actualizar(): bool
    {
        $query = "UPDATE {$this->table}
                  SET nombre = :nombre,
                      descripcion = :descripcion,
                      color = :color,
                      icono = :icono,
                      estado = :estado,
                      orden = :orden
                  WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':color', $this->color);
            $stmt->bindParam(':icono', $this->icono);
            $stmt->bindParam(':estado', $this->estado);
            $stmt->bindParam(':orden', $this->orden, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Campo::actualizar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina un campo (soft delete)
     *
     * @param int $id ID del campo
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
            error_log("[Campo::eliminar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cuenta el total de campos
     *
     * @param string $estado Estado de los campos
     * @return int
     */
    public function contar(string $estado = 'activo'): int
    {
        $whereClause = $estado !== 'todos' ? "WHERE estado = :estado" : "";
        $query = "SELECT COUNT(*) as total FROM {$this->table} {$whereClause}";

        try {
            $stmt = $this->conn->prepare($query);

            if ($estado !== 'todos') {
                $stmt->bindParam(':estado', $estado);
            }

            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['total'];
        } catch (PDOException $e) {
            error_log("[Campo::contar] Error: " . $e->getMessage());
            return 0;
        }
    }
}
