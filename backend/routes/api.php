<?php
/**
 * Definición de Rutas API
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Clase Router - Enrutador simple para API REST
 */
class Router
{
    /** @var array Rutas registradas */
    private array $routes = [];

    /** @var string Método HTTP de la petición actual */
    private string $method;

    /** @var string URI de la petición actual */
    private string $uri;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->uri = $this->parseUri();
    }

    /**
     * Parsea la URI de la petición
     *
     * @return string URI limpia
     */
    private function parseUri(): string
    {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';

        // Remover query string
        if (($pos = strpos($uri, '?')) !== false) {
            $uri = substr($uri, 0, $pos);
        }

        // Remover /backend de la URI si existe
        $uri = str_replace('/backend', '', $uri);

        // Limpiar y normalizar
        $uri = trim($uri, '/');

        return '/' . $uri;
    }

    /**
     * Registra una ruta GET
     *
     * @param string $path Patrón de la ruta
     * @param callable $callback Función a ejecutar
     * @return void
     */
    public function get(string $path, callable $callback): void
    {
        $this->addRoute('GET', $path, $callback);
    }

    /**
     * Registra una ruta POST
     *
     * @param string $path Patrón de la ruta
     * @param callable $callback Función a ejecutar
     * @return void
     */
    public function post(string $path, callable $callback): void
    {
        $this->addRoute('POST', $path, $callback);
    }

    /**
     * Registra una ruta PUT
     *
     * @param string $path Patrón de la ruta
     * @param callable $callback Función a ejecutar
     * @return void
     */
    public function put(string $path, callable $callback): void
    {
        $this->addRoute('PUT', $path, $callback);
    }

    /**
     * Registra una ruta DELETE
     *
     * @param string $path Patrón de la ruta
     * @param callable $callback Función a ejecutar
     * @return void
     */
    public function delete(string $path, callable $callback): void
    {
        $this->addRoute('DELETE', $path, $callback);
    }

    /**
     * Agrega una ruta al registro
     *
     * @param string $method Método HTTP
     * @param string $path Patrón de la ruta
     * @param callable $callback Función a ejecutar
     * @return void
     */
    private function addRoute(string $method, string $path, callable $callback): void
    {
        $pattern = $this->convertToPattern($path);
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'pattern' => $pattern,
            'callback' => $callback
        ];
    }

    /**
     * Convierte una ruta a patrón regex
     *
     * @param string $path Ruta
     * @return string Patrón regex
     */
    private function convertToPattern(string $path): string
    {
        // Convertir {param} a grupos de captura
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([a-zA-Z0-9_-]+)', $path);
        $pattern = '#^' . $pattern . '$#';

        return $pattern;
    }

    /**
     * Resuelve la ruta actual
     *
     * @return void
     */
    public function resolve(): void
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $this->method) {
                continue;
            }

            if (preg_match($route['pattern'], $this->uri, $matches)) {
                array_shift($matches); // Remover match completo

                // Ejecutar callback con parámetros
                call_user_func_array($route['callback'], $matches);
                return;
            }
        }

        // No se encontró la ruta
        $this->notFound();
    }

    /**
     * Respuesta 404 Not Found
     *
     * @return void
     */
    private function notFound(): void
    {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'error' => [
                'code' => 404,
                'message' => 'Ruta no encontrada'
            ]
        ]);
        exit;
    }
}

// =====================================================
// INICIALIZACIÓN DE CONTROLADORES
// =====================================================

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/UsuarioController.php';
require_once __DIR__ . '/../controllers/VideoController.php';
require_once __DIR__ . '/../controllers/EstadisticaController.php';

$authController = new AuthController();
$usuarioController = new UsuarioController();
$videoController = new VideoController();
$estadisticaController = new EstadisticaController();

// =====================================================
// DEFINICIÓN DE RUTAS
// =====================================================

$router = new Router();

// -----------------------------------------------------
// Rutas de Autenticación
// -----------------------------------------------------
$router->post('/api/auth/login', [$authController, 'login']);
$router->post('/api/auth/register', [$authController, 'register']);
$router->post('/api/auth/logout', [$authController, 'logout']);
$router->post('/api/auth/refresh', [$authController, 'refresh']);
$router->get('/api/auth/me', [$authController, 'me']);

// -----------------------------------------------------
// Rutas de Usuarios
// -----------------------------------------------------
$router->get('/api/usuarios', [$usuarioController, 'index']);
$router->get('/api/usuarios/{id}', [$usuarioController, 'show']);
$router->post('/api/usuarios', [$usuarioController, 'store']);
$router->put('/api/usuarios/{id}', [$usuarioController, 'update']);
$router->delete('/api/usuarios/{id}', [$usuarioController, 'destroy']);
$router->put('/api/usuarios/{id}/password', [$usuarioController, 'updatePassword']);
$router->get('/api/usuarios/rol/{rol}', [$usuarioController, 'byRole']);

