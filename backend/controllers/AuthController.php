<?php
/**
 * Controlador de Autenticación
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../utils/JWTHandler.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../middleware/ValidationMiddleware.php';
require_once __DIR__ . '/../config/database.php';

/**
 * Clase AuthController - Controlador de autenticación
 *
 * Maneja el login, registro, logout y refresh de tokens
 */
class AuthController
{
    /** @var Usuario Modelo de usuario */
    private Usuario $usuarioModel;

    /** @var JWTHandler Manejador de JWT */
    private JWTHandler $jwtHandler;

    /** @var Logger Sistema de logging */
    private Logger $logger;

    /** @var ValidationMiddleware Validador */
    private ValidationMiddleware $validator;

    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->usuarioModel = new Usuario();
        $this->jwtHandler = new JWTHandler();
        $this->logger = new Logger();
        $this->validator = new ValidationMiddleware();

        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Login de usuario
     *
     * POST /api/auth/login
     * Body: { email, password }
     *
     * @return void
     */
    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validar datos
        $reglas = [
            'email' => 'required|email',
            'password' => 'required|min:6'
        ];

        if (!$this->validator->validar($data, $reglas)) {
            $this->validator->enviarErrorValidacion();
            return;
        }

        $email = $data['email'];
        $password = $data['password'];

        // Verificar si el usuario está bloqueado
        if ($this->usuarioModel->estaBloqueado($email)) {
            $this->logger->warning('login_bloqueado', "Intento de login con cuenta bloqueada: {$email}");
            $this->enviarRespuesta(423, false, null, 'Cuenta bloqueada temporalmente. Intente más tarde.');
            return;
        }

        // Verificar credenciales
        $usuario = $this->usuarioModel->verificarPassword($email, $password);

        if (!$usuario) {
            // Incrementar intentos fallidos
            $this->usuarioModel->incrementarIntentosLogin($email);

            // Verificar si debe bloquearse
            $usuarioData = $this->usuarioModel->obtenerPorEmail($email);
            if ($usuarioData && $usuarioData['intentos_login'] >= 5) {
                $this->usuarioModel->bloquearUsuario($email, 15);
                $this->logger->warning('usuario_bloqueado', "Usuario bloqueado por intentos fallidos: {$email}");
            }

            $this->logger->warning('login_fallido', "Credenciales inválidas para: {$email}");
            $this->enviarRespuesta(401, false, null, 'Credenciales inválidas');
            return;
        }

        // Verificar estado del usuario
        if ($usuario['estado'] !== 'activo') {
            $this->logger->warning('login_inactivo', "Intento de login con cuenta inactiva: {$email}");
            $this->enviarRespuesta(403, false, null, 'Cuenta inactiva. Contacte al administrador.');
            return;
        }

        // Generar tokens
        $accessToken = $this->jwtHandler->generarAccessToken(
            $usuario['id'],
            $usuario['email'],
            $usuario['rol_nombre'],
            $usuario['nombre'] . ' ' . $usuario['apellido_paterno']
        );

        $refreshToken = $this->jwtHandler->generarRefreshToken(
            $usuario['id'],
            $usuario['email']
        );

        // Guardar refresh token en la base de datos
        $this->guardarRefreshToken($usuario['id'], $refreshToken);

        // Actualizar último acceso
        $this->usuarioModel->actualizarUltimoAcceso($usuario['id']);

        // Log de login exitoso
        $this->logger->auth('login', $email, true, $usuario['id']);

