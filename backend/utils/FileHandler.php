<?php
/**
 * Manejador de Archivos
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Clase FileHandler - Gestión de archivos de video
 *
 * Proporciona funcionalidades para subir, validar y gestionar
 * archivos de video en el sistema.
 */
class FileHandler
{
    /** @var array Configuración de la aplicación */
    private array $config;

    /** @var array Errores de subida */
    private array $errors = [];

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->config = require __DIR__ . '/../config/app.php';
    }

    /**
     * Maneja la subida de un archivo de video
     *
     * @param array $file Archivo de $_FILES
     * @param int $materiaId ID de la materia
     * @param int $gradoId ID del grado
     * @return array|false Información del archivo subido o false si falla
     */
    public function subirVideo(array $file, int $materiaId, int $gradoId)
    {
        $this->errors = [];

        // Validar que el archivo fue subido correctamente
        if (!isset($file['error']) || is_array($file['error'])) {
            $this->errors[] = "Error en la subida del archivo";
            return false;
        }

        // Verificar errores de subida
        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $this->errors[] = "El archivo excede el tamaño máximo permitido";
                return false;
            case UPLOAD_ERR_NO_FILE:
                $this->errors[] = "No se subió ningún archivo";
                return false;
            default:
                $this->errors[] = "Error desconocido en la subida";
                return false;
        }

        // Validar tamaño del archivo
        if ($file['size'] > $this->config['video']['max_size']) {
            $maxSizeMB = $this->config['video']['max_size'] / 1048576;
            $this->errors[] = "El archivo excede el tamaño máximo de {$maxSizeMB}MB";
            return false;
        }

        // Validar tipo MIME
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);

        if (!in_array($mimeType, $this->config['video']['allowed_mimes'])) {
            $this->errors[] = "Tipo de archivo no permitido. Formatos permitidos: " . implode(', ', $this->config['video']['allowed_formats']);
            return false;
        }

        // Obtener extensión del archivo
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($extension, $this->config['video']['allowed_formats'])) {
            $this->errors[] = "Extensión de archivo no permitida";
            return false;
        }

        // Generar nombre único para el archivo
        $nombreSanitizado = $this->sanitizarNombreArchivo($file['name']);
        $nombreUnico = $this->generarNombreUnico($nombreSanitizado);

        // Crear directorio de destino si no existe
        $directorioDestino = $this->crearDirectorioVideo($materiaId, $gradoId);

        if (!$directorioDestino) {
            $this->errors[] = "No se pudo crear el directorio de destino";
            return false;
        }

        // Ruta completa del archivo
        $rutaCompleta = $directorioDestino . '/' . $nombreUnico;

        // Mover archivo al directorio de destino
        if (!move_uploaded_file($file['tmp_name'], $rutaCompleta)) {
            $this->errors[] = "Error al mover el archivo al directorio de destino";
            return false;
        }

        // Cambiar permisos del archivo
        chmod($rutaCompleta, 0644);

        // Obtener información del archivo
        // Construir ruta relativa desde uploads/
        $backendDir = realpath(__DIR__ . '/..');
        $rutaRelativa = str_replace($backendDir . '/', '', $rutaCompleta);

        // Asegurar que la ruta comience con "uploads/"
        if (strpos($rutaRelativa, 'uploads/') !== 0) {
            // Si no empieza con uploads/, extraer solo la parte desde uploads/
            $uploadsPos = strpos($rutaRelativa, 'uploads/');
            if ($uploadsPos !== false) {
                $rutaRelativa = substr($rutaRelativa, $uploadsPos);
            }
        }

        $infoArchivo = [
            'nombre_original' => $file['name'],
            'nombre_archivo' => $nombreUnico,
            'ruta_completa' => $rutaCompleta,
            'ruta_relativa' => $rutaRelativa,
            'tamanio' => $file['size'],
            'tipo_mime' => $mimeType,
            'extension' => $extension
        ];

        return $infoArchivo;
    }

    /**
     * Sube un thumbnail (imagen miniatura)
     *
     * @param array $file Archivo de $_FILES
     * @param string $videoNombre Nombre del video asociado
     * @return array|false Información del thumbnail o false si falla
     */
    public function subirThumbnail(array $file, string $videoNombre)
    {
        $this->errors = [];

        // Validar archivo
        if (!isset($file['error']) || is_array($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
            $this->errors[] = "Error en la subida del thumbnail";
            return false;
        }

        // Validar que sea una imagen
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        $mimeTypesPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!in_array($mimeType, $mimeTypesPermitidos)) {
            $this->errors[] = "El thumbnail debe ser una imagen JPG o PNG";
            return false;
        }

        // Generar nombre único basado en el nombre del video
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $nombreBase = pathinfo($videoNombre, PATHINFO_FILENAME);
        $nombreThumbnail = $nombreBase . '_thumb.' . $extension;

        // Directorio de thumbnails
        $directorioThumbnails = $this->config['video']['thumbnail_path'];

        if (!is_dir($directorioThumbnails)) {
            mkdir($directorioThumbnails, 0755, true);
        }

        $rutaCompleta = $directorioThumbnails . $nombreThumbnail;

        // Mover archivo
        if (!move_uploaded_file($file['tmp_name'], $rutaCompleta)) {
            $this->errors[] = "Error al guardar el thumbnail";
            return false;
        }

        chmod($rutaCompleta, 0644);

        // Construir ruta relativa desde uploads/
        $backendDir = realpath(__DIR__ . '/..');
        $rutaRelativa = str_replace($backendDir . '/', '', $rutaCompleta);

        // Asegurar que la ruta comience con "uploads/"
        if (strpos($rutaRelativa, 'uploads/') !== 0) {
            $uploadsPos = strpos($rutaRelativa, 'uploads/');
            if ($uploadsPos !== false) {
                $rutaRelativa = substr($rutaRelativa, $uploadsPos);
            }
        }

        return [
            'nombre_archivo' => $nombreThumbnail,
            'ruta_completa' => $rutaCompleta,
            'ruta_relativa' => $rutaRelativa
        ];
    }

    /**
     * Elimina un archivo de video
     *
     * @param string $rutaArchivo Ruta del archivo a eliminar
     * @return bool
     */
    public function eliminarVideo(string $rutaArchivo): bool
    {
        $rutaCompleta = __DIR__ . '/../' . $rutaArchivo;

        if (file_exists($rutaCompleta)) {
            return unlink($rutaCompleta);
        }

        return false;
    }

    /**
     * Elimina un thumbnail
     *
     * @param string $rutaArchivo Ruta del thumbnail a eliminar
     * @return bool
     */
    public function eliminarThumbnail(string $rutaArchivo): bool
    {
        return $this->eliminarVideo($rutaArchivo);
    }

    /**
     * Obtiene información de un archivo de video
     *
     * @param string $rutaArchivo Ruta del archivo
     * @return array|false Información del archivo o false si no existe
     */
    public function obtenerInfoVideo(string $rutaArchivo)
    {
        $rutaCompleta = __DIR__ . '/../' . $rutaArchivo;

        if (!file_exists($rutaCompleta)) {
            return false;
        }

        $info = [
            'tamanio' => filesize($rutaCompleta),
            'tipo_mime' => mime_content_type($rutaCompleta),
            'extension' => pathinfo($rutaCompleta, PATHINFO_EXTENSION),
            'nombre' => basename($rutaCompleta),
            'modificado' => filemtime($rutaCompleta)
        ];

        return $info;
    }

    /**
     * Sanitiza el nombre de un archivo
     *
     * @param string $nombre Nombre del archivo
     * @return string Nombre sanitizado
     */
    private function sanitizarNombreArchivo(string $nombre): string
    {
        // Remover extensión
        $extension = pathinfo($nombre, PATHINFO_EXTENSION);
        $nombreSinExt = pathinfo($nombre, PATHINFO_FILENAME);

        // Reemplazar caracteres especiales
        $nombreSanitizado = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nombreSinExt);

        // Eliminar guiones bajos múltiples
        $nombreSanitizado = preg_replace('/_+/', '_', $nombreSanitizado);

        // Limitar longitud
        $nombreSanitizado = substr($nombreSanitizado, 0, 100);

        return $nombreSanitizado . '.' . $extension;
    }

    /**
     * Genera un nombre único para un archivo
     *
     * @param string $nombreOriginal Nombre original del archivo
     * @return string Nombre único
     */
    private function generarNombreUnico(string $nombreOriginal): string
    {
        $extension = pathinfo($nombreOriginal, PATHINFO_EXTENSION);
        $nombreBase = pathinfo($nombreOriginal, PATHINFO_FILENAME);

        // Generar timestamp y hash único
        $timestamp = time();
        $random = bin2hex(random_bytes(8));

        return "{$nombreBase}_{$timestamp}_{$random}.{$extension}";
    }

    /**
     * Crea el directorio para almacenar un video
     *
     * @param int $materiaId ID de la materia
     * @param int $gradoId ID del grado
     * @return string|false Ruta del directorio o false si falla
     */
    private function crearDirectorioVideo(int $materiaId, int $gradoId)
    {
        $directorioBase = $this->config['video']['storage_path'];
        $directorio = $directorioBase . "materia_{$materiaId}/grado_{$gradoId}";

        if (!is_dir($directorio)) {
            if (!mkdir($directorio, 0755, true)) {
                return false;
            }
        }

        return $directorio;
    }

    /**
     * Obtiene los errores de la última operación
     *
     * @return array Errores
     */
    public function obtenerErrores(): array
    {
        return $this->errors;
    }

    /**
     * Convierte bytes a formato legible
     *
     * @param int $bytes Tamaño en bytes
     * @param int $precision Precisión decimal
     * @return string Tamaño formateado
     */
    public function formatearTamanio(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    /**
     * Valida si un archivo existe
     *
     * @param string $rutaRelativa Ruta relativa del archivo
     * @return bool
     */
    public function archivoExiste(string $rutaRelativa): bool
    {
        $rutaCompleta = __DIR__ . '/../' . $rutaRelativa;
        return file_exists($rutaCompleta);
    }

    /**
     * Obtiene la URL pública de un archivo
     *
     * @param string $rutaRelativa Ruta relativa del archivo
     * @return string URL pública
     */
    public function obtenerUrlPublica(string $rutaRelativa): string
    {
        $baseUrl = $this->config['url'] ?? 'http://localhost';
        return $baseUrl . '/backend/' . $rutaRelativa;
    }

    /**
     * Calcula el espacio total usado por los videos
     *
     * @return array Información del espacio usado
     */
    public function obtenerEspacioUsado(): array
    {
        $directorioVideos = $this->config['video']['storage_path'];
        $directorioThumbnails = $this->config['video']['thumbnail_path'];

        $espacioVideos = $this->obtenerTamanioDirectorio($directorioVideos);
        $espacioThumbnails = $this->obtenerTamanioDirectorio($directorioThumbnails);
        $espacioTotal = $espacioVideos + $espacioThumbnails;

        return [
            'videos_bytes' => $espacioVideos,
            'videos_formatted' => $this->formatearTamanio($espacioVideos),
            'thumbnails_bytes' => $espacioThumbnails,
            'thumbnails_formatted' => $this->formatearTamanio($espacioThumbnails),
            'total_bytes' => $espacioTotal,
            'total_formatted' => $this->formatearTamanio($espacioTotal)
        ];
    }

    /**
     * Obtiene el tamaño total de un directorio
     *
     * @param string $directorio Ruta del directorio
     * @return int Tamaño en bytes
     */
    private function obtenerTamanioDirectorio(string $directorio): int
    {
        $tamanio = 0;

        if (!is_dir($directorio)) {
            return 0;
        }

        $archivos = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directorio, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($archivos as $archivo) {
            if ($archivo->isFile()) {
                $tamanio += $archivo->getSize();
            }
        }

        return $tamanio;
    }
}
