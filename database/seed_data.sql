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
-- INSERTAR CAMPOS (Campos de Saberes y Conocimientos - Currículo Boliviano)
-- =====================================================
INSERT INTO campos (id, nombre, descripcion, color, icono, orden) VALUES
(1, 'Vida Tierra Territorio', 'Ordena los conocimientos en función de la recuperación del sentido de la vida con la Madre Tierra, orienta hacia una relación armónica y complementaria entre el ser humano y la naturaleza.', '#22C55E', 'tree', 1),
(2, 'Ciencia, Tecnología y Producción', 'Está orientado a que las disciplinas coadyuven a romper la dependencia económica de un nuevo país intentando adaptar, potenciar y producir tecnologías propias que permitan la transformación de la matriz productiva.', '#3B82F6', 'cog', 2),
(3, 'Comunidad y Sociedad', 'Está orientada a recuperar la vida comunitaria y sus valores para contrarrestar la tendencia individualista, promoviendo el desarrollo de identidades culturales y la convivencia armónica.', '#F59E0B', 'users', 3),
(4, 'Cosmos y Pensamiento', 'Construye a la descolonización de la mentalidad colonizada incorporando una visión intercultural de mutuo aprendizaje desde los saberes y conocimientos propios de las naciones indígena originarias.', '#8B5CF6', 'star', 4);

-- =====================================================
-- INSERTAR MATERIAS (Currículo Boliviano por Campos de Saberes)
-- =====================================================
INSERT INTO materias (id, campo_id, nombre, sigla, descripcion, color, icono) VALUES
-- Campo: Vida Tierra Territorio
(1, 1, 'Biología - Geografía', 'BIO-GEO', 'El Campo de Saberes y Conocimientos de Vida Tierra Territorio concreta procesos educativos que permiten a estudiantes comprender la relación del ser humano con la naturaleza y el territorio.', '#22C55E', 'leaf'),
(2, 1, 'Ciencias Naturales: Física', 'FIS', 'El estudio de la Física debe promover un pensamiento fenomenológico de los procesos naturales, desarrollando capacidades de observación, análisis y experimentación científica.', '#6366F1', 'atom'),
(3, 1, 'Ciencias Naturales: Química', 'QUI', 'La Química es complementaria a otras ciencias y enfatiza la trasformación de la materia desde una perspectiva de respeto al medio ambiente y desarrollo sustentable.', '#8B5CF6', 'flask'),

-- Campo: Ciencia, Tecnología y Producción
(4, 2, 'Matemática', 'MAT', 'En el marco del Modelo Educativo Sociocomunitario Productivo, la matemática está orientada a la aplicación práctica en la resolución de problemas de la vida cotidiana y el desarrollo productivo.', '#3B82F6', 'calculator'),
(5, 2, 'Técnica Tecnológica General', 'TTG', 'El área Técnica Tecnológica tiene enfoque: productivo, emprendimiento comunitario, tecnológico y socioambiental. Desarrolla capacidades técnicas y tecnológicas en los estudiantes.', '#06B6D4', 'laptop'),

