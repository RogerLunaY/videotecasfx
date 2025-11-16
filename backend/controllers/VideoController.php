<?php
/**
 * Controlador de Videos
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../models/Video.php';
require_once __DIR__ . '/../models/Reproduccion.php';
require_once __DIR__ . '/../utils/Logger.php';
require_once __DIR__ . '/../utils/FileHandler.php';
require_once __DIR__ . '/../utils/VideoProcessor.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';
require_once __DIR__ . '/../middleware/ValidationMiddleware.php';

/**
 * Clase VideoController - Controlador de videos
 *
 * Maneja todas las operaciones CRUD de videos, upload y streaming
 */
class VideoController
{
    /** @var Video Modelo de video */
    private Video $videoModel;

    /** @var Reproduccion Modelo de reproducción */
    private Reproduccion $reproduccionModel;

    /** @var Logger Sistema de logging */
    private Logger $logger;

    /** @var FileHandler Manejador de archivos */
    private FileHandler $fileHandler;

    /** @var VideoProcessor Procesador de videos */
    private VideoProcessor $videoProcessor;

    /** @var ValidationMiddleware Validador */
    private ValidationMiddleware $validator;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->videoModel = new Video();
        $this->reproduccionModel = new Reproduccion();
        $this->logger = new Logger();
        $this->fileHandler = new FileHandler();
        $this->videoProcessor = new VideoProcessor();
        $this->validator = new ValidationMiddleware();
    }

    /**
     * Obtiene todos los videos con filtros y paginación
     *
     * GET /api/videos?materia_id=1&grado_id=2&tema_id=3&page=1&per_page=20&busqueda=texto&order_by=fecha_subida&order_dir=DESC
     *
     * @return void
     */
    public function index(): void
    {
        // Los videos son públicos, autenticación opcional
        $authMiddleware = new AuthMiddleware();
        $authMiddleware->opcional();

        // Parámetros de paginación
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 20;
        $offset = ($page - 1) * $perPage;

        // Filtros
        $filtros = [];
        if (isset($_GET['materia_id'])) $filtros['materia_id'] = (int)$_GET['materia_id'];
        if (isset($_GET['grado_id'])) $filtros['grado_id'] = (int)$_GET['grado_id'];
        if (isset($_GET['tema_id'])) $filtros['tema_id'] = (int)$_GET['tema_id'];
        if (isset($_GET['docente_id'])) $filtros['docente_id'] = (int)$_GET['docente_id'];
        if (isset($_GET['busqueda'])) $filtros['busqueda'] = $_GET['busqueda'];
        if (isset($_GET['estado'])) $filtros['estado'] = $_GET['estado'];

        // Orden
        $orderBy = $_GET['order_by'] ?? 'fecha_subida';
        $orderDir = $_GET['order_dir'] ?? 'DESC';

        // Obtener videos
        $videos = $this->videoModel->obtenerTodos($filtros, $perPage, $offset, $orderBy, $orderDir);
        $total = $this->videoModel->contar($filtros);

        $this->enviarRespuesta(200, true, [
            'videos' => $videos,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ]);
    }

    /**
     * Obtiene un video por ID
     *
     * GET /api/videos/{id}
     *
     * @param int $id ID del video
     * @return void
     */
    public function show(int $id): void
    {
        $video = $this->videoModel->obtenerPorId($id);

        if (!$video) {
            $this->enviarRespuesta(404, false, null, 'Video no encontrado');
            return;
        }

        $this->enviarRespuesta(200, true, ['video' => $video]);
    }

    /**
     * Sube y crea un nuevo video
     *
     * POST /api/videos
     * Content-Type: multipart/form-data
     * Fields: titulo, descripcion, materia_id, grado_id, tema_id, video (file), thumbnail (file, optional)
     *
     * @return void
     */
    public function store(): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que sea docente o admin
        if (!RoleMiddleware::tieneRol($usuario['rol'], ['Administrador', 'Docente'])) {
            $this->enviarRespuesta(403, false, null, 'No tienes permisos para subir videos');
            return;
        }

        // Validar datos
        $reglas = [
            'titulo' => 'required|string|min:3|max:255',
            'materia_id' => 'required|integer',
            'grado_id' => 'required|integer'
        ];

        $data = $_POST;
        if (!$this->validator->validar($data, $reglas)) {
            $this->validator->enviarErrorValidacion();
            return;
        }

        // Verificar que se subió un archivo de video
        if (!isset($_FILES['video']) || $_FILES['video']['error'] !== UPLOAD_ERR_OK) {
            $this->enviarRespuesta(400, false, null, 'No se proporcionó un archivo de video válido');
            return;
        }

        // Subir archivo de video
        $infoVideo = $this->fileHandler->subirVideo(
            $_FILES['video'],
            (int)$data['materia_id'],
            (int)$data['grado_id']
        );

        if (!$infoVideo) {
            $errores = $this->fileHandler->obtenerErrores();
            $this->enviarRespuesta(400, false, ['errores' => $errores], 'Error al subir el video');
            return;
        }

        // Procesar metadata del video
        $metadatos = $this->videoProcessor->extraerMetadatos($infoVideo['ruta_completa']);

        // Manejar thumbnail
        $thumbnailPath = null;
        if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
            $infoThumbnail = $this->fileHandler->subirThumbnail($_FILES['thumbnail'], $infoVideo['nombre_archivo']);
            if ($infoThumbnail) {
                $thumbnailPath = $infoThumbnail['ruta_relativa'];
            }
        } else {
            // Generar thumbnail automático si está habilitado
            $config = require __DIR__ . '/../config/app.php';
            if ($config['video']['auto_thumbnail'] && $this->videoProcessor->estaFFmpegDisponible()) {
                $thumbPath = $config['video']['thumbnail_path'] . pathinfo($infoVideo['nombre_archivo'], PATHINFO_FILENAME) . '_thumb.jpg';
                if ($this->videoProcessor->generarThumbnail($infoVideo['ruta_completa'], $thumbPath, 5)) {
                    // Construir ruta relativa asegurando que empiece con "uploads/"
                    $backendDir = realpath(__DIR__ . '/..');
                    $thumbnailPath = str_replace($backendDir . '/', '', $thumbPath);

                    // Asegurar que la ruta comience con "uploads/"
                    if (strpos($thumbnailPath, 'uploads/') !== 0) {
                        $uploadsPos = strpos($thumbnailPath, 'uploads/');
                        if ($uploadsPos !== false) {
                            $thumbnailPath = substr($thumbnailPath, $uploadsPos);
                        }
                    }
                }
            }
        }

        // Crear registro en la base de datos
        $this->videoModel->titulo = ValidationMiddleware::sanitizarString($data['titulo']);
        $this->videoModel->descripcion = isset($data['descripcion']) ? ValidationMiddleware::sanitizarString($data['descripcion']) : null;
        $this->videoModel->archivo_path = $infoVideo['ruta_relativa'];
        $this->videoModel->archivo_nombre = $infoVideo['nombre_archivo'];
        $this->videoModel->thumbnail_path = $thumbnailPath;
        $this->videoModel->duracion = $metadatos['duracion'] ?? null;
        $this->videoModel->tamanio = $infoVideo['tamanio'];
        $this->videoModel->formato = $infoVideo['extension'];
        $this->videoModel->resolucion = $metadatos['resolucion'] ?? $this->videoProcessor->detectarResolucion($infoVideo['ruta_completa']);
        $this->videoModel->codec = $metadatos['codec'] ?? null;
        $this->videoModel->tema_id = isset($data['tema_id']) ? (int)$data['tema_id'] : null;
        $this->videoModel->materia_id = (int)$data['materia_id'];
        $this->videoModel->grado_id = (int)$data['grado_id'];
        $this->videoModel->docente_id = $usuario['id'];
        $this->videoModel->estado = 'activo';

        $videoId = $this->videoModel->crear();

        if ($videoId) {
            $this->logger->video('subido', $videoId, $data['titulo'], $usuario['id']);

            $videoCreado = $this->videoModel->obtenerPorId($videoId);

            $this->enviarRespuesta(201, true, ['video' => $videoCreado], 'Video subido exitosamente');
        } else {
            // Si falla la creación, eliminar el archivo subido
            $this->fileHandler->eliminarVideo($infoVideo['ruta_relativa']);
            if ($thumbnailPath) {
                $this->fileHandler->eliminarThumbnail($thumbnailPath);
            }

            $this->enviarRespuesta(500, false, null, 'Error al crear el registro del video');
        }
    }

    /**
     * Actualiza un video existente
     *
     * PUT /api/videos/{id}
     * Body: { titulo, descripcion, tema_id, materia_id, grado_id, estado }
     *
     * @param int $id ID del video
     * @return void
     */
    public function update(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        $data = json_decode(file_get_contents('php://input'), true);

        // Verificar que el video existe
        $videoExistente = $this->videoModel->obtenerPorId($id);
        if (!$videoExistente) {
            $this->enviarRespuesta(404, false, null, 'Video no encontrado');
            return;
        }

        // Verificar permisos (admin o dueño del video)
        if (!RoleMiddleware::puedeGestionar($usuario['rol'], 'videos', 'actualizar', $videoExistente['docente_id'], $usuario['id'])) {
            $this->enviarRespuesta(403, false, null, 'No tienes permisos para actualizar este video');
            return;
        }

        // Validar datos
        $reglas = [
            'titulo' => 'string|min:3|max:255',
            'tema_id' => 'integer',
            'materia_id' => 'integer',
            'grado_id' => 'integer',
            'estado' => 'in:activo,inactivo,procesando,error'
        ];

        if (!$this->validator->validar($data, $reglas)) {
            $this->validator->enviarErrorValidacion();
            return;
        }

        // Actualizar video
        $this->videoModel->id = $id;
        $this->videoModel->titulo = isset($data['titulo']) ? ValidationMiddleware::sanitizarString($data['titulo']) : $videoExistente['titulo'];
        $this->videoModel->descripcion = isset($data['descripcion']) ? ValidationMiddleware::sanitizarString($data['descripcion']) : $videoExistente['descripcion'];
        $this->videoModel->tema_id = $data['tema_id'] ?? $videoExistente['tema_id'];
        $this->videoModel->materia_id = $data['materia_id'] ?? $videoExistente['materia_id'];
        $this->videoModel->grado_id = $data['grado_id'] ?? $videoExistente['grado_id'];
        $this->videoModel->estado = $data['estado'] ?? $videoExistente['estado'];

        if ($this->videoModel->actualizar()) {
            $this->logger->video('actualizado', $id, $videoExistente['titulo'], $usuario['id']);

            $videoActualizado = $this->videoModel->obtenerPorId($id);

            $this->enviarRespuesta(200, true, ['video' => $videoActualizado], 'Video actualizado exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al actualizar video');
        }
    }

    /**
     * Elimina un video
     *
     * DELETE /api/videos/{id}
     *
     * @param int $id ID del video
     * @return void
     */
    public function destroy(int $id): void
    {
        // Verificar autenticación
        $usuario = AuthMiddleware::proteger();
        if (!$usuario) return;

        // Verificar que el video existe
        $video = $this->videoModel->obtenerPorId($id);
        if (!$video) {
            $this->enviarRespuesta(404, false, null, 'Video no encontrado');
            return;
        }

        // Verificar permisos
        if (!RoleMiddleware::puedeGestionar($usuario['rol'], 'videos', 'eliminar', $video['docente_id'], $usuario['id'])) {
            $this->enviarRespuesta(403, false, null, 'No tienes permisos para eliminar este video');
            return;
        }

        if ($this->videoModel->eliminar($id)) {
            $this->logger->video('eliminado', $id, $video['titulo'], $usuario['id']);
            $this->enviarRespuesta(200, true, null, 'Video eliminado exitosamente');
        } else {
            $this->enviarRespuesta(500, false, null, 'Error al eliminar video');
        }
    }

    /**
     * Streaming de video con soporte para range requests
     *
     * GET /api/videos/{id}/stream
     *
     * @param int $id ID del video
     * @return void
     */
    public function stream(int $id): void
    {
        // Verificar que el video existe
        $video = $this->videoModel->obtenerPorId($id);

        if (!$video || $video['estado'] !== 'activo') {
            http_response_code(404);
            echo 'Video no encontrado';
            exit;
        }

        $rutaCompleta = __DIR__ . '/../' . $video['archivo_path'];

        if (!file_exists($rutaCompleta)) {
            http_response_code(404);
            echo 'Archivo de video no encontrado';
            exit;
        }

        // Registrar reproducción
        $this->registrarReproduccion($id);

        // Configurar headers para streaming
        $filesize = filesize($rutaCompleta);
        $mimeType = mime_content_type($rutaCompleta);

        header('Content-Type: ' . $mimeType);
        header('Accept-Ranges: bytes');
        header('Content-Disposition: inline; filename="' . basename($rutaCompleta) . '"');

        // Soporte para range requests (streaming)
        if (isset($_SERVER['HTTP_RANGE'])) {
            // Parse del range header
            list($param, $range) = explode('=', $_SERVER['HTTP_RANGE']);

            if (strtolower(trim($param)) != 'bytes') {
                header('HTTP/1.1 400 Bad Request');
                exit;
            }

            $range = explode('-', $range);
            $start = intval($range[0]);
            $end = !empty($range[1]) ? intval($range[1]) : $filesize - 1;

            if ($start > $end || $start > $filesize - 1 || $end >= $filesize) {
                header('HTTP/1.1 416 Requested Range Not Satisfiable');
                header("Content-Range: bytes */$filesize");
                exit;
            }

            // Enviar partial content
            header('HTTP/1.1 206 Partial Content');
            header("Content-Range: bytes $start-$end/$filesize");
            header('Content-Length: ' . ($end - $start + 1));

            // Leer y enviar el rango solicitado
            $fp = fopen($rutaCompleta, 'rb');
            fseek($fp, $start);

            $buffer = 1024 * 8; // 8KB buffer
            $bytesLeft = $end - $start + 1;

            while ($bytesLeft > 0 && !feof($fp)) {
                $bytesToRead = min($buffer, $bytesLeft);
                echo fread($fp, $bytesToRead);
                flush();
                $bytesLeft -= $bytesToRead;
            }

            fclose($fp);
        } else {
            // Enviar archivo completo
            header('Content-Length: ' . $filesize);
            readfile($rutaCompleta);
        }

        exit;
    }

    /**
     * Busca videos por texto
     *
     * GET /api/videos/buscar?q=texto
     *
     * @return void
     */
    public function search(): void
    {
        $query = $_GET['q'] ?? '';

        if (strlen($query) < 2) {
            $this->enviarRespuesta(400, false, null, 'La búsqueda debe tener al menos 2 caracteres');
            return;
        }

        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 20;
        $offset = ($page - 1) * $perPage;

        $videos = $this->videoModel->buscar($query, $perPage, $offset);

        $this->enviarRespuesta(200, true, [
            'videos' => $videos,
            'query' => $query
        ]);
    }

    /**
     * Obtiene los videos más populares
     *
     * GET /api/videos/populares?limit=10
     *
     * @return void
     */
    public function populares(): void
    {
        $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 10;

        $videos = $this->videoModel->obtenerMasPopulares($limit);

        $this->enviarRespuesta(200, true, ['videos' => $videos]);
    }

    /**
     * Obtiene los videos más recientes
     *
     * GET /api/videos/recientes?limit=10
     *
     * @return void
     */
    public function recientes(): void
    {
        $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 10;

        $videos = $this->videoModel->obtenerRecientes($limit);

        $this->enviarRespuesta(200, true, ['videos' => $videos]);
    }

    /**
     * Obtiene videos por materia
     *
     * GET /api/videos/materia/{materiaId}
     *
     * @param int $materiaId ID de la materia
     * @return void
     */
    public function byMateria(int $materiaId): void
    {
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 20;
        $offset = ($page - 1) * $perPage;

        $videos = $this->videoModel->obtenerTodos(['materia_id' => $materiaId], $perPage, $offset);
        $total = $this->videoModel->contar(['materia_id' => $materiaId]);

        $this->enviarRespuesta(200, true, [
            'videos' => $videos,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ]);
    }

    /**
     * Obtiene videos por grado
     *
     * GET /api/videos/grado/{gradoId}
     *
     * @param int $gradoId ID del grado
     * @return void
     */
    public function byGrado(int $gradoId): void
    {
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 20;
        $offset = ($page - 1) * $perPage;

        $videos = $this->videoModel->obtenerTodos(['grado_id' => $gradoId], $perPage, $offset);
        $total = $this->videoModel->contar(['grado_id' => $gradoId]);

        $this->enviarRespuesta(200, true, [
            'videos' => $videos,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'total_pages' => ceil($total / $perPage)
            ]
        ]);
    }

    /**
     * Registra una reproducción de video
     *
     * @param int $videoId ID del video
     * @return void
     */
    private function registrarReproduccion(int $videoId): void
    {
        // Autenticación opcional
        $authMiddleware = new AuthMiddleware();
        $authMiddleware->opcional();
        $usuario = $authMiddleware->obtenerUsuario();

        $this->reproduccionModel->video_id = $videoId;
        $this->reproduccionModel->usuario_id = $usuario['id'] ?? null;
        $this->reproduccionModel->ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
        $this->reproduccionModel->user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        $this->reproduccionModel->tiempo_reproducido = 0;
        $this->reproduccionModel->porcentaje_visto = 0;
        $this->reproduccionModel->completado = false;

        $this->reproduccionModel->crear();
    }

    /**
     * Envía una respuesta JSON
     *
     * @param int $code Código HTTP
     * @param bool $success Estado de la respuesta
     * @param mixed $data Datos a enviar
     * @param string|null $message Mensaje opcional
     * @return void
     */
    private function enviarRespuesta(int $code, bool $success, $data = null, ?string $message = null): void
    {
        http_response_code($code);
        header('Content-Type: application/json');

        $response = ['success' => $success];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
