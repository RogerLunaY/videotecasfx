# Diseño de Interfaz Gráfica (Mock-ups)

## 1. Login

### Estructura
```
+--------------------------------------------------+
|                    VIDEOTECA SFX                  |
|                                                   |
|              [Logo del Sistema]                   |
|                                                   |
|     +------------------------------------+        |
|     |  Email                             |        |
|     |  [________________________]        |        |
|     +------------------------------------+        |
|                                                   |
|     +------------------------------------+        |
|     |  Contraseña                        |        |
|     |  [________________________] [👁️]   |        |
|     +------------------------------------+        |
|                                                   |
|     [    INICIAR SESIÓN    ]                     |
|                                                   |
|     ¿Olvidaste tu contraseña?                    |
+--------------------------------------------------+
```

### Elementos
- **Logo:** Centrado en la parte superior
- **Campo Email:** Input tipo email, placeholder "correo@ejemplo.com"
- **Campo Contraseña:** Input tipo password con botón mostrar/ocultar
- **Botón Login:** Color primario, ancho completo
- **Mensaje de error:** Área roja debajo del formulario (si aplica)

### Validaciones
- Email: Formato válido requerido
- Contraseña: Mínimo 6 caracteres
- Mostrar intentos restantes si hay bloqueo

---

## 2. Dashboard Admin

### Estructura
```
+--------------------------------------------------+
| [≡] VIDEOTECA SFX              [🔔] [👤 Admin ▼] |
+--------------------------------------------------+
| Sidebar    |  DASHBOARD                           |
|            |                                      |
| Dashboard  |  +----------+ +----------+ +-------+ |
| Usuarios   |  | 👥 45    | | 🎬 328   | | 👁️ 5.2K| |
| Asignac.   |  | Usuarios | | Videos   | | Vistas | |
| Videos     |  +----------+ +----------+ +-------+ |
| Estadíst.  |                                      |
| Catálogo   |  VIDEOS POR MATERIA                  |
|            |  [Gráfico de barras horizontales]    |
|            |  Matemáticas    ████████ 45          |
|            |  Física         █████ 32             |
|            |  Química        ████ 28              |
|            |                                      |
|            |  VIDEOS RECIENTES                    |
|            |  +--------------------------------+  |
|            |  | Título | Docente | Fecha      |  |
|            |  | Video1 | Juan P. | 15/01/2025 |  |
|            |  | Video2 | María G.| 14/01/2025 |  |
|            |  +--------------------------------+  |
+--------------------------------------------------+
```

### Elementos
- **Header:** Logo, notificaciones, menú usuario
- **Sidebar:** Navegación principal colapsable
- **Cards de resumen:** 3 tarjetas con iconos y números
- **Gráfico:** Barras horizontales por materia
- **Tabla:** Últimos 5 videos subidos
- **Accesos rápidos:** Botones a acciones frecuentes

---

## 3. Lista de Usuarios

### Estructura
```
+--------------------------------------------------+
| GESTIÓN DE USUARIOS                [+ Nuevo Usuario]|
+--------------------------------------------------+
| Filtros:                                          |
| [Buscar...        ] [Rol ▼] [Estado ▼] [Filtrar] |
+--------------------------------------------------+
| □ | Nombre       | Email          | Rol    | Est.|
+--------------------------------------------------+
| □ | Juan Pérez   | juan@mail.com  | Docente| 🟢  |
| □ | María García | maria@mail.com | Admin  | 🟢  |
| □ | Pedro López  | pedro@mail.com | Docente| 🔴  |
+--------------------------------------------------+
| Acciones: [Editar] [Asignar] [Eliminar]          |
+--------------------------------------------------+
| Mostrando 1-10 de 45    [<] [1] [2] [3] [>]      |
+--------------------------------------------------+
```

