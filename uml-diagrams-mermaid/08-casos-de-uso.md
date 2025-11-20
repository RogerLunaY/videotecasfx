# Diagrama de Casos de Uso

## Sistema Completo

```mermaid
flowchart LR
    subgraph Actores
        Admin[("👤 Administrador")]
        Docente[("👤 Docente")]
        Estudiante[("👤 Estudiante/Público")]
    end

    subgraph Sistema["Sistema Videoteca SFX"]
        subgraph Auth["Autenticación"]
            UC1([Iniciar sesión])
            UC2([Cerrar sesión])
            UC3([Renovar token])
        end

        subgraph GestionUsuarios["Gestión de Usuarios"]
            UC4([Crear usuario])
            UC5([Editar usuario])
            UC6([Eliminar usuario])
            UC7([Listar usuarios])
            UC8([Asignar materias/grados])
        end

        subgraph GestionVideos["Gestión de Videos"]
            UC9([Subir video])
            UC10([Editar video])
            UC11([Eliminar video])
            UC12([Listar videos])
            UC13([Buscar videos])
        end

        subgraph Reproduccion["Reproducción"]
            UC14([Ver video])
            UC15([Streaming video])
            UC16([Registrar progreso])
        end

        subgraph Estadisticas["Estadísticas"]
            UC17([Ver dashboard])
            UC18([Ver métricas por materia])
            UC19([Ver métricas por grado])
            UC20([Ver estadísticas propias])
        end

        subgraph Catalogo["Catálogo"]
            UC21([Ver materias])
            UC22([Ver grados])
            UC23([Ver temas])
            UC24([Ver campos de saberes])
        end
    end

    %% Administrador - Acceso completo
    Admin --> UC1
    Admin --> UC2
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC17
    Admin --> UC18
    Admin --> UC19

    %% Docente - Acceso limitado
    Docente --> UC1
    Docente --> UC2
    Docente --> UC9
    Docente --> UC10
    Docente --> UC11
    Docente --> UC12
    Docente --> UC13
    Docente --> UC14
    Docente --> UC20

    %% Estudiante/Público - Solo lectura
    Estudiante --> UC12
    Estudiante --> UC13
    Estudiante --> UC14
    Estudiante --> UC15
    Estudiante --> UC21
    Estudiante --> UC22
    Estudiante --> UC23
    Estudiante --> UC24
```

## Casos de Uso por Actor

### Administrador

```mermaid
flowchart TB
    Admin[("👤 Administrador")]

    subgraph Usuarios["Gestión de Usuarios"]
        A1([Crear usuario])
        A2([Editar usuario])
        A3([Eliminar usuario])
        A4([Listar usuarios])
        A5([Cambiar contraseña])
        A6([Asignar materias a docente])
        A7([Asignar grados a docente])
    end

    subgraph Videos["Gestión de Videos"]
        B1([Subir video])
        B2([Editar cualquier video])
        B3([Eliminar cualquier video])
        B4([Ver todos los videos])
    end

    subgraph Stats["Estadísticas"]
        C1([Ver dashboard general])
        C2([Ver métricas por materia])
        C3([Ver métricas por grado])
        C4([Ver tendencias])
        C5([Exportar reportes])
    end

    subgraph Config["Configuración"]
        D1([Gestionar roles])
        D2([Ver logs del sistema])
    end

    Admin --> Usuarios
    Admin --> Videos
    Admin --> Stats
    Admin --> Config
```

### Docente

```mermaid
flowchart TB
    Docente[("👤 Docente")]

    subgraph MisVideos["Mis Videos"]
        A1([Subir video])
        A2([Editar mis videos])
        A3([Eliminar mis videos])
        A4([Ver mis videos])
    end

    subgraph Restricciones["Restricciones"]
        R1{{"Solo materias asignadas"}}
        R2{{"Solo grados asignados"}}
    end

    subgraph MiPerfil["Mi Perfil"]
        B1([Ver mi perfil])
        B2([Editar mi perfil])
        B3([Cambiar mi contraseña])
    end

    subgraph MisStats["Mis Estadísticas"]
        C1([Ver mis métricas])
        C2([Ver reproducciones de mis videos])
    end

    Docente --> MisVideos
    MisVideos --> Restricciones
    Docente --> MiPerfil
    Docente --> MisStats
```

### Estudiante/Público

```mermaid
flowchart TB
    Est[("👤 Estudiante")]

    subgraph Explorar["Explorar Contenido"]
        A1([Ver catálogo de videos])
        A2([Buscar videos])
        A3([Filtrar por materia])
        A4([Filtrar por grado])
        A5([Filtrar por tema])
    end

    subgraph Ver["Ver Videos"]
        B1([Reproducir video])
        B2([Ver videos populares])
        B3([Ver videos recientes])
    end

    subgraph Navegacion["Navegación"]
        C1([Ver campos de saberes])
        C2([Ver materias])
        C3([Ver grados])
        C4([Ver temas])
    end

    Est --> Explorar
    Est --> Ver
    Est --> Navegacion
```

## Matriz de Permisos

| Caso de Uso | Admin | Docente | Público |
|-------------|:-----:|:-------:|:-------:|
| **Autenticación** |
| Iniciar sesión | ✅ | ✅ | ❌ |
| Cerrar sesión | ✅ | ✅ | ❌ |
| **Usuarios** |
| Crear usuario | ✅ | ❌ | ❌ |
| Editar usuario | ✅ | Solo propio | ❌ |
| Eliminar usuario | ✅ | ❌ | ❌ |
| Asignar materias/grados | ✅ | ❌ | ❌ |
| **Videos** |
| Subir video | ✅ | ✅* | ❌ |
| Editar video | ✅ | Solo propios | ❌ |
| Eliminar video | ✅ | Solo propios | ❌ |
| Ver videos | ✅ | ✅ | ✅ |
| Buscar videos | ✅ | ✅ | ✅ |
| **Estadísticas** |
| Ver dashboard | ✅ | ❌ | ❌ |
| Ver métricas generales | ✅ | ❌ | ❌ |
| Ver estadísticas propias | ✅ | ✅ | ❌ |

*Solo para materias y grados asignados

## Relaciones entre Casos de Uso

```mermaid
flowchart TB
    UC1([Subir video])
    UC2([Validar permisos])
    UC3([Procesar archivo])
    UC4([Extraer metadatos])
    UC5([Generar thumbnail])
    UC6([Registrar en BD])

    UC1 -->|include| UC2
    UC1 -->|include| UC3
    UC3 -->|include| UC4
    UC3 -->|include| UC5
    UC1 -->|include| UC6

    UC7([Ver video])
    UC8([Streaming])
    UC9([Registrar reproducción])

    UC7 -->|include| UC8
    UC7 -->|include| UC9

    UC10([Gestionar asignaciones])
    UC11([Verificar docente existe])
    UC12([Validar materias/grados])

    UC10 -->|include| UC11
    UC10 -->|include| UC12
```
