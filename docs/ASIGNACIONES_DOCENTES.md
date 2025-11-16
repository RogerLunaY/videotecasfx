# Sistema de Asignación de Materias y Grados a Docentes

## 📋 Descripción General

El sistema de asignaciones permite a los administradores asignar materias y grados específicos a cada docente. Una vez asignados, los docentes solo podrán subir y gestionar videos para las materias y grados que tienen asignados.

## 🎯 Objetivo

Implementar control granular sobre qué materias y grados puede gestionar cada docente, asegurando que:
- Los docentes solo suban videos relevantes a sus áreas asignadas
- No puedan crear contenido fuera de su competencia
- Los administradores tengan control total sobre las asignaciones

## 📊 Arquitectura de la Solución

### Base de Datos

Se crearon dos tablas de relación N:M (muchos a muchos):

#### 1. `docente_materias`

Relaciona docentes con materias asignadas.

```sql
CREATE TABLE docente_materias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    docente_id INT UNSIGNED NOT NULL,
    materia_id INT UNSIGNED NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INT UNSIGNED,

    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL,

    UNIQUE KEY unique_docente_materia (docente_id, materia_id),
    INDEX idx_docente (docente_id),
    INDEX idx_materia (materia_id)
);
```

**Campos:**
- `id`: Identificador único de la asignación
- `docente_id`: ID del docente (FK a usuarios)
- `materia_id`: ID de la materia (FK a materias)
- `fecha_asignacion`: Fecha y hora de la asignación
- `asignado_por`: ID del administrador que hizo la asignación

**Restricciones:**
- Un docente no puede tener la misma materia asignada dos veces (UNIQUE)
- Si se elimina el docente, se eliminan sus asignaciones (CASCADE)
- Si se elimina la materia, se eliminan las asignaciones (CASCADE)

#### 2. `docente_grados`

Relaciona docentes con grados/cursos asignados.

```sql
CREATE TABLE docente_grados (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    docente_id INT UNSIGNED NOT NULL,
    grado_id INT UNSIGNED NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    asignado_por INT UNSIGNED,

    FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(id) ON DELETE SET NULL,

    UNIQUE KEY unique_docente_grado (docente_id, grado_id),
    INDEX idx_docente (docente_id),
    INDEX idx_grado (grado_id)
);
```

**Campos:** Idénticos a docente_materias pero para grados.

#### 3. Vista `vista_docentes_asignaciones`

Vista SQL que facilita la consulta de todas las asignaciones de un docente:

```sql
CREATE OR REPLACE VIEW vista_docentes_asignaciones AS
SELECT
    u.id as docente_id,
    u.nombre,
    u.apellido_paterno,
    u.email,
    GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') as materias_asignadas,
    GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.nivel SEPARATOR ', ') as grados_asignados,
    COUNT(DISTINCT dm.materia_id) as total_materias,
    COUNT(DISTINCT dg.grado_id) as total_grados
FROM usuarios u
LEFT JOIN docente_materias dm ON u.id = dm.docente_id
LEFT JOIN materias m ON dm.materia_id = m.id
LEFT JOIN docente_grados dg ON u.id = dg.docente_id
LEFT JOIN grados g ON dg.grado_id = g.id
WHERE u.rol_id = 2  -- Solo docentes
GROUP BY u.id, u.nombre, u.apellido_paterno, u.email;
```

**Utilidad:** Permite ver de un vistazo todas las asignaciones de cada docente.

### Backend

#### 1. Modelo: `DocenteAsignacion.php`

**Ubicación:** `backend/models/DocenteAsignacion.php`

**Métodos principales:**

```php
// Asignar/Desasignar individual
asignarMateria(int $docenteId, int $materiaId, int $asignadoPor): bool
desasignarMateria(int $docenteId, int $materiaId): bool
asignarGrado(int $docenteId, int $gradoId, int $asignadoPor): bool
desasignarGrado(int $docenteId, int $gradoId): bool

// Asignación masiva (reemplaza todas)
asignarMaterias(int $docenteId, array $materiaIds, int $asignadoPor): bool
asignarGrados(int $docenteId, array $gradoIds, int $asignadoPor): bool

// Consultas
obtenerMateriasDocente(int $docenteId): array
obtenerGradosDocente(int $docenteId): array

// Verificación
tieneMateria(int $docenteId, int $materiaId): bool
tieneGrado(int $docenteId, int $gradoId): bool
```

