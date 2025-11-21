# Arquitectura - Versión Simplificada

## Vista General

```mermaid
flowchart LR
    Cliente["🖥️ Cliente<br/>(Web/Mobile)"]
    API["⚙️ API<br/>(PHP)"]
    DB["🗄️ Base de Datos<br/>(MySQL)"]
    Files["📁 Archivos<br/>(Videos)"]

    Cliente <-->|JSON| API
    API <-->|SQL| DB
    API <-->|I/O| Files
```

## Capas del Sistema

```mermaid
flowchart TB
    subgraph Presentacion["Presentación"]
        Web["React Web"]
        Mobile["React Native"]
    end

    subgraph Negocio["Lógica de Negocio"]
        Auth["Autenticación"]
        Videos["Gestión Videos"]
        Users["Gestión Usuarios"]
        Stats["Estadísticas"]
    end

    subgraph Datos["Datos"]
        MySQL["MySQL"]
        Storage["Almacenamiento"]
    end

    Presentacion --> Negocio
    Negocio --> Datos
```

## Flujo de Datos

```mermaid
flowchart LR
    A[Request] --> B[Validar Token]
    B --> C[Verificar Permisos]
    C --> D[Ejecutar Acción]
    D --> E[Acceder Datos]
    E --> F[Response]
```

## Componentes Clave

```mermaid
flowchart TB
    subgraph Sistema["Videoteca SFX"]
        direction LR
        C1["🔐<br/>Auth"]
        C2["🎬<br/>Videos"]
        C3["👤<br/>Usuarios"]
        C4["📊<br/>Stats"]
    end

    DB["🗄️ MySQL"]
    Files["📁 Storage"]

    C1 --> DB
    C2 --> DB
    C2 --> Files
    C3 --> DB
    C4 --> DB
```

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | React, React Native |
| Backend | PHP 8.x |
| Base de Datos | MySQL/MariaDB |
| Autenticación | JWT |
| Almacenamiento | Sistema de archivos |

## Patrones Utilizados

- **MVC** - Separación de responsabilidades
- **REST** - API stateless
- **Repository** - Acceso a datos
- **Singleton** - Conexión BD
- **Middleware** - Seguridad en cadena
