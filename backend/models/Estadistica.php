<?php
/**
 * Modelo Estadistica
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase Estadistica - Modelo para estadísticas del sistema
 *
 * Maneja la generación, almacenamiento y consulta de estadísticas
 * agregadas del sistema.
 */
class Estadistica
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Nombre de la tabla */
    private string $table = 'estadisticas';

    // Propiedades de la estadística
    public ?int $id = null;
    public ?string $tipo = null;
    public ?string $categoria = null;
    public ?string $datos_json = null;
    public ?string $fecha_referencia = null;
    public ?string $fecha_generacion = null;

    /**
     * Constructor
     */
    public function __construct()
    {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Crea un nuevo registro de estadística
     *
     * @return bool|int ID de la estadística creada o false si falla
     */
    public function crear()
    {
        $query = "INSERT INTO {$this->table}
                (tipo, categoria, datos_json, fecha_referencia)
                VALUES
                (:tipo, :categoria, :datos_json, :fecha_referencia)";

        try {
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':tipo', $this->tipo);
            $stmt->bindParam(':categoria', $this->categoria);
            $stmt->bindParam(':datos_json', $this->datos_json);
            $stmt->bindParam(':fecha_referencia', $this->fecha_referencia);

            if ($stmt->execute()) {
                return (int)$this->conn->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Estadistica::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene estadísticas generales del sistema
     *
     * @return array|false
     */
    public function obtenerGenerales()
    {
        try {
            $stmt = $this->conn->query('CALL sp_estadisticas_generales()');
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Estadistica::obtenerGenerales] Error: " . $e->getMessage());

            // Fallback manual si el procedimiento almacenado falla
            return $this->obtenerGeneralesFallback();
        }
    }

    /**
     * Obtiene estadísticas generales (fallback)
     *
     * @return array
     */
    private function obtenerGeneralesFallback(): array
    {
        try {
            // Total de usuarios activos
            $stmt1 = $this->conn->query("SELECT COUNT(*) as count FROM usuarios WHERE estado = 'activo'");
            $usuarios = $stmt1->fetch(PDO::FETCH_ASSOC)['count'];

            // Total de videos activos
            $stmt2 = $this->conn->query("SELECT COUNT(*) as count FROM videos WHERE estado = 'activo'");
            $videos = $stmt2->fetch(PDO::FETCH_ASSOC)['count'];

            // Total de reproducciones
            $stmt3 = $this->conn->query("SELECT COUNT(*) as count FROM reproducciones");
            $reproducciones = $stmt3->fetch(PDO::FETCH_ASSOC)['count'];

            // Total de visualizaciones
            $stmt4 = $this->conn->query("SELECT SUM(visualizaciones) as total FROM videos");
            $visualizaciones = $stmt4->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Total de materias
            $stmt5 = $this->conn->query("SELECT COUNT(*) as count FROM materias WHERE estado = 'activo'");
            $materias = $stmt5->fetch(PDO::FETCH_ASSOC)['count'];

            // Total de grados
            $stmt6 = $this->conn->query("SELECT COUNT(*) as count FROM grados WHERE estado = 'activo'");
            $grados = $stmt6->fetch(PDO::FETCH_ASSOC)['count'];

            return [
                'total_usuarios_activos' => (int)$usuarios,
                'total_videos_activos' => (int)$videos,
                'total_reproducciones' => (int)$reproducciones,
                'total_visualizaciones' => (int)$visualizaciones,
                'total_materias' => (int)$materias,
                'total_grados' => (int)$grados
            ];
        } catch (PDOException $e) {
            error_log("[Estadistica::obtenerGeneralesFallback] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene estadísticas por tipo y categoría
     *
     * @param string $tipo Tipo de estadística
     * @param string $categoria Categoría
     * @param int $limit Límite de resultados
     * @return array|false
     */
    public function obtenerPorTipoYCategoria(string $tipo, string $categoria, int $limit = 10)
    {
        $query = "SELECT * FROM {$this->table}
                WHERE tipo = :tipo AND categoria = :categoria
                ORDER BY fecha_referencia DESC
                LIMIT :limit";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':tipo', $tipo);
            $stmt->bindParam(':categoria', $categoria);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Decodificar JSON
            foreach ($resultados as &$resultado) {
                $resultado['datos'] = json_decode($resultado['datos_json'], true);
                unset($resultado['datos_json']);
            }

            return $resultados;
        } catch (PDOException $e) {
            error_log("[Estadistica::obtenerPorTipoYCategoria] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Genera estadísticas diarias
     *
     * @param string $fecha Fecha en formato Y-m-d
     * @return bool
     */
    public function generarDiarias(string $fecha): bool
    {
        try {
            // Estadísticas de videos subidos
            $query1 = "SELECT COUNT(*) as total
                    FROM videos
                    WHERE DATE(fecha_subida) = :fecha";

            $stmt1 = $this->conn->prepare($query1);
            $stmt1->bindParam(':fecha', $fecha);
            $stmt1->execute();
            $videosSubidos = $stmt1->fetch(PDO::FETCH_ASSOC)['total'];

            // Estadísticas de reproducciones
            $query2 = "SELECT
                        COUNT(*) as total_reproducciones,
                        COUNT(DISTINCT usuario_id) as usuarios_activos,
                        SUM(tiempo_reproducido) as tiempo_total
                    FROM reproducciones
                    WHERE DATE(fecha_inicio) = :fecha";

            $stmt2 = $this->conn->prepare($query2);
            $stmt2->bindParam(':fecha', $fecha);
            $stmt2->execute();
            $repro = $stmt2->fetch(PDO::FETCH_ASSOC);

            // Crear registro de estadística
            $datos = [
                'videos_subidos' => (int)$videosSubidos,
                'reproducciones' => (int)$repro['total_reproducciones'],
                'usuarios_activos' => (int)$repro['usuarios_activos'],
                'tiempo_total_segundos' => (int)$repro['tiempo_total'],
                'tiempo_total_horas' => round((int)$repro['tiempo_total'] / 3600, 2)
            ];

            $this->tipo = 'diaria';
            $this->categoria = 'resumen';
            $this->datos_json = json_encode($datos);
            $this->fecha_referencia = $fecha;

            return $this->crear() !== false;
        } catch (PDOException $e) {
            error_log("[Estadistica::generarDiarias] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene el dashboard completo de estadísticas
     *
     * @return array
     */
    public function obtenerDashboard(): array
    {
        $dashboard = [
            'generales' => $this->obtenerGenerales(),
            'videos_populares' => $this->obtenerVideosPopulares(10),
            'actividad_reciente' => $this->obtenerActividadReciente(10),
            'por_materia' => $this->obtenerEstadisticasPorMateria(),
            'por_grado' => $this->obtenerEstadisticasPorGrado(),
            'tendencias' => $this->obtenerTendencias(7)
        ];

        return $dashboard;
    }

    /**
     * Obtiene videos más populares
     *
     * @param int $limit Límite de resultados
     * @return array
     */
    private function obtenerVideosPopulares(int $limit = 10): array
    {
        try {
            $query = "SELECT
                        v.id,
                        v.titulo,
                        v.visualizaciones,
                        m.nombre as materia,
                        g.nombre as grado,
                        CONCAT(u.nombre, ' ', u.apellido_paterno) as docente
                    FROM videos v
                    INNER JOIN materias m ON v.materia_id = m.id
                    INNER JOIN grados g ON v.grado_id = g.id
                    INNER JOIN usuarios u ON v.docente_id = u.id
                    WHERE v.estado = 'activo'
                    ORDER BY v.visualizaciones DESC
                    LIMIT :limit";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Estadistica::obtenerVideosPopulares] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene actividad reciente del sistema
     *
     * @param int $limit Límite de resultados
     * @return array
     */
    private function obtenerActividadReciente(int $limit = 10): array
    {
        try {
            $query = "SELECT
                        l.accion,
                        l.descripcion,
                        CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario,
                        l.fecha
                    FROM logs_sistema l
                    LEFT JOIN usuarios u ON l.usuario_id = u.id
                    ORDER BY l.fecha DESC
                    LIMIT :limit";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Estadistica::obtenerActividadReciente] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene estadísticas por materia
     *
     * @return array
     */
    private function obtenerEstadisticasPorMateria(): array
    {
        try {
            $query = "SELECT * FROM vista_stats_por_materia";
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Estadistica::obtenerEstadisticasPorMateria] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene estadísticas por grado
     *
     * @return array
     */
    private function obtenerEstadisticasPorGrado(): array
    {
        try {
            $query = "SELECT * FROM vista_stats_por_grado";
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Estadistica::obtenerEstadisticasPorGrado] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene tendencias de los últimos N días
     *
     * @param int $dias Número de días
     * @return array
     */
    private function obtenerTendencias(int $dias = 7): array
    {
        try {
            $query = "SELECT
                        DATE(fecha_inicio) as fecha,
                        COUNT(*) as reproducciones,
                        COUNT(DISTINCT video_id) as videos_vistos,
                        SUM(tiempo_reproducido) / 3600 as horas_totales
                    FROM reproducciones
                    WHERE fecha_inicio >= DATE_SUB(CURDATE(), INTERVAL :dias DAY)
                    GROUP BY DATE(fecha_inicio)
                    ORDER BY fecha";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':dias', $dias, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Estadistica::obtenerTendencias] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene estadísticas para docente específico
     *
     * @param int $docenteId ID del docente
     * @return array
     */
    public function obtenerPorDocente(int $docenteId): array
    {
        try {
            // Total de videos del docente
            $query1 = "SELECT COUNT(*) as total
                    FROM videos
                    WHERE docente_id = :docente_id AND estado = 'activo'";
            $stmt1 = $this->conn->prepare($query1);
            $stmt1->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt1->execute();
            $totalVideos = $stmt1->fetch(PDO::FETCH_ASSOC)['total'];

            // Total de visualizaciones
            $query2 = "SELECT SUM(visualizaciones) as total
                    FROM videos
                    WHERE docente_id = :docente_id";
            $stmt2 = $this->conn->prepare($query2);
            $stmt2->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt2->execute();
            $totalVisualizaciones = $stmt2->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Videos del docente más vistos
            $query3 = "SELECT
                        id, titulo, visualizaciones, fecha_subida
                    FROM videos
                    WHERE docente_id = :docente_id AND estado = 'activo'
                    ORDER BY visualizaciones DESC
                    LIMIT 5";
            $stmt3 = $this->conn->prepare($query3);
            $stmt3->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt3->execute();
            $videosPopulares = $stmt3->fetchAll(PDO::FETCH_ASSOC);

            return [
                'total_videos' => (int)$totalVideos,
                'total_visualizaciones' => (int)$totalVisualizaciones,
                'promedio_visualizaciones' => $totalVideos > 0 ? round($totalVisualizaciones / $totalVideos, 2) : 0,
                'videos_populares' => $videosPopulares
            ];
        } catch (PDOException $e) {
            error_log("[Estadistica::obtenerPorDocente] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Limpia estadísticas antiguas
     *
     * @param int $dias Días de antigüedad
     * @return bool
     */
    public function limpiarAntiguas(int $dias = 365): bool
    {
        $query = "DELETE FROM {$this->table}
                WHERE fecha_referencia < DATE_SUB(CURDATE(), INTERVAL :dias DAY)";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':dias', $dias, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Estadistica::limpiarAntiguas] Error: " . $e->getMessage());
            return false;
        }
    }
}
