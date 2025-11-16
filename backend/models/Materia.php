<?php
/**
 * Modelo Materia
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase Materia - Modelo para gestión de materias/asignaturas
 *
 * Maneja todas las operaciones CRUD relacionadas con materias
 * del currículo educativo boliviano.
 */
class Materia
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Nombre de la tabla */
    private string $table = 'materias';

    // Propiedades de la materia
    public ?int $id = null;
    public ?int $campo_id = null;
    public ?string $nombre = null;
    public ?string $sigla = null;
    public ?string $descripcion = null;
    public ?string $color = null;
    public ?string $icono = null;
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
     * Obtiene todas las materias
     *
     * @param array $filtros Filtros opcionales
     * @return array|false
     */
    public function obtenerTodos(array $filtros = [])
    {
        $where = [];
        $params = [];

        if (!empty($filtros['campo_id'])) {
            $where[] = "m.campo_id = :campo_id";
            $params[':campo_id'] = $filtros['campo_id'];
        }

        if (!empty($filtros['estado'])) {
            $where[] = "m.estado = :estado";
            $params[':estado'] = $filtros['estado'];
        } else {
            $where[] = "m.estado = 'activo'";
        }

        $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

        $query = "SELECT
                    m.*,
                    c.nombre as campo_nombre,
                    c.color as campo_color,
                    c.icono as campo_icono
                  FROM {$this->table} m
                  INNER JOIN campos c ON m.campo_id = c.id
                  {$whereClause}
                  ORDER BY c.orden ASC, m.nombre ASC";

        try {
            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Materia::obtenerTodos] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene una materia por su ID
     *
     * @param int $id ID de la materia
     * @return array|false
     */
    public function obtenerPorId(int $id)
    {
        $query = "SELECT
                    m.*,
                    c.nombre as campo_nombre,
                    c.color as campo_color
                  FROM {$this->table} m
                  INNER JOIN campos c ON m.campo_id = c.id
                  WHERE m.id = :id
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Materia::obtenerPorId] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene una materia con sus temas por grado
     *
     * @param int $id ID de la materia
     * @param int|null $gradoId ID del grado (opcional)
     * @return array|false
     */
    public function obtenerConTemas(int $id, ?int $gradoId = null)
    {
        $materia = $this->obtenerPorId($id);

        if ($materia) {
            $whereGrado = $gradoId ? "AND t.grado_id = :grado_id" : "";

            $queryTemas = "SELECT
                            t.*,
                            g.nombre as grado_nombre,
                            g.nivel as grado_nivel
                           FROM temas t
                           INNER JOIN grados g ON t.grado_id = g.id
                           WHERE t.materia_id = :materia_id
                           AND t.estado = 'activo'
                           {$whereGrado}
                           ORDER BY g.nivel ASC, t.orden ASC";

            $stmtTemas = $this->conn->prepare($queryTemas);
            $stmtTemas->bindParam(':materia_id', $id, PDO::PARAM_INT);

            if ($gradoId) {
                $stmtTemas->bindParam(':grado_id', $gradoId, PDO::PARAM_INT);
            }

            $stmtTemas->execute();
            $materia['temas'] = $stmtTemas->fetchAll(PDO::FETCH_ASSOC);
        }

        return $materia;
    }

    /**
     * Crea una nueva materia
     *
     * @return bool|int ID de la materia creada o false si falla
     */
    public function crear()
    {
        $query = "INSERT INTO {$this->table}
                  (campo_id, nombre, sigla, descripcion, color, icono, estado)
                  VALUES
                  (:campo_id, :nombre, :sigla, :descripcion, :color, :icono, :estado)";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':campo_id', $this->campo_id, PDO::PARAM_INT);
            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':sigla', $this->sigla);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':color', $this->color);
            $stmt->bindParam(':icono', $this->icono);
            $stmt->bindParam(':estado', $this->estado);

            if ($stmt->execute()) {
                return (int)$this->conn->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Materia::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza una materia
     *
     * @return bool
     */
    public function actualizar(): bool
    {
        $query = "UPDATE {$this->table}
                  SET campo_id = :campo_id,
                      nombre = :nombre,
                      sigla = :sigla,
                      descripcion = :descripcion,
                      color = :color,
                      icono = :icono,
                      estado = :estado
                  WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->bindParam(':campo_id', $this->campo_id, PDO::PARAM_INT);
            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':sigla', $this->sigla);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':color', $this->color);
            $stmt->bindParam(':icono', $this->icono);
            $stmt->bindParam(':estado', $this->estado);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Materia::actualizar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina una materia (soft delete)
     *
     * @param int $id ID de la materia
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
            error_log("[Materia::eliminar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene materias agrupadas por campo
     *
     * @return array|false
     */
    public function obtenerPorCampo()
    {
        $query = "SELECT
                    c.id as campo_id,
                    c.nombre as campo_nombre,
                    c.descripcion as campo_descripcion,
                    c.color as campo_color,
                    c.icono as campo_icono,
                    c.orden as campo_orden,
                    m.id as materia_id,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    m.descripcion as materia_descripcion,
                    m.color as materia_color,
                    m.icono as materia_icono
                  FROM campos c
                  LEFT JOIN {$this->table} m ON c.id = m.campo_id AND m.estado = 'activo'
                  WHERE c.estado = 'activo'
                  ORDER BY c.orden ASC, m.nombre ASC";

        try {
            $stmt = $this->conn->query($query);
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Agrupar por campo
            $camposConMaterias = [];
            foreach ($resultados as $row) {
                $campoId = $row['campo_id'];

                if (!isset($camposConMaterias[$campoId])) {
                    $camposConMaterias[$campoId] = [
                        'id' => $row['campo_id'],
                        'nombre' => $row['campo_nombre'],
                        'descripcion' => $row['campo_descripcion'],
                        'color' => $row['campo_color'],
                        'icono' => $row['campo_icono'],
                        'orden' => $row['campo_orden'],
                        'materias' => []
                    ];
                }

                if ($row['materia_id']) {
                    $camposConMaterias[$campoId]['materias'][] = [
                        'id' => $row['materia_id'],
                        'nombre' => $row['materia_nombre'],
                        'sigla' => $row['materia_sigla'],
                        'descripcion' => $row['materia_descripcion'],
                        'color' => $row['materia_color'],
                        'icono' => $row['materia_icono']
                    ];
                }
            }

            return array_values($camposConMaterias);
        } catch (PDOException $e) {
            error_log("[Materia::obtenerPorCampo] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cuenta el total de materias
     *
     * @param array $filtros Filtros opcionales
     * @return int
     */
    public function contar(array $filtros = []): int
    {
        $where = ["estado = 'activo'"];
        $params = [];

        if (!empty($filtros['campo_id'])) {
            $where[] = "campo_id = :campo_id";
            $params[':campo_id'] = $filtros['campo_id'];
        }

        if (!empty($filtros['estado'])) {
            $where[0] = "estado = :estado";
            $params[':estado'] = $filtros['estado'];
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);
        $query = "SELECT COUNT(*) as total FROM {$this->table} {$whereClause}";

        try {
            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['total'];
        } catch (PDOException $e) {
            error_log("[Materia::contar] Error: " . $e->getMessage());
            return 0;
        }
    }
}
