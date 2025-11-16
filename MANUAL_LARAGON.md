# Manual de Instalación con Laragon

## Sistema de Biblioteca Digital de Videos Educativos - U.E. San Francisco Xavier

Este manual describe paso a paso cómo instalar y ejecutar el proyecto usando **Laragon** en Windows.

---

## 📋 Requisitos Previos

### Software Necesario

1. **Laragon Full** (versión 6.0 o superior)
   - Descarga: https://laragon.org/download/
   - Incluye: Apache, MySQL, PHP 8.x, Node.js
   - Recomendado: Laragon Full (incluye todas las herramientas)

2. **Git** (opcional, para clonar el repositorio)
   - Descarga: https://git-scm.com/download/win

### Especificaciones del Sistema
- Windows 10/11 (64-bit)
- Mínimo 8GB RAM
- 10GB espacio libre en disco (para videos)
- Procesador dual-core o superior

---

## 🚀 Instalación Paso a Paso

### Paso 1: Instalar y Configurar Laragon

1. **Descargar e Instalar Laragon:**
   - Descargar **Laragon Full** desde https://laragon.org/download/
   - Ejecutar el instalador como administrador
   - Seguir el asistente de instalación
   - Instalar en la ruta predeterminada: `C:\laragon`

2. **Iniciar Laragon:**
   - Abrir Laragon desde el menú inicio
   - Click en **"Start All"** para iniciar Apache y MySQL
   - Esperar a que los servicios estén en verde

3. **Verificar la Instalación:**
   - Click derecho en Laragon > **Web** > **localhost**
   - Debe abrir el navegador mostrando la página de inicio de Laragon
   - Verificar versión de PHP: Click derecho > **PHP** > debe mostrar PHP 8.x

### Paso 2: Copiar el Proyecto

1. **Ubicar la Carpeta de Proyectos:**
   - Por defecto: `C:\laragon\www`

2. **Copiar el Proyecto:**

   **Opción A - Si tienes el código:**
   ```
   - Copiar la carpeta "videotecasfx" completa a C:\laragon\www\
   - Debe quedar: C:\laragon\www\videotecasfx\
   ```

   **Opción B - Clonar desde Git:**
   ```bash
   # Abrir Terminal en Laragon: Click derecho > Terminal
   cd C:\laragon\www
   git clone https://github.com/RogerLunaY/videotecasfx.git
   cd videotecasfx
   ```

### Paso 3: Configurar la Base de Datos

1. **Abrir phpMyAdmin:**
   - En Laragon: Click derecho > **MySQL** > **phpMyAdmin**
   - O navegar a: http://localhost/phpmyadmin
   - Usuario: `root`
   - Contraseña: (dejar vacío o `root` según tu configuración)

2. **Crear la Base de Datos:**
   - Click en **"Nueva"** en el panel izquierdo
   - Nombre de la base de datos: `videoteca_sfx`
   - Cotejamiento: `utf8mb4_unicode_ci`
   - Click en **"Crear"**

3. **Importar el Schema:**
   - Seleccionar la base de datos `videoteca_sfx`
   - Click en la pestaña **"Importar"**
   - Click en **"Elegir archivo"**
   - Seleccionar: `C:\laragon\www\videotecasfx\database\schema.sql`
   - Click en **"Continuar"** al final de la página
   - Esperar a que se complete (debe mostrar mensaje de éxito)

4. **Importar Datos de Prueba:**
   - Con la base de datos `videoteca_sfx` seleccionada
   - Click en **"Importar"** nuevamente
   - Seleccionar: `C:\laragon\www\videotecasfx\database\seed_data.sql`
   - Click en **"Continuar"**

5. **Verificar Importación:**
   - En el panel izquierdo, expandir `videoteca_sfx`
   - Debe mostrar 10 tablas: usuarios, roles, videos, materias, etc.
   - Click en tabla `usuarios` > **Examinar**
   - Debe mostrar 12 usuarios de prueba

### Paso 4: Configurar el Backend PHP

