# Snippets de Base de Datos - Videoteca SFX

Colección de fragmentos de código PHP para operaciones comunes con la base de datos del sistema de Biblioteca Digital de Videos Educativos.

## Tabla de Contenidos

1. [Conexión a la Base de Datos](#conexión-a-la-base-de-datos)
2. [Operaciones CRUD de Videos](#operaciones-crud-de-videos)
3. [Operaciones CRUD de Usuarios](#operaciones-crud-de-usuarios)
4. [Autenticación y Seguridad](#autenticación-y-seguridad)
5. [Búsquedas y Filtros](#búsquedas-y-filtros)
6. [Transacciones](#transacciones)
7. [Estadísticas y Reportes](#estadísticas-y-reportes)
8. [Procedimientos Almacenados](#procedimientos-almacenados)
9. [Vistas](#vistas)
10. [Manejo de Errores](#manejo-de-errores)

---

## Conexión a la Base de Datos

### Obtener instancia de conexión (Singleton)

```php
<?php
require_once __DIR__ . '/config/database.php';

// Obtener instancia única de la base de datos
$database = Database::getInstance();
$conn = $database->getConnection();

// Verificar si la conexión está activa
if ($database->isConnected()) {
    echo "Conexión exitosa";
}
```

### Ejecutar consulta simple

```php
<?php
$database = Database::getInstance();

// Consulta con parámetros
$query = "SELECT * FROM usuarios WHERE email = :email";
$stmt = $database->query($query, [':email' => 'admin@videoteca.edu.bo']);
$result = $stmt->fetch(PDO::FETCH_ASSOC);
```

---

## Operaciones CRUD de Videos

### Crear un nuevo video

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();
$video->titulo = "Introducción a la Física Cuántica";
$video->descripcion = "Video educativo sobre conceptos básicos de física cuántica";
$video->archivo_path = "uploads/videos/fisica-cuantica-2024.mp4";
$video->archivo_nombre = "fisica-cuantica-2024.mp4";
$video->thumbnail_path = "uploads/thumbnails/fisica-cuantica-thumb.jpg";
$video->duracion = 1800; // 30 minutos en segundos
$video->tamanio = 524288000; // 500 MB en bytes
$video->formato = "mp4";
$video->resolucion = "1080p";
$video->codec = "H.264";
$video->tema_id = 15;
$video->materia_id = 3;
$video->grado_id = 5;
$video->docente_id = 10;
$video->estado = "activo";

$videoId = $video->crear();

if ($videoId) {
    echo "Video creado con ID: " . $videoId;
} else {
    echo "Error al crear el video";
}
```

### Obtener videos con filtros

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();

// Filtros opcionales
$filtros = [
    'materia_id' => 3,
    'grado_id' => 5,
    'estado' => 'activo',
    'busqueda' => 'física'
];

$videos = $video->obtenerTodos(
    $filtros,
    $limit = 20,
    $offset = 0,
    $orderBy = 'fecha_subida',
    $orderDir = 'DESC'
);

foreach ($videos as $v) {
    echo "{$v['titulo']} - {$v['materia_nombre']} ({$v['grado_nombre']})\n";
}
```

### Obtener video por ID

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();
$videoData = $video->obtenerPorId(123);

if ($videoData) {
    echo "Título: " . $videoData['titulo'];
    echo "Docente: " . $videoData['docente_nombre'];
    echo "Visualizaciones: " . $videoData['visualizaciones'];
} else {
    echo "Video no encontrado";
}
```

### Actualizar video

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();
$video->id = 123;
$video->titulo = "Física Cuántica - Versión Actualizada";
$video->descripcion = "Video actualizado con nuevos ejemplos";
$video->tema_id = 15;
$video->materia_id = 3;
$video->grado_id = 5;
$video->estado = "activo";

if ($video->actualizar()) {
    echo "Video actualizado exitosamente";
} else {
    echo "Error al actualizar video";
}
```

### Eliminar video (soft delete)

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();

// Soft delete: marca como inactivo
if ($video->eliminar(123)) {
    echo "Video eliminado (marcado como inactivo)";
}

// Hard delete: eliminación permanente
if ($video->eliminarPermanente(123)) {
    echo "Video eliminado permanentemente";
}
```

### Incrementar visualizaciones

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();
$videoId = 123;

if ($video->incrementarVisualizaciones($videoId)) {
    echo "Visualizaciones incrementadas";
}
```

### Buscar videos (FULLTEXT)

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();
$busqueda = "física cuántica";

$resultados = $video->buscar(
    $busqueda,
    $limit = 20,
    $offset = 0,
    $docenteId = null // Opcional: filtrar por docente
);

foreach ($resultados as $v) {
    echo "{$v['titulo']} - Relevancia: {$v['relevancia']}\n";
}
```

### Obtener videos populares

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();
$populares = $video->obtenerMasPopulares(10);

foreach ($populares as $v) {
    echo "{$v['titulo']} - {$v['visualizaciones']} vistas\n";
}
```

### Contar videos

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();
$filtros = ['materia_id' => 3, 'estado' => 'activo'];
$total = $video->contar($filtros);

echo "Total de videos: " . $total;
```

---

## Operaciones CRUD de Usuarios

### Crear un nuevo usuario

```php
<?php
require_once __DIR__ . '/models/Usuario.php';

$usuario = new Usuario();
$usuario->nombre = "Juan";
$usuario->apellido_paterno = "Pérez";
$usuario->apellido_materno = "García";
$usuario->ci = "12345678";
$usuario->email = "juan.perez@videoteca.edu.bo";
$usuario->password = "Mi_Password_Seguro123!";
$usuario->rol_id = 2; // Docente
$usuario->grado_id = 5;
$usuario->materia_id = 3;
$usuario->telefono = "77712345";
$usuario->estado = "activo";

$userId = $usuario->crear();

if ($userId) {
    echo "Usuario creado con ID: " . $userId;
} else {
    echo "Error al crear usuario";
}
```

### Obtener usuario por ID

```php
<?php
require_once __DIR__ . '/models/Usuario.php';

$usuario = new Usuario();
$userData = $usuario->obtenerPorId(10);

if ($userData) {
    echo "Nombre: {$userData['nombre']} {$userData['apellido_paterno']}";
    echo "Email: {$userData['email']}";
    echo "Rol: {$userData['rol_nombre']}";
}
```

### Obtener usuario por email

```php
<?php
require_once __DIR__ . '/models/Usuario.php';

$usuario = new Usuario();
$userData = $usuario->obtenerPorEmail('admin@videoteca.edu.bo');

if ($userData) {
    echo "Usuario encontrado: {$userData['nombre']}";
}
```

### Actualizar usuario

```php
<?php
require_once __DIR__ . '/models/Usuario.php';

$usuario = new Usuario();
$usuario->id = 10;
$usuario->nombre = "Juan Carlos";
$usuario->apellido_paterno = "Pérez";
$usuario->apellido_materno = "García";
$usuario->ci = "12345678";
$usuario->email = "juancarlos.perez@videoteca.edu.bo";
$usuario->rol_id = 2;
$usuario->grado_id = 5;
$usuario->materia_id = 3;
$usuario->telefono = "77712345";
$usuario->estado = "activo";

if ($usuario->actualizar()) {
    echo "Usuario actualizado";
}
```

### Actualizar contraseña

```php
<?php
require_once __DIR__ . '/models/Usuario.php';

$usuario = new Usuario();
$userId = 10;
$newPassword = "Nueva_Password_Segura123!";

if ($usuario->actualizarPassword($userId, $newPassword)) {
    echo "Contraseña actualizada exitosamente";
}
```

---

## Autenticación y Seguridad

### Verificar credenciales de login

```php
<?php
require_once __DIR__ . '/models/Usuario.php';

$usuario = new Usuario();
$email = "admin@videoteca.edu.bo";
$password = "admin123";

// Verificar si el usuario está bloqueado
if ($usuario->estaBloqueado($email)) {
    die("Usuario bloqueado temporalmente. Intente más tarde.");
}

// Verificar password
$userData = $usuario->verificarPassword($email, $password);

if ($userData) {
    // Login exitoso
    $usuario->actualizarUltimoAcceso($userData['id']);

    echo "Login exitoso";
    echo "Usuario: {$userData['nombre']} {$userData['apellido_paterno']}";
    echo "Rol: {$userData['rol_nombre']}";
} else {
    // Login fallido
    $usuario->incrementarIntentosLogin($email);

    // Bloquear después de 5 intentos
    $userData = $usuario->obtenerPorEmail($email);
    if ($userData && $userData['intentos_login'] >= 5) {
        $usuario->bloquearUsuario($email, 15); // 15 minutos
    }

    echo "Credenciales incorrectas";
}
```

### Hash de contraseña (Bcrypt)

```php
<?php
// Al crear usuario, el hash se genera automáticamente en el modelo
// pero si necesitas hacerlo manualmente:

$password = "Mi_Password_Seguro123!";
$hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

echo "Hash: " . $hashedPassword;

// Verificar password
if (password_verify($password, $hashedPassword)) {
    echo "Password correcto";
}
```

### Gestión de tokens de refresh

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

// Guardar token de refresh
function guardarRefreshToken($usuarioId, $token, $ip, $userAgent) {
    global $conn;

    $tokenHash = hash('sha256', $token);
    $expiraEn = date('Y-m-d H:i:s', strtotime('+7 days'));

    $query = "INSERT INTO tokens_refresh
              (usuario_id, token_hash, ip, user_agent, expira_en)
              VALUES (:usuario_id, :token_hash, :ip, :user_agent, :expira_en)";

    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':usuario_id' => $usuarioId,
        ':token_hash' => $tokenHash,
        ':ip' => $ip,
        ':user_agent' => $userAgent,
        ':expira_en' => $expiraEn
    ]);

    return $conn->lastInsertId();
}

// Verificar token de refresh
function verificarRefreshToken($token) {
    global $conn;

    $tokenHash = hash('sha256', $token);

    $query = "SELECT * FROM tokens_refresh
              WHERE token_hash = :token_hash
              AND expira_en > NOW()
              AND revocado = FALSE
              LIMIT 1";

    $stmt = $conn->prepare($query);
    $stmt->execute([':token_hash' => $tokenHash]);

    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Revocar token
function revocarToken($token) {
    global $conn;

    $tokenHash = hash('sha256', $token);

    $query = "UPDATE tokens_refresh
              SET revocado = TRUE
              WHERE token_hash = :token_hash";

    $stmt = $conn->prepare($query);
    return $stmt->execute([':token_hash' => $tokenHash]);
}
```

---

## Búsquedas y Filtros

### Búsqueda avanzada de videos

```php
<?php
require_once __DIR__ . '/models/Video.php';

function buscarVideosAvanzado($criterios) {
    $video = new Video();
    $filtros = [];

    if (isset($criterios['materia_id'])) {
        $filtros['materia_id'] = $criterios['materia_id'];
    }

    if (isset($criterios['grado_id'])) {
        $filtros['grado_id'] = $criterios['grado_id'];
    }

    if (isset($criterios['docente_id'])) {
        $filtros['docente_id'] = $criterios['docente_id'];
    }

    if (isset($criterios['texto'])) {
        $filtros['busqueda'] = $criterios['texto'];
    }

    $limit = $criterios['limit'] ?? 20;
    $offset = $criterios['offset'] ?? 0;
    $orderBy = $criterios['orderBy'] ?? 'fecha_subida';
    $orderDir = $criterios['orderDir'] ?? 'DESC';

    return $video->obtenerTodos($filtros, $limit, $offset, $orderBy, $orderDir);
}

// Uso
$resultados = buscarVideosAvanzado([
    'materia_id' => 3,
    'grado_id' => 5,
    'texto' => 'física',
    'limit' => 10,
    'orderBy' => 'visualizaciones',
    'orderDir' => 'DESC'
]);
```

### Búsqueda de usuarios con filtros

```php
<?php
require_once __DIR__ . '/models/Usuario.php';

$usuario = new Usuario();

$filtros = [
    'rol_id' => 2, // Docentes
    'estado' => 'activo',
    'busqueda' => 'García'
];

$usuarios = $usuario->obtenerTodos($filtros, 50, 0);

foreach ($usuarios as $u) {
    echo "{$u['nombre']} {$u['apellido_paterno']} - {$u['email']}\n";
}
```

---

## Transacciones

### Crear video con reproducción inicial

```php
<?php
require_once __DIR__ . '/config/database.php';

$database = Database::getInstance();
$conn = $database->getConnection();

try {
    // Iniciar transacción
    $database->beginTransaction();

    // Crear video
    $query1 = "INSERT INTO videos (titulo, descripcion, archivo_path, archivo_nombre,
                                   materia_id, grado_id, docente_id, estado)
               VALUES (:titulo, :descripcion, :archivo_path, :archivo_nombre,
                       :materia_id, :grado_id, :docente_id, :estado)";

    $stmt1 = $conn->prepare($query1);
    $stmt1->execute([
        ':titulo' => 'Video de prueba',
        ':descripcion' => 'Descripción del video',
        ':archivo_path' => 'uploads/videos/test.mp4',
        ':archivo_nombre' => 'test.mp4',
        ':materia_id' => 3,
        ':grado_id' => 5,
        ':docente_id' => 10,
        ':estado' => 'activo'
    ]);

    $videoId = $database->lastInsertId();

    // Registrar reproducción inicial
    $query2 = "INSERT INTO reproducciones (video_id, usuario_id, ip_address, tiempo_reproducido)
               VALUES (:video_id, :usuario_id, :ip_address, :tiempo_reproducido)";

    $stmt2 = $conn->prepare($query2);
    $stmt2->execute([
        ':video_id' => $videoId,
        ':usuario_id' => 10,
        ':ip_address' => '192.168.1.100',
        ':tiempo_reproducido' => 0
    ]);

    // Confirmar transacción
    $database->commit();

    echo "Video y reproducción creados exitosamente";

} catch (PDOException $e) {
    // Revertir en caso de error
    $database->rollBack();
    echo "Error en la transacción: " . $e->getMessage();
}
```

### Actualizar múltiples registros en transacción

```php
<?php
require_once __DIR__ . '/config/database.php';

$database = Database::getInstance();

try {
    $database->beginTransaction();

    // Actualizar estado de videos antiguos
    $query1 = "UPDATE videos SET estado = 'inactivo'
               WHERE fecha_subida < DATE_SUB(NOW(), INTERVAL 2 YEAR)";
    $database->query($query1);

    // Registrar en logs
    $query2 = "INSERT INTO logs_sistema (nivel, accion, descripcion)
               VALUES ('info', 'limpieza_videos', 'Videos antiguos marcados como inactivos')";
    $database->query($query2);

    $database->commit();
    echo "Actualización masiva completada";

} catch (PDOException $e) {
    $database->rollBack();
    echo "Error: " . $e->getMessage();
}
```

---

## Estadísticas y Reportes

### Obtener estadísticas por materia

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();
$estadisticas = $video->estadisticasPorMateria();

foreach ($estadisticas as $stat) {
    echo "Materia: {$stat['materia']} ({$stat['sigla']})\n";
    echo "Total Videos: {$stat['total_videos']}\n";
    echo "Visualizaciones: {$stat['total_visualizaciones']}\n";
    echo "Promedio: {$stat['promedio_visualizaciones']}\n";
    echo "---\n";
}
```

### Obtener estadísticas por grado

```php
<?php
require_once __DIR__ . '/models/Video.php';

$video = new Video();
$estadisticas = $video->estadisticasPorGrado();

foreach ($estadisticas as $stat) {
    echo "Grado: {$stat['grado']} (Nivel {$stat['nivel']})\n";
    echo "Total Videos: {$stat['total_videos']}\n";
    echo "Visualizaciones: {$stat['total_visualizaciones']}\n";
    echo "---\n";
}
```

### Registrar reproducción de video

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

function registrarReproduccion($videoId, $usuarioId, $ipAddress, $userAgent, $tiempoReproducido, $porcentajeVisto) {
    global $conn;

    $completado = $porcentajeVisto >= 90;

    $query = "INSERT INTO reproducciones
              (video_id, usuario_id, ip_address, user_agent, tiempo_reproducido,
               porcentaje_visto, completado, fecha_fin)
              VALUES (:video_id, :usuario_id, :ip_address, :user_agent,
                      :tiempo_reproducido, :porcentaje_visto, :completado, NOW())";

    $stmt = $conn->prepare($query);
    return $stmt->execute([
        ':video_id' => $videoId,
        ':usuario_id' => $usuarioId,
        ':ip_address' => $ipAddress,
        ':user_agent' => $userAgent,
        ':tiempo_reproducido' => $tiempoReproducido,
        ':porcentaje_visto' => $porcentajeVisto,
        ':completado' => $completado
    ]);
}

// Uso
registrarReproduccion(
    videoId: 123,
    usuarioId: 10,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    tiempoReproducido: 1500,
    porcentajeVisto: 95.5
);
```

---

## Procedimientos Almacenados

### Llamar procedimiento de estadísticas generales

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$stmt = $conn->query("CALL sp_estadisticas_generales()");
$estadisticas = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Usuarios Activos: {$estadisticas['total_usuarios_activos']}\n";
echo "Videos Activos: {$estadisticas['total_videos_activos']}\n";
echo "Total Reproducciones: {$estadisticas['total_reproducciones']}\n";
echo "Total Visualizaciones: {$estadisticas['total_visualizaciones']}\n";
echo "Materias: {$estadisticas['total_materias']}\n";
echo "Grados: {$estadisticas['total_grados']}\n";
```

### Limpiar tokens expirados

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$stmt = $conn->query("CALL sp_limpiar_tokens_expirados()");
$result = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Tokens eliminados: {$result['tokens_eliminados']}\n";
```

### Buscar videos con procedimiento almacenado

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$materiaId = 3;
$gradoId = 5;
$temaId = null;
$busqueda = 'física';
$limit = 20;
$offset = 0;

$query = "CALL sp_buscar_videos(:materia_id, :grado_id, :tema_id, :busqueda, :limit, :offset)";
$stmt = $conn->prepare($query);
$stmt->execute([
    ':materia_id' => $materiaId,
    ':grado_id' => $gradoId,
    ':tema_id' => $temaId,
    ':busqueda' => $busqueda,
    ':limit' => $limit,
    ':offset' => $offset
]);

$videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

---

## Vistas

### Consultar vista de videos completos

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$query = "SELECT * FROM vista_videos_completos
          WHERE materia_sigla = 'FIS'
          AND grado_nivel = 5
          LIMIT 10";

$stmt = $conn->query($query);
$videos = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($videos as $video) {
    echo "{$video['titulo']} - {$video['docente_nombre']}\n";
}
```

### Consultar vista de videos populares

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$stmt = $conn->query("SELECT * FROM vista_videos_populares");
$populares = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($populares as $video) {
    echo "{$video['titulo']} - {$video['visualizaciones']} vistas\n";
}
```

### Consultar vista de actividad reciente

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$stmt = $conn->query("SELECT * FROM vista_actividad_reciente LIMIT 20");
$actividades = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($actividades as $act) {
    echo "[{$act['nivel']}] {$act['accion']}: {$act['descripcion']} - {$act['usuario']}\n";
}
```

### Consultar vista de docentes con asignaciones

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$stmt = $conn->query("SELECT * FROM vista_docentes_asignaciones WHERE estado = 'activo'");
$docentes = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($docentes as $docente) {
    echo "{$docente['nombre_completo']}\n";
    echo "Materias: {$docente['materias_asignadas']}\n";
    echo "Grados: {$docente['grados_asignados']}\n";
    echo "Total Asignaciones: {$docente['total_asignaciones']}\n";
    echo "---\n";
}
```

---

## Manejo de Errores

### Try-Catch con logging

```php
<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/Video.php';

function operacionSegura() {
    try {
        $video = new Video();
        $resultado = $video->obtenerPorId(999999);

        if (!$resultado) {
            throw new Exception("Video no encontrado");
        }

        return $resultado;

    } catch (PDOException $e) {
        // Error de base de datos
        error_log("Error DB: " . $e->getMessage());
        return ['error' => 'Error en la base de datos'];

    } catch (Exception $e) {
        // Otros errores
        error_log("Error: " . $e->getMessage());
        return ['error' => $e->getMessage()];
    }
}
```

### Registrar errores en logs_sistema

```php
<?php
function registrarErrorEnDB($usuarioId, $accion, $descripcion, $nivel = 'error') {
    $database = Database::getInstance();
    $conn = $database->getConnection();

    $query = "INSERT INTO logs_sistema
              (usuario_id, nivel, accion, descripcion, ip, user_agent)
              VALUES (:usuario_id, :nivel, :accion, :descripcion, :ip, :user_agent)";

    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':usuario_id' => $usuarioId,
        ':nivel' => $nivel,
        ':accion' => $accion,
        ':descripcion' => $descripcion,
        ':ip' => $_SERVER['REMOTE_ADDR'] ?? null,
        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
}

// Uso
try {
    // Operación que puede fallar
    throw new Exception("Error al procesar video");

} catch (Exception $e) {
    registrarErrorEnDB(
        usuarioId: 10,
        accion: 'procesamiento_video',
        descripcion: $e->getMessage(),
        nivel: 'error'
    );
}
```

### Verificar integridad de archivos

```php
<?php
require_once __DIR__ . '/models/Video.php';

function limpiarVideosHuerfanos() {
    $video = new Video();

    try {
        $marcados = $video->marcarVideosHuerfanos();
        echo "Videos huérfanos marcados: " . $marcados;

        // Registrar en logs
        if ($marcados > 0) {
            registrarErrorEnDB(
                usuarioId: null,
                accion: 'limpieza_videos_huerfanos',
                descripcion: "Se marcaron {$marcados} videos sin archivo físico",
                nivel: 'warning'
            );
        }

    } catch (Exception $e) {
        echo "Error al limpiar videos huérfanos: " . $e->getMessage();
    }
}
```

---

## Consultas SQL Directas Útiles

### Obtener conteo de videos por docente

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$query = "SELECT
            u.id,
            CONCAT(u.nombre, ' ', u.apellido_paterno) as nombre_docente,
            COUNT(v.id) as total_videos,
            SUM(v.visualizaciones) as total_visualizaciones
          FROM usuarios u
          LEFT JOIN videos v ON u.id = v.docente_id AND v.estado = 'activo'
          WHERE u.rol_id = 2
          GROUP BY u.id
          ORDER BY total_videos DESC";

$stmt = $conn->query($query);
$estadisticas = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

### Obtener videos subidos en los últimos 7 días

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$query = "SELECT v.*,
                 m.nombre as materia_nombre,
                 g.nombre as grado_nombre,
                 CONCAT(u.nombre, ' ', u.apellido_paterno) as docente_nombre
          FROM videos v
          INNER JOIN materias m ON v.materia_id = m.id
          INNER JOIN grados g ON v.grado_id = g.id
          INNER JOIN usuarios u ON v.docente_id = u.id
          WHERE v.fecha_subida >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND v.estado = 'activo'
          ORDER BY v.fecha_subida DESC";

$stmt = $conn->query($query);
$videosRecientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

### Obtener reproducciones por rango de fechas

```php
<?php
$database = Database::getInstance();
$conn = $database->getConnection();

$fechaInicio = '2024-01-01';
$fechaFin = '2024-12-31';

$query = "SELECT
            DATE(r.fecha_inicio) as fecha,
            COUNT(*) as total_reproducciones,
            COUNT(DISTINCT r.video_id) as videos_unicos,
            COUNT(DISTINCT r.usuario_id) as usuarios_unicos,
            SUM(CASE WHEN r.completado = 1 THEN 1 ELSE 0 END) as completadas
          FROM reproducciones r
          WHERE DATE(r.fecha_inicio) BETWEEN :fecha_inicio AND :fecha_fin
          GROUP BY DATE(r.fecha_inicio)
          ORDER BY fecha DESC";

$stmt = $conn->prepare($query);
$stmt->execute([
    ':fecha_inicio' => $fechaInicio,
    ':fecha_fin' => $fechaFin
]);

$estadisticas = $stmt->fetchAll(PDO::FETCH_ASSOC);
```

---

## Optimización y Performance

### Consulta con índices optimizados

```php
<?php
// Las siguientes consultas están optimizadas gracias a los índices del schema

$database = Database::getInstance();
$conn = $database->getConnection();

// Uso de índice: idx_video_materia_grado_estado
$query = "SELECT * FROM videos
          WHERE materia_id = :materia_id
          AND grado_id = :grado_id
          AND estado = 'activo'";

$stmt = $conn->prepare($query);
$stmt->execute([
    ':materia_id' => 3,
    ':grado_id' => 5
]);
```

### Paginación eficiente

```php
<?php
function obtenerVideosPaginados($pagina = 1, $porPagina = 20, $filtros = []) {
    $offset = ($pagina - 1) * $porPagina;

    $video = new Video();

    // Obtener total de registros
    $total = $video->contar($filtros);

    // Obtener registros de la página actual
    $videos = $video->obtenerTodos($filtros, $porPagina, $offset);

    return [
        'data' => $videos,
        'pagination' => [
            'total' => $total,
            'per_page' => $porPagina,
            'current_page' => $pagina,
            'last_page' => ceil($total / $porPagina)
        ]
    ];
}

// Uso
$resultado = obtenerVideosPaginados(
    pagina: 2,
    porPagina: 20,
    filtros: ['materia_id' => 3]
);
```

---

## Notas de Seguridad

1. **Siempre usar prepared statements** para prevenir SQL Injection
2. **Nunca exponer password_hash** en respuestas de API
3. **Validar y sanitizar** todos los inputs del usuario
4. **Usar transacciones** para operaciones críticas
5. **Implementar rate limiting** en endpoints de autenticación
6. **Registrar intentos fallidos** de login en logs_sistema
7. **Usar HTTPS** en producción
8. **Rotar tokens** de refresh regularmente
9. **Validar permisos** antes de operaciones CRUD
10. **Mantener logs** de todas las operaciones críticas

---

## Variables de Entorno (.env)

```env
# Base de datos
DB_HOST=localhost
DB_NAME=videoteca
DB_USER=root
DB_PASS=

# Aplicación
APP_ENV=development
APP_URL=http://localhost:8000

# JWT
JWT_SECRET=tu_secreto_super_seguro_cambialo_en_produccion
JWT_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800

# Límites
MAX_UPLOAD_SIZE=524288000
ALLOWED_VIDEO_FORMATS=mp4,webm,avi,mov
```

---

## Recursos Adicionales

- **Schema SQL**: `/database/schema.sql`
- **Configuración DB**: `/backend/config/database.php`
- **Modelos**: `/backend/models/`
- **Documentación UML**: `/uml-diagrams-mermaid/`

---

**Autor**: Roger Omar Luna Yujra
**Proyecto**: Sistema de Biblioteca Digital de Videos Educativos
**Institución**: U.E. San Francisco Xavier
**Fecha**: 2024
