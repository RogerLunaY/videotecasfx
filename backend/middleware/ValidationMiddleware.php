<?php
/**
 * Middleware de Validación
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Clase ValidationMiddleware - Middleware de validación de datos
 *
 * Proporciona funcionalidades para validar y sanitizar
 * los datos de entrada de las peticiones HTTP.
 */
class ValidationMiddleware
{
    /** @var array Errores de validación */
    private array $errores = [];

    /**
     * Valida los datos de entrada
     *
     * @param array $datos Datos a validar
     * @param array $reglas Reglas de validación
     * @return bool True si los datos son válidos
     */
    public function validar(array $datos, array $reglas): bool
    {
        $this->errores = [];

        foreach ($reglas as $campo => $reglasDelCampo) {
            $valor = $datos[$campo] ?? null;
            $reglasArray = explode('|', $reglasDelCampo);

            foreach ($reglasArray as $regla) {
                // Parsear regla y parámetros
                $partes = explode(':', $regla);
                $nombreRegla = $partes[0];
                $parametros = isset($partes[1]) ? explode(',', $partes[1]) : [];

                // Aplicar regla
                if (!$this->aplicarRegla($campo, $valor, $nombreRegla, $parametros)) {
                    break; // Si una regla falla, no validar las siguientes para este campo
                }
            }
        }

        return empty($this->errores);
    }

    /**
     * Aplica una regla de validación
     *
     * @param string $campo Nombre del campo
     * @param mixed $valor Valor del campo
     * @param string $regla Regla a aplicar
     * @param array $parametros Parámetros de la regla
     * @return bool True si la validación pasa
     */
    private function aplicarRegla(string $campo, $valor, string $regla, array $parametros = []): bool
    {
        switch ($regla) {
            case 'required':
                return $this->validarRequerido($campo, $valor);

            case 'email':
                return $this->validarEmail($campo, $valor);

            case 'min':
                return $this->validarMin($campo, $valor, (int)($parametros[0] ?? 0));

            case 'max':
                return $this->validarMax($campo, $valor, (int)($parametros[0] ?? PHP_INT_MAX));

            case 'numeric':
                return $this->validarNumerico($campo, $valor);

            case 'integer':
                return $this->validarEntero($campo, $valor);

            case 'string':
                return $this->validarString($campo, $valor);

            case 'in':
                return $this->validarIn($campo, $valor, $parametros);

            case 'url':
                return $this->validarUrl($campo, $valor);

            case 'alpha':
                return $this->validarAlfa($campo, $valor);

            case 'alphanumeric':
                return $this->validarAlfanumerico($campo, $valor);

            case 'date':
                return $this->validarFecha($campo, $valor);

            case 'regex':
                return $this->validarRegex($campo, $valor, $parametros[0] ?? '');

            default:
                return true; // Regla no reconocida, pasar validación
        }
    }

    /**
     * Valida que el campo sea requerido
     */
    private function validarRequerido(string $campo, $valor): bool
    {
        if ($valor === null || $valor === '' || (is_array($valor) && empty($valor))) {
            $this->agregarError($campo, "El campo {$campo} es requerido");
            return false;
        }

        return true;
    }

    /**
     * Valida que el campo sea un email válido
     */
    private function validarEmail(string $campo, $valor): bool
    {
        if ($valor && !filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            $this->agregarError($campo, "El campo {$campo} debe ser un email válido");
            return false;
        }

        return true;
    }

    /**
     * Valida longitud mínima
     */
    private function validarMin(string $campo, $valor, int $min): bool
    {
        if ($valor && strlen($valor) < $min) {
            $this->agregarError($campo, "El campo {$campo} debe tener al menos {$min} caracteres");
            return false;
        }

        return true;
    }

    /**
     * Valida longitud máxima
     */
    private function validarMax(string $campo, $valor, int $max): bool
    {
        if ($valor && strlen($valor) > $max) {
            $this->agregarError($campo, "El campo {$campo} no debe exceder {$max} caracteres");
            return false;
        }

        return true;
    }

    /**
     * Valida que el valor sea numérico
     */
    private function validarNumerico(string $campo, $valor): bool
    {
        if ($valor !== null && !is_numeric($valor)) {
            $this->agregarError($campo, "El campo {$campo} debe ser numérico");
            return false;
        }

        return true;
    }

    /**
     * Valida que el valor sea entero
     */
    private function validarEntero(string $campo, $valor): bool
    {
        if ($valor !== null && !filter_var($valor, FILTER_VALIDATE_INT) && $valor !== 0) {
            $this->agregarError($campo, "El campo {$campo} debe ser un número entero");
            return false;
        }

        return true;
    }

    /**
     * Valida que el valor sea string
     */
    private function validarString(string $campo, $valor): bool
    {
        if ($valor !== null && !is_string($valor)) {
            $this->agregarError($campo, "El campo {$campo} debe ser una cadena de texto");
            return false;
        }

        return true;
    }