-- Campo: Comunidad y Sociedad
(6, 3, 'Comunicación y Lenguajes: Lengua Castellana', 'LC', 'Es comunicativo dialógico porque promueve el intercambio de mensajes, saberes y conocimientos entre personas, culturas y con la naturaleza a partir del uso de la lengua castellana.', '#10B981', 'book'),
(7, 3, 'Comunicación y Lenguajes: Lengua Originaria', 'LO', 'Es comunicativo dialógico porque se promueve el intercambio de mensajes, saberes y conocimientos desde las lenguas originarias, fortaleciendo la identidad cultural.', '#059669', 'book-open'),
(8, 3, 'Lengua Extranjera', 'LEX', 'Es comunicativo dialógico porque se promueve el intercambio de mensajes a nivel internacional, desarrollando capacidades comunicativas en inglés u otra lengua extranjera.', '#EF4444', 'language'),
(9, 3, 'Ciencias Sociales', 'CSO', 'El enfoque del Área es descolonizador, crítico y propositivo. Desarrolla el análisis de procesos históricos, geográficos, políticos y sociales desde una perspectiva plurinacional.', '#F59E0B', 'globe'),
(10, 3, 'Artes Plásticas y Visuales', 'APV', 'Cultural emancipadora, creativo sensibilizador, tecnológico emprendedor. Desarrolla capacidades artísticas y estéticas desde las artes visuales y plásticas.', '#F97316', 'palette'),
(11, 3, 'Educación Musical', 'EMU', 'Expresivo, creativo, vivencial, productivo. Desarrolla capacidades de apreciación, creación e interpretación musical desde diversas culturas.', '#14B8A6', 'music'),
(12, 3, 'Educación Física y Deportes', 'EFD', 'Vivencial, expresivo, creativo, técnico. Promueve el desarrollo físico, la salud integral y la práctica deportiva comunitaria.', '#EC4899', 'dumbbell'),

-- Campo: Cosmos y Pensamiento
(13, 4, 'Cosmovisiones Filosofía y Sicología', 'CFS', 'Crítico, dialógico. Desarrolla el pensamiento filosófico, sicológico y cosmogónico desde las cosmovisiones de los pueblos y naciones indígena originarias.', '#8B5CF6', 'brain'),
(14, 4, 'Valores Espiritualidad y Religiones', 'VER', 'Crítico, dialógico. Promueve el desarrollo espiritual, ético y moral desde el respeto a las diferentes expresiones religiosas y espirituales.', '#84CC16', 'heart');

-- =====================================================
-- INSERTAR TEMAS (Currículo Boliviano por Materia y Grado)
-- =====================================================
-- NOTA: Los temas están organizados por materia_id y grado_id
-- debido a limitaciones de espacio, se incluye un subconjunto representativo
-- El archivo completo con todos los temas (~600) debe importarse por separado
INSERT INTO temas (nombre, materia_id, grado_id, orden) VALUES

-- Biología - Geografía (materia_id: 1) - Grado 1
('ASTRONOMÍA: NUESTRO LUGAR EN EL UNIVERSO', 1, 1, 1),
('LA BIOLOGÍA COMO CIENCIA EN LA VIDA Y PARA LA VIDA', 1, 1, 2),
('LA CÉLULA: UNIDAD ANATÓMICA, FUNCIONAL Y GENÉTICA PARA LA PRESERVACIÓN DE LA VIDA', 1, 1, 3),
('SEXUALIDAD HUMANA INTEGRAL Y HOLÍSTICA', 1, 1, 4),
('LA QUÍMICA EN ARMONÍA CON LA VIDA Y LA MADRE TIERRA', 1, 1, 5),
('MATEMÁTICA APLICADA A LAS CIENCIAS NATURALES', 1, 1, 6),
('ESTUDIO DE LOS SUELOS EN LA MADRE TIERRA: GEOLOGÍA', 1, 1, 7),
('ECOLOGÍA: RELACIONES DE INTERDEPENDENCIA EN LA MADRE TIERRA', 1, 1, 8),
('LA DIVERSIDAD DE SERES VIVOS QUE HABITAN EN LA MADRE TIERRA', 1, 1, 9),
('TRANSFORMACIÓN QUÍMICA Y SUSTENTABLE DE LA MATERIA', 1, 1, 10),

