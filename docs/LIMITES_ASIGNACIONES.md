# Límites de Asignaciones de Docentes

## Resumen

El sistema de biblioteca digital establece límites en la cantidad de materias y grados que pueden ser asignados a un docente. Estos límites garantizan una gestión eficiente y previenen la sobrecarga de asignaciones.

## Límites Establecidos

### Límites Máximos

| Tipo | Límite | Descripción |
|------|--------|-------------|
| **Materias** | 3 | Máximo de materias diferentes que puede enseñar un docente |
| **Grados** | 6 | Máximo de grados diferentes a los que puede enseñar un docente |
| **Asignaciones Totales** | 18 | Máximo teórico de combinaciones materia-grado (3 × 6 = 18) |

### Límites Mínimos

| Tipo | Límite | Descripción |
|------|--------|-------------|
| **Materias** | 1 | Un docente debe tener al menos una materia asignada |
| **Grados** | 1 | Un docente debe tener al menos un grado asignado |

## Combinaciones Materia-Grado

El sistema funciona con un modelo de **asignaciones granulares** donde cada asignación representa una combinación específica de:
- **1 Materia** + **1 Grado**

### Ejemplos de Asignaciones

**Ejemplo 1: Docente con 1 materia y 2 grados**
- Matemáticas + 1° Primaria
- Matemáticas + 2° Primaria

**Total: 2 asignaciones**

**Ejemplo 2: Docente con 2 materias y 3 grados**
- Matemáticas + 1° Primaria
- Matemáticas + 2° Primaria
- Matemáticas + 3° Primaria
- Física + 1° Primaria
- Física + 2° Primaria
- Física + 3° Primaria

**Total: 6 asignaciones (producto cartesiano 2 × 3 = 6)**

**Ejemplo 3: Máximo permitido (3 materias y 6 grados)**
- 3 materias × 6 grados = **18 asignaciones totales**

## Implementación Técnica

### Backend

#### Archivo de Configuración: `AsignacionLimites.php`

```php
class AsignacionLimites {
    const MAX_MATERIAS = 3;
    const MAX_GRADOS = 6;
    const MAX_ASIGNACIONES_TOTALES = 18;
    const MIN_MATERIAS = 1;
    const MIN_GRADOS = 1;
}
```

**Ubicación:** `/backend/config/AsignacionLimites.php`

#### Validaciones en el Controlador

El `DocenteAsignacionController` valida automáticamente los límites en dos puntos:

1. **Método `crear()`** - Al crear una asignación individual
   - Verifica que agregar la nueva asignación no exceda los límites
   - Retorna error 400 con detalles si se exceden los límites

2. **Método `asignarMultiples()`** - Al asignar múltiples combinaciones
   - Valida el total de materias únicas
   - Valida el total de grados únicos
   - Valida el número total de asignaciones
   - Retorna error 400 con detalles si se exceden los límites

#### Endpoint para Obtener Límites

```
GET /api/asignaciones/limites
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "limites": {
      "max_materias": 3,
      "max_grados": 6,
      "max_asignaciones_totales": 18,
      "min_materias": 1,
      "min_grados": 1
    }
  }
}
```

### Frontend

#### Constantes en Componentes

Los siguientes componentes React tienen las constantes definidas:

1. **`RegisterPage.jsx`** (líneas 41-42)
2. **`EditUserPage.jsx`** (líneas 41-42)
3. **`AsignarDocenteModal.jsx`** (líneas 21-22)

```javascript
const MAX_MATERIAS = 3;
const MAX_GRADOS = 6;
```

#### Validaciones en Tiempo Real

**1. Al seleccionar materias/grados:**
- Previene seleccionar más del límite
- Muestra mensaje de error temporal
- El error desaparece después de 3 segundos

**2. Botón "Seleccionar todas/todos":**
- Respeta los límites máximos
- Si hay más opciones que el límite, solo selecciona las primeras N (N = límite)
- Muestra mensaje informativo si se alcanza el límite

**3. Al guardar:**
- Valida que haya al menos 1 materia y 1 grado seleccionados
- Muestra error del servidor si los límites se exceden en backend

## Mensajes de Error

### Backend

**Cuando se excede el límite de materias:**
```
"El docente no puede tener más de 3 materias diferentes. Actualmente tiene 4"
```

**Cuando se excede el límite de grados:**
```
"El docente no puede tener más de 6 grados diferentes. Actualmente tiene 7"
```

**Cuando no se cumple el mínimo:**
```
"El docente debe tener al menos 1 materia(s) asignada(s)"
"El docente debe tener al menos 1 grado(s) asignado(s)"
```

### Frontend

**Al intentar seleccionar más del límite:**
```
"Solo puedes seleccionar hasta 3 materias"
"Solo puedes seleccionar hasta 6 grados"
```

**Al intentar guardar sin selecciones:**
```
"Debes seleccionar al menos una materia y un grado"
```

**Botón "Seleccionar todas" con límite:**
```
"Solo se pueden seleccionar hasta 3 materias. Se seleccionaron las primeras 3."
"Solo se pueden seleccionar hasta 6 grados. Se seleccionaron los primeros 6."
```

## Flujo de Validación

### Registro de Nuevo Docente

```
1. Admin abre RegisterPage
2. Selecciona rol "Docente"
3. Aparecen selectores de Materias y Grados
4. Admin selecciona materias (máx 3)
5. Admin selecciona grados (máx 6)
6. Frontend valida: mín 1 materia, mín 1 grado
7. Al enviar, se genera producto cartesiano M × G
8. Backend valida los límites
9. Si pasa, crea el usuario y sus asignaciones
10. Si falla, retorna error 400 con detalles
```

### Edición de Docente Existente

