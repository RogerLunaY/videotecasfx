<?php
/**
 * Middleware de Roles
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Clase RoleMiddleware - Middleware de verificación de roles
 *
 * Verifica que el usuario autenticado tenga los permisos
 * necesarios según su rol.
 */
class RoleMiddleware
{
    /** @var array Permisos por rol */
    private static array $permisosPorRol = [
        'Administrador' => [
            'usuarios' => ['crear', 'leer', 'actualizar', 'eliminar'],
            'videos' => ['crear', 'leer', 'actualizar', 'eliminar'],
            'estadisticas' => ['leer', 'exportar'],
            'configuracion' => ['leer', 'actualizar']
        ],
        'Docente' => [
            'videos' => ['crear', 'leer', 'actualizar_propios', 'eliminar_propios'],
            'estadisticas' => ['leer_propias'],
            'perfil' => ['leer', 'actualizar']
        ]
    ];

    /**
     * Verifica que el usuario tenga un rol específico
     *
     * @param string $rol Rol del usuario actual
     * @param string|array $rolesPermitidos Roles permitidos
     * @return bool
     */
    public static function tieneRol(string $rol, $rolesPermitidos): bool
    {
        if (is_string($rolesPermitidos)) {
            $rolesPermitidos = [$rolesPermitidos];
        }

        return in_array($rol, $rolesPermitidos);
    }

    /**
     * Verifica que el usuario tenga un permiso específico
     *
     * @param string $rol Rol del usuario
     * @param string $recurso Recurso a verificar
     * @param string $accion Acción a verificar
     * @return bool
     */
    public static function tienePermiso(string $rol, string $recurso, string $accion): bool
    {
        if (!isset(self::$permisosPorRol[$rol])) {
            return false;
        }

        $permisos = self::$permisosPorRol[$rol];

        if (!isset($permisos[$recurso])) {
            return false;
        }

        return in_array($accion, $permisos[$recurso]);
    }

    /**
     * Verifica que el usuario sea administrador
     *
     * @param string $rol Rol del usuario
     * @return bool
     */
    public static function esAdministrador(string $rol): bool
    {
        return $rol === 'Administrador';
    }

    /**
     * Verifica que el usuario sea docente
     *
     * @param string $rol Rol del usuario
     * @return bool
     */
    public static function esDocente(string $rol): bool
    {
        return $rol === 'Docente';
    }

    /**
     * Requiere rol de administrador
     *
     * @param string $rolActual Rol del usuario actual
     * @return bool
     */
    public static function requiereAdministrador(string $rolActual): bool
    {
        if (!self::esAdministrador($rolActual)) {
            self::enviarError(403, 'Se requieren permisos de administrador');
            return false;
        }

        return true;
    }

    /**
     * Requiere uno de los roles especificados
     *
     * @param string $rolActual Rol del usuario actual
     * @param array $rolesPermitidos Roles permitidos
     * @return bool
     */
    public static function requiereRoles(string $rolActual, array $rolesPermitidos): bool
    {
        if (!self::tieneRol($rolActual, $rolesPermitidos)) {
            self::enviarError(403, 'No tienes permisos para realizar esta acción');
            return false;
        }

        return true;
    }

    /**
     * Verifica permisos para gestionar un recurso
     *
     * @param string $rol Rol del usuario
     * @param string $recurso Recurso
     * @param string $accion Acción
     * @param int|null $idPropietario ID del propietario del recurso
     * @param int|null $idUsuario ID del usuario actual
     * @return bool
     */
    public static function puedeGestionar(
        string $rol,
        string $recurso,
        string $accion,
        ?int $idPropietario = null,
        ?int $idUsuario = null
    ): bool {
        // Los administradores pueden todo
        if (self::esAdministrador($rol)) {
            return true;
        }

        // Verificar permiso general
        if (self::tienePermiso($rol, $recurso, $accion)) {
            return true;
        }

        // Verificar permisos sobre recursos propios
        if ($idPropietario && $idUsuario && $idPropietario === $idUsuario) {
            $accionPropia = "{$accion}_propios";
            if (self::tienePermiso($rol, $recurso, $accionPropia)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Envía una respuesta de error
     *
     * @param int $codigo Código HTTP
     * @param string $mensaje Mensaje de error
     * @return void
     */
    private static function enviarError(int $codigo, string $mensaje): void
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
     * Obtiene todos los permisos de un rol
     *
     * @param string $rol Rol del usuario
     * @return array Permisos del rol
     */
    public static function obtenerPermisos(string $rol): array
    {
        return self::$permisosPorRol[$rol] ?? [];
    }

    /**
     * Verifica permisos y envía error si no los tiene
     *
     * @param string $rol Rol del usuario
     * @param string $recurso Recurso
     * @param string $accion Acción
     * @return bool
     */
    public static function requierePermiso(string $rol, string $recurso, string $accion): bool
    {
        if (!self::tienePermiso($rol, $recurso, $accion)) {
            self::enviarError(403, "No tienes permiso para {$accion} en {$recurso}");
            return false;
        }

        return true;
    }
}