-- Física (materia_id: 2) - Grado 3
('MATEMÁTICA APLICADA A LA FÍSICA EN MEDICIONES', 2, 3, 11),
('MEDICIONES Y ERRORES EN LAS EXPERIENCIAS PRODUCTIVAS', 2, 3, 12),
('EXPERIENCIA PRÁCTICA PRODUCTIVA', 2, 3, 13),
('TRIGONOMETRÍA BÁSICA APLICADA A LA FÍSICA', 2, 3, 14),
('ANÁLISIS VECTORIAL I (MÉTODOS GRÁFICOS)', 2, 3, 15),
('ANÁLISIS VECTORIAL II (MÉTODOS ANALÍTICOS)', 2, 3, 16),
('ONDAS', 2, 3, 17),
('ÓPTICA GEOMÉTRICA', 2, 3, 18),
('CALOR Y TEMPERATURA', 2, 3, 19),

-- Química (materia_id: 3) - Grado 3
('NOTACIÓN Y NOMENCLATURA DE COMPUESTOS BINARIOS OXIGENADOS E HIDROGENADOS DE USO TECNOLÓGICO E INDUSTRIAL', 3, 3, 20),
('NOTACIÓN Y NOMENCLATURA DE COMPUESTOS TERNARIOS BÁSICOS Y ÁCIDOS DE USO TECNOLÓGICO E INDUSTRIAL', 3, 3, 21),
('NOTACIÓN Y NOMENCLATURA DE SALES INORGÁNICAS DE USO TECNOLÓGICO E INDUSTRIAL', 3, 3, 22),

-- Matemática (materia_id: 4) - Grado 1
('NÚMEROS ENTEROS APLICADOS A LA COTIDIANIDAD', 4, 1, 23),
('LOS NÚMEROS ENTEROS Y SU RELACIÓN CON LA GEOMETRÍA', 4, 1, 24),
('REPRESENTACIÓN GRÁFICA DE LAS FORMAS EN EL PLANO CARTESIANO', 4, 1, 25),
('NÚMEROS RACIONALES EN LA COMUNIDAD', 4, 1, 26),
('NÚMEROS DECIMALES COMO CONSECUENCIA DE LOS RACIONALES', 4, 1, 27),
('RAZONES, PROPORCIONES Y REGLA DE TRES APLICADOS A LA COMUNIDAD', 4, 1, 28),
('LA FORMA, EL NÚMERO Y LA SEMEJANZA DE LA GEOMETRÍA EN LA COMUNIDAD', 4, 1, 29),
('PERÍMETROS, ÁREAS Y FORMAS GEOMÉTRICAS APLICADAS EN LA VIDA COTIDIANA', 4, 1, 30),
('LABORATORIO MATEMÁTICO', 4, 1, 31),

-- Técnica Tecnológica (materia_id: 5) - Grado 1
('LA OFIMÁTICA COMO HERRAMIENTA PRODUCTIVA', 5, 1, 32),
('TÉCNICAS Y TECNOLOGÍAS PROPIAS Y DE LA DIVERSIDAD CULTURAL', 5, 1, 33),
('PROPIEDADES DE LOS MATERIALES Y SUS PROCESOS DE TRANSFORMACIÓN', 5, 1, 34),
('LAS HERRAMIENTAS, EQUIPOS, MECANISMOS Y MÁQUINAS', 5, 1, 35),
('LECTURA Y ANÁLISIS DE OBJETOS TECNOLÓGICOS', 5, 1, 36),

-- Lengua Castellana (materia_id: 6) - Grado 1
('LA COMUNICACIÓN EFECTIVA Y EL LENGUAJE COMO INSTRUMENTO PARA PROMOVER LA CULTURA DE LA PAZ', 6, 1, 37),
('ORALIDAD Y LITERATURA DEL ESTADO PLURINACIONAL DE BOLIVIA', 6, 1, 38),
('LECTURA E INTERPRETACIÓN DEL LENGUAJE VERBAL Y NO VERBAL EN NUESTRO CONTEXTO PARA PROMOVER LA DESPATRIARCALIZACIÓN', 6, 1, 39),

-- Lengua Originaria (materia_id: 7) - Grado 1
('Comunicación dialógica: saludos y despedidas', 7, 1, 40),
('Actividades laborales de nuestra familia', 7, 1, 41),
('Ubicación espacial de animales, familia y objetos', 7, 1, 42),
('Los productos de la Madre Tierra', 7, 1, 43),
('Ciclo agrícola de la siembra y cosecha', 7, 1, 44),