```
1. Admin abre EditUserPage para un docente
2. Se cargan las asignaciones actuales
3. Se pre-seleccionan las materias y grados asignados
4. Admin modifica las selecciones (respetando límites)
5. Frontend valida en tiempo real
6. Al guardar, se reemplaza el conjunto completo de asignaciones
7. Backend valida los nuevos límites
8. Si pasa, elimina asignaciones viejas y crea las nuevas (transacción)
9. Si falla, rollback y retorna error 400
```

### Asignación Rápida desde Gestión de Usuarios

```
1. Admin hace clic en "Asignar Materias/Grados" en UsuariosPage
2. Se abre AsignarDocenteModal
3. Se cargan asignaciones actuales del docente
4. Admin modifica selecciones con validación en tiempo real
5. Al guardar, se valida frontend y backend
6. Backend ejecuta transacción para reemplazar asignaciones
```

## Restricciones de Negocio

### ¿Por qué estos límites?

1. **3 Materias Máximo**
   - Permite especialización del docente
   - Evita dispersión de conocimientos
   - Facilita la gestión de contenido

2. **6 Grados Máximo**
   - Permite enseñar un ciclo completo (6 grados de primaria)
   - Facilita seguimiento a estudiantes a través de los años
   - Mantiene manejable la carga de trabajo

3. **18 Asignaciones Totales (3 × 6)**
   - Producto cartesiano máximo teórico
   - En la práctica, será menor (no todos enseñan todas las materias en todos los grados)
   - Ejemplo real: 2 materias × 3 grados = 6 asignaciones

### Casos de Uso Reales

**Docente de Primaria (Polivalente):**
- 3 materias: Matemáticas, Lenguaje, Ciencias Naturales
- 2 grados: 1° y 2° Primaria
- **Total: 6 asignaciones**

**Docente de Secundaria (Especializado):**
- 1 materia: Física
- 6 grados: 1° a 6° Secundaria
- **Total: 6 asignaciones**

**Docente Multidisciplinario:**
- 2 materias: Historia, Geografía
- 4 grados: 3°, 4°, 5°, 6° Primaria
- **Total: 8 asignaciones**

## Impacto en Otras Funcionalidades

### Subida de Videos

Los docentes solo pueden subir videos para las **combinaciones exactas** de materia-grado que tienen asignadas.

**Validación en VideoController:**
```php
// Verificar asignación a materia
if (!$docenteAsignacion->tieneMateria($usuario['id'], $materiaId)) {
    return error('No estás asignado a esta materia');
}

// Verificar asignación a grado
if (!$docenteAsignacion->tieneGrado($usuario['id'], $gradoId)) {
    return error('No estás asignado a este grado');
}
```

### Listado de Usuarios

En UsuariosPage, el card de cada docente muestra:
- `materias_asignadas`: Concatenación de nombres (ej: "Matemáticas, Física")
- `grados_asignados`: Concatenación de nombres (ej: "1° Primaria, 2° Primaria")
- `total_asignaciones`: Número de combinaciones activas

**Consulta SQL con GROUP_CONCAT:**
```sql
GROUP_CONCAT(DISTINCT m.nombre ORDER BY m.nombre SEPARATOR ', ') as materias_asignadas,
GROUP_CONCAT(DISTINCT g.nombre ORDER BY g.orden SEPARATOR ', ') as grados_asignados,
COUNT(DISTINCT CASE WHEN a.estado = 'activa' THEN a.id END) as total_asignaciones
```

## Mantenimiento y Actualización

### Para Cambiar los Límites

1. **Backend:** Modificar `backend/config/AsignacionLimites.php`
   ```php
   const MAX_MATERIAS = 5;  // Nuevo valor
   const MAX_GRADOS = 8;    // Nuevo valor
   ```

2. **Frontend:** Actualizar en 3 archivos
   - `frontend-web/src/pages/RegisterPage.jsx`
   - `frontend-web/src/pages/EditUserPage.jsx`
   - `frontend-web/src/components/Common/AsignarDocenteModal.jsx`

3. **Documentación:** Actualizar este archivo

4. **Testing:** Probar flujos completos de registro, edición y asignación

### Consideraciones

- Los límites son constantes, no configurables por el usuario
- Para hacerlos dinámicos, se necesitaría:
  - Tabla de configuración en BD
  - Endpoint para modificar límites (solo super admin)
  - Caché de límites en frontend
  - Sistema de notificación de cambios

## Archivos Relacionados

### Backend
- `/backend/config/AsignacionLimites.php` - Definición de límites
- `/backend/controllers/DocenteAsignacionController.php` - Validaciones
- `/backend/models/DocenteAsignacion.php` - Operaciones CRUD
- `/backend/models/Usuario.php` - Consultas con asignaciones
- `/backend/routes/api.php` - Rutas (línea 237)

### Frontend
- `/frontend-web/src/pages/RegisterPage.jsx` - Registro de docentes
- `/frontend-web/src/pages/EditUserPage.jsx` - Edición de docentes
- `/frontend-web/src/components/Common/AsignarDocenteModal.jsx` - Modal de asignación
- `/frontend-web/src/services/docenteAsignacionService.js` - API client

### Documentación
- `/docs/ASIGNACIONES_DOCENTES.md` - Guía completa del sistema
- `/docs/LIMITES_ASIGNACIONES.md` - Este archivo
- `/CONSULTAS_USUARIOS_ACTUALIZADAS.md` - Queries SQL explicadas

## Historial de Cambios

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-01-18 | 1.0.0 | Creación del documento con límites 3/6 |

---

**Autor:** Roger Omar Luna Yujra
**Proyecto:** Sistema de Biblioteca Digital de Videos Educativos
**Institución:** U.E. San Francisco Xavier
