# Diagrama de Componentes

## Vista General del Sistema

```mermaid
flowchart TB
    subgraph External["Externos"]
        Browser["🌐 Navegador Web"]
        MobileApp["📱 App Móvil"]
        GetID3["📦 getID3 Library"]
        FFmpeg["🎬 FFmpeg"]
    end

    subgraph Frontend["Frontend"]
        subgraph WebApp["Aplicación Web"]
            ReactWeb["⚛️ React App"]
            RouterWeb["React Router"]
            ContextWeb["Auth Context"]
            APIClient["API Client<br/>(Axios)"]
        end

        subgraph MobileAppComp["Aplicación Móvil"]
            ReactNative["⚛️ React Native"]
            Navigation["React Navigation"]
            ContextMobile["Auth Context"]
            APIClientMobile["API Client"]
        end
    end

    subgraph Backend["Backend API"]
        subgraph Core["Núcleo"]
            EntryPoint["📍 index.php"]
            Router["🔀 Router"]
            ErrorHandler["❌ Error Handler"]
        end

        subgraph Security["Seguridad"]
            AuthMW["🔐 AuthMiddleware"]
            RoleMW["👤 RoleMiddleware"]
            ValidMW["✅ ValidationMiddleware"]
            JWTHandler["🎫 JWTHandler"]
        end

        subgraph BusinessLogic["Lógica de Negocio"]
            AuthCtrl["AuthController"]
            VideoCtrl["VideoController"]
            UserCtrl["UsuarioController"]
            StatsCtrl["EstadisticaController"]
            AsignCtrl["AsignacionController"]
            CatalogCtrl["CatalogoControllers"]
        end

        subgraph DataAccess["Acceso a Datos"]
            UserModel["Usuario Model"]
            VideoModel["Video Model"]
            MateriaModel["Materia Model"]
            GradoModel["Grado Model"]
            OtherModels["Otros Models"]
        end

        subgraph Services["Servicios"]
            Logger["📝 Logger"]
            FileHandler["📁 FileHandler"]
            VideoProcessor["🎥 VideoProcessor"]
        end

        subgraph Config["Configuración"]
            Database["🗄️ Database<br/>(Singleton)"]
            CORSConfig["CORS Config"]
            JWTConfig["JWT Config"]
            EnvConfig[".env"]
        end
    end

    subgraph Persistence["Persistencia"]
        subgraph MySQL["MySQL/MariaDB"]
            Tables["📊 Tablas"]
            Triggers["⚡ Triggers"]
            Views["👁️ Vistas"]
            StoredProcs["📜 Stored Procs"]
            Events["⏰ Events"]
        end

        subgraph FileSystem["Sistema de Archivos"]
            VideoStorage["🎬 videos/"]
            ThumbStorage["🖼️ thumbnails/"]
            LogStorage["📋 logs/"]
        end
    end

    %% Conexiones Externas -> Frontend
    Browser --> ReactWeb
    MobileApp --> ReactNative

    %% Frontend interno
    ReactWeb --> RouterWeb
    ReactWeb --> ContextWeb
    ContextWeb --> APIClient

    ReactNative --> Navigation
    ReactNative --> ContextMobile
    ContextMobile --> APIClientMobile

    %% Frontend -> Backend
    APIClient -->|"HTTP/JSON"| EntryPoint
    APIClientMobile -->|"HTTP/JSON"| EntryPoint

    %% Backend Core
    EntryPoint --> CORSConfig
    EntryPoint --> ErrorHandler
    EntryPoint --> Router

    %% Router -> Security
    Router --> AuthMW
    AuthMW --> JWTHandler
    AuthMW --> RoleMW
    RoleMW --> ValidMW

    %% Security -> Controllers
    ValidMW --> AuthCtrl
    ValidMW --> VideoCtrl
    ValidMW --> UserCtrl
    ValidMW --> StatsCtrl
    ValidMW --> AsignCtrl
    ValidMW --> CatalogCtrl

    %% Controllers -> Services
    AuthCtrl --> JWTHandler
    AuthCtrl --> Logger
    VideoCtrl --> FileHandler
    VideoCtrl --> VideoProcessor
    VideoCtrl --> Logger
    UserCtrl --> Logger

    %% Controllers -> Models
    AuthCtrl --> UserModel
    VideoCtrl --> VideoModel
    UserCtrl --> UserModel
    StatsCtrl --> VideoModel
    AsignCtrl --> UserModel

    %% Models -> Database
    UserModel --> Database
    VideoModel --> Database
    MateriaModel --> Database
    GradoModel --> Database
    OtherModels --> Database

    %% Database -> MySQL
    Database -->|"PDO"| Tables
    Tables --> Triggers
    Tables --> Views
    Tables --> StoredProcs
    Events --> StoredProcs

    %% Services -> External/Storage
    VideoProcessor --> GetID3
    VideoProcessor --> FFmpeg
    FileHandler --> VideoStorage
    FileHandler --> ThumbStorage
    Logger --> LogStorage

    %% Config
    EnvConfig --> Database
    JWTConfig --> JWTHandler
```

