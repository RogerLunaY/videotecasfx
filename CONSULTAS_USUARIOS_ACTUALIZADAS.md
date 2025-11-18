# 📊 Consultas SQL Actualizadas - Gestión de Usuarios

## 🎯 Cambios Realizados

Las consultas de usuarios han sido **actualizadas** para soportar correctamente **múltiples asignaciones** de materias y grados por docente.

### ❌ Antes (Incorrecto)
```sql
-- Solo obtenía UNA materia y UN grado
SELECT u.*, m.nombre as materia_nombre, g.nombre as grado_nombre
FROM usuarios u
LEFT JOIN materias m ON u.materia_id = m.id
LEFT JOIN grados g ON u.grado_id = g.id
```

**Problema:** Los campos `materia_id` y `grado_id` en la tabla `usuarios` solo permiten una relación 1:1, pero los docentes pueden enseñar **múltiples materias en múltiples grados**.

### ✅ Ahora (Correcto)
```sql
-- Obtiene TODAS las materias y grados del docente
SELECT
    u.*,
    r.nombre as rol,
    GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') as materias_asignadas,
    GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.orden SEPARATOR ', ') as grados_asignados,
    COUNT(DISTINCT a.id) as total_asignaciones
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
LEFT JOIN asignaciones a ON u.id = a.docente_id AND a.estado = 'activa'
LEFT JOIN materias m ON a.materia_id = m.id
LEFT JOIN grados g ON a.grado_id = g.id
GROUP BY u.id, r.nombre
```

**Solución:** Usa la tabla `asignaciones` (muchos a muchos) y `GROUP_CONCAT` para obtener todas las asignaciones.

---

## 🔍 Consultas Modificadas

### 1. **obtenerTodos() - Lista de Usuarios**

**Ubicación:** `backend/models/Usuario.php:142-157`

```sql
SELECT
    u.*,
    r.nombre as rol,
    r.nombre as rol_nombre,
    GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') as materias_asignadas,
    GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.orden SEPARATOR ', ') as grados_asignados,
    COUNT(DISTINCT a.id) as total_asignaciones
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
LEFT JOIN asignaciones a ON u.id = a.docente_id AND a.estado = 'activa'
LEFT JOIN materias m ON a.materia_id = m.id
LEFT JOIN grados g ON a.grado_id = g.id
[WHERE condiciones]
GROUP BY u.id, r.nombre
ORDER BY u.fecha_creacion DESC
LIMIT :limit OFFSET :offset
```

#### **Nuevos Campos Retornados:**
| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `materias_asignadas` | string | Todas las materias del docente separadas por comas | `"Matemática, Física, Química"` |
| `grados_asignados` | string | Todos los grados del docente separados por comas | `"Primero, Segundo, Tercero"` |
| `total_asignaciones` | int | Número total de asignaciones (materia+grado) | `6` |

#### **Ejemplo de Resultado:**
```json
{
  "id": 3,
  "nombre": "Juan",
  "apellido_paterno": "Pérez",
  "email": "juan.perez@sfx.edu.bo",
  "ci": "1234567",
  "rol": "Docente",
  "rol_nombre": "Docente",
  "estado": "activo",
  "materias_asignadas": "Matemática, Física",
  "grados_asignados": "Primero, Segundo, Tercero",
  "total_asignaciones": 6,
  "fecha_creacion": "2024-11-15 10:30:00"
}
```

---

### 2. **obtenerPorId() - Usuario Individual**

**Ubicación:** `backend/models/Usuario.php:187-201`

```sql
SELECT
    u.*,
    r.nombre as rol,
    r.nombre as rol_nombre,
    GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') as materias_asignadas,
    GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.orden SEPARATOR ', ') as grados_asignados,
    COUNT(DISTINCT a.id) as total_asignaciones
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
LEFT JOIN asignaciones a ON u.id = a.docente_id AND a.estado = 'activa'
LEFT JOIN materias m ON a.materia_id = m.id
LEFT JOIN grados g ON a.grado_id = g.id
WHERE u.id = :id
GROUP BY u.id, r.nombre
LIMIT 1
```

