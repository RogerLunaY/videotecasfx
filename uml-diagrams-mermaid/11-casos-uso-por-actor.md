# Casos de Uso por Actor

## Administrador

```mermaid
flowchart LR
    Admin[("👤 Administrador")]

    subgraph Autenticacion["🔐 Autenticación"]
        A1([Iniciar sesión])
        A2([Cerrar sesión])
        A3([Renovar token])
    end

    subgraph GestionUsuarios["👥 Gestión de Usuarios"]
        B1([Crear usuario])
        B2([Listar usuarios])
        B3([Ver detalle usuario])
        B4([Editar usuario])
        B5([Eliminar usuario])
        B6([Cambiar contraseña usuario])
        B7([Desbloquear usuario])
    end

    subgraph Asignaciones["📋 Asignaciones"]
        C1([Ver asignaciones docente])
        C2([Asignar materias])
        C3([Asignar grados])
        C4([Modificar asignaciones])
        C5([Ver todos los docentes con asignaciones])
    end

    subgraph GestionVideos["🎬 Gestión de Videos"]
        D1([Subir video])
        D2([Listar todos los videos])
        D3([Ver detalle video])
        D4([Editar cualquier video])
        D5([Eliminar cualquier video])
        D6([Buscar videos])
        D7([Ver videos por materia])
        D8([Ver videos por grado])
    end

    subgraph Estadisticas["📊 Estadísticas"]
        E1([Ver dashboard general])
        E2([Ver estadísticas por materia])
        E3([Ver estadísticas por grado])
        E4([Ver tendencias])
        E5([Ver videos populares])
        E6([Ver reproducciones])
    end

    subgraph Catalogo["📚 Catálogo"]
        F1([Ver campos de saberes])
        F2([Ver materias])
        F3([Ver grados])
        F4([Ver temas])
    end

    subgraph Sistema["⚙️ Sistema"]
        G1([Ver logs del sistema])
        G2([Ver roles])
    end

    Admin --> Autenticacion
    Admin --> GestionUsuarios
    Admin --> Asignaciones
    Admin --> GestionVideos
    Admin --> Estadisticas
    Admin --> Catalogo
    Admin --> Sistema
```

### Descripción de Casos de Uso - Administrador

| Caso de Uso | Descripción | Precondición |
|-------------|-------------|--------------|
| **Crear usuario** | Registrar nuevo admin o docente | Autenticado como Admin |
| **Editar usuario** | Modificar datos de cualquier usuario | Usuario existe |
| **Eliminar usuario** | Desactivar usuario (soft delete) | No puede eliminarse a sí mismo |
| **Asignar materias** | Asignar materias a un docente | Docente existe |
| **Asignar grados** | Asignar grados a un docente | Docente existe |
| **Subir video** | Subir video para cualquier materia/grado | Archivo válido |
| **Editar cualquier video** | Modificar metadatos de cualquier video | Video existe |
| **Eliminar cualquier video** | Desactivar cualquier video | Video existe |
| **Ver dashboard** | Visualizar métricas generales | Autenticado |
| **Ver logs** | Auditar acciones del sistema | Autenticado |

---

## Docente

```mermaid
flowchart LR
    Docente[("👤 Docente")]

    subgraph Autenticacion["🔐 Autenticación"]
        A1([Iniciar sesión])
        A2([Cerrar sesión])
        A3([Renovar token])
    end

    subgraph MiPerfil["👤 Mi Perfil"]
        B1([Ver mi perfil])
        B2([Editar mi perfil])
        B3([Cambiar mi contraseña])
    end

    subgraph MisVideos["🎬 Mis Videos"]
        C1([Subir video])
        C2([Listar mis videos])
        C3([Ver detalle de mi video])
        C4([Editar mi video])
        C5([Eliminar mi video])
        C6([Buscar en mis videos])
    end

    subgraph Restricciones["⚠️ Restricciones"]
        R1{{"Solo materias asignadas"}}
        R2{{"Solo grados asignados"}}
        R3{{"Solo videos propios"}}
    end

    subgraph MisEstadisticas["📊 Mis Estadísticas"]
        D1([Ver mis métricas])
        D2([Ver reproducciones de mis videos])
        D3([Ver videos más vistos propios])
    end

    subgraph Catalogo["📚 Catálogo"]
        E1([Ver campos de saberes])
        E2([Ver materias])
        E3([Ver grados])
        E4([Ver temas])
    end

    subgraph VerVideos["👁️ Ver Videos"]
        F1([Ver catálogo público])
        F2([Reproducir videos])
    end

    Docente --> Autenticacion
    Docente --> MiPerfil
    Docente --> MisVideos
    MisVideos --> Restricciones
    Docente --> MisEstadisticas
    Docente --> Catalogo
    Docente --> VerVideos
```

### Descripción de Casos de Uso - Docente

| Caso de Uso | Descripción | Restricción |
|-------------|-------------|-------------|
| **Subir video** | Subir video educativo | Solo para materias y grados asignados |
| **Editar mi video** | Modificar metadatos de video propio | Solo videos propios |
| **Eliminar mi video** | Desactivar video propio | Solo videos propios |
| **Ver mis videos** | Listar solo videos subidos por mí | Filtro automático docente_id |
| **Ver mis métricas** | Estadísticas de mis videos | Solo datos propios |
| **Editar mi perfil** | Modificar mis datos personales | Solo datos propios |
| **Cambiar mi contraseña** | Requiere contraseña actual | Verificación de password actual |

### Validación de Permisos al Subir Video

```mermaid
flowchart TD
    A[Docente intenta subir video] --> B{Autenticado?}
    B -->|No| C[401 Unauthorized]
    B -->|Sí| D{Tiene materia asignada?}
    D -->|No| E[403: Sin permiso para esta materia]
    D -->|Sí| F{Tiene grado asignado?}
    F -->|No| G[403: Sin permiso para este grado]
    F -->|Sí| H[Permitir subida]
```