## Componentes del Frontend

```mermaid
flowchart LR
    subgraph FrontendWeb["Frontend Web (React)"]
        subgraph Pages["📄 Pages"]
            Login["LoginPage"]
            Dashboard["DashboardPage"]
            Videos["VideosPage"]
            Users["UsersPage"]
            Upload["UploadPage"]
            Player["PlayerPage"]
        end

        subgraph Components["🧩 Components"]
            Navbar["Navbar"]
            Sidebar["Sidebar"]
            VideoCard["VideoCard"]
            VideoPlayer["VideoPlayer"]
            Forms["Forms"]
            Tables["Tables"]
            Modals["Modals"]
        end

        subgraph Hooks["🪝 Hooks"]
            useAuth["useAuth"]
            useVideos["useVideos"]
            useUsers["useUsers"]
            useFetch["useFetch"]
        end

        subgraph Services["🔧 Services"]
            AuthService["authService"]
            VideoService["videoService"]
            UserService["userService"]
            APIService["apiService"]
        end

        subgraph State["📦 State"]
            AuthContext["AuthContext"]
            TokenStorage["TokenStorage<br/>(localStorage)"]
        end
    end

    Pages --> Components
    Pages --> Hooks
    Hooks --> Services
    Services --> APIService
    Hooks --> State
    AuthService --> TokenStorage
```

## Componentes del Backend

```mermaid
flowchart TB
    subgraph BackendComponents["Backend Components"]
        subgraph Controllers["Controllers (9)"]
            direction LR
            C1["AuthController<br/>login, register,<br/>refresh, logout"]
            C2["VideoController<br/>CRUD, stream,<br/>buscar, populares"]
            C3["UsuarioController<br/>CRUD, password"]
            C4["EstadisticaController<br/>dashboard, métricas"]
            C5["DocenteAsignacionController<br/>asignaciones"]
            C6["MateriaController"]
            C7["GradoController"]
            C8["TemaController"]
            C9["CampoController"]
        end

        subgraph Models["Models (10)"]
            direction LR
            M1["Usuario"]
            M2["Video"]
            M3["Materia"]
            M4["Grado"]
            M5["Campo"]
            M6["Tema"]
            M7["Reproduccion"]
            M8["Estadistica"]
            M9["DocenteAsignacion"]
            M10["Rol"]
        end

        subgraph Middleware["Middleware (3)"]
            MW1["AuthMiddleware<br/>- verificar()<br/>- opcional()<br/>- proteger()"]
            MW2["RoleMiddleware<br/>- tieneRol()<br/>- tienePermiso()<br/>- puedeGestionar()"]
            MW3["ValidationMiddleware<br/>- validar()<br/>- sanitizar()"]
        end

        subgraph Utils["Utilities (4)"]
            U1["JWTHandler<br/>- generar()<br/>- validar()<br/>- hash()"]
            U2["Logger<br/>- auth()<br/>- video()<br/>- error()"]
            U3["FileHandler<br/>- subirVideo()<br/>- subirThumbnail()<br/>- eliminar()"]
            U4["VideoProcessor<br/>- extraerMetadatos()<br/>- generarThumbnail()"]
        end
    end
```

