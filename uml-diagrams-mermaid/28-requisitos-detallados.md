# Requisitos Funcionales y No Funcionales Detallados

## REQUISITOS FUNCIONALES

### RF01 - Autenticación

| ID | Requisito | Descripción | Prioridad | Módulo |
|----|-----------|-------------|-----------|--------|
| RF01.1 | Login | El sistema debe permitir a usuarios registrados iniciar sesión con email y contraseña | Alta | M01 |
| RF01.2 | Tokens JWT | El sistema debe generar un access token (1 hora) y refresh token (7 días) al autenticar | Alta | M01 |
| RF01.3 | Bloqueo automático | El sistema debe bloquear al usuario por 15 minutos tras 5 intentos de login fallidos | Alta | M01 |
| RF01.4 | Renovación de token | El sistema debe permitir renovar el access token usando el refresh token válido | Alta | M01 |
| RF01.5 | Logout | El sistema debe revocar el refresh token al cerrar sesión | Alta | M01 |
| RF01.6 | Perfil autenticado | El sistema debe retornar información del usuario autenticado | Media | M01 |

### RF02 - Gestión de Usuarios

| ID | Requisito | Descripción | Prioridad | Módulo |
|----|-----------|-------------|-----------|--------|
| RF02.1 | Crear usuario | El admin debe poder crear usuarios con: nombre, apellidos, CI, email, password, rol | Alta | M02 |
| RF02.2 | Validar duplicados | El sistema debe verificar que email y CI no estén duplicados | Alta | M02 |
| RF02.3 | Listar usuarios | El admin debe poder listar usuarios con filtros (rol, estado, búsqueda) y paginación | Alta | M02 |
| RF02.4 | Ver usuario | El admin debe poder ver el detalle completo de cualquier usuario | Media | M02 |
| RF02.5 | Editar usuario | El admin debe poder editar datos de cualquier usuario | Alta | M02 |
| RF02.6 | Editar perfil propio | El usuario debe poder editar su propio perfil (nombre, teléfono, foto) | Media | M02 |
| RF02.7 | Eliminar usuario | El admin debe poder desactivar usuarios (soft delete) | Alta | M02 |
| RF02.8 | Cambiar password admin | El admin debe poder cambiar la contraseña de cualquier usuario sin conocer la anterior | Media | M02 |
| RF02.9 | Cambiar password propio | El usuario debe poder cambiar su contraseña proporcionando la actual | Alta | M02 |

### RF03 - Asignaciones

| ID | Requisito | Descripción | Prioridad | Módulo |
|----|-----------|-------------|-----------|--------|
| RF03.1 | Asignar múltiple | El admin debe poder asignar múltiples combinaciones materia-grado a un docente en una sola operación | Alta | M03 |
| RF03.2 | Transacción atómica | El sistema debe realizar las asignaciones en una transacción (todo o nada) | Alta | M03 |
| RF03.3 | Evitar duplicados | El sistema debe impedir asignaciones duplicadas (mismo docente-materia-grado) | Alta | M03 |
| RF03.4 | Listar asignaciones | El admin debe poder ver todas las asignaciones de un docente | Media | M03 |
| RF03.5 | Vista consolidada | El admin debe poder ver todos los docentes con sus asignaciones agrupadas | Media | M03 |
| RF03.6 | Validar al subir | El sistema debe verificar asignaciones del docente antes de permitir subir video | Alta | M03 |

### RF04 - Gestión de Videos

| ID | Requisito | Descripción | Prioridad | Módulo |
|----|-----------|-------------|-----------|--------|
| RF04.1 | Subir video | El usuario debe poder subir archivos de video (MP4, AVI, MOV, MKV) hasta 500 MB | Alta | M04 |
| RF04.2 | Validar permisos | El sistema debe verificar que el docente tenga asignada la materia y grado | Alta | M04 |
| RF04.3 | Extraer metadatos | El sistema debe extraer automáticamente: duración, resolución, codec, tamaño | Alta | M04 |
| RF04.4 | Generar thumbnail | El sistema debe generar thumbnail automático usando FFmpeg (segundo 5) | Media | M04 |
| RF04.5 | Subir thumbnail | El usuario debe poder subir su propio thumbnail | Baja | M04 |
| RF04.6 | Organizar archivos | El sistema debe organizar videos en carpetas: uploads/videos/{materia}/{grado}/ | Media | M04 |
| RF04.7 | Listar videos | El sistema debe listar videos con filtros (materia, grado, tema, docente) y paginación | Alta | M04 |
| RF04.8 | Filtrar por rol | El docente solo debe ver sus propios videos, el admin ve todos | Alta | M04 |
| RF04.9 | Editar video | El usuario debe poder editar: título, descripción, tema | Media | M04 |
| RF04.10 | Eliminar video | El usuario debe poder desactivar videos propios (soft delete) | Media | M04 |
| RF04.11 | Admin gestiona todo | El admin debe poder editar y eliminar cualquier video | Alta | M04 |
| RF04.12 | Detectar huérfanos | El sistema debe filtrar videos sin archivo físico | Media | M04 |