### Elementos
- **Título:** Con botón de crear nuevo
- **Filtros:** Búsqueda, dropdown rol, dropdown estado
- **Tabla:** Checkbox, columnas ordenables
- **Estado:** Indicador visual verde/rojo
- **Acciones:** Botones contextuales según selección
- **Paginación:** Navegación entre páginas

### Acciones por fila
- Editar (lápiz)
- Asignar materias/grados (si es docente)
- Cambiar contraseña
- Eliminar (papelera)

---

## 4. Crear Usuario

### Estructura
```
+--------------------------------------------------+
| NUEVO USUARIO                                     |
+--------------------------------------------------+
| Datos Personales                                  |
| +----------------------+ +---------------------+  |
| | Nombre *             | | Apellido Paterno * |  |
| | [________________]   | | [________________] |  |
| +----------------------+ +---------------------+  |
|                                                   |
| +----------------------+ +---------------------+  |
| | Apellido Materno     | | CI *                |  |
| | [________________]   | | [________________] |  |
| +----------------------+ +---------------------+  |
|                                                   |
| Credenciales                                      |
| +----------------------+ +---------------------+  |
| | Email *              | | Teléfono            |  |
| | [________________]   | | [________________] |  |
| +----------------------+ +---------------------+  |
|                                                   |
| +----------------------+ +---------------------+  |
| | Contraseña *         | | Confirmar *         |  |
| | [________________]   | | [________________] |  |
| +----------------------+ +---------------------+  |
|                                                   |
| Configuración                                     |
| +----------------------+                          |
| | Rol *                |                          |
| | [Docente         ▼]  |                          |
| +----------------------+                          |
|                                                   |
| [Cancelar]                    [Guardar Usuario]   |
+--------------------------------------------------+
```

### Elementos
- **Secciones:** Agrupación lógica de campos
- **Campos obligatorios:** Marcados con asterisco (*)
- **Validación en tiempo real:** Bordes rojos si error
- **Botones:** Cancelar (secundario), Guardar (primario)

### Validaciones
- Nombre/Apellidos: Solo letras
- CI: Único, alfanumérico
- Email: Formato válido, único
- Contraseña: Mínimo 6 caracteres, coincidir

---

## 5. Editar Usuario

### Estructura
```
+--------------------------------------------------+
| EDITAR USUARIO: Juan Pérez                        |
+--------------------------------------------------+
| [Foto de perfil]  Cambiar foto                    |
|                                                   |
| Datos Personales                                  |
| (Mismos campos que Crear, prellenados)            |
|                                                   |
| Seguridad                                         |
| [Cambiar Contraseña]  [Desbloquear Usuario]       |
|                                                   |
| Estado                                            |
| (○) Activo  ( ) Inactivo                          |
|                                                   |
| Información                                       |
| Creado: 15/01/2025 10:30                          |
| Último acceso: 20/01/2025 15:45                   |
|                                                   |
| [Cancelar]                    [Guardar Cambios]   |
+--------------------------------------------------+
```

### Elementos adicionales
- **Foto de perfil:** Con opción de cambiar
- **Botón cambiar contraseña:** Abre modal
- **Estado:** Radio buttons
- **Información de auditoría:** Solo lectura

---

## 6. Gestión de Asignaciones

### Estructura
```
+--------------------------------------------------+
| ASIGNACIONES: Juan Pérez (Docente)                |
+--------------------------------------------------+
| Asignaciones Actuales                             |
| +----------------------------------------------+ |
| | Materia      | Grados              | Acción  | |
| | Matemáticas  | 1°, 2°, 3°          | [🗑️]    | |
| | Física       | 4°, 5°              | [🗑️]    | |
| +----------------------------------------------+ |
|                                                   |
| Nueva Asignación                                  |
| +--------------------+ +----------------------+   |
| | Materia            | | Grados              |   |
| | [Seleccionar... ▼] | | [☑️1° ☑️2° ☐3°...] |   |
| +--------------------+ +----------------------+   |
|                                                   |
| [+ Agregar Asignación]                            |
|                                                   |
| [Cancelar]                    [Guardar Todo]      |
+--------------------------------------------------+
```

