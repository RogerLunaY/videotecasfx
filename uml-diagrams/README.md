# Diagramas UML - Sistema Videoteca SFX

Este directorio contiene los diagramas UML completos del sistema Videoteca SFX, una plataforma educativa para gestión de videos del currículo boliviano.

## 📋 Índice de Diagramas

### 1. Diagrama de Clases - Modelo de Datos
**Archivo:** `01-diagrama-clases-modelo.puml`

Muestra la estructura completa de las clases del modelo de datos (capa Model), incluyendo:
- **10 clases principales:** Usuario, Video, Materia, Grado, Campo, Tema, Reproduccion, Estadistica, DocenteAsignacion, Rol
- **Atributos** de cada clase
- **Métodos principales** de cada clase
- **Relaciones** entre clases (asociación, composición, herencia)
- **Cardinalidades** (1:1, 1:N, N:M)

**Propósito:** Entender la estructura de datos del backend PHP y cómo se relacionan las entidades del negocio.

---

### 2. Diagrama de Entidad-Relación - Base de Datos
**Archivo:** `02-diagrama-entidad-relacion.puml`

Representa el esquema completo de la base de datos MySQL/MariaDB:
- **11 tablas principales:** roles, usuarios, campos, materias, grados, temas, asignaciones, videos, reproducciones, estadisticas, logs_sistema, tokens_refresh
- **Tipos de datos** y constraints de cada columna
- **Claves primarias** (PK) y **claves foráneas** (FK)
- **Índices especiales** (UNIQUE, FULLTEXT)
- **Relaciones** entre tablas con cardinalidades
- **Triggers, vistas, procedimientos almacenados y eventos** programados

**Propósito:** Documentar la estructura de la base de datos y entender las relaciones entre las tablas.

**Elementos destacados:**
- Tabla `asignaciones` como tabla central del sistema
- Índice FULLTEXT en videos para búsquedas eficientes
- 4 triggers automáticos para auditoría
- 5 vistas para consultas complejas
- 3 procedimientos almacenados
- 2 eventos programados (limpieza y estadísticas)

---

### 3. Diagrama de Componentes - Arquitectura del Sistema
**Archivo:** `03-diagrama-componentes.puml`

Muestra la arquitectura general del sistema con todos sus componentes:

**Capas:**
1. **Clientes:** Frontend Web (React + Vite) y Frontend Mobile (React Native)
2. **Backend - API REST:**
   - Entry Point (index.php + Router)
   - Middleware (Auth, Role, Validation)
   - Controllers (9 controladores)
   - Models (10 modelos con Repository Pattern)
   - Utilities (JWT, Logger, FileHandler, VideoProcessor)
   - Configuration (Database, CORS, JWT Config, .env)
3. **Base de Datos:** MySQL/MariaDB con tablas, triggers, vistas, procedimientos y eventos
4. **Almacenamiento:** Sistema de archivos (uploads/, logs/)
5. **Servicios Externos:** getID3 y FFmpeg

**Propósito:** Visualizar la arquitectura completa del sistema y cómo interactúan los componentes.

---

### 4. Diagrama de Secuencia - Autenticación
**Archivo:** `04-secuencia-autenticacion.puml`

Detalla los flujos de autenticación y autorización:

**Flujos incluidos:**
1. **Login (POST /api/auth/login):**
   - Validación de credenciales
   - Control de intentos fallidos
   - Bloqueo temporal tras 5 intentos (15 minutos)
   - Generación de tokens JWT (access + refresh)
   - Almacenamiento hasheado de refresh token
   - Actualización de último acceso
   - Registro en logs de auditoría

2. **Refresh Token (POST /api/auth/refresh):**
   - Validación de refresh token
   - Verificación en base de datos (no revocado, no expirado)
   - Generación de nuevo access token

3. **Logout (POST /api/auth/logout):**
   - Revocación de refresh token en BD
   - Registro en logs

**Propósito:** Entender el proceso completo de autenticación, incluyendo seguridad y auditoría.

**Aspectos de seguridad:**
- Passwords hasheados con bcrypt (cost 12)
- Tokens JWT firmados con HMAC-SHA256
- Refresh tokens almacenados hasheados (SHA-256)
- Control de intentos de login
- Bloqueo temporal automático

---

### 5. Diagrama de Secuencia - Subida de Video
**Archivo:** `05-secuencia-subida-video.puml`

Muestra el flujo completo de subida de un video por un docente:

