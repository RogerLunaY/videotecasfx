# Restricciones para el Rol Docente

## 📋 Resumen

Los docentes tienen acceso limitado al sistema, pudiendo únicamente ver y gestionar sus propios videos. No pueden acceder a funcionalidades administrativas ni ver videos de otros docentes.

## ✅ Accesos Permitidos

### Páginas/Rutas Permitidas:
1. **Dashboard** (`/dashboard`)
   - Muestra estadísticas de sus propios videos
   - Filtros por grado/curso (solo sus videos)
   - Paginación de videos propios
   - Ordenamiento por fecha, visualizaciones o título

2. **Mis Videos** (`/mis-videos`)
   - Lista de todos sus videos
   - Filtros por materia, grado, tema
   - Solo videos en estado 'activo' (sin huérfanos)

3. **Subir Video** (`/upload`)
   - Formulario de subida de videos
   - Asignación automática de docente_id

4. **Perfil** (`/perfil`)
   - Datos personales
   - Cambio de contraseña

5. **Detalle de Video** (`/videos/:id`)
   - Solo si el video es suyo
   - Puede editar y eliminar

## ❌ Accesos Restringidos

### Páginas Bloqueadas:
- ❌ **Gestión de Usuarios** (`/usuarios`) - Solo Administrador
- ❌ **Registro de Usuarios** (`/register`) - Solo Administrador
- ❌ **Estadísticas Globales** - Solo Administrador
- ❌ **Videos de otros docentes** - No puede ver, editar ni eliminar

### Filtros Automáticos Aplicados:
- ❌ No puede ver videos de otros docentes
- ❌ No puede ver videos huérfanos (sin archivo físico)
- ❌ No puede ver videos en estado 'error' o 'procesando'
- ❌ No puede ver estadísticas globales del sistema

## 🔧 Implementación Técnica

### Backend - VideoController.php

Todos los métodos que retornan videos aplican automáticamente los siguientes filtros cuando el usuario es docente:

```php
if ($usuario && RoleMiddleware::esDocente($usuario['rol'])) {
    $filtros['docente_id'] = $usuario['id'];
    $filtros['estado'] = 'activo';
    $filtros['solo_con_archivo'] = true;
}
```

**Métodos afectados:**
- `index()` - Listado general de videos
- `search()` - Búsqueda de videos
- `populares()` - Videos populares
- `recientes()` - Videos recientes
- `byMateria()` - Videos por materia
- `byGrado()` - Videos por grado

### Backend - Video.php (Model)

Los métodos del modelo aceptan un parámetro opcional `$docenteId` para filtrar:

```php
public function buscar(string $busqueda, int $limit = 20, int $offset = 0, ?int $docenteId = null)
public function obtenerMasPopulares(int $limit = 10, ?int $docenteId = null)
public function obtenerRecientes(int $limit = 10, ?int $docenteId = null)
```

### Frontend

**Navbar.jsx:**
- Muestra solo opciones permitidas según el rol
- Docentes ven: Dashboard, Mis Videos, Subir Video
- Administradores ven: Dashboard, Usuarios, Subir Video

**DashboardPage.jsx:**
- Filtra automáticamente por `docente_id: user?.id`
- Muestra estadísticas personales (solo sus videos)
- Filtros de grado funcionan sobre sus propios videos

**App.jsx:**
- Rutas protegidas con `<ProtectedRoute>`
- Rutas administrativas con `requireAdmin={true}`

## 🎯 Casos de Uso

### Caso 1: Docente inicia sesión
```
✅ Ve dashboard con sus estadísticas
✅ Lista de sus videos recientes
✅ Filtros por grado/materia (solo sus videos)
❌ NO ve videos de otros docentes
❌ NO ve botón "Gestionar Usuarios"
```

### Caso 2: Docente busca un video
```
GET /api/videos/buscar?q=matemáticas

Backend aplica filtro automático:
WHERE v.docente_id = {id_del_docente}
AND v.estado = 'activo'

✅ Solo retorna sus propios videos
```

### Caso 3: Docente filtra por grado
```
GET /api/videos/grado/3

Backend aplica filtros:
WHERE v.grado_id = 3
AND v.docente_id = {id_del_docente}  ← Filtro automático
AND v.estado = 'activo'

✅ Solo sus videos del grado 3
```

### Caso 4: Docente intenta acceder a /usuarios
```
Frontend: ProtectedRoute con requireAdmin={true}
         ↓
¿Es Admin? NO
         ↓
Redirige a "/" (Home)

❌ Acceso denegado
```

### Caso 5: Docente sube un video
```
POST /api/videos

El backend asigna automáticamente:
docente_id = {id_del_usuario_autenticado}

✅ El video queda asociado al docente
```

## 📊 Comparación de Permisos

