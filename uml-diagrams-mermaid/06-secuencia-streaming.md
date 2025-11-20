# Diagrama de Secuencia - Streaming de Video

## Streaming con Range Requests

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente<br/>(Video Player)
    participant VC as VideoController
    participant V as Video Model
    participant R as Reproduccion Model
    participant DB as Database
    participant FS as File System

    C->>VC: GET /api/videos/{id}/stream<br/>Range: bytes=0-1048575

    Note right of C: Cliente solicita<br/>primeros 1 MB

    VC->>V: obtenerPorId(videoId)
    V->>DB: SELECT video con JOINs
    DB-->>V: video
    V-->>VC: video

    alt Video no encontrado
        VC-->>C: 404 Not Found
    else Video inactivo
        VC-->>C: 403 Forbidden
    else Video encontrado

        VC->>FS: file_exists(ruta)
        FS-->>VC: true/false

        alt Archivo no existe
            VC-->>C: 404 Not Found<br/>{error: "Archivo no encontrado"}
        else Archivo existe

            Note over VC,R: Registrar reproducción

            VC->>R: crear(videoId, usuarioId, ip, userAgent)
            R->>DB: INSERT reproducciones

            Note right of DB: TRIGGER: after_reproduccion_insert<br/>incrementa visualizaciones++

            DB-->>R: reproduccion_id
            R-->>VC: reproduccion_id

            VC->>FS: filesize(ruta)
            FS-->>VC: 52428800 (50 MB)

            VC->>VC: Leer header HTTP_RANGE

            alt Con Range Request
                VC->>VC: Parse "bytes=0-1048575"
                VC->>VC: Calcular inicio, fin, longitud

                VC->>FS: fopen(ruta, 'rb')
                FS-->>VC: file handle

                VC->>FS: fseek(handle, inicio)
                FS-->>VC: ok

                VC-->>C: HTTP/1.1 206 Partial Content<br/>Content-Type: video/mp4<br/>Content-Length: 1048576<br/>Content-Range: bytes 0-1048575/52428800<br/>Accept-Ranges: bytes

                loop Streaming por chunks
                    VC->>FS: fread(handle, 8192)
                    FS-->>VC: chunk 8 KB
                    VC-->>C: [datos binarios]
                end

                VC->>FS: fclose(handle)

            else Sin Range Request
                VC->>FS: readfile(ruta)
                FS-->>VC: archivo completo

                VC-->>C: HTTP/1.1 200 OK<br/>Content-Type: video/mp4<br/>Content-Length: 52428800<br/>Accept-Ranges: bytes
            end
        end
    end
```

## Actualización de Progreso

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente
    participant VC as VideoController
    participant R as Reproduccion Model
    participant DB as Database

    C->>VC: PUT /api/videos/{id}/progreso<br/>Authorization: Bearer {token}<br/>{reproduccion_id: 123,<br/>tiempo_reproducido: 180,<br/>porcentaje_visto: 56,<br/>completado: false}

    VC->>R: actualizar(id, tiempo, porcentaje, completado)

    R->>DB: UPDATE reproducciones<br/>SET tiempo_reproducido = 180,<br/>porcentaje_visto = 56,<br/>completado = 0,<br/>fecha_fin = NOW()

    DB-->>R: ok
    R-->>VC: actualizado

    VC-->>C: 200 OK<br/>{success: true}
```

## Flujo del Video Player

```mermaid
sequenceDiagram
    participant P as Video Player
    participant S as Servidor

    Note over P,S: Inicio de reproducción

    P->>S: GET /stream Range: bytes=0-1048575
    S-->>P: 206 Partial Content (1 MB)

    Note over P,S: Buffering continuo

    P->>S: GET /stream Range: bytes=1048576-2097151
    S-->>P: 206 Partial Content (1 MB)

    P->>S: GET /stream Range: bytes=2097152-3145727
    S-->>P: 206 Partial Content (1 MB)

    Note over P,S: Usuario salta al minuto 5

    P->>S: GET /stream Range: bytes=31457280-32505855
    S-->>P: 206 Partial Content (1 MB)

    Note over P,S: Actualización periódica

    loop Cada 30 segundos
        P->>S: PUT /progreso<br/>{tiempo, porcentaje}
        S-->>P: 200 OK
    end

    Note over P,S: Video completado

    P->>S: PUT /progreso<br/>{completado: true}
    S-->>P: 200 OK
```

## HTTP Headers

### Request Headers
```http
GET /api/videos/123/stream HTTP/1.1
Host: api.videoteca.com
Range: bytes=0-1048575
```

### Response Headers (206 Partial Content)
```http
HTTP/1.1 206 Partial Content
Content-Type: video/mp4
Content-Length: 1048576
Content-Range: bytes 0-1048575/52428800
Accept-Ranges: bytes
Content-Disposition: inline; filename="video.mp4"
```

### Response Headers (200 OK - Sin Range)
```http
HTTP/1.1 200 OK
Content-Type: video/mp4
Content-Length: 52428800
Accept-Ranges: bytes
Content-Disposition: inline; filename="video.mp4"
```

## Características del Streaming

| Característica | Valor |
|----------------|-------|
| Tamaño de chunk | 8 KB (8192 bytes) |
| Soporte Range Requests | Sí (HTTP 206) |
| Registro de visualización | Automático al iniciar |
| Actualización de progreso | Manual desde cliente |
| MIME Type Detection | Automático por extensión |

## Tabla de Reproducciones

```sql
CREATE TABLE reproducciones (
    id INT PRIMARY KEY,
    video_id INT NOT NULL,
    usuario_id INT,              -- NULL para anónimos
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    tiempo_reproducido INT DEFAULT 0,
    porcentaje_visto INT DEFAULT 0,
    completado BOOLEAN DEFAULT 0,
    fecha_inicio DATETIME,
    fecha_fin DATETIME
);
```

El trigger `after_reproduccion_insert` incrementa automáticamente el contador `visualizaciones` en la tabla `videos`.