### RF05 - Reproducción y Streaming

| ID | Requisito | Descripción | Prioridad | Módulo |
|----|-----------|-------------|-----------|--------|
| RF05.1 | Streaming | El sistema debe permitir reproducir videos mediante streaming HTTP | Alta | M04 |
| RF05.2 | Range Requests | El sistema debe soportar HTTP Range Requests (206 Partial Content) | Alta | M04 |
| RF05.3 | Chunks | El sistema debe enviar video en chunks de 8 KB | Media | M04 |
| RF05.4 | Registrar reproducción | El sistema debe registrar cada reproducción con: usuario, IP, tiempo, porcentaje | Alta | M04 |
| RF05.5 | Incrementar vistas | El sistema debe incrementar automáticamente el contador de visualizaciones | Alta | M04 |
| RF05.6 | Actualizar progreso | El cliente debe poder actualizar el progreso de reproducción | Baja | M04 |

### RF06 - Búsqueda

| ID | Requisito | Descripción | Prioridad | Módulo |
|----|-----------|-------------|-----------|--------|
| RF06.1 | Búsqueda FULLTEXT | El sistema debe buscar en título y descripción usando índice FULLTEXT | Alta | M04 |
| RF06.2 | Filtrar por materia | El usuario debe poder filtrar videos por materia | Alta | M04 |
| RF06.3 | Filtrar por grado | El usuario debe poder filtrar videos por grado | Alta | M04 |
| RF06.4 | Filtrar por tema | El usuario debe poder filtrar videos por tema | Media | M04 |
| RF06.5 | Videos populares | El sistema debe mostrar los videos más vistos | Media | M04 |
| RF06.6 | Videos recientes | El sistema debe mostrar los últimos videos subidos | Media | M04 |
| RF06.7 | Ordenar resultados | El usuario debe poder ordenar por fecha, título, visualizaciones | Media | M04 |

### RF07 - Estadísticas

| ID | Requisito | Descripción | Prioridad | Módulo |
|----|-----------|-------------|-----------|--------|
| RF07.1 | Dashboard general | El admin debe ver: total usuarios, videos, reproducciones | Alta | M05 |
| RF07.2 | Por materia | El admin debe ver estadísticas agrupadas por materia | Media | M05 |
| RF07.3 | Por grado | El admin debe ver estadísticas agrupadas por grado | Media | M05 |
| RF07.4 | Tendencias | El admin debe ver evolución de métricas en el tiempo | Baja | M05 |
| RF07.5 | Estadísticas docente | El docente debe ver métricas solo de sus propios videos | Media | M05 |
| RF07.6 | Generación automática | El sistema debe generar estadísticas diarias automáticamente | Baja | M05 |

### RF08 - Catálogo

| ID | Requisito | Descripción | Prioridad | Módulo |
|----|-----------|-------------|-----------|--------|
| RF08.1 | Campos de saberes | El sistema debe mostrar los 4 campos del currículo boliviano | Alta | M06 |
| RF08.2 | Materias por campo | El sistema debe mostrar las materias agrupadas por campo | Alta | M06 |
| RF08.3 | Grados | El sistema debe mostrar los 6 grados de secundaria | Alta | M06 |
| RF08.4 | Temas | El sistema debe mostrar temas filtrados por materia y/o grado | Alta | M06 |

---

## REQUISITOS NO FUNCIONALES

### RNF01 - Seguridad

| ID | Requisito | Descripción | Métrica |
|----|-----------|-------------|---------|
| RNF01.1 | Hash de passwords | Usar bcrypt con cost factor 12 | Tiempo hash: 200-300ms |
| RNF01.2 | Firma JWT | Usar HMAC-SHA256 para firmar tokens | Algoritmo: HS256 |
| RNF01.3 | Prepared statements | Usar consultas preparadas en todas las queries SQL | 100% queries parametrizadas |
| RNF01.4 | Sanitización XSS | Sanitizar todas las entradas con htmlspecialchars | 100% inputs sanitizados |
| RNF01.5 | HTTPS | Usar HTTPS en producción | Certificado SSL válido |
| RNF01.6 | Token expiración | Access token 1 hora, refresh token 7 días | Configurable |
| RNF01.7 | Hash refresh token | Almacenar refresh tokens hasheados con SHA-256 | No almacenar en texto plano |
| RNF01.8 | CORS | Configurar headers CORS apropiados | Dominios permitidos |
| RNF01.9 | Rate limiting | Máximo 5 intentos de login por usuario | Bloqueo 15 minutos |

### RNF02 - Rendimiento