1. **Crear el Archivo de Configuración:**
   - Navegar a: `C:\laragon\www\videotecasfx\backend\`
   - Copiar el archivo `.env.example` y renombrarlo a `.env`

2. **Editar el Archivo .env:**
   - Abrir `backend\.env` con un editor de texto (Notepad++, VS Code, etc.)
   - Configurar las credenciales de la base de datos:

   ```env
   # Base de datos
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=videoteca_sfx
   DB_USER=root
   DB_PASS=

   # JWT (NO cambiar estos valores)
   JWT_SECRET=tu_clave_secreta_muy_segura_cambiala_en_produccion_2024
   JWT_ALGORITHM=HS256
   JWT_ACCESS_LIFETIME=3600
   JWT_REFRESH_LIFETIME=604800

   # Aplicación
   APP_ENV=development
   APP_DEBUG=true
   APP_URL=http://localhost
   TIMEZONE=America/La_Paz

   # CORS
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

   # Uploads
   UPLOAD_MAX_SIZE=524288000
   UPLOAD_VIDEO_PATH=uploads/videos/
   UPLOAD_THUMBNAIL_PATH=uploads/thumbnails/

   # FFmpeg (Opcional - solo si tienes FFmpeg instalado)
   FFMPEG_PATH=ffmpeg
   FFPROBE_PATH=ffprobe
   ```

   **Nota sobre DB_PASS:**
   - Si Laragon no tiene contraseña: dejar vacío `DB_PASS=`
   - Si configuraste contraseña `root`: usar `DB_PASS=root`

3. **Crear Carpetas de Uploads:**
   - Crear las siguientes carpetas en `C:\laragon\www\videotecasfx\backend\`:
   ```
   backend\uploads\
   backend\uploads\videos\
   backend\uploads\thumbnails\
   backend\logs\
   ```

4. **Configurar Permisos:**
   - Click derecho en carpeta `uploads` > **Propiedades** > **Seguridad**
   - Asegurarse que "Usuarios" tenga permisos de **Modificar**
   - Lo mismo para la carpeta `logs`

5. **Configurar el Virtual Host (Opcional pero Recomendado):**

   En Laragon, crear un host virtual para el backend:

   - Click derecho en Laragon > **Apache** > **sites-enabled**
   - Crear archivo: `videotecasfx.conf` con el siguiente contenido:

   ```apache
   <VirtualHost *:80>
       DocumentRoot "C:/laragon/www/videotecasfx/backend"
       ServerName videotecasfx.test
       ServerAlias *.videotecasfx.test

       <Directory "C:/laragon/www/videotecasfx/backend">
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

   - Guardar el archivo
   - Click derecho en Laragon > **Apache** > **Reload**
   - Agregar al archivo `C:\Windows\System32\drivers\etc\hosts` (como administrador):
   ```
   127.0.0.1    videotecasfx.test
   ```

### Paso 5: Configurar el Frontend React

1. **Abrir Terminal de Laragon:**
   - Click derecho en Laragon > **Terminal**
   - O abrir CMD/PowerShell y navegar a la carpeta

2. **Navegar al Frontend:**
   ```bash
   cd C:\laragon\www\videotecasfx\frontend-web
   ```

3. **Instalar Node.js (si no está incluido):**
   - Verificar si Node.js está instalado:
   ```bash
   node --version
   npm --version
   ```
   - Si no está instalado, descargar de: https://nodejs.org/ (versión LTS)

4. **Instalar Dependencias:**
   ```bash
   npm install
   ```
   - Esperar a que se descarguen todas las dependencias (puede tardar 2-5 minutos)