**Ejemplo de uso:**

```php
$asignacion = new DocenteAsignacion();

// Asignar múltiples materias
$asignacion->asignarMaterias(5, [1, 2, 3], 1); // Docente 5 → Materias 1,2,3 por Admin 1

// Verificar si tiene permiso
if ($asignacion->tieneMateria(5, 1)) {
    echo "El docente puede subir videos de esta materia";
}
```

#### 2. Controlador: `DocenteAsignacionController.php`

**Ubicación:** `backend/controllers/DocenteAsignacionController.php`

**Endpoints implementados:**

##### GET `/api/docentes-asignaciones`
Obtiene todos los docentes con sus asignaciones.

**Acceso:** Solo administradores

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "docentes": [
      {
        "docente_id": 5,
        "nombre": "Juan",
        "apellido_paterno": "Pérez",
        "email": "juan@escuela.edu",
        "materias_asignadas": "Matemáticas, Física",
        "grados_asignados": "1ro Secundaria, 2do Secundaria",
        "total_materias": 2,
        "total_grados": 2
      }
    ]
  }
}
```

##### GET `/api/docentes/{id}/asignaciones`
Obtiene las asignaciones de un docente específico.

**Acceso:** Solo administradores

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "docente_id": 5,
    "materias": [
      { "id": 1, "nombre": "Matemáticas", "descripcion": "..." },
      { "id": 2, "nombre": "Física", "descripcion": "..." }
    ],
    "grados": [
      { "id": 7, "nombre": "1ro Secundaria", "nivel": 7 },
      { "id": 8, "nombre": "2do Secundaria", "nivel": 8 }
    ]
  }
}
```

##### POST `/api/docentes/{id}/materias`
Asigna materias a un docente.

**Acceso:** Solo administradores

**Body:**
```json
{
  "materia_ids": [1, 2, 3]
}
```

**Comportamiento:** REEMPLAZA todas las materias anteriores con las nuevas.

**Respuesta:**
```json
{
  "success": true,
  "message": "Materias asignadas correctamente",
  "data": {
    "asignadas": 3,
    "materias": [...]
  }
}
```

##### POST `/api/docentes/{id}/grados`
Asigna grados a un docente.

**Acceso:** Solo administradores

**Body:**
```json
{
  "grado_ids": [7, 8, 9]
}
```

**Comportamiento:** REEMPLAZA todos los grados anteriores con los nuevos.

#### 3. Modificaciones en `VideoController.php`

Se agregó validación en los métodos `store()` y `update()`:

**En `store()` (líneas 167-186):**

```php
// Si es docente, verificar que esté asignado a la materia y grado
if (RoleMiddleware::esDocente($usuario['rol'])) {
    require_once __DIR__ . '/../models/DocenteAsignacion.php';
    $docenteAsignacion = new DocenteAsignacion();

    $materiaId = (int)$data['materia_id'];
    $gradoId = (int)$data['grado_id'];

    // Verificar asignación a materia
    if (!$docenteAsignacion->tieneMateria($usuario['id'], $materiaId)) {
        $this->enviarRespuesta(403, false, null, 'No estás asignado a esta materia. Contacta al administrador para asignarte.');
        return;
    }

    // Verificar asignación a grado
    if (!$docenteAsignacion->tieneGrado($usuario['id'], $gradoId)) {
        $this->enviarRespuesta(403, false, null, 'No estás asignado a este grado. Contacta al administrador para asignarte.');
        return;
    }
}
```

**En `update()` (líneas 318-345):**

Similar validación cuando el docente intenta cambiar la materia o grado de un video existente.

**Efecto:**
- Los docentes **solo pueden subir videos** para materias y grados asignados
- Los docentes **solo pueden cambiar** materia/grado a valores que tengan asignados
- Los administradores **no tienen restricciones** (pueden gestionar todos los videos)

### Frontend

#### 1. Servicio: `docenteAsignacionService.js`

**Ubicación:** `frontend-web/src/services/docenteAsignacionService.js`

**Funciones:**

```javascript
// Obtener todas las asignaciones
getAllDocentesAsignaciones(): Promise

// Obtener asignaciones de un docente
getDocenteAsignaciones(docenteId): Promise

// Asignar materias
asignarMaterias(docenteId, materiaIds[]): Promise

// Asignar grados
asignarGrados(docenteId, gradoIds[]): Promise

// Actualizar todo (materias + grados en paralelo)
actualizarAsignaciones(docenteId, materiaIds[], gradoIds[]): Promise
```