**Pasos del proceso:**
1. Autenticación con JWT
2. Verificación de rol (Administrador o Docente)
3. **Validación de permisos del docente:**
   - Verificar asignación a la materia
   - Verificar asignación al grado
   - Si no tiene asignación → 403 Forbidden
4. Validación del archivo (MIME type, tamaño, extensión)
5. Subida del archivo a `uploads/videos/{materia_id}/{grado_id}/`
6. Extracción de metadatos con getID3 (duración, resolución, codec)
7. Generación o subida de thumbnail:
   - Si se sube thumbnail → mover a uploads/thumbnails/
   - Si no → generar con FFmpeg (frame al segundo 5)
8. Creación del registro en base de datos
9. Trigger automático de log de creación
10. Registro manual en logs_sistema
11. Respuesta con video completo

**Manejo de errores:**
- Si falla después de subir archivo, se eliminan archivos del sistema
- Rollback automático si falla la transacción

**Propósito:** Comprender el proceso completo de subida de videos, incluyendo validaciones de seguridad y procesamiento.

---

### 6. Diagrama de Secuencia - Streaming de Video
**Archivo:** `06-secuencia-streaming-video.puml`

Detalla el proceso de streaming de video con soporte de HTTP Range Requests:

**Características:**
1. **Range Requests (HTTP 206 Partial Content):**
   - Cliente solicita rangos específicos de bytes
   - Servidor responde con chunks según el rango
   - Permite reproducción adaptativa y saltos en el video
   - Streaming por chunks de 8 KB

2. **Registro de reproducción:**
   - Creación automática de registro en tabla `reproducciones`
   - Trigger automático incrementa contador de visualizaciones
   - Captura de IP y User-Agent

3. **Actualización de progreso:**
   - Cliente envía actualizaciones periódicas
   - Registra tiempo reproducido, porcentaje visto
   - Marca como completado al finalizar

**Headers HTTP importantes:**
- `Content-Type: video/mp4`
- `Accept-Ranges: bytes`
- `Content-Range: bytes inicio-fin/total`
- `Content-Disposition: inline`

**Propósito:** Entender cómo funciona el streaming de video con reproducción adaptativa.

---

### 7. Diagrama de Secuencia - Asignación de Docentes
**Archivo:** `07-secuencia-asignacion-docente.puml`

Muestra el proceso de asignación de docentes a combinaciones materia-grado:

**Flujos incluidos:**

1. **Asignación Múltiple (POST /api/docentes/{id}/asignaciones):**
   - Verificación de rol Administrador
   - Validación de existencia del docente
   - **Transacción atómica:**
     - DELETE todas las asignaciones anteriores
     - Validación de cada materia y grado
     - INSERT de nuevas asignaciones
     - COMMIT o ROLLBACK completo
   - Constraint único evita duplicados

2. **Consulta de Asignaciones (GET /api/docentes/{id}/asignaciones):**
   - Retorna asignaciones con información completa
   - Incluye nombres de materia, grado, campo
   - Ordenado por campo, materia y nivel de grado

3. **Vista Consolidada (GET /api/docentes-asignaciones):**
   - Usa vista `vista_docentes_asignaciones`
   - Agrupa materias y grados por docente (GROUP_CONCAT)
   - Muestra total de asignaciones

**Uso en validaciones:**
- Al subir video, se verifican las asignaciones del docente
- Métodos `tieneMateria()` y `tieneGrado()` consultan esta tabla

**Propósito:** Comprender la gestión centralizada de asignaciones y su uso en validaciones de seguridad.

---

### 8. Patrón MVC - Flujo General de Request
**Archivo:** `08-patron-mvc-flujo.puml`

Diagrama que muestra el flujo completo de una petición HTTP a través del sistema:

**Capas del flujo:**
1. **Cliente:** Usuario → Cliente Web/Mobile
2. **Entry Point:** index.php (Front Controller) + Router
3. **Middleware Layer:** Auth → Role → Validation
4. **Controller Layer:** Lógica de negocio (9 controladores)
5. **Model Layer:** Acceso a datos (10 modelos)
6. **Database Layer:** MySQL/MariaDB con triggers, vistas, SP, eventos
7. **Utilities:** JWT, Logger, FileHandler, VideoProcessor
8. **File System:** Almacenamiento de archivos

**Patrones de diseño identificados:**
- **Front Controller:** index.php como punto único de entrada
- **Chain of Responsibility:** Middleware en cadena
- **Repository Pattern:** Modelos encapsulan acceso a datos
- **Singleton:** Conexión PDO única
- **Factory:** JWTHandler genera diferentes tipos de tokens

