<?php
/**
 * Controlador de Usuarios
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';
require_once __DIR__ . '/../middleware/ValidationMiddleware.php';

/**
 * Clase UsuarioController - Controlador de usuarios
 *
 * Maneja todas las operaciones CRUD de usuarios
 */
class UsuarioController
{
    /** @var Usuario Modelo de usuario */
    private Usuario $usuarioModel;

    /** @var Logger Sistema de logging */
    private Logger $logger;

    /** @var ValidationMiddleware Validador */
    private ValidationMiddleware $validator;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->usuarioModel = new Usuario();
        $this->logger = new Logger();
        $this->validator = new ValidationMiddleware();
    }

    /**
     * Obtiene todos los usuarios con filtros y paginación
     *
     * GET /api/usuarios?rol_id=1&estado=activo&page=1&per_page=20&busqueda=texto
     *
     * @return void
     */
    public function index(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Solo administradores pueden ver todos los usuarios
        RoleMiddleware::requiereAdministrador($usuario['rol']);

        // Obtener parámetros de la petición
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 20;
        $offset = ($page - 1) * $perPage;

        $filtros = [];
        if (isset($_GET['rol_id'])) $filtros['rol_id'] = (int)$_GET['rol_id'];
        if (isset($_GET['estado'])) $filtros['estado'] = $_GET['estado'];
        if (isset($_GET['busqueda'])) $filtros['busqueda'] = $_GET['busqueda'];

        // Obtener usuarios
        $usuarios = $this->usuarioModel->obtenerTodos($filtros, $perPage, $offset);
        $total = $this->usuarioModel->contar($filtros);

        $this->enviarRespuesta(200, true, [
            'usuarios' => $usuarios,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ]);
    }

    /**
     * Obtiene un usuario por ID
     *
     * GET /api/usuarios/{id}
     *
     * @param int $id ID del usuario
     * @return void
     */
    public function show(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Solo administradores o el mismo usuario pueden ver detalles
        if (!RoleMiddleware::esAdministrador($usuario['rol']) && $usuario['id'] != $id) {
            $this->enviarRespuesta(403, false, null, 'No tienes permisos para ver este usuario');
            return;
        }

        $usuarioData = $this->usuarioModel->obtenerPorId($id);

        if (!$usuarioData) {
            $this->enviarRespuesta(404, false, null, 'Usuario no encontrado');
            return;
        }

        $this->enviarRespuesta(200, true, ['usuario' => $usuarioData]);
    }

    /**
     * Crea un nuevo usuario
     *
     * POST /api/usuarios
     * Body: { nombre, apellido_paterno, apellido_materno, ci, email, password, rol_id, materias_ids, grados_ids }
     *
     * @return void
     */
    public function store(): void
    {
        // Verificar autenticación y permisos
        $usuario = AuthMiddleware::protegerConRol('Administrador');
        if (!$usuario) return;

        $data = json_decode(file_get_contents('php://input'), true);

        // Validar datos
        $reglas = [
            'nombre' => 'required|alpha|min:2|max:100',
            'apellido_paterno' => 'required|alpha|min:2|max:100',
            'ci' => 'required|alphanumeric|min:5|max:20',
            'email' => 'required|email|max:150',
            'password' => 'required|min:8|max:100',
            'rol_id' => 'required|integer'
        ];

        if (!$this->validator->validar($data, $reglas)) {
            $this->validator->enviarErrorValidacion();
            return;
        }

        // Verificar duplicados
        if ($this->usuarioModel->obtenerPorEmail($data['email'])) {
            $this->enviarRespuesta(409, false, null, 'El email ya está registrado');
            return;
        }

        if ($this->usuarioModel->obtenerPorCI($data['ci'])) {
            $this->enviarRespuesta(409, false, null, 'El CI ya está registrado');
            return;
        }

        // Crear usuario
        $this->usuarioModel->nombre = $data['nombre'];
        $this->usuarioModel->apellido_paterno = $data['apellido_paterno'];
        $this->usuarioModel->apellido_materno = $data['apellido_materno'] ?? null;
        $this->usuarioModel->ci = $data['ci'];
        $this->usuarioModel->email = $data['email'];
        $this->usuarioModel->password = $data['password'];
        $this->usuarioModel->rol_id = $data['rol_id'];
        $this->usuarioModel->telefono = $data['telefono'] ?? null;
        $this->usuarioModel->estado = $data['estado'] ?? 'activo';

        $usuarioId = $this->usuarioModel->crear();

        if ($usuarioId) {
            // Si es docente (rol_id = 2), manejar asignaciones
            if ((int)$data['rol_id'] === 2) {
                require_once __DIR__ . '/../models/DocenteAsignacion.php';
                $asignacionModel = new DocenteAsignacion();

                // Preparar asignaciones (combinaciones materia+grado)
                $asignaciones = [];
                $materiasIds = $data['materias_ids'] ?? [];
                $gradosIds = $data['grados_ids'] ?? [];

                foreach ($materiasIds as $materiaId) {
                    foreach ($gradosIds as $gradoId) {
                        $asignaciones[] = [
                            'materia_id' => (int)$materiaId,
                            'grado_id' => (int)$gradoId
                        ];
                    }
                }

                // Asignar combinaciones materia-grado
                if (!empty($asignaciones)) {
                    $asignacionModel->asignarMultiples($usuarioId, $asignaciones, $usuario['id']);
                }
            }

            $this->logger->usuario('creado', $usuarioId, $data['nombre'] . ' ' . $data['apellido_paterno'], $usuario['id']);

            $usuarioCreado = $this->usuarioModel->obtenerPorId($usuarioId);

            $this->enviarRespuesta(201, true, ['usuario' => $usuarioCreado], 'Usuario creado exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al crear usuario');
        }
    }

    /**
     * Actualiza un usuario existente
     *
     * PUT /api/usuarios/{id}
     * Body: { nombre, apellido_paterno, apellido_materno, ci, email, rol_id, materias_ids, grados_ids, estado }
     *
     * @param int $id ID del usuario
     * @return void
     */
    public function update(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $data = json_decode(file_get_contents('php://input'), true);

        // Verificar permisos
        if (!RoleMiddleware::esAdministrador($usuario['rol']) && $usuario['id'] != $id) {
            $this->enviarRespuesta(403, false, null, 'No tienes permisos para actualizar este usuario');
            return;
        }

        // Verificar que el usuario existe
        $usuarioExistente = $this->usuarioModel->obtenerPorId($id);
        if (!$usuarioExistente) {
            $this->enviarRespuesta(404, false, null, 'Usuario no encontrado');
            return;
        }

        // Validar datos
        $reglas = [
            'nombre' => 'alpha|min:2|max:100',
            'apellido_paterno' => 'alpha|min:2|max:100',
            'ci' => 'alphanumeric|min:5|max:20',
            'email' => 'email|max:150',
            'rol_id' => 'integer',
            'estado' => 'in:activo,inactivo,suspendido'
        ];

        if (!$this->validator->validar($data, $reglas)) {
            $this->validator->enviarErrorValidacion();
            return;
        }

        // Verificar duplicados si se cambia email o CI
        if (isset($data['email']) && $data['email'] !== $usuarioExistente['email']) {
            if ($this->usuarioModel->obtenerPorEmail($data['email'])) {
                $this->enviarRespuesta(409, false, null, 'El email ya está registrado');
                return;
            }
        }

        if (isset($data['ci']) && $data['ci'] !== $usuarioExistente['ci']) {
            if ($this->usuarioModel->obtenerPorCI($data['ci'])) {
                $this->enviarRespuesta(409, false, null, 'El CI ya está registrado');
                return;
            }
        }

        // Actualizar usuario
        $this->usuarioModel->id = $id;
        $this->usuarioModel->nombre = $data['nombre'] ?? $usuarioExistente['nombre'];
        $this->usuarioModel->apellido_paterno = $data['apellido_paterno'] ?? $usuarioExistente['apellido_paterno'];
        $this->usuarioModel->apellido_materno = $data['apellido_materno'] ?? $usuarioExistente['apellido_materno'];
        $this->usuarioModel->ci = $data['ci'] ?? $usuarioExistente['ci'];
        $this->usuarioModel->email = $data['email'] ?? $usuarioExistente['email'];
        $this->usuarioModel->rol_id = $data['rol_id'] ?? $usuarioExistente['rol_id'];
        $this->usuarioModel->telefono = $data['telefono'] ?? $usuarioExistente['telefono'];
        $this->usuarioModel->estado = $data['estado'] ?? $usuarioExistente['estado'];

        if ($this->usuarioModel->actualizar()) {
            // Si es docente (rol_id = 2), actualizar asignaciones
            $rolId = $data['rol_id'] ?? $usuarioExistente['rol_id'];
            if ((int)$rolId === 2 && (isset($data['materias_ids']) || isset($data['grados_ids']))) {
                require_once __DIR__ . '/../models/DocenteAsignacion.php';
                $asignacionModel = new DocenteAsignacion();

                // Preparar asignaciones (combinaciones materia+grado)
                $asignaciones = [];
                $materiasIds = $data['materias_ids'] ?? [];
                $gradosIds = $data['grados_ids'] ?? [];

                foreach ($materiasIds as $materiaId) {
                    foreach ($gradosIds as $gradoId) {
                        $asignaciones[] = [
                            'materia_id' => (int)$materiaId,
                            'grado_id' => (int)$gradoId
                        ];
                    }
                }

                // Actualizar asignaciones (reemplaza las existentes)
                $asignacionModel->asignarMultiples($id, $asignaciones, $usuario['id']);
            }

            $this->logger->usuario('actualizado', $id, $usuarioExistente['nombre'], $usuario['id']);

            $usuarioActualizado = $this->usuarioModel->obtenerPorId($id);

            $this->enviarRespuesta(200, true, ['usuario' => $usuarioActualizado], 'Usuario actualizado exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al actualizar usuario');
        }
    }

    /**
     * Actualiza la contraseña de un usuario
     *
     * PUT /api/usuarios/{id}/password
     * Body: { password, new_password }
     *
     * @param int $id ID del usuario
     * @return void
     */
    public function updatePassword(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $data = json_decode(file_get_contents('php://input'), true);

        // Verificar permisos
        if (!RoleMiddleware::esAdministrador($usuario['rol']) && $usuario['id'] != $id) {
            $this->enviarRespuesta(403, false, null, 'No tienes permisos para cambiar esta contraseña');
            return;
        }

        // Validar datos
        $reglas = [
            'password' => 'required|min:6',
            'new_password' => 'required|min:8|max:100'
        ];

        if (!$this->validator->validar($data, $reglas)) {
            $this->validator->enviarErrorValidacion();
            return;
        }

        // Verificar contraseña actual (solo si no es admin)
        if (!RoleMiddleware::esAdministrador($usuario['rol'])) {
            $usuarioData = $this->usuarioModel->obtenerPorId($id);
            if (!$usuarioData) {
                $this->enviarRespuesta(404, false, null, 'Usuario no encontrado');
                return;
            }

            if (!$this->usuarioModel->verificarPassword($usuarioData['email'], $data['password'])) {
                $this->enviarRespuesta(401, false, null, 'Contraseña actual incorrecta');
                return;
            }
        }

        // Actualizar contraseña
        if ($this->usuarioModel->actualizarPassword($id, $data['new_password'])) {
            $this->logger->usuario('password_actualizado', $id, '', $usuario['id']);
            $this->enviarRespuesta(200, true, null, 'Contraseña actualizada exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al actualizar contraseña');
        }
    }

    /**
     * Elimina un usuario (soft delete)
     *
     * DELETE /api/usuarios/{id}
     *
     * @param int $id ID del usuario
     * @return void
     */
    public function destroy(int $id): void
    {
        // Verificar autenticación y permisos
        $usuario = AuthMiddleware::protegerConRol('Administrador');
        if (!$usuario) return;

        // No permitir eliminar el propio usuario
        if ($usuario['id'] == $id) {
            $this->enviarRespuesta(400, false, null, 'No puedes eliminar tu propio usuario');
            return;
        }

        $usuarioData = $this->usuarioModel->obtenerPorId($id);
        if (!$usuarioData) {
            $this->enviarRespuesta(404, false, null, 'Usuario no encontrado');
            return;
        }

        if ($this->usuarioModel->eliminar($id)) {
            $this->logger->usuario('eliminado', $id, $usuarioData['nombre'], $usuario['id']);
            $this->enviarRespuesta(200, true, null, 'Usuario eliminado exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al eliminar usuario');
        }
    }

    /**
     * Obtiene usuarios por rol
     *
     * GET /api/usuarios/rol/{rol}
     *
     * @param string $rol Nombre del rol
     * @return void
     */
    public function byRole(string $rol): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Mapear nombre de rol a ID (simplificado)
        $roleMap = [
            'administrador' => 1,
            'docente' => 2
        ];

        $rolId = $roleMap[strtolower($rol)] ?? null;

        if (!$rolId) {
            $this->enviarRespuesta(400, false, null, 'Rol inválido');
            return;
        }

        $usuarios = $this->usuarioModel->obtenerTodos(['rol_id' => $rolId], 100, 0);

        $this->enviarRespuesta(200, true, ['usuarios' => $usuarios]);
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