#### 2. Componente: `AsignarDocenteModal.jsx`

**Ubicación:** `frontend-web/src/components/Common/AsignarDocenteModal.jsx`

**Características:**

- Modal con dos columnas: Materias y Grados
- Checkboxes para seleccionar múltiples items
- Botón "Seleccionar todas" / "Deseleccionar todas"
- Muestra contador de seleccionados
- Carga asíncrona de datos
- Indicador de guardado
- Mensajes de error amigables

**Props:**

```javascript
<AsignarDocenteModal
  show={boolean}          // Mostrar/ocultar modal
  docente={object}         // Objeto del docente
  onClose={function}       // Callback al cerrar
  onSuccess={function}     // Callback al guardar exitosamente
/>
```

**Ejemplo de uso:**

```jsx
const [modal, setModal] = useState({ show: false, docente: null });

<AsignarDocenteModal
  show={modal.show}
  docente={modal.docente}
  onClose={() => setModal({ show: false, docente: null })}
  onSuccess={() => {
    alert('Asignaciones guardadas');
    reloadData();
  }}
/>
```

#### 3. Integración en `UsuariosPage.jsx`

Se agregó:

1. Importación del modal (línea 9)
2. Estado para el modal (línea 30)
3. Botón "Asignar" para docentes (líneas 240-247)
4. Renderizado del modal (líneas 367-376)

**Flujo de usuario:**

1. Admin va a `/usuarios`
2. Ve listado de usuarios
3. Para usuarios con rol "Docente", aparece botón "Asignar"
4. Clic en "Asignar" → abre modal
5. Selecciona materias y grados
6. Clic en "Guardar Asignaciones"
7. Se actualiza en BD y cierra modal

## 🚀 Instalación y Configuración

### 1. Ejecutar Migración de Base de Datos

```bash
cd backend
php migrate_asignaciones.php
```

**Salida esperada:**

```
===========================================
  Migración: Asignaciones de Docentes
===========================================

📄 Leyendo archivo: database/asignaciones_docentes.sql
📊 Ejecutando 5 sentencias SQL...

  [CREATE TABLE] docente_materias... ✅
  [CREATE TABLE] docente_grados... ✅
  [CREATE VIEW] vista_docentes_asignaciones... ✅

===========================================
  ✅ Migración completada exitosamente
===========================================

📋 Verificando tablas creadas:
  ✅ docente_materias
     └─ Registros: 0
  ✅ docente_grados
     └─ Registros: 0
  ✅ vista_docentes_asignaciones (VIEW)

🎉 Las tablas de asignaciones están listas para usar.
```

### 2. Verificar Rutas API

Las rutas deben estar registradas en `backend/routes/api.php` (líneas 226-232):

```php
$router->get('/api/docentes-asignaciones', [$docenteAsignacionController, 'listarTodos']);
$router->get('/api/docentes/{id}/asignaciones', [$docenteAsignacionController, 'obtenerAsignaciones']);
$router->post('/api/docentes/{id}/materias', [$docenteAsignacionController, 'asignarMaterias']);
$router->post('/api/docentes/{id}/grados', [$docenteAsignacionController, 'asignarGrados']);
```

### 3. Probar Endpoints

#### Obtener asignaciones de un docente:

```bash
curl -X GET http://localhost/backend/api/docentes/5/asignaciones \
  -H "Authorization: Bearer {token_admin}"
```

#### Asignar materias:

```bash
curl -X POST http://localhost/backend/api/docentes/5/materias \
  -H "Authorization: Bearer {token_admin}" \
  -H "Content-Type: application/json" \
  -d '{"materia_ids": [1, 2, 3]}'
```

#### Asignar grados:

```bash
curl -X POST http://localhost/backend/api/docentes/5/grados \
  -H "Authorization: Bearer {token_admin}" \
  -H "Content-Type: application/json" \
  -d '{"grado_ids": [7, 8]}'
```

## 📖 Casos de Uso

### Caso 1: Asignar Materias y Grados a un Nuevo Docente

**Escenario:** Se contrató un nuevo docente de Matemáticas para 1ro y 2do de Secundaria.

**Pasos:**