### Elementos
- **Lista actual:** Tabla con asignaciones existentes
- **Selector materia:** Dropdown con materias
- **Selector grados:** Checkboxes múltiples
- **Agregar:** Añade a la lista temporal
- **Guardar:** Confirma todos los cambios

---

## 7. Dashboard Docente

### Estructura
```
+--------------------------------------------------+
| [≡] VIDEOTECA SFX           [🔔] [👤 Docente ▼]  |
+--------------------------------------------------+
| Sidebar    |  MIS ESTADÍSTICAS                    |
|            |                                      |
| Inicio     |  +----------+ +----------+ +-------+ |
| Mis Videos |  | 🎬 12    | | 👁️ 456   | | ⏱️ 8h  | |
| Subir      |  | Videos   | | Vistas   | | Tiempo | |
| Mi Perfil  |  +----------+ +----------+ +-------+ |
|            |                                      |
|            |  MIS VIDEOS MÁS VISTOS               |
|            |  1. Ecuaciones lineales - 89 vistas  |
|            |  2. Triángulos - 67 vistas           |
|            |  3. Funciones - 54 vistas            |
|            |                                      |
|            |  [+ SUBIR NUEVO VIDEO]               |
|            |                                      |
|            |  MIS ÚLTIMOS VIDEOS                  |
|            |  +--------------------------------+  |
|            |  | [img] Título      | 15/01/2025 |  |
|            |  | [img] Título      | 14/01/2025 |  |
|            |  +--------------------------------+  |
+--------------------------------------------------+
```

### Elementos
- **Cards:** Resumen de mis métricas
- **Lista populares:** Top 3 videos propios
- **Botón subir:** Acceso rápido prominente
- **Videos recientes:** Con thumbnail

---

## 8. Mis Videos (Docente)

### Estructura
```
+--------------------------------------------------+
| MIS VIDEOS                        [+ Subir Video] |
+--------------------------------------------------+
| Filtros:                                          |
| [Buscar...    ] [Materia ▼] [Grado ▼] [Filtrar]  |
+--------------------------------------------------+
| Vista: [📋 Lista] [📦 Grid]                       |
+--------------------------------------------------+
| +-----------------------------------------------+ |
| | [Thumbnail] | Ecuaciones de primer grado      | |
| |             | Matemáticas - 1° Secundaria     | |
| |             | 👁️ 89 vistas | ⏱️ 15:30         | |
| |             | [Editar] [Eliminar]             | |
| +-----------------------------------------------+ |
| +-----------------------------------------------+ |
| | [Thumbnail] | Triángulos y sus propiedades    | |
| |             | Matemáticas - 2° Secundaria     | |
| |             | 👁️ 67 vistas | ⏱️ 12:45         | |
| |             | [Editar] [Eliminar]             | |
| +-----------------------------------------------+ |
+--------------------------------------------------+
```

### Elementos
- **Filtros:** Búsqueda y dropdowns
- **Toggle vista:** Lista o cuadrícula
- **Card video:** Thumbnail, título, metadata, acciones
- **Indicadores:** Vistas, duración

---

## 9. Subir Video

### Estructura
```
+--------------------------------------------------+
| SUBIR NUEVO VIDEO                                 |
+--------------------------------------------------+
| Archivo de Video *                                |
| +----------------------------------------------+ |
| |                                              | |
| |    [📁 Arrastra el video aquí o haz clic]    | |
| |                                              | |
| |    Formatos: MP4, AVI, MOV, MKV              | |
| |    Tamaño máximo: 500 MB                     | |
| +----------------------------------------------+ |
| video_ejemplo.mp4 (45 MB) ✅                      |
|                                                   |
| Información del Video                             |
| +----------------------+ +---------------------+  |
| | Título *             | | Descripción         |  |
| | [________________]   | | [                 ] |  |
| +----------------------+ | [                 ] |  |
|                          | [_________________] |  |
| +----------------------+ +---------------------+  |
| | Materia *            |                          |
| | [Matemáticas     ▼]  |                          |
| +----------------------+                          |
|                                                   |
| +----------------------+ +---------------------+  |
| | Grado *              | | Tema                |  |
| | [1° Secundaria   ▼]  | | [Ecuaciones    ▼]  |  |
| +----------------------+ +---------------------+  |
|                                                   |
| Thumbnail (opcional)                              |
| [📷 Seleccionar imagen] o generación automática   |
|                                                   |
| [Cancelar]                        [Subir Video]   |
+--------------------------------------------------+
```

