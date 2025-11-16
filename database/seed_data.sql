-- =====================================================
-- Datos de Prueba para Sistema de Biblioteca Digital
-- Unidad Educativa San Francisco Xavier
-- =====================================================

USE videoteca_sfx;

-- =====================================================
-- INSERTAR ROLES
-- =====================================================
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
), 'Gestión de contenido educativo propio');

-- =====================================================
-- INSERTAR GRADOS (Secundaria Boliviana)
-- =====================================================
INSERT INTO grados (nombre, nivel, sigla, descripcion, orden) VALUES
('Primero de Secundaria', 1, '1RO SEC', 'Primer año del nivel secundario', 1),
('Segundo de Secundaria', 2, '2DO SEC', 'Segundo año del nivel secundario', 2),
('Tercero de Secundaria', 3, '3RO SEC', 'Tercer año del nivel secundario', 3),
('Cuarto de Secundaria', 4, '4TO SEC', 'Cuarto año del nivel secundario', 4),
('Quinto de Secundaria', 5, '5TO SEC', 'Quinto año del nivel secundario', 5),
('Sexto de Secundaria', 6, '6TO SEC', 'Sexto año del nivel secundario (Bachillerato)', 6);

-- =====================================================
-- INSERTAR MATERIAS (Currículo Boliviano)
-- =====================================================
INSERT INTO materias (nombre, sigla, descripcion, color, icono) VALUES
('Matemática', 'MAT', 'Ciencias exactas y razonamiento lógico', '#3B82F6', 'calculator'),
('Lenguaje y Comunicación', 'LYC', 'Lengua española y literatura', '#10B981', 'book'),
('Ciencias Naturales: Biología', 'BIO', 'Estudio de los seres vivos', '#22C55E', 'leaf'),
('Ciencias Naturales: Física', 'FIS', 'Estudio de las leyes físicas', '#6366F1', 'atom'),
('Ciencias Naturales: Química', 'QUI', 'Estudio de la materia y sus transformaciones', '#8B5CF6', 'flask'),
('Ciencias Sociales', 'SOC', 'Historia, geografía y civismo', '#F59E0B', 'globe'),
('Inglés', 'ING', 'Lengua extranjera', '#EF4444', 'language'),
('Educación Física', 'EDF', 'Desarrollo físico y deportivo', '#EC4899', 'dumbbell'),
('Artes Plásticas', 'ART', 'Expresión artística y visual', '#F97316', 'palette'),
('Música', 'MUS', 'Educación musical', '#14B8A6', 'music'),
('Técnica Tecnológica', 'TEC', 'Tecnología y computación', '#06B6D4', 'laptop'),
('Valores, Espiritualidad y Religiones', 'VER', 'Formación en valores', '#84CC16', 'heart');

-- =====================================================
-- INSERTAR TEMAS (Ejemplos por materia)
-- =====================================================
INSERT INTO temas (nombre, nombre_corto, materia_id, orden) VALUES
-- Matemática
('Álgebra Básica', 'Álgebra', 1, 1),
('Geometría Plana', 'Geometría', 1, 2),
('Trigonometría', 'Trigonometría', 1, 3),
('Cálculo Diferencial', 'Cálculo', 1, 4),
('Estadística y Probabilidad', 'Estadística', 1, 5),

-- Lenguaje y Comunicación
('Gramática y Sintaxis', 'Gramática', 2, 1),
('Literatura Latinoamericana', 'Literatura', 2, 2),
('Comprensión Lectora', 'Comprensión', 2, 3),
('Redacción y Composición', 'Redacción', 2, 4),

-- Biología
('La Célula', 'Célula', 3, 1),
('Genética', 'Genética', 3, 2),
('Ecología', 'Ecología', 3, 3),
('Anatomía Humana', 'Anatomía', 3, 4),

-- Física
('Mecánica Clásica', 'Mecánica', 4, 1),
('Termodinámica', 'Termodinámica', 4, 2),
('Electricidad y Magnetismo', 'Electricidad', 4, 3),
('Óptica', 'Óptica', 4, 4),

-- Química
('Tabla Periódica', 'Tabla Periódica', 5, 1),
('Enlaces Químicos', 'Enlaces', 5, 2),
('Reacciones Químicas', 'Reacciones', 5, 3),
('Química Orgánica', 'Orgánica', 5, 4),

-- Ciencias Sociales
('Historia de Bolivia', 'Historia Bolivia', 6, 1),
('Geografía Mundial', 'Geografía', 6, 2),
('Constitución Política', 'Constitución', 6, 3),
('Culturas Originarias', 'Culturas', 6, 4);

