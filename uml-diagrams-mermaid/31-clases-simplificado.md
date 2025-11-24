# Diagrama de Clases Simplificado - Videoteca SFX

**Sistema de Biblioteca Digital de Videos Educativos**
Versión simplificada enfocada en las entidades principales y sus relaciones clave.

---

## Diagrama

```mermaid
classDiagram
    %% === ENTIDADES PRINCIPALES ===

    class Usuario {
        +id: int
        +nombre: string
        +email: string
        +ci: string
        +rol_id: int
        +estado: enum
        +login()
        +actualizarPerfil()
    }

    class Rol {
        +id: int
        +nombre: string
        +permisos: JSON
        +verificarPermiso()
    }

    class Video {
        +id: int
        +titulo: string
        +archivo_path: string
        +materia_id: int
        +grado_id: int
        +docente_id: int
        +visualizaciones: int
        +estado: enum
        +reproducir()
        +incrementarVistas()
    }

    class Materia {
        +id: int
        +campo_id: int
        +nombre: string
        +sigla: string
        +obtenerVideos()
    }

    class Grado {
        +id: int
        +nombre: string
        +nivel: int
        +obtenerVideos()
    }

    class Campo {
        +id: int
        +nombre: string
        +obtenerMaterias()
    }

    class Tema {
        +id: int
        +nombre: string
        +materia_id: int
        +grado_id: int
    }

    class Asignacion {
        +id: int
        +docente_id: int
        +materia_id: int
        +grado_id: int
        +estado: enum
        +verificarPermiso()
    }

    class Reproduccion {
        +id: int
        +video_id: int
        +tiempo_reproducido: int
        +completado: bool
        +registrar()
    }

    %% === RELACIONES PRINCIPALES ===

    %% Usuario - Rol
    Usuario "N" --> "1" Rol : tiene

    %% Usuario - Asignación (Docentes)
    Usuario "1" --> "N" Asignacion : tiene

    %% Video - Usuario (Docente)
    Usuario "1" --> "N" Video : crea

    %% Video - Materia/Grado/Tema
    Video "N" --> "1" Materia : pertenece a
    Video "N" --> "1" Grado : pertenece a
    Video "N" --> "0..1" Tema : clasifica en

    %% Asignación - Materia/Grado
    Asignacion "N" --> "1" Materia : asigna
    Asignacion "N" --> "1" Grado : asigna

    %% Materia - Campo
    Materia "N" --> "1" Campo : pertenece a

    %% Tema - Materia/Grado
    Tema "N" --> "1" Materia : pertenece a
    Tema "N" --> "1" Grado : pertenece a

    %% Video - Reproducción
    Video "1" --> "N" Reproduccion : tiene

    %% === NOTAS ===
    note for Usuario "Roles: Administrador, Docente"
    note for Video "Estados: activo, inactivo, procesando, error"
    note for Asignacion "Permite a un docente enseñar\nuna materia en un grado específico"
    note for Campo "4 Campos del currículo boliviano:\n- Vida Tierra Territorio\n- Ciencia Tecnología Producción\n- Comunidad y Sociedad\n- Cosmos y Pensamiento"
```

---

## Descripción de las Entidades

### 👤 **Usuario**
Representa a los usuarios del sistema (Administradores y Docentes).

**Atributos principales:**
- `id`: Identificador único
- `nombre`, `email`, `ci`: Datos personales
- `rol_id`: Define si es Admin o Docente
- `estado`: activo, inactivo, suspendido

**Operaciones:**
- Login al sistema
- Actualizar perfil

---

### 🎭 **Rol**
Define los permisos de cada tipo de usuario.

**Roles disponibles:**
- **Administrador**: Control total del sistema
- **Docente**: Gestión de sus propios videos

---

### 🎥 **Video**
Contenido educativo del sistema.

**Atributos principales:**
- `titulo`: Nombre del video
- `archivo_path`: Ubicación del archivo
- `visualizaciones`: Contador de reproducciones
- `estado`: activo, inactivo, procesando, error

**Relaciones:**
- Pertenece a una **Materia** y **Grado**
- Opcionalmente clasifica en un **Tema**
- Creado por un **Usuario** (Docente)

---

### 📚 **Materia**
Asignatura del currículo educativo boliviano.