-- Lengua Extranjera (materia_id: 8) - Grado 1
('LA COMUNIDAD Y DIVERSIDAD CULTURAL (GREETINGS, PERSONAL INFORMATION, ALPHABET, NUMBERS 1-20, ETC.)', 8, 1, 45),
('MI FAMILIA EN COMUNIDAD (NUMBERS 21-100, MY FAMILY, POSSESSIVE NOUNS, CLOTHES AND COLORS, ETC.)', 8, 1, 46),
('EL LENGUAJE COMO MEDIO DE EXPRESIÓN DE NUESTRA COMUNIDAD (MY COMMUNITY, PLACES, ANIMALS, DAILY ACTIVITIES, SIMPLE PRESENT TENSE, ENGLISH SONGS)', 8, 1, 47),

-- Ciencias Sociales (materia_id: 9) - Grado 1
('INTRODUCCIÓN A LAS CIENCIAS SOCIALES', 9, 1, 48),
('GEOGRAFÍA', 9, 1, 49),
('TIEMPO GEOLÓGICO', 9, 1, 50),
('DE LA PANGEA A LA FORMACIÓN DE LOS CONTINENTES', 9, 1, 51),
('IMPORTANCIA DE LA MADRE TIERRA COMO SUJETO DE DERECHO', 9, 1, 52),

-- Artes Plásticas (materia_id: 10) - Grado 1
('EXPRESIONES ARTÍSTICAS PLÁSTICAS Y SU APLICACIÓN COMO PROCESO TECNOLÓGICO PRODUCTIVO', 10, 1, 53),
('ARTES GRÁFICAS COMO ORIENTACIÓN EN LOS PROCESOS PRODUCTIVOS', 10, 1, 54),
('EL DIBUJO ARTÍSTICO COMO FOMENTO A LAS EXPRESIONES GRÁFICAS CULTURALES', 10, 1, 55),

-- Educación Musical (materia_id: 11) - Grado 1
('MANIFESTACIONES ARTÍSTICAS DE LOS PUEBLOS ORIGINARIOS', 11, 1, 56),
('LAS TÉCNICAS RÍTMICAS Y SONORAS PARA LA EDUCACIÓN MUSICAL', 11, 1, 57),
('FISIOLOGÍA DE LA VOZ Y SU CUIDADO PARA LAS COMPOSICIONES MUSICALES', 11, 1, 58),

-- Educación Física (materia_id: 12) - Grado 1
('GIMNASIA BÁSICA Y SALUD COMUNITARIA', 12, 1, 59),
('ACTIVIDADES DE CONDICIÓN FÍSICA Y SALUD GENERAL', 12, 1, 60),
('ACTIVIDADES FÍSICAS ESPECÍFICAS EN LA COMUNIDAD (ATLETISMO Y FÚTBOL/FÚTBOL DE SALÓN)', 12, 1, 61),

-- Cosmovisiones (materia_id: 13) - Grado 1
('IMPORTANCIA Y FINES DE LA SICOLOGÍA EN LA VIDA DEL SER HUMANO', 13, 1, 62),
('FUNDAMENTOS DE LA SICOLOGÍA COMO CIENCIA', 13, 1, 63),
('PRINCIPALES ESCUELAS, CORRIENTES Y ENFOQUES DE LA SICOLOGÍA', 13, 1, 64),

