# 🚀 Inicio Rápido con Laragon

## Guía Express - 5 Minutos

### ✅ Prerequisitos
- Laragon Full instalado y corriendo
- Node.js instalado (versión 18+)

### 📦 Pasos de Instalación

#### 1. Copiar Proyecto
```
Copiar carpeta "videotecasfx" a: C:\laragon\www\
```

#### 2. Base de Datos
```
1. Abrir phpMyAdmin: http://localhost/phpmyadmin
2. Crear base de datos: "videoteca_sfx" (utf8mb4_unicode_ci)
3. Importar: database\schema.sql
4. Importar: database\seed_data.sql
```

#### 3. Backend
```
1. Copiar backend\.env.example a backend\.env
2. Editar backend\.env:
   DB_HOST=localhost
   DB_NAME=videoteca_sfx
   DB_USER=root
   DB_PASS=

3. Crear carpetas:
   backend\uploads\videos\
   backend\uploads\thumbnails\
   backend\logs\
```

#### 4. Frontend
```bash
# Abrir terminal en Laragon
cd C:\laragon\www\videotecasfx\frontend-web
npm install

# Crear .env
Copiar .env.example a .env
Editar: VITE_API_URL=http://localhost/videotecasfx/backend
```

### ▶️ Ejecutar

#### Terminal 1 - Backend
```
Laragon > Start All
Probar: http://localhost/videotecasfx/backend/api/health
```

#### Terminal 2 - Frontend
```bash
cd C:\laragon\www\videotecasfx\frontend-web
npm run dev
```

Abrir navegador: **http://localhost:5173**

### 🔐 Login

**Admin:**
- Email: vladimir.mamani@atsi.edu.bo
- Pass: Password123!

**Docente:**
- Email: juan.perez@sfx.edu.bo
- Pass: Password123!

---

## 🆘 Problemas Comunes

### ❌ Error de conexión MySQL
```
Verificar en backend\.env:
DB_PASS= (vacío si no hay contraseña)
```

### ❌ CORS Error
```
Verificar en backend\.env:
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### ❌ No se suben videos
```
1. Verificar carpetas uploads existen
2. Revisar php.ini:
   upload_max_filesize = 500M
   post_max_size = 500M
3. Reiniciar Apache
```

---

📖 **Manual Completo:** Ver [MANUAL_LARAGON.md](./MANUAL_LARAGON.md)
