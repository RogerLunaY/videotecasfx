# Diagrama de Arquitectura 3 Capas

## Arquitectura General

```mermaid
flowchart TB
    subgraph Presentacion["🖥️ CAPA DE PRESENTACIÓN"]
        direction TB
        subgraph Web["Frontend Web"]
            React["React + Vite"]
            Tailwind["Tailwind CSS"]
            Axios["Axios HTTP Client"]
        end
        subgraph Mobile["Frontend Mobile"]
            RN["React Native"]
            RNNav["React Navigation"]
        end
    end

    subgraph Negocio["⚙️ CAPA DE NEGOCIO (API REST)"]
        direction TB
        subgraph Entry["Entry Point"]
            Index["index.php"]
            Router["Router"]
            CORS["CORS"]
        end

        subgraph Middleware["Middleware"]
            Auth["AuthMiddleware<br/>JWT Validation"]
            Role["RoleMiddleware<br/>RBAC"]
            Valid["ValidationMiddleware"]
        end

        subgraph Controllers["Controllers"]
            AuthC["AuthController"]
            VideoC["VideoController"]
            UserC["UsuarioController"]
            StatsC["EstadisticaController"]
            AsignC["DocenteAsignacionController"]
            OtherC["Materia/Grado/Tema/Campo"]
        end

        subgraph Services["Servicios/Utilidades"]
            JWT["JWTHandler"]
            Logger["Logger"]
            FileH["FileHandler"]
            VideoP["VideoProcessor"]
        end
    end

    subgraph Datos["💾 CAPA DE DATOS"]
        direction TB
        subgraph Models["Models (Repository)"]
            UserM["Usuario"]
            VideoM["Video"]
            MateriaM["Materia"]
            GradoM["Grado"]
            OtherM["Campo/Tema/Reproduccion<br/>Estadistica/DocenteAsignacion"]
        end

        subgraph Database["Base de Datos"]
            MySQL["MySQL/MariaDB"]
            Tables["11 Tablas"]
            Triggers["4 Triggers"]
            Views["5 Vistas"]
            SP["3 Stored Procedures"]
        end

        subgraph Storage["Almacenamiento"]
            Videos["uploads/videos/"]
            Thumbs["uploads/thumbnails/"]
            Logs["logs/"]
        end
    end

    %% Conexiones entre capas
    Presentacion -->|"HTTP/JSON"| Entry
    Entry --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Controllers --> Models
    Models -->|"PDO"| Database
    Services --> Storage
    VideoP -->|"getID3<br/>FFmpeg"| Storage
```

## Detalle por Capa

### Capa de Presentación

```mermaid
flowchart LR
    subgraph Presentacion["CAPA DE PRESENTACIÓN"]
        subgraph Componentes["Componentes UI"]
            Pages["Pages<br/>(Rutas)"]
            Components["Components<br/>(Reutilizables)"]
            Layouts["Layouts<br/>(Estructura)"]
        end

        subgraph Estado["Gestión de Estado"]
            Context["React Context"]
            Hooks["Custom Hooks"]
            LocalStorage["LocalStorage<br/>(Tokens)"]
        end

        subgraph Comunicacion["Comunicación"]
            API["API Service"]
            Interceptors["Interceptors<br/>(Auth Headers)"]
            ErrorH["Error Handling"]
        end
    end

    Pages --> Components
    Components --> Estado
    Estado --> Comunicacion
    Comunicacion -->|"REST API"| Backend["Capa de Negocio"]
```

**Responsabilidades:**
- Renderizado de interfaz de usuario
- Gestión de estado local
- Validación de formularios (cliente)
- Manejo de rutas/navegación
- Almacenamiento de tokens JWT
- Interceptores para headers de autenticación

### Capa de Negocio

