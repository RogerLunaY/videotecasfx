<?php
/**
 * Controlador de Campos
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/Campo.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

/**
 * Clase CampoController - Controlador de campos de saberes
 *
 * Maneja las operaciones de consulta de campos del currículo boliviano
 */
class CampoController
{
    /** @var Campo Modelo de campo */
    private Campo $campoModel;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->campoModel = new Campo();
    }

    /**
     * Lista todos los campos
     *
     * GET /api/campos
     *
     * @return void
     */
    public function index(): void
    {
        $campos = $this->campoModel->obtenerTodos('activo');

        if ($campos === false) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Error al obtener campos']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['campos' => $campos]
        ]);
    }

    /**
     * Obtiene un campo específico
     *
     * GET /api/campos/{id}
     *
     * @param int $id ID del campo
     * @return void
     */
    public function show(int $id): void
    {
        $campo = $this->campoModel->obtenerPorId($id);

        if (!$campo) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Campo no encontrado']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['campo' => $campo]
        ]);
    }

    /**
     * Obtiene un campo con sus materias
     *
     * GET /api/campos/{id}/materias
     *
     * @param int $id ID del campo
     * @return void
     */
    public function conMaterias(int $id): void
    {
        $campo = $this->campoModel->obtenerConMaterias($id);

        if (!$campo) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Campo no encontrado']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['campo' => $campo]
        ]);
    }
}
