# Diagramas de Actividades

## Proceso de Autenticación

```mermaid
flowchart TD
    Start([Inicio]) --> A[Usuario ingresa email y password]
    A --> B{Validar formato de datos}
    B -->|Inválido| C[Mostrar error de validación]
    C --> A
    B -->|Válido| D{Usuario bloqueado?}
    D -->|Sí| E[Mostrar mensaje de bloqueo]
    E --> End1([Fin])
    D -->|No| F{Verificar credenciales}
    F -->|Inválidas| G[Incrementar intentos]
    G --> H{Intentos >= 5?}
    H -->|Sí| I[Bloquear usuario 15 min]
    I --> J[Registrar log de bloqueo]
    J --> E
    H -->|No| K[Mostrar error de credenciales]
    K --> A
    F -->|Válidas| L[Generar Access Token]
    L --> M[Generar Refresh Token]
    M --> N[Guardar Refresh Token en BD]
    N --> O[Actualizar último acceso]
    O --> P[Resetear intentos a 0]
    P --> Q[Registrar log de login]
    Q --> R[Retornar tokens al cliente]
    R --> End2([Fin exitoso])
```

## Proceso de Subida de Video

```mermaid
flowchart TD
    Start([Inicio]) --> A[Docente selecciona archivo de video]
    A --> B[Completar formulario:<br/>título, materia, grado, tema]
    B --> C{Validar token JWT}
    C -->|Inválido| D[401 Unauthorized]
    D --> End1([Fin])
    C -->|Válido| E{Verificar rol}
    E -->|No autorizado| F[403 Forbidden]
    F --> End1
    E -->|Admin/Docente| G{Es Docente?}
    G -->|No - Es Admin| H[Permitir cualquier materia/grado]
    G -->|Sí| I{Tiene materia asignada?}
    I -->|No| J[403: Sin permiso para materia]
    J --> End1
    I -->|Sí| K{Tiene grado asignado?}
    K -->|No| L[403: Sin permiso para grado]
    L --> End1
    K -->|Sí| H

    H --> M{Validar archivo}
    M -->|MIME inválido| N[400: Tipo de archivo no permitido]
    N --> End1
    M -->|Muy grande| O[400: Archivo excede 500 MB]
    O --> End1
    M -->|Válido| P[Generar nombre único]

    P --> Q[Crear directorio destino]
    Q --> R[Mover archivo a uploads/]
    R --> S{Subida exitosa?}
    S -->|No| T[500: Error al subir archivo]
    T --> End1
    S -->|Sí| U[Extraer metadatos con getID3]

    U --> V{Hay thumbnail?}
    V -->|Sí - Subido| W[Mover thumbnail a uploads/]
    V -->|No| X{FFmpeg disponible?}
    X -->|Sí| Y[Generar thumbnail automático]
    X -->|No| Z[Sin thumbnail]
    W --> AA
    Y --> AA
    Z --> AA

    AA[Crear registro en BD] --> AB{Insert exitoso?}
    AB -->|No| AC[Eliminar archivos subidos]
    AC --> AD[500: Error al guardar]
    AD --> End1
    AB -->|Sí| AE[Registrar log de subida]
    AE --> AF[201: Video creado exitosamente]
    AF --> End2([Fin exitoso])
```

## Proceso de Streaming de Video

```mermaid
flowchart TD
    Start([Inicio]) --> A[Cliente solicita video]
    A --> B[GET /api/videos/id/stream]
    B --> C{Buscar video en BD}
    C -->|No encontrado| D[404: Video no encontrado]
    D --> End1([Fin])
    C -->|Encontrado| E{Estado activo?}
    E -->|No| F[403: Video no disponible]
    F --> End1
    E -->|Sí| G{Archivo existe?}
    G -->|No| H[404: Archivo no encontrado]
    H --> End1
    G -->|Sí| I[Registrar reproducción en BD]

    I --> J[Obtener tamaño del archivo]
    J --> K{Tiene header Range?}

    K -->|No| L[Preparar respuesta completa]
    L --> M[HTTP 200 OK]
    M --> N[Enviar archivo completo]
    N --> End2([Fin])

    K -->|Sí| O[Parsear Range header]
    O --> P[Calcular inicio y fin]
    P --> Q[Abrir archivo en modo lectura]
    Q --> R[Posicionar en byte inicio]
    R --> S[HTTP 206 Partial Content]
    S --> T[Enviar headers:<br/>Content-Range, Accept-Ranges]

    T --> U{Quedan datos?}
    U -->|Sí| V[Leer chunk de 8 KB]
    V --> W[Enviar chunk al cliente]
    W --> U
    U -->|No| X[Cerrar archivo]
    X --> End2
```

