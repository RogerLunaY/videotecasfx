-- Script de verificación para el módulo de asignaciones de docentes
-- Ejecutar este script si la página de asignaciones no muestra docentes

-- 1. Verificar que existe la vista vista_docentes_asignaciones
SELECT 'Verificando vista vista_docentes_asignaciones...' AS paso;
SHOW FULL TABLES WHERE Table_type = 'VIEW' AND Tables_in_videotecasfx = 'vista_docentes_asignaciones';

-- 2. Verificar si existen usuarios con rol Docente
SELECT 'Verificando usuarios con rol Docente...' AS paso;
SELECT
    COUNT(*) AS total_docentes,
    SUM(CASE WHEN u.estado = 'activo' THEN 1 ELSE 0 END) AS docentes_activos
FROM usuarios u
INNER JOIN roles r ON u.rol_id = r.id
WHERE r.nombre = 'Docente';

-- 3. Listar todos los docentes
SELECT 'Listado de docentes en el sistema:' AS paso;
SELECT
    u.id,
    CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) AS nombre_completo,
    u.email,
    u.estado,
    r.nombre AS rol
FROM usuarios u
INNER JOIN roles r ON u.rol_id = r.id
WHERE r.nombre = 'Docente';

-- 4. Verificar los roles en la tabla roles
SELECT 'Verificando tabla de roles...' AS paso;
SELECT * FROM roles;

-- 5. Verificar que la vista funciona correctamente
SELECT 'Probando vista vista_docentes_asignaciones...' AS paso;
SELECT * FROM vista_docentes_asignaciones;

-- 6. Si la vista no existe o hay error, recrearla
-- Descomente las siguientes líneas si necesita recrear la vista

/*
DROP VIEW IF EXISTS vista_docentes_asignaciones;

CREATE VIEW vista_docentes_asignaciones AS
SELECT
    u.id AS docente_id,
    u.nombre,
    u.apellido_paterno,
    u.apellido_materno,
    u.email,
    r.nombre AS rol,
    u.estado,
    CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) AS nombre_completo,
    GROUP_CONCAT(DISTINCT CASE WHEN a.tipo = 'materia' THEN m.nombre END ORDER BY m.nombre SEPARATOR ', ') AS materias_asignadas,
    GROUP_CONCAT(DISTINCT CASE WHEN a.tipo = 'materia' THEN m.id END ORDER BY m.nombre SEPARATOR ',') AS materia_ids,
    GROUP_CONCAT(DISTINCT CASE WHEN a.tipo = 'grado' THEN g.nombre END ORDER BY g.orden SEPARATOR ', ') AS grados_asignados,
    GROUP_CONCAT(DISTINCT CASE WHEN a.tipo = 'grado' THEN g.id END ORDER BY g.orden SEPARATOR ',') AS grado_ids,
    COUNT(DISTINCT CASE WHEN a.tipo = 'materia' THEN a.id END) AS total_materias,
    COUNT(DISTINCT CASE WHEN a.tipo = 'grado' THEN a.id END) AS total_grados
FROM usuarios u
INNER JOIN roles r ON u.rol_id = r.id
LEFT JOIN asignaciones a ON u.id = a.docente_id
LEFT JOIN materias m ON a.tipo = 'materia' AND a.recurso_id = m.id
LEFT JOIN grados g ON a.tipo = 'grado' AND a.recurso_id = g.id
WHERE r.nombre = 'Docente'
GROUP BY u.id, u.nombre, u.apellido_paterno, u.apellido_materno, u.email, r.nombre, u.estado;

SELECT 'Vista recreada exitosamente' AS resultado;
*/
