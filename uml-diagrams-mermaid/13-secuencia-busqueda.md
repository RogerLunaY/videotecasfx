# Diagrama de Secuencia - Búsqueda de Videos

## Búsqueda Simple

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente
    participant R as Router
    participant AM as AuthMiddleware
    participant VC as VideoController
    participant V as Video Model
    participant DB as Database

    C->>R: GET /api/videos/buscar?q=triángulos
    R->>AM: opcional()

    alt Usuario autenticado
        AM->>AM: Extraer usuario del token
        AM-->>R: usuario autenticado
    else Usuario anónimo
        AM-->>R: sin usuario
    end

    R->>VC: buscar(request)

    VC->>VC: Obtener parámetros:<br/>q, limit, offset

    VC->>V: buscar(busqueda, limit, offset)

    V->>DB: SELECT v.*, u.nombre as docente,<br/>m.nombre as materia, g.nombre as grado<br/>FROM videos v<br/>JOIN usuarios u, materias m, grados g<br/>WHERE MATCH(titulo, descripcion)<br/>AGAINST(? IN NATURAL LANGUAGE MODE)<br/>AND v.estado = 'activo'<br/>ORDER BY relevancia DESC<br/>LIMIT ? OFFSET ?

    Note right of DB: Búsqueda FULLTEXT<br/>en titulo y descripcion

    DB-->>V: videos encontrados

    V->>V: Filtrar videos huérfanos<br/>(sin archivo físico)

    V-->>VC: videos[]

    VC-->>C: 200 OK<br/>{<br/>  total: 15,<br/>  page: 1,<br/>  per_page: 10,<br/>  videos: [...]<br/>}
```

## Búsqueda con Filtros

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente
    participant VC as VideoController
    participant V as Video Model
    participant DB as Database

    C->>VC: GET /api/videos?<br/>busqueda=ecuaciones<br/>&materia_id=4<br/>&grado_id=2<br/>&tema_id=15<br/>&order_by=fecha_subida<br/>&order_dir=desc<br/>&page=1<br/>&per_page=12

    VC->>VC: Extraer filtros del request

    VC->>VC: Verificar si es Docente

    alt Es Docente
        VC->>VC: Agregar filtro:<br/>docente_id = usuario.id
        Note right of VC: Docente solo ve<br/>sus propios videos
    end

    VC->>V: obtenerTodos(filtros, limit, offset, orderBy, orderDir)

    V->>V: Construir query dinámico

    V->>DB: SELECT v.*, u.nombre, m.nombre, g.nombre, t.nombre<br/>FROM videos v<br/>JOIN usuarios u ON v.docente_id = u.id<br/>JOIN materias m ON v.materia_id = m.id<br/>JOIN grados g ON v.grado_id = g.id<br/>LEFT JOIN temas t ON v.tema_id = t.id<br/>WHERE v.estado = 'activo'<br/>AND v.materia_id = 4<br/>AND v.grado_id = 2<br/>AND v.tema_id = 15<br/>AND (titulo LIKE '%ecuaciones%'<br/>     OR descripcion LIKE '%ecuaciones%')<br/>ORDER BY fecha_subida DESC<br/>LIMIT 12 OFFSET 0

    DB-->>V: videos filtrados

    V->>V: Verificar archivos existen

    loop Para cada video
        V->>V: file_exists(archivo_path)?
        alt No existe
            V->>V: Marcar como huérfano
        end
    end

    V->>V: Filtrar huérfanos del resultado

    V-->>VC: videos[]

    VC->>V: contar(filtros)
    V->>DB: SELECT COUNT(*) ...
    DB-->>V: total
    V-->>VC: total

    VC-->>C: 200 OK<br/>{<br/>  total: 45,<br/>  page: 1,<br/>  per_page: 12,<br/>  total_pages: 4,<br/>  videos: [{<br/>    id, titulo, descripcion,<br/>    thumbnail_path, duracion,<br/>    materia, grado, tema,<br/>    docente, visualizaciones,<br/>    fecha_subida<br/>  }, ...]<br/>}
```

## Búsqueda FULLTEXT vs LIKE

```mermaid
flowchart TD
    A[Término de búsqueda] --> B{Longitud >= 3?}
    B -->|Sí| C[Intentar FULLTEXT]
    B -->|No| D[Usar LIKE]

    C --> E{FULLTEXT exitoso?}
    E -->|Sí| F[Retornar resultados<br/>ordenados por relevancia]
    E -->|No| G[Fallback a LIKE]

    D --> H[LIKE '%término%']
    G --> H

    H --> I[Retornar resultados<br/>ordenados por fecha]
```

## Búsqueda por Docente (Restringida)

