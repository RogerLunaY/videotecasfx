<?php
/**
 * Controlador de Temas
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/Tema.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

/**
 * Clase TemaController - Controlador de temas curriculares
 *
 * Maneja las operaciones de consulta de temas del currículo
 */
class TemaController
{
    /** @var Tema Modelo de tema */
    private Tema $temaModel;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->temaModel = new Tema();
    }

    /**
     * Lista todos los temas con filtros
     *
     * GET /api/temas?materia_id=1&grado_id=2
     *
     * @return void
     */
    public function index(): void
    {
        $filtros = [];

        if (isset($_GET['materia_id'])) {
            $filtros['materia_id'] = (int)$_GET['materia_id'];
        }

        if (isset($_GET['grado_id'])) {
            $filtros['grado_id'] = (int)$_GET['grado_id'];
        }

        $temas = $this->temaModel->obtenerTodos($filtros);

        if ($temas === false) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Error al obtener temas']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'temas' => $temas
        ]);
    }

    /**
     * Obtiene un tema específico
     *
     * GET /api/temas/{id}
     *
     * @param int $id ID del tema
     * @return void
     */
    public function show(int $id): void
    {
        $tema = $this->temaModel->obtenerPorId($id);

        if (!$tema) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Tema no encontrado']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['tema' => $tema]
        ]);
    }

    /**
     * Obtiene temas agrupados por materia y grado
     *
     * GET /api/temas/estructura?materia_id=1&grado_id=2
     *
     * @return void
     */
    public function estructura(): void
    {
        $materiaId = isset($_GET['materia_id']) ? (int)$_GET['materia_id'] : null;
        $gradoId = isset($_GET['grado_id']) ? (int)$_GET['grado_id'] : null;

        $estructura = $this->temaModel->obtenerPorMateriaYGrado($materiaId, $gradoId);

        if ($estructura === false) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Error al obtener estructura de temas']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['estructura' => $estructura]
        ]);
    }

    /**
     * Busca temas por nombre
     *
     * GET /api/temas/buscar?q=texto&materia_id=1&grado_id=2
     *
     * @return void
     */
    public function buscar(): void
    {
        if (!isset($_GET['q']) || empty(trim($_GET['q']))) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'El parámetro de búsqueda "q" es requerido']
            ]);
            return;
        }

        $busqueda = trim($_GET['q']);
        $materiaId = isset($_GET['materia_id']) ? (int)$_GET['materia_id'] : null;
        $gradoId = isset($_GET['grado_id']) ? (int)$_GET['grado_id'] : null;

        $temas = $this->temaModel->buscar($busqueda, $materiaId, $gradoId);

        if ($temas === false) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => ['message' => 'Error al buscar temas']
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => ['temas' => $temas]
        ]);
    }
}
