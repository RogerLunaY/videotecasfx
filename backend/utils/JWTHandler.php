<?php
/**
 * Manejador de JWT (JSON Web Tokens)
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Clase JWTHandler - Gestión de tokens JWT
 *
 * Proporciona funcionalidades para generar, validar y decodificar
 * tokens JWT para autenticación y autorización.
 */
class JWTHandler
{
    /** @var array Configuración JWT */
    private array $config;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->config = require __DIR__ . '/../config/jwt.php';
    }

    /**
     * Genera un token JWT
     *
     * @param array $payload Datos a incluir en el token
     * @param string $type Tipo de token ('access' o 'refresh')
     * @return string Token JWT generado
     */
    public function generarToken(array $payload, string $type = 'access'): string
    {
        $header = [
            'typ' => 'JWT',
            'alg' => $this->config['algorithm']
        ];

        // Tiempo actual
        $issuedAt = time();

        // Determinar tiempo de expiración según el tipo de token
        $expiration = $type === 'refresh'
            ? $issuedAt + $this->config['refresh_token_lifetime']
            : $issuedAt + $this->config['access_token_lifetime'];

        // Claims estándar
        $claims = [
            'iss' => $this->config['issuer'],
            'aud' => $this->config['audience'],
            'iat' => $issuedAt,
            'exp' => $expiration,
            'tipo' => $type
        ];

        // Combinar claims estándar con payload personalizado
        $payload = array_merge($claims, $payload);

        // Codificar header y payload
        $headerEncoded = $this->base64UrlEncode(json_encode($header));
        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));

        // Crear firma
        $signature = $this->generarFirma($headerEncoded, $payloadEncoded);

        // Retornar token completo
        return "{$headerEncoded}.{$payloadEncoded}.{$signature}";
    }

    /**
     * Valida un token JWT
     *
     * @param string $token Token a validar
     * @return array|false Payload del token o false si es inválido
     */
    public function validarToken(string $token)
    {
        try {
            // Separar las partes del token
            $parts = explode('.', $token);

            if (count($parts) !== 3) {
                error_log("[JWT] Token inválido: formato incorrecto");
                return false;
            }

            list($headerEncoded, $payloadEncoded, $signatureProvided) = $parts;

            // Verificar firma
            $signatureExpected = $this->generarFirma($headerEncoded, $payloadEncoded);

            if (!hash_equals($signatureExpected, $signatureProvided)) {
                error_log("[JWT] Token inválido: firma no coincide");
                return false;
            }

            // Decodificar payload
            $payload = json_decode($this->base64UrlDecode($payloadEncoded), true);

            if (!$payload) {
                error_log("[JWT] Token inválido: payload no decodificable");
                return false;
            }

            // Validar expiración
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                error_log("[JWT] Token expirado");
                return false;
            }

            // Validar emisor si está habilitado
            if ($this->config['validate_issuer'] && isset($payload['iss'])) {
                if ($payload['iss'] !== $this->config['issuer']) {
                    error_log("[JWT] Token inválido: emisor no coincide");
                    return false;
                }
            }

            // Validar audiencia si está habilitado
            if ($this->config['validate_audience'] && isset($payload['aud'])) {
                if ($payload['aud'] !== $this->config['audience']) {
                    error_log("[JWT] Token inválido: audiencia no coincide");
                    return false;
                }
            }

            return $payload;
        } catch (Exception $e) {
            error_log("[JWT] Error al validar token: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Decodifica un token sin validarlo (útil para debugging)
     *
     * @param string $token Token a decodificar
     * @return array|false
     */
    public function decodificarToken(string $token)
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        $payload = json_decode($this->base64UrlDecode($parts[1]), true);

        return $payload ?: false;
    }

    /**
     * Verifica si un token ha expirado
     *
     * @param string $token Token a verificar
     * @return bool
     */
    public function estaExpirado(string $token): bool
    {
        $payload = $this->decodificarToken($token);

        if (!$payload || !isset($payload['exp'])) {
            return true;
        }

        return $payload['exp'] < time();
    }

    /**
     * Obtiene el tiempo restante de un token en segundos
     *
     * @param string $token Token a verificar
     * @return int Segundos restantes, 0 si expiró
     */
    public function tiempoRestante(string $token): int
    {
        $payload = $this->decodificarToken($token);

        if (!$payload || !isset($payload['exp'])) {
            return 0;
        }

        $remaining = $payload['exp'] - time();

        return max(0, $remaining);
    }

    /**
     * Extrae el token del header Authorization
     *
     * @return string|false Token o false si no existe
     */
    public function extraerTokenDeHeader()
    {
        $headers = $this->obtenerHeaders();

        if (!isset($headers['Authorization'])) {
            return false;
        }

        $authorization = $headers['Authorization'];

        // Formato esperado: "Bearer {token}"
        if (preg_match('/Bearer\s+(.*)$/i', $authorization, $matches)) {
            return $matches[1];
        }

        return false;
    }

    /**
     * Genera la firma del token
     *
     * @param string $headerEncoded Header codificado
     * @param string $payloadEncoded Payload codificado
     * @return string Firma generada
     */
    private function generarFirma(string $headerEncoded, string $payloadEncoded): string
    {
        $data = "{$headerEncoded}.{$payloadEncoded}";
        $signature = hash_hmac('sha256', $data, $this->config['secret'], true);

        return $this->base64UrlEncode($signature);
    }

    /**
     * Codifica en base64 URL-safe
     *
     * @param string $data Datos a codificar
     * @return string Datos codificados
     */
    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Decodifica base64 URL-safe
     *
     * @param string $data Datos a decodificar
     * @return string Datos decodificados
     */
    private function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Obtiene todos los headers de la petición
     *
     * @return array Headers de la petición
     */
    private function obtenerHeaders(): array
    {
        $headers = [];

        // Método preferido (Apache)
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
        } else {
            // Fallback para otros servidores
            foreach ($_SERVER as $key => $value) {
                if (substr($key, 0, 5) === 'HTTP_') {
                    $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                    $headers[$header] = $value;
                }
            }
        }

        return $headers;
    }

    /**
     * Genera un refresh token
     *
     * @param int $userId ID del usuario
     * @param string $email Email del usuario
     * @return string Refresh token
     */
    public function generarRefreshToken(int $userId, string $email): string
    {
        $payload = [
            'user_id' => $userId,
            'email' => $email
        ];

        return $this->generarToken($payload, 'refresh');
    }

    /**
     * Genera un access token
     *
     * @param int $userId ID del usuario
     * @param string $email Email del usuario
     * @param string $rol Rol del usuario
     * @param string $nombre Nombre completo del usuario
     * @return string Access token
     */
    public function generarAccessToken(int $userId, string $email, string $rol, string $nombre): string
    {
        $payload = [
            'user_id' => $userId,
            'email' => $email,
            'rol' => $rol,
            'nombre' => $nombre
        ];

        return $this->generarToken($payload, 'access');
    }

    /**
     * Valida y retorna el usuario del token
     *
     * @param string $token Token a validar
     * @return array|false Información del usuario o false
     */
    public function obtenerUsuarioDeToken(string $token)
    {
        $payload = $this->validarToken($token);

        if (!$payload) {
            return false;
        }

        return [
            'user_id' => $payload['user_id'] ?? null,
            'email' => $payload['email'] ?? null,
            'rol' => $payload['rol'] ?? null,
            'nombre' => $payload['nombre'] ?? null
        ];
    }

    /**
     * Hash de un token para almacenarlo en base de datos
     *
     * @param string $token Token a hashear
     * @return string Hash del token
     */
    public function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }
}
