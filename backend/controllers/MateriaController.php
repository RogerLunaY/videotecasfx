<?php
/**
 * Controlador de Materias
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/Materia.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

/**
 * Clase MateriaController - Controlador de materias/asignaturas
 *
 * Maneja las operaciones de consulta de materias del currículo
 */
class MateriaController
{
    /** @var Materia Modelo de materia */
    private Materia $materiaModel;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->materiaModel = new Materia();
    }

    /**
     * Lista todas las materias
     *
     * GET /api/materias?campo_id=1
     *
     * @return void
     */
    public function index(): void
    {
        $filtros = [];

        if (isset($_GET['campo_id'])) {
            $filtros['campo_id'] = (int)$_GET['campo_id'];
        }

        $materias = $this->materiaModel->obtenerTodos($filtros);

        if ($materias === false) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Error al obtener materias']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['materias' => $materias]
        ]);
    }

    /**
     * Obtiene una materia específica
     *
     * GET /api/materias/{id}
     *
     * @param int $id ID de la materia
     * @return void
     */
    public function show(int $id): void
    {
        $materia = $this->materiaModel->obtenerPorId($id);

        if (!$materia) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Materia no encontrada']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['materia' => $materia]
        ]);
    }

    /**
     * Obtiene una materia con sus temas
     *
     * GET /api/materias/{id}/temas?grado_id=1
     *
     * @param int $id ID de la materia
     * @return void
     */
    public function conTemas(int $id): void
    {
        $gradoId = isset($_GET['grado_id']) ? (int)$_GET['grado_id'] : null;

        $materia = $this->materiaModel->obtenerConTemas($id, $gradoId);

        if (!$materia) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Materia no encontrada']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['materia' => $materia]
        ]);
    }

    /**
     * Obtiene materias agrupadas por campo
     *
     * GET /api/materias/por-campo
     *
     * @return void
     */
    public function porCampo(): void
    {
        $campos = $this->materiaModel->obtenerPorCampo();

        if ($campos === false) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Error al obtener materias por campo']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['campos' => $campos]
        ]);
    }
}
