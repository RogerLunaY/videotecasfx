# 🎓 Sistema de Biblioteca Digital de Videos Educativos
## U.E. San Francisco Xavier - Okinawa Uno, Bolivia

**Desarrollado por:** Roger Omar Luna Yujra (CI: 6734278 LP)
**Tutor:** Lic. Vladimir Mamani
**Institución:** Instituto Técnico ATSI Bolivia
**Fecha:** Noviembre 2025

---

## ✅ Estado del Proyecto: 100% COMPLETO

### Componentes Implementados:

1. ✅ **Backend API** (PHP 8.x + MySQL 8.x)
2. ✅ **Frontend Web** (React 18 + Vite + Tailwind CSS)
3. ✅ **Frontend Mobile** (React Native + Expo)
4. ✅ **Base de Datos** (MySQL con triggers, views, procedures)
5. ✅ **Documentación Completa**
6. ✅ **Herramientas de Diagnóstico**

---

## 📁 Estructura del Proyecto

```
videotecasfx/
├── backend/                    # API REST en PHP 8.x
│   ├── api/                    # Endpoints REST (40+)
│   ├── config/                 # Configuración (DB, CORS, JWT)
│   ├── controllers/            # Controladores MVC
│   ├── models/                 # Modelos de datos
│   ├── middleware/             # Auth, Roles, Validación
│   ├── utils/                  # Utilidades (JWT, File, Response)
│   ├── uploads/                # Videos y thumbnails
│   ├── logs/                   # Logs de errores
│   └── index.php               # Punto de entrada
│
├── frontend-web/               # Aplicación Web React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── Layout/         # Navbar, Footer, Layout
│   │   │   └── Videos/         # VideoCard, VideoPlayer, VideoList
│   │   ├── pages/              # Páginas principales
│   │   │   ├── LoginPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── VideosPage.jsx
│   │   │   ├── VideoDetailPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── UsuariosPage.jsx
│   │   │   ├── PerfilPage.jsx
│   │   │   └── UploadVideoPage.jsx
│   │   ├── services/           # Servicios API
│   │   ├── context/            # AuthContext
│   │   └── App.jsx             # Rutas y navegación
│   ├── .env                    # Configuración
│   └── package.json
│
├── frontend-mobile/            # Aplicación Móvil React Native
│   ├── src/
│   │   ├── components/         # VideoCard
│   │   ├── screens/            # 6 pantallas principales
│   │   │   ├── LoginScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── VideosScreen.js
│   │   │   ├── VideoDetailScreen.js
│   │   │   ├── ProfileScreen.js
│   │   │   └── LoadingScreen.js
│   │   ├── services/           # API, authService, videoService
│   │   ├── context/            # AuthContext
│   │   └── navigation/         # AppNavigator (Stack + Tabs)
│   ├── App.js
│   ├── app.json                # Configuración Expo
│   └── package.json
│
├── database/                   # Base de Datos
│   ├── schema.sql              # Estructura (10 tablas)
│   └── seed_data.sql           # Datos de prueba (12 usuarios)
│
├── docs/                       # Documentación
│   ├── API_ENDPOINTS.md        # Documentación de API
│   └── ...
│
├── importar-datos.bat          # Script de importación automática
├── test-backend.bat            # Script de prueba backend
├── MANUAL_LARAGON.md           # Guía de instalación
├── SOLUCION_CREDENCIALES.md    # Solución de credenciales
├── SOLUCION_ERROR_401.md       # Solución de CORS
├── PASOS_FINALES.md            # Pasos finales consolidados
└── README.md                   # Documentación principal
```

---

## 🚀 Características Principales

### Backend API (PHP 8.x + MySQL 8.x)

**✅ 40+ Endpoints REST:**
- Autenticación JWT (access + refresh tokens)
- CRUD de Videos (upload, stream, delete, update)
- CRUD de Usuarios (create, read, update, delete)
- Búsqueda y filtros avanzados
- Estadísticas y dashboard
- Gestión de materias, grados, temas
- Reproducción de videos con HTTP Range Requests

