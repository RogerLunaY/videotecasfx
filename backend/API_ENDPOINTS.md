# API REST - Videoteca San Francisco Xavier

## Base URL
```
http://localhost/backend/api
```

## Autenticación
La mayoría de endpoints requieren autenticación mediante token JWT en el header:
```
Authorization: Bearer {access_token}
```

---

## 🔐 Autenticación

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": 1,
      "nombre": "Juan",
      "email": "juan@ejemplo.com",
      "rol": "Administrador"
    },
    "tokens": {
      "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "token_type": "Bearer",
      "expires_in": 3600
    }
  }
}
```

### Registro (solo admins)
```http
POST /api/auth/register
Authorization: Bearer {token}

{
  "nombre": "Juan",
  "apellido_paterno": "Pérez",
  "apellido_materno": "García",
  "ci": "1234567",
  "email": "juan@ejemplo.com",
  "password": "password123",
  "rol_id": 2,
  "materia_id": 1,
  "grado_id": 1
}
```

### Refresh Token
```http
POST /api/auth/refresh

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Obtener usuario actual
```http
GET /api/auth/me
Authorization: Bearer {token}
```

---

## 👥 Usuarios

### Listar usuarios (solo admins)
```http
GET /api/usuarios?page=1&per_page=20&rol_id=2&estado=activo&busqueda=juan
Authorization: Bearer {token}
```

### Obtener usuario por ID
```http
GET /api/usuarios/{id}
Authorization: Bearer {token}
```

### Crear usuario (solo admins)
```http
POST /api/usuarios
Authorization: Bearer {token}

{
  "nombre": "María",
  "apellido_paterno": "López",
  "ci": "9876543",
  "email": "maria@ejemplo.com",
  "password": "password123",
  "rol_id": 2
}
```

### Actualizar usuario
```http
PUT /api/usuarios/{id}
Authorization: Bearer {token}

{
  "nombre": "María",
  "apellido_paterno": "López",
  "telefono": "71234567"
}
```

### Cambiar contraseña
```http
PUT /api/usuarios/{id}/password
Authorization: Bearer {token}

{
  "password": "contraseña_actual",
  "new_password": "nueva_contraseña"
}
```

### Eliminar usuario (solo admins)
```http
DELETE /api/usuarios/{id}
Authorization: Bearer {token}
```

---

## 🎥 Videos

### Listar videos (público)
```http
GET /api/videos?page=1&per_page=20&materia_id=1&grado_id=2&busqueda=algebra
```

**Parámetros de query:**
- `page`: Número de página (default: 1)
- `per_page`: Videos por página (default: 20, max: 100)
- `materia_id`: Filtrar por materia
- `grado_id`: Filtrar por grado
- `tema_id`: Filtrar por tema
- `docente_id`: Filtrar por docente
- `busqueda`: Texto de búsqueda
- `order_by`: Campo para ordenar (fecha_subida, visualizaciones, titulo)
- `order_dir`: Dirección (ASC, DESC)

### Obtener video por ID (público)
```http
GET /api/videos/{id}
```

### Subir video (docentes y admins)
```http
POST /api/videos
Authorization: Bearer {token}
Content-Type: multipart/form-data

titulo=Introducción al Álgebra
descripcion=Video introductorio
materia_id=1
grado_id=1
tema_id=1
video={archivo_video}
thumbnail={archivo_imagen} (opcional)
```

### Actualizar video
```http
PUT /api/videos/{id}
Authorization: Bearer {token}

{
  "titulo": "Nuevo título",
  "descripcion": "Nueva descripción",
  "tema_id": 2,
  "estado": "activo"
}
```

### Eliminar video
```http
DELETE /api/videos/{id}
Authorization: Bearer {token}
```

### Streaming de video (público)
```http
GET /api/videos/{id}/stream
```
**Soporta range requests para streaming eficiente**

### Buscar videos (público)
```http
GET /api/videos/buscar?q=algebra&page=1&per_page=20
```

### Videos populares (público)
```http
GET /api/videos/populares?limit=10
```

### Videos recientes (público)
```http
GET /api/videos/recientes?limit=10
```

### Videos por materia (público)
```http
GET /api/videos/materia/{materiaId}?page=1&per_page=20
```

### Videos por grado (público)
```http
GET /api/videos/grado/{gradoId}?page=1&per_page=20
```

---

## 📊 Estadísticas

### Dashboard completo (requiere auth)
```http
GET /api/estadisticas/dashboard
Authorization: Bearer {token}
```

### Estadísticas generales (requiere auth)
```http
GET /api/estadisticas/generales
Authorization: Bearer {token}
```

### Videos más populares (requiere auth)
```http
GET /api/estadisticas/videos-populares?limit=10
Authorization: Bearer {token}
```

### Estadísticas por materia (requiere auth)
```http
GET /api/estadisticas/por-materia
Authorization: Bearer {token}
```

### Estadísticas por grado (requiere auth)
```http
GET /api/estadisticas/por-grado
Authorization: Bearer {token}
```

### Estadísticas de reproducciones (requiere auth)
```http
GET /api/estadisticas/reproducciones?fecha_inicio=2024-01-01&fecha_fin=2024-12-31
Authorization: Bearer {token}
```

### Horas por materia (requiere auth)
```http
GET /api/estadisticas/horas-por-materia
Authorization: Bearer {token}
```

### Horas por grado (requiere auth)
```http
GET /api/estadisticas/horas-por-grado
Authorization: Bearer {token}
```

### Estadísticas de docente (requiere auth)
```http
GET /api/estadisticas/docente/{docenteId}
Authorization: Bearer {token}
```

### Tendencias (requiere auth)
```http
GET /api/estadisticas/tendencias?dias=7
Authorization: Bearer {token}
```

### Actividad reciente (solo admins)
```http
GET /api/estadisticas/actividad-reciente?limit=20
Authorization: Bearer {token}
```

### Resumen ejecutivo (solo admins)
```http
GET /api/estadisticas/resumen-ejecutivo
Authorization: Bearer {token}
```

---

## 📚 Recursos Auxiliares

### Listar materias (público)
```http
GET /api/materias
```

### Listar grados (público)
```http
GET /api/grados
```

### Listar temas (público)
```http
GET /api/temas?materia_id=1
```

### Listar roles (requiere auth)
```http
GET /api/roles
Authorization: Bearer {token}
```

---

## 🏥 Health Check

### Estado del sistema (público)
```http
GET /api/health
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15 10:30:45",
    "version": "1.0.0",
    "environment": "development",
    "database": "connected"
  }
}
```

---

## 📝 Códigos de Respuesta

- **200 OK**: Petición exitosa
- **201 Created**: Recurso creado exitosamente
- **204 No Content**: Petición exitosa sin contenido
- **400 Bad Request**: Datos inválidos
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: Sin permisos
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto (ej: email duplicado)
- **422 Unprocessable Entity**: Errores de validación
- **423 Locked**: Cuenta bloqueada
- **500 Internal Server Error**: Error del servidor

---

## 🔑 Credenciales de Prueba

### Administrador
```
Email: vladimir.mamani@atsi.edu.bo
Password: Password123!
```

### Docente
```
Email: juan.perez@sfx.edu.bo
Password: Password123!
```

---

## 📦 Formato de Respuesta Estándar

### Éxito
```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": {
    // Datos de respuesta
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Mensaje de error"
  }
}
```

### Error de Validación
```json
{
  "success": false,
  "error": {
    "code": 422,
    "message": "Errores de validación",
    "validation_errors": {
      "email": ["El campo email es requerido"],
      "password": ["El campo password debe tener al menos 8 caracteres"]
    }
  }
}
```
