<?php
/**
 * Procesador de Videos
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

/**
 * Clase VideoProcessor - Procesamiento de videos
 *
 * Proporciona funcionalidades para extraer metadatos,
 * generar thumbnails y procesar videos.
 *
 * NOTA: Esta clase requiere FFmpeg instalado en el servidor
 * para funcionalidades avanzadas. Si no está disponible,
 * proporciona fallbacks básicos.
 */
class VideoProcessor
{
    /** @var array Configuración */
    private array $config;

    /** @var bool FFmpeg disponible */
    private bool $ffmpegDisponible = false;

    /** @var string Ruta de FFmpeg */
    private string $ffmpegPath = 'ffmpeg';

    /** @var string Ruta de FFprobe */
    private string $ffprobePath = 'ffprobe';

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->config = require __DIR__ . '/../config/app.php';
        $this->verificarFFmpeg();
    }

    /**
     * Verifica si FFmpeg está disponible
     *
     * @return void
     */
    private function verificarFFmpeg(): void
    {
        // Intentar detectar FFmpeg
        $output = [];
        $returnVar = 0;

        @exec('ffmpeg -version 2>&1', $output, $returnVar);

        $this->ffmpegDisponible = ($returnVar === 0);

        if (!$this->ffmpegDisponible) {
            error_log("[VideoProcessor] FFmpeg no está disponible. Funcionalidades limitadas.");
        }
    }

    /**
     * Extrae metadatos de un video
     *
     * @param string $rutaVideo Ruta del archivo de video
     * @return array|false Metadatos del video o false si falla
     */
    public function extraerMetadatos(string $rutaVideo)
    {
        if (!file_exists($rutaVideo)) {
            error_log("[VideoProcessor] Archivo no encontrado: {$rutaVideo}");
            return false;
        }

        $metadatos = [
            'duracion' => null,
            'resolucion' => null,
            'codec' => null,
            'bitrate' => null,
            'fps' => null
        ];

        if ($this->ffmpegDisponible) {
            $metadatos = $this->extraerMetadatosConFFprobe($rutaVideo);
        } else {
            // Fallback básico sin FFmpeg
            $metadatos = $this->extraerMetadatosBasicos($rutaVideo);
        }

        return $metadatos;
    }

    /**
     * Extrae metadatos usando FFprobe
     *
     * @param string $rutaVideo Ruta del video
     * @return array Metadatos
     */
    private function extraerMetadatosConFFprobe(string $rutaVideo): array
    {
        $comando = sprintf(
            '%s -v quiet -print_format json -show_format -show_streams %s 2>&1',
            escapeshellcmd($this->ffprobePath),
            escapeshellarg($rutaVideo)
        );

        $output = [];
        exec($comando, $output, $returnVar);

        if ($returnVar !== 0) {
            error_log("[VideoProcessor] Error al ejecutar FFprobe");
            return $this->extraerMetadatosBasicos($rutaVideo);
        }

        $json = implode('', $output);
        $data = json_decode($json, true);

        if (!$data) {
            return $this->extraerMetadatosBasicos($rutaVideo);
        }

        // Buscar stream de video
        $videoStream = null;
        foreach ($data['streams'] ?? [] as $stream) {
            if ($stream['codec_type'] === 'video') {
                $videoStream = $stream;
                break;
            }
        }

        $metadatos = [
            'duracion' => isset($data['format']['duration']) ? (int)round($data['format']['duration']) : null,
            'resolucion' => $videoStream ? "{$videoStream['width']}x{$videoStream['height']}" : null,
            'codec' => $videoStream['codec_name'] ?? null,
            'bitrate' => isset($data['format']['bit_rate']) ? (int)$data['format']['bit_rate'] : null,
            'fps' => $videoStream ? $this->calcularFPS($videoStream['r_frame_rate'] ?? '0/0') : null,
            'ancho' => $videoStream['width'] ?? null,
            'alto' => $videoStream['height'] ?? null
        ];

        return $metadatos;
    }

    /**
     * Extrae metadatos básicos sin FFmpeg
     *
     * @param string $rutaVideo Ruta del video
     * @return array Metadatos básicos
     */
    private function extraerMetadatosBasicos(string $rutaVideo): array
    {
        $info = [];

        // Intentar obtener información básica con getimagesize (funciona para algunos formatos de video)
        try {
            $videoInfo = @getimagesize($rutaVideo);
            if ($videoInfo) {
                $info['ancho'] = $videoInfo[0];
                $info['alto'] = $videoInfo[1];
                $info['resolucion'] = "{$videoInfo[0]}x{$videoInfo[1]}";
            }
        } catch (Exception $e) {
            // Ignorar errores
        }

        return array_merge([
            'duracion' => null,
            'resolucion' => null,
            'codec' => null,
            'bitrate' => null,
            'fps' => null
        ], $info);
    }

    /**
     * Calcula FPS desde fracción
     *
     * @param string $rFrameRate Fracción de FPS (ej: "30000/1001")
     * @return float|null
     */
    private function calcularFPS(string $rFrameRate): ?float
    {
        if (strpos($rFrameRate, '/') !== false) {
            list($num, $den) = explode('/', $rFrameRate);
            if ($den > 0) {
                return round($num / $den, 2);
            }
        }

        return null;
    }

    /**
     * Genera un thumbnail de un video
     *
     * @param string $rutaVideo Ruta del video
     * @param string $rutaThumbnail Ruta donde guardar el thumbnail
     * @param int $segundos Segundo del video para capturar
     * @return bool True si se generó exitosamente
     */
    public function generarThumbnail(string $rutaVideo, string $rutaThumbnail, int $segundos = 5): bool
    {
        if (!$this->ffmpegDisponible) {
            error_log("[VideoProcessor] FFmpeg no disponible para generar thumbnail");
            return false;
        }

        if (!file_exists($rutaVideo)) {
            error_log("[VideoProcessor] Video no encontrado: {$rutaVideo}");
            return false;
        }

        // Crear directorio si no existe
        $directorio = dirname($rutaThumbnail);
        if (!is_dir($directorio)) {
            mkdir($directorio, 0755, true);
        }

        $comando = sprintf(
            '%s -i %s -ss %d -vframes 1 -vf "scale=640:-1" %s 2>&1',
            escapeshellcmd($this->ffmpegPath),
            escapeshellarg($rutaVideo),
            $segundos,
            escapeshellarg($rutaThumbnail)
        );

        $output = [];
        $returnVar = 0;

        exec($comando, $output, $returnVar);

        if ($returnVar !== 0 || !file_exists($rutaThumbnail)) {
            error_log("[VideoProcessor] Error al generar thumbnail: " . implode("\n", $output));
            return false;
        }

        return true;
    }

    /**
     * Convierte un video a formato optimizado para streaming
     *
     * @param string $rutaOrigen Ruta del video original
     * @param string $rutaDestino Ruta del video convertido
     * @param string $calidad Calidad del video (360p, 480p, 720p, 1080p)
     * @return bool True si se convirtió exitosamente
     */
    public function convertirParaStreaming(string $rutaOrigen, string $rutaDestino, string $calidad = '720p'): bool
    {
        if (!$this->ffmpegDisponible) {
            error_log("[VideoProcessor] FFmpeg no disponible para conversión");
            return false;
        }

        // Mapeo de calidades a resoluciones
        $resoluciones = [
            '360p' => '640:360',
            '480p' => '854:480',
            '720p' => '1280:720',
            '1080p' => '1920:1080'
        ];

        if (!isset($resoluciones[$calidad])) {
            $calidad = '720p';
        }

        $resolucion = $resoluciones[$calidad];

        // Crear directorio si no existe
        $directorio = dirname($rutaDestino);
        if (!is_dir($directorio)) {
            mkdir($directorio, 0755, true);
        }

        // Comando FFmpeg para conversión optimizada
        $comando = sprintf(
            '%s -i %s -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -vf "scale=%s" -movflags +faststart %s 2>&1',
            escapeshellcmd($this->ffmpegPath),
            escapeshellarg($rutaOrigen),
            $resolucion,
            escapeshellarg($rutaDestino)
        );

        $output = [];
        $returnVar = 0;

        // Ejecutar comando (esto puede tardar)
        exec($comando, $output, $returnVar);

        if ($returnVar !== 0 || !file_exists($rutaDestino)) {
            error_log("[VideoProcessor] Error en conversión: " . implode("\n", $output));
            return false;
        }

        return true;
    }

    /**
     * Detecta la resolución del video y retorna una etiqueta
     *
     * @param string $rutaVideo Ruta del video
     * @return string Etiqueta de resolución (360p, 480p, 720p, 1080p, etc.)
     */
    public function detectarResolucion(string $rutaVideo): string
    {
        $metadatos = $this->extraerMetadatos($rutaVideo);

        if (!$metadatos || !isset($metadatos['alto'])) {
            return 'SD';
        }

        $alto = $metadatos['alto'];

        if ($alto >= 2160) return '4K';
        if ($alto >= 1080) return '1080p';
        if ($alto >= 720) return '720p';
        if ($alto >= 480) return '480p';
        if ($alto >= 360) return '360p';

        return 'SD';
    }

    /**
     * Valida que un archivo sea un video válido
     *
     * @param string $rutaVideo Ruta del video
     * @return bool True si es un video válido
     */
    public function esVideoValido(string $rutaVideo): bool
    {
        if (!file_exists($rutaVideo)) {
            return false;
        }

        $mimeType = mime_content_type($rutaVideo);
        $mimeTypesPermitidos = $this->config['video']['allowed_mimes'];

        if (!in_array($mimeType, $mimeTypesPermitidos)) {
            return false;
        }

        // Si FFmpeg está disponible, verificar que el video sea decodificable
        if ($this->ffmpegDisponible) {
            $metadatos = $this->extraerMetadatos($rutaVideo);
            return $metadatos !== false && isset($metadatos['duracion']);
        }

        return true;
    }

    /**
     * Obtiene la duración de un video en formato legible
     *
     * @param int $segundos Duración en segundos
     * @return string Duración formateada (HH:MM:SS)
     */
    public function formatearDuracion(int $segundos): string
    {
        $horas = floor($segundos / 3600);
        $minutos = floor(($segundos % 3600) / 60);
        $segs = $segundos % 60;

        if ($horas > 0) {
            return sprintf('%02d:%02d:%02d', $horas, $minutos, $segs);
        } else {
            return sprintf('%02d:%02d', $minutos, $segs);
        }
    }

    /**
     * Verifica si FFmpeg está disponible
     *
     * @return bool
     */
    public function estaFFmpegDisponible(): bool
    {
        return $this->ffmpegDisponible;
    }

    /**
     * Obtiene información resumida del procesador
     *
     * @return array Información del sistema
     */
    public function obtenerInfo(): array
    {
        return [
            'ffmpeg_disponible' => $this->ffmpegDisponible,
            'ffmpeg_path' => $this->ffmpegPath,
            'funcionalidades' => [
                'extraer_metadatos' => $this->ffmpegDisponible,
                'generar_thumbnails' => $this->ffmpegDisponible,
                'convertir_videos' => $this->ffmpegDisponible
            ]
        ];
    }
}
