<?php
/**
 * Middleware de Autenticación
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../utils/JWTHandler.php';
require_once __DIR__ . '/../utils/Logger.php';

/**
 * Clase AuthMiddleware - Middleware de autenticación
 *
 * Verifica que las peticiones tengan un token JWT válido
 * y extrae la información del usuario autenticado.
 */
class AuthMiddleware
{
    /** @var JWTHandler Manejador de JWT */
    private JWTHandler $jwtHandler;

    /** @var Logger Sistema de logging */
    private Logger $logger;

    /** @var array|null Usuario autenticado */
    private ?array $usuarioAutenticado = null;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->jwtHandler = new JWTHandler();
        $this->logger = new Logger();
    }

    /**
     * Verifica la autenticación del usuario
     *
     * @return bool True si está autenticado
     */
    public function verificar(): bool
    {
        // Extraer token del header
        $token = $this->jwtHandler->extraerTokenDeHeader();

        if (!$token) {
            $this->enviarRespuestaError(401, 'Token no proporcionado');
            return false;
        }

        // Validar token
        $payload = $this->jwtHandler->validarToken($token);

        if (!$payload) {
            $this->logger->warning('auth_fallido', 'Intento de acceso con token inválido', null, [
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
            ]);
            $this->enviarRespuestaError(401, 'Token inválido o expirado');
            return false;
        }

        // Verificar que sea un access token
        if (!isset($payload['tipo']) || $payload['tipo'] !== 'access') {
            $this->enviarRespuestaError(401, 'Tipo de token inválido');
            return false;
        }

        // Guardar información del usuario autenticado
        $this->usuarioAutenticado = [
            'id' => $payload['user_id'] ?? null,
            'email' => $payload['email'] ?? null,
            'rol' => $payload['rol'] ?? null,
            'nombre' => $payload['nombre'] ?? null
        ];

        // Validar que el usuario exista en el payload
        if (!$this->usuarioAutenticado['id']) {
            $this->enviarRespuestaError(401, 'Token malformado');
            return false;
        }

        return true;
    }

    /**
     * Obtiene el usuario autenticado
     *
     * @return array|null Datos del usuario autenticado
     */
    public function obtenerUsuario(): ?array
    {
        return $this->usuarioAutenticado;
    }

    /**
     * Obtiene el ID del usuario autenticado
     *
     * @return int|null ID del usuario
     */
    public function obtenerUsuarioId(): ?int
    {
        return $this->usuarioAutenticado['id'] ?? null;
    }

    /**
     * Obtiene el rol del usuario autenticado
     *
     * @return string|null Rol del usuario
     */
    public function obtenerRol(): ?string
    {
        return $this->usuarioAutenticado['rol'] ?? null;
    }

    /**
     * Verifica si el usuario es administrador
     *
     * @return bool
     */
    public function esAdministrador(): bool
    {
        return $this->obtenerRol() === 'Administrador';
    }

    /**
     * Verifica si el usuario es docente
     *
     * @return bool
     */
    public function esDocente(): bool
    {
        return $this->obtenerRol() === 'Docente';
    }

    /**
     * Middleware opcional - permite acceso sin autenticación
     *
     * @return bool Siempre retorna true
     */
    public function opcional(): bool
    {
        // Intentar extraer token
        $token = $this->jwtHandler->extraerTokenDeHeader();

        if ($token) {
            $payload = $this->jwtHandler->validarToken($token);

            if ($payload && isset($payload['tipo']) && $payload['tipo'] === 'access') {
                $this->usuarioAutenticado = [
                    'id' => $payload['user_id'] ?? null,
                    'email' => $payload['email'] ?? null,
                    'rol' => $payload['rol'] ?? null,
                    'nombre' => $payload['nombre'] ?? null
                ];
            }
        }

        // Siempre retorna true (el middleware es opcional)
        return true;
    }

    /**
     * Verifica que el usuario autenticado sea el propietario del recurso
     *
     * @param int $idPropietario ID del propietario del recurso
     * @return bool True si es el propietario o es administrador
     */
    public function esPropietarioOAdmin(int $idPropietario): bool
    {
        if ($this->esAdministrador()) {
            return true;
        }

        return $this->obtenerUsuarioId() === $idPropietario;
    }

    /**
     * Envía una respuesta de error JSON
     *
     * @param int $codigo Código HTTP
     * @param string $mensaje Mensaje de error
     * @return void
     */
    private function enviarRespuestaError(int $codigo, string $mensaje): void
    {
        http_response_code($codigo);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => $codigo,
                'message' => $mensaje
            ]
        ]);
        exit;
    }

    /**
     * Protege una ruta requiriendo autenticación
     *
     * @return array|false Usuario autenticado o false si falla
     */
    public static function proteger()
    {
        $middleware = new self();

        if (!$middleware->verificar()) {
            return false;
        }

        return $middleware->obtenerUsuario();
    }

    /**
     * Protege una ruta requiriendo un rol específico
     *
     * @param string|array $rolesPermitidos Rol o roles permitidos
     * @return array|false Usuario autenticado o false si no tiene permisos
     */
    public static function protegerConRol($rolesPermitidos)
    {
        $middleware = new self();

        if (!$middleware->verificar()) {
            return false;
        }

        // Convertir a array si es string
        if (is_string($rolesPermitidos)) {
            $rolesPermitidos = [$rolesPermitidos];
        }

        $rolUsuario = $middleware->obtenerRol();

        if (!in_array($rolUsuario, $rolesPermitidos)) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => [
                    'code' => 403,
                    'message' => 'No tienes permisos para acceder a este recurso'
                ]
            ]);
            exit;
        }

        return $middleware->obtenerUsuario();
    }
}
