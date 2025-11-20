# Diagrama de Clases - Modelo de Datos

```mermaid
classDiagram
    direction TB

    class Usuario {
        +int id
        +string nombre
        +string apellido_paterno
        +string apellido_materno
        +string ci
        +string email
        +string password_hash
        +int rol_id
        +int grado_id
        +int materia_id
        +string telefono
        +string estado
        +datetime ultimo_acceso
        +int intentos_login
        +datetime bloqueado_hasta
        +crear() array
        +obtenerTodos(filtros, limit, offset) array
        +obtenerPorId(id) array
        +obtenerPorEmail(email) array
        +verificarPassword(email, password) bool
        +actualizar() bool
        +eliminar(id) bool
        +estaBloqueado(email) bool
    }

    class Video {
        +int id
        +string titulo
        +string descripcion
        +string archivo_path
        +string archivo_nombre
        +string thumbnail_path
        +int duracion
        +int tamanio
        +string formato
        +string resolucion
        +int tema_id
        +int materia_id
        +int grado_id
        +int docente_id
        +int visualizaciones
        +string estado
        +datetime fecha_subida
        +crear() array
        +obtenerTodos(filtros, limit, offset) array
        +obtenerPorId(id) array
        +buscar(busqueda, limit, offset) array
        +obtenerMasPopulares(limit) array
        +eliminar(id) bool
    }

    class Materia {
        +int id
        +int campo_id
        +string nombre
        +string sigla
        +string descripcion
        +string color
        +string estado
        +obtenerTodos(filtros) array
        +obtenerPorId(id) array
        +obtenerConTemas(id, gradoId) array
        +obtenerPorCampo() array
    }

    class Grado {
        +int id
        +string nombre
        +int nivel
        +string sigla
        +string descripcion
        +string estado
        +int orden
        +obtenerTodos(estado) array
        +obtenerPorNivel(nivel) array
        +obtenerConTemas(id, materiaId) array
    }

    class Campo {
        +int id
        +string nombre
        +string descripcion
        +string color
        +string icono
        +string estado
        +int orden
        +obtenerTodos() array
        +obtenerConMaterias(id) array
    }

    class Tema {
        +int id
        +string nombre
        +string nombre_corto
        +string descripcion
        +int materia_id
        +int grado_id
        +string estado
        +int orden
        +obtenerTodos(filtros) array
        +obtenerPorMateriaYGrado(materiaId, gradoId) array
        +buscar(busqueda, materiaId, gradoId) array
    }

    class Reproduccion {
        +int id
        +int video_id
        +int usuario_id
        +string ip_address
        +string user_agent
        +int tiempo_reproducido
        +int porcentaje_visto
        +bool completado
        +datetime fecha_inicio
        +datetime fecha_fin
        +crear() int
        +actualizar(id, tiempo, porcentaje, completado) bool
        +obtenerPorVideo(videoId) array
        +obtenerPorUsuario(usuarioId) array
    }

    class DocenteAsignacion {
        +int id
        +int docente_id
        +int materia_id
        +int grado_id
        +string estado
        +datetime fecha_asignacion
        +int usuario_asignador_id
        +crear(docenteId, materiaId, gradoId, usuarioAsignadorId) int
        +obtenerPorDocente(docenteId) array
        +tieneAsignacion(docenteId, materiaId, gradoId) bool
        +tieneMateria(docenteId, materiaId) bool
        +tieneGrado(docenteId, gradoId) bool
        +asignarMultiples(docenteId, asignaciones, usuarioAsignadorId) bool
    }

    class Estadistica {
        +int id
        +string tipo
        +string categoria
        +json datos_json
        +date fecha_referencia
        +datetime fecha_generacion
        +obtenerGenerales() array
        +obtenerDashboard() array
        +generarDiarias(fecha) bool
        +obtenerPorDocente(docenteId) array
    }

    class Rol {
        +int id
        +string nombre
        +json permisos
        +string descripcion
        +string estado
        +obtenerTodos() array
        +obtenerPorId(id) array
    }

    %% Relaciones
    Usuario "N" --> "1" Rol : tiene
    Usuario "1" --> "N" Video : crea
    Usuario "1" --> "N" DocenteAsignacion : tiene
    Usuario "1" --> "N" Reproduccion : visualiza

    Video "N" --> "1" Usuario : creado por
    Video "N" --> "1" Materia : pertenece a
    Video "N" --> "1" Grado : para grado
    Video "N" --> "0..1" Tema : sobre tema
    Video "1" --> "N" Reproduccion : tiene

    Materia "N" --> "1" Campo : dentro de
    Materia "1" --> "N" Tema : contiene
    Materia "1" --> "N" DocenteAsignacion : asignada a

    Grado "1" --> "N" Tema : contiene
    Grado "1" --> "N" DocenteAsignacion : asignado a

    Tema "N" --> "1" Materia : pertenece a
    Tema "N" --> "1" Grado : para grado

    DocenteAsignacion "N" --> "1" Usuario : asigna docente
    DocenteAsignacion "N" --> "1" Materia : asigna materia
    DocenteAsignacion "N" --> "1" Grado : asigna grado
```

## Descripción

Este diagrama muestra las **10 clases principales** del modelo de datos del backend PHP:

- **Usuario**: Administradores y docentes del sistema
- **Video**: Catálogo de videos educativos
- **Materia**: Asignaturas del currículo boliviano (14 materias)
- **Grado**: Niveles de secundaria (1-6)
- **Campo**: Campos de saberes (4 campos)
- **Tema**: Temas específicos por materia y grado
- **Reproduccion**: Registro de visualizaciones
- **DocenteAsignacion**: Asignaciones docente-materia-grado
- **Estadistica**: Métricas del sistema
- **Rol**: Roles y permisos (Administrador, Docente)

### Relaciones Clave

- Un **Usuario** puede crear muchos **Videos**
- Un **Video** pertenece a una **Materia** y un **Grado**
- Las **Materias** pertenecen a un **Campo** de saberes
- **DocenteAsignacion** es la tabla central que relaciona docentes con combinaciones materia-grado