| Funcionalidad | Docente | Administrador |
|--------------|---------|---------------|
| Ver propios videos | ✅ | ✅ |
| Ver todos los videos | ❌ | ✅ |
| Subir videos | ✅ | ✅ |
| Editar propios videos | ✅ | ✅ |
| Editar videos de otros | ❌ | ✅ |
| Eliminar propios videos | ✅ | ✅ |
| Eliminar videos de otros | ❌ | ✅ |
| Gestionar usuarios | ❌ | ✅ |
| Ver estadísticas propias | ✅ | ✅ |
| Ver estadísticas globales | ❌ | ✅ |
| Filtrar por grado (propios) | ✅ | - |
| Filtrar por grado (todos) | ❌ | ✅ |
| Ver videos huérfanos | ❌ | ✅* |
| Registrar usuarios | ❌ | ✅ |

\* Los administradores ven videos huérfanos solo si `FILTER_ORPHAN_VIDEOS=false` en `.env`

## 🔒 Seguridad

### Validaciones de Seguridad Implementadas:

1. **Autenticación Obligatoria:**
   - Todas las rutas de videos usan `AuthMiddleware::opcional()`
   - Se detecta automáticamente el usuario autenticado

2. **Verificación de Rol:**
   - `RoleMiddleware::esDocente($usuario['rol'])`
   - Aplica filtros solo a usuarios con rol 'Docente'

3. **Filtros No Bypasseables:**
   - Los filtros se aplican en el backend
   - El docente no puede manipular parámetros para ver otros videos
   - Incluso si intenta `GET /api/videos?docente_id=99`, el backend sobrescribe con su propio ID

4. **Estado de Videos:**
   - Solo videos con `estado = 'activo'`
   - Videos huérfanos automáticamente excluidos con `solo_con_archivo = true`

5. **Propiedad de Videos:**
   - Al editar/eliminar, se verifica que `video.docente_id === usuario.id`
   - Se usa `RoleMiddleware::puedeGestionar()` para validar permisos

## 📝 Permisos Definidos en RoleMiddleware

```php
'Docente' => [
    'videos' => ['crear', 'leer', 'actualizar_propios', 'eliminar_propios'],
    'estadisticas' => ['leer_propias'],
    'perfil' => ['leer', 'actualizar']
]
```

**Significado:**
- `crear` - Puede subir nuevos videos
- `leer` - Puede ver videos (solo propios por el filtro)
- `actualizar_propios` - Puede editar sus propios videos
- `eliminar_propios` - Puede eliminar sus propios videos
- `leer_propias` - Estadísticas solo de sus videos
- NO tiene permisos sobre 'usuarios' ni 'configuracion'

## 🧪 Pruebas Recomendadas

Para verificar que las restricciones funcionan correctamente:

### 1. Prueba de Listado
```bash
# Como docente ID=5
curl -H "Authorization: Bearer {token_docente}" \
     http://videotecasfx.test/api/videos

# Debe retornar SOLO videos con docente_id=5
```

### 2. Prueba de Búsqueda
```bash
# Como docente ID=5
curl -H "Authorization: Bearer {token_docente}" \
     "http://videotecasfx.test/api/videos/buscar?q=matematicas"

# Debe buscar SOLO en videos del docente ID=5
```

### 3. Prueba de Acceso a Video Ajeno
```bash
# Intentar ver un video de otro docente
curl -H "Authorization: Bearer {token_docente}" \
     http://videotecasfx.test/api/videos/123

# Si el video no es suyo: Error 403 o 404
```

### 4. Prueba de Filtro por Grado
```bash
# Como docente ID=5
curl -H "Authorization: Bearer {token_docente}" \
     http://videotecasfx.test/api/videos/grado/3

# Debe retornar videos del grado 3 PERO solo del docente ID=5
```

### 5. Prueba Frontend
```
1. Iniciar sesión como docente
2. Ir a /dashboard
3. Verificar que solo aparecen sus videos
4. Intentar acceder a /usuarios
5. Debe redirigir a /
6. Verificar que en el navbar NO aparece "Gestionar Usuarios"
```

## 🔄 Flujo de Datos

```
Usuario Docente hace petición
         ↓
Frontend envía request a API
         ↓
AuthMiddleware detecta usuario
         ↓
VideoController verifica rol
         ↓
¿Es Docente? → SÍ
         ↓
Aplica filtros:
- docente_id = usuario.id
- estado = 'activo'
- solo_con_archivo = true
         ↓
Video Model ejecuta query con filtros
         ↓
Retorna solo videos propios
         ↓
Frontend muestra resultados
```

## 🎓 Configuración de Entorno

No se requiere configuración adicional. Las restricciones se activan automáticamente según el rol del usuario autenticado.

**Opcional:** Para docentes en desarrollo/pruebas, puedes ajustar:

```env
# .env
FILTER_ORPHAN_VIDEOS=true  # Ocultar videos huérfanos (recomendado para docentes)
```

---

**Última actualización:** 2025-11-16
**Sistema:** Videoteca San Francisco Xavier
**Desarrollador:** Roger Omar Luna Yujra
