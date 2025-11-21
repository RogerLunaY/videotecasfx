# Entidad-Relación - Versión Simplificada

## Diagrama Principal

```mermaid
erDiagram
    usuarios ||--o{ videos : "sube"
    usuarios ||--o{ asignaciones : "tiene"

    materias ||--o{ videos : "categoriza"
    materias ||--o{ asignaciones : "asignada"

    grados ||--o{ videos : "para"
    grados ||--o{ asignaciones : "asignado"

    videos ||--o{ reproducciones : "tiene"

    usuarios {
        int id PK
        string nombre
        string email
        string password
        int rol_id
    }

    videos {
        int id PK
        string titulo
        string archivo
        int materia_id FK
        int grado_id FK
        int docente_id FK
    }

    materias {
        int id PK
        string nombre
        int campo_id FK
    }

    grados {
        int id PK
        string nombre
        int nivel
    }

    asignaciones {
        int id PK
        int docente_id FK
        int materia_id FK
        int grado_id FK
    }

    reproducciones {
        int id PK
        int video_id FK
        int tiempo
    }
```

## Relaciones Clave

```mermaid
flowchart LR
    U["👤 Usuario"]
    V["🎬 Video"]
    M["📚 Materia"]
    G["📊 Grado"]
    A["📋 Asignación"]

    U -->|sube| V
    U -->|tiene| A
    M -->|categoriza| V
    G -->|para| V
    A -->|relaciona| M
    A -->|relaciona| G
```

## Tablas Principales

| Tabla | Descripción | Registros |
|-------|-------------|-----------|
| **usuarios** | Admins y docentes | Variable |
| **videos** | Catálogo de videos | Variable |
| **materias** | 14 asignaturas | 14 |
| **grados** | 6 niveles secundaria | 6 |
| **asignaciones** | Docente-Materia-Grado | Variable |
| **reproducciones** | Historial de vistas | Variable |

## Tabla Central: Asignaciones

```mermaid
flowchart TB
    D["Docente"]
    A["Asignaciones"]
    M["Materia"]
    G["Grado"]

    D -->|N| A
    A -->|1| M
    A -->|1| G
```

**Ejemplo:** Juan (docente) → Matemáticas + 1°, 2°, 3° secundaria

## Resumen de Relaciones

| Relación | Tipo | Descripción |
|----------|------|-------------|
| Usuario → Video | 1:N | Un docente sube muchos videos |
| Usuario → Asignación | 1:N | Un docente tiene muchas asignaciones |
| Materia → Video | 1:N | Una materia tiene muchos videos |
| Grado → Video | 1:N | Un grado tiene muchos videos |
| Video → Reproducción | 1:N | Un video tiene muchas reproducciones |