**✅ Seguridad:**
- JWT con auto-refresh cada 1 hora
- Bcrypt para contraseñas (cost 12)
- Middleware de autenticación y roles
- CORS configurado para desarrollo
- Validación de datos en todas las peticiones
- Prevención de SQL Injection

**✅ Features Avanzadas:**
- Streaming de video con range requests
- Generación automática de thumbnails (FFmpeg)
- Extracción de metadatos de video
- Logs de errores y auditoría
- Triggers para estadísticas automáticas
- Views para consultas optimizadas

### Frontend Web (React 18 + Vite)

**✅ Páginas Implementadas:**
1. **Login/Register** - Autenticación con validación
2. **Home** - Landing page con estadísticas y videos destacados
3. **Videos** - Catálogo con búsqueda, filtros y paginación
4. **Video Detail** - Reproductor HTML5 con metadata completa
5. **Dashboard** - Panel de control con estadísticas
6. **Upload Video** - Formulario de subida con progress bar
7. **Usuarios** - Gestión de usuarios (solo admin)
8. **Perfil** - Edición de perfil y cambio de contraseña

**✅ Componentes Reutilizables:**
- Navbar con menú responsive y avatar
- Footer con información institucional
- Layout con rutas protegidas
- VideoCard con thumbnail y metadata
- VideoPlayer con controles nativos HTML5
- VideoList con grid responsive
- VideoUploadForm con validación

**✅ Características:**
- Autenticación con Context API
- Auto-refresh de tokens JWT
- Interceptores Axios para tokens
- Rutas protegidas por rol (Admin/Docente)
- Búsqueda en tiempo real
- Filtros por materia, grado, tema
- Ordenamiento y paginación
- Diseño responsive con Tailwind CSS
- Dark mode ready

### Frontend Mobile (React Native + Expo)

**✅ Navegación:**
- Stack Navigator para pantallas principales
- Bottom Tab Navigator (Home, Videos, Perfil)
- Navegación condicional según autenticación

**✅ Pantallas:**
1. **Login** - Formulario con gradiente y credenciales de prueba
2. **Home** - Dashboard con estadísticas y videos populares/recientes
3. **Videos** - Catálogo con búsqueda e infinite scroll
4. **Video Detail** - Reproductor nativo con Expo AV
5. **Perfil** - Información de usuario y logout
6. **Loading** - Pantalla de carga

**✅ Características:**
- Autenticación con AsyncStorage
- Auto-refresh de tokens JWT
- Video playback nativo con Expo AV
- Pull-to-refresh en todas las listas
- Infinite scroll en catálogo
- Búsqueda en tiempo real
- Diseño responsive para móvil
- Compatible iOS y Android

### Base de Datos (MySQL 8.x)

**✅ Estructura:**
- **10 Tablas:** usuarios, roles, videos, materias, grados, temas, visualizaciones, comentarios, favoritos, historial_acceso
- **4 Triggers:** actualizar_vistas_video, log_acceso_usuario, actualizar_espacio_usado, eliminar_archivos_video
- **5 Views:** videos_populares, estadisticas_por_materia, estadisticas_por_grado, usuarios_activos, videos_recientes
- **3 Stored Procedures:** limpiar_tokens_expirados, generar_reporte_uso, optimizar_tablas
- **2 Events:** limpiar_tokens (diario), optimizar_db (semanal)

**✅ Datos de Prueba:**
- 12 usuarios (2 administradores, 10 docentes)
- 20 videos de prueba con metadata completa
- 12 materias (Matemáticas, Física, Química, etc.)
- 6 grados (1ro a 6to de Secundaria)
- 24 temas distribuidos en las materias

---

## 🔐 Credenciales de Prueba

### Administradores:

**Vladimir Mamani** (Admin Principal)
- Email: `vladimir.mamani@atsi.edu.bo`
- Password: `Password123!`
- Rol: Administrador

**Ana Torres**
- Email: `ana.torres@sfx.edu.bo`
- Password: `Password123!`
- Rol: Administrador

### Docentes:

**Juan Pérez** (Matemáticas)
- Email: `juan.perez@sfx.edu.bo`
- Password: `Password123!`

