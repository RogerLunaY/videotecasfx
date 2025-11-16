<?php
/**
 * Modelo Reproduccion
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase Reproduccion - Modelo para registro de reproducciones de videos
 *
 * Registra y gestiona las estadísticas de visualización de videos
 * por parte de los estudiantes y docentes.
 */
class Reproduccion
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Nombre de la tabla */
    private string $table = 'reproducciones';

    // Propiedades de la reproducción
    public ?int $id = null;
    public ?int $video_id = null;
    public ?int $usuario_id = null;
    public ?string $ip_address = null;
    public ?string $user_agent = null;
    public ?int $tiempo_reproducido = null;
    public ?float $porcentaje_visto = null;
    public bool $completado = false;
    public ?string $fecha_inicio = null;
    public ?string $fecha_fin = null;

    /**
     * Constructor
     */
    public function __construct()
    {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Registra una nueva reproducción
     *
     * @return bool|int ID de la reproducción creada o false si falla
     */
    public function crear()
    {
        $query = "INSERT INTO {$this->table}
                (video_id, usuario_id, ip_address, user_agent, tiempo_reproducido,
                 porcentaje_visto, completado)
                VALUES
                (:video_id, :usuario_id, :ip_address, :user_agent, :tiempo_reproducido,
                 :porcentaje_visto, :completado)";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':video_id', $this->video_id, PDO::PARAM_INT);
            $stmt->bindParam(':usuario_id', $this->usuario_id, PDO::PARAM_INT);
            $stmt->bindParam(':ip_address', $this->ip_address);
            $stmt->bindParam(':user_agent', $this->user_agent);
            $stmt->bindParam(':tiempo_reproducido', $this->tiempo_reproducido, PDO::PARAM_INT);
            $stmt->bindParam(':porcentaje_visto', $this->porcentaje_visto);
            $stmt->bindParam(':completado', $this->completado, PDO::PARAM_BOOL);

            if ($stmt->execute()) {
                return (int)$this->conn->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Reproduccion::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza una reproducción existente
     *
     * @param int $id ID de la reproducción
     * @param int $tiempoReproducido Tiempo total reproducido
     * @param float $porcentajeVisto Porcentaje visto
     * @param bool $completado Si se completó el video
     * @return bool
     */
    public function actualizar(int $id, int $tiempoReproducido, float $porcentajeVisto, bool $completado): bool
    {
        $query = "UPDATE {$this->table}
                SET tiempo_reproducido = :tiempo_reproducido,
                    porcentaje_visto = :porcentaje_visto,
                    completado = :completado,
                    fecha_fin = CURRENT_TIMESTAMP
                WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->bindParam(':tiempo_reproducido', $tiempoReproducido, PDO::PARAM_INT);
            $stmt->bindParam(':porcentaje_visto', $porcentajeVisto);
            $stmt->bindParam(':completado', $completado, PDO::PARAM_BOOL);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Reproduccion::actualizar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene todas las reproducciones de un video
     *
     * @param int $videoId ID del video
     * @param int $limit Límite de resultados
     * @param int $offset Desplazamiento
     * @return array|false
     */
    public function obtenerPorVideo(int $videoId, int $limit = 100, int $offset = 0)
    {
        $query = "SELECT
                    r.*,
                    v.titulo as video_titulo,
                    CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario_nombre
                FROM {$this->table} r
                INNER JOIN videos v ON r.video_id = v.id
                LEFT JOIN usuarios u ON r.usuario_id = u.id
                WHERE r.video_id = :video_id
                ORDER BY r.fecha_inicio DESC
                LIMIT :limit OFFSET :offset";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':video_id', $videoId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Reproduccion::obtenerPorVideo] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene todas las reproducciones de un usuario
     *
     * @param int $usuarioId ID del usuario
     * @param int $limit Límite de resultados
     * @param int $offset Desplazamiento
     * @return array|false
     */
    public function obtenerPorUsuario(int $usuarioId, int $limit = 100, int $offset = 0)
    {
        $query = "SELECT
                    r.*,
                    v.titulo as video_titulo,
                    v.thumbnail_path,
                    m.nombre as materia_nombre,
                    g.nombre as grado_nombre
                FROM {$this->table} r
                INNER JOIN videos v ON r.video_id = v.id
                INNER JOIN materias m ON v.materia_id = m.id
                INNER JOIN grados g ON v.grado_id = g.id
                WHERE r.usuario_id = :usuario_id
                ORDER BY r.fecha_inicio DESC
                LIMIT :limit OFFSET :offset";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Reproduccion::obtenerPorUsuario] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Cuenta el total de reproducciones por video
     *
     * @param int $videoId ID del video
     * @return int
     */
    public function contarPorVideo(int $videoId): int
    {
        $query = "SELECT COUNT(*) as total
                FROM {$this->table}
                WHERE video_id = :video_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':video_id', $videoId, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['total'];
        } catch (PDOException $e) {
            error_log("[Reproduccion::contarPorVideo] Error: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Obtiene estadísticas de reproducciones por rango de fechas
     *
     * @param string $fechaInicio Fecha inicial (Y-m-d)
     * @param string $fechaFin Fecha final (Y-m-d)
     * @return array|false
     */
    public function obtenerEstadisticasPorFecha(string $fechaInicio, string $fechaFin)
    {
        $query = "SELECT
                    DATE(fecha_inicio) as fecha,
                    COUNT(*) as total_reproducciones,
                    COUNT(DISTINCT video_id) as videos_diferentes,
                    COUNT(DISTINCT usuario_id) as usuarios_diferentes,
                    SUM(CASE WHEN completado = 1 THEN 1 ELSE 0 END) as completadas,
                    AVG(porcentaje_visto) as promedio_visto,
                    SUM(tiempo_reproducido) as tiempo_total
                FROM {$this->table}
                WHERE DATE(fecha_inicio) BETWEEN :fecha_inicio AND :fecha_fin
                GROUP BY DATE(fecha_inicio)
                ORDER BY fecha DESC";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':fecha_inicio', $fechaInicio);
            $stmt->bindParam(':fecha_fin', $fechaFin);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Reproduccion::obtenerEstadisticasPorFecha] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene las reproducciones más recientes del sistema
     *
     * @param int $limit Límite de resultados
     * @return array|false
     */
    public function obtenerRecientes(int $limit = 20)
    {
        $query = "SELECT
                    r.*,
                    v.titulo as video_titulo,
                    v.thumbnail_path,
                    m.nombre as materia_nombre,
                    g.nombre as grado_nombre,
                    CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario_nombre
                FROM {$this->table} r
                INNER JOIN videos v ON r.video_id = v.id
                INNER JOIN materias m ON v.materia_id = m.id
                INNER JOIN grados g ON v.grado_id = g.id
                LEFT JOIN usuarios u ON r.usuario_id = u.id
                ORDER BY r.fecha_inicio DESC
                LIMIT :limit";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Reproduccion::obtenerRecientes] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene estadísticas generales de reproducciones
     *
     * @return array|false
     */
    public function obtenerEstadisticasGenerales()
    {
        $query = "SELECT
                    COUNT(*) as total_reproducciones,
                    COUNT(DISTINCT video_id) as videos_reproducidos,
                    COUNT(DISTINCT usuario_id) as usuarios_activos,
                    SUM(CASE WHEN completado = 1 THEN 1 ELSE 0 END) as reproducciones_completadas,
                    AVG(porcentaje_visto) as promedio_porcentaje_visto,
                    SUM(tiempo_reproducido) as tiempo_total_reproducido,
                    AVG(tiempo_reproducido) as promedio_tiempo_reproducido
                FROM {$this->table}";

        try {
            $stmt = $this->conn->query($query);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Reproduccion::obtenerEstadisticasGenerales] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene las horas de reproducción por materia
     *
     * @return array|false
     */
    public function obtenerHorasPorMateria()
    {
        $query = "SELECT
                    m.nombre as materia,
                    m.sigla,
                    COUNT(r.id) as total_reproducciones,
                    SUM(r.tiempo_reproducido) as segundos_totales,
                    ROUND(SUM(r.tiempo_reproducido) / 3600, 2) as horas_totales,
                    AVG(r.porcentaje_visto) as promedio_visto
                FROM {$this->table} r
                INNER JOIN videos v ON r.video_id = v.id
                INNER JOIN materias m ON v.materia_id = m.id
                GROUP BY m.id, m.nombre, m.sigla
                ORDER BY horas_totales DESC";

        try {
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Reproduccion::obtenerHorasPorMateria] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene las horas de reproducción por grado
     *
     * @return array|false
     */
    public function obtenerHorasPorGrado()
    {
        $query = "SELECT
                    g.nombre as grado,
                    g.nivel,
                    COUNT(r.id) as total_reproducciones,
                    SUM(r.tiempo_reproducido) as segundos_totales,
                    ROUND(SUM(r.tiempo_reproducido) / 3600, 2) as horas_totales,
                    AVG(r.porcentaje_visto) as promedio_visto
                FROM {$this->table} r
                INNER JOIN videos v ON r.video_id = v.id
                INNER JOIN grados g ON v.grado_id = g.id
                GROUP BY g.id, g.nombre, g.nivel
                ORDER BY g.nivel";

        try {
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Reproduccion::obtenerHorasPorGrado] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Elimina reproducciones antiguas (limpieza de datos)
     *
     * @param int $dias Días de antigüedad
     * @return bool
     */
    public function eliminarAntiguas(int $dias = 365): bool
    {
        $query = "DELETE FROM {$this->table}
                WHERE fecha_inicio < DATE_SUB(NOW(), INTERVAL :dias DAY)";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':dias', $dias, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Reproduccion::eliminarAntiguas] Error: " . $e->getMessage());
            return false;
        }
    }
}
