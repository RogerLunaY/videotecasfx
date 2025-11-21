# Diagramas de Secuencia - Versión Simplificada

## Login

```mermaid
sequenceDiagram
    participant U as Usuario
    participant API as API
    participant DB as Database

    U->>API: email + password
    API->>DB: Verificar credenciales
    DB-->>API: Usuario válido
    API->>API: Generar tokens JWT
    API-->>U: Access Token + Refresh Token
```

## Subida de Video

```mermaid
sequenceDiagram
    participant D as Docente
    participant API as API
    participant DB as Database
    participant FS as Archivos

    D->>API: Video + datos
    API->>API: Validar permisos
    API->>FS: Guardar archivo
    API->>API: Extraer metadatos
    API->>API: Generar thumbnail
    API->>DB: Crear registro
    API-->>D: Video creado ✓
```

## Streaming de Video

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as API
    participant DB as Database
    participant FS as Archivos

    C->>API: GET /videos/{id}/stream
    API->>DB: Obtener info video
    API->>DB: Registrar reproducción
    API->>FS: Leer archivo
    API-->>C: Stream de video (chunks)
```

## Búsqueda de Videos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant API as API
    participant DB as Database

    U->>API: Término + filtros
    API->>DB: Búsqueda FULLTEXT
    DB-->>API: Videos encontrados
    API-->>U: Lista de videos
```

## Asignación de Docente

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as API
    participant DB as Database

    A->>API: Docente + materias/grados
    API->>DB: Eliminar asignaciones anteriores
    API->>DB: Crear nuevas asignaciones
    API-->>A: Asignaciones actualizadas ✓
```

## Registro de Usuario

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as API
    participant DB as Database

    A->>API: Datos del usuario
    API->>API: Validar datos
    API->>API: Hashear password
    API->>DB: Crear usuario
    API-->>A: Usuario creado ✓
```

## Refresh Token

```mermaid
sequenceDiagram
    participant C as Cliente
    participant API as API
    participant DB as Database

    C->>API: Refresh Token
    API->>DB: Verificar token válido
    API->>API: Generar nuevo Access Token
    API-->>C: Nuevo Access Token
```

## Ver Estadísticas

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as API
    participant DB as Database

    A->>API: GET /estadisticas/dashboard
    API->>DB: Consultar métricas
    API->>DB: Consultar tendencias
    API-->>A: Dashboard con datos
```

## Resumen de Flujos

| Flujo | Pasos | Resultado |
|-------|-------|-----------|
| Login | 4 | Tokens JWT |
| Subida Video | 7 | Video guardado |
| Streaming | 5 | Video reproducido |
| Búsqueda | 4 | Lista de videos |
| Asignación | 4 | Permisos actualizados |
| Registro | 5 | Usuario creado |
| Refresh | 4 | Token renovado |
| Dashboard | 4 | Métricas mostradas |