## Componentes de Base de Datos

```mermaid
flowchart TB
    subgraph DatabaseComponents["Componentes de Base de Datos"]
        subgraph Tables["Tablas (11)"]
            T1["roles"]
            T2["usuarios"]
            T3["campos"]
            T4["materias"]
            T5["grados"]
            T6["temas"]
            T7["asignaciones"]
            T8["videos"]
            T9["reproducciones"]
            T10["estadisticas"]
            T11["logs_sistema"]
            T12["tokens_refresh"]
        end

        subgraph Triggers["Triggers (4)"]
            TR1["after_usuario_insert<br/>→ log creación"]
            TR2["after_video_insert<br/>→ log subida"]
            TR3["before_video_delete<br/>→ log eliminación"]
            TR4["after_reproduccion_insert<br/>→ incrementar views"]
        end

        subgraph Views["Vistas (5)"]
            V1["vista_videos_completos"]
            V2["vista_stats_por_materia"]
            V3["vista_stats_por_grado"]
            V4["vista_videos_populares"]
            V5["vista_docentes_asignaciones"]
        end

        subgraph StoredProcs["Procedimientos (3)"]
            SP1["sp_estadisticas_generales()"]
            SP2["sp_limpiar_tokens_expirados()"]
            SP3["sp_buscar_videos()"]
        end

        subgraph Events["Eventos (2)"]
            E1["evento_limpiar_tokens<br/>(diario)"]
            E2["evento_estadisticas_diarias<br/>(diario)"]
        end
    end

    T2 --> TR1
    T8 --> TR2
    T8 --> TR3
    T9 --> TR4
    E1 --> SP2
    E2 --> SP1
```

## Dependencias entre Componentes

```mermaid
flowchart LR
    subgraph Dependencies["Dependencias"]
        AuthCtrl["AuthController"]
        VideoCtrl["VideoController"]

        UserModel["Usuario Model"]
        VideoModel["Video Model"]
        AsignModel["DocenteAsignacion Model"]

        JWT["JWTHandler"]
        Logger["Logger"]
        FileH["FileHandler"]
        VideoP["VideoProcessor"]

        DB["Database"]
    end

    AuthCtrl --> UserModel
    AuthCtrl --> JWT
    AuthCtrl --> Logger

    VideoCtrl --> VideoModel
    VideoCtrl --> AsignModel
    VideoCtrl --> FileH
    VideoCtrl --> VideoP
    VideoCtrl --> Logger

    UserModel --> DB
    VideoModel --> DB
    AsignModel --> DB

    FileH --> VideoP
    VideoP --> DB
```

## Interfaces de Componentes

| Componente | Interface | Métodos Principales |
|------------|-----------|---------------------|
| **AuthController** | REST API | login(), register(), refresh(), logout(), me() |
| **VideoController** | REST API | index(), store(), show(), update(), destroy(), stream(), buscar() |
| **AuthMiddleware** | Middleware | verificar(), opcional(), proteger(), protegerConRol() |
| **JWTHandler** | Service | generarAccessToken(), generarRefreshToken(), validarToken() |
| **FileHandler** | Service | subirVideo(), subirThumbnail(), eliminarVideo() |
| **VideoProcessor** | Service | extraerMetadatos(), generarThumbnail() |
| **Database** | Singleton | getInstance(), query(), beginTransaction(), commit() |
| **Logger** | Service | auth(), video(), usuario(), info(), error() |

## Comunicación entre Componentes

```mermaid
sequenceDiagram
    participant Client
    participant Router
    participant Middleware
    participant Controller
    participant Model
    participant Database
    participant Services

    Client->>Router: HTTP Request
    Router->>Middleware: Route match
    Middleware->>Middleware: Auth + Role + Validation
    Middleware->>Controller: Authorized request
    Controller->>Services: Business logic
    Controller->>Model: Data operation
    Model->>Database: SQL Query
    Database-->>Model: Result
    Model-->>Controller: Processed data
    Services-->>Controller: Service result
    Controller-->>Client: JSON Response
```