### Elementos
- **Dropzone:** Área de arrastrar y soltar
- **Progreso:** Barra de subida
- **Campos:** Título, descripción, materia, grado, tema
- **Thumbnail:** Opcional, preview si se sube
- **Validación:** Solo materias/grados asignados

### Estados
- Seleccionando archivo
- Subiendo (progreso %)
- Procesando (extrayendo metadatos)
- Completado

---

## 10. Editar Video

### Estructura
```
+--------------------------------------------------+
| EDITAR VIDEO                                      |
+--------------------------------------------------+
| Preview                                           |
| +--------------------+                            |
| | [Thumbnail actual] |  Cambiar thumbnail         |
| +--------------------+  [📷 Seleccionar]          |
|                                                   |
| Información                                       |
| (Mismos campos que Subir, prellenados)            |
|                                                   |
| Metadatos (solo lectura)                          |
| Duración: 15:30 | Resolución: 1920x1080           |
| Formato: MP4    | Tamaño: 45 MB                   |
|                                                   |
| Estadísticas                                      |
| Visualizaciones: 89 | Subido: 15/01/2025          |
|                                                   |
| [Cancelar]                    [Guardar Cambios]   |
+--------------------------------------------------+
```

---

## 11. Página Principal (Público)

### Estructura
```
+--------------------------------------------------+
| VIDEOTECA SFX                    [🔍] [Iniciar]   |
+--------------------------------------------------+
|                                                   |
| VIDEOS EDUCATIVOS PARA SECUNDARIA                 |
| [Buscar videos...                      ] [🔍]     |
|                                                   |
| CAMPOS DE SABERES                                 |
| +----------+ +----------+ +----------+ +--------+ |
| |Comunidad | |Ciencia   | |Vida      | |Cosmos  | |
| |Sociedad  | |Tecnología| |Tierra    | |Pensam. | |
| +----------+ +----------+ +----------+ +--------+ |
|                                                   |
| VIDEOS POPULARES                                  |
| +--------+ +--------+ +--------+ +--------+       |
| |[thumb] | |[thumb] | |[thumb] | |[thumb] |       |
| |Título  | |Título  | |Título  | |Título  |       |
| |👁️ 234  | |👁️ 189  | |👁️ 156  | |👁️ 143  |       |
| +--------+ +--------+ +--------+ +--------+       |
|                                                   |
| VIDEOS RECIENTES                                  |
| +--------+ +--------+ +--------+ +--------+       |
| |[thumb] | |[thumb] | |[thumb] | |[thumb] |       |
| |Título  | |Título  | |Título  | |Título  |       |
| |Fecha   | |Fecha   | |Fecha   | |Fecha   |       |
| +--------+ +--------+ +--------+ +--------+       |
|                                                   |
| [Ver todos los videos]                            |
+--------------------------------------------------+
```

### Elementos
- **Header:** Logo, búsqueda, login
- **Hero:** Título y barra de búsqueda principal
- **Campos:** 4 cards con iconos/colores
- **Carruseles:** Videos populares y recientes
- **Footer:** Links, información

---

## 12. Búsqueda de Videos

