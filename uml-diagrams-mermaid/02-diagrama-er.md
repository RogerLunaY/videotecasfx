# Diagrama Entidad-Relación - Base de Datos

```mermaid
erDiagram
    roles {
        int id PK
        varchar nombre
        json permisos
        text descripcion
        enum estado
    }

    usuarios {
        int id PK
        varchar nombre
        varchar apellido_paterno
        varchar apellido_materno
        varchar ci UK
        varchar email UK
        varchar password_hash
        int rol_id FK
        int grado_id FK
        int materia_id FK
        varchar telefono
        enum estado
        datetime ultimo_acceso
        int intentos_login
        datetime bloqueado_hasta
    }

    campos {
        int id PK
        varchar nombre
        text descripcion
        varchar color
        varchar icono
        enum estado
        int orden
    }

    materias {
        int id PK
        int campo_id FK
        varchar nombre
        varchar sigla
        text descripcion
        varchar color
        enum estado
    }

    grados {
        int id PK
        varchar nombre
        int nivel
        varchar sigla
        text descripcion
        enum estado
        int orden
    }

    temas {
        int id PK
        varchar nombre
        varchar nombre_corto
        text descripcion
        int materia_id FK
        int grado_id FK
        enum estado
        int orden
    }

    asignaciones {
        int id PK
        int docente_id FK
        int materia_id FK
        int grado_id FK
        enum estado
        datetime fecha_asignacion
        int usuario_asignador_id FK
    }

    videos {
        int id PK
        varchar titulo
        text descripcion
        varchar archivo_path
        varchar archivo_nombre
        varchar thumbnail_path
        int duracion
        bigint tamanio
        varchar formato
        varchar resolucion
        varchar codec
        int tema_id FK
        int materia_id FK
        int grado_id FK
        int docente_id FK
        int visualizaciones
        enum estado
        datetime fecha_subida
    }

    reproducciones {
        int id PK
        int video_id FK
        int usuario_id FK
        varchar ip_address
        varchar user_agent
        int tiempo_reproducido
        int porcentaje_visto
        boolean completado
        datetime fecha_inicio
        datetime fecha_fin
    }

    estadisticas {
        int id PK
        enum tipo
        varchar categoria
        json datos_json
        date fecha_referencia
        datetime fecha_generacion
    }

    logs_sistema {
        int id PK
        int usuario_id FK
        enum nivel
        varchar accion
        text descripcion
        varchar entidad
        int entidad_id
        varchar ip
        varchar user_agent
        json datos_adicionales
        datetime fecha
    }

    tokens_refresh {
        int id PK
        int usuario_id FK
        varchar token_hash UK
        varchar ip
        varchar user_agent
        datetime expira_en
        boolean revocado
        datetime fecha_creacion
    }

    %% Relaciones
    roles ||--o{ usuarios : "tiene"

    usuarios ||--o{ videos : "crea"
    usuarios ||--o{ asignaciones : "es asignado"
    usuarios ||--o{ reproducciones : "visualiza"
    usuarios ||--o{ logs_sistema : "genera"
    usuarios ||--o{ tokens_refresh : "posee"

    campos ||--o{ materias : "contiene"

    materias ||--o{ temas : "tiene"
    materias ||--o{ videos : "categoriza"
    materias ||--o{ asignaciones : "es asignada"

    grados ||--o{ temas : "tiene"
    grados ||--o{ videos : "para"
    grados ||--o{ asignaciones : "es asignado"

    temas ||--o{ videos : "tema de"

    videos ||--o{ reproducciones : "tiene"
```

## Descripción de Tablas

### Tablas Principales (11)

| Tabla | Descripción | Registros Aprox. |
|-------|-------------|------------------|
| `roles` | Roles del sistema (Administrador, Docente) | 2 |
| `usuarios` | Administradores y docentes | Variable |
| `campos` | Campos de saberes del currículo boliviano | 4 |
| `materias` | Asignaturas por campo | 14 |
| `grados` | Niveles de secundaria | 6 |
| `temas` | Temas por materia y grado | ~600 |
| `asignaciones` | Relación docente-materia-grado | Variable |
| `videos` | Catálogo de videos educativos | Variable |
| `reproducciones` | Registro de visualizaciones | Variable |
| `estadisticas` | Métricas agregadas | Variable |
| `logs_sistema` | Auditoría de acciones | Variable |
| `tokens_refresh` | Tokens JWT de refresco | Variable |

### Elementos de Base de Datos

#### Triggers (4)
1. **after_usuario_insert** - Registra creación de usuario
2. **after_video_insert** - Registra subida de video
3. **before_video_delete** - Registra eliminación de video
4. **after_reproduccion_insert** - Incrementa visualizaciones

#### Vistas (5)
1. **vista_videos_completos** - Videos con información completa
2. **vista_stats_por_materia** - Estadísticas por materia
3. **vista_stats_por_grado** - Estadísticas por grado
4. **vista_videos_populares** - Top 10 más vistos
5. **vista_docentes_asignaciones** - Docentes con asignaciones

#### Procedimientos Almacenados (3)
1. **sp_estadisticas_generales()** - Contadores generales
2. **sp_limpiar_tokens_expirados()** - Limpieza de tokens
3. **sp_buscar_videos()** - Búsqueda parametrizada

#### Eventos Programados (2)
1. **evento_limpiar_tokens** - Diario, limpia tokens expirados
2. **evento_estadisticas_diarias** - Diario, genera estadísticas

### Tabla Central: `asignaciones`

Esta tabla es el **corazón del sistema de permisos** para docentes:

```sql
UNIQUE KEY (docente_id, materia_id, grado_id)
```

Relaciona docentes con combinaciones específicas de materia-grado, permitiendo control granular de qué videos puede subir cada docente.