5. **Crear Archivo de Configuración:**
   - Navegar a: `C:\laragon\www\videotecasfx\frontend-web\`
   - Copiar `.env.example` a `.env`
   - Editar `frontend-web\.env`:

   ```env
   # URL del backend
   VITE_API_URL=http://localhost/videotecasfx/backend

   # O si configuraste virtual host:
   # VITE_API_URL=http://videotecasfx.test
   ```

---

## ▶️ Ejecutar el Proyecto

### Iniciar el Backend

1. **Asegurarse que Laragon esté corriendo:**
   - Abrir Laragon
   - Click en **"Start All"**
   - Apache y MySQL deben estar en verde

2. **Probar el Backend:**
   - Abrir navegador
   - Navegar a: `http://localhost/videotecasfx/backend/api/health`
   - O con virtual host: `http://videotecasfx.test/api/health`
   - Debe mostrar:
   ```json
   {
     "status": "ok",
     "message": "API is running",
     "timestamp": "..."
   }
   ```

### Iniciar el Frontend

1. **Abrir Terminal:**
   - Click derecho en Laragon > **Terminal**

2. **Navegar al Frontend:**
   ```bash
   cd C:\laragon\www\videotecasfx\frontend-web
   ```

3. **Iniciar el Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```

4. **Acceder a la Aplicación:**
   - El terminal mostrará algo como:
   ```
   VITE v5.0.0  ready in 500 ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```
   - Abrir navegador en: **http://localhost:5173**

---

## 🔐 Credenciales de Prueba

### Administrador
- **Email:** vladimir.mamani@atsi.edu.bo
- **Contraseña:** Password123!

### Docente
- **Email:** juan.perez@sfx.edu.bo
- **Contraseña:** Password123!

---

## 🧪 Probar el Sistema

### 1. Iniciar Sesión
- Ir a: http://localhost:5173
- Click en **"Iniciar Sesión"**
- Usar credenciales de Administrador o Docente
- Debe redirigir al Dashboard

### 2. Explorar Videos
- Click en **"Videos"** en el menú
- Debe mostrar 20 videos de prueba
- Click en cualquier video para ver detalles
- Probar el reproductor

### 3. Subir un Video (Como Docente/Admin)
- Ir a **"Subir Video"**
- Llenar formulario:
  - Título, descripción
  - Materia, grado, tema
  - Seleccionar archivo de video (MP4 recomendado)
- Click en **"Subir Video"**
- Esperar a que se complete la subida

### 4. Gestión de Usuarios (Solo Admin)
- Ir a **"Usuarios"**
- Ver lista de usuarios
- Probar filtros
- Click en **"Nuevo Usuario"** para registrar

---

## 🔧 Solución de Problemas

### Error: "No se puede conectar al servidor"

**Solución:**
1. Verificar que Laragon esté ejecutándose
2. Verificar que Apache esté en verde
3. Probar: `http://localhost` en el navegador
4. Revisar que el puerto 80 no esté ocupado

### Error: "Access denied for user 'root'@'localhost'"

**Solución:**
1. Verificar contraseña de MySQL en Laragon
2. Click derecho en Laragon > **MySQL** > **Cambiar contraseña**
3. Actualizar `backend\.env` con la contraseña correcta
4. Reiniciar Apache

### Error: "Table 'videoteca_sfx.usuarios' doesn't exist"

**Solución:**
1. Verificar que la base de datos `videoteca_sfx` exista
2. Reimportar `database\schema.sql` en phpMyAdmin
3. Verificar que todas las tablas se crearon correctamente

### Error al subir videos: "Failed to upload"