```mermaid
flowchart TB
    subgraph Negocio["CAPA DE NEGOCIO"]
        subgraph Seguridad["Seguridad"]
            JWT["JWT Handler<br/>Generación/Validación"]
            RBAC["Role-Based<br/>Access Control"]
            Sanitize["Sanitización<br/>de datos"]
        end

        subgraph Logica["Lógica de Negocio"]
            Validaciones["Validaciones<br/>de negocio"]
            Permisos["Verificación<br/>de permisos"]
            Asignaciones["Control de<br/>asignaciones"]
        end

        subgraph Procesamiento["Procesamiento"]
            FileProc["Procesamiento<br/>de archivos"]
            MetaData["Extracción<br/>metadatos"]
            Thumbnails["Generación<br/>thumbnails"]
        end

        subgraph Auditoria["Auditoría"]
            Logging["Registro de<br/>acciones"]
            Stats["Generación de<br/>estadísticas"]
        end
    end

    Request["Request HTTP"] --> Seguridad
    Seguridad --> Logica
    Logica --> Procesamiento
    Procesamiento --> Auditoria
    Auditoria --> Response["Response JSON"]
```

**Responsabilidades:**
- Autenticación y autorización
- Validación de reglas de negocio
- Control de permisos por rol
- Procesamiento de archivos multimedia
- Generación de tokens JWT
- Registro de auditoría
- Manejo de errores y excepciones

### Capa de Datos

```mermaid
flowchart TB
    subgraph Datos["CAPA DE DATOS"]
        subgraph Acceso["Acceso a Datos"]
            PDO["PDO Singleton"]
            Prepared["Prepared<br/>Statements"]
            Transactions["Transacciones"]
        end

        subgraph Persistencia["Persistencia"]
            CRUD["Operaciones<br/>CRUD"]
            Queries["Consultas<br/>complejas"]
            FullText["Búsqueda<br/>FULLTEXT"]
        end

        subgraph Automatizacion["Automatización"]
            TriggerAuto["Triggers<br/>automáticos"]
            EventsAuto["Eventos<br/>programados"]
            ViewsAuto["Vistas<br/>precalculadas"]
        end

        subgraph Files["Sistema de Archivos"]
            Upload["Subida de<br/>archivos"]
            Organize["Organización<br/>por carpetas"]
            Delete["Eliminación<br/>de archivos"]
        end
    end

    Models["Models"] --> Acceso
    Acceso --> Persistencia
    Persistencia --> Automatizacion
    Models --> Files
```

**Responsabilidades:**
- Conexión a base de datos (Singleton)
- Operaciones CRUD con prepared statements
- Transacciones atómicas
- Búsquedas FULLTEXT
- Triggers para auditoría automática
- Eventos programados (limpieza, estadísticas)
- Gestión del sistema de archivos

## Flujo de Datos

```mermaid
sequenceDiagram
    participant P as Presentación
    participant N as Negocio
    participant D as Datos

    P->>N: HTTP Request + JWT
    N->>N: Validar token
    N->>N: Verificar permisos
    N->>N: Validar datos
    N->>D: Solicitar datos
    D->>D: Ejecutar query
    D->>D: Trigger automático
    D-->>N: Resultado
    N->>N: Procesar respuesta
    N->>D: Registrar log
    N-->>P: JSON Response
```

## Tecnologías por Capa

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Presentación** | React | UI Web |
| | React Native | UI Mobile |
| | Tailwind CSS | Estilos |
| | Axios | HTTP Client |
| **Negocio** | PHP 8.x | Lógica |
| | JWT (HS256) | Autenticación |
| | getID3 | Metadatos |
| | FFmpeg | Thumbnails |
| **Datos** | MySQL/MariaDB | Base de datos |
| | PDO | Conexión |
| | File System | Archivos |

## Principios de Diseño

| Principio | Implementación |
|-----------|----------------|
| **Separación de responsabilidades** | Cada capa tiene funciones específicas |
| **Bajo acoplamiento** | Capas se comunican por interfaces definidas |
| **Alta cohesión** | Componentes relacionados agrupados |
| **Seguridad en capas** | Validación en presentación, negocio y datos |
| **Escalabilidad** | Cada capa puede escalar independientemente |