## Proceso de Asignación de Docente

```mermaid
flowchart TD
    Start([Inicio]) --> A[Admin accede a gestión de docentes]
    A --> B[Seleccionar docente]
    B --> C[Abrir modal de asignaciones]
    C --> D[Mostrar asignaciones actuales]
    D --> E[Admin modifica asignaciones:<br/>agregar/quitar materias-grados]
    E --> F[Guardar cambios]
    F --> G{Validar token Admin}
    G -->|Inválido| H[401/403 Error]
    H --> End1([Fin])
    G -->|Válido| I{Docente existe?}
    I -->|No| J[404: Docente no encontrado]
    J --> End1
    I -->|Sí| K[BEGIN TRANSACTION]

    K --> L[DELETE asignaciones anteriores]
    L --> M{Hay nuevas asignaciones?}
    M -->|No| N[COMMIT - Docente sin asignaciones]
    N --> End2([Fin exitoso])

    M -->|Sí| O[Procesar primera asignación]
    O --> P{Materia válida?}
    P -->|No| Q[ROLLBACK]
    Q --> R[400: Materia no existe]
    R --> End1
    P -->|Sí| S{Grado válido?}
    S -->|No| Q
    S -->|Sí| T[INSERT asignación]
    T --> U{Más asignaciones?}
    U -->|Sí| O
    U -->|No| V[COMMIT]
    V --> W[Retornar asignaciones creadas]
    W --> End2
```

## Proceso de Registro de Usuario

```mermaid
flowchart TD
    Start([Inicio]) --> A[Admin accede a crear usuario]
    A --> B[Completar formulario:<br/>nombre, email, CI, rol, etc.]
    B --> C{Validar datos}
    C -->|Inválidos| D[Mostrar errores de validación]
    D --> B
    C -->|Válidos| E{Email duplicado?}
    E -->|Sí| F[400: Email ya registrado]
    F --> B
    E -->|No| G{CI duplicado?}
    G -->|Sí| H[400: CI ya registrado]
    H --> B
    G -->|No| I[Hashear password con bcrypt]
    I --> J[Crear usuario en BD]
    J --> K{Es Docente?}
    K -->|No| L[Usuario creado]
    K -->|Sí| M{Asignar materias/grados?}
    M -->|No| L
    M -->|Sí| N[Abrir modal de asignaciones]
    N --> O[Crear asignaciones]
    O --> L
    L --> P[Registrar log de creación]
    P --> Q[Mostrar confirmación]
    Q --> End([Fin])
```

## Proceso de Búsqueda de Videos

```mermaid
flowchart TD
    Start([Inicio]) --> A[Usuario ingresa término de búsqueda]
    A --> B{Hay filtros?}
    B -->|Sí| C[Aplicar filtros:<br/>materia, grado, tema]
    B -->|No| D[Sin filtros adicionales]
    C --> E
    D --> E[Construir query de búsqueda]

    E --> F{Usuario autenticado?}
    F -->|No| G[Buscar solo videos activos públicos]
    F -->|Sí| H{Es Docente?}
    H -->|Sí| I[Filtrar solo videos propios]
    H -->|No - Admin| J[Buscar todos los videos]
    G --> K
    I --> K
    J --> K

    K[Ejecutar búsqueda FULLTEXT]
    K --> L{Hay resultados?}
    L -->|No| M[Mostrar mensaje: sin resultados]
    M --> End1([Fin])
    L -->|Sí| N[Filtrar videos huérfanos]
    N --> O[Ordenar resultados]
    O --> P[Paginar resultados]
    P --> Q[Retornar videos encontrados]
    Q --> End2([Fin])
```

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| ⬭ Óvalo | Inicio/Fin |
| ▭ Rectángulo | Actividad/Acción |
| ◇ Rombo | Decisión |
| → Flecha | Flujo de control |