    /**
     * Valida que el valor esté en una lista
     */
    private function validarIn(string $campo, $valor, array $opciones): bool
    {
        if ($valor && !in_array($valor, $opciones)) {
            $this->agregarError($campo, "El campo {$campo} debe ser uno de: " . implode(', ', $opciones));
            return false;
        }

        return true;
    }

    /**
     * Valida que el valor sea una URL válida
     */
    private function validarUrl(string $campo, $valor): bool
    {
        if ($valor && !filter_var($valor, FILTER_VALIDATE_URL)) {
            $this->agregarError($campo, "El campo {$campo} debe ser una URL válida");
            return false;
        }

        return true;
    }

    /**
     * Valida que el valor contenga solo letras
     */
    private function validarAlfa(string $campo, $valor): bool
    {
        if ($valor && !preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/', $valor)) {
            $this->agregarError($campo, "El campo {$campo} solo debe contener letras");
            return false;
        }

        return true;
    }

    /**
     * Valida que el valor sea alfanumérico
     */
    private function validarAlfanumerico(string $campo, $valor): bool
    {
        if ($valor && !preg_match('/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/', $valor)) {
            $this->agregarError($campo, "El campo {$campo} solo debe contener letras y números");
            return false;
        }

        return true;
    }

    /**
     * Valida que el valor sea una fecha válida
     */
    private function validarFecha(string $campo, $valor): bool
    {
        if ($valor) {
            $fecha = date_parse($valor);
            if ($fecha['error_count'] > 0 || $fecha['warning_count'] > 0) {
                $this->agregarError($campo, "El campo {$campo} debe ser una fecha válida");
                return false;
            }
        }

        return true;
    }

    /**
     * Valida que el valor cumpla con una expresión regular
     */
    private function validarRegex(string $campo, $valor, string $patron): bool
    {
        if ($valor && !preg_match($patron, $valor)) {
            $this->agregarError($campo, "El campo {$campo} no cumple con el formato requerido");
            return false;
        }

        return true;
    }

    /**
     * Agrega un error de validación
     *
     * @param string $campo Campo con error
     * @param string $mensaje Mensaje de error
     * @return void
     */
    private function agregarError(string $campo, string $mensaje): void
    {
        if (!isset($this->errores[$campo])) {
            $this->errores[$campo] = [];
        }

        $this->errores[$campo][] = $mensaje;
    }

    /**
     * Obtiene los errores de validación
     *
     * @return array
     */
    public function obtenerErrores(): array
    {
        return $this->errores;
    }

    /**
     * Sanitiza los datos de entrada
     *
     * @param array $datos Datos a sanitizar
     * @return array Datos sanitizados
     */
    public static function sanitizar(array $datos): array
    {
        $datosSanitizados = [];

        foreach ($datos as $clave => $valor) {
            if (is_array($valor)) {
                $datosSanitizados[$clave] = self::sanitizar($valor);
            } elseif (is_string($valor)) {
                // Eliminar etiquetas HTML y PHP
                $valor = strip_tags($valor);
                // Convertir caracteres especiales a entidades HTML
                $valor = htmlspecialchars($valor, ENT_QUOTES, 'UTF-8');
                // Eliminar espacios al inicio y final
                $valor = trim($valor);

                $datosSanitizados[$clave] = $valor;
            } else {
                $datosSanitizados[$clave] = $valor;
            }
        }

        return $datosSanitizados;
    }

    /**
     * Sanitiza un string individual
     *
     * @param string $valor Valor a sanitizar
     * @return string Valor sanitizado
     */
    public static function sanitizarString(string $valor): string
    {
        $valor = strip_tags($valor);
        $valor = htmlspecialchars($valor, ENT_QUOTES, 'UTF-8');
        $valor = trim($valor);

        return $valor;
    }

    /**
     * Valida y sanitiza email
     *
     * @param string $email Email a validar
     * @return string|false Email sanitizado o false si es inválido
     */
    public static function sanitizarEmail(string $email)
    {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return strtolower(trim($email));
        }

        return false;
    }

    /**
     * Envía respuesta de error de validación
     *
     * @return void
     */
    public function enviarErrorValidacion(): void
    {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => 422,
                'message' => 'Errores de validación',
                'validation_errors' => $this->errores
            ]
        ]);
        exit;
    }

    /**
     * Valida datos y envía error si falla
     *
     * @param array $datos Datos a validar
     * @param array $reglas Reglas de validación
     * @return bool True si la validación pasa
     */
    public function validarOFallar(array $datos, array $reglas): bool
    {
        if (!$this->validar($datos, $reglas)) {
            $this->enviarErrorValidacion();
            return false;
        }

        return true;
    }
}
