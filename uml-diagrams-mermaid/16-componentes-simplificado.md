# Diagrama de Componentes - Versión Simplificada

## Vista General

```mermaid
flowchart TB
    subgraph Cliente["🖥️ Cliente"]
        Web["Web<br/>(React)"]
        Mobile["Mobile<br/>(React Native)"]
    end

    subgraph API["⚙️ API REST (PHP)"]
        Controllers["Controllers"]
        Models["Models"]
        Services["Services"]
    end

    subgraph Datos["💾 Datos"]
        MySQL["MySQL"]
        Files["Archivos"]
    end

    Cliente -->|HTTP/JSON| API
    API -->|PDO| MySQL
    API -->|I/O| Files
```

## Componentes Principales

```mermaid
flowchart LR
    subgraph Backend["Backend"]
        direction TB
        Auth["🔐 Autenticación<br/>(JWT)"]
        Video["🎬 Videos<br/>(CRUD + Stream)"]
        User["👤 Usuarios<br/>(CRUD)"]
        Stats["📊 Estadísticas"]
    end

    subgraph Data["Datos"]
        direction TB
        DB["🗄️ MySQL<br/>(11 tablas)"]
        Storage["📁 Storage<br/>(videos, thumbs)"]
    end

    Auth --> DB
    Video --> DB
    Video --> Storage
    User --> DB
    Stats --> DB
```

## Flujo de una Petición

```mermaid
flowchart LR
    A[Cliente] --> B[Router]
    B --> C[Middleware<br/>Auth + Roles]
    C --> D[Controller]
    D --> E[Model]
    E --> F[Database]
    F --> E
    E --> D
    D --> A
```

## Resumen de Componentes

| Capa | Componentes | Cantidad |
|------|-------------|----------|
| **Frontend** | React, React Native | 2 apps |
| **API** | Controllers | 9 |
| | Models | 10 |
| | Middleware | 3 |
| | Servicios | 4 |
| **Base de Datos** | Tablas | 11 |
| | Triggers | 4 |
| | Vistas | 5 |
| **Almacenamiento** | Carpetas | videos, thumbnails, logs |