1. Admin crea el usuario con rol "Docente"
2. Admin va a Gestión de Usuarios
3. Clic en "Asignar" junto al nuevo docente
4. Selecciona: Matemáticas
5. Selecciona: 1ro Secundaria, 2do Secundaria
6. Guarda
7. Ahora el docente puede subir videos solo de Matemáticas para 1ro y 2do

### Caso 2: Docente Intenta Subir Video Sin Asignación

**Escenario:** Docente intenta subir un video de Física pero solo tiene asignada Matemáticas.

**Flujo:**

1. Docente va a "Subir Video"
2. Selecciona Materia: Física
3. Selecciona Grado: 1ro Secundaria
4. Sube archivo
5. **Backend rechaza:** "No estás asignado a esta materia. Contacta al administrador."
6. El archivo se elimina automáticamente
7. No se crea el registro en BD

### Caso 3: Reasignar Materias

**Escenario:** Un docente cambia de área, de Matemáticas a Física.

**Pasos:**

1. Admin va a Gestión de Usuarios
2. Clic en "Asignar" junto al docente
3. **Deselecciona:** Matemáticas
4. **Selecciona:** Física
5. Guarda
6. Ahora el docente:
   - ✅ Puede subir nuevos videos de Física
   - ✅ Sigue viendo sus videos antiguos de Matemáticas (solo lectura)
   - ❌ NO puede editar videos de Matemáticas (cambiar materia)
   - ❌ NO puede subir nuevos videos de Matemáticas

## 🔒 Seguridad y Permisos

### Validaciones Backend

1. **Autenticación:** Todos los endpoints requieren token JWT válido
2. **Autorización:** Solo administradores pueden gestionar asignaciones
3. **Validación de datos:** Se validan IDs de docente, materia y grado
4. **Transacciones:** Se usan transacciones para operaciones múltiples
5. **Prepared Statements:** Protección contra SQL Injection

### Validaciones Frontend

1. **Checkboxes:** Solo se pueden seleccionar items existentes
2. **Estado de guardado:** Se deshabilitan botones mientras se guarda
3. **Manejo de errores:** Mensajes amigables para el usuario
4. **Confirmación visual:** Contador de seleccionados

## 📊 Diagramas

### Diagrama ER - Asignaciones

```
┌─────────────┐         ┌──────────────────┐         ┌────────────┐
│  usuarios   │         │ docente_materias │         │  materias  │
├─────────────┤         ├──────────────────┤         ├────────────┤
│ id (PK)     │────┐    │ id (PK)          │    ┌────│ id (PK)    │
│ nombre      │    └────│ docente_id (FK)  │    │    │ nombre     │
│ rol_id      │         │ materia_id (FK)  │────┘    │ descripcion│
│ ...         │         │ fecha_asignacion │         │ ...        │
└─────────────┘         │ asignado_por (FK)│         └────────────┘
                        └──────────────────┘

┌─────────────┐         ┌──────────────────┐         ┌────────────┐
│  usuarios   │         │ docente_grados   │         │   grados   │
├─────────────┤         ├──────────────────┤         ├────────────┤
│ id (PK)     │────┐    │ id (PK)          │    ┌────│ id (PK)    │
│ nombre      │    └────│ docente_id (FK)  │    │    │ nombre     │
│ rol_id      │         │ grado_id (FK)    │────┘    │ nivel      │
│ ...         │         │ fecha_asignacion │         │ ...        │
└─────────────┘         │ asignado_por (FK)│         └────────────┘
                        └──────────────────┘
```

### Flujo de Asignación

```
┌──────────┐         ┌──────────┐         ┌─────────┐         ┌──────────┐
│  Admin   │         │ Frontend │         │   API   │         │    BD    │
└────┬─────┘         └────┬─────┘         └────┬────┘         └────┬─────┘
     │                    │                    │                    │
     │ Clic "Asignar"     │                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ GET /docentes/{id}/asignaciones         │
     │                    ├───────────────────>│                    │
     │                    │                    │ SELECT asignaciones│
     │                    │                    ├───────────────────>│
     │                    │                    │<───────────────────┤
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │ Modal con checkboxes                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │ Selecciona + Guarda                     │                    │
     ├───────────────────>│                    │                    │
     │                    │ POST /docentes/{id}/materias            │
     │                    ├───────────────────>│                    │
     │                    │                    │ BEGIN TRANSACTION  │
     │                    │                    ├───────────────────>│
     │                    │                    │ DELETE old         │
     │                    │                    ├───────────────────>│
     │                    │                    │ INSERT new         │
     │                    │                    ├───────────────────>│
     │                    │                    │ COMMIT             │
     │                    │                    ├───────────────────>│
     │                    │<───────────────────┤                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
     │ "Guardado ✓"       │                    │                    │
     │                    │                    │                    │
```