**Ejemplos:**
- Matemática
- Física
- Lengua Castellana
- Biología-Geografía

**Relación:**
- Pertenece a un **Campo** de saberes

---

### 🎓 **Grado**
Nivel educativo (1ro a 6to de secundaria).

**Atributos:**
- `nivel`: 1, 2, 3, 4, 5, 6

---

### 🌍 **Campo**
Campos de Saberes y Conocimientos del currículo boliviano.

**4 Campos:**
1. **Vida Tierra Territorio**: Ciencias Naturales
2. **Ciencia Tecnología Producción**: Matemática, TTG
3. **Comunidad y Sociedad**: Lenguajes, Sociales, Artes
4. **Cosmos y Pensamiento**: Filosofía, Valores

---

### 📖 **Tema**
Contenido específico dentro de una materia y grado.

**Ejemplo:**
- Materia: Matemática
- Grado: 1ro de Secundaria
- Tema: "Números Enteros Aplicados a la Cotidianidad"

---

### 🔗 **Asignación**
Relaciona un Docente con una Materia en un Grado específico.

**Función:**
Permite al sistema saber:
- ¿Qué materias enseña cada docente?
- ¿En qué grados puede subir videos?

**Ejemplo:**
- Roger Luna → Matemática → 4to, 5to, 6to

---

### ▶️ **Reproducción**
Registro de cada vez que se reproduce un video.

**Atributos:**
- `tiempo_reproducido`: Segundos vistos
- `completado`: Si vio el video completo
- `porcentaje_visto`: % del video reproducido

---

## Relaciones Clave

### 1️⃣ **Usuario tiene Rol**
- Cada usuario tiene un único rol
- Define los permisos del usuario

### 2️⃣ **Usuario tiene Asignaciones** (Docentes)
- Un docente puede tener múltiples asignaciones
- Cada asignación = Materia + Grado

### 3️⃣ **Usuario crea Videos** (Docentes)
- Un docente crea múltiples videos
- Solo para materias/grados asignados

### 4️⃣ **Video pertenece a Materia y Grado**
- Clasificación curricular del video
- Obligatorio para todos los videos

### 5️⃣ **Materia pertenece a Campo**
- Organización del currículo boliviano
- 14 materias en 4 campos

### 6️⃣ **Video tiene Reproducciones**
- Registro de visualizaciones
- Estadísticas del sistema

---

## Flujo Principal

```
1. ADMINISTRADOR crea usuarios DOCENTES
2. ADMINISTRADOR asigna MATERIAS y GRADOS a docentes (Asignaciones)
3. DOCENTE sube VIDEOS de sus materias asignadas
4. ESTUDIANTES (anónimos) reproducen videos
5. SISTEMA registra Reproducciones
6. SISTEMA genera estadísticas
```

---

## Reglas de Negocio

### ✅ **Permisos de Docentes**
- Solo pueden subir videos de materias/grados que tienen asignados
- Verificación mediante tabla `asignaciones`

### ✅ **Clasificación de Videos**
- Todo video debe tener: Materia + Grado
- Tema es opcional

### ✅ **Estructura Curricular**
```
Campo (4)
  └─ Materia (14)
       └─ Tema (múltiples por materia/grado)
```

### ✅ **Control de Acceso**
- **Administrador**: Acceso completo
- **Docente**: Solo sus videos y materias
- **Público**: Solo visualización

---

## Diferencias con Diagrama Completo

Este diagrama **simplificado** omite:
- ❌ Tokens de autenticación
- ❌ Logs del sistema
- ❌ Estadísticas
- ❌ Atributos de auditoría (fechas, timestamps)
- ❌ Atributos técnicos (thumbnails, codec, formato)
- ❌ Métodos detallados de cada clase

**Propósito:** Facilitar la comprensión general del sistema sin detalles técnicos.

---

## Tecnologías

- **Backend**: PHP 8.x con PDO
- **Base de Datos**: MySQL/MariaDB
- **Patrón**: MVC + Repository
- **Autenticación**: JWT (HMAC-SHA256)
- **Frontend**: React (Web) + React Native (Móvil)

---

**Autor**: Roger Omar Luna Yujra
**Institución**: U.E. San Francisco Xavier
**Proyecto**: Videoteca SFX - Sistema de Biblioteca Digital de Videos Educativos
**Fecha**: 2024
