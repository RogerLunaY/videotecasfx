# 📚 Sistema de Biblioteca Digital de Videos Educativos

Sistema web integral para streaming de videos educativos en servidor local (intranet) para la **Unidad Educativa San Francisco Xavier**, Okinawa Uno, Bolivia.

## 👨‍🎓 Información del Proyecto

- **Estudiante:** Roger Omar Luna Yujra (CI: 6734278 LP)
- **Tutor:** Lic. Vladimir Mamani
- **Institución:** Instituto Técnico "ATSI" Bolivia
- **Beneficiario:** U.E. San Francisco Xavier
- **Directora:** Sor Grethel Alvarez Mamani
- **Modalidad:** Técnico Humanístico Pleno

## 🎯 Objetivos

Desarrollar un sistema de gestión y streaming de videos educativos que permita a 142 estudiantes y 20 docentes acceder a contenido multimedia educativo sin dependencia de internet, funcionando completamente en red local (intranet).

## 🛠️ Stack Tecnológico

### Backend
- **PHP 8.x** - Lenguaje del servidor
- **MySQL 8.x** - Base de datos relacional
- **Apache 2.4** - Servidor web (XAMPP)
- **JWT** - Autenticación con tokens
- **FFmpeg** - Procesamiento de videos (opcional)

### Frontend Web
- **React 18+** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS / Material-UI** - Estilos
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios

### Frontend Móvil
- **React Native** - Framework móvil
- **Expo** - Toolchain y SDK
- **React Navigation** - Navegación móvil

## 📁 Estructura del Proyecto

```
videotecasfx/
├── backend/                      # API REST en PHP
│   ├── config/                   # Configuraciones
│   │   ├── database.php         # Conexión PDO con Singleton
│   │   ├── jwt.php              # Configuración JWT
│   │   ├── cors.php             # CORS para API
│   │   └── app.php              # Config general
│   ├── controllers/              # Controladores MVC
│   │   ├── AuthController.php   # Autenticación
│   │   ├── UsuarioController.php # Gestión usuarios
│   │   ├── VideoController.php   # Gestión videos
│   │   └── EstadisticaController.php # Reportes
│   ├── models/                   # Modelos de datos
│   │   ├── Usuario.php
│   │   ├── Video.php
│   │   ├── Reproduccion.php
│   │   └── Estadistica.php
│   ├── middleware/               # Middleware
│   │   ├── AuthMiddleware.php   # Verificación JWT
│   │   ├── RoleMiddleware.php   # Control de permisos
│   │   └── ValidationMiddleware.php # Validación
│   ├── utils/                    # Utilidades
│   │   ├── JWTHandler.php       # Manejo de tokens
│   │   ├── FileHandler.php      # Subida de archivos
│   │   ├── VideoProcessor.php   # Procesamiento videos
│   │   └── Logger.php           # Sistema de logs
│   ├── routes/                   # Definición de rutas
│   │   └── api.php              # Router REST
│   ├── uploads/                  # Archivos subidos
│   │   ├── videos/              # Videos por materia/grado
│   │   └── thumbnails/          # Miniaturas
│   ├── logs/                     # Logs del sistema
│   ├── .htaccess                # Configuración Apache
│   ├── .env.example             # Template de configuración
│   ├── index.php                # Punto de entrada
│   └── API_ENDPOINTS.md         # Documentación API
├── database/                     # Scripts SQL
│   ├── schema.sql               # Estructura completa
│   └── seed_data.sql            # Datos de prueba
├── frontend-web/                 # Aplicación React
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   ├── pages/               # Páginas principales
│   │   ├── services/            # Servicios API
│   │   ├── context/             # Context API
│   │   ├── hooks/               # Custom hooks
│   │   └── utils/               # Utilidades
│   ├── public/                  # Archivos estáticos
│   ├── package.json
│   └── vite.config.js
├── mobile-app/                   # App React Native
│   ├── src/
│   │   ├── screens/             # Pantallas
│   │   ├── components/          # Componentes
│   │   ├── navigation/          # Navegación
│   │   └── services/            # Servicios API
│   ├── App.js
│   └── package.json
└── README.md                     # Este archivo
```

## 🚀 Instalación y Configuración

> **💡 ¿Usas Laragon en Windows?**
> Consulta el **[Manual de Instalación con Laragon](./MANUAL_LARAGON.md)** para instrucciones específicas paso a paso.
> O la **[Guía de Inicio Rápido](./INICIO_RAPIDO_LARAGON.md)** para instalación express en 5 minutos.

### Prerrequisitos

- **XAMPP** o **Laragon** (Apache + MySQL + PHP 8.x)
- **Node.js** 18+ y npm (para frontend)
- **Git** (opcional, para control de versiones)
- **FFmpeg** (opcional, para procesamiento de videos)

