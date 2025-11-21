# Casos de Uso - Versión Simplificada

## Diagrama General

```mermaid
flowchart LR
    Admin[("👤 Admin")]
    Docente[("👤 Docente")]
    Publico[("👤 Público")]

    subgraph Sistema["Videoteca SFX"]
        UC1([Gestionar Usuarios])
        UC2([Gestionar Videos])
        UC3([Ver Estadísticas])
        UC4([Reproducir Videos])
        UC5([Buscar Videos])
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5

    Docente --> UC2
    Docente --> UC4
    Docente --> UC5

    Publico --> UC4
    Publico --> UC5
```

## Por Actor

### Administrador

```mermaid
flowchart LR
    Admin[("👤 Admin")]

    UC1([Crear/Editar/Eliminar Usuarios])
    UC2([Asignar Materias y Grados])
    UC3([Subir/Editar/Eliminar Videos])
    UC4([Ver Dashboard y Estadísticas])
    UC5([Ver Logs del Sistema])

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
```

### Docente

```mermaid
flowchart LR
    Docente[("👤 Docente")]

    UC1([Subir Videos])
    UC2([Editar/Eliminar Mis Videos])
    UC3([Ver Mis Estadísticas])
    UC4([Editar Mi Perfil])

    Docente --> UC1
    Docente --> UC2
    Docente --> UC3
    Docente --> UC4

    Note["⚠️ Solo para materias<br/>y grados asignados"]
```

### Público/Estudiante

```mermaid
flowchart LR
    Publico[("👤 Público")]

    UC1([Ver Catálogo de Videos])
    UC2([Buscar Videos])
    UC3([Reproducir Videos])
    UC4([Navegar por Materias/Grados])

    Publico --> UC1
    Publico --> UC2
    Publico --> UC3
    Publico --> UC4
```

## Resumen de Permisos

| Función | Admin | Docente | Público |
|---------|:-----:|:-------:|:-------:|
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Asignar materias/grados | ✅ | ❌ | ❌ |
| Subir videos | ✅ | ✅* | ❌ |
| Editar/eliminar videos | ✅ | Solo propios | ❌ |
| Ver estadísticas | ✅ | Solo propias | ❌ |
| Buscar/ver videos | ✅ | ✅ | ✅ |

*Solo para materias y grados asignados