**Igual que `obtenerTodos()` pero para un solo usuario.**

---

### 3. **contar() - Contar Usuarios**

**Ubicación:** `backend/models/Usuario.php:538`

```sql
SELECT COUNT(DISTINCT u.id) as total
FROM usuarios u
[WHERE condiciones con EXISTS]
```

#### **Filtros Actualizados:**

##### **Filtro por Materia (EXISTS):**
```sql
WHERE EXISTS (
    SELECT 1
    FROM asignaciones a
    WHERE a.docente_id = u.id
      AND a.materia_id = :materia_id
      AND a.estado = 'activa'
)
```

##### **Filtro por Grado (EXISTS):**
```sql
WHERE EXISTS (
    SELECT 1
    FROM asignaciones a
    WHERE a.docente_id = u.id
      AND a.grado_id = :grado_id
      AND a.estado = 'activa'
)
```

##### **Filtro por Búsqueda:**
```sql
WHERE (
    u.nombre LIKE :busqueda
    OR u.apellido_paterno LIKE :busqueda
    OR u.email LIKE :busqueda
    OR u.ci LIKE :busqueda
)
```

---

## 📊 Comparación de Filtros

### ❌ Antes
```sql
-- Solo filtraba por UNA materia/grado directo
WHERE u.materia_id = :materia_id
WHERE u.grado_id = :grado_id
```

**Problema:** No consideraba todas las asignaciones del docente.

### ✅ Ahora
```sql
-- Filtra si el docente tiene ESA materia/grado en sus asignaciones
WHERE EXISTS (
    SELECT 1 FROM asignaciones a
    WHERE a.docente_id = u.id
      AND a.materia_id = :materia_id
      AND a.estado = 'activa'
)
```

**Ventaja:** Busca en TODAS las asignaciones del docente.

---

## 🎯 Casos de Uso

### Caso 1: Listar todos los docentes de Matemática

**URL:**
```
GET /api/usuarios?rol_id=2&materia_id=4
```

**SQL Ejecutado:**
```sql
SELECT u.*, r.nombre as rol,
    GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') as materias_asignadas,
    GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.orden SEPARATOR ', ') as grados_asignados,
    COUNT(DISTINCT a.id) as total_asignaciones
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
LEFT JOIN asignaciones a ON u.id = a.docente_id AND a.estado = 'activa'
LEFT JOIN materias m ON a.materia_id = m.id
LEFT JOIN grados g ON a.grado_id = g.id
WHERE u.rol_id = 2
  AND EXISTS (
      SELECT 1 FROM asignaciones a2
      WHERE a2.docente_id = u.id
        AND a2.materia_id = 4
        AND a2.estado = 'activa'
  )
GROUP BY u.id, r.nombre
ORDER BY u.fecha_creacion DESC
```

**Resultado:**
```json
[
  {
    "nombre": "Juan Pérez",
    "materias_asignadas": "Matemática, Física",
    "grados_asignados": "Primero, Segundo",
    "total_asignaciones": 4
  },
  {
    "nombre": "María López",
    "materias_asignadas": "Matemática",
    "grados_asignados": "Cuarto, Quinto",
    "total_asignaciones": 2
  }
]
```

---

### Caso 2: Buscar docentes que enseñan en 1ro de Secundaria

**URL:**
```
GET /api/usuarios?rol_id=2&grado_id=1
```

**SQL Ejecutado:**
```sql
WHERE u.rol_id = 2
  AND EXISTS (
      SELECT 1 FROM asignaciones a
      WHERE a.docente_id = u.id
        AND a.grado_id = 1
        AND a.estado = 'activa'
  )
```

---

### Caso 3: Buscar "juan" en todos los usuarios

**URL:**
```
GET /api/usuarios?busqueda=juan
```

