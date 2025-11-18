<?php
/**
 * Controlador de Asignaciones de Docentes
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 2.0.0
 */

require_once __DIR__ . '/../models/DocenteAsignacion.php';
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';
require_once __DIR__ . '/../utils/Logger.php';

/**
 * Clase DocenteAsignacionController - Controlador de asignaciones
 *
 * Maneja las operaciones de asignación de combinaciones materia-grado a docentes
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

        // Verificar permisos (administrador o el mismo docente)
        if (!RoleMiddleware::esAdministrador($usuario['rol']) && $usuario['id'] !== $id) {
            $this->enviarRespuesta(403, false, null, 'No tiene permisos para ver estas asignaciones');
            return;
        }

        // Verificar que el docente existe
        $docente = $this->usuarioModel->obtenerPorId($id);
        if (!$docente || $docente['rol'] !== 'Docente') {
            $this->enviarRespuesta(404, false, null, 'Docente no encontrado');
            return;
        }

        $asignaciones = $this->asignacionModel->obtenerAsignacionesDocente($id);

        $this->enviarRespuesta(200, true, [
            'docente' => [
                'id' => $docente['id'],
                'nombre' => $docente['nombre'],
                'apellido_paterno' => $docente['apellido_paterno'],
                'apellido_materno' => $docente['apellido_materno'],
                'email' => $docente['email']
            ],
            'asignaciones' => $asignaciones['asignaciones'],
            'materias' => $asignaciones['materias'],
            'grados' => $asignaciones['grados']
        ]);
    }

    /**
     * Crea una nueva asignación (materia + grado para un docente)
     *
     * POST /api/docentes/{id}/asignaciones
     * Body: { "materia_id": 1, "grado_id": 1 }
     *
     * @param int $id ID del docente
     * @return void
     */
    public function crear(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea administrador
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $this->enviarRespuesta(403, false, null, 'Solo administradores pueden crear asignaciones');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        // Validar datos
        if (!isset($data['materia_id']) || !isset($data['grado_id'])) {
            $this->enviarRespuesta(400, false, null, 'Debe proporcionar materia_id y grado_id');
            return;
        }

        $materiaId = (int) $data['materia_id'];
        $gradoId = (int) $data['grado_id'];
        $estado = $data['estado'] ?? 'activa';

        // Validar estado
        if (!in_array($estado, ['activa', 'inactiva'])) {
            $this->enviarRespuesta(400, false, null, 'Estado inválido. Debe ser activa o inactiva');
            return;
        }

        // Verificar que el docente existe
        $docente = $this->usuarioModel->obtenerPorId($id);
        if (!$docente || $docente['rol'] !== 'Docente') {
            $this->enviarRespuesta(404, false, null, 'Docente no encontrado');
            return;
        }

        // Verificar si ya existe
        if ($this->asignacionModel->tieneAsignacion($id, $materiaId, $gradoId)) {
            $this->enviarRespuesta(409, false, null, 'Esta asignación ya existe');
            return;
        }

        // Crear asignación
        $resultado = $this->asignacionModel->crear(
            $id,
            $materiaId,
            $gradoId,
            $usuario['id'],
            $estado
        );

        if ($resultado) {
            $this->logger->info(
                "Asignación creada para docente {$docente['nombre']}",
                [
                    'docente_id' => $id,
                    'materia_id' => $materiaId,
                    'grado_id' => $gradoId,
                    'admin_id' => $usuario['id']
                ]
            );

            $asignaciones = $this->asignacionModel->obtenerAsignacionesDocente($id);

            $this->enviarRespuesta(201, true, [
                'asignacion_id' => $resultado,
                'asignaciones' => $asignaciones
            ], 'Asignación creada exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al crear asignación');
        }
    }

    /**
     * Asigna múltiples combinaciones materia-grado a un docente (reemplaza las existentes)
     *
     * PUT /api/docentes/{id}/asignaciones
     * Body: {
     *   "asignaciones": [
     *     {"materia_id": 1, "grado_id": 1},
     *     {"materia_id": 1, "grado_id": 2},
     *     {"materia_id": 2, "grado_id": 3}
     *   ]
     * }
     *
     * @param int $id ID del docente
     * @return void
     */
    public function asignarMultiples(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea administrador
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $this->enviarRespuesta(403, false, null, 'Solo administradores pueden asignar');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['asignaciones']) || !is_array($data['asignaciones'])) {
            $this->enviarRespuesta(400, false, null, 'Debe proporcionar un array de asignaciones');
            return;
        }

        // Validar estructura de asignaciones
        foreach ($data['asignaciones'] as $asignacion) {
            if (!isset($asignacion['materia_id']) || !isset($asignacion['grado_id'])) {
                $this->enviarRespuesta(
                    400,
                    false,
                    null,
                    'Cada asignación debe tener materia_id y grado_id'
                );
                return;
            }
        }

        // Verificar que el docente existe
        $docente = $this->usuarioModel->obtenerPorId($id);
        if (!$docente || $docente['rol'] !== 'Docente') {
            $this->enviarRespuesta(404, false, null, 'Docente no encontrado');
            return;
        }

        // Asignar
        $resultado = $this->asignacionModel->asignarMultiples(
            $id,
            $data['asignaciones'],
            $usuario['id']
        );

        if ($resultado) {
            $this->logger->info(
                "Asignaciones actualizadas para docente {$docente['nombre']}",
                [
                    'docente_id' => $id,
                    'cantidad' => count($data['asignaciones']),
                    'admin_id' => $usuario['id']
                ]
            );

            $asignaciones = $this->asignacionModel->obtenerAsignacionesDocente($id);

            $this->enviarRespuesta(200, true, [
                'asignaciones' => $asignaciones
            ], 'Asignaciones actualizadas exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al actualizar asignaciones');
        }
    }

    /**
     * Elimina una asignación específica
     *
     * DELETE /api/docentes/{id}/asignaciones
     * Body: { "materia_id": 1, "grado_id": 1 }
     *
     * @param int $id ID del docente
     * @return void
     */
    public function eliminar(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea administrador
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $this->enviarRespuesta(403, false, null, 'Solo administradores pueden eliminar asignaciones');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['materia_id']) || !isset($data['grado_id'])) {
            $this->enviarRespuesta(400, false, null, 'Debe proporcionar materia_id y grado_id');
            return;
        }

        $materiaId = (int) $data['materia_id'];
        $gradoId = (int) $data['grado_id'];

        // Verificar que el docente existe
        $docente = $this->usuarioModel->obtenerPorId($id);
        if (!$docente || $docente['rol'] !== 'Docente') {
            $this->enviarRespuesta(404, false, null, 'Docente no encontrado');
            return;
        }

        // Eliminar asignación
        $resultado = $this->asignacionModel->eliminar($id, $materiaId, $gradoId);

        if ($resultado) {
            $this->logger->info(
                "Asignación eliminada para docente {$docente['nombre']}",
                [
                    'docente_id' => $id,
                    'materia_id' => $materiaId,
                    'grado_id' => $gradoId,
                    'admin_id' => $usuario['id']
                ]
            );

            $asignaciones = $this->asignacionModel->obtenerAsignacionesDocente($id);

            $this->enviarRespuesta(200, true, [
                'asignaciones' => $asignaciones
            ], 'Asignación eliminada exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al eliminar asignación');
        }
    }

    /**
     * Actualiza el estado de una asignación
     *
     * PATCH /api/docentes/{id}/asignaciones/estado
     * Body: { "materia_id": 1, "grado_id": 1, "estado": "inactiva" }
     *
     * @param int $id ID del docente
     * @return void
     */
    public function actualizarEstado(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea administrador
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $this->enviarRespuesta(403, false, null, 'Solo administradores pueden actualizar asignaciones');
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['materia_id']) || !isset($data['grado_id']) || !isset($data['estado'])) {
            $this->enviarRespuesta(400, false, null, 'Debe proporcionar materia_id, grado_id y estado');
            return;
        }

        $materiaId = (int) $data['materia_id'];
        $gradoId = (int) $data['grado_id'];
        $estado = $data['estado'];

        // Validar estado
        if (!in_array($estado, ['activa', 'inactiva'])) {
            $this->enviarRespuesta(400, false, null, 'Estado inválido. Debe ser activa o inactiva');
            return;
        }

        // Actualizar estado
        $resultado = $this->asignacionModel->actualizarEstado($id, $materiaId, $gradoId, $estado);

        if ($resultado) {
            $this->logger->info(
                "Estado de asignación actualizado",
                [
                    'docente_id' => $id,
                    'materia_id' => $materiaId,
                    'grado_id' => $gradoId,
                    'estado' => $estado,
                    'admin_id' => $usuario['id']
                ]
            );

            $asignaciones = $this->asignacionModel->obtenerAsignacionesDocente($id);

            $this->enviarRespuesta(200, true, [
                'asignaciones' => $asignaciones
            ], 'Estado actualizado exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al actualizar estado');
        }
    }

    /**
     * Obtiene todas las asignaciones del sistema
     *
     * GET /api/asignaciones
     *
     * @return void
     */
    public function listarTodas(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea administrador
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $this->enviarRespuesta(403, false, null, 'Solo administradores pueden ver esta información');
            return;
        }

        $estado = $_GET['estado'] ?? 'activa';
        $asignaciones = $this->asignacionModel->obtenerTodas($estado);

        $this->enviarRespuesta(200, true, ['asignaciones' => $asignaciones]);
    }

    /**
     * Obtiene todos los docentes con sus asignaciones
     *
     * GET /api/docentes-asignaciones
     *
     * @return void
     */
    public function listarDocentes(): void
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
     * MÉTODOS DE COMPATIBILIDAD CON VERSIÓN ANTERIOR
     * Estos métodos están deprecados pero se mantienen para compatibilidad
     */

    /**
     * @deprecated Usar asignarMultiples()
     * Asigna materias a un docente
     *
     * POST /api/docentes/{id}/materias
     * Body: { "materia_ids": [1, 2, 3] }
     */
    public function asignarMaterias(int $id): void
    {
        $this->logger->warning("Método deprecado asignarMaterias llamado. Use asignarMultiples()");

        $this->enviarRespuesta(
            410,
            false,
            null,
            'Este endpoint está deprecado. Use PUT /api/docentes/{id}/asignaciones con asignaciones completas (materia_id + grado_id)'
        );
    }

    /**
     * @deprecated Usar asignarMultiples()
     * Asigna grados a un docente
     *
     * POST /api/docentes/{id}/grados
     * Body: { "grado_ids": [1, 2, 3] }
     */
    public function asignarGrados(int $id): void
    {
        $this->logger->warning("Método deprecado asignarGrados llamado. Use asignarMultiples()");

        $this->enviarRespuesta(
            410,
            false,
            null,
            'Este endpoint está deprecado. Use PUT /api/docentes/{id}/asignaciones con asignaciones completas (materia_id + grado_id)'
        );
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
