<?php
/**
 * Modelo Video
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase Video - Modelo para gestión de videos educativos
 *
 * Maneja todas las operaciones CRUD relacionadas con videos
 * del sistema de biblioteca digital.
 */
class Video
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Nombre de la tabla */
    private string $table = 'videos';

    // Propiedades del video
    public ?int $id = null;
    public ?string $titulo = null;
    public ?string $descripcion = null;
    public ?string $archivo_path = null;
    public ?string $archivo_nombre = null;
    public ?string $thumbnail_path = null;
    public ?int $duracion = null;
    public ?int $tamanio = null;
    public ?string $formato = null;
    public ?string $resolucion = null;
    public ?string $codec = null;
    public ?int $tema_id = null;
    public ?int $materia_id = null;
    public ?int $grado_id = null;
    public ?int $docente_id = null;
    public int $visualizaciones = 0;
    public string $estado = 'procesando';
    public ?string $fecha_subida = null;
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
     * Crea un nuevo video en la base de datos
     *
     * @return bool|int ID del video creado o false si falla
     */
    public function crear()
    {
        $query = "INSERT INTO {$this->table}
                (titulo, descripcion, archivo_path, archivo_nombre, thumbnail_path,
                 duracion, tamanio, formato, resolucion, codec,
                 tema_id, materia_id, grado_id, docente_id, estado)
                VALUES
                (:titulo, :descripcion, :archivo_path, :archivo_nombre, :thumbnail_path,
                 :duracion, :tamanio, :formato, :resolucion, :codec,
                 :tema_id, :materia_id, :grado_id, :docente_id, :estado)";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':titulo', $this->titulo);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':archivo_path', $this->archivo_path);
            $stmt->bindParam(':archivo_nombre', $this->archivo_nombre);
            $stmt->bindParam(':thumbnail_path', $this->thumbnail_path);
            $stmt->bindParam(':duracion', $this->duracion);
            $stmt->bindParam(':tamanio', $this->tamanio);
            $stmt->bindParam(':formato', $this->formato);
            $stmt->bindParam(':resolucion', $this->resolucion);
            $stmt->bindParam(':codec', $this->codec);
            $stmt->bindParam(':tema_id', $this->tema_id);
            $stmt->bindParam(':materia_id', $this->materia_id);
            $stmt->bindParam(':grado_id', $this->grado_id);
            $stmt->bindParam(':docente_id', $this->docente_id);
            $stmt->bindParam(':estado', $this->estado);

            if ($stmt->execute()) {
                return (int)$this->conn->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Video::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene todos los videos con información completa
     *
     * @param array $filtros Filtros opcionales
     * @param int $limit Número de registros
     * @param int $offset Desplazamiento para paginación
     * @param string $orderBy Campo para ordenar
     * @param string $orderDir Dirección del orden (ASC|DESC)
     * @return array|false
     */
    public function obtenerTodos(
        array $filtros = [],
        int $limit = 20,
        int $offset = 0,
        string $orderBy = 'fecha_subida',
        string $orderDir = 'DESC'
    ) {
        $where = ['v.estado = "activo"'];
        $params = [];

        // Aplicar filtros
        if (!empty($filtros['materia_id'])) {
            $where[] = "v.materia_id = :materia_id";
            $params[':materia_id'] = $filtros['materia_id'];
        }

        if (!empty($filtros['grado_id'])) {
            $where[] = "v.grado_id = :grado_id";
            $params[':grado_id'] = $filtros['grado_id'];
        }

        if (!empty($filtros['tema_id'])) {
            $where[] = "v.tema_id = :tema_id";
            $params[':tema_id'] = $filtros['tema_id'];
        }

        if (!empty($filtros['docente_id'])) {
            $where[] = "v.docente_id = :docente_id";
            $params[':docente_id'] = $filtros['docente_id'];
        }

        if (!empty($filtros['busqueda'])) {
            $where[] = "(v.titulo LIKE :busqueda OR v.descripcion LIKE :busqueda)";
            $params[':busqueda'] = "%{$filtros['busqueda']}%";
        }

        if (!empty($filtros['estado'])) {
            $where[0] = "v.estado = :estado";
            $params[':estado'] = $filtros['estado'];
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        // Validar orden
        $allowedOrderBy = ['fecha_subida', 'visualizaciones', 'titulo', 'id'];
        if (!in_array($orderBy, $allowedOrderBy)) {
            $orderBy = 'fecha_subida';
        }
        $orderDir = strtoupper($orderDir) === 'ASC' ? 'ASC' : 'DESC';

        $query = "SELECT
                    v.*,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    m.color as materia_color,
                    g.nombre as grado_nombre,
                    g.nivel as grado_nivel,
                    t.nombre as tema_nombre,
                    t.nombre_corto as tema_corto,
                    CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) as docente_nombre,
                    u.email as docente_email
                FROM {$this->table} v
                INNER JOIN materias m ON v.materia_id = m.id
                INNER JOIN grados g ON v.grado_id = g.id
                LEFT JOIN temas t ON v.tema_id = t.id
                INNER JOIN usuarios u ON v.docente_id = u.id
                {$whereClause}
                ORDER BY v.{$orderBy} {$orderDir}
                LIMIT :limit OFFSET :offset";

        try {
            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Video::obtenerTodos] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene un video por su ID con información completa
     *
     * @param int $id ID del video
     * @return array|false
     */
    public function obtenerPorId(int $id)
    {
        $query = "SELECT
                    v.*,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    m.color as materia_color,
                    g.nombre as grado_nombre,
                    g.nivel as grado_nivel,
                    t.nombre as tema_nombre,
                    t.nombre_corto as tema_corto,
                    CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) as docente_nombre,
                    u.email as docente_email,
                    u.id as docente_id
                FROM {$this->table} v
                INNER JOIN materias m ON v.materia_id = m.id
                INNER JOIN grados g ON v.grado_id = g.id
                LEFT JOIN temas t ON v.tema_id = t.id
                INNER JOIN usuarios u ON v.docente_id = u.id
                WHERE v.id = :id
                LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Video::obtenerPorId] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza los datos de un video
     *
     * @return bool
     */
    public function actualizar(): bool
    {
        $query = "UPDATE {$this->table}
                SET titulo = :titulo,
                    descripcion = :descripcion,
                    tema_id = :tema_id,
                    materia_id = :materia_id,
                    grado_id = :grado_id,
                    estado = :estado
                WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
            $stmt->bindParam(':titulo', $this->titulo);
            $stmt->bindParam(':descripcion', $this->descripcion);
            $stmt->bindParam(':tema_id', $this->tema_id);
            $stmt->bindParam(':materia_id', $this->materia_id);
            $stmt->bindParam(':grado_id', $this->grado_id);
            $stmt->bindParam(':estado', $this->estado);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Video::actualizar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza el estado de un video
     *
     * @param int $id ID del video
     * @param string $estado Nuevo estado
     * @return bool
     */
    public function actualizarEstado(int $id, string $estado): bool
    {
        $query = "UPDATE {$this->table} SET estado = :estado WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':estado', $estado);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Video::actualizarEstado] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina un video (soft delete)
     *
     * @param int $id ID del video
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
            error_log("[Video::eliminar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina permanentemente un video
     *
     * @param int $id ID del video
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
            error_log("[Video::eliminarPermanente] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Incrementa el contador de visualizaciones
     *
     * @param int $id ID del video
     * @return bool
     */
    public function incrementarVisualizaciones(int $id): bool
    {
        $query = "UPDATE {$this->table}
                SET visualizaciones = visualizaciones + 1
                WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Video::incrementarVisualizaciones] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene los videos más populares
     *
     * @param int $limit Número de videos a retornar
     * @return array|false
     */
    public function obtenerMasPopulares(int $limit = 10)
    {
        $query = "SELECT * FROM vista_videos_populares LIMIT :limit";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Video::obtenerMasPopulares] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene videos recientes
     *
     * @param int $limit Número de videos
     * @return array|false
     */
    public function obtenerRecientes(int $limit = 10)
    {
        return $this->obtenerTodos(
            ['estado' => 'activo'],
            $limit,
            0,
            'fecha_subida',
            'DESC'
        );
    }

    /**
     * Busca videos por texto
     *
     * @param string $busqueda Texto de búsqueda
     * @param int $limit Número de resultados
     * @param int $offset Desplazamiento
     * @return array|false
     */
    public function buscar(string $busqueda, int $limit = 20, int $offset = 0)
    {
        $query = "SELECT
                    v.*,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    g.nombre as grado_nombre,
                    t.nombre as tema_nombre,
                    CONCAT(u.nombre, ' ', u.apellido_paterno) as docente_nombre,
                    MATCH(v.titulo, v.descripcion) AGAINST(:busqueda) as relevancia
                FROM {$this->table} v
                INNER JOIN materias m ON v.materia_id = m.id
                INNER JOIN grados g ON v.grado_id = g.id
                LEFT JOIN temas t ON v.tema_id = t.id
                INNER JOIN usuarios u ON v.docente_id = u.id
                WHERE v.estado = 'activo'
                AND MATCH(v.titulo, v.descripcion) AGAINST(:busqueda IN NATURAL LANGUAGE MODE)
                ORDER BY relevancia DESC, v.visualizaciones DESC
                LIMIT :limit OFFSET :offset";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':busqueda', $busqueda);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // Si falla FULLTEXT, usar LIKE como fallback
            return $this->obtenerTodos(['busqueda' => $busqueda], $limit, $offset);
        }
    }

    /**
     * Cuenta el total de videos según filtros
     *
     * @param array $filtros Filtros opcionales
     * @return int
     */
    public function contar(array $filtros = []): int
    {
        $where = ['estado = "activo"'];
        $params = [];

        if (!empty($filtros['materia_id'])) {
            $where[] = "materia_id = :materia_id";
            $params[':materia_id'] = $filtros['materia_id'];
        }

        if (!empty($filtros['grado_id'])) {
            $where[] = "grado_id = :grado_id";
            $params[':grado_id'] = $filtros['grado_id'];
        }

        if (!empty($filtros['tema_id'])) {
            $where[] = "tema_id = :tema_id";
            $params[':tema_id'] = $filtros['tema_id'];
        }

        if (!empty($filtros['docente_id'])) {
            $where[] = "docente_id = :docente_id";
            $params[':docente_id'] = $filtros['docente_id'];
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
            error_log("[Video::contar] Error: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Obtiene estadísticas de videos por materia
     *
     * @return array|false
     */
    public function estadisticasPorMateria()
    {
        $query = "SELECT * FROM vista_stats_por_materia";

        try {
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Video::estadisticasPorMateria] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene estadísticas de videos por grado
     *
     * @return array|false
     */
    public function estadisticasPorGrado()
    {
        $query = "SELECT * FROM vista_stats_por_grado";

        try {
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Video::estadisticasPorGrado] Error: " . $e->getMessage());
            return false;
        }
    }
}
