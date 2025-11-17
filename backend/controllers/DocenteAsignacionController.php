<?php
/**
 * Controlador de Asignaciones de Docentes
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/DocenteAsignacion.php';
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';
require_once __DIR__ . '/../utils/Logger.php';

/**
 * Clase DocenteAsignacionController - Controlador de asignaciones
 *
 * Maneja las operaciones de asignación de materias y grados a docentes
 * Solo accesible para administradores
 */
class DocenteAsignacionController
{
    /** @var DocenteAsignacion Modelo de asignaciones */
    private DocenteAsignacion $asignacionModel;

    /** @var Usuario Modelo de usuario */
    private Usuario $usuarioModel;

    /** @var Logger Sistema de logging */
    private Logger $logger;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->asignacionModel = new DocenteAsignacion();
        $this->usuarioModel = new Usuario();
        $this->logger = new Logger();
    }

    /**
     * Obtiene las asignaciones de un docente
     *
     * GET /api/docentes/{id}/asignaciones
     *
     * @param int $id ID del docente
     * @return void
     */
    public function obtenerAsignaciones(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea administrador
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $this->enviarRespuesta(403, false, null, 'Solo administradores pueden ver asignaciones');
            return;
        }

        // Verificar que el docente existe
        $docente = $this->usuarioModel->obtenerPorId($id);
        if (!$docente || $docente['rol_nombre'] !== 'Docente') {
            $this->enviarRespuesta(404, false, null, 'Docente no encontrado');
            return;
        }

        $asignaciones = $this->asignacionModel->obtenerAsignacionesDocente($id);

        $this->enviarRespuesta(200, true, [
            'docente' => [
                'id' => $docente['id'],
                'nombre' => $docente['nombre'],
                'email' => $docente['email']
            ],
            'asignaciones' => $asignaciones
        ]);
    }

    /**
     * Asigna materias a un docente
     *
     * POST /api/docentes/{id}/materias
     * Body: { "materia_ids": [1, 2, 3] }
     *
     * @param int $id ID del docente
     * @return void
     */
    public function asignarMaterias(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea administrador
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $this->enviarRespuesta(403, false, null, 'Solo administradores pueden asignar materias');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['materia_ids']) || !is_array($data['materia_ids'])) {
            $this->enviarRespuesta(400, false, null, 'Debe proporcionar un array de materia_ids');
            return;
        }

        // Verificar que el docente existe
        $docente = $this->usuarioModel->obtenerPorId($id);
        if (!$docente || $docente['rol_nombre'] !== 'Docente') {
            $this->enviarRespuesta(404, false, null, 'Docente no encontrado');
            return;
        }

        // Asignar materias
        $resultado = $this->asignacionModel->asignarMaterias(
            $id,
            array_map('intval', $data['materia_ids']),
            $usuario['id']
        );

        if ($resultado) {
            $this->logger->info(
                "Materias asignadas al docente {$docente['nombre']}",
                ['docente_id' => $id, 'materias' => $data['materia_ids'], 'admin_id' => $usuario['id']]
            );

            $asignaciones = $this->asignacionModel->obtenerAsignacionesDocente($id);

            $this->enviarRespuesta(200, true, [
                'asignaciones' => $asignaciones
            ], 'Materias asignadas exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al asignar materias');
        }
    }

    /**
     * Asigna grados a un docente
     *
     * POST /api/docentes/{id}/grados
     * Body: { "grado_ids": [1, 2, 3] }
     *
     * @param int $id ID del docente
     * @return void
     */
    public function asignarGrados(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea administrador
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $this->enviarRespuesta(403, false, null, 'Solo administradores pueden asignar grados');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['grado_ids']) || !is_array($data['grado_ids'])) {
            $this->enviarRespuesta(400, false, null, 'Debe proporcionar un array de grado_ids');
            return;
        }

        // Verificar que el docente existe
        $docente = $this->usuarioModel->obtenerPorId($id);
        if (!$docente || $docente['rol_nombre'] !== 'Docente') {
            $this->enviarRespuesta(404, false, null, 'Docente no encontrado');
            return;
        }

        // Asignar grados
        $resultado = $this->asignacionModel->asignarGrados(
            $id,
            array_map('intval', $data['grado_ids']),
            $usuario['id']
        );

        if ($resultado) {
            $this->logger->info(
                "Grados asignados al docente {$docente['nombre']}",
                ['docente_id' => $id, 'grados' => $data['grado_ids'], 'admin_id' => $usuario['id']]
            );

            $asignaciones = $this->asignacionModel->obtenerAsignacionesDocente($id);

            $this->enviarRespuesta(200, true, [
                'asignaciones' => $asignaciones
            ], 'Grados asignados exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al asignar grados');
        }
    }

    /**
     * Obtiene todos los docentes con sus asignaciones
     *
     * GET /api/docentes-asignaciones
     *
     * @return void
     */
    public function listarTodos(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea administrador
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $this->enviarRespuesta(403, false, null, 'Solo administradores pueden ver esta información');
            return;
        }

        $docentes = $this->asignacionModel->obtenerTodosConAsignaciones();

        $this->enviarRespuesta(200, true, ['docentes' => $docentes]);
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