### Flujo de Validación al Subir Video

```
┌──────────┐         ┌─────────────┐         ┌──────────────┐
│ Docente  │         │VideoController        │DocenteAsignacion │
└────┬─────┘         └────┬─────┘         └──────┬───────┘
     │                    │                      │
     │ POST /videos       │                      │
     │ + archivo          │                      │
     │ + materia_id=5     │                      │
     │ + grado_id=7       │                      │
     ├───────────────────>│                      │
     │                    │                      │
     │                    │ ¿Es docente?         │
     │                    │ SI                   │
     │                    │                      │
     │                    │ tieneMateria(user, 5)│
     │                    ├─────────────────────>│
     │                    │                      │
     │                    │<─────────────────────┤
     │                    │ false                │
     │                    │                      │
     │<───────────────────┤                      │
     │ 403 Forbidden      │                      │
     │ "No estás asignado │                      │
     │  a esta materia"   │                      │
     │                    │                      │
```

## 🧪 Testing

### Test Manual - Checklist

- [ ] **Migración ejecutada** sin errores
- [ ] **Tablas creadas** (docente_materias, docente_grados)
- [ ] **Vista creada** (vista_docentes_asignaciones)
- [ ] **Endpoints responden** (con token de admin)
- [ ] **Modal se abre** desde Gestión de Usuarios
- [ ] **Checkboxes funcionan** (seleccionar/deseleccionar)
- [ ] **Botón "Seleccionar todas"** funciona
- [ ] **Guardar asignaciones** funciona
- [ ] **Docente con asignaciones** puede subir videos
- [ ] **Docente sin asignaciones** recibe error al subir
- [ ] **Docente no puede cambiar** a materia no asignada

### Comandos de Testing

```bash
# 1. Verificar tablas
mysql -u root -p videoteca_sfx -e "SHOW TABLES LIKE 'docente_%';"

# 2. Ver estructura
mysql -u root -p videoteca_sfx -e "DESCRIBE docente_materias;"

# 3. Contar asignaciones
mysql -u root -p videoteca_sfx -e "SELECT COUNT(*) FROM docente_materias;"

# 4. Ver vista
mysql -u root -p videoteca_sfx -e "SELECT * FROM vista_docentes_asignaciones;"
```

## 🔧 Troubleshooting

### Error: "No estás asignado a esta materia"

**Causa:** El docente no tiene asignada la materia.

**Solución:**
1. Ir a Gestión de Usuarios
2. Clic en "Asignar" junto al docente
3. Seleccionar la materia
4. Guardar

### Error: "No se encontraron materias disponibles"

**Causa:** No hay materias activas en la BD.

**Solución:**
1. Verificar tabla `materias`: `SELECT * FROM materias WHERE estado='activo';`
2. Si está vacía, insertar materias de prueba
3. Recargar modal

### Modal no se abre

**Causa:** Error en el componente o servicio.

**Solución:**
1. Abrir consola del navegador (F12)
2. Ver errores en pestaña Console
3. Verificar que el endpoint responda: `/api/docentes/{id}/asignaciones`

### Cambios no se guardan

**Causa:** Error en el backend o permisos.

**Solución:**
1. Verificar que el usuario sea administrador
2. Ver errores en consola del navegador
3. Verificar logs del servidor: `backend/logs/app.log`

## 📚 Referencias

- [Archivo de migración](../database/asignaciones_docentes.sql)
- [Modelo DocenteAsignacion](../backend/models/DocenteAsignacion.php)
- [Controller DocenteAsignacion](../backend/controllers/DocenteAsignacionController.php)
- [Componente Modal](../frontend-web/src/components/Common/AsignarDocenteModal.jsx)
- [Servicio API](../frontend-web/src/services/docenteAsignacionService.js)

---

**Autor:** Roger Omar Luna Yujra
**Fecha:** Noviembre 2025
**Versión:** 1.0.0
