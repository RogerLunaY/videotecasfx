-- =====================================================
-- TABLA: docente_materias
-- Descripción: Asignación de materias a docentes
-- Relación N:M entre usuarios(docentes) y materias
-- =====================================================
CREATE TABLE IF NOT EXISTS docente_materias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    docente_id INT UNSIGNED NOT NULL,
    materia_id INT UNSIGNED NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INT UNSIGNED COMMENT 'Admin que realizó la asignación',

    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL,

    UNIQUE KEY unique_docente_materia (docente_id, materia_id),
    INDEX idx_docente (docente_id),
    INDEX idx_materia (materia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignación de materias a docentes';

-- =====================================================
-- TABLA: docente_grados
-- Descripción: Asignación de grados/cursos a docentes
-- Relación N:M entre usuarios(docentes) y grados
-- =====================================================
CREATE TABLE IF NOT EXISTS docente_grados (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    docente_id INT UNSIGNED NOT NULL,
    grado_id INT UNSIGNED NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INT UNSIGNED COMMENT 'Admin que realizó la asignación',

    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL,

    UNIQUE KEY unique_docente_grado (docente_id, grado_id),
    INDEX idx_docente (docente_id),
    INDEX idx_grado (grado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Asignación de grados a docentes';

-- =====================================================
-- VISTA: vista_docentes_asignaciones
-- Descripción: Vista completa de docentes con sus asignaciones
-- =====================================================
CREATE OR REPLACE VIEW vista_docentes_asignaciones AS
SELECT
    u.id AS docente_id,
    u.nombre,
    u.apellido_paterno,
    u.apellido_materno,
    u.email,
    u.rol,
    u.estado,
    CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) AS nombre_completo,
    GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') AS materias_asignadas,
    GROUP_CONCAT(DISTINCT m.id ORDER BY m.nombre SEPARATOR ',') AS materia_ids,
    GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.orden SEPARATOR ', ') AS grados_asignados,
    GROUP_CONCAT(DISTINCT g.id ORDER BY g.orden SEPARATOR ',') AS grado_ids,
    COUNT(DISTINCT dm.materia_id) AS total_materias,
    COUNT(DISTINCT dg.grado_id) AS total_grados
FROM usuarios u
LEFT JOIN docente_materias dm ON u.id = dm.docente_id
LEFT JOIN materias m ON dm.materia_id = m.id
LEFT JOIN docente_grados dg ON u.id = dg.docente_id
LEFT JOIN grados g ON dg.grado_id = g.id
WHERE u.rol = 'Docente'
GROUP BY u.id;