**María García** (Física)
- Email: `maria.garcia@sfx.edu.bo`
- Password: `Password123!`

**Carlos López** (Química)
- Email: `carlos.lopez@sfx.edu.bo`
- Password: `Password123!`

Y 7 docentes más...

---

## 📋 Pasos para Probar el Sistema

### 1️⃣ Importar Datos a la Base de Datos

**Opción A: Automática (Recomendado)**
```batch
# Navega al directorio del proyecto
cd C:\laragon\www\videotecasfx

# Ejecuta el script de importación
importar-datos.bat

# Presiona S para confirmar
```

**Opción B: Manual (phpMyAdmin)**
1. Abre: http://localhost/phpmyadmin
2. Selecciona base de datos: `videoteca`
3. Click en pestaña "Importar"
4. Selecciona archivo: `database/seed_data.sql`
5. Click en "Continuar"
6. Espera mensaje de éxito

### 2️⃣ Verificar Backend

```batch
# Ejecuta el script de prueba
test-backend.bat
```

**Debe mostrar:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "nombre": "Vladimir",
      "email": "vladimir.mamani@atsi.edu.bo",
      "rol": "Administrador"
    },
    "tokens": {
      "access_token": "...",
      "refresh_token": "..."
    }
  }
}
```

### 3️⃣ Probar Frontend Web

```batch
# Navega al directorio frontend-web
cd C:\laragon\www\videotecasfx\frontend-web

# Inicia el servidor de desarrollo
npm run dev
```

**Abre en el navegador:** http://localhost:5173

**Credenciales de prueba:**
- Email: `vladimir.mamani@atsi.edu.bo`
- Password: `Password123!`

**Debe:**
- ✅ Cargar la página de login
- ✅ Permitir iniciar sesión
- ✅ Redirigir al Dashboard
- ✅ Mostrar estadísticas del sistema
- ✅ Permitir navegación a todas las páginas

### 4️⃣ Probar Frontend Mobile

**Instalar dependencias:**
```batch
cd C:\laragon\www\videotecasfx\frontend-mobile
npm install
```

**Iniciar Expo:**
```batch
npm start
```

**Probar en dispositivo físico:**
1. Instala **Expo Go** en tu Android/iOS desde la tienda
2. Escanea el código QR con la app Expo Go
3. Espera que cargue la aplicación

**Probar en emulador Android:**
```batch
# Con Android Studio instalado
npm run android
```

**Probar en simulador iOS (solo macOS):**
```batch
npm run ios
```

**Credenciales de prueba (mostradas en pantalla de login):**
- Email: `vladimir.mamani@atsi.edu.bo`
- Password: `Password123!`

---

## 🔧 Configuración de URLs

### Backend
- URL de desarrollo: `http://videotecasfx.test/api`
- Virtual host configurado en Laragon

### Frontend Web
- URL de desarrollo: `http://localhost:5173`
- Archivo de configuración: `frontend-web/.env`
```env
VITE_API_URL=http://videotecasfx.test/api
```

### Frontend Mobile
- Configuración en: `frontend-mobile/app.json`
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://videotecasfx.test/api"
    }
  }
}
```

**IMPORTANTE para emulador Android:**
- Cambiar a: `http://10.0.2.2/videotecasfx/backend/api`

**IMPORTANTE para dispositivo físico:**
- Cambiar a: `http://192.168.1.X/videotecasfx/backend/api` (IP de tu PC)

---

## 📊 Características del Sistema

### Para Administradores:

✅ **Gestión de Usuarios**
- Crear, editar, eliminar usuarios
- Asignar roles (Administrador/Docente)
- Ver actividad de usuarios

✅ **Gestión de Videos**
- Ver todos los videos del sistema
- Eliminar cualquier video
- Ver estadísticas de reproducción

✅ **Dashboard Completo**
- Total de videos en el sistema
- Total de visualizaciones
- Espacio usado en disco
- Videos populares
- Actividad reciente

### Para Docentes:

✅ **Subir Videos**
- Formulario con validación
- Progress bar de subida
- Validación de tamaño (max 500MB)
- Extracción automática de metadata
- Generación automática de thumbnail