---

## Estudiante / Público

```mermaid
flowchart LR
    Estudiante[("👤 Estudiante/Público")]

    subgraph Explorar["🔍 Explorar"]
        A1([Ver catálogo de videos])
        A2([Buscar videos])
        A3([Filtrar por materia])
        A4([Filtrar por grado])
        A5([Filtrar por tema])
        A6([Filtrar por campo de saberes])
    end

    subgraph Reproducir["▶️ Reproducir"]
        B1([Ver video])
        B2([Streaming de video])
        B3([Ver videos populares])
        B4([Ver videos recientes])
    end

    subgraph Navegar["📚 Navegar Catálogo"]
        C1([Ver campos de saberes])
        C2([Ver materias por campo])
        C3([Ver grados])
        C4([Ver temas por materia y grado])
    end

    Estudiante --> Explorar
    Estudiante --> Reproducir
    Estudiante --> Navegar
```

### Descripción de Casos de Uso - Estudiante/Público

| Caso de Uso | Descripción | Autenticación |
|-------------|-------------|---------------|
| **Ver catálogo** | Listar videos activos disponibles | No requerida |
| **Buscar videos** | Búsqueda FULLTEXT en título y descripción | No requerida |
| **Filtrar videos** | Aplicar filtros por materia, grado, tema | No requerida |
| **Ver video** | Reproducir video educativo | No requerida |
| **Streaming** | Reproducción con Range Requests | No requerida |
| **Ver populares** | Top videos por visualizaciones | No requerida |
| **Ver recientes** | Últimos videos subidos | No requerida |
| **Navegar catálogo** | Explorar estructura curricular | No requerida |

### Flujo de Navegación

```mermaid
flowchart TD
    A[Estudiante entra al sistema] --> B[Ver campos de saberes]
    B --> C[Seleccionar campo]
    C --> D[Ver materias del campo]
    D --> E[Seleccionar materia]
    E --> F[Ver grados disponibles]
    F --> G[Seleccionar grado]
    G --> H[Ver temas]
    H --> I[Ver videos del tema]
    I --> J[Reproducir video]
```

---

## Matriz Completa de Permisos

| Caso de Uso | Admin | Docente | Público |
|-------------|:-----:|:-------:|:-------:|
| **AUTENTICACIÓN** |
| Iniciar sesión | ✅ | ✅ | ❌ |
| Cerrar sesión | ✅ | ✅ | ❌ |
| Renovar token | ✅ | ✅ | ❌ |
| **USUARIOS** |
| Crear usuario | ✅ | ❌ | ❌ |
| Listar usuarios | ✅ | ❌ | ❌ |
| Ver detalle usuario | ✅ | Solo propio | ❌ |
| Editar usuario | ✅ | Solo propio | ❌ |
| Eliminar usuario | ✅ | ❌ | ❌ |
| Cambiar contraseña | ✅ | Solo propia* | ❌ |
| **ASIGNACIONES** |
| Ver asignaciones | ✅ | Solo propias | ❌ |
| Asignar materias/grados | ✅ | ❌ | ❌ |
| Modificar asignaciones | ✅ | ❌ | ❌ |
| **VIDEOS** |
| Subir video | ✅ | ✅** | ❌ |
| Listar videos | ✅ (todos) | ✅ (propios) | ✅ (activos) |
| Ver detalle | ✅ | ✅ | ✅ |
| Editar video | ✅ (todos) | ✅ (propios) | ❌ |
| Eliminar video | ✅ (todos) | ✅ (propios) | ❌ |
| Buscar videos | ✅ | ✅ | ✅ |
| Reproducir video | ✅ | ✅ | ✅ |
| **ESTADÍSTICAS** |
| Ver dashboard | ✅ | ❌ | ❌ |
| Ver métricas generales | ✅ | ❌ | ❌ |
| Ver métricas propias | ✅ | ✅ | ❌ |
| **CATÁLOGO** |
| Ver campos | ✅ | ✅ | ✅ |
| Ver materias | ✅ | ✅ | ✅ |
| Ver grados | ✅ | ✅ | ✅ |
| Ver temas | ✅ | ✅ | ✅ |

*Docente requiere contraseña actual para cambiar
**Solo para materias y grados asignados

---

## Diagrama General del Sistema

```mermaid
flowchart TB
    subgraph Actores
        Admin[("👤 Admin")]
        Docente[("👤 Docente")]
        Publico[("👤 Público")]
    end

    subgraph Sistema["Sistema Videoteca SFX"]
        Auth["🔐 Autenticación"]
        Users["👥 Usuarios"]
        Assign["📋 Asignaciones"]
        Videos["🎬 Videos"]
        Stats["📊 Estadísticas"]
        Catalog["📚 Catálogo"]
    end

    Admin -->|Control total| Auth
    Admin -->|CRUD completo| Users
    Admin -->|Gestionar| Assign
    Admin -->|CRUD completo| Videos
    Admin -->|Ver todo| Stats
    Admin -->|Consultar| Catalog

    Docente -->|Login/Logout| Auth
    Docente -->|Solo perfil propio| Users
    Docente -->|Ver propias| Assign
    Docente -->|CRUD propios| Videos
    Docente -->|Ver propias| Stats
    Docente -->|Consultar| Catalog

    Publico -->|Sin acceso| Auth
    Publico -->|Sin acceso| Users
    Publico -->|Sin acceso| Assign
    Publico -->|Solo ver/reproducir| Videos
    Publico -->|Sin acceso| Stats
    Publico -->|Consultar| Catalog
```
