# 🎓 PROMPT COMPLETO: Sistema de Videoteca Educativa SFX

## 📋 ÍNDICE
1. [Descripción General del Sistema](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura)
4. [Base de Datos Completa](#base-de-datos)
5. [Backend PHP (API REST)](#backend-php)
6. [Frontend React](#frontend-react)
7. [Sistema de Autenticación](#autenticación)
8. [Sistema de Asignaciones de Docentes](#asignaciones)
9. [Sistema de Videos](#videos)
10. [UI/UX y Temas](#ui-ux)
11. [Funcionalidades por Rol](#funcionalidades-por-rol)

---

## 📝 DESCRIPCIÓN GENERAL

**Sistema:** Videoteca Educativa Digital para U.E. San Francisco Xavier

**Propósito:** Plataforma web para gestionar, organizar y distribuir contenido educativo en video para una institución educativa, permitiendo a docentes subir videos clasificados por materia, grado y tema curricular, y a estudiantes acceder a este contenido de manera organizada.

**Usuarios del Sistema:**
- **Administradores:** Gestión completa del sistema, usuarios, y visualización de estadísticas globales
- **Docentes:** Subida y gestión de videos de sus materias y grados asignados, estadísticas propias
- **Estudiantes:** Visualización y búsqueda de videos educativos

**Características Principales:**
- Sistema de roles con permisos específicos
- Asignaciones múltiples de materias y grados para docentes
- Clasificación curricular completa (Campos de Saberes → Materias → Grados → Temas)
- Sistema de autenticación con JWT
- Dashboard con estadísticas y gráficos
- Modo oscuro/claro
- Interfaz responsive (mobile-first)
- Búsqueda y filtrado avanzado de videos

---

## 🛠 STACK TECNOLÓGICO

### Backend
- **Lenguaje:** PHP 8.x
- **Base de Datos:** MySQL 8.x / MariaDB 10.x
- **Autenticación:** JWT (JSON Web Tokens)
- **Arquitectura:** API REST con patrón MVC
- **Manejo de archivos:** Subida de videos y thumbnails

### Frontend
- **Framework:** React 18+ con Vite
- **Routing:** React Router v6
- **Estado Global:** Context API
- **Estilos:** Tailwind CSS 3.x
- **Iconos:** Lucide React
- **HTTP Client:** Axios
- **Tema:** Dark/Light mode con Context

### Infraestructura
- **Servidor Web:** Apache/Nginx
- **Almacenamiento:** Sistema de archivos local para videos
- **CORS:** Configurado para desarrollo local

---

## 🏗 ARQUITECTURA DEL SISTEMA

### Estructura de Directorios

```
videotecasfx/
├── backend/
│   ├── config/
│   │   ├── database.php          # Configuración de base de datos (Singleton)
│   │   └── app.php                # Configuración general
│   ├── controllers/
│   │   ├── AuthController.php     # Login, logout, refresh token
│   │   ├── UsuarioController.php  # CRUD de usuarios
│   │   ├── VideoController.php    # CRUD de videos
│   │   ├── MateriaController.php  # CRUD de materias
│   │   ├── GradoController.php    # CRUD de grados
│   │   ├── TemaController.php     # CRUD de temas
│   │   ├── DocenteAsignacionController.php  # Gestión de asignaciones
│   │   ├── EstadisticaController.php  # Estadísticas y dashboards
│   │   └── CampoSaberController.php  # Campos de saberes
│   ├── models/
│   │   ├── Usuario.php
│   │   ├── Video.php
│   │   ├── Materia.php
│   │   ├── Grado.php
│   │   ├── Tema.php
│   │   ├── DocenteAsignacion.php
│   │   ├── Estadistica.php
│   │   └── CampoSaber.php
│   ├── middleware/
│   │   ├── AuthMiddleware.php     # Verificación de JWT
│   │   ├── RoleMiddleware.php     # Verificación de roles
│   │   └── CorsMiddleware.php     # Manejo de CORS
│   ├── utils/
│   │   ├── JWTHandler.php         # Manejo de tokens JWT
│   │   ├── Validator.php          # Validación de datos
│   │   ├── Logger.php             # Sistema de logs
│   │   └── BaseController.php     # Controlador base
│   ├── uploads/
│   │   ├── videos/                # Videos subidos
│   │   └── thumbnails/            # Miniaturas
│   ├── api/
│   │   └── index.php              # Router principal de la API
│   └── .htaccess                  # Rewrite rules
│
├── frontend-web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── Common/
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── ErrorMessage.jsx
│   │   │   │   └── SuccessMessage.jsx
│   │   │   ├── Users/
│   │   │   │   ├── UserForm.jsx
│   │   │   │   └── UserCard.jsx
│   │   │   ├── Videos/
│   │   │   │   ├── VideoCard.jsx
│   │   │   │   ├── VideoUploadForm.jsx
│   │   │   │   └── VideoPlayer.jsx
│   │   │   └── Auth/
│   │   │       └── LoginForm.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── VideosPage.jsx
│   │   │   ├── VideoDetailPage.jsx
│   │   │   ├── UploadVideoPage.jsx
│   │   │   ├── MateriasPage.jsx
│   │   │   ├── CursosPage.jsx
│   │   │   ├── UsuariosPage.jsx
│   │   │   ├── EditUserPage.jsx
│   │   │   ├── PerfilPage.jsx
│   │   │   ├── AcercaDePage.jsx
│   │   │   ├── FAQPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── videoService.js
│   │   │   ├── materiaService.js
│   │   │   ├── gradoService.js
│   │   │   ├── temaService.js
│   │   │   └── statsService.js
│   │   ├── hooks/
│   │   │   └── useResources.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── database/
    ├── schema.sql                 # Esquema completo de la base de datos
    ├── seed_data.sql              # Datos iniciales
    └── migrations/
        └── update_sp_estadisticas_generales.sql
```

---

## 🗄 BASE DE DATOS COMPLETA

### Esquema de Tablas (MySQL)

#### 1. **Tabla: roles**
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

-- Datos iniciales
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
```

#### 2. **Tabla: usuarios**
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

-- Usuario administrador inicial (password: Admin123!)
INSERT INTO usuarios (nombre, apellido_paterno, ci, email, password_hash, rol_id) VALUES
('Administrador', 'Sistema', '0000000', 'admin@sfx.edu.bo',
'$2y$12$KIXww7hqKz5QX.jz0K0jZ.M8vqJHQx6YxJ8aB5L3pN4sP7qR9tU2W', 1);
```

#### 3. **Tabla: campos_saberes**
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

-- Datos según currículo boliviano
INSERT INTO campos_saberes (nombre, descripcion, icono, color, orden) VALUES
('Cosmos y Pensamiento', 'Filosofía, Cosmovisiones, Religión', 'brain', '#8B5CF6', 1),
('Comunidad y Sociedad', 'Comunicación, Lenguas, Ciencias Sociales', '#3B82F6', 2),
('Vida Tierra Territorio', 'Ciencias Naturales, Geografía', '#10B981', 3),
('Ciencia Tecnología y Producción', 'Matemática, Técnica Tecnológica', '#F59E0B', 4);
```

#### 4. **Tabla: materias**
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

-- Ejemplos de materias
INSERT INTO materias (nombre, sigla, campo_saber_id, color, orden) VALUES
('Matemática', 'MAT', 4, '#F59E0B', 1),
('Física', 'FIS', 4, '#EF4444', 2),
('Química', 'QUI', 4, '#8B5CF6', 3),
('Biología', 'BIO', 3, '#10B981', 4),
('Lenguaje', 'LEN', 2, '#3B82F6', 5),
('Inglés', 'ING', 2, '#EC4899', 6),
('Historia', 'HIS', 2, '#F97316', 7),
('Geografía', 'GEO', 3, '#14B8A6', 8),
('Filosofía', 'FIL', 1, '#6366F1', 9);
```

#### 5. **Tabla: grados**
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

-- Secundaria boliviana (6 años)
INSERT INTO grados (nombre, nivel, sigla, orden) VALUES
('Primero de Secundaria', 1, '1RO SEC', 1),
('Segundo de Secundaria', 2, '2DO SEC', 2),
('Tercero de Secundaria', 3, '3RO SEC', 3),
('Cuarto de Secundaria', 4, '4TO SEC', 4),
('Quinto de Secundaria', 5, '5TO SEC', 5),
('Sexto de Secundaria', 6, '6TO SEC', 6);
```

#### 6. **Tabla: asignaciones** (Docente-Materia-Grado)
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

#### 7. **Tabla: temas**
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

#### 8. **Tabla: videos**
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

#### 9. **Tabla: tokens_refresh**
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

#### 10. **Tabla: estadisticas** (Opcional para cache)
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

#### 11. **Tabla: logs** (Sistema de auditoría)
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

### Stored Procedures

#### Estadísticas Generales
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
        (SELECT SUM(visualizaciones) FROM videos WHERE estado = 'activo') as total_visualizaciones,
        (SELECT SUM(tamanio) FROM videos WHERE estado = 'activo') as espacio_usado;
END //
DELIMITER ;
```

---

## 🔧 BACKEND PHP - API REST

### Estructura de Clases Base

#### BaseController.php
```php
<?php
abstract class BaseController {
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

        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
```

#### Database.php (Singleton Pattern)
```php
<?php
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
            die("Error de conexión a la base de datos");
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

### Sistema de Autenticación JWT

#### JWTHandler.php
```php
<?php
class JWTHandler {
    private string $secretKey = 'TU_CLAVE_SECRETA_AQUI_CAMBIAR_EN_PRODUCCION';
    private string $algorithm = 'HS256';

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

    private function base64UrlEncode($data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode($data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public function hashToken(string $token): string {
        return hash('sha256', $token);
    }
}
```

### Modelo de Usuario

#### Usuario.php (CRÍTICO - Con sistema de asignaciones)
```php
<?php
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
     * Obtiene usuario por ID con sus asignaciones
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
     * Crea un nuevo usuario
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
     * Verifica password
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
}
```

### AuthController con Login Completo

#### AuthController.php
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
     */
    public function login(): void {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            $this->enviarRespuesta(400, false, null, 'Email y contraseña requeridos');
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
     * Obtiene usuario autenticado
     * GET /api/auth/me
     */
    public function me(): void {
        // Verificar token (AuthMiddleware ya lo hizo)
        $authMiddleware = new AuthMiddleware();
        if (!$authMiddleware->verificar()) {
            return;
        }

        $usuario = $authMiddleware->obtenerUsuario();
        $usuarioCompleto = $this->usuarioModel->obtenerPorId($usuario['id']);

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

    private function guardarRefreshToken(int $usuarioId, string $refreshToken): bool {
        $tokenHash = $this->jwtHandler->hashToken($refreshToken);
        $payload = $this->jwtHandler->validarToken($refreshToken);
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

### Router Principal API

#### api/index.php
```php
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

// Obtener URI y método
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remover query string
$uri = parse_url($requestUri, PHP_URL_PATH);
$uri = str_replace('/backend/api', '', $uri);

// Routing
switch (true) {
    // AUTH ROUTES
    case $uri === '/auth/login' && $requestMethod === 'POST':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->login();
        break;

    case $uri === '/auth/me' && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->me();
        break;

    case $uri === '/auth/logout' && $requestMethod === 'POST':
        require_once __DIR__ . '/../controllers/AuthController.php';
        $controller = new AuthController();
        $controller->logout();
        break;

    // USER ROUTES
    case $uri === '/usuarios' && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/UsuarioController.php';
        $controller = new UsuarioController();
        $controller->index();
        break;

    case preg_match('/^\/usuarios\/(\d+)$/', $uri, $matches) && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/UsuarioController.php';
        $controller = new UsuarioController();
        $controller->show((int)$matches[1]);
        break;

    case $uri === '/usuarios' && $requestMethod === 'POST':
        require_once __DIR__ . '/../controllers/UsuarioController.php';
        $controller = new UsuarioController();
        $controller->store();
        break;

    case preg_match('/^\/usuarios\/(\d+)$/', $uri, $matches) && $requestMethod === 'PUT':
        require_once __DIR__ . '/../controllers/UsuarioController.php';
        $controller = new UsuarioController();
        $controller->update((int)$matches[1]);
        break;

    // VIDEO ROUTES
    case $uri === '/videos' && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/VideoController.php';
        $controller = new VideoController();
        $controller->index();
        break;

    case preg_match('/^\/videos\/(\d+)$/', $uri, $matches) && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/VideoController.php';
        $controller = new VideoController();
        $controller->show((int)$matches[1]);
        break;

    case $uri === '/videos' && $requestMethod === 'POST':
        require_once __DIR__ . '/../controllers/VideoController.php';
        $controller = new VideoController();
        $controller->store();
        break;

    // MATERIA ROUTES
    case $uri === '/materias' && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/MateriaController.php';
        $controller = new MateriaController();
        $controller->index();
        break;

    // GRADO ROUTES
    case $uri === '/grados' && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/GradoController.php';
        $controller = new GradoController();
        $controller->index();
        break;

    // TEMA ROUTES
    case $uri === '/temas' && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/TemaController.php';
        $controller = new TemaController();
        $controller->index();
        break;

    // ESTADISTICAS
    case $uri === '/dashboard' && $requestMethod === 'GET':
        require_once __DIR__ . '/../controllers/EstadisticaController.php';
        $controller = new EstadisticaController();
        $controller->dashboard();
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint no encontrado'
        ]);
        break;
}
```

---

## ⚛️ FRONTEND REACT

### Configuración Inicial

#### package.json
```json
{
  "name": "videoteca-sfx",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

#### tailwind.config.js
```javascript
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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'salesiano-azul': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'salesiano-amarillo': {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
    },
  },
  plugins: [],
}
```

### AuthContext (CRÍTICO)

#### context/AuthContext.jsx
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();

          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);

            // Verificar con servidor
            try {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
            } catch (error) {
              console.error('Error al verificar usuario:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { user: loggedUser } = await authService.login(email, password);
      setUser(loggedUser);
      setIsAuthenticated(true);
      return { success: true, user: loggedUser };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Error en el login',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  const hasRole = (role) => {
    return user?.rol === role;
  };

  const isAdmin = () => {
    return hasRole('Administrador');
  };

  const isDocente = () => {
    return hasRole('Docente');
  };

  const isEstudiante = () => {
    return hasRole('Estudiante');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isDocente,
    isEstudiante,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
```

### API Service

#### services/api.js
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

// Interceptor de peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
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

#### services/authService.js
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

export default authService;
```

### App.jsx con Routing

```javascript
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MateriasPage from './pages/MateriasPage';
import CursosPage from './pages/CursosPage';
import DashboardPage from './pages/DashboardPage';
import VideosPage from './pages/VideosPage';
import VideoDetailPage from './pages/VideoDetailPage';
import UploadVideoPage from './pages/UploadVideoPage';
import UsuariosPage from './pages/UsuariosPage';
import EditUserPage from './pages/EditUserPage';
import PerfilPage from './pages/PerfilPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/Common/LoadingSpinner';

const ProtectedRoute = ({ children, requireAdmin = false, requireDocente = false }) => {
  const { isAuthenticated, loading, isAdmin, isDocente } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (requireDocente && !isDocente()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  const hideNavbarRoutes = ['/login'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/materias" element={<MateriasPage />} />
        <Route path="/cursos" element={<CursosPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <VideosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos/:id"
          element={
            <ProtectedRoute>
              <VideoDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute requireDocente>
              <UploadVideoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <PerfilPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas admin */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute requireAdmin>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios/:id/editar"
          element={
            <ProtectedRoute requireAdmin>
              <EditUserPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
```

---

## 🎨 UI/UX Y TEMAS

### ThemeContext para Dark Mode

```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

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

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
};
```

### Navbar con Dark Mode

```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isDocente } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-salesiano-azul-500 to-salesiano-azul-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-8 h-8 text-salesiano-azul-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-white">Videoteca SFX</h1>
              <p className="text-xs text-salesiano-amarillo-300">U.E. San Francisco Xavier</p>
            </div>
          </Link>

          {/* Navegación */}
          {!isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-1">
              <Link to="/materias" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition font-medium">
                Materias
              </Link>
              <Link to="/cursos" className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition font-medium">
                Cursos
              </Link>
            </div>
          )}

          {/* Usuario / Theme */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 hover:bg-white/10 rounded-lg px-3 py-2 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-salesiano-amarillo-400 text-salesiano-azul-900 flex items-center justify-center text-sm font-bold">
                    {user?.nombre?.charAt(0)}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
                    {/* User info */}
                    <div className="bg-gradient-to-br from-salesiano-azul-500 to-salesiano-azul-600 p-5">
                      <p className="text-base font-bold text-white">{user?.nombre}</p>
                      <p className="text-sm text-salesiano-amarillo-300">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20 text-white">
                        {user?.rol}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      <Link
                        to="/dashboard"
                        className="block p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/perfil"
                        className="block p-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/50 transition-all"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Mi Perfil
                      </Link>
                      {isAdmin() && (
                        <Link
                          to="/usuarios"
                          className="block p-3 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/50 transition-all"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Usuarios
                        </Link>
                      )}
                      {isDocente() && (
                        <Link
                          to="/upload"
                          className="block p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Subir Video
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/50 transition-all text-red-600"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## 🔐 FUNCIONALIDADES POR ROL

### Administrador
- ✅ CRUD completo de usuarios (crear, leer, actualizar, eliminar)
- ✅ Asignar múltiples materias y grados a docentes
- ✅ Ver todos los videos del sistema
- ✅ Editar/eliminar cualquier video
- ✅ Estadísticas globales del sistema
- ✅ Dashboard con gráficos de uso
- ✅ Exportar datos y reportes

### Docente
- ✅ Subir videos solo de sus materias y grados asignados
- ✅ Editar/eliminar solo sus propios videos
- ✅ Ver estadísticas de sus videos (visualizaciones, etc.)
- ✅ Dashboard personal con métricas
- ✅ Filtrado automático por asignaciones en formularios

### Estudiante
- ✅ Buscar y filtrar videos por materia, grado, tema
- ✅ Visualizar videos educativos
- ✅ Ver información del docente
- ✅ Acceso a catálogo completo organizado

---

## 📦 CARACTERÍSTICAS ESPECIALES

### Sistema de Asignaciones Múltiples
- Un docente puede tener múltiples materias
- Un docente puede tener múltiples grados
- Tabla `asignaciones` almacena combinaciones materia-grado
- Frontend filtra automáticamente opciones disponibles

### Validaciones de Seguridad
- Docentes solo suben videos de materias/grados asignados
- Verificación en backend antes de crear/editar
- Tokens JWT con expiración
- Refresh tokens para sesiones prolongadas

### UI Responsiva
- Mobile-first design
- Grid adaptativo (1-2-3-4 columnas según pantalla)
- Menú hamburguesa en móvil
- Tarjetas optimizadas para touch

### Dark Mode
- Persistente en localStorage
- Transiciones suaves
- Todos los componentes soportan dark mode
- Toggle en navbar

---

## 🚀 INSTRUCCIONES DE INSTALACIÓN

### Backend
1. Crear base de datos MySQL: `CREATE DATABASE videotecasfx;`
2. Importar schema: `mysql -u root -p videotecasfx < database/schema.sql`
3. Importar datos: `mysql -u root -p videotecasfx < database/seed_data.sql`
4. Configurar `backend/config/database.php` con credenciales
5. Configurar Apache/Nginx con rewrite rules
6. Crear carpetas `backend/uploads/videos` y `backend/uploads/thumbnails` con permisos 755

### Frontend
1. Instalar dependencias: `npm install`
2. Configurar `.env`: `VITE_API_URL=http://localhost/backend/api`
3. Ejecutar desarrollo: `npm run dev`
4. Build para producción: `npm run build`

### Usuario Admin Inicial
- Email: `admin@sfx.edu.bo`
- Password: `Admin123!`

---

## 📝 NOTAS IMPORTANTES

1. **Seguridad:**
   - Cambiar JWT secret key en producción
   - Usar HTTPS en producción
   - Validar todos los uploads de archivos
   - Sanitizar inputs para prevenir SQL injection

2. **Optimización:**
   - Implementar paginación en listados grandes
   - Cachear estadísticas frecuentes
   - Optimizar queries con índices
   - Comprimir videos antes de subir

3. **Escalabilidad:**
   - Considerar CDN para videos
   - Implementar sistema de chunks para uploads grandes
   - Cache de Redis para sesiones
   - Load balancer si crece el tráfico

4. **Mantenimiento:**
   - Sistema de logs detallado
   - Backup automático de base de datos
   - Limpieza de tokens expirados
   - Monitoreo de espacio en disco

---

**FIN DEL PROMPT COMPLETO**

---

**Versión:** 1.0.0
**Última actualización:** 2025-12-22
**Autor:** Sistema Videoteca SFX
**Licencia:** Uso educativo - U.E. San Francisco Xavier
