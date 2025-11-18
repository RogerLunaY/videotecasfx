<?php
/**
 * Configuración de Límites de Asignaciones
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * Define los límites máximos para asignaciones de docentes
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Clase AsignacionLimites - Configuración de límites del sistema
 *
 * Centraliza los límites de asignaciones para mantener consistencia
 * entre frontend y backend
 */
class AsignacionLimites
{
    /**
     * Máximo número de materias diferentes que puede tener un docente
     * @var int
     */
    const MAX_MATERIAS = 3;

    /**
     * Máximo número de grados diferentes que puede tener un docente
     * @var int
     */
    const MAX_GRADOS = 6;

    /**
     * Máximo número total de asignaciones (combinaciones materia-grado)
     * que puede tener un docente.
     *
     * Teóricamente con 3 materias × 6 grados = 18 combinaciones posibles,
     * pero en la práctica será menor dependiendo de qué materias y grados se combinen
     *
     * @var int
     */
    const MAX_ASIGNACIONES_TOTALES = 18; // 3 materias × 6 grados

    /**
     * Mínimo número de materias requeridas para un docente
     * @var int
     */
    const MIN_MATERIAS = 1;

    /**
     * Mínimo número de grados requeridos para un docente
     * @var int
     */
    const MIN_GRADOS = 1;

    /**
     * Valida que el número de materias únicas esté dentro del límite
     *
     * @param array $asignaciones Array de asignaciones con materia_id
     * @return array ['valido' => bool, 'cantidad' => int, 'mensaje' => string]
     */
    public static function validarMaterias(array $asignaciones): array
    {
        $materiasUnicas = array_unique(array_column($asignaciones, 'materia_id'));
        $cantidad = count($materiasUnicas);

        if ($cantidad < self::MIN_MATERIAS) {
            return [
                'valido' => false,
                'cantidad' => $cantidad,
                'mensaje' => "El docente debe tener al menos " . self::MIN_MATERIAS . " materia(s) asignada(s)"
            ];
        }

        if ($cantidad > self::MAX_MATERIAS) {
            return [
                'valido' => false,
                'cantidad' => $cantidad,
                'mensaje' => "El docente no puede tener más de " . self::MAX_MATERIAS . " materias diferentes. Actualmente tiene {$cantidad}"
            ];
        }

        return [
            'valido' => true,
            'cantidad' => $cantidad,
            'mensaje' => "OK"
        ];
    }

    /**
     * Valida que el número de grados únicos esté dentro del límite
     *
     * @param array $asignaciones Array de asignaciones con grado_id
     * @return array ['valido' => bool, 'cantidad' => int, 'mensaje' => string]
     */
    public static function validarGrados(array $asignaciones): array
    {
        $gradosUnicos = array_unique(array_column($asignaciones, 'grado_id'));
        $cantidad = count($gradosUnicos);

        if ($cantidad < self::MIN_GRADOS) {
            return [
                'valido' => false,
                'cantidad' => $cantidad,
                'mensaje' => "El docente debe tener al menos " . self::MIN_GRADOS . " grado(s) asignado(s)"
            ];
        }

        if ($cantidad > self::MAX_GRADOS) {
            return [
                'valido' => false,
                'cantidad' => $cantidad,
                'mensaje' => "El docente no puede tener más de " . self::MAX_GRADOS . " grados diferentes. Actualmente tiene {$cantidad}"
            ];
        }

        return [
            'valido' => true,
            'cantidad' => $cantidad,
            'mensaje' => "OK"
        ];
    }

    /**
     * Valida que el número total de asignaciones esté dentro del límite
     *
     * @param array $asignaciones Array de asignaciones
     * @return array ['valido' => bool, 'cantidad' => int, 'mensaje' => string]
     */
    public static function validarAsignacionesTotales(array $asignaciones): array
    {
        $cantidad = count($asignaciones);

        if ($cantidad > self::MAX_ASIGNACIONES_TOTALES) {
            return [
                'valido' => false,
                'cantidad' => $cantidad,
                'mensaje' => "El número total de asignaciones no puede exceder " . self::MAX_ASIGNACIONES_TOTALES . ". Actualmente tiene {$cantidad}"
            ];
        }

        return [
            'valido' => true,
            'cantidad' => $cantidad,
            'mensaje' => "OK"
        ];
    }

    /**
     * Valida todas las restricciones de asignaciones
     *
     * @param array $asignaciones Array de asignaciones con materia_id y grado_id
     * @return array ['valido' => bool, 'errores' => array, 'estadisticas' => array]
     */
    public static function validarTodo(array $asignaciones): array
    {
        $errores = [];

        // Validar materias
        $validacionMaterias = self::validarMaterias($asignaciones);
        if (!$validacionMaterias['valido']) {
            $errores[] = $validacionMaterias['mensaje'];
        }

        // Validar grados
        $validacionGrados = self::validarGrados($asignaciones);
        if (!$validacionGrados['valido']) {
            $errores[] = $validacionGrados['mensaje'];
        }

        // Validar total
        $validacionTotal = self::validarAsignacionesTotales($asignaciones);
        if (!$validacionTotal['valido']) {
            $errores[] = $validacionTotal['mensaje'];
        }

        return [
            'valido' => empty($errores),
            'errores' => $errores,
            'estadisticas' => [
                'total_asignaciones' => $validacionTotal['cantidad'],
                'materias_unicas' => $validacionMaterias['cantidad'],
                'grados_unicos' => $validacionGrados['cantidad'],
                'limite_materias' => self::MAX_MATERIAS,
                'limite_grados' => self::MAX_GRADOS,
                'limite_total' => self::MAX_ASIGNACIONES_TOTALES
            ]
        ];
    }

    /**
     * Obtiene los límites como array para el frontend
     *
     * @return array
     */
    public static function obtenerLimites(): array
    {
        return [
            'max_materias' => self::MAX_MATERIAS,
            'max_grados' => self::MAX_GRADOS,
            'max_asignaciones_totales' => self::MAX_ASIGNACIONES_TOTALES,
            'min_materias' => self::MIN_MATERIAS,
            'min_grados' => self::MIN_GRADOS
        ];
    }
}