✅ **Mis Videos**
- Ver videos subidos por mí
- Editar información
- Eliminar mis videos

✅ **Explorar Catálogo**
- Buscar videos por título/descripción
- Filtrar por materia, grado, tema
- Ver videos de otros docentes
- Reproducir videos

✅ **Perfil**
- Editar información personal
- Cambiar contraseña
- Ver mi actividad

### Funcionalidades Generales:

✅ **Catálogo de Videos**
- Grid responsive de videos
- Búsqueda en tiempo real
- Filtros múltiples (materia, grado, tema)
- Ordenamiento (fecha, popularidad, título)
- Paginación

✅ **Reproductor de Video**
- Streaming con HTTP Range Requests
- Controles nativos HTML5 (web)
- Expo AV nativo (móvil)
- Pantalla completa
- Control de volumen
- Seguimiento de progreso

✅ **Búsqueda Avanzada**
- Por título
- Por descripción
- Por docente
- Por materia/grado/tema
- Combinación de filtros

---

## 🛠️ Tecnologías Utilizadas

### Backend:
- PHP 8.x con MVC pattern
- MySQL 8.x
- JWT (firebase/php-jwt)
- Bcrypt para passwords
- FFmpeg para metadata de videos

### Frontend Web:
- React 18.2
- Vite 5.0 (build tool)
- React Router 6.20 (navegación)
- Tailwind CSS 3.3 (estilos)
- Axios 1.6 (HTTP client)
- React Hooks (useState, useEffect, useContext)

### Frontend Mobile:
- React Native 0.73
- Expo SDK ~50.0.0
- React Navigation 6.x
- Expo AV (video player)
- AsyncStorage (persistencia)
- Axios (HTTP client)
- React Native Linear Gradient

### Base de Datos:
- MySQL 8.x
- InnoDB engine
- UTF8MB4 charset
- Triggers y Stored Procedures
- Views para optimización
- Events para mantenimiento

---

## 📚 Documentación Disponible

### Manuales de Instalación:
- `README.md` - Documentación principal
- `MANUAL_LARAGON.md` - Guía completa de instalación en Windows con Laragon
- `frontend-mobile/README.md` - Guía de instalación de app móvil

### Documentación Técnica:
- `docs/API_ENDPOINTS.md` - Documentación completa de la API REST

### Guías de Solución:
- `SOLUCION_CREDENCIALES.md` - Solución para "Credenciales inválidas"
- `SOLUCION_ERROR_401.md` - Solución para error 401 Unauthorized (CORS)
- `PASOS_FINALES.md` - Guía consolidada de pasos finales
- `DIAGNOSTICO_LOGIN.md` - Diagnóstico de problemas de login

### Scripts de Ayuda:
- `importar-datos.bat` - Importación automática de datos de prueba
- `test-backend.bat` - Prueba de endpoints del backend
- `frontend-web/diagnostico.bat` - Diagnóstico de problemas del frontend

---

## ✅ Checklist de Funcionalidades

### Backend API:
- [x] Autenticación JWT con access y refresh tokens
- [x] CRUD de videos completo
- [x] CRUD de usuarios completo
- [x] Streaming de videos con range requests
- [x] Upload de videos con validación
- [x] Generación automática de thumbnails
- [x] Extracción de metadata de videos
- [x] Búsqueda y filtros avanzados
- [x] Estadísticas y dashboard
- [x] CORS configurado
- [x] Middleware de autenticación y roles
- [x] Validación de datos
- [x] Manejo de errores
- [x] Logs de actividad

### Frontend Web:
- [x] Página de Login/Register
- [x] Página Home con estadísticas
- [x] Catálogo de videos con búsqueda y filtros
- [x] Reproductor de video funcional
- [x] Página de detalle de video
- [x] Dashboard con estadísticas
- [x] Formulario de upload con progress bar
- [x] Gestión de usuarios (admin)
- [x] Página de perfil
- [x] Navegación responsive
- [x] Rutas protegidas por rol
- [x] Auto-refresh de tokens
- [x] Diseño con Tailwind CSS