### Estructura
```
+--------------------------------------------------+
| RESULTADOS PARA: "ecuaciones"                     |
+--------------------------------------------------+
| Filtros                    | Resultados (45)      |
| +-----------------------+  |                      |
| | Materia               |  | Ordenar: [Relevancia▼]|
| | [ ] Matemáticas (23)  |  |                      |
| | [ ] Física (12)       |  | +------------------+ |
| | [ ] Química (10)      |  | |[thumb]           | |
| +-----------------------+  | |Ecuaciones de 1er | |
| | Grado                 |  | |grado             | |
| | [ ] 1° (15)           |  | |Matemáticas - 1°  | |
| | [ ] 2° (18)           |  | |👁️ 89 | ⏱️ 15:30  | |
| | [ ] 3° (12)           |  | +------------------+ |
| +-----------------------+  | +------------------+ |
|                            | |[thumb]           | |
| [Limpiar filtros]          | |Ecuaciones cuadrát| |
|                            | |Matemáticas - 3°  | |
|                            | |👁️ 67 | ⏱️ 20:15  | |
|                            | +------------------+ |
|                            |                      |
|                            | [Cargar más]         |
+--------------------------------------------------+
```

### Elementos
- **Sidebar filtros:** Checkboxes con conteo
- **Ordenamiento:** Dropdown (relevancia, fecha, vistas)
- **Cards resultado:** Thumbnail, título, metadata
- **Paginación:** Scroll infinito o botón

---

## 13. Reproductor de Video

### Estructura
```
+--------------------------------------------------+
| ← Volver                                          |
+--------------------------------------------------+
| +----------------------------------------------+ |
| |                                              | |
| |                                              | |
| |              [REPRODUCTOR VIDEO]             | |
| |                                              | |
| |  [▶️]   advancement bar  [🔊] [⛶]             | |
| +----------------------------------------------+ |
|                                                   |
| Ecuaciones de primer grado                        |
| 👁️ 89 visualizaciones | Subido: 15/01/2025        |
|                                                   |
| Descripción                                       |
| En este video aprenderemos a resolver ecuaciones  |
| de primer grado con una incógnita...              |
| [Leer más]                                        |
|                                                   |
| Información                                       |
| Materia: Matemáticas    Grado: 1° Secundaria      |
| Tema: Ecuaciones        Docente: Juan Pérez       |
| Duración: 15:30         Formato: MP4 1080p        |
|                                                   |
| VIDEOS RELACIONADOS                               |
| +--------+ +--------+ +--------+                  |
| |[thumb] | |[thumb] | |[thumb] |                  |
| +--------+ +--------+ +--------+                  |
+--------------------------------------------------+
```

### Elementos
- **Navegación:** Botón volver
- **Player:** Controles estándar (play, volumen, fullscreen)
- **Metadata:** Título, vistas, fecha
- **Descripción:** Expandible
- **Info:** Materia, grado, tema, docente
- **Relacionados:** Sugerencias

---

## 14. Mi Perfil

### Estructura
```
+--------------------------------------------------+
| MI PERFIL                                         |
+--------------------------------------------------+
| +-------------+                                   |
| | [Foto]      |  Juan Pérez García                |
| |             |  juan.perez@mail.com              |
| | [Cambiar]   |  Docente                          |
| +-------------+                                   |
|                                                   |
| Datos Personales                    [Editar]      |
| +----------------------------------------------+ |
| | Nombre: Juan                                  | |
| | Apellido Paterno: Pérez                       | |
| | Apellido Materno: García                      | |
| | CI: 12345678                                  | |
| | Teléfono: 70012345                            | |
| +----------------------------------------------+ |
|                                                   |
| Seguridad                                         |
| [Cambiar Contraseña]                              |
|                                                   |
| Mis Asignaciones (solo docente)                   |
| +----------------------------------------------+ |
| | Matemáticas: 1°, 2°, 3° Secundaria            | |
| | Física: 4°, 5° Secundaria                     | |
| +----------------------------------------------+ |
|                                                   |
| Información de la Cuenta                          |
| Creado: 15/01/2025 | Último acceso: 20/01/2025    |
+--------------------------------------------------+
```