| ID | Requisito | Descripción | Métrica |
|----|-----------|-------------|---------|
| RNF02.1 | Tiempo respuesta | API debe responder en tiempo razonable | < 500ms promedio |
| RNF02.2 | Streaming eficiente | Usar chunks pequeños para streaming | 8 KB por chunk |
| RNF02.3 | Índices FULLTEXT | Búsquedas optimizadas con índice FULLTEXT | Búsqueda < 100ms |
| RNF02.4 | Paginación | Limitar resultados por página | Máximo 50 items |
| RNF02.5 | Conexión singleton | Reutilizar conexión a BD | 1 conexión por request |
| RNF02.6 | Lazy loading | Cargar relaciones solo cuando se necesiten | Reducir queries |

### RNF03 - Disponibilidad

| ID | Requisito | Descripción | Métrica |
|----|-----------|-------------|---------|
| RNF03.1 | Uptime | Sistema disponible continuamente | 99.5% uptime |
| RNF03.2 | Limpieza tokens | Eliminar tokens expirados automáticamente | Cada 24 horas |
| RNF03.3 | Estadísticas auto | Generar estadísticas diarias | Cada 24 horas |
| RNF03.4 | Manejo errores | Capturar y logear todos los errores | 100% errores logeados |

### RNF04 - Escalabilidad

| ID | Requisito | Descripción | Métrica |
|----|-----------|-------------|---------|
| RNF04.1 | Usuarios concurrentes | Soportar múltiples usuarios simultáneos | 100 concurrentes |
| RNF04.2 | Almacenamiento videos | Capacidad de almacenar muchos videos | 10,000 videos |
| RNF04.3 | Tamaño archivo | Limitar tamaño de videos | Máximo 500 MB |
| RNF04.4 | Base de datos | Soportar crecimiento de datos | 1 millón de reproducciones |

### RNF05 - Usabilidad

| ID | Requisito | Descripción | Métrica |
|----|-----------|-------------|---------|
| RNF05.1 | Responsive | Interfaces adaptables a diferentes pantallas | Mobile + Desktop |
| RNF05.2 | Mensajes claros | Mostrar errores comprensibles al usuario | Mensajes en español |
| RNF05.3 | Navegación intuitiva | Facilitar exploración del catálogo | < 3 clicks a video |
| RNF05.4 | Feedback visual | Indicar estados de carga y procesamiento | Spinners/progress |

### RNF06 - Mantenibilidad

| ID | Requisito | Descripción | Métrica |
|----|-----------|-------------|---------|
| RNF06.1 | Arquitectura MVC | Separar presentación, lógica y datos | 3 capas definidas |
| RNF06.2 | Logs auditoría | Registrar todas las acciones importantes | 100% acciones críticas |
| RNF06.3 | Soft delete | Preservar datos al eliminar | No borrado físico |
| RNF06.4 | Documentación | Mantener diagramas UML actualizados | Documentación completa |
| RNF06.5 | Código limpio | Seguir estándares de codificación | PSR-12 para PHP |

### RNF07 - Compatibilidad

| ID | Requisito | Descripción | Métrica |
|----|-----------|-------------|---------|
| RNF07.1 | Navegadores | Soportar navegadores modernos | Chrome, Firefox, Safari, Edge |
| RNF07.2 | Formatos video | Aceptar formatos comunes | MP4, AVI, MOV, MKV |
| RNF07.3 | PHP | Versión mínima de PHP | 8.0 o superior |
| RNF07.4 | MySQL | Versión mínima de BD | MySQL 8.0 / MariaDB 10.x |
| RNF07.5 | Dispositivos | Soportar web y móvil | React + React Native |

### RNF08 - Integridad de Datos

| ID | Requisito | Descripción | Métrica |
|----|-----------|-------------|---------|
| RNF08.1 | Transacciones | Operaciones críticas en transacciones | ACID completo |
| RNF08.2 | Foreign keys | Mantener integridad referencial | 100% FK definidas |
| RNF08.3 | Constraints | Evitar datos inválidos | UNIQUE, NOT NULL |
| RNF08.4 | Triggers | Automatizar actualizaciones | 4 triggers activos |
| RNF08.5 | Backups | Respaldos periódicos | Diario recomendado |

---

## Matriz de Trazabilidad

| RF/RNF | Módulo | Prioridad |
|--------|--------|-----------|
| RF01.x | M01 - Autenticación | Alta |
| RF02.x | M02 - Usuarios | Alta |
| RF03.x | M03 - Asignaciones | Alta |
| RF04.x | M04 - Videos | Alta |
| RF05.x | M04 - Videos | Alta |
| RF06.x | M04 - Videos | Media |
| RF07.x | M05 - Estadísticas | Media |
| RF08.x | M06 - Catálogo | Alta |
| RNF01.x | Transversal | Alta |
| RNF02.x | Transversal | Alta |
| RNF03.x | Transversal | Media |
| RNF04.x | Transversal | Media |
| RNF05.x | Frontend | Media |
| RNF06.x | Transversal | Media |
| RNF07.x | Transversal | Alta |
| RNF08.x | Backend/BD | Alta |