// -----------------------------------------------------
// Rutas de Videos
// -----------------------------------------------------
// IMPORTANTE: Las rutas específicas deben ir ANTES de las dinámicas con {id}
$router->get('/api/videos/buscar', [$videoController, 'search']);
$router->get('/api/videos/populares', [$videoController, 'populares']);
$router->get('/api/videos/recientes', [$videoController, 'recientes']);
$router->get('/api/videos/materia/{materiaId}', [$videoController, 'byMateria']);
$router->get('/api/videos/grado/{gradoId}', [$videoController, 'byGrado']);

// Rutas con ID dinámico (específicas primero)
$router->get('/api/videos/{id}/stream', [$videoController, 'stream']);
$router->get('/api/videos/{id}', [$videoController, 'show']);

// Rutas CRUD
$router->get('/api/videos', [$videoController, 'index']);
$router->post('/api/videos', [$videoController, 'store']);
$router->put('/api/videos/{id}', [$videoController, 'update']);
$router->delete('/api/videos/{id}', [$videoController, 'destroy']);

// -----------------------------------------------------
// Rutas de Estadísticas
// -----------------------------------------------------
$router->get('/api/estadisticas/dashboard', [$estadisticaController, 'dashboard']);
$router->get('/api/estadisticas/generales', [$estadisticaController, 'generales']);
$router->get('/api/estadisticas/videos-populares', [$estadisticaController, 'videosPopulares']);
$router->get('/api/estadisticas/por-materia', [$estadisticaController, 'porMateria']);
$router->get('/api/estadisticas/por-grado', [$estadisticaController, 'porGrado']);
$router->get('/api/estadisticas/reproducciones', [$estadisticaController, 'reproducciones']);
$router->get('/api/estadisticas/horas-por-materia', [$estadisticaController, 'horasPorMateria']);
$router->get('/api/estadisticas/horas-por-grado', [$estadisticaController, 'horasPorGrado']);
$router->get('/api/estadisticas/docente/{docenteId}', [$estadisticaController, 'porDocente']);
$router->get('/api/estadisticas/tendencias', [$estadisticaController, 'tendencias']);
$router->get('/api/estadisticas/actividad-reciente', [$estadisticaController, 'actividadReciente']);
$router->post('/api/estadisticas/generar-reporte', [$estadisticaController, 'generarReporte']);
$router->get('/api/estadisticas/resumen-ejecutivo', [$estadisticaController, 'resumenEjecutivo']);

// -----------------------------------------------------
// Rutas de Recursos Auxiliares (Materias, Grados, Temas)
// -----------------------------------------------------
$router->get('/api/materias', function() {
    $database = Database::getInstance();
    $conn = $database->getConnection();

    $stmt = $conn->query("SELECT * FROM materias WHERE estado = 'activo' ORDER BY nombre");
    $materias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => ['materias' => $materias]]);
});

$router->get('/api/grados', function() {
    $database = Database::getInstance();
    $conn = $database->getConnection();

    $stmt = $conn->query("SELECT * FROM grados WHERE estado = 'activo' ORDER BY nivel");
    $grados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => ['grados' => $grados]]);
});

$router->get('/api/temas', function() {
    $database = Database::getInstance();
    $conn = $database->getConnection();

    $materiaId = $_GET['materia_id'] ?? null;

    if ($materiaId) {
        $stmt = $conn->prepare("SELECT * FROM temas WHERE materia_id = :materia_id AND estado = 'activo' ORDER BY orden, nombre");
        $stmt->bindParam(':materia_id', $materiaId);
        $stmt->execute();
    } else {
        $stmt = $conn->query("SELECT * FROM temas WHERE estado = 'activo' ORDER BY materia_id, orden, nombre");
    }

    $temas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => ['temas' => $temas]]);
});

$router->get('/api/roles', function() {
    $database = Database::getInstance();
    $conn = $database->getConnection();

    $stmt = $conn->query("SELECT id, nombre, descripcion FROM roles WHERE estado = 'activo'");
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => ['roles' => $roles]]);
});

// -----------------------------------------------------
// Ruta de Health Check
// -----------------------------------------------------
$router->get('/api/health', function() {
    $health = [
        'status' => 'ok',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0',
        'environment' => $_ENV['APP_ENV'] ?? 'production'
    ];

    // Verificar conexión a BD
    try {
        $database = Database::getInstance();
        $conn = $database->getConnection();
        $conn->query('SELECT 1');
        $health['database'] = 'connected';
    } catch (Exception $e) {
        $health['database'] = 'disconnected';
        $health['status'] = 'error';
    }

    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => $health]);
});

// -----------------------------------------------------
// Ruta raíz
// -----------------------------------------------------
$router->get('/', function() {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'API de Videoteca San Francisco Xavier',
        'version' => '1.0.0',
        'endpoints' => [
            'auth' => '/api/auth',
            'usuarios' => '/api/usuarios',
            'videos' => '/api/videos',
            'estadisticas' => '/api/estadisticas',
            'health' => '/api/health'
        ]
    ]);
});

$router->get('/api', function() {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'API de Videoteca San Francisco Xavier',
        'version' => '1.0.0',
        'documentation' => 'https://github.com/RogerLunaY/videotecasfx'
    ]);
});

return $router;