```mermaid
sequenceDiagram
    autonumber
    participant D as Docente
    participant AM as AuthMiddleware
    participant RM as RoleMiddleware
    participant VC as VideoController
    participant V as Video Model
    participant DB as Database

    D->>AM: GET /api/videos?busqueda=geometría<br/>Authorization: Bearer {token}

    AM->>AM: Validar JWT
    AM->>AM: Extraer: {id: 5, rol: 'Docente'}
    AM-->>VC: usuario autenticado

    VC->>RM: esDocente(usuario.rol)
    RM-->>VC: true

    Note over VC: Aplicar restricciones<br/>automáticas para Docente

    VC->>VC: filtros.docente_id = 5
    VC->>VC: filtros.estado = 'activo'
    VC->>VC: filtros.solo_con_archivo = true

    VC->>V: obtenerTodos(filtros, ...)

    V->>DB: SELECT ... FROM videos<br/>WHERE docente_id = 5<br/>AND estado = 'activo'<br/>AND (titulo LIKE '%geometría%'<br/>     OR descripcion LIKE '%geometría%')

    Note right of DB: Solo videos del docente 5

    DB-->>V: videos del docente
    V-->>VC: videos[]

    VC-->>D: 200 OK<br/>{videos: [...]}
```

## Búsqueda de Videos Populares

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente
    participant VC as VideoController
    participant V as Video Model
    participant DB as Database

    C->>VC: GET /api/videos/populares?limit=10

    VC->>V: obtenerMasPopulares(10)

    V->>DB: SELECT v.*, u.nombre, m.nombre, g.nombre<br/>FROM videos v<br/>JOIN usuarios u, materias m, grados g<br/>WHERE v.estado = 'activo'<br/>ORDER BY v.visualizaciones DESC<br/>LIMIT 10

    DB-->>V: top 10 videos
    V-->>VC: videos[]

    VC-->>C: 200 OK<br/>{videos: [...]}
```

## Búsqueda de Videos Recientes

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente
    participant VC as VideoController
    participant V as Video Model
    participant DB as Database

    C->>VC: GET /api/videos/recientes?limit=10

    VC->>V: obtenerRecientes(10)

    V->>DB: SELECT v.*, u.nombre, m.nombre, g.nombre<br/>FROM videos v<br/>JOIN usuarios u, materias m, grados g<br/>WHERE v.estado = 'activo'<br/>ORDER BY v.fecha_subida DESC<br/>LIMIT 10

    DB-->>V: últimos 10 videos
    V-->>VC: videos[]

    VC-->>C: 200 OK<br/>{videos: [...]}
```

## Índice FULLTEXT

```sql
-- Índice FULLTEXT para búsquedas eficientes
ALTER TABLE videos
ADD FULLTEXT INDEX idx_fulltext_videos (titulo, descripcion);

-- Consulta FULLTEXT
SELECT *,
       MATCH(titulo, descripcion) AGAINST('triángulos' IN NATURAL LANGUAGE MODE) as relevancia
FROM videos
WHERE MATCH(titulo, descripcion) AGAINST('triángulos' IN NATURAL LANGUAGE MODE)
ORDER BY relevancia DESC;
```

## Parámetros de Búsqueda

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `busqueda` / `q` | string | Término de búsqueda | "ecuaciones" |
| `materia_id` | int | Filtrar por materia | 4 |
| `grado_id` | int | Filtrar por grado | 2 |
| `tema_id` | int | Filtrar por tema | 15 |
| `docente_id` | int | Filtrar por docente | 5 |
| `estado` | string | Estado del video | "activo" |
| `order_by` | string | Campo de ordenación | "fecha_subida" |
| `order_dir` | string | Dirección | "desc" |
| `page` | int | Página actual | 1 |
| `per_page` | int | Videos por página | 12 |

## Respuesta de Búsqueda

```json
{
  "success": true,
  "total": 45,
  "page": 1,
  "per_page": 12,
  "total_pages": 4,
  "videos": [
    {
      "id": 123,
      "titulo": "Ecuaciones de primer grado",
      "descripcion": "Introducción a las ecuaciones...",
      "thumbnail_path": "thumbnails/123.jpg",
      "duracion": 480,
      "formato": "mp4",
      "resolucion": "1920x1080",
      "materia": "Matemáticas",
      "materia_id": 4,
      "grado": "2° Secundaria",
      "grado_id": 2,
      "tema": "Ecuaciones",
      "tema_id": 15,
      "docente": "Juan Pérez",
      "docente_id": 5,
      "visualizaciones": 342,
      "fecha_subida": "2025-01-15T10:30:00Z"
    }
  ]
}
```