### 1. Configurar Base de Datos

```bash
# 1. Iniciar MySQL en XAMPP

# 2. Crear la base de datos
mysql -u root -p < database/schema.sql

# 3. Insertar datos de prueba
mysql -u root -p < database/seed_data.sql
```

### 2. Configurar Backend PHP

```bash
cd backend

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales
# DB_HOST=localhost
# DB_NAME=videoteca
# DB_USER=root
# DB_PASS=tu_password
# JWT_SECRET=cambiar_en_produccion
```

**Verificar configuración de PHP:**
```ini
# En php.ini de XAMPP, asegurarse de:
upload_max_filesize = 500M
post_max_size = 500M
max_execution_time = 600
memory_limit = 512M
```

**Crear directorio de logs:**
```bash
mkdir logs
chmod 755 logs
chmod 755 uploads
```

### 3. Configurar Frontend Web

```bash
cd frontend-web

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env
# VITE_API_URL=http://localhost/backend/api

# Iniciar en modo desarrollo
npm run dev
```

### 4. Configurar App Móvil

```bash
cd mobile-app

# Instalar dependencias
npm install

# Configurar Expo
npm install -g expo-cli

# Iniciar app
expo start
```

## 🔐 Credenciales de Prueba

### Administradores
```
Email: vladimir.mamani@atsi.edu.bo
Password: Password123!

Email: grethel.alvarez@sfx.edu.bo
Password: Password123!
```

### Docentes
```
Email: juan.perez@sfx.edu.bo (Matemática - 1ro)
Password: Password123!

Email: maria.lopez@sfx.edu.bo (Matemática - 4to)
Password: Password123!

(Y 8 docentes más - ver database/seed_data.sql)
```

## 📡 API REST - Endpoints Principales

Base URL: `http://localhost/backend/api`

### Autenticación
```http
POST /api/auth/login          # Login
POST /api/auth/register       # Registro (solo admins)
POST /api/auth/refresh        # Refresh token
POST /api/auth/logout         # Logout
GET  /api/auth/me            # Usuario actual
```

### Usuarios
```http
GET    /api/usuarios              # Listar (paginado)
GET    /api/usuarios/{id}         # Obtener por ID
POST   /api/usuarios              # Crear (admin)
PUT    /api/usuarios/{id}         # Actualizar
DELETE /api/usuarios/{id}         # Eliminar (admin)
PUT    /api/usuarios/{id}/password # Cambiar contraseña
```

### Videos
```http
GET    /api/videos                 # Listar (filtros)
GET    /api/videos/{id}            # Obtener por ID
POST   /api/videos                 # Subir video (multipart)
PUT    /api/videos/{id}            # Actualizar
DELETE /api/videos/{id}            # Eliminar
GET    /api/videos/{id}/stream     # Streaming (range requests)
GET    /api/videos/buscar?q=texto  # Buscar
GET    /api/videos/populares       # Más vistos
GET    /api/videos/recientes       # Más recientes
GET    /api/videos/materia/{id}    # Por materia
GET    /api/videos/grado/{id}      # Por grado
```

### Estadísticas
```http
GET /api/estadisticas/dashboard           # Dashboard completo
GET /api/estadisticas/generales           # Estadísticas generales
GET /api/estadisticas/videos-populares    # Top videos
GET /api/estadisticas/por-materia         # Por materia
GET /api/estadisticas/por-grado           # Por grado
GET /api/estadisticas/tendencias?dias=7   # Tendencias
GET /api/estadisticas/resumen-ejecutivo   # Resumen (admin)
```

Ver documentación completa en: `backend/API_ENDPOINTS.md`

## 💾 Base de Datos - Estructura

### Tablas Principales

- **usuarios** - Administradores y docentes
- **roles** - Roles del sistema (Administrador, Docente)
- **videos** - Catálogo de videos educativos
- **materias** - Asignaturas (12 materias del currículo boliviano)
- **grados** - Niveles de secundaria (1ro a 6to)
- **temas** - Temas específicos por materia
- **reproducciones** - Registro de visualizaciones
- **estadisticas** - Estadísticas agregadas
- **logs_sistema** - Logs de acciones
- **tokens_refresh** - Tokens JWT de refresco

### Vistas SQL

- `vista_videos_completos` - Videos con toda la información
- `vista_stats_por_materia` - Estadísticas por materia
- `vista_stats_por_grado` - Estadísticas por grado
- `vista_videos_populares` - Top 10 videos más vistos
- `vista_actividad_reciente` - Últimas 50 acciones

### Triggers

- Incremento automático de visualizaciones
- Registro automático en logs al crear/eliminar usuarios y videos

## 🎨 Características del Sistema