        // Respuesta exitosa
        $this->enviarRespuesta(200, true, [
            'user' => [
                'id' => $usuario['id'],
                'nombre' => $usuario['nombre'],
                'apellido_paterno' => $usuario['apellido_paterno'],
                'apellido_materno' => $usuario['apellido_materno'],
                'email' => $usuario['email'],
                'rol' => $usuario['rol_nombre'],
                'materia_id' => $usuario['materia_id'],
                'grado_id' => $usuario['grado_id']
            ],
            'tokens' => [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type' => 'Bearer',
                'expires_in' => 3600
            ]
        ], 'Login exitoso');
    }

    /**
     * Registro de nuevo usuario (solo administradores)
     *
     * POST /api/auth/register
     * Body: { nombre, apellido_paterno, apellido_materno, ci, email, password, rol_id, materias_ids[], grados_ids[] }
     *
     * @return void
     */
    public function register(): void
    {
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

        // Verificar que el email no exista
        if ($this->usuarioModel->obtenerPorEmail($data['email'])) {
            $this->enviarRespuesta(409, false, null, 'El email ya está registrado');
            return;
        }

        // Verificar que el CI no exista
        if ($this->usuarioModel->obtenerPorCI($data['ci'])) {
            $this->enviarRespuesta(409, false, null, 'El CI ya está registrado');
            return;
        }

        // Validar límites de asignaciones para docentes
        $materiasIds = $data['materias_ids'] ?? [];
        $gradosIds = $data['grados_ids'] ?? [];

        if (!empty($materiasIds) && count($materiasIds) > 2) {
            $this->enviarRespuesta(400, false, null, 'No se pueden asignar más de 2 materias');
            return;
        }

        if (!empty($gradosIds) && count($gradosIds) > 6) {
            $this->enviarRespuesta(400, false, null, 'No se pueden asignar más de 6 grados');
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
        $this->usuarioModel->materia_id = null; // Ya no se usa, se usan las asignaciones
        $this->usuarioModel->grado_id = null; // Ya no se usa, se usan las asignaciones
        $this->usuarioModel->telefono = $data['telefono'] ?? null;
        $this->usuarioModel->estado = 'activo';

        $usuarioId = $this->usuarioModel->crear();

        if ($usuarioId) {
            // Si es docente y tiene asignaciones, crearlas
            if (!empty($materiasIds) || !empty($gradosIds)) {
                require_once __DIR__ . '/../models/DocenteAsignacion.php';
                $asignacionModel = new DocenteAsignacion();

                // Obtener el ID del usuario autenticado (admin que está registrando)
                $usuarioActual = AuthMiddleware::proteger();
                $adminId = $usuarioActual ? $usuarioActual['id'] : $usuarioId;

                // Asignar materias
                if (!empty($materiasIds)) {
                    $asignacionModel->asignarMaterias($usuarioId, $materiasIds, $adminId);
                }

                // Asignar grados
                if (!empty($gradosIds)) {
                    $asignacionModel->asignarGrados($usuarioId, $gradosIds, $adminId);
                }
            }

            $this->logger->info('usuario_registrado', "Nuevo usuario registrado: {$data['email']}", $usuarioId);

            $this->enviarRespuesta(201, true, [
                'id' => $usuarioId,
                'email' => $data['email']
            ], 'Usuario registrado exitosamente');
        } else {
            $this->logger->error('error_registro', "Error al registrar usuario: {$data['email']}");
            $this->enviarRespuesta(500, false, null, 'Error al registrar usuario');
        }
    }

    /**
     * Refresh de tokens
     *
     * POST /api/auth/refresh
     * Body: { refresh_token }
     *
     * @return void
     */
    public function refresh(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['refresh_token'])) {
            $this->enviarRespuesta(400, false, null, 'Refresh token no proporcionado');
            return;
        }

        $refreshToken = $data['refresh_token'];

        // Validar refresh token
        $payload = $this->jwtHandler->validarToken($refreshToken);

        if (!$payload || $payload['tipo'] !== 'refresh') {
            $this->enviarRespuesta(401, false, null, 'Refresh token inválido');
            return;
        }

        // Verificar que el token existe en la BD y no está revocado
        $tokenHash = $this->jwtHandler->hashToken($refreshToken);
        $query = "SELECT * FROM tokens_refresh
                  WHERE token_hash = :token_hash
                  AND revocado = 0
                  AND expira_en > NOW()
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token_hash', $tokenHash);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            $this->enviarRespuesta(401, false, null, 'Refresh token inválido o expirado');
            return;
        }

        // Obtener usuario
        $usuario = $this->usuarioModel->obtenerPorId($payload['user_id']);

        if (!$usuario || $usuario['estado'] !== 'activo') {
            $this->enviarRespuesta(401, false, null, 'Usuario inválido o inactivo');
            return;
        }

        // Generar nuevo access token
        $newAccessToken = $this->jwtHandler->generarAccessToken(
            $usuario['id'],
            $usuario['email'],
            $usuario['rol_nombre'],
            $usuario['nombre'] . ' ' . $usuario['apellido_paterno']
        );

        $this->logger->info('token_refresh', "Token refrescado para usuario: {$usuario['email']}", $usuario['id']);

        $this->enviarRespuesta(200, true, [
            'access_token' => $newAccessToken,
            'token_type' => 'Bearer',
            'expires_in' => 3600
        ], 'Token refrescado exitosamente');
    }

    /**
     * Logout de usuario
     *
     * POST /api/auth/logout
     * Header: Authorization: Bearer {token}
     *
     * @return void
     */
    public function logout(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $refreshToken = $data['refresh_token'] ?? null;

        if ($refreshToken) {
            // Revocar el refresh token
            $tokenHash = $this->jwtHandler->hashToken($refreshToken);
            $query = "UPDATE tokens_refresh SET revocado = 1 WHERE token_hash = :token_hash";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':token_hash', $tokenHash);
            $stmt->execute();
        }

        $this->logger->info('logout', 'Usuario cerró sesión');

        $this->enviarRespuesta(200, true, null, 'Logout exitoso');
    }

    /**
     * Obtiene la información del usuario autenticado
     *
     * GET /api/auth/me
     * Header: Authorization: Bearer {token}
     *
     * @return void
     */
    public function me(): void
    {
        // Este endpoint requiere autenticación (verificado en las rutas)
        $authMiddleware = new AuthMiddleware();

        if (!$authMiddleware->verificar()) {
            return;
        }

        $usuario = $authMiddleware->obtenerUsuario();
        $usuarioCompleto = $this->usuarioModel->obtenerPorId($usuario['id']);

        if (!$usuarioCompleto) {
            $this->enviarRespuesta(404, false, null, 'Usuario no encontrado');
            return;
        }

        $this->enviarRespuesta(200, true, [
            'id' => $usuarioCompleto['id'],
            'nombre' => $usuarioCompleto['nombre'],
            'apellido_paterno' => $usuarioCompleto['apellido_paterno'],
            'apellido_materno' => $usuarioCompleto['apellido_materno'],
            'email' => $usuarioCompleto['email'],
            'ci' => $usuarioCompleto['ci'],
            'rol' => $usuarioCompleto['rol_nombre'],
            'materia' => $usuarioCompleto['materia_nombre'] ?? null,
            'grado' => $usuarioCompleto['grado_nombre'] ?? null,
            'telefono' => $usuarioCompleto['telefono'],
            'estado' => $usuarioCompleto['estado'],
            'ultimo_acceso' => $usuarioCompleto['ultimo_acceso']
        ]);
    }

    /**
     * Guarda el refresh token en la base de datos
     *
     * @param int $usuarioId ID del usuario
     * @param string $refreshToken Refresh token
     * @return bool
     */
    private function guardarRefreshToken(int $usuarioId, string $refreshToken): bool
    {
        $tokenHash = $this->jwtHandler->hashToken($refreshToken);
        $payload = $this->jwtHandler->decodificarToken($refreshToken);
        $expiraEn = date('Y-m-d H:i:s', $payload['exp']);
        $ip = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $query = "INSERT INTO tokens_refresh (usuario_id, token_hash, ip, user_agent, expira_en)
                  VALUES (:usuario_id, :token_hash, :ip, :user_agent, :expira_en)";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuarioId);
            $stmt->bindParam(':token_hash', $tokenHash);
            $stmt->bindParam(':ip', $ip);
            $stmt->bindParam(':user_agent', $userAgent);
            $stmt->bindParam(':expira_en', $expiraEn);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[AuthController] Error al guardar refresh token: " . $e->getMessage());
            return false;
        }
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
