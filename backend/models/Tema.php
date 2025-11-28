<?php
/**
 * Modelo Tema
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase Tema - Modelo para gestión de temas curriculares
 *
 * Maneja todas las operaciones CRUD relacionadas con temas
 * del currículo boliviano por materia y grado.
 */
class Tema
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Nombre de la tabla */
    private string $table = 'temas';

    // Propiedades del tema
    public ?int $id = null;
    public ?string $nombre = null;
    public ?string $nombre_corto = null;
    public ?string $descripcion = null;
    public ?int $materia_id = null;
    public ?int $grado_id = null;
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
     * Obtiene todos los temas con filtros
     *
     * @param array $filtros Filtros opcionales
     * @return array|false
     */
    public function obtenerTodos(array $filtros = [])
    {
        $where = [];
        $params = [];

        if (!empty($filtros['materia_id'])) {
            $where[] = "t.materia_id = :materia_id";
            $params[':materia_id'] = $filtros['materia_id'];
        }

        if (!empty($filtros['grado_id'])) {
            $where[] = "t.grado_id = :grado_id";
            $params[':grado_id'] = $filtros['grado_id'];
        }

        if (!empty($filtros['estado'])) {
            $where[] = "t.estado = :estado";
            $params[':estado'] = $filtros['estado'];
        } else {
            $where[] = "t.estado = 'activo'";
        }

        $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

        $query = "SELECT
                    t.*,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    m.color as materia_color,
                    g.nombre as grado_nombre,
                    g.nivel as grado_nivel
                  FROM {$this->table} t
                  INNER JOIN materias m ON t.materia_id = m.id
                  INNER JOIN grados g ON t.grado_id = g.id
                  {$whereClause}
                  ORDER BY g.nivel ASC, m.nombre ASC, t.orden ASC";

        try {
            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Tema::obtenerTodos] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un tema por su ID
     *
     * @param int $id ID del tema
     * @return array|false
     */
    public function obtenerPorId(int $id)
    {
        $query = "SELECT
                    t.*,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    m.color as materia_color,
                    g.nombre as grado_nombre,
                    g.nivel as grado_nivel
                  FROM {$this->table} t
                  INNER JOIN materias m ON t.materia_id = m.id
                  INNER JOIN grados g ON t.grado_id = g.id
                  WHERE t.id = :id
                  LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Tema::obtenerPorId] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene temas agrupados por materia y grado
     *
     * @param int|null $materiaId ID de la materia (opcional)
     * @param int|null $gradoId ID del grado (opcional)
     * @return array|false
     */
    public function obtenerPorMateriaYGrado(?int $materiaId = null, ?int $gradoId = null)
    {
        $onConditions = ["t.materia_id = m.id", "t.grado_id = g.id", "t.estado = 'activo'"];
        $whereConditions = ["g.estado = 'activo'", "m.estado = 'activo'"];
        $params = [];

        if ($materiaId) {
            $whereConditions[] = "m.id = :materia_id";
            $params[':materia_id'] = $materiaId;
        }

        if ($gradoId) {
            $whereConditions[] = "g.id = :grado_id";
            $params[':grado_id'] = $gradoId;
        }

        $onClause = implode(' AND ', $onConditions);
        $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);

        $query = "SELECT
                    g.id as grado_id,
                    g.nombre as grado_nombre,
                    g.nivel as grado_nivel,
                    m.id as materia_id,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    m.color as materia_color,
                    t.id as tema_id,
                    t.nombre as tema_nombre,
                    t.nombre_corto as tema_nombre_corto,
                    t.orden as tema_orden
                  FROM grados g
                  CROSS JOIN materias m
                  LEFT JOIN {$this->table} t ON {$onClause}
                  {$whereClause}
                  ORDER BY g.nivel ASC, m.nombre ASC, t.orden ASC";

        try {
            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Agrupar por grado y materia
            $estructura = [];
            foreach ($resultados as $row) {
                $gradoId = $row['grado_id'];
                $materiaId = $row['materia_id'];

                if (!isset($estructura[$gradoId])) {
                    $estructura[$gradoId] = [
                        'id' => $row['grado_id'],
                        'nombre' => $row['grado_nombre'],
                        'nivel' => $row['grado_nivel'],
                        'materias' => []
                    ];
                }

                if (!isset($estructura[$gradoId]['materias'][$materiaId])) {
                    $estructura[$gradoId]['materias'][$materiaId] = [
                        'id' => $row['materia_id'],
                        'nombre' => $row['materia_nombre'],
                        'sigla' => $row['materia_sigla'],
                        'color' => $row['materia_color'],
                        'temas' => []
                    ];
                }

                if ($row['tema_id']) {
                    $estructura[$gradoId]['materias'][$materiaId]['temas'][] = [
                        'id' => $row['tema_id'],
                        'nombre' => $row['tema_nombre'],
                        'nombre_corto' => $row['tema_nombre_corto'],
                        'orden' => $row['tema_orden']
                    ];
                }
            }

            // Convertir a arrays indexados
            foreach ($estructura as $gradoId => $grado) {
                $estructura[$gradoId]['materias'] = array_values($grado['materias']);
            }

            return array_values($estructura);
        } catch (PDOException $e) {
            error_log("[Tema::obtenerPorMateriaYGrado] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Crea un nuevo tema
     *
     * @return bool|int ID del tema creado o false si falla
     */
    public function crear()
    {
        $query = "INSERT INTO {$this->table}
                  (nombre, nombre_corto, descripcion, materia_id, grado_id, estado, orden)
                  VALUES
                  (:nombre, :nombre_corto, :descripcion, :materia_id, :grado_id, :estado, :orden)";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':nombre_corto', $this->nombre_corto);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':materia_id', $this->materia_id, PDO::PARAM_INT);
            $stmt->bindParam(':grado_id', $this->grado_id, PDO::PARAM_INT);
            $stmt->bindParam(':estado', $this->estado);
            $stmt->bindParam(':orden', $this->orden, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return (int)$this->conn->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Tema::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza un tema
     *
     * @return bool
     */
    public function actualizar(): bool
    {
        $query = "UPDATE {$this->table}
                  SET nombre = :nombre,
                      nombre_corto = :nombre_corto,
                      descripcion = :descripcion,
                      materia_id = :materia_id,
                      grado_id = :grado_id,
                      estado = :estado,
                      orden = :orden
                  WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':nombre_corto', $this->nombre_corto);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':materia_id', $this->materia_id, PDO::PARAM_INT);
            $stmt->bindParam(':grado_id', $this->grado_id, PDO::PARAM_INT);
            $stmt->bindParam(':estado', $this->estado);
            $stmt->bindParam(':orden', $this->orden, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Tema::actualizar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina un tema (soft delete)
     *
     * @param int $id ID del tema
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
            error_log("[Tema::eliminar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cuenta el total de temas según filtros
     *
     * @param array $filtros Filtros opcionales
     * @return int
     */
    public function contar(array $filtros = []): int
    {
        $where = ["estado = 'activo'"];
        $params = [];

        if (!empty($filtros['materia_id'])) {
            $where[] = "materia_id = :materia_id";
            $params[':materia_id'] = $filtros['materia_id'];
        }

        if (!empty($filtros['grado_id'])) {
            $where[] = "grado_id = :grado_id";
            $params[':grado_id'] = $filtros['grado_id'];
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
            error_log("[Tema::contar] Error: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Busca temas por texto
     *
     * @param string $busqueda Texto de búsqueda
     * @param int|null $materiaId ID de la materia (opcional)
     * @param int|null $gradoId ID del grado (opcional)
     * @return array|false
     */
    public function buscar(string $busqueda, ?int $materiaId = null, ?int $gradoId = null)
    {
        $where = ["t.estado = 'activo'", "t.nombre LIKE :busqueda"];
        $params = [':busqueda' => "%{$busqueda}%"];

        if ($materiaId) {
            $where[] = "t.materia_id = :materia_id";
            $params[':materia_id'] = $materiaId;
        }

        if ($gradoId) {
            $where[] = "t.grado_id = :grado_id";
            $params[':grado_id'] = $gradoId;
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        $query = "SELECT
                    t.*,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    g.nombre as grado_nombre,
                    g.nivel as grado_nivel
                  FROM {$this->table} t
                  INNER JOIN materias m ON t.materia_id = m.id
                  INNER JOIN grados g ON t.grado_id = g.id
                  {$whereClause}
                  ORDER BY g.nivel ASC, m.nombre ASC, t.orden ASC
                  LIMIT 50";

        try {
            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Tema::buscar] Error: " . $e->getMessage());
            return false;
        }
    }
}
