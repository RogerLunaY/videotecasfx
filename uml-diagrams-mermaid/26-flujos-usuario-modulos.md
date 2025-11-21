# Flujos de Usuario y Módulos del Sistema

## Módulos del Sistema

```mermaid
flowchart TB
    subgraph Sistema["Videoteca SFX"]
        M1["🔐 Autenticación"]
        M2["👥 Usuarios"]
        M3["📋 Asignaciones"]
        M4["🎬 Videos"]
        M5["📊 Estadísticas"]
        M6["📚 Catálogo"]
    end

    M1 --> M2
    M2 --> M3
    M3 --> M4
    M4 --> M5
    M6 --> M4
```

### Descripción de Módulos

| Módulo | Funcionalidad |
|--------|---------------|
| **Autenticación** | Login, logout, tokens JWT |
| **Usuarios** | CRUD de admins y docentes |
| **Asignaciones** | Asignar materias/grados a docentes |
| **Videos** | Subir, editar, eliminar, streaming |
| **Estadísticas** | Dashboard, métricas, reportes |
| **Catálogo** | Campos, materias, grados, temas |

---

## Flujos de Usuario

### Administrador

```mermaid
flowchart TD
    Start([Inicio]) --> Login[Iniciar sesión]
    Login --> Dashboard[Ver dashboard]

    Dashboard --> U[Gestionar usuarios]
    Dashboard --> A[Gestionar asignaciones]
    Dashboard --> V[Gestionar videos]
    Dashboard --> S[Ver estadísticas]

    U --> U1[Crear usuario]
    U --> U2[Editar usuario]
    U --> U3[Eliminar usuario]

    A --> A1[Asignar materias]
    A --> A2[Asignar grados]

    V --> V1[Subir video]
    V --> V2[Editar video]
    V --> V3[Eliminar video]

    S --> S1[Métricas por materia]
    S --> S2[Métricas por grado]

    Dashboard --> Logout[Cerrar sesión]
    Logout --> End([Fin])
```

### Docente

```mermaid
flowchart TD
    Start([Inicio]) --> Login[Iniciar sesión]
    Login --> Home[Página principal]

    Home --> MV[Mis videos]
    Home --> SV[Subir video]
    Home --> ME[Mis estadísticas]
    Home --> P[Mi perfil]

    MV --> MV1[Ver mis videos]
    MV --> MV2[Editar video]
    MV --> MV3[Eliminar video]

    SV --> SV1[Seleccionar archivo]
    SV1 --> SV2[Completar datos]
    SV2 --> SV3[Confirmar subida]

    ME --> ME1[Ver reproducciones]
    ME --> ME2[Ver populares]

    P --> P1[Editar datos]
    P --> P2[Cambiar contraseña]

    Home --> Logout[Cerrar sesión]
    Logout --> End([Fin])
```

### Estudiante/Público

```mermaid
flowchart TD
    Start([Inicio]) --> Home[Página principal]

    Home --> Cat[Explorar catálogo]
    Home --> Bus[Buscar videos]
    Home --> Pop[Ver populares]
    Home --> Rec[Ver recientes]

    Cat --> C1[Seleccionar campo]
    C1 --> C2[Seleccionar materia]
    C2 --> C3[Seleccionar grado]
    C3 --> C4[Ver temas]
    C4 --> C5[Ver videos]

    Bus --> B1[Ingresar búsqueda]
    B1 --> B2[Aplicar filtros]
    B2 --> B3[Ver resultados]

    Pop --> V[Ver video]
    Rec --> V
    C5 --> V
    B3 --> V

    V --> V1[Reproducir]
    V1 --> End([Fin])
```

---

## Flujos por Funcionalidad

### Flujo de Registro de Usuario

```mermaid
flowchart LR
    A[Admin] --> B[Crear usuario]
    B --> C[Completar datos]
    C --> D{Rol?}
    D -->|Docente| E[Asignar materias/grados]
    D -->|Admin| F[Guardar]
    E --> F
    F --> G[Usuario creado]
```

### Flujo de Subida de Video

```mermaid
flowchart LR
    A[Docente] --> B[Subir video]
    B --> C{Tiene permisos?}
    C -->|No| D[Error 403]
    C -->|Sí| E[Subir archivo]
    E --> F[Procesar video]
    F --> G[Video disponible]
```

### Flujo de Reproducción

```mermaid
flowchart LR
    A[Usuario] --> B[Seleccionar video]
    B --> C[Solicitar stream]
    C --> D[Registrar vista]
    D --> E[Reproducir]
    E --> F[Actualizar stats]
```

### Flujo de Búsqueda

```mermaid
flowchart LR
    A[Usuario] --> B[Buscar]
    B --> C[Aplicar filtros]
    C --> D[Ejecutar query]
    D --> E[Mostrar resultados]
    E --> F[Seleccionar video]
```

---

## Interacción entre Módulos

```mermaid
flowchart LR
    subgraph Frontend
        UI[Interfaz]
    end

    subgraph Backend
        Auth[Autenticación]
        Users[Usuarios]
        Assign[Asignaciones]
        Videos[Videos]
        Stats[Estadísticas]
        Catalog[Catálogo]
    end

    subgraph Data
        DB[(MySQL)]
        FS[(Storage)]
    end

    UI --> Auth
    UI --> Users
    UI --> Assign
    UI --> Videos
    UI --> Stats
    UI --> Catalog

    Auth --> DB
    Users --> DB
    Assign --> DB
    Videos --> DB
    Videos --> FS
    Stats --> DB
    Catalog --> DB
```

---

## Resumen de Flujos

| Usuario | Flujos Principales |
|---------|-------------------|
| **Admin** | Login → Dashboard → Gestionar (usuarios, asignaciones, videos) → Estadísticas → Logout |
| **Docente** | Login → Mis videos → Subir/Editar → Mis estadísticas → Logout |
| **Público** | Explorar catálogo → Buscar → Filtrar → Reproducir video |
