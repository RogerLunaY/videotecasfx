# Diagrama de Secuencia - Asignación de Docentes

## Asignación Múltiple

```mermaid
sequenceDiagram
    autonumber
    participant A as Administrador
    participant R as Router
    participant AM as AuthMiddleware
    participant RM as RoleMiddleware
    participant AC as DocenteAsignacionController
    participant DA as DocenteAsignacion Model
    participant U as Usuario Model
    participant DB as Database

    A->>R: POST /api/docentes/{id}/asignaciones<br/>Authorization: Bearer {admin_token}<br/>{asignaciones: [<br/>  {materia_id: 4, grado_id: 1},<br/>  {materia_id: 4, grado_id: 2},<br/>  {materia_id: 4, grado_id: 3}<br/>]}

    R->>AM: verificar()
    AM-->>R: usuario autenticado

    R->>RM: tieneRol(['Administrador'])

    alt No es Admin
        RM-->>A: 403 Forbidden
    else Es Admin
        R->>AC: asignarMultiples(docenteId)

        AC->>U: obtenerPorId(docenteId)
        U->>DB: SELECT usuario WHERE id AND rol=docente
        DB-->>U: docente
        U-->>AC: docente

        alt Docente no existe
            AC-->>A: 404 Not Found
        else Docente existe
            AC->>AC: Validar array asignaciones

            AC->>DA: asignarMultiples(docenteId, asignaciones, adminId)

            DA->>DB: BEGIN TRANSACTION

            Note right of DB: Garantiza atomicidad:<br/>Todo o nada

            DA->>DB: DELETE FROM asignaciones<br/>WHERE docente_id = ?

            Note right of DB: Elimina asignaciones<br/>anteriores

            loop Para cada asignación
                DA->>DA: Validar materia_id y grado_id

                DA->>DB: SELECT COUNT FROM materias<br/>WHERE id AND estado='activo'
                DB-->>DA: existe

                alt Materia no existe
                    DA->>DB: ROLLBACK
                    DA-->>AC: error
                    AC-->>A: 400 Bad Request
                end

                DA->>DB: SELECT COUNT FROM grados<br/>WHERE id AND estado='activo'
                DB-->>DA: existe

                alt Grado no existe
                    DA->>DB: ROLLBACK
                    DA-->>AC: error
                    AC-->>A: 400 Bad Request
                end

                DA->>DB: INSERT INTO asignaciones<br/>(docente_id, materia_id, grado_id,<br/>estado, fecha_asignacion,<br/>usuario_asignador_id)

                Note right of DB: UNIQUE constraint<br/>evita duplicados
            end

            DA->>DB: COMMIT
            DB-->>DA: confirmado

            DA-->>AC: {success, asignaciones_creadas: 3}

            AC-->>A: 200 OK<br/>{success: true,<br/>message: "Asignaciones actualizadas",<br/>data: {docente_id, total: 3}}
        end
    end
```

## Consulta de Asignaciones

```mermaid
sequenceDiagram
    autonumber
    participant A as Admin/Docente
    participant AC as Controller
    participant DA as DocenteAsignacion
    participant DB as Database

    A->>AC: GET /api/docentes/{id}/asignaciones<br/>Authorization: Bearer {token}

    AC->>DA: obtenerPorDocente(docenteId)

    DA->>DB: SELECT a.*, m.nombre as materia,<br/>m.sigla, g.nombre as grado,<br/>g.sigla, c.nombre as campo<br/>FROM asignaciones a<br/>JOIN materias m, grados g, campos c<br/>WHERE docente_id = ?<br/>ORDER BY c.orden, m.nombre, g.nivel

    DB-->>DA: asignaciones con info completa
    DA-->>AC: asignaciones[]

    AC-->>A: 200 OK<br/>{docente_id, total: 3,<br/>asignaciones: [{<br/>  id, materia, materia_sigla,<br/>  grado, grado_sigla, campo,<br/>  fecha_asignacion<br/>}, ...]}
```

## Vista Consolidada de Todos los Docentes

```mermaid
sequenceDiagram
    autonumber
    participant A as Admin
    participant AC as Controller
    participant DA as DocenteAsignacion
    participant DB as Database

    A->>AC: GET /api/docentes-asignaciones

    AC->>DA: obtenerTodosConAsignaciones()

    DA->>DB: SELECT * FROM<br/>vista_docentes_asignaciones

    Note right of DB: Vista que usa GROUP_CONCAT<br/>para agrupar materias y grados

    DB-->>DA: docentes con asignaciones
    DA-->>AC: docentes[]

    AC-->>A: 200 OK<br/>{total: 15, docentes: [{<br/>  id, nombre_completo, email,<br/>  materias: "Matemáticas, Física",<br/>  grados: "1°S, 2°S, 3°S",<br/>  total_asignaciones: 6,<br/>  estado<br/>}, ...]}
```

## Modelo de Datos de Asignaciones

```mermaid
erDiagram
    usuarios ||--o{ asignaciones : "es asignado"
    materias ||--o{ asignaciones : "es asignada"
    grados ||--o{ asignaciones : "es asignado"

    asignaciones {
        int id PK
        int docente_id FK
        int materia_id FK
        int grado_id FK
        enum estado
        datetime fecha_asignacion
        int usuario_asignador_id FK
    }
```

## Constraint Único

```sql
UNIQUE KEY unique_asignacion (docente_id, materia_id, grado_id)
```

Este constraint garantiza que un docente no pueda tener la misma combinación materia-grado asignada dos veces.

## Uso en Validación de Videos

```mermaid
flowchart TD
    A[Docente intenta subir video<br/>para Matemáticas, 1° Secundaria] --> B{tieneMateria?}
    B -->|No| C[403: Sin permiso para materia]
    B -->|Sí| D{tieneGrado?}
    D -->|No| E[403: Sin permiso para grado]
    D -->|Sí| F[Permitir subida]

    subgraph Consultas
        G["SELECT COUNT(*) FROM asignaciones<br/>WHERE docente_id = 5<br/>AND materia_id = 4<br/>AND estado = 'activo'"]
        H["SELECT COUNT(*) FROM asignaciones<br/>WHERE docente_id = 5<br/>AND grado_id = 1<br/>AND estado = 'activo'"]
    end

    B --> G
    D --> H
```

## Métodos del Modelo DocenteAsignacion

| Método | Descripción |
|--------|-------------|
| `crear()` | Crea una asignación individual |
| `obtenerPorDocente()` | Lista asignaciones de un docente |
| `obtenerMateriasDocente()` | Materias únicas con grados agrupados |
| `obtenerGradosDocente()` | Grados únicos con materias agrupadas |
| `tieneAsignacion()` | Verifica combinación específica |
| `tieneMateria()` | Verifica si tiene la materia |
| `tieneGrado()` | Verifica si tiene el grado |
| `asignarMultiples()` | Reemplaza todas las asignaciones |
| `obtenerTodosConAsignaciones()` | Usa vista consolidada |

## Ejemplo de Asignaciones

| Docente | Materia | Grado |
|---------|---------|-------|
| Juan Pérez | Matemáticas | 1° Secundaria |
| Juan Pérez | Matemáticas | 2° Secundaria |
| Juan Pérez | Matemáticas | 3° Secundaria |
| María García | Física | 4° Secundaria |
| María García | Física | 5° Secundaria |
| María García | Química | 4° Secundaria |

Con este modelo, Juan solo puede subir videos de Matemáticas para 1°, 2° y 3°, mientras que María puede subir videos de Física para 4° y 5°, y de Química para 4°.
