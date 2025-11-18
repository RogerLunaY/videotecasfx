<?php
/**
 * Controlador de Grados
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/Grado.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

/**
 * Clase GradoController - Controlador de grados escolares
 *
 * Maneja las operaciones de consulta de grados del nivel secundario
 */
class GradoController
{
    /** @var Grado Modelo de grado */
    private Grado $gradoModel;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->gradoModel = new Grado();
    }

    /**
     * Lista todos los grados
     *
     * GET /api/grados
     *
     * @return void
     */
    public function index(): void
    {
        $grados = $this->gradoModel->obtenerTodos('activo');

        if ($grados === false) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Error al obtener grados']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'grados' => $grados
        ]);
    }

    /**
     * Obtiene un grado específico
     *
     * GET /api/grados/{id}
     *
     * @param int $id ID del grado
     * @return void
     */
    public function show(int $id): void
    {
        $grado = $this->gradoModel->obtenerPorId($id);

        if (!$grado) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Grado no encontrado']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['grado' => $grado]
        ]);
    }

    /**
     * Obtiene un grado con sus temas
     *
     * GET /api/grados/{id}/temas?materia_id=1
     *
     * @param int $id ID del grado
     * @return void
     */
    public function conTemas(int $id): void
    {
        $materiaId = isset($_GET['materia_id']) ? (int)$_GET['materia_id'] : null;

        $grado = $this->gradoModel->obtenerConTemas($id, $materiaId);

        if (!$grado) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Grado no encontrado']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['grado' => $grado]
        ]);
    }
}