**Solución:**
1. Verificar que existan las carpetas:
   - `backend\uploads\videos\`
   - `backend\uploads\thumbnails\`
2. Verificar permisos de escritura en carpeta `uploads`
3. Verificar `upload_max_filesize` en PHP:
   - Laragon > PHP > php.ini
   - Buscar: `upload_max_filesize` y `post_max_size`
   - Cambiar a: `upload_max_filesize = 500M` y `post_max_size = 500M`
   - Reiniciar Apache

### Frontend no inicia: "npm: command not found"

**Solución:**
1. Instalar Node.js desde: https://nodejs.org/
2. Reiniciar Laragon
3. Abrir nueva terminal
4. Verificar: `node --version`

### Error: "Failed to scan for dependencies from entries"

Este error ocurre cuando Vite no encuentra el archivo `index.html` o estás en el directorio incorrecto.

**Error típico:**
```
Failed to scan for dependencies from entries:
C:/laragon/www/videotecasfx/SFX/frontend-web/index.html
```

**Solución Rápida - Usar Script de Diagnóstico:**
1. Navegar al frontend:
   ```bash
   cd C:\laragon\www\videotecasfx\frontend-web
   ```

2. Ejecutar el script de diagnóstico:
   ```bash
   diagnostico.bat
   ```

3. El script verificará automáticamente:
   - Si estás en el directorio correcto
   - Si existe `package.json` e `index.html`
   - Si `node_modules` está instalado
   - Versiones de Node.js y npm

4. Seguir las instrucciones del script

**Solución Manual:**
1. Abrir terminal de Laragon
2. Verificar directorio actual:
   ```bash
   cd
   ```

3. Navegar al directorio correcto:
   ```bash
   cd C:\laragon\www\videotecasfx\frontend-web
   ```

4. Verificar que existe `package.json`:
   ```bash
   dir package.json
   ```

5. Si no ves el archivo, estás en el directorio incorrecto

6. Limpiar e instalar:
   ```bash
   # Limpiar instalación previa
   rmdir /s /q node_modules
   del package-lock.json

   # Reinstalar
   npm install

   # Ejecutar
   npm run dev
   ```

7. Si el error menciona una carpeta "SFX" extra en la ruta:
   - Verificar que el proyecto esté en: `C:\laragon\www\videotecasfx\`
   - NO en: `C:\laragon\www\videotecasfx\SFX\`
   - Si está en SFX, mover todo el contenido un nivel arriba

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Solución:**
1. Verificar que `backend\.env` tenga:
   ```
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```
2. Verificar que `backend\config\cors.php` esté correctamente configurado
3. Reiniciar Apache

### Videos no se reproducen

**Solución:**
1. Verificar que el archivo exista en `backend\uploads\videos\`
2. Probar acceder directamente: `http://localhost/videotecasfx/backend/uploads/videos/nombre_video.mp4`
3. Verificar formato de video (MP4 H.264 recomendado)
4. Convertir video a MP4 si es necesario con VLC o HandBrake

---

## 📊 Configuración Avanzada

### Instalar FFmpeg (Opcional)

FFmpeg se usa para extraer metadatos y generar thumbnails automáticamente:

1. **Descargar FFmpeg:**
   - https://www.gyan.dev/ffmpeg/builds/
   - Descargar: ffmpeg-release-essentials.zip

2. **Instalar:**
   - Extraer a: `C:\ffmpeg`
   - Agregar al PATH de Windows:
     - Panel de Control > Sistema > Configuración avanzada
     - Variables de entorno
     - Path > Editar > Nuevo: `C:\ffmpeg\bin`

3. **Verificar:**
   ```bash
   ffmpeg -version
   ```

4. **Actualizar backend\.env:**
   ```env
   FFMPEG_PATH=ffmpeg
   FFPROBE_PATH=ffprobe
   ```

### Optimizar para Producción

1. **Deshabilitar modo Debug:**
   - Editar `backend\.env`:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   ```

2. **Cambiar JWT Secret:**
   - Generar nueva clave secreta aleatoria
   - Actualizar `JWT_SECRET` en `.env`

3. **Configurar HTTPS:**
   - Usar Laragon para generar certificado SSL
   - Click derecho > Apache > SSL > certificado automático

---

## 📱 Próximos Pasos

Una vez que el sistema web esté funcionando:

1. **Agregar más videos** de prueba
2. **Crear más usuarios** docentes
3. **Probar todas las funcionalidades**
4. **Configurar backup automático** de la base de datos
5. **Preparar para despliegue** en servidor de producción

---

## 📞 Soporte

Para problemas o preguntas:

- **Desarrollador:** Roger Omar Luna Yujra
- **CI:** 6734278 LP
- **Tutor:** Lic. Vladimir Mamani
- **Institución:** Instituto Técnico ATSI Bolivia

---

## 📄 Licencia

Sistema desarrollado para U.E. San Francisco Xavier - Okinawa Uno, Bolivia
© 2024 Todos los derechos reservados
