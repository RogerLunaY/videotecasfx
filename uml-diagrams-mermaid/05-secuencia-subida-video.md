# Diagrama de Secuencia - Subida de Video

## Flujo Completo de Subida (Docente)

```mermaid
sequenceDiagram
    autonumber
    participant D as Docente
    participant I as index.php
    participant R as Router
    participant AM as AuthMiddleware
    participant RM as RoleMiddleware
    participant VC as VideoController
    participant DA as DocenteAsignacion
    participant FH as FileHandler
    participant VP as VideoProcessor
    participant V as Video Model
    participant L as Logger
    participant DB as Database
    participant FS as File System

    D->>I: POST /api/videos<br/>Authorization: Bearer {token}<br/>FormData: titulo, materia_id,<br/>grado_id, tema_id, video, thumbnail

    I->>R: Enrutar petición
    R->>AM: verificar()

    AM->>AM: Extraer y validar JWT

    alt Token Inválido
        AM-->>D: 401 Unauthorized
    else Token Válido
        AM-->>R: Usuario autenticado

        R->>RM: tieneRol(['Admin', 'Docente'])

        alt No tiene rol
            RM-->>D: 403 Forbidden
        else Tiene rol
            R->>VC: store()

            VC->>VC: Validar datos requeridos

            Note over VC,DA: Verificar permisos del docente

            VC->>DA: tieneMateria(docente_id, materia_id)
            DA->>DB: SELECT COUNT FROM asignaciones
            DB-->>DA: count
            DA-->>VC: tiene: bool

            alt No tiene materia asignada
                VC-->>D: 403 Forbidden<br/>{error: "Sin permiso para materia"}
            end

            VC->>DA: tieneGrado(docente_id, grado_id)
            DA->>DB: SELECT COUNT FROM asignaciones
            DB-->>DA: count
            DA-->>VC: tiene: bool

            alt No tiene grado asignado
                VC-->>D: 403 Forbidden<br/>{error: "Sin permiso para grado"}
            end

            Note over VC,FH: Procesar archivo de video

            VC->>FH: subirVideo(archivo, materia_id, grado_id)

            FH->>FH: Validar MIME type
            FH->>FH: Validar tamaño (< 500 MB)
            FH->>FH: Validar extensión

            alt Validación falla
                FH-->>VC: error
                VC-->>D: 400 Bad Request
            else Validación exitosa
                FH->>FH: Generar nombre único

                FH->>FS: Crear directorio<br/>uploads/videos/{materia}/{grado}/
                FS-->>FH: ok

                FH->>FS: move_uploaded_file()
                FS-->>FH: archivo movido

                FH-->>VC: {path, filename}

                Note over VC,VP: Extraer metadatos y thumbnail

                VC->>VP: extraerMetadatos(ruta)
                VP->>VP: getID3::analyze()
                VP-->>VC: {duracion, resolucion, codec}

                alt Hay thumbnail subido
                    VC->>FH: subirThumbnail()
                    FH->>FS: mover a thumbnails/
                    FH-->>VC: thumbnail_path
                else Generar thumbnail
                    VC->>VP: generarThumbnail(video, output, 5s)
                    VP->>FS: FFmpeg -ss 5 -vframes 1
                    FS-->>VP: thumbnail generado
                    VP-->>VC: thumbnail_path
                end

                Note over VC,DB: Crear registro en BD

                VC->>V: crear(datosVideo)
                V->>DB: INSERT INTO videos

                Note right of DB: TRIGGER: after_video_insert<br/>registra log automáticamente

                DB-->>V: video_id
                V-->>VC: video creado

                VC->>L: video('subido', id, titulo, docente)
                L->>DB: INSERT log

                VC-->>D: 201 Created<br/>{success: true, video: {...}}
            end
        end
    end
```

## Validación de Permisos

```mermaid
flowchart TD
    A[Docente intenta subir video] --> B{Verificar JWT}
    B -->|Inválido| C[401 Unauthorized]
    B -->|Válido| D{Verificar Rol}
    D -->|No autorizado| E[403 Forbidden]
    D -->|Admin/Docente| F{Es Admin?}
    F -->|Sí| G[Permitir cualquier materia/grado]
    F -->|No| H{Tiene materia asignada?}
    H -->|No| I[403: Sin permiso para materia]
    H -->|Sí| J{Tiene grado asignado?}
    J -->|No| K[403: Sin permiso para grado]
    J -->|Sí| L[Proceder con subida]
```

## Procesamiento de Archivos

### Validaciones

| Validación | Criterio |
|------------|----------|
| MIME Type | video/mp4, video/x-msvideo, video/quicktime, video/x-matroska |
| Tamaño máximo | 500 MB |
| Extensiones | .mp4, .avi, .mov, .mkv |

### Organización de Archivos

```
uploads/
├── videos/
│   ├── {materia_id}/
│   │   ├── {grado_id}/
│   │   │   ├── 1700000000_abc123_video.mp4
│   │   │   └── 1700000001_def456_otro.mp4
│   │   └── ...
│   └── ...
└── thumbnails/
    ├── 1700000000_abc123_video.jpg
    └── 1700000001_def456_otro.jpg
```

### Metadatos Extraídos (getID3)

```php
[
    'duracion' => 320,          // segundos
    'resolucion' => '1920x1080',
    'codec' => 'h264',
    'tamanio' => 45678900        // bytes
]
```

## Manejo de Errores

```mermaid
flowchart LR
    A[Subir archivo] --> B{Éxito?}
    B -->|No| C[Retornar error]
    B -->|Sí| D[Extraer metadatos]
    D --> E{Éxito?}
    E -->|No| F[Eliminar archivo]
    F --> C
    E -->|Sí| G[Crear en BD]
    G --> H{Éxito?}
    H -->|No| I[Eliminar archivo y thumbnail]
    I --> C
    H -->|Sí| J[Respuesta exitosa]
```

El sistema garantiza limpieza de archivos si ocurre algún error después de la subida pero antes de completar el proceso.