-- =====================================================
-- INSERTAR USUARIOS
-- =====================================================
-- Password para todos: "Password123!" (hasheado con bcrypt costo 12)
-- Hash generado: $2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u

-- Administrador del sistema
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, ci, email, password_hash, rol_id, telefono, estado) VALUES
('Vladimir', 'Mamani', 'Quispe', '1234567', 'vladimir.mamani@atsi.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 1, '71234567', 'activo'),
('Grethel', 'Alvarez', 'Mamani', '2345678', 'grethel.alvarez@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 1, '72345678', 'activo');

-- Docentes
INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, ci, email, password_hash, rol_id, grado_id, materia_id, telefono, estado) VALUES
-- Docentes de Matemática
('Juan', 'Pérez', 'García', '3456789', 'juan.perez@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 1, 1, '73456789', 'activo'),
('María', 'López', 'Fernández', '4567890', 'maria.lopez@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 4, 1, '74567890', 'activo'),

-- Docentes de Lenguaje
('Carlos', 'Mamani', 'Condori', '5678901', 'carlos.mamani@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 2, 2, '75678901', 'activo'),
('Ana', 'Quispe', 'Flores', '6789012', 'ana.quispe@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 5, 2, '76789012', 'activo'),

-- Docentes de Ciencias Naturales
('Roberto', 'Choque', 'Luna', '7890123', 'roberto.choque@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 3, 3, '77890123', 'activo'),
('Patricia', 'Alanoca', 'Ticona', '8901234', 'patricia.alanoca@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 3, 4, '78901234', 'activo'),
('Jorge', 'Apaza', 'Condori', '9012345', 'jorge.apaza@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 4, 5, '79012345', 'activo'),

-- Docentes de otras materias
('Luis', 'Huanca', 'Marca', '1023456', 'luis.huanca@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 2, 6, '71023456', 'activo'),
('Sandra', 'Callisaya', 'Nina', '2034567', 'sandra.callisaya@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 1, 7, '72034567', 'activo'),
('Miguel', 'Ticona', 'Pari', '3045678', 'miguel.ticona@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 5, 11, '73045678', 'activo');

-- =====================================================
-- INSERTAR VIDEOS DE PRUEBA
-- =====================================================
-- Nota: Los archivos deben ser subidos manualmente al servidor
-- Estos registros simulan videos ya procesados

INSERT INTO videos (titulo, descripcion, archivo_path, archivo_nombre, thumbnail_path, duracion, tamanio, formato, resolucion, codec, tema_id, materia_id, grado_id, docente_id, visualizaciones, estado) VALUES

-- Matemática - Grado 1
('Introducción al Álgebra', 'Conceptos básicos de álgebra para primer año de secundaria', 'uploads/videos/matematica/1ro/intro_algebra.mp4', 'intro_algebra.mp4', 'uploads/thumbnails/intro_algebra.jpg', 1200, 52428800, 'mp4', '720p', 'h264', 1, 1, 1, 3, 45, 'activo'),
('Suma y Resta de Polinomios', 'Operaciones básicas con expresiones algebraicas', 'uploads/videos/matematica/1ro/suma_polinomios.mp4', 'suma_polinomios.mp4', 'uploads/thumbnails/suma_polinomios.jpg', 900, 41943040, 'mp4', '720p', 'h264', 1, 1, 1, 3, 38, 'activo'),
('Geometría: Ángulos', 'Clasificación y medición de ángulos', 'uploads/videos/matematica/1ro/angulos.mp4', 'angulos.mp4', 'uploads/thumbnails/angulos.jpg', 1080, 48234496, 'mp4', '720p', 'h264', 2, 1, 1, 3, 52, 'activo'),

-- Matemática - Grado 4
('Ecuaciones Cuadráticas', 'Resolución de ecuaciones de segundo grado', 'uploads/videos/matematica/4to/ecuaciones_cuadraticas.mp4', 'ecuaciones_cuadraticas.mp4', 'uploads/thumbnails/ecuaciones_cuadraticas.jpg', 1500, 62914560, 'mp4', '1080p', 'h264', 1, 1, 4, 4, 67, 'activo'),
('Funciones Trigonométricas', 'Introducción a seno, coseno y tangente', 'uploads/videos/matematica/4to/funciones_trig.mp4', 'funciones_trig.mp4', 'uploads/thumbnails/funciones_trig.jpg', 1350, 58720256, 'mp4', '1080p', 'h264', 3, 1, 4, 4, 71, 'activo'),

-- Lenguaje - Grado 2
('El Verbo y sus Tiempos', 'Conjugación verbal en español', 'uploads/videos/lenguaje/2do/verbos.mp4', 'verbos.mp4', 'uploads/thumbnails/verbos.jpg', 1020, 45088768, 'mp4', '720p', 'h264', 6, 2, 2, 5, 43, 'activo'),
('Literatura: El Cuento', 'Estructura y elementos del cuento literario', 'uploads/videos/lenguaje/2do/el_cuento.mp4', 'el_cuento.mp4', 'uploads/thumbnails/el_cuento.jpg', 1140, 49283072, 'mp4', '720p', 'h264', 7, 2, 2, 5, 56, 'activo'),

-- Lenguaje - Grado 5
('Análisis Literario', 'Técnicas de análisis de textos literarios', 'uploads/videos/lenguaje/5to/analisis_literario.mp4', 'analisis_literario.mp4', 'uploads/thumbnails/analisis_literario.jpg', 1320, 57671680, 'mp4', '720p', 'h264', 7, 2, 5, 6, 39, 'activo'),
('Redacción de Ensayos', 'Estructura y técnicas para escribir ensayos', 'uploads/videos/lenguaje/5to/ensayos.mp4', 'ensayos.mp4', 'uploads/thumbnails/ensayos.jpg', 1260, 54525952, 'mp4', '720p', 'h264', 8, 2, 5, 6, 47, 'activo'),

-- Biología - Grado 3
('La Célula Eucariota', 'Estructura y función de las células eucariotas', 'uploads/videos/biologia/3ro/celula_eucariota.mp4', 'celula_eucariota.mp4', 'uploads/thumbnails/celula_eucariota.jpg', 1440, 62914560, 'mp4', '1080p', 'h264', 9, 3, 3, 7, 84, 'activo'),
('Mitosis y Meiosis', 'Procesos de división celular', 'uploads/videos/biologia/3ro/mitosis_meiosis.mp4', 'mitosis_meiosis.mp4', 'uploads/thumbnails/mitosis_meiosis.jpg', 1560, 67108864, 'mp4', '1080p', 'h264', 9, 3, 3, 7, 92, 'activo'),
('Leyes de Mendel', 'Genética básica y herencia', 'uploads/videos/biologia/3ro/mendel.mp4', 'mendel.mp4', 'uploads/thumbnails/mendel.jpg', 1380, 59768832, 'mp4', '1080p', 'h264', 10, 3, 3, 7, 78, 'activo'),

-- Física - Grado 3
('Leyes de Newton', 'Las tres leyes fundamentales de la mecánica', 'uploads/videos/fisica/3ro/newton.mp4', 'newton.mp4', 'uploads/thumbnails/newton.jpg', 1500, 62914560, 'mp4', '1080p', 'h264', 13, 4, 3, 8, 95, 'activo'),
('Movimiento Rectilíneo Uniforme', 'Cinemática del movimiento en línea recta', 'uploads/videos/fisica/3ro/mru.mp4', 'mru.mp4', 'uploads/thumbnails/mru.jpg', 1200, 52428800, 'mp4', '1080p', 'h264', 13, 4, 3, 8, 81, 'activo'),

-- Química - Grado 4
('La Tabla Periódica', 'Organización de los elementos químicos', 'uploads/videos/quimica/4to/tabla_periodica.mp4', 'tabla_periodica.mp4', 'uploads/thumbnails/tabla_periodica.jpg', 1350, 58720256, 'mp4', '1080p', 'h264', 17, 5, 4, 9, 73, 'activo'),
('Enlaces Iónicos y Covalentes', 'Tipos de enlaces químicos', 'uploads/videos/quimica/4to/enlaces.mp4', 'enlaces.mp4', 'uploads/thumbnails/enlaces.jpg', 1440, 62914560, 'mp4', '1080p', 'h264', 18, 5, 4, 9, 68, 'activo'),

-- Ciencias Sociales - Grado 2
('Independencia de Bolivia', 'Historia de la independencia boliviana', 'uploads/videos/sociales/2do/independencia.mp4', 'independencia.mp4', 'uploads/thumbnails/independencia.jpg', 1620, 69206016, 'mp4', '720p', 'h264', 21, 6, 2, 10, 61, 'activo'),
('Geografía de Bolivia', 'Regiones geográficas de Bolivia', 'uploads/videos/sociales/2do/geografia_bolivia.mp4', 'geografia_bolivia.mp4', 'uploads/thumbnails/geografia_bolivia.jpg', 1380, 59768832, 'mp4', '720p', 'h264', 22, 6, 2, 10, 54, 'activo'),

-- Inglés - Grado 1
('Present Simple Tense', 'Tiempo presente simple en inglés', 'uploads/videos/ingles/1ro/present_simple.mp4', 'present_simple.mp4', 'uploads/thumbnails/present_simple.jpg', 960, 41943040, 'mp4', '720p', 'h264', NULL, 7, 1, 11, 49, 'activo'),
('Basic Vocabulary', 'Vocabulario básico en inglés', 'uploads/videos/ingles/1ro/vocabulary.mp4', 'vocabulary.mp4', 'uploads/thumbnails/vocabulary.jpg', 840, 37748736, 'mp4', '720p', 'h264', NULL, 7, 1, 11, 42, 'activo'),

-- Técnica Tecnológica - Grado 5
('Introducción a la Programación', 'Conceptos básicos de programación', 'uploads/videos/tecnologia/5to/intro_programacion.mp4', 'intro_programacion.mp4', 'uploads/thumbnails/intro_programacion.jpg', 1680, 71303168, 'mp4', '1080p', 'h264', NULL, 11, 5, 12, 88, 'activo'),
('Algoritmos y Diagramas de Flujo', 'Lógica algorítmica básica', 'uploads/videos/tecnologia/5to/algoritmos.mp4', 'algoritmos.mp4', 'uploads/thumbnails/algoritmos.jpg', 1560, 67108864, 'mp4', '1080p', 'h264', NULL, 11, 5, 12, 76, 'activo');

-- =====================================================
-- INSERTAR REPRODUCCIONES DE PRUEBA
-- =====================================================
-- Simulando actividad de estudiantes anónimos

INSERT INTO reproducciones (video_id, usuario_id, ip_address, tiempo_reproducido, porcentaje_visto, completado, fecha_inicio, fecha_fin) VALUES
-- Video 1: Introducción al Álgebra
(1, NULL, '192.168.1.101', 1200, 100.00, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, NULL, '192.168.1.102', 850, 70.83, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, NULL, '192.168.1.103', 1200, 100.00, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Video 10: La Célula Eucariota (el más visto)
(10, NULL, '192.168.1.104', 1440, 100.00, TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, NULL, '192.168.1.105', 1380, 95.83, TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, NULL, '192.168.1.106', 1200, 83.33, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(10, NULL, '192.168.1.107', 1440, 100.00, TRUE, NOW(), NOW()),

-- Video 13: Leyes de Newton
(13, NULL, '192.168.1.108', 1500, 100.00, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
(13, NULL, '192.168.1.109', 1450, 96.67, TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Más reproducciones para otros videos
(5, NULL, '192.168.1.110', 1350, 100.00, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, NULL, '192.168.1.111', 1020, 89.47, FALSE, NOW(), NOW()),
(11, NULL, '192.168.1.112', 1560, 100.00, TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),
(15, NULL, '192.168.1.113', 1350, 100.00, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(19, NULL, '192.168.1.114', 960, 100.00, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =====================================================
-- INSERTAR ESTADÍSTICAS INICIALES
-- =====================================================

INSERT INTO estadisticas (tipo, categoria, datos_json, fecha_referencia) VALUES
('general', 'resumen', JSON_OBJECT(
    'total_videos', 20,
    'total_docentes', 10,
    'total_reproducciones', 15,
    'materia_mas_popular', 'Biología',
    'grado_mas_activo', '3ro'
), CURDATE());

-- =====================================================
-- INFORMACIÓN DE CREDENCIALES
-- =====================================================

-- CREDENCIALES DE ACCESO (para desarrollo/testing):
--
-- ADMINISTRADORES:
-- Email: vladimir.mamani@atsi.edu.bo | Password: Password123!
-- Email: grethel.alvarez@sfx.edu.bo  | Password: Password123!
--
-- DOCENTES (todos con password: Password123!):
-- juan.perez@sfx.edu.bo (Matemática - 1ro)
-- maria.lopez@sfx.edu.bo (Matemática - 4to)
-- carlos.mamani@sfx.edu.bo (Lenguaje - 2do)
-- ana.quispe@sfx.edu.bo (Lenguaje - 5to)
-- roberto.choque@sfx.edu.bo (Biología - 3ro)
-- patricia.alanoca@sfx.edu.bo (Física - 3ro)
-- jorge.apaza@sfx.edu.bo (Química - 4to)
-- luis.huanca@sfx.edu.bo (Ciencias Sociales - 2do)
-- sandra.callisaya@sfx.edu.bo (Inglés - 1ro)
-- miguel.ticona@sfx.edu.bo (Técnica Tecnológica - 5to)

SELECT '=============================================' AS '';
SELECT 'Base de datos inicializada correctamente' AS 'ESTADO';
SELECT '=============================================' AS '';
SELECT 'Usuarios creados: 12 (2 administradores, 10 docentes)' AS 'INFO';
SELECT 'Videos de prueba: 20' AS 'INFO';
SELECT 'Password por defecto: Password123!' AS 'INFO';
SELECT '=============================================' AS '';