### Backend PHP

✅ **Arquitectura MVC** - Modelo Vista Controlador
✅ **API RESTful** - 40+ endpoints documentados
✅ **Autenticación JWT** - Access y refresh tokens
✅ **Control de roles** - Administrador y Docente
✅ **Validación exhaustiva** - Inputs sanitizados
✅ **Upload de videos** - Hasta 500MB con validación
✅ **Video streaming** - Range requests para reproducción eficiente
✅ **Procesamiento de metadata** - Duración, resolución, codec
✅ **Generación de thumbnails** - Automática con FFmpeg
✅ **Sistema de logging** - Archivo y base de datos
✅ **Estadísticas avanzadas** - Dashboard completo
✅ **Seguridad** - Bcrypt, sanitización, protección XSS/SQLi

### Frontend Web (React)

✅ **Diseño responsive** - Mobile-first
✅ **Reproductor personalizado** - Controles completos
✅ **Búsqueda avanzada** - Filtros múltiples
✅ **Dashboard diferenciado** - Por rol
✅ **Upload con progreso** - Feedback visual
✅ **Estadísticas visuales** - Gráficos Chart.js/Recharts
✅ **Autenticación persistente** - LocalStorage
✅ **Manejo de errores** - Feedback al usuario
✅ **Optimización** - Lazy loading, code splitting

### App Móvil (React Native)

✅ **Navegación optimizada** - Stack y Tab navigation
✅ **Reproductor nativo** - Mejor rendimiento
✅ **Offline support** - Descarga de videos (opcional)
✅ **Push notifications** - Nuevo contenido
✅ **Sincronización** - Con plataforma web
✅ **Diseño adaptativo** - Tablets y smartphones

## 🔒 Seguridad Implementada

1. **Autenticación**
   - JWT con tokens de corta vida (1 hora)
   - Refresh tokens seguros (7 días)
   - Bloqueo temporal tras 5 intentos fallidos

2. **Autorización**
   - Control de permisos por rol
   - Verificación de propietario de recursos
   - Middleware de autenticación en cada ruta protegida

3. **Validación**
   - Sanitización de todos los inputs
   - Validación de tipos MIME
   - Limitación de tamaño de archivos
   - Prevención de XSS y SQL Injection

4. **Passwords**
   - Bcrypt con costo 12
   - Nunca se exponen en responses
   - Validación de complejidad

5. **Archivos**
   - Nombres sanitizados
   - Extensiones verificadas
   - Almacenamiento organizado
   - Protección contra directory traversal

## 📊 Datos de Prueba Incluidos

- **2 Administradores**
- **10 Docentes** (distribuidos en materias y grados)
- **12 Materias** (currículo boliviano)
- **6 Grados** (secundaria)
- **24 Temas** (ejemplos por materia)
- **20 Videos** (de ejemplo con metadata completa)

## 🌐 Configuración para Red Local

### Para usar en la red local de la escuela:

1. **Configurar IP estática en el servidor:**
   ```
   Ejemplo: 192.168.1.100
   ```

2. **Actualizar configuración frontend:**
   ```javascript
   // .env en frontend-web y mobile-app
   VITE_API_URL=http://192.168.1.100/backend/api
   ```

3. **Configurar Apache:**
   ```apache
   # httpd.conf
   Listen 80
   ServerName 192.168.1.100
   ```

4. **Firewall:**
   ```bash
   # Permitir puerto 80
   sudo ufw allow 80/tcp
   ```

## 📖 Documentación Adicional

- **API Endpoints:** `backend/API_ENDPOINTS.md`
- **Código fuente:** Completamente comentado con PHPDoc
- **Base de datos:** Comentarios inline en schema.sql

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar MySQL está corriendo
mysql -u root -p

# Verificar credenciales en backend/.env
```

### Error: "Failed to upload file"
```bash
# Verificar permisos de escritura
chmod 755 backend/uploads/videos
chmod 755 backend/uploads/thumbnails

# Verificar php.ini
upload_max_filesize = 500M
post_max_size = 500M
```

### Error: "FFmpeg not found"
```bash
# FFmpeg es opcional, pero recomendado
# Instalar en Windows: https://ffmpeg.org/download.html
# Agregar a PATH del sistema
```

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:
- **Estudiante:** Roger Omar Luna Yujra
- **Tutor:** Lic. Vladimir Mamani
- **Institución:** Instituto Técnico ATSI Bolivia

## 📄 Licencia

Este proyecto es desarrollado como trabajo de grado para el Instituto Técnico ATSI Bolivia y la Unidad Educativa San Francisco Xavier.

---

**Desarrollado con ❤️ para la educación en Bolivia**

*U.E. San Francisco Xavier - Okinawa Uno, Bolivia*