**SQL Ejecutado:**
```sql
WHERE (
    u.nombre LIKE '%juan%'
    OR u.apellido_paterno LIKE '%juan%'
    OR u.email LIKE '%juan%'
    OR u.ci LIKE '%juan%'
)
```

---

## ⚡ Optimizaciones Aplicadas

### 1. **GROUP_CONCAT en lugar de múltiples queries**
✅ Una sola query obtiene usuario + asignaciones
❌ Antes: 1 query para usuario + N queries para asignaciones

### 2. **LEFT JOIN con asignaciones**
✅ Usuarios sin asignaciones también aparecen (total_asignaciones = 0)
✅ Administradores no tienen asignaciones (NULL → "")

### 3. **EXISTS en lugar de JOIN en filtros**
✅ Más eficiente que JOIN adicionales
✅ Evita duplicados en COUNT

### 4. **DISTINCT en COUNT y GROUP_CONCAT**
✅ Evita contar/mostrar duplicados
✅ `COUNT(DISTINCT a.id)` en lugar de `COUNT(*)`

### 5. **Índices utilizados**
```sql
-- Tabla asignaciones
INDEX idx_docente (docente_id)
INDEX idx_materia (materia_id)
INDEX idx_grado (grado_id)
INDEX idx_estado (estado)
INDEX idx_materia_grado (materia_id, grado_id)

-- Tabla usuarios
INDEX idx_rol_id (rol_id)
INDEX idx_estado (estado)
INDEX idx_fecha_creacion (fecha_creacion)
```

---

## 🧪 Probar las Consultas

### Desde MySQL/HeidiSQL:

```sql
-- Ver usuarios con sus asignaciones
SELECT
    u.nombre,
    u.apellido_paterno,
    u.email,
    r.nombre as rol,
    GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') as materias,
    GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.orden SEPARATOR ', ') as grados,
    COUNT(DISTINCT a.id) as total_asignaciones
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
LEFT JOIN asignaciones a ON u.id = a.docente_id AND a.estado = 'activa'
LEFT JOIN materias m ON a.materia_id = m.id
LEFT JOIN grados g ON a.grado_id = g.id
WHERE r.nombre = 'Docente'
GROUP BY u.id, r.nombre
ORDER BY u.nombre;
```

### Desde la API:

```bash
# Listar todos los usuarios
curl http://videoteca.test/api/usuarios \
  -H "Authorization: Bearer TOKEN"

# Filtrar docentes de Matemática
curl http://videoteca.test/api/usuarios?rol_id=2&materia_id=4 \
  -H "Authorization: Bearer TOKEN"

# Buscar "juan"
curl http://videoteca.test/api/usuarios?busqueda=juan \
  -H "Authorization: Bearer TOKEN"
```

---

## 📋 Resumen de Cambios

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Materias por docente** | Solo 1 | Múltiples (GROUP_CONCAT) |
| **Grados por docente** | Solo 1 | Múltiples (GROUP_CONCAT) |
| **Filtro materia** | `u.materia_id = ?` | `EXISTS con asignaciones` |
| **Filtro grado** | `u.grado_id = ?` | `EXISTS con asignaciones` |
| **Campo retornado** | `materia_nombre` | `materias_asignadas` |
| **Campo retornado** | `grado_nombre` | `grados_asignados` |
| **Campo nuevo** | - | `total_asignaciones` |
| **Filtro búsqueda** | No existía en contar() | Agregado |

---

## ✅ Ventajas del Nuevo Enfoque

1. **Precisión**: Refleja correctamente las múltiples asignaciones
2. **Eficiencia**: Una sola query en lugar de N+1
3. **Flexibilidad**: Filtros más potentes con EXISTS
4. **Completitud**: Incluye todos los filtros en contar()
5. **Escalabilidad**: Soporta cantidad ilimitada de asignaciones

---

**Las consultas ahora reflejan correctamente que los docentes pueden tener múltiples materias y grados asignados.** 🎉
