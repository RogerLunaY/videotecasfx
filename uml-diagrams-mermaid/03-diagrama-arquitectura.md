# Diagrama de Arquitectura - Componentes del Sistema

```mermaid
flowchart TB
    subgraph Clientes["Clientes"]
        Web["Frontend Web<br/>React + Vite<br/>Tailwind CSS"]
        Mobile["Frontend Mobile<br/>React Native"]
    end

    subgraph Backend["Backend - API REST (PHP 8.x)"]
        subgraph Entry["Entry Point"]
            Index["index.php<br/>Front Controller"]
            Router["Router<br/>api.php"]
        end

        subgraph Middleware["Middleware Layer"]
            AuthMW["AuthMiddleware<br/>JWT Validation"]
            RoleMW["RoleMiddleware<br/>RBAC"]
            ValidMW["ValidationMiddleware<br/>Data Validation"]
        end

        subgraph Controllers["Controllers (9)"]
            AuthCtrl["AuthController"]
            VideoCtrl["VideoController"]
            UserCtrl["UsuarioController"]
            StatsCtrl["EstadisticaController"]
            AsignCtrl["DocenteAsignacionController"]
            OtherCtrl["Materia/Grado/Tema/CampoController"]
        end

        subgraph Models["Models - Repository Pattern (10)"]
            UserModel["Usuario"]
            VideoModel["Video"]
            MateriaModel["Materia"]
            GradoModel["Grado"]
            OtherModels["Campo/Tema/Reproduccion/<br/>Estadistica/DocenteAsignacion/Rol"]
        end

        subgraph Utils["Utilities"]
            JWT["JWTHandler<br/>Token Management"]
            Logger["Logger<br/>Auditoría"]
            FileH["FileHandler<br/>File Uploads"]
            VideoP["VideoProcessor<br/>getID3 + FFmpeg"]
        end

        subgraph Config["Configuration"]
            DB["Database<br/>PDO Singleton"]
            CORS["CORS Config"]
            ENV[".env<br/>Environment"]
        end
    end

    subgraph Database["MySQL/MariaDB"]
        Tables["11 Tablas"]
        Triggers["4 Triggers"]
        Views["5 Vistas"]
        SP["3 Procedimientos"]
        Events["2 Eventos"]
    end

    subgraph Storage["Almacenamiento"]
        Videos["uploads/videos/<br/>{materia}/{grado}/"]
        Thumbs["uploads/thumbnails/"]
        Logs["logs/"]
    end

    subgraph External["Servicios Externos"]
        GetID3["getID3 Library"]
        FFmpeg["FFmpeg"]
    end

    %% Conexiones Clientes -> Backend
    Web --> Index
    Mobile --> Index

    %% Flujo interno
    Index --> Router
    Router --> AuthMW
    AuthMW --> RoleMW
    RoleMW --> ValidMW
    ValidMW --> Controllers

    %% Controllers -> Models
    AuthCtrl --> UserModel
    AuthCtrl --> JWT
    VideoCtrl --> VideoModel
    VideoCtrl --> FileH
    VideoCtrl --> VideoP
    UserCtrl --> UserModel
    StatsCtrl --> VideoModel

    %% Models -> Database
    UserModel --> DB
    VideoModel --> DB
    MateriaModel --> DB
    GradoModel --> DB
    OtherModels --> DB
    DB --> Tables

    %% Database internal
    Tables --> Triggers
    Tables --> Views
    Tables --> SP
    Events --> SP

    %% Utils -> External
    VideoP --> GetID3
    VideoP --> FFmpeg

    %% Utils -> Storage
    FileH --> Videos
    FileH --> Thumbs
    Logger --> Logs

    %% Config
    ENV --> DB
    JWT --> Config
```

## Arquitectura del Sistema

### Patrón MVC Adaptado para API REST

```
Cliente → index.php → Router → Middleware → Controller → Model → Database
```

### Capas del Sistema

#### 1. Clientes
- **Frontend Web**: React + Vite + Tailwind CSS
- **Frontend Mobile**: React Native

#### 2. Entry Point
- **index.php**: Front Controller Pattern
  - Manejo global de errores
  - Timezone: America/La_Paz
  - CORS headers
  - Carga de configuración
- **Router (api.php)**: ~60 endpoints

#### 3. Middleware
- **AuthMiddleware**: Validación de JWT
- **RoleMiddleware**: Control de acceso basado en roles (RBAC)
- **ValidationMiddleware**: Validación y sanitización de datos

#### 4. Controllers (9)
| Controller | Responsabilidad |
|------------|----------------|
| AuthController | Login, Register, Refresh, Logout |
| VideoController | CRUD + Streaming + Búsqueda |
| UsuarioController | Gestión de usuarios |
| EstadisticaController | Dashboard y métricas |
| DocenteAsignacionController | Asignaciones |
| MateriaController | Gestión de materias |
| GradoController | Gestión de grados |
| TemaController | Gestión de temas |
| CampoController | Gestión de campos |

#### 5. Models (10) - Repository Pattern
Encapsulan acceso a datos con prepared statements (PDO)

#### 6. Utilities
- **JWTHandler**: Tokens access (1h) y refresh (7 días)
- **Logger**: Auditoría en BD y archivos
- **FileHandler**: Subida de videos y thumbnails
- **VideoProcessor**: Metadatos (getID3) + Thumbnails (FFmpeg)

#### 7. Database
- **Singleton Pattern** para conexión PDO única
- Triggers, vistas, procedimientos y eventos

### Patrones de Diseño

| Patrón | Implementación |
|--------|----------------|
| Front Controller | index.php |
| Chain of Responsibility | Middleware en cadena |
| Repository | Models encapsulan acceso a datos |
| Singleton | Database connection |
| Factory | JWTHandler genera diferentes tokens |

### Flujo de una Request

```mermaid
sequenceDiagram
    participant C as Cliente
    participant I as index.php
    participant R as Router
    participant M as Middleware
    participant Ctrl as Controller
    participant Model as Model
    participant DB as Database

    C->>I: HTTP Request
    I->>R: Route request
    R->>M: Apply middleware
    M->>Ctrl: Execute action
    Ctrl->>Model: Data operation
    Model->>DB: SQL Query
    DB-->>Model: Result
    Model-->>Ctrl: Processed data
    Ctrl-->>C: JSON Response
```