-- Valores (materia_id: 14) - Grado 1
('DESARROLLO ESPIRITUAL EN COMPLEMENTARIEDAD CON LA NATURALEZA', 14, 1, 65),
('ESPACIOS Y LUGARES SAGRADOS', 14, 1, 66),
('CAUSAS Y CONSECUENCIAS DE LA CRISIS DE VALORES', 14, 1, 67);

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
-- Docentes de Matemática (materia_id: 4)
('Juan', 'Pérez', 'García', '3456789', 'juan.perez@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 1, 4, '73456789', 'activo'),
('María', 'López', 'Fernández', '4567890', 'maria.lopez@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 4, 4, '74567890', 'activo'),

-- Docentes de Lengua Castellana (materia_id: 6)
('Carlos', 'Mamani', 'Condori', '5678901', 'carlos.mamani@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 2, 6, '75678901', 'activo'),
('Ana', 'Quispe', 'Flores', '6789012', 'ana.quispe@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 5, 6, '76789012', 'activo'),

-- Docentes de Ciencias Naturales
('Roberto', 'Choque', 'Luna', '7890123', 'roberto.choque@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 3, 1, '77890123', 'activo'),  -- Biología-Geografía (1)
('Patricia', 'Alanoca', 'Ticona', '8901234', 'patricia.alanoca@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 3, 2, '78901234', 'activo'),  -- Física (2)
('Jorge', 'Apaza', 'Condori', '9012345', 'jorge.apaza@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 4, 3, '79012345', 'activo'),  -- Química (3)

-- Docentes de otras materias
('Luis', 'Huanca', 'Marca', '1023456', 'luis.huanca@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 2, 9, '71023456', 'activo'),  -- Ciencias Sociales (9)
('Sandra', 'Callisaya', 'Nina', '2034567', 'sandra.callisaya@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 1, 8, '72034567', 'activo'),  -- Lengua Extranjera (8)
('Miguel', 'Ticona', 'Pari', '3045678', 'miguel.ticona@sfx.edu.bo', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYL/.HS/C6u', 2, 5, 5, '73045678', 'activo');  -- Técnica Tecnológica (5)

-- =====================================================
-- INSERTAR VIDEOS DE PRUEBA
-- =====================================================
-- Nota: Los archivos deben ser subidos manualmente al servidor
-- Estos registros simulan videos ya procesados

INSERT INTO videos (titulo, descripcion, archivo_path, archivo_nombre, thumbnail_path, duracion, tamanio, formato, resolucion, codec, tema_id, materia_id, grado_id, docente_id, visualizaciones, estado) VALUES

-- Matemática (materia_id: 4) - Grado 1
('Introducción al Álgebra', 'Conceptos básicos de álgebra para primer año de secundaria', 'uploads/videos/matematica/1ro/intro_algebra.mp4', 'intro_algebra.mp4', 'uploads/thumbnails/intro_algebra.jpg', 1200, 52428800, 'mp4', '720p', 'h264', 17, 4, 1, 3, 45, 'activo'),
('Suma y Resta de Polinomios', 'Operaciones básicas con expresiones algebraicas', 'uploads/videos/matematica/1ro/suma_polinomios.mp4', 'suma_polinomios.mp4', 'uploads/thumbnails/suma_polinomios.jpg', 900, 41943040, 'mp4', '720p', 'h264', 17, 4, 1, 3, 38, 'activo'),
('Geometría: Ángulos', 'Clasificación y medición de ángulos', 'uploads/videos/matematica/1ro/angulos.mp4', 'angulos.mp4', 'uploads/thumbnails/angulos.jpg', 1080, 48234496, 'mp4', '720p', 'h264', 18, 4, 1, 3, 52, 'activo'),

-- Matemática (materia_id: 4) - Grado 4
('Ecuaciones Cuadráticas', 'Resolución de ecuaciones de segundo grado', 'uploads/videos/matematica/4to/ecuaciones_cuadraticas.mp4', 'ecuaciones_cuadraticas.mp4', 'uploads/thumbnails/ecuaciones_cuadraticas.jpg', 1500, 62914560, 'mp4', '1080p', 'h264', 17, 4, 4, 4, 67, 'activo'),
('Funciones Trigonométricas', 'Introducción a seno, coseno y tangente', 'uploads/videos/matematica/4to/funciones_trig.mp4', 'funciones_trig.mp4', 'uploads/thumbnails/funciones_trig.jpg', 1350, 58720256, 'mp4', '1080p', 'h264', 19, 4, 4, 4, 71, 'activo'),

-- Lengua Castellana (materia_id: 6) - Grado 2
('El Verbo y sus Tiempos', 'Conjugación verbal en español', 'uploads/videos/lenguaje/2do/verbos.mp4', 'verbos.mp4', 'uploads/thumbnails/verbos.jpg', 1020, 45088768, 'mp4', '720p', 'h264', 22, 6, 2, 5, 43, 'activo'),
('Literatura: El Cuento', 'Estructura y elementos del cuento literario', 'uploads/videos/lenguaje/2do/el_cuento.mp4', 'el_cuento.mp4', 'uploads/thumbnails/el_cuento.jpg', 1140, 49283072, 'mp4', '720p', 'h264', 23, 6, 2, 5, 56, 'activo'),

-- Lengua Castellana (materia_id: 6) - Grado 5
('Análisis Literario', 'Técnicas de análisis de textos literarios', 'uploads/videos/lenguaje/5to/analisis_literario.mp4', 'analisis_literario.mp4', 'uploads/thumbnails/analisis_literario.jpg', 1320, 57671680, 'mp4', '720p', 'h264', 23, 6, 5, 6, 39, 'activo'),
('Redacción de Ensayos', 'Estructura y técnicas para escribir ensayos', 'uploads/videos/lenguaje/5to/ensayos.mp4', 'ensayos.mp4', 'uploads/thumbnails/ensayos.jpg', 1260, 54525952, 'mp4', '720p', 'h264', 24, 6, 5, 6, 47, 'activo'),

-- Biología-Geografía (materia_id: 1) - Grado 3
('La Célula Eucariota', 'Estructura y función de las células eucariotas', 'uploads/videos/biologia/3ro/celula_eucariota.mp4', 'celula_eucariota.mp4', 'uploads/thumbnails/celula_eucariota.jpg', 1440, 62914560, 'mp4', '1080p', 'h264', 1, 1, 3, 7, 84, 'activo'),
('Mitosis y Meiosis', 'Procesos de división celular', 'uploads/videos/biologia/3ro/mitosis_meiosis.mp4', 'mitosis_meiosis.mp4', 'uploads/thumbnails/mitosis_meiosis.jpg', 1560, 67108864, 'mp4', '1080p', 'h264', 1, 1, 3, 7, 92, 'activo'),
('Leyes de Mendel', 'Genética básica y herencia', 'uploads/videos/biologia/3ro/mendel.mp4', 'mendel.mp4', 'uploads/thumbnails/mendel.jpg', 1380, 59768832, 'mp4', '1080p', 'h264', 2, 1, 3, 7, 78, 'activo'),

-- Física (materia_id: 2) - Grado 3
('Leyes de Newton', 'Las tres leyes fundamentales de la mecánica', 'uploads/videos/fisica/3ro/newton.mp4', 'newton.mp4', 'uploads/thumbnails/newton.jpg', 1500, 62914560, 'mp4', '1080p', 'h264', 6, 2, 3, 8, 95, 'activo'),
('Movimiento Rectilíneo Uniforme', 'Cinemática del movimiento en línea recta', 'uploads/videos/fisica/3ro/mru.mp4', 'mru.mp4', 'uploads/thumbnails/mru.jpg', 1200, 52428800, 'mp4', '1080p', 'h264', 6, 2, 3, 8, 81, 'activo'),

-- Química (materia_id: 3) - Grado 4
('La Tabla Periódica', 'Organización de los elementos químicos', 'uploads/videos/quimica/4to/tabla_periodica.mp4', 'tabla_periodica.mp4', 'uploads/thumbnails/tabla_periodica.jpg', 1350, 58720256, 'mp4', '1080p', 'h264', 10, 3, 4, 9, 73, 'activo'),
('Enlaces Iónicos y Covalentes', 'Tipos de enlaces químicos', 'uploads/videos/quimica/4to/enlaces.mp4', 'enlaces.mp4', 'uploads/thumbnails/enlaces.jpg', 1440, 62914560, 'mp4', '1080p', 'h264', 11, 3, 4, 9, 68, 'activo'),

-- Ciencias Sociales (materia_id: 9) - Grado 2
('Independencia de Bolivia', 'Historia de la independencia boliviana', 'uploads/videos/sociales/2do/independencia.mp4', 'independencia.mp4', 'uploads/thumbnails/independencia.jpg', 1620, 69206016, 'mp4', '720p', 'h264', 26, 9, 2, 10, 61, 'activo'),
('Geografía de Bolivia', 'Regiones geográficas de Bolivia', 'uploads/videos/sociales/2do/geografia_bolivia.mp4', 'geografia_bolivia.mp4', 'uploads/thumbnails/geografia_bolivia.jpg', 1380, 59768832, 'mp4', '720p', 'h264', 27, 9, 2, 10, 54, 'activo'),

-- Lengua Extranjera (materia_id: 8) - Grado 1
('Present Simple Tense', 'Tiempo presente simple en inglés', 'uploads/videos/ingles/1ro/present_simple.mp4', 'present_simple.mp4', 'uploads/thumbnails/present_simple.jpg', 960, 41943040, 'mp4', '720p', 'h264', NULL, 8, 1, 11, 49, 'activo'),
('Basic Vocabulary', 'Vocabulario básico en inglés', 'uploads/videos/ingles/1ro/vocabulary.mp4', 'vocabulary.mp4', 'uploads/thumbnails/vocabulary.jpg', 840, 37748736, 'mp4', '720p', 'h264', NULL, 8, 1, 11, 42, 'activo'),

-- Técnica Tecnológica (materia_id: 5) - Grado 5
('Introducción a la Programación', 'Conceptos básicos de programación', 'uploads/videos/tecnologia/5to/intro_programacion.mp4', 'intro_programacion.mp4', 'uploads/thumbnails/intro_programacion.jpg', 1680, 71303168, 'mp4', '1080p', 'h264', NULL, 5, 5, 12, 88, 'activo'),
('Algoritmos y Diagramas de Flujo', 'Lógica algorítmica básica', 'uploads/videos/tecnologia/5to/algoritmos.mp4', 'algoritmos.mp4', 'uploads/thumbnails/algoritmos.jpg', 1560, 67108864, 'mp4', '1080p', 'h264', NULL, 5, 5, 12, 76, 'activo');

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
-- carlos.mamani@sfx.edu.bo (Comunicación y Lenguajes: Lengua Castellana - 2do)
-- ana.quispe@sfx.edu.bo (Comunicación y Lenguajes: Lengua Castellana - 5to)
-- roberto.choque@sfx.edu.bo (Biología - Geografía - 3ro)
-- patricia.alanoca@sfx.edu.bo (Ciencias Naturales: Física - 3ro)
-- jorge.apaza@sfx.edu.bo (Ciencias Naturales: Química - 4to)
-- luis.huanca@sfx.edu.bo (Ciencias Sociales - 2do)
-- sandra.callisaya@sfx.edu.bo (Lengua Extranjera - 1ro)
-- miguel.ticona@sfx.edu.bo (Técnica Tecnológica General - 5to)

SELECT '=============================================' AS '';
SELECT 'Base de datos inicializada correctamente' AS 'ESTADO';
SELECT '=============================================' AS '';
SELECT 'Usuarios creados: 12 (2 administradores, 10 docentes)' AS 'INFO';
SELECT 'Videos de prueba: 20' AS 'INFO';
SELECT 'Password por defecto: Password123!' AS 'INFO';
SELECT '=============================================' AS '';
