<?php
/**
 * Controlador de Estadísticas
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/Estadistica.php';
require_once __DIR__ . '/../models/Video.php';
require_once __DIR__ . '/../models/Reproduccion.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

/**
 * Clase EstadisticaController - Controlador de estadísticas
 *
 * Maneja todas las consultas de estadísticas y reportes del sistema
 */
class EstadisticaController
{
    /** @var Estadistica Modelo de estadísticas */
    private Estadistica $estadisticaModel;

    /** @var Video Modelo de videos */
    private Video $videoModel;

    /** @var Reproduccion Modelo de reproducciones */
    private Reproduccion $reproduccionModel;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->estadisticaModel = new Estadistica();
        $this->videoModel = new Video();
        $this->reproduccionModel = new Reproduccion();
    }

    /**
     * Obtiene el dashboard completo de estadísticas
     *
     * GET /api/estadisticas/dashboard
     *
     * @return void
     */
    public function dashboard(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Solo administradores pueden ver el dashboard completo
        // Docentes pueden ver sus propias estadísticas
        if (RoleMiddleware::esAdministrador($usuario['rol'])) {
            $dashboard = $this->estadisticaModel->obtenerDashboard();
        } else {
            // Dashboard para docentes (solo sus estadísticas)
            $dashboard = [
                'generales' => $this->estadisticaModel->obtenerPorDocente($usuario['id']),
                'videos_populares' => [],
                'actividad_reciente' => [],
                'por_materia' => [],
                'por_grado' => [],
                'tendencias' => []
            ];
        }

        $this->enviarRespuesta(200, true, ['dashboard' => $dashboard]);
    }

    /**
     * Obtiene estadísticas generales del sistema
     *
     * GET /api/estadisticas/generales
     *
     * @return void
     */
    public function generales(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $stats = $this->estadisticaModel->obtenerGenerales();

        $this->enviarRespuesta(200, true, ['estadisticas' => $stats]);
    }

    /**
     * Obtiene los videos más populares
     *
     * GET /api/estadisticas/videos-populares?limit=10
     *
     * @return void
     */
    public function videosPopulares(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 10;

        $videos = $this->videoModel->obtenerMasPopulares($limit);

        $this->enviarRespuesta(200, true, ['videos' => $videos]);
    }

    /**
     * Obtiene estadísticas por materia
     *
     * GET /api/estadisticas/por-materia
     *
     * @return void
     */
    public function porMateria(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $stats = $this->videoModel->estadisticasPorMateria();

        $this->enviarRespuesta(200, true, ['estadisticas' => $stats]);
    }

    /**
     * Obtiene estadísticas por grado
     *
     * GET /api/estadisticas/por-grado
     *
     * @return void
     */
    public function porGrado(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $stats = $this->videoModel->estadisticasPorGrado();

        $this->enviarRespuesta(200, true, ['estadisticas' => $stats]);
    }

    /**
     * Obtiene estadísticas de reproducciones
     *
     * GET /api/estadisticas/reproducciones?fecha_inicio=2024-01-01&fecha_fin=2024-12-31
     *
     * @return void
     */
    public function reproducciones(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $fechaInicio = $_GET['fecha_inicio'] ?? date('Y-m-01'); // Primer día del mes actual
        $fechaFin = $_GET['fecha_fin'] ?? date('Y-m-d'); // Hoy

        $stats = $this->reproduccionModel->obtenerEstadisticasPorFecha($fechaInicio, $fechaFin);

        $this->enviarRespuesta(200, true, [
            'estadisticas' => $stats,
            'periodo' => [
                'inicio' => $fechaInicio,
                'fin' => $fechaFin
            ]
        ]);
    }

    /**
     * Obtiene horas de reproducción por materia
     *
     * GET /api/estadisticas/horas-por-materia
     *
     * @return void
     */
    public function horasPorMateria(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $stats = $this->reproduccionModel->obtenerHorasPorMateria();

        $this->enviarRespuesta(200, true, ['estadisticas' => $stats]);
    }

    /**
     * Obtiene horas de reproducción por grado
     *
     * GET /api/estadisticas/horas-por-grado
     *
     * @return void
     */
    public function horasPorGrado(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $stats = $this->reproduccionModel->obtenerHorasPorGrado();

        $this->enviarRespuesta(200, true, ['estadisticas' => $stats]);
    }

    /**
     * Obtiene estadísticas de un docente específico
     *
     * GET /api/estadisticas/docente/{docenteId}
     *
     * @param int $docenteId ID del docente
     * @return void
     */
    public function porDocente(int $docenteId): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Solo administradores o el mismo docente pueden ver estas estadísticas
        if (!RoleMiddleware::esAdministrador($usuario['rol']) && $usuario['id'] != $docenteId) {
            $this->enviarRespuesta(403, false, null, 'No tienes permisos para ver estas estadísticas');
            return;
        }

        $stats = $this->estadisticaModel->obtenerPorDocente($docenteId);

        $this->enviarRespuesta(200, true, ['estadisticas' => $stats]);
    }

    /**
     * Obtiene las tendencias de los últimos N días
     *
     * GET /api/estadisticas/tendencias?dias=7
     *
     * @return void
     */
    public function tendencias(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $dias = isset($_GET['dias']) ? min(365, max(1, (int)$_GET['dias'])) : 7;

        $query = "SELECT
                    DATE(fecha_inicio) as fecha,
                    COUNT(*) as reproducciones,
                    COUNT(DISTINCT video_id) as videos_vistos,
                    ROUND(SUM(tiempo_reproducido) / 3600, 2) as horas_totales
                FROM reproducciones
                WHERE fecha_inicio >= DATE_SUB(CURDATE(), INTERVAL :dias DAY)
                GROUP BY DATE(fecha_inicio)
                ORDER BY fecha";

        try {
            $database = Database::getInstance();
            $conn = $database->getConnection();

            $stmt = $conn->prepare($query);
            $stmt->bindValue(':dias', $dias, PDO::PARAM_INT);
            $stmt->execute();

            $tendencias = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->enviarRespuesta(200, true, [
                'tendencias' => $tendencias,
                'dias' => $dias
            ]);
        } catch (PDOException $e) {
            error_log("[EstadisticaController] Error en tendencias: " . $e->getMessage());
            $this->enviarRespuesta(500, false, null, 'Error al obtener tendencias');
        }
    }

    /**
     * Obtiene actividad reciente del sistema
     *
     * GET /api/estadisticas/actividad-reciente?limit=20
     *
     * @return void
     */
    public function actividadReciente(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Solo administradores pueden ver actividad del sistema
        RoleMiddleware::requiereAdministrador($usuario['rol']);

        $limit = isset($_GET['limit']) ? min(100, max(1, (int)$_GET['limit'])) : 20;

        $query = "SELECT
                    l.accion,
                    l.descripcion,
                    CONCAT(u.nombre, ' ', u.apellido_paterno) as usuario,
                    l.fecha
                FROM logs_sistema l
                LEFT JOIN usuarios u ON l.usuario_id = u.id
                ORDER BY l.fecha DESC
                LIMIT :limit";

        try {
            $database = Database::getInstance();
            $conn = $database->getConnection();

            $stmt = $conn->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();

            $actividad = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->enviarRespuesta(200, true, ['actividad' => $actividad]);
        } catch (PDOException $e) {
            error_log("[EstadisticaController] Error en actividad: " . $e->getMessage());
            $this->enviarRespuesta(500, false, null, 'Error al obtener actividad');
        }
    }

    /**
     * Genera reporte de estadísticas
     *
     * POST /api/estadisticas/generar-reporte
     * Body: { tipo: 'diaria|semanal|mensual', fecha: 'YYYY-MM-DD' }
     *
     * @return void
     */
    public function generarReporte(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::protegerConRol('Administrador');
        if (!$usuario) return;

        $data = json_decode(file_get_contents('php://input'), true);

        $tipo = $data['tipo'] ?? 'diaria';
        $fecha = $data['fecha'] ?? date('Y-m-d');

        if ($tipo === 'diaria') {
            $exito = $this->estadisticaModel->generarDiarias($fecha);

            if ($exito) {
                $this->enviarRespuesta(200, true, null, 'Reporte generado exitosamente');
            } else {
                $this->enviarRespuesta(500, false, null, 'Error al generar reporte');
            }
        } else {
            $this->enviarRespuesta(400, false, null, 'Tipo de reporte no soportado');
        }
    }

    /**
     * Obtiene resumen ejecutivo
     *
     * GET /api/estadisticas/resumen-ejecutivo
     *
     * @return void
     */
    public function resumenEjecutivo(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::protegerConRol('Administrador');
        if (!$usuario) return;

        $generales = $this->estadisticaModel->obtenerGenerales();
        $videosPopulares = $this->videoModel->obtenerMasPopulares(5);
        $porMateria = $this->videoModel->estadisticasPorMateria();
        $porGrado = $this->videoModel->estadisticasPorGrado();
        $horasMateria = $this->reproduccionModel->obtenerHorasPorMateria();

        $resumen = [
            'resumen_general' => $generales,
            'top_5_videos' => $videosPopulares,
            'distribucion_por_materia' => $porMateria,
            'distribucion_por_grado' => $porGrado,
            'horas_reproduccion_materia' => $horasMateria,
            'fecha_generacion' => date('Y-m-d H:i:s')
        ];

        $this->enviarRespuesta(200, true, ['resumen' => $resumen]);
    }

    /**
     * Envía una respuesta JSON
     *
     * @param int $code Código HTTP
     * @param bool $success Estado de la respuesta
     * @param mixed $data Datos a enviar
     * @param string|null $message Mensaje opcional
     * @return void
     */
    private function enviarRespuesta(int $code, bool $success, $data = null, ?string $message = null): void
    {
        http_response_code($code);
        header('Content-Type: application/json');

        $response = ['success' => $success];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
