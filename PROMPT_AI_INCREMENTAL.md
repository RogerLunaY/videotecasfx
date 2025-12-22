# 🤖 PROMPT PARA AI: Crear Sistema de Videoteca Educativa SFX

## 📌 INFORMACIÓN IMPORTANTE
Este prompt está diseñado para ser usado con asistentes AI (ChatGPT, Claude, etc.) que puedan generar código y crear archivos. El sistema se generará en **sesiones incrementales** siguiendo el orden especificado.

---

## 🎯 OBJETIVO DEL PROYECTO

Crear una plataforma web educativa completa para gestión y visualización de videos educativos con:
- **Backend:** API REST en PHP con autenticación JWT
- **Frontend:** SPA en React con Tailwind CSS
- **Base de Datos:** MySQL con sistema de roles y asignaciones múltiples
- **Funcionalidad:** 3 tipos de usuarios (Admin, Docente, Estudiante) con permisos diferenciados

**Contexto Educativo:** Sistema para U.E. San Francisco Xavier (Bolivia)
**Currículo:** Campos de Saberes → Materias → Grados → Temas (modelo curricular boliviano)

---

## 📋 ÍNDICE DE SESIONES

1. [Sesión 1: Setup y Base de Datos](#sesión-1-setup-y-base-de-datos)
2. [Sesión 2: Backend Core y Autenticación](#sesión-2-backend-core-y-autenticación)
3. [Sesión 3: Modelos y Controladores del Backend](#sesión-3-modelos-y-controladores)
4. [Sesión 4: Frontend Setup y Context](#sesión-4-frontend-setup-y-context)
5. [Sesión 5: Componentes de UI y Páginas](#sesión-5-componentes-de-ui-y-páginas)
6. [Sesión 6: Sistema de Asignaciones y Uploads](#sesión-6-asignaciones-y-uploads)
7. [Sesión 7: Dashboard y Estadísticas](#sesión-7-dashboard-y-estadísticas)
8. [Sesión 8: Testing y Refinamiento](#sesión-8-testing-y-refinamiento)

---

# 🟢 SESIÓN 1: SETUP Y BASE DE DATOS

## Objetivo
Crear la estructura de directorios, configuración inicial y base de datos completa.

## Instrucciones para el AI

### PASO 1.1: Estructura de Directorios

Crea la siguiente estructura de carpetas:

```
videotecasfx/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   │   ├── videos/
│   │   └── thumbnails/
│   └── api/
├── frontend-web/
│   └── src/
│       ├── components/
│       │   ├── Layout/
│       │   ├── Common/
│       │   ├── Users/
│       │   ├── Videos/
│       │   └── Auth/
│       ├── pages/
│       ├── context/
│       ├── services/
│       ├── hooks/
│       └── utils/
└── database/
    └── migrations/
```

### PASO 1.2: Base de Datos MySQL

Crea un archivo `database/schema.sql` con el siguiente esquema COMPLETO:

**IMPORTANTE:** Las tablas deben crearse en este orden exacto para respetar las foreign keys.

#### Tabla 1: roles
```sql
CREATE TABLE IF NOT EXISTS roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    permisos JSON NOT NULL COMMENT 'Permisos en formato JSON',
    descripcion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nombre (nombre),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Tabla 2: usuarios (SIN materia_id ni grado_id - CRÍTICO)
```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    ci VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id INT UNSIGNED NOT NULL,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    ultimo_acceso TIMESTAMP NULL,
    intentos_login INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    INDEX idx_email (email),
    INDEX idx_ci (ci),
    INDEX idx_rol (rol_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Tabla 3: campos_saberes
```sql
CREATE TABLE IF NOT EXISTS campos_saberes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    color VARCHAR(20),
    orden INT DEFAULT 0,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_orden (orden),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Tabla 4: materias
```sql
CREATE TABLE IF NOT EXISTS materias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    sigla VARCHAR(20),
    descripcion TEXT,
    campo_saber_id INT UNSIGNED,
    icono VARCHAR(50),
    color VARCHAR(20),
    orden INT DEFAULT 0,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campo_saber_id) REFERENCES campos_saberes(id),
    INDEX idx_campo (campo_saber_id),
    INDEX idx_orden (orden),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Tabla 5: grados
```sql
CREATE TABLE IF NOT EXISTS grados (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nivel INT NOT NULL COMMENT '1-6 para secundaria',
    sigla VARCHAR(20),
    descripcion TEXT,
    orden INT DEFAULT 0,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nivel (nivel),
    INDEX idx_orden (orden),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Tabla 6: asignaciones (CRÍTICA - Sistema de asignaciones múltiples)
```sql
CREATE TABLE IF NOT EXISTS asignaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    docente_id INT UNSIGNED NOT NULL,
    materia_id INT UNSIGNED NOT NULL,
    grado_id INT UNSIGNED NOT NULL,
    estado ENUM('activa', 'inactiva') DEFAULT 'activa',
    usuario_asignador_id INT UNSIGNED,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_asignador_id) REFERENCES usuarios(id),
    UNIQUE KEY unique_asignacion (docente_id, materia_id, grado_id),
    INDEX idx_docente (docente_id),
    INDEX idx_materia (materia_id),
    INDEX idx_grado (grado_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignaciones de docentes a combinaciones materia-grado';
```

#### Tabla 7: temas
```sql
CREATE TABLE IF NOT EXISTS temas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    nombre_corto VARCHAR(100),
    descripcion TEXT,
    materia_id INT UNSIGNED NOT NULL,
    grado_id INT UNSIGNED NOT NULL,
    orden INT DEFAULT 0,
    duracion_estimada INT COMMENT 'Minutos estimados',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE CASCADE,
    INDEX idx_materia (materia_id),
    INDEX idx_grado (grado_id),
    INDEX idx_orden (orden),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Tabla 8: videos
```sql
CREATE TABLE IF NOT EXISTS videos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    archivo_path VARCHAR(500) NOT NULL,
    archivo_nombre VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(500),
    duracion INT COMMENT 'Duración en segundos',
    tamanio BIGINT COMMENT 'Tamaño en bytes',
    formato VARCHAR(20),
    resolucion VARCHAR(20),
    codec VARCHAR(50),
    tema_id INT UNSIGNED,
    materia_id INT UNSIGNED NOT NULL,
    grado_id INT UNSIGNED NOT NULL,
    docente_id INT UNSIGNED NOT NULL,
    visualizaciones INT DEFAULT 0,
    estado ENUM('procesando', 'activo', 'inactivo', 'eliminado') DEFAULT 'procesando',
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tema_id) REFERENCES temas(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id),
    FOREIGN KEY (grado_id) REFERENCES grados(id),
    FOREIGN KEY (docente_id) REFERENCES usuarios(id),
    INDEX idx_materia (materia_id),
    INDEX idx_grado (grado_id),
    INDEX idx_tema (tema_id),
    INDEX idx_docente (docente_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_subida),
    FULLTEXT INDEX idx_busqueda (titulo, descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Tabla 9: tokens_refresh
```sql
CREATE TABLE IF NOT EXISTS tokens_refresh (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(45),
    user_agent VARCHAR(255),
    expira_en TIMESTAMP NOT NULL,
    revocado TINYINT(1) DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash),
    INDEX idx_usuario (usuario_id),
    INDEX idx_expira (expira_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Tabla 10: estadisticas
```sql
CREATE TABLE IF NOT EXISTS estadisticas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    categoria VARCHAR(50),
    datos_json JSON NOT NULL,
    fecha_referencia DATE,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_fecha (fecha_referencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Tabla 11: logs
```sql
CREATE TABLE IF NOT EXISTS logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    usuario_id INT UNSIGNED,
    ip VARCHAR(45),
    user_agent VARCHAR(255),
    datos_adicionales JSON,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_tipo (tipo),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### PASO 1.3: Datos Semilla

Crea archivo `database/seed_data.sql` con:

```sql
-- ROLES (3 roles básicos)
INSERT INTO roles (nombre, permisos, descripcion) VALUES
('Administrador', JSON_OBJECT(
    'usuarios', JSON_ARRAY('crear', 'leer', 'actualizar', 'eliminar'),
    'videos', JSON_ARRAY('crear', 'leer', 'actualizar', 'eliminar'),
    'estadisticas', JSON_ARRAY('leer', 'exportar'),
    'configuracion', JSON_ARRAY('leer', 'actualizar')
), 'Control total del sistema'),
('Docente', JSON_OBJECT(
    'videos', JSON_ARRAY('crear', 'leer', 'actualizar_propios', 'eliminar_propios'),
    'estadisticas', JSON_ARRAY('leer_propias'),
    'perfil', JSON_ARRAY('leer', 'actualizar')
), 'Gestión de contenido educativo propio'),
('Estudiante', JSON_OBJECT(
    'videos', JSON_ARRAY('leer'),
    'perfil', JSON_ARRAY('leer', 'actualizar')
), 'Visualización de contenido educativo');

-- USUARIO ADMINISTRADOR INICIAL
-- Email: admin@sfx.edu.bo
-- Password: Admin123!
INSERT INTO usuarios (nombre, apellido_paterno, ci, email, password_hash, rol_id) VALUES
('Administrador', 'Sistema', '0000000', 'admin@sfx.edu.bo',
'$2y$12$KIXww7hqKz5QX.jz0K0jZ.M8vqJHQx6YxJ8aB5L3pN4sP7qR9tU2W', 1);

-- CAMPOS DE SABERES (Currículo Boliviano)
INSERT INTO campos_saberes (nombre, descripcion, icono, color, orden) VALUES
('Cosmos y Pensamiento', 'Filosofía, Cosmovisiones, Religión', 'brain', '#8B5CF6', 1),
('Comunidad y Sociedad', 'Comunicación, Lenguas, Ciencias Sociales', 'users', '#3B82F6', 2),
('Vida Tierra Territorio', 'Ciencias Naturales, Geografía', 'leaf', '#10B981', 3),
('Ciencia Tecnología y Producción', 'Matemática, Técnica Tecnológica', 'cpu', '#F59E0B', 4);

-- MATERIAS (Ejemplos principales)
INSERT INTO materias (nombre, sigla, campo_saber_id, color, orden) VALUES
('Matemática', 'MAT', 4, '#F59E0B', 1),
('Física', 'FIS', 4, '#EF4444', 2),
('Química', 'QUI', 4, '#8B5CF6', 3),
('Biología', 'BIO', 3, '#10B981', 4),
('Lenguaje y Literatura', 'LEN', 2, '#3B82F6', 5),
('Inglés', 'ING', 2, '#EC4899', 6),
('Historia', 'HIS', 2, '#F97316', 7),
('Geografía', 'GEO', 3, '#14B8A6', 8),
('Filosofía y Psicología', 'FIL', 1, '#6366F1', 9),
('Técnica Tecnológica', 'TEC', 4, '#84CC16', 10);

-- GRADOS (Secundaria Boliviana: 6 años)
INSERT INTO grados (nombre, nivel, sigla, orden) VALUES
('Primero de Secundaria', 1, '1° SEC', 1),
('Segundo de Secundaria', 2, '2° SEC', 2),
('Tercero de Secundaria', 3, '3° SEC', 3),
('Cuarto de Secundaria', 4, '4° SEC', 4),
('Quinto de Secundaria', 5, '5° SEC', 5),
('Sexto de Secundaria', 6, '6° SEC', 6);
```

### PASO 1.4: Stored Procedure para Estadísticas

Crea archivo `database/migrations/sp_estadisticas.sql`:

```sql
DELIMITER //
CREATE PROCEDURE sp_estadisticas_generales()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM videos WHERE estado = 'activo') as total_videos,
        (SELECT COUNT(*) FROM usuarios WHERE rol_id = 2 AND estado = 'activo') as total_docentes,
        (SELECT COUNT(*) FROM usuarios WHERE rol_id = 3 AND estado = 'activo') as total_estudiantes,
        (SELECT COUNT(*) FROM materias WHERE estado = 'activo') as total_materias,
        (SELECT COUNT(*) FROM grados WHERE estado = 'activo') as total_grados,
        (SELECT COUNT(*) FROM temas WHERE estado = 'activo') as total_temas,
        (SELECT COALESCE(SUM(visualizaciones), 0) FROM videos WHERE estado = 'activo') as total_visualizaciones,
        (SELECT COALESCE(SUM(tamanio), 0) FROM videos WHERE estado = 'activo') as espacio_usado;
END //
DELIMITER ;
```

### ✅ Verificación Sesión 1
- [ ] Estructura de directorios creada
- [ ] schema.sql con 11 tablas en orden correcto
- [ ] seed_data.sql con datos iniciales
- [ ] Stored procedure para estadísticas
- [ ] Verificar que usuarios NO tiene materia_id ni grado_id
- [ ] Verificar que asignaciones tiene UNIQUE constraint

---

# 🟡 SESIÓN 2: BACKEND CORE Y AUTENTICACIÓN

## Objetivo
Crear la infraestructura base del backend: Database, JWT, BaseController, y sistema de autenticación completo.

## PASO 2.1: Configuración de Base de Datos (Singleton)

Crea `backend/config/database.php`:

```php
<?php
/**
 * Database Singleton
 * Conexión única a MySQL con PDO
 */
class Database {
    private static $instance = null;
    private $conn;

    private $host = 'localhost';
    private $db_name = 'videotecasfx';
    private $username = 'root';
    private $password = 'root';

    private function __construct() {
        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch(PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            http_response_code(500);
            die(json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']));
        }
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->conn;
    }
}
```

## PASO 2.2: JWT Handler (Sistema completo de tokens)

Crea `backend/utils/JWTHandler.php`:

```php
<?php
/**
 * JWT Handler
 * Generación y validación de tokens JWT
 */
class JWTHandler {
    private string $secretKey = 'CAMBIAR_EN_PRODUCCION_CLAVE_SUPER_SECRETA_123456789';
    private string $algorithm = 'HS256';

    /**
     * Genera Access Token (1 hora de validez)
     */
    public function generarAccessToken(
        int $userId,
        string $email,
        string $role,
        string $nombre
    ): string {
        $payload = [
            'user_id' => $userId,
            'email' => $email,
            'rol' => $role,
            'nombre' => $nombre,
            'tipo' => 'access',
            'iat' => time(),
            'exp' => time() + 3600 // 1 hora
        ];

        return $this->encode($payload);
    }

    /**
     * Genera Refresh Token (30 días de validez)
     */
    public function generarRefreshToken(int $userId, string $email): string {
        $payload = [
            'user_id' => $userId,
            'email' => $email,
            'tipo' => 'refresh',
            'iat' => time(),
            'exp' => time() + (30 * 24 * 3600) // 30 días
        ];

        return $this->encode($payload);
    }

    /**
     * Codifica el payload en JWT
     */
    private function encode(array $payload): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => $this->algorithm]);
        $payload = json_encode($payload);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);

        $signature = hash_hmac(
            'sha256',
            $base64UrlHeader . "." . $base64UrlPayload,
            $this->secretKey,
            true
        );
        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Valida un token JWT
     */
    public function validarToken(string $token): ?array {
        $tokenParts = explode('.', $token);

        if (count($tokenParts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $tokenParts;

        // Verificar firma
        $signatureProvided = $this->base64UrlDecode($signature);
        $signatureVerify = hash_hmac(
            'sha256',
            $header . "." . $payload,
            $this->secretKey,
            true
        );

        if (!hash_equals($signatureVerify, $signatureProvided)) {
            return null;
        }

        // Decodificar payload
        $payloadDecoded = json_decode($this->base64UrlDecode($payload), true);

        // Verificar expiración
        if (isset($payloadDecoded['exp']) && $payloadDecoded['exp'] < time()) {
            return null;
        }

        return $payloadDecoded;
    }

    /**
     * Decodifica un token sin validar (para debug)
     */
    public function decodificarToken(string $token): ?array {
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return null;
        }

        return json_decode($this->base64UrlDecode($tokenParts[1]), true);
    }

    /**
     * Hash para almacenar tokens en BD
     */
    public function hashToken(string $token): string {
        return hash('sha256', $token);
    }

    private function base64UrlEncode($data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode($data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
```

## PASO 2.3: Base Controller

Crea `backend/utils/BaseController.php`:

```php
<?php
/**
 * Base Controller
 * Clase base para todos los controladores
 */
abstract class BaseController {
    /**
     * Envía respuesta JSON estandarizada
     */
    protected function enviarRespuesta(
        int $statusCode,
        bool $success,
        $data = null,
        string $message = ''
    ): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success' => $success,
            'data' => $data,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        if (!$success && $data !== null) {
            $response['error'] = $data;
            unset($response['data']);
        }

        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Obtiene datos del body (JSON)
     */
    protected function obtenerDatosBody(): ?array {
        $data = json_decode(file_get_contents('php://input'), true);
        return $data;
    }

    /**
     * Valida que existan campos requeridos
     */
    protected function validarCamposRequeridos(array $data, array $camposRequeridos): bool {
        foreach ($camposRequeridos as $campo) {
            if (!isset($data[$campo]) || trim($data[$campo]) === '') {
                $this->enviarRespuesta(400, false, null, "El campo '{$campo}' es requerido");
                return false;
            }
        }
        return true;
    }
}
```

## PASO 2.4: Modelo de Usuario (CON SISTEMA DE ASIGNACIONES)

Crea `backend/models/Usuario.php`:

**IMPORTANTE:** Este modelo es CRÍTICO - debe cargar las asignaciones desde la tabla `asignaciones`.

```php
<?php
require_once __DIR__ . '/../config/database.php';

class Usuario {
    private PDO $conn;
    private string $table = 'usuarios';

    public ?int $id = null;
    public ?string $nombre = null;
    public ?string $apellido_paterno = null;
    public ?string $apellido_materno = null;
    public ?string $ci = null;
    public ?string $email = null;
    public ?string $password = null;
    public ?int $rol_id = null;
    public ?string $telefono = null;
    public string $estado = 'activo';

    public function __construct() {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Obtiene usuario por ID CON sus asignaciones
     * CRÍTICO: Docentes deben tener arrays de materias[] y grados[]
     */
    public function obtenerPorId(int $id) {
        $query = "SELECT u.*, r.nombre as rol_nombre
                FROM {$this->table} u
                LEFT JOIN roles r ON u.rol_id = r.id
                WHERE u.id = :id
                LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                unset($row['password_hash']);

                // Si es docente (rol_id = 2), cargar asignaciones
                if ($row['rol_id'] == 2) {
                    // Obtener materias asignadas
                    $queryMaterias = "SELECT m.id, m.nombre, m.sigla, m.color
                                    FROM asignaciones da
                                    INNER JOIN materias m ON da.materia_id = m.id
                                    WHERE da.docente_id = :docente_id
                                    AND da.materia_id IS NOT NULL
                                    GROUP BY m.id
                                    ORDER BY m.nombre";

                    $stmtMaterias = $this->conn->prepare($queryMaterias);
                    $stmtMaterias->bindParam(':docente_id', $id, PDO::PARAM_INT);
                    $stmtMaterias->execute();
                    $row['materias'] = $stmtMaterias->fetchAll(PDO::FETCH_ASSOC);

                    // Obtener grados asignados
                    $queryGrados = "SELECT g.id, g.nombre, g.nivel
                                   FROM asignaciones da
                                   INNER JOIN grados g ON da.grado_id = g.id
                                   WHERE da.docente_id = :docente_id
                                   AND da.grado_id IS NOT NULL
                                   GROUP BY g.id
                                   ORDER BY g.nivel";

                    $stmtGrados = $this->conn->prepare($queryGrados);
                    $stmtGrados->bindParam(':docente_id', $id, PDO::PARAM_INT);
                    $stmtGrados->execute();
                    $row['grados'] = $stmtGrados->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $row['materias'] = [];
                    $row['grados'] = [];
                }

                return $row;
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Usuario::obtenerPorId] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifica password y retorna usuario
     */
    public function verificarPassword(string $email, string $password) {
        $query = "SELECT u.*, r.nombre as rol_nombre
                FROM {$this->table} u
                LEFT JOIN roles r ON u.rol_id = r.id
                WHERE u.email = :email
                LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && password_verify($password, $usuario['password_hash'])) {
                return $usuario;
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Usuario::verificarPassword] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Crea un nuevo usuario
     * NOTA: NO incluye materia_id ni grado_id
     */
    public function crear() {
        $query = "INSERT INTO {$this->table}
                (nombre, apellido_paterno, apellido_materno, ci, email,
                 password_hash, rol_id, telefono, estado)
                VALUES
                (:nombre, :apellido_paterno, :apellido_materno, :ci, :email,
                 :password_hash, :rol_id, :telefono, :estado)";

        try {
            $stmt = $this->conn->prepare($query);

            $hashed_password = password_hash($this->password, PASSWORD_BCRYPT, ['cost' => 12]);

            $stmt->bindParam(':nombre', $this->nombre);
            $stmt->bindParam(':apellido_paterno', $this->apellido_paterno);
            $stmt->bindParam(':apellido_materno', $this->apellido_materno);
            $stmt->bindParam(':ci', $this->ci);
            $stmt->bindParam(':email', $this->email);
            $stmt->bindParam(':password_hash', $hashed_password);
            $stmt->bindParam(':rol_id', $this->rol_id);
            $stmt->bindParam(':telefono', $this->telefono);
            $stmt->bindParam(':estado', $this->estado);

            if ($stmt->execute()) {
                return (int)$this->conn->lastInsertId();
            }

            return false;
        } catch (PDOException $e) {
            error_log("[Usuario::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene usuario por email
     */
    public function obtenerPorEmail(string $email) {
        $query = "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Usuario::obtenerPorEmail] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza último acceso
     */
    public function actualizarUltimoAcceso(int $id): bool {
        $query = "UPDATE {$this->table} SET ultimo_acceso = NOW() WHERE id = :id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[Usuario::actualizarUltimoAcceso] Error: " . $e->getMessage());
            return false;
        }
    }
}
```

## PASO 2.5: AuthController (Login Completo)

Crea `backend/controllers/AuthController.php`:

```php
<?php
require_once __DIR__ . '/../utils/BaseController.php';
require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../utils/JWTHandler.php';

class AuthController extends BaseController {
    private Usuario $usuarioModel;
    private JWTHandler $jwtHandler;
    private PDO $conn;

    public function __construct() {
        $this->usuarioModel = new Usuario();
        $this->jwtHandler = new JWTHandler();
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Login de usuario
     * POST /api/auth/login
     * Body: { email, password }
     */
    public function login(): void {
        $data = $this->obtenerDatosBody();

        if (!$this->validarCamposRequeridos($data, ['email', 'password'])) {
            return;
        }

        $email = $data['email'];
        $password = $data['password'];

        // Verificar credenciales
        $usuario = $this->usuarioModel->verificarPassword($email, $password);

        if (!$usuario) {
            $this->enviarRespuesta(401, false, null, 'Credenciales inválidas');
            return;
        }

        // Verificar estado
        if ($usuario['estado'] !== 'activo') {
            $this->enviarRespuesta(403, false, null, 'Cuenta inactiva');
            return;
        }

        // Generar tokens
        $accessToken = $this->jwtHandler->generarAccessToken(
            $usuario['id'],
            $usuario['email'],
            $usuario['rol_nombre'],
            $usuario['nombre'] . ' ' . $usuario['apellido_paterno']
        );

        $refreshToken = $this->jwtHandler->generarRefreshToken(
            $usuario['id'],
            $usuario['email']
        );

        // Guardar refresh token
        $this->guardarRefreshToken($usuario['id'], $refreshToken);

        // Actualizar último acceso
        $this->usuarioModel->actualizarUltimoAcceso($usuario['id']);

        // Obtener datos completos con asignaciones
        $usuarioCompleto = $this->usuarioModel->obtenerPorId($usuario['id']);

        // Respuesta
        $this->enviarRespuesta(200, true, [
            'user' => [
                'id' => $usuarioCompleto['id'],
                'nombre' => $usuarioCompleto['nombre'],
                'apellido_paterno' => $usuarioCompleto['apellido_paterno'],
                'apellido_materno' => $usuarioCompleto['apellido_materno'],
                'email' => $usuarioCompleto['email'],
                'rol' => $usuarioCompleto['rol_nombre'],
                'rol_id' => $usuarioCompleto['rol_id'],
                'materias' => $usuarioCompleto['materias'] ?? [],
                'grados' => $usuarioCompleto['grados'] ?? []
            ],
            'tokens' => [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'token_type' => 'Bearer',
                'expires_in' => 3600
            ]
        ], 'Login exitoso');
    }

    /**
     * Logout de usuario
     * POST /api/auth/logout
     */
    public function logout(): void {
        $data = $this->obtenerDatosBody();

        if (isset($data['refresh_token'])) {
            $tokenHash = $this->jwtHandler->hashToken($data['refresh_token']);

            $query = "UPDATE tokens_refresh SET revocado = 1 WHERE token_hash = :token_hash";

            try {
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':token_hash', $tokenHash);
                $stmt->execute();
            } catch (PDOException $e) {
                error_log("Error revocando token: " . $e->getMessage());
            }
        }

        $this->enviarRespuesta(200, true, null, 'Logout exitoso');
    }

    /**
     * Obtiene usuario autenticado
     * GET /api/auth/me
     */
    public function me(): void {
        // Verificar token
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
            $this->enviarRespuesta(401, false, null, 'Token no proporcionado');
            return;
        }

        $token = $matches[1];
        $payload = $this->jwtHandler->validarToken($token);

        if (!$payload) {
            $this->enviarRespuesta(401, false, null, 'Token inválido o expirado');
            return;
        }

        // Obtener usuario completo
        $usuarioCompleto = $this->usuarioModel->obtenerPorId($payload['user_id']);

        if (!$usuarioCompleto) {
            $this->enviarRespuesta(404, false, null, 'Usuario no encontrado');
            return;
        }

        $this->enviarRespuesta(200, true, [
            'id' => $usuarioCompleto['id'],
            'nombre' => $usuarioCompleto['nombre'],
            'apellido_paterno' => $usuarioCompleto['apellido_paterno'],
            'apellido_materno' => $usuarioCompleto['apellido_materno'],
            'email' => $usuarioCompleto['email'],
            'ci' => $usuarioCompleto['ci'],
            'rol' => $usuarioCompleto['rol_nombre'],
            'rol_id' => $usuarioCompleto['rol_id'],
            'materias' => $usuarioCompleto['materias'] ?? [],
            'grados' => $usuarioCompleto['grados'] ?? [],
            'telefono' => $usuarioCompleto['telefono'],
            'estado' => $usuarioCompleto['estado']
        ]);
    }

    /**
     * Guarda refresh token en BD
     */
    private function guardarRefreshToken(int $usuarioId, string $refreshToken): bool {
        $tokenHash = $this->jwtHandler->hashToken($refreshToken);
        $payload = $this->jwtHandler->decodificarToken($refreshToken);
        $expiraEn = date('Y-m-d H:i:s', $payload['exp']);

        $query = "INSERT INTO tokens_refresh (usuario_id, token_hash, expira_en)
                VALUES (:usuario_id, :token_hash, :expira_en)";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':usuario_id', $usuarioId);
            $stmt->bindParam(':token_hash', $tokenHash);
            $stmt->bindParam(':expira_en', $expiraEn);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Error guardando refresh token: " . $e->getMessage());
            return false;
        }
    }
}
```

## PASO 2.6: Router API

Crea `backend/api/index.php`:

```php
<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Manejo de preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

// Obtener URI y método
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Limpiar URI
$uri = parse_url($requestUri, PHP_URL_PATH);
$uri = str_replace('/backend/api', '', $uri);

// ROUTING
switch (true) {
    // ========== AUTH ROUTES ==========
    case $uri === '/auth/login' && $requestMethod === 'POST':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->login();
        break;

    case $uri === '/auth/logout' && $requestMethod === 'POST':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->logout();
        break;

    case $uri === '/auth/me' && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->me();
        break;

    // ========== 404 ==========
    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint no encontrado: ' . $uri
        ]);
        break;
}
```

## PASO 2.7: .htaccess para Apache

Crea `backend/.htaccess`:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/index.php [L,QSA]
```

### ✅ Verificación Sesión 2
- [ ] Database.php con Singleton
- [ ] JWTHandler.php con encode/decode/validar
- [ ] BaseController.php con enviarRespuesta
- [ ] Usuario.php con obtenerPorId que retorna materias[] y grados[]
- [ ] AuthController.php con login/logout/me
- [ ] Router API funcionando
- [ ] Probar login con admin@sfx.edu.bo / Admin123!
- [ ] Verificar que /auth/me retorna user.materias y user.grados

---

---

# 🟣 SESIÓN 3: MODELOS Y CONTROLADORES

## Objetivo
Crear todos los modelos restantes y sus controladores CRUD.

## PASO 3.1: Modelo DocenteAsignacion

Crea `backend/models/DocenteAsignacion.php`:

```php
<?php
require_once __DIR__ . '/../config/database.php';

class DocenteAsignacion {
    private PDO $conn;
    private string $table = 'asignaciones';

    public function __construct() {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Asigna múltiples combinaciones materia-grado a un docente
     * @param int $docenteId
     * @param array $asignaciones [{materia_id, grado_id}, ...]
     * @param int $asignadorId
     */
    public function asignarMultiples(int $docenteId, array $asignaciones, int $asignadorId): bool {
        try {
            $this->conn->beginTransaction();

            // Eliminar asignaciones previas
            $deleteQuery = "DELETE FROM {$this->table} WHERE docente_id = :docente_id";
            $stmtDelete = $this->conn->prepare($deleteQuery);
            $stmtDelete->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmtDelete->execute();

            // Insertar nuevas asignaciones
            $insertQuery = "INSERT INTO {$this->table}
                          (docente_id, materia_id, grado_id, usuario_asignador_id)
                          VALUES (:docente_id, :materia_id, :grado_id, :asignador_id)
                          ON DUPLICATE KEY UPDATE estado = 'activa'";

            $stmt = $this->conn->prepare($insertQuery);

            foreach ($asignaciones as $asignacion) {
                $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
                $stmt->bindParam(':materia_id', $asignacion['materia_id'], PDO::PARAM_INT);
                $stmt->bindParam(':grado_id', $asignacion['grado_id'], PDO::PARAM_INT);
                $stmt->bindParam(':asignador_id', $asignadorId, PDO::PARAM_INT);
                $stmt->execute();
            }

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("[DocenteAsignacion::asignarMultiples] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene todas las asignaciones de un docente
     */
    public function obtenerPorDocente(int $docenteId): array {
        $query = "SELECT
                    da.id,
                    da.materia_id,
                    da.grado_id,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    m.color as materia_color,
                    g.nombre as grado_nombre,
                    g.nivel as grado_nivel
                  FROM {$this->table} da
                  INNER JOIN materias m ON da.materia_id = m.id
                  INNER JOIN grados g ON da.grado_id = g.id
                  WHERE da.docente_id = :docente_id
                  AND da.estado = 'activa'
                  ORDER BY g.nivel, m.nombre";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::obtenerPorDocente] Error: " . $e->getMessage());
            return [];
        }
    }
}
```

## PASO 3.2: Modelo Materia

Crea `backend/models/Materia.php`:

```php
<?php
require_once __DIR__ . '/../config/database.php';

class Materia {
    private PDO $conn;
    private string $table = 'materias';

    public function __construct() {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    public function obtenerTodas(): array {
        $query = "SELECT m.*, cs.nombre as campo_saber_nombre
                  FROM {$this->table} m
                  LEFT JOIN campos_saberes cs ON m.campo_saber_id = cs.id
                  WHERE m.estado = 'activo'
                  ORDER BY m.orden, m.nombre";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Materia::obtenerTodas] Error: " . $e->getMessage());
            return [];
        }
    }

    public function obtenerPorId(int $id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Materia::obtenerPorId] Error: " . $e->getMessage());
            return false;
        }
    }
}
```

## PASO 3.3: Modelo Grado

Crea `backend/models/Grado.php`:

```php
<?php
require_once __DIR__ . '/../config/database.php';

class Grado {
    private PDO $conn;
    private string $table = 'grados';

    public function __construct() {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    public function obtenerTodos(): array {
        $query = "SELECT * FROM {$this->table}
                  WHERE estado = 'activo'
                  ORDER BY nivel";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Grado::obtenerTodos] Error: " . $e->getMessage());
            return [];
        }
    }

    public function obtenerPorId(int $id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Grado::obtenerPorId] Error: " . $e->getMessage());
            return false;
        }
    }
}
```

## PASO 3.4: Modelo Tema

Crea `backend/models/Tema.php`:

```php
<?php
require_once __DIR__ . '/../config/database.php';

class Tema {
    private PDO $conn;
    private string $table = 'temas';

    public function __construct() {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    public function obtenerPorMateriaYGrado(?int $materiaId = null, ?int $gradoId = null): array {
        $onClause = "t.materia_id = m.id AND t.grado_id = g.id AND t.estado = 'activo'";
        $whereConditions = ["g.estado = 'activo'", "m.estado = 'activo'"];

        if ($materiaId) {
            $whereConditions[] = "m.id = :materia_id";
        }
        if ($gradoId) {
            $whereConditions[] = "g.id = :grado_id";
        }

        $whereClause = implode(' AND ', $whereConditions);

        $query = "SELECT
                    t.id,
                    t.nombre,
                    t.nombre_corto,
                    t.descripcion,
                    t.materia_id,
                    t.grado_id,
                    t.orden,
                    m.nombre as materia_nombre,
                    m.sigla as materia_sigla,
                    m.color as materia_color,
                    g.nombre as grado_nombre,
                    g.nivel as grado_nivel
                  FROM grados g
                  CROSS JOIN materias m
                  LEFT JOIN {$this->table} t ON {$onClause}
                  WHERE {$whereClause}
                  ORDER BY g.nivel, m.nombre, t.orden";

        try {
            $stmt = $this->conn->prepare($query);

            if ($materiaId) {
                $stmt->bindParam(':materia_id', $materiaId, PDO::PARAM_INT);
            }
            if ($gradoId) {
                $stmt->bindParam(':grado_id', $gradoId, PDO::PARAM_INT);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[Tema::obtenerPorMateriaYGrado] Error: " . $e->getMessage());
            return [];
        }
    }
}
```

## PASO 3.5: Controladores CRUD

Crea `backend/controllers/MateriaController.php`:

```php
<?php
require_once __DIR__ . '/../utils/BaseController.php';
require_once __DIR__ . '/../models/Materia.php';

class MateriaController extends BaseController {
    private Materia $materiaModel;

    public function __construct() {
        $this->materiaModel = new Materia();
    }

    public function index(): void {
        $materias = $this->materiaModel->obtenerTodas();
        $this->enviarRespuesta(200, true, $materias);
    }

    public function show(int $id): void {
        $materia = $this->materiaModel->obtenerPorId($id);

        if (!$materia) {
            $this->enviarRespuesta(404, false, null, 'Materia no encontrada');
            return;
        }

        $this->enviarRespuesta(200, true, $materia);
    }
}
```

Crea `backend/controllers/GradoController.php`:

```php
<?php
require_once __DIR__ . '/../utils/BaseController.php';
require_once __DIR__ . '/../models/Grado.php';

class GradoController extends BaseController {
    private Grado $gradoModel;

    public function __construct() {
        $this->gradoModel = new Grado();
    }

    public function index(): void {
        $grados = $this->gradoModel->obtenerTodos();
        $this->enviarRespuesta(200, true, $grados);
    }

    public function show(int $id): void {
        $grado = $this->gradoModel->obtenerPorId($id);

        if (!$grado) {
            $this->enviarRespuesta(404, false, null, 'Grado no encontrado');
            return;
        }

        $this->enviarRespuesta(200, true, $grado);
    }
}
```

Crea `backend/controllers/TemaController.php`:

```php
<?php
require_once __DIR__ . '/../utils/BaseController.php';
require_once __DIR__ . '/../models/Tema.php';

class TemaController extends BaseController {
    private Tema $temaModel;

    public function __construct() {
        $this->temaModel = new Tema();
    }

    public function index(): void {
        $materiaId = $_GET['materia_id'] ?? null;
        $gradoId = $_GET['grado_id'] ?? null;

        $temas = $this->temaModel->obtenerPorMateriaYGrado(
            $materiaId ? (int)$materiaId : null,
            $gradoId ? (int)$gradoId : null
        );

        $this->enviarRespuesta(200, true, $temas);
    }
}
```

## PASO 3.6: Actualizar Router API

Edita `backend/api/index.php` y agrega estas rutas después de las rutas de auth:

```php
    // ========== MATERIAS ROUTES ==========
    case preg_match('#^/materias$#', $uri) && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/MateriaController.php';
        $controller = new MateriaController();
        $controller->index();
        break;

    case preg_match('#^/materias/(\d+)$#', $uri, $matches) && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/MateriaController.php';
        $controller = new MateriaController();
        $controller->show((int)$matches[1]);
        break;

    // ========== GRADOS ROUTES ==========
    case preg_match('#^/grados$#', $uri) && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/GradoController.php';
        $controller = new GradoController();
        $controller->index();
        break;

    case preg_match('#^/grados/(\d+)$#', $uri, $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/GradoController.php';
        $controller = new GradoController();
        $controller->show((int)$matches[1]);
        break;

    // ========== TEMAS ROUTES ==========
    case preg_match('#^/temas$#', $uri) && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/TemaController.php';
        $controller = new TemaController();
        $controller->index();
        break;
```

### ✅ Verificación Sesión 3
- [ ] DocenteAsignacion.php con asignarMultiples() y obtenerPorDocente()
- [ ] Materia.php, Grado.php, Tema.php con métodos CRUD básicos
- [ ] Controladores para cada modelo
- [ ] Router actualizado con nuevas rutas
- [ ] Probar GET /api/materias, /api/grados, /api/temas

---

# 🟠 SESIÓN 4: FRONTEND SETUP Y CONTEXT

## Objetivo
Configurar proyecto React con Vite, Tailwind CSS, y crear contextos globales.

## PASO 4.1: Inicializar Proyecto React

```bash
cd videotecasfx
npm create vite@latest frontend-web -- --template react
cd frontend-web
npm install
```

## PASO 4.2: Instalar Dependencias

```bash
npm install react-router-dom axios lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## PASO 4.3: Configurar Tailwind

Edita `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        'salesiano-azul': {
          500: '#1e40af',
          600: '#1e3a8a',
        }
      },
    },
  },
  plugins: [],
}
```

## PASO 4.4: Variables de Entorno

Crea `frontend-web/.env`:

```env
VITE_API_URL=http://localhost/backend/api
```

## PASO 4.5: AuthContext

Crea `frontend-web/src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, getStoredUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { user: userData } = await loginService(email, password);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const hasRole = (role) => {
    return user?.rol === role;
  };

  const isAdmin = () => hasRole('Administrador');
  const isDocente = () => hasRole('Docente');
  const isEstudiante = () => hasRole('Estudiante');

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    isAdmin,
    isDocente,
    isEstudiante,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## PASO 4.6: ThemeContext

Crea `frontend-web/src/context/ThemeContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

## PASO 4.7: API Service

Crea `frontend-web/src/services/api.js`:

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/backend/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor - agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor - respuestas
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data.data;
          localStorage.setItem('access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
```

## PASO 4.8: Auth Service

Crea `frontend-web/src/services/authService.js`:

```javascript
import api from './api';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });

    if (response.success) {
      const { user, tokens } = response.data;

      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, tokens };
    }

    throw new Error(response.error?.message || 'Error en login');
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');

    try {
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');

    if (response.success) {
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }

    return null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const login = (email, password) => authService.login(email, password);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const getStoredUser = () => authService.getStoredUser();

export default authService;
```

### ✅ Verificación Sesión 4
- [ ] Proyecto React con Vite creado
- [ ] Tailwind CSS configurado con dark mode
- [ ] AuthContext con login/logout/role checks
- [ ] ThemeContext con toggle dark mode
- [ ] API service con interceptors
- [ ] Auth service con localStorage management

---

# 🔵 SESIÓN 5: COMPONENTES UI Y PÁGINAS PRINCIPALES

## Objetivo
Crear componentes reutilizables y páginas principales del sistema.

## PASO 5.1: Componente ProtectedRoute

Crea `frontend-web/src/components/Auth/ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

## PASO 5.2: Navbar Component

Crea `frontend-web/src/components/Layout/Navbar.jsx`:

```jsx
import { Link, useNavigate } from 'react-router-dom';
import { Home, Video, Users, BookOpen, GraduationCap, FileText, LayoutDashboard, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAdmin, isDocente } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-salesiano-azul-600 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Videoteca SFX
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={Home}>Inicio</NavLink>
            <NavLink to="/materias" icon={BookOpen}>Materias</NavLink>
            <NavLink to="/cursos" icon={GraduationCap}>Cursos</NavLink>
            <NavLink to="/videos" icon={Video}>Videos</NavLink>

            {isAdmin() && (
              <>
                <NavLink to="/usuarios" icon={Users}>Usuarios</NavLink>
                <NavLink to="/temas" icon={FileText}>Temas</NavLink>
              </>
            )}

            {(isAdmin() || isDocente()) && (
              <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDark ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.nombre} {user?.apellido_paterno}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.rol}</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
  >
    <Icon className="w-4 h-4" />
    <span>{children}</span>
  </Link>
);

export default Navbar;
```

## PASO 5.3: LoginPage

Crea `frontend-web/src/pages/LoginPage.jsx`:

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-salesiano-azul-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <Video className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Videoteca SFX</h1>
          <p className="text-primary-100">U.E. San Francisco Xavier</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Iniciar Sesión</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-salesiano-azul-600 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-salesiano-azul-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-primary-100 text-sm mt-6">
          Videoteca Educativa • Sistema de Gestión de Videos
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
```

## PASO 5.4: HomePage

Crea `frontend-web/src/pages/HomePage.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Video, TrendingUp } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-salesiano-azul-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">Bienvenido a Videoteca SFX</h1>
            <p className="text-xl text-primary-100">
              Plataforma educativa digital para el acceso a contenido multimedia organizado por materias y cursos.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="container mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAccessCard
            to="/materias"
            icon={BookOpen}
            title="Explorar Materias"
            description="Accede a videos organizados por área de conocimiento"
            color="blue"
          />
          <QuickAccessCard
            to="/cursos"
            icon={GraduationCap}
            title="Ver Cursos"
            description="Busca contenido por grado académico"
            color="green"
          />
          <QuickAccessCard
            to="/videos"
            icon={Video}
            title="Todos los Videos"
            description="Catálogo completo de material educativo"
            color="purple"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Educación Digital de Calidad
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Accede a contenido educativo de alta calidad, organizado por el currículo boliviano.
          </p>
        </div>
      </div>
    </div>
  );
};

const QuickAccessCard = ({ to, icon: Icon, title, description, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  };

  return (
    <Link
      to={to}
      className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1`}
    >
      <Icon className="w-12 h-12 mb-4" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/90">{description}</p>
    </Link>
  );
};

export default HomePage;
```

## PASO 5.5: App Router

Crea `frontend-web/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Add more routes here */}
    </Routes>
  );
};

const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

export default App;
```

### ✅ Verificación Sesión 5
- [ ] ProtectedRoute con role checking
- [ ] Navbar con navegación y theme toggle
- [ ] LoginPage con formulario funcional
- [ ] HomePage con quick access cards
- [ ] App.jsx con routing básico
- [ ] Probar flujo de login/logout

---

# 🟢 SESIÓN 6: SISTEMA DE ASIGNACIONES Y UPLOADS

## Objetivo
Implementar el sistema de asignaciones múltiples y upload de videos con filtrado.

## PASO 6.1: UserForm con Asignaciones

Crea `frontend-web/src/components/Users/UserForm.jsx`:

**CRÍTICO:** Este componente maneja materias_ids[] y grados_ids[] como arrays.

```jsx
import { useState, useEffect, useMemo } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserForm = ({ initialData, materias, grados, roles, onSubmit, loading }) => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    email: '',
    telefono: '',
    password: '',
    rol_id: '',
    materias_ids: [],
    grados_ids: [],
    ...initialData
  });

  const isDocente = formData.rol_id === '2';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleMateria = (materiaId) => {
    setFormData(prev => ({
      ...prev,
      materias_ids: prev.materias_ids.includes(materiaId)
        ? prev.materias_ids.filter(id => id !== materiaId)
        : [...prev.materias_ids, materiaId]
    }));
  };

  const toggleGrado = (gradoId) => {
    setFormData(prev => ({
      ...prev,
      grados_ids: prev.grados_ids.includes(gradoId)
        ? prev.grados_ids.filter(id => id !== gradoId)
        : [...prev.grados_ids, gradoId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nombre *</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Apellido Paterno *</label>
          <input
            type="text"
            value={formData.apellido_paterno}
            onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CI *</label>
          <input
            type="text"
            value={formData.ci}
            onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rol *</label>
          <select
            value={formData.rol_id}
            onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            required
          >
            <option value="">Seleccione un rol</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.id}>{rol.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Asignaciones (solo para docentes) */}
      {isDocente && (
        <>
          <div>
            <label className="block text-sm font-medium mb-3">Materias Asignadas *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {materias.map(materia => {
                const isSelected = formData.materias_ids.includes(materia.id);
                return (
                  <button
                    key={materia.id}
                    type="button"
                    onClick={() => toggleMateria(materia.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-sm font-medium">{materia.nombre}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{materia.sigla}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Grados Asignados *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {grados.map(grado => {
                const isSelected = formData.grados_ids.includes(grado.id);
                return (
                  <button
                    key={grado.id}
                    type="button"
                    onClick={() => toggleGrado(grado.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/40'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-400'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-sm font-medium text-center">{grado.sigla}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Usuario'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
```

## PASO 6.2: VideoUploadForm con Filtrado

Crea `frontend-web/src/components/Videos/VideoUploadForm.jsx`:

**CRÍTICO:** Docentes solo ven sus materias/grados asignados.

```jsx
import { useState, useEffect, useMemo } from 'react';
import { Check, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VideoUploadForm = ({ materias, grados, temas, onSubmit, loading }) => {
  const { user, isAdmin, isDocente } = useAuth();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    materia_id: '',
    grado_id: '',
    tema_id: '',
    archivo: null
  });

  // Filtrar materias disponibles
  const materiasDisponibles = useMemo(() => {
    if (isAdmin()) return materias;
    if (isDocente() && user?.materias) {
      const materiasIds = user.materias.map(m => m.id);
      return materias.filter(m => materiasIds.includes(m.id));
    }
    return [];
  }, [materias, user, isAdmin, isDocente]);

  // Filtrar grados disponibles
  const gradosDisponibles = useMemo(() => {
    if (isAdmin()) return grados;
    if (isDocente() && user?.grados) {
      const gradosIds = user.grados.map(g => g.id);
      return grados.filter(g => gradosIds.includes(g.id));
    }
    return [];
  }, [grados, user, isAdmin, isDocente]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Título del Video *</label>
        <input
          type="text"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Materia *</label>
        {materiasDisponibles.length === 0 ? (
          <p className="text-sm text-gray-500">No tienes materias asignadas</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {materiasDisponibles.map(materia => {
              const isSelected = formData.materia_id === materia.id.toString();
              return (
                <button
                  key={materia.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, materia_id: materia.id.toString() }))}
                  className={`relative p-4 rounded-lg border-2 ${
                    isSelected ? 'border-blue-600 bg-blue-100' : 'border-gray-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="font-medium">{materia.nombre}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Grado *</label>
        {gradosDisponibles.length === 0 ? (
          <p className="text-sm text-gray-500">No tienes grados asignados</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {gradosDisponibles.map(grado => {
              const isSelected = formData.grado_id === grado.id.toString();
              return (
                <button
                  key={grado.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, grado_id: grado.id.toString() }))}
                  className={`relative p-4 rounded-lg border-2 ${
                    isSelected ? 'border-green-600 bg-green-100' : 'border-gray-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="font-medium text-center">{grado.sigla}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Archivo de Video *</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFormData({ ...formData, archivo: e.target.files[0] })}
          className="w-full"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        <Upload className="w-5 h-5" />
        <span>{loading ? 'Subiendo...' : 'Subir Video'}</span>
      </button>
    </form>
  );
};

export default VideoUploadForm;
```

### ✅ Verificación Sesión 6
- [ ] UserForm con badge selection para materias/grados
- [ ] VideoUploadForm con filtrado por asignaciones
- [ ] useMemo para optimizar filtrado
- [ ] Validación de asignaciones en formularios
- [ ] Probar creación de usuario docente con asignaciones
- [ ] Probar upload de video como docente

---

# 🔴 SESIÓN 7: DASHBOARD Y ESTADÍSTICAS

## Objetivo
Implementar dashboard con estadísticas y stored procedures.

## PASO 7.1: EstadisticasService

Crea `frontend-web/src/services/estadisticasService.js`:

```javascript
import api from './api';

export const obtenerEstadisticasGenerales = async () => {
  const response = await api.get('/estadisticas/generales');
  return response.data;
};

export const obtenerEstadisticasDocente = async (docenteId) => {
  const response = await api.get(`/estadisticas/docente/${docenteId}`);
  return response.data;
};
```

## PASO 7.2: DashboardPage

Crea `frontend-web/src/pages/DashboardPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { Video, Users, BookOpen, GraduationCap, Eye, HardDrive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obtenerEstadisticasGenerales, obtenerEstadisticasDocente } from '../services/estadisticasService';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      if (isAdmin()) {
        const data = await obtenerEstadisticasGenerales();
        setStats(data);
      } else {
        const data = await obtenerEstadisticasDocente(user.id);
        setStats(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-salesiano-azul-500 dark:from-gray-800 dark:to-gray-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-primary-100 dark:text-gray-300">
            {isAdmin() ? 'Estadísticas Generales del Sistema' : 'Tus Estadísticas'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Video}
            label="Videos Subidos"
            value={stats?.total_videos || 0}
            color="blue"
          />
          {isAdmin() && (
            <>
              <StatCard
                icon={Users}
                label="Docentes"
                value={stats?.total_docentes || 0}
                color="green"
              />
              <StatCard
                icon={Users}
                label="Estudiantes"
                value={stats?.total_estudiantes || 0}
                color="purple"
              />
            </>
          )}
          <StatCard
            icon={BookOpen}
            label="Materias"
            value={stats?.total_materias || 0}
            color="yellow"
          />
          <StatCard
            icon={Eye}
            label="Visualizaciones"
            value={stats?.total_visualizaciones || 0}
            color="red"
          />
          <StatCard
            icon={HardDrive}
            label="Espacio Usado"
            value={formatBytes(stats?.espacio_usado || 0)}
            color="indigo"
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default DashboardPage;
```

### ✅ Verificación Sesión 7
- [ ] EstadisticasService implementado
- [ ] DashboardPage con stats cards
- [ ] Estadísticas generales para admin
- [ ] Estadísticas personales para docente
- [ ] Formateo de bytes correcto
- [ ] Probar dashboard como admin y docente

---

# ⚫ SESIÓN 8: TESTING Y REFINAMIENTO

## Objetivo
Probar todo el sistema y asegurar que funcione correctamente.

## PASO 8.1: Checklist de Pruebas

### Backend
- [ ] Probar login con admin@sfx.edu.bo / Admin123!
- [ ] Verificar que /auth/me retorna materias[] y grados[]
- [ ] Crear usuario docente con múltiples asignaciones
- [ ] Editar usuario docente y cambiar asignaciones
- [ ] Probar GET /api/materias, /api/grados, /api/temas
- [ ] Verificar stored procedure sp_estadisticas_generales()

### Frontend
- [ ] Login exitoso redirecciona a home
- [ ] Navbar muestra opciones según rol
- [ ] Theme toggle funciona correctamente
- [ ] UserForm permite selección múltiple de materias/grados
- [ ] VideoUploadForm filtra opciones para docentes
- [ ] Dashboard muestra estadísticas correctas
- [ ] Logout limpia localStorage

### Flujo Completo Docente
1. Admin crea docente con 2 materias y 3 grados = 6 asignaciones
2. Docente inicia sesión
3. Dashboard muestra estadísticas personales
4. Al subir video, solo ve sus 2 materias y 3 grados
5. Video se guarda correctamente

### Flujo Completo Admin
1. Admin ve todas las opciones en navbar
2. Puede crear/editar usuarios
3. Dashboard muestra estadísticas globales
4. Puede subir videos para cualquier materia/grado

## PASO 8.2: Correcciones Finales

Si encuentras errores:
1. Verifica la tabla `asignaciones` en la BD
2. Revisa que `Usuario.php::obtenerPorId()` retorne arrays
3. Confirma que frontend filtra correctamente con useMemo
4. Verifica CORS headers en backend

## PASO 8.3: Optimizaciones Opcionales

- Agregar paginación en listados
- Implementar búsqueda de videos
- Agregar cache en estadísticas
- Optimizar queries con índices
- Agregar logs de auditoría

### ✅ Verificación Final
- [ ] Sistema completo funcional
- [ ] Asignaciones múltiples funcionando
- [ ] Filtrado por rol correcto
- [ ] Sin errores en consola
- [ ] Performance aceptable
- [ ] Código documentado

---

## 📝 NOTAS CRÍTICAS PARA EL AI

### ⚠️ PUNTOS CRÍTICOS A NO OLVIDAR:

#### Base de Datos
1. **Tabla usuarios:** NUNCA incluir campos `materia_id` ni `grado_id` - estos datos van en la tabla `asignaciones`
2. **Tabla asignaciones:** Debe tener UNIQUE constraint en (docente_id, materia_id, grado_id) para evitar duplicados
3. **Orden de creación:** Roles → Usuarios → Campos Saberes → Materias → Grados → Asignaciones → Temas → Videos → Tokens → Stats → Logs
4. **Charset:** Siempre utf8mb4_unicode_ci para soporte completo de Unicode
5. **Foreign Keys:** ON DELETE CASCADE en asignaciones, ON DELETE SET NULL en relaciones opcionales

#### Backend PHP
6. **Usuario.php::obtenerPorId():** DEBE retornar `materias[]` y `grados[]` para docentes usando LEFT JOIN en tabla asignaciones
7. **Usuario.php::obtenerPorId():** Usar GROUP BY m.id y GROUP BY g.id para evitar duplicados
8. **UsuarioController::store():** Manejar `materias_ids[]` y `grados_ids[]` como arrays, crear combinaciones
9. **UsuarioController::update():** Eliminar asignaciones previas antes de insertar nuevas (dentro de transacción)
10. **AuthController::login():** DEBE retornar user.materias y user.grados en el objeto user
11. **DocenteAsignacion::asignarMultiples():** Usar transacciones para DELETE + INSERT
12. **Tema::obtenerPorMateriaYGrado():** Condiciones ON en JOIN, condiciones WHERE fuera
13. **JWT:** Incluir rol en payload con nombre completo ("Administrador", "Docente", "Estudiante")
14. **Password hash:** Usar bcrypt con cost 12: `password_hash($password, PASSWORD_BCRYPT, ['cost' => 12])`
15. **CORS:** Permitir Authorization header en Access-Control-Allow-Headers
16. **Error handling:** Siempre usar try-catch con error_log() y retornar mensajes amigables

#### Frontend React
17. **AuthContext:** Usar hasRole() con string comparison exacta: `user?.rol === 'Administrador'`
18. **UserForm:** Manejar materias_ids[] y grados_ids[] como arrays de números
19. **EditUserPage:** Mapear user.materias y user.grados a arrays de IDs: `user.materias?.map(m => m.id)`
20. **VideoUploadForm:** Usar useMemo para filtrar materias/grados basado en user.materias y user.grados
21. **API Interceptor:** Implementar refresh token automático en respuestas 401
22. **localStorage:** Guardar user completo con materias[] y grados[] incluidos
23. **Theme:** Usar class-based dark mode con `document.documentElement.classList`
24. **Protected Routes:** Verificar loading state antes de redirigir

### 🎯 FLUJOS CRÍTICOS:

#### Flujo de Autenticación
```
1. POST /auth/login → Valida credenciales
2. Si válido → Genera JWT (access + refresh)
3. Usuario.obtenerPorId() → Carga asignaciones con GROUP BY
4. Retorna: { user: {..., materias[], grados[]}, tokens: {...} }
5. Frontend guarda en localStorage
6. AuthContext inicializa con getStoredUser()
7. GET /auth/me → Verifica token y retorna user actualizado
```

#### Flujo de Creación de Docente
```
1. Admin accede a /usuarios/crear
2. Selecciona rol "Docente" → Muestra badges de materias/grados
3. Selecciona 2 materias y 3 grados → 6 combinaciones
4. POST /usuarios con materias_ids=[1,2], grados_ids=[1,2,3]
5. Backend crea usuario
6. Backend genera 6 asignaciones (1-1, 1-2, 1-3, 2-1, 2-2, 2-3)
7. Guarda en tabla asignaciones
```

#### Flujo de Upload de Video (Docente)
```
1. Docente accede a /videos/subir
2. VideoUploadForm filtra con useMemo:
   - materiasDisponibles = materias.filter(m => user.materias.includes(m.id))
   - gradosDisponibles = grados.filter(g => user.grados.includes(g.id))
3. Docente solo ve sus 2 materias y 3 grados
4. Selecciona y sube video
5. Backend valida que docente tiene asignación para esa materia-grado
```

### 📦 ORDEN DE IMPLEMENTACIÓN POR SESIÓN:

**Sesión 1:** Database Schema (11 tablas) + Seed Data
**Sesión 2:** Database.php, JWTHandler.php, BaseController.php, Usuario.php, AuthController.php, Router
**Sesión 3:** DocenteAsignacion.php, Materia.php, Grado.php, Tema.php, Controllers, Router update
**Sesión 4:** React setup, Tailwind, AuthContext, ThemeContext, api.js, authService.js
**Sesión 5:** ProtectedRoute, Navbar, LoginPage, HomePage, App.jsx
**Sesión 6:** UserForm (con badges), VideoUploadForm (con filtrado), useMemo
**Sesión 7:** EstadisticasService, DashboardPage, StatCards
**Sesión 8:** Testing completo, correcciones, optimizaciones

### 🚨 ERRORES COMUNES A EVITAR:

1. ❌ Crear `materia_id` y `grado_id` en tabla usuarios
2. ❌ Usar tabla `docente_asignaciones` (se llama `asignaciones`)
3. ❌ No hacer GROUP BY en queries de asignaciones → duplicados
4. ❌ Manejar asignaciones como valores únicos en vez de arrays
5. ❌ No usar transacciones en asignarMultiples() → datos inconsistentes
6. ❌ Poner WHERE dentro de ON en LEFT JOIN → SQL error
7. ❌ No filtrar materias/grados para docentes en frontend → pueden subir videos no autorizados
8. ❌ No usar useMemo para filtrado → re-renders innecesarios
9. ❌ Comparar roles con rol_id en vez de rol nombre → falla reconocimiento
10. ❌ No incluir materias[] y grados[] en respuesta de login → frontend no tiene datos

### ✅ VALIDACIONES REQUERIDAS:

#### Backend
- Validar que docente tenga asignación antes de permitir upload de video
- Verificar unicidad de CI y email al crear usuario
- Validar tamaño máximo de archivo de video (ej: 500MB)
- Verificar que materias_ids y grados_ids existan en BD

#### Frontend
- Mostrar mensaje si docente no tiene asignaciones
- Deshabilitar botón de submit mientras se procesa
- Validar formato de email
- Validar que docente tenga al menos 1 materia y 1 grado seleccionados

### 🔐 SEGURIDAD:

1. Usar prepared statements (PDO) para todas las queries
2. Bcrypt para passwords con cost 12
3. JWT con secret key segura (cambiar en producción)
4. Validar tokens en cada request protegido
5. CORS configurado correctamente
6. Sanitizar inputs en frontend y backend
7. No exponer password_hash en respuestas
8. Rate limiting en login (opcional pero recomendado)

### 📊 PERFORMANCE:

1. Índices en: email, ci, rol_id, estado, materia_id, grado_id, docente_id
2. useMemo en filtrados de listas grandes
3. Paginación en listados de videos/usuarios
4. Cache en estadísticas (tabla estadisticas)
5. LIMIT en queries de listados
6. Lazy loading de componentes con React.lazy()

---

## 🎓 INFORMACIÓN ADICIONAL PARA EL AI

### Contexto del Sistema
- **Institución:** U.E. San Francisco Xavier (Bolivia)
- **Currículo:** Sistema boliviano con Campos de Saberes
- **Usuarios:** 3 tipos (Admin, Docente, Estudiante)
- **Materias:** 10 principales (Matemática, Física, Química, etc.)
- **Grados:** 6 niveles de secundaria (1° a 6°)
- **Videos:** Organizados por Materia → Grado → Tema

### Decisiones de Arquitectura
1. **Asignaciones múltiples:** Un docente puede enseñar varias materias en varios grados
2. **JWT dual:** Access token (1h) + Refresh token (30 días)
3. **Badge UI:** Selección visual en vez de dropdowns para mejor UX
4. **Dark mode:** Clase CSS en vez de estado global
5. **SPA:** React con client-side routing
6. **API REST:** Backend sin estado, frontend maneja sesión

### Tecnologías Específicas
- **Backend:** PHP 8.x nativo (sin frameworks)
- **Frontend:** React 18 + Vite 4 + Tailwind CSS 3
- **Database:** MySQL 8.x con InnoDB
- **Icons:** Lucide React
- **HTTP Client:** Axios con interceptors
- **Routing:** React Router DOM v6

---

## 🏁 RESUMEN FINAL

Este prompt está diseñado para que un asistente AI (ChatGPT, Claude, etc.) pueda generar el sistema completo en 8 sesiones incrementales. Cada sesión es independiente pero construye sobre las anteriores.

**Puntos clave a recordar:**
1. Tabla `usuarios` NO tiene materia_id ni grado_id
2. Tabla `asignaciones` almacena combinaciones (docente_id, materia_id, grado_id)
3. Backend retorna arrays: `materias[]` y `grados[]`
4. Frontend filtra opciones con `useMemo` basado en estos arrays
5. Docentes solo pueden subir videos de sus asignaciones
6. Sistema de roles con strings: "Administrador", "Docente", "Estudiante"

**Credenciales iniciales:**
- Email: admin@sfx.edu.bo
- Password: Admin123!

**Verificación de éxito:**
El sistema está completo cuando:
- Admin puede crear docente con múltiples asignaciones
- Docente ve solo sus materias/grados al subir video
- Dashboard muestra estadísticas según rol
- Dark mode funciona
- Sin errores en consola

---

**FIN DEL PROMPT COMPLETO**

_Generado para: Asistentes AI (ChatGPT, Claude, etc.)_
_Sistema: Videoteca Educativa SFX_
_Versión: 2.0 Completa (8 Sesiones)_
_Última actualización: 2025-12-22_
_Total de líneas: ~3000_
_Arquitectura: PHP Backend + React Frontend + MySQL Database_