---

## 15. Catálogo

### Estructura
```
+--------------------------------------------------+
| EXPLORAR CATÁLOGO                                 |
+--------------------------------------------------+
| Breadcrumb: Inicio > Ciencia y Tecnología > Mat.  |
+--------------------------------------------------+
|                                                   |
| CIENCIA, TECNOLOGÍA Y PRODUCCIÓN                  |
|                                                   |
| Materias:                                         |
| +----------+ +----------+ +----------+            |
| |Matemática| |Física    | |Química   |            |
| |  📐      | |  ⚛️       | |  🧪      |            |
| | 45 videos| | 32 videos| | 28 videos|            |
| +----------+ +----------+ +----------+            |
|                                                   |
| MATEMÁTICAS                                       |
|                                                   |
| Selecciona un grado:                              |
| [1°] [2°] [3°] [4°] [5°] [6°]                     |
|                                                   |
| Temas de 1° Secundaria:                           |
| • Números naturales (5 videos)                    |
| • Ecuaciones (8 videos)                           |
| • Geometría básica (6 videos)                     |
| • Fracciones (4 videos)                           |
|                                                   |
| [Ver todos los videos de Matemáticas 1°]          |
+--------------------------------------------------+
```

---

## 16. Estadísticas (Admin)

### Estructura
```
+--------------------------------------------------+
| ESTADÍSTICAS DEL SISTEMA                          |
+--------------------------------------------------+
| Período: [Última semana ▼]  [Exportar PDF]        |
+--------------------------------------------------+
|                                                   |
| RESUMEN GENERAL                                   |
| +----------+ +----------+ +----------+ +--------+ |
| | 👥 45    | | 🎬 328   | | 👁️ 5,234 | | ⏱️ 156h| |
| | Usuarios | | Videos   | | Vistas   | | Tiempo | |
| +----------+ +----------+ +----------+ +--------+ |
|                                                   |
| TENDENCIA DE VISUALIZACIONES                      |
| [Gráfico de línea temporal]                       |
| ^                                                 |
| |    /\    /\                                     |
| |   /  \  /  \   /\                               |
| |  /    \/    \_/  \                              |
| +------------------------->                       |
| Lun Mar Mie Jue Vie Sab Dom                       |
|                                                   |
| VIDEOS POR MATERIA          | TOP 5 DOCENTES     |
| [Gráfico pastel]            | 1. Juan P. - 45    |
|    ████ Mat 35%             | 2. María G. - 38   |
|    ███ Fís 25%              | 3. Pedro L. - 32   |
|    ██ Quím 20%              | 4. Ana S. - 28     |
|    █ Otros 20%              | 5. Luis M. - 25    |
+--------------------------------------------------+
```

### Elementos
- **Filtro período:** Dropdown temporal
- **Exportar:** Botón para PDF/Excel
- **Cards resumen:** Métricas principales
- **Gráfico línea:** Tendencia temporal
- **Gráfico pastel:** Distribución por materia
- **Ranking:** Top docentes por videos

---

## Guía de Estilos

### Colores
- **Primario:** Azul (#1976D2)
- **Secundario:** Verde (#4CAF50)
- **Error:** Rojo (#F44336)
- **Warning:** Naranja (#FF9800)
- **Texto:** Negro (#212121)
- **Fondo:** Gris claro (#FAFAFA)

### Tipografía
- **Títulos:** Roboto Bold
- **Cuerpo:** Roboto Regular
- **Tamaños:** H1(24px), H2(20px), H3(16px), Body(14px)

### Componentes
- **Botones:** Redondeados, sombra suave
- **Cards:** Borde redondeado, sombra
- **Inputs:** Borde gris, focus azul
- **Tablas:** Cabecera oscura, filas alternas

### Responsive
- **Desktop:** > 1024px (sidebar visible)
- **Tablet:** 768-1024px (sidebar colapsable)
- **Mobile:** < 768px (menú hamburguesa)
