-- Migración: Actualizar procedimiento almacenado sp_estadisticas_generales
-- Fecha: 2025-11-28
-- Descripción: Añade total_docentes y espacio_usado, corrige nombre de total_videos

-- Eliminar el procedimiento existente
DROP PROCEDURE IF EXISTS sp_estadisticas_generales;

-- Crear el procedimiento actualizado
DELIMITER $$
CREATE PROCEDURE sp_estadisticas_generales()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM usuarios WHERE estado = 'activo') AS total_usuarios_activos,
        (SELECT COUNT(*) FROM videos WHERE estado = 'activo') AS total_videos,
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'Docente' AND estado = 'activo') AS total_docentes,
        (SELECT COUNT(*) FROM reproducciones) AS total_reproducciones,
        (SELECT SUM(visualizaciones) FROM videos) AS total_visualizaciones,
        (SELECT COALESCE(SUM(tamano_archivo), 0) FROM videos WHERE estado = 'activo') AS espacio_usado,
        (SELECT COUNT(*) FROM materias WHERE estado = 'activo') AS total_materias,
        (SELECT COUNT(*) FROM grados WHERE estado = 'activo') AS total_grados;
END$$
DELIMITER ;