**Flujos automáticos documentados:**
- Triggers que se ejecutan en inserts/updates/deletes
- Eventos programados que ejecutan tareas diarias

**Propósito:** Visualizar la arquitectura MVC completa y el flujo de datos de punta a punta.

---

## 🛠️ Cómo Visualizar los Diagramas

### Opción 1: PlantUML Online
1. Visitar: https://www.plantuml.com/plantuml/uml/
2. Copiar el contenido de cualquier archivo `.puml`
3. Pegar en el editor
4. Ver el diagrama renderizado

### Opción 2: Visual Studio Code
1. Instalar extensión: **PlantUML** (por jebbs)
2. Instalar Java (requerido por PlantUML)
3. Abrir cualquier archivo `.puml`
4. Presionar `Alt + D` para preview
5. Click derecho → "Export Current Diagram" para PNG/SVG

### Opción 3: IntelliJ IDEA / PhpStorm
1. Instalar plugin: **PlantUML integration**
2. Abrir archivo `.puml`
3. El diagrama se mostrará automáticamente en panel lateral

### Opción 4: Línea de Comandos
```bash
# Instalar PlantUML
sudo apt-get install plantuml

# Generar imagen PNG
plantuml 01-diagrama-clases-modelo.puml

# Generar SVG
plantuml -tsvg 01-diagrama-clases-modelo.puml

# Generar todos los diagramas
plantuml *.puml
```

---

## 📊 Resumen del Sistema

### Tecnologías
- **Backend:** PHP 8.x con arquitectura REST API
- **Base de Datos:** MySQL/MariaDB (nombre: `videoteca`)
- **Frontend Web:** React + Vite + Tailwind CSS
- **Frontend Mobile:** React Native
- **Patrones:** MVC, Repository, Singleton, Factory, Middleware, Front Controller

### Estadísticas
- **11 tablas** principales
- **10 modelos** de datos
- **9 controladores**
- **3 middleware**
- **4 triggers** automáticos
- **5 vistas** de base de datos
- **3 procedimientos** almacenados
- **2 eventos** programados
- **~60 endpoints** REST

### Características Destacadas
1. **Autenticación JWT:** Implementación manual con tokens access (1h) y refresh (7 días)
2. **RBAC:** Control de acceso basado en roles (Administrador, Docente)
3. **Streaming:** Soporte HTTP Range Requests para reproducción adaptativa
4. **Asignaciones:** Sistema centralizado de asignación docente-materia-grado
5. **Auditoría:** Logs completos de todas las acciones del sistema
6. **Seguridad:** Bcrypt, prepared statements, validaciones, rate limiting
7. **Automatización:** Triggers, eventos programados, limpieza automática
8. **Currículo Boliviano:** Adaptado a campos de saberes y niveles educativos

---

## 📝 Notas Adicionales

### Tabla Central: `asignaciones`
Esta tabla es el corazón del sistema de permisos para docentes. Relaciona docentes con combinaciones específicas de materia-grado, permitiendo control granular de qué videos puede subir cada docente.

**Constraint único:** `(docente_id, materia_id, grado_id)` evita asignaciones duplicadas.

### Videos Huérfanos
El sistema detecta y filtra automáticamente "videos huérfanos" (registros en BD sin archivo físico), evitando errores 404 en el streaming.

### Triggers Automáticos
Los triggers mantienen la integridad de datos:
- **Auditoría automática:** Registran creación/eliminación de usuarios y videos
- **Contadores:** Incrementan visualizaciones automáticamente

### Eventos Programados
Tareas diarias automatizadas:
- **Limpieza de tokens:** Elimina refresh tokens expirados cada día
- **Estadísticas:** Genera métricas del día anterior automáticamente

---

## 🔍 Casos de Uso Principales

1. **Docente sube video:** Diagrama 5
2. **Estudiante ve video:** Diagrama 6
3. **Admin asigna materias a docente:** Diagrama 7
4. **Usuario inicia sesión:** Diagrama 4
5. **Request genérica API:** Diagrama 8

---

## 📚 Referencias

- **PlantUML:** https://plantuml.com/
- **Código fuente:** `/home/user/videotecasfx/`
- **Base de datos:** `database/schema.sql`
- **Documentación API:** Ver controladores en `backend/controllers/`

---

**Generado:** 2025-11-18
**Proyecto:** Videoteca SFX - Plataforma Educativa Boliviana
**Rama:** claude/check-frontend-017h6CrHQij1SaKJyBXz7iCD