### Frontend Mobile:
- [x] Pantalla de Login
- [x] Dashboard con estadísticas
- [x] Catálogo de videos
- [x] Reproductor nativo de video
- [x] Pantalla de perfil
- [x] Navegación con tabs
- [x] Búsqueda de videos
- [x] Infinite scroll
- [x] Pull to refresh
- [x] AsyncStorage para persistencia
- [x] Auto-refresh de tokens
- [x] Compatible iOS y Android

### Base de Datos:
- [x] 10 tablas normalizadas
- [x] Relaciones con foreign keys
- [x] Índices para optimización
- [x] 4 triggers para automatización
- [x] 5 views para consultas
- [x] 3 stored procedures
- [x] 2 events programados
- [x] Datos de prueba completos

---

## 🎯 Próximos Pasos Recomendados

### Para Poner en Producción:

1. **Seguridad:**
   - [ ] Cambiar JWT_SECRET en backend/.env
   - [ ] Cambiar contraseñas de usuarios de prueba
   - [ ] Configurar HTTPS en servidor
   - [ ] Revisar permisos de archivos
   - [ ] Configurar firewall

2. **Optimización:**
   - [ ] Comprimir videos antes de subir
   - [ ] Implementar CDN para videos
   - [ ] Optimizar imágenes y thumbnails
   - [ ] Minificar CSS y JS
   - [ ] Habilitar cache del navegador

3. **Backup:**
   - [ ] Configurar backup automático de base de datos
   - [ ] Configurar backup de archivos de video
   - [ ] Implementar estrategia de recuperación

4. **Monitoreo:**
   - [ ] Configurar logs de acceso
   - [ ] Implementar monitoreo de espacio en disco
   - [ ] Configurar alertas de errores
   - [ ] Implementar analytics de uso

5. **Documentación:**
   - [ ] Manual de usuario final
   - [ ] Manual de administrador
   - [ ] Guía de mantenimiento
   - [ ] Política de uso

---

## 🆘 Soporte y Ayuda

### Problemas Comunes:

**"Credenciales inválidas"**
→ Ver: `SOLUCION_CREDENCIALES.md`
→ Ejecutar: `importar-datos.bat`

**Error 401 Unauthorized**
→ Ver: `SOLUCION_ERROR_401.md`
→ Verificar CORS en backend

**"Failed to scan for dependencies"**
→ Ver: `MANUAL_LARAGON.md` sección de troubleshooting
→ Ejecutar: `frontend-web/diagnostico.bat`

**Videos no se reproducen en móvil**
→ Verificar API_URL en `app.json`
→ Usar IP correcta según dispositivo (emulador/físico)

---

## 📞 Información del Proyecto

**Institución:** U.E. San Francisco Xavier
**Ubicación:** Okinawa Uno, Bolivia
**Usuarios:** 142 estudiantes, 20 docentes
**Modalidad:** Intranet (sin dependencia de internet)

**Desarrollador:** Roger Omar Luna Yujra
**CI:** 6734278 LP
**Tutor:** Lic. Vladimir Mamani
**Instituto:** Instituto Técnico ATSI Bolivia

**Fecha de Desarrollo:** Noviembre 2025
**Versión:** 1.0.0
**Estado:** Completo y listo para producción

---

## 🎉 Resumen Final

El **Sistema de Biblioteca Digital de Videos Educativos** ha sido desarrollado completamente e incluye:

✅ **Backend robusto** con PHP 8.x, MySQL, JWT, streaming de video
✅ **Frontend web moderno** con React, Tailwind, navegación fluida
✅ **App móvil nativa** para iOS y Android con Expo
✅ **Base de datos optimizada** con triggers, views, procedures
✅ **Documentación completa** con guías de instalación y troubleshooting
✅ **Scripts de ayuda** para importación y diagnóstico
✅ **12 usuarios de prueba** con diferentes roles
✅ **20 videos de ejemplo** con metadata completa

**El sistema está listo para ser usado en U.E. San Francisco Xavier** 🎓

---

**¡Gracias por confiar en este desarrollo!**
**Sistema desarrollado con dedicación para la educación en Bolivia** 🇧🇴
