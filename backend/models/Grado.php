<?php
/**
 * Modelo Grado
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase Grado - Modelo para gestión de grados escolares
 *
 * Maneja todas las operaciones CRUD relacionadas con grados
 * del nivel secundario (1-6).
 */
class Grado
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Nombre de la tabla */
    private string $table = 'grados';

    // Propiedades del grado
    public ?int $id = null;
    public ?string $nombre = null;
    public ?int $nivel = null;
    public ?string $sigla = null;
    public ?string $descripcion = null;
    public int $orden = 0;
    public string $estado = 'activo';
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
     * Obtiene todos los grados
     *
     * @param string $estado Estado de los grados (activo|inactivo|todos)
     * @return array|false
     */
    public function obtenerTodos(string $estado = 'activo')
    {
        $whereClause = $estado !== 'todos' ? "WHERE estado = :estado" : "";

        $query = "SELECT * FROM {$this->table}
                  {$whereClause}
                  ORDER BY nivel ASC";

        try {
            $stmt = $this->conn->prepare($query);

            if ($estado !== 'todos') {
                $stmt->bindParam(':estado', $estado);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Grado::obtenerTodos] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un grado por su ID
     *
     * @param int $id ID del grado
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
            error_log("[Grado::obtenerPorId] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un grado por su nivel
     *
     * @param int $nivel Nivel del grado (1-6)
     * @return array|false
     */
    public function obtenerPorNivel(int $nivel)
    {
        $query = "SELECT * FROM {$this->table}
                  WHERE nivel = :nivel AND estado = 'activo'
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nivel', $nivel, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Grado::obtenerPorNivel] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un grado con sus temas por materia
     *
     * @param int $id ID del grado
     * @param int|null $materiaId ID de la materia (opcional)
     * @return array|false
     */
    public function obtenerConTemas(int $id, ?int $materiaId = null)
    {
        $grado = $this->obtenerPorId($id);

        if ($grado) {
            $whereMateria = $materiaId ? "AND t.materia_id = :materia_id" : "";

            $queryTemas = "SELECT
                            t.*,
                            m.nombre as materia_nombre,
                            m.sigla as materia_sigla,
                            m.color as materia_color
                           FROM temas t
                           INNER JOIN materias m ON t.materia_id = m.id
                           WHERE t.grado_id = :grado_id
                           AND t.estado = 'activo'
                           {$whereMateria}
                           ORDER BY m.nombre ASC, t.orden ASC";

            $stmtTemas = $this->conn->prepare($queryTemas);
            $stmtTemas->bindParam(':grado_id', $id, PDO::PARAM_INT);

            if ($materiaId) {
                $stmtTemas->bindParam(':materia_id', $materiaId, PDO::PARAM_INT);
            }

            $stmtTemas->execute();
            $grado['temas'] = $stmtTemas->fetchAll(PDO::FETCH_ASSOC);
        }

        return $grado;
    }

    /**
     * Crea un nuevo grado
     *
     * @return bool|int ID del grado creado o false si falla
     */
    public function crear()
    {
        $query = "INSERT INTO {$this->table}
                  (nombre, nivel, sigla, descripcion, orden, estado)
                  VALUES
                  (:nombre, :nivel, :sigla, :descripcion, :orden, :estado)";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':nivel', $this->nivel, PDO::PARAM_INT);
            $stmt->bindParam(':sigla', $this->sigla);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':orden', $this->orden, PDO::PARAM_INT);
            $stmt->bindParam(':estado', $this->estado);

            if ($stmt->execute()) {
                return (int)$this->conn->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Grado::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza un grado
     *
     * @return bool
     */
    public function actualizar(): bool
    {
        $query = "UPDATE {$this->table}
                  SET nombre = :nombre,
                      nivel = :nivel,
                      sigla = :sigla,
                      descripcion = :descripcion,
                      orden = :orden,
                      estado = :estado
                  WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':nivel', $this->nivel, PDO::PARAM_INT);
            $stmt->bindParam(':sigla', $this->sigla);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':orden', $this->orden, PDO::PARAM_INT);
            $stmt->bindParam(':estado', $this->estado);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Grado::actualizar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina un grado (soft delete)
     *
     * @param int $id ID del grado
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
            error_log("[Grado::eliminar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cuenta el total de grados
     *
     * @param string $estado Estado de los grados
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
            error_log("[Grado::contar] Error: " . $e->getMessage());
            return 0;
        }
    }
}
