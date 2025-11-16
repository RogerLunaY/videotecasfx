# 🔧 Solución: Error 401 Unauthorized

## Diagnóstico del Error

El error **401 Unauthorized** aparece cuando:
- ❌ Los headers CORS no están configurados correctamente
- ❌ El backend no acepta peticiones del frontend
- ❌ Hay problema con la autenticación JWT

---

## 🚀 Solución Paso a Paso

### Paso 1: Verificar Configuración CORS en Backend

1. **Abre el archivo:** `C:\laragon\www\videotecasfx\backend\.env`

2. **Verifica que tenga esta línea:**
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

3. **Si NO la tiene, agrégala** al final del archivo:
   ```env
   # CORS Configuration
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

4. **Guarda el archivo**

---

### Paso 2: Verificar archivo cors.php

1. **Abre:** `C:\laragon\www\videotecasfx\backend\config\cors.php`

2. **Debe contener algo similar a esto:**
   ```php
   <?php

   // Configuración de CORS
   $allowedOrigins = [
       'http://localhost:5173',
       'http://localhost:3000',
   ];

   $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

   if (in_array($origin, $allowedOrigins)) {
       header('Access-Control-Allow-Origin: ' . $origin);
   }

   header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   header('Access-Control-Allow-Credentials: true');

   // Handle preflight requests
   if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
       http_response_code(200);
       exit();
   }
   ```

3. **Si es diferente o está mal configurado, avísame para actualizarlo**

---

### Paso 3: Reiniciar Apache en Laragon

1. Abre **Laragon**
2. Click en **"Stop All"**
3. Espera 2 segundos
4. Click en **"Start All"**
5. Verifica que Apache y MySQL estén en **verde**

---

### Paso 4: Limpiar Caché del Navegador

1. Abre el navegador
2. Presiona **Ctrl + Shift + Delete**
3. Selecciona:
   - ✅ Caché de imágenes y archivos
   - ✅ Cookies y datos del sitio
4. Click en **"Borrar datos"**

---

### Paso 5: Verificar en la Consola del Navegador

1. Abre: http://localhost:5173
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **"Network"** (Red)
4. Intenta hacer login
5. Click en la petición que falló (en rojo)
6. Ve a la pestaña **"Headers"**

**Busca:**
- **Request Headers** debe incluir: `Origin: http://localhost:5173`
- **Response Headers** debe incluir: `Access-Control-Allow-Origin: http://localhost:5173`

**Si NO ves `Access-Control-Allow-Origin`:**
→ El problema es la configuración CORS del backend

---

### Paso 6: Probar con cURL

Abre terminal y ejecuta:

```bash
curl -X POST http://videotecasfx.test/api/auth/login ^
  -H "Content-Type: application/json" ^
  -H "Origin: http://localhost:5173" ^
  -d "{\"email\":\"vladimir.mamani@atsi.edu.bo\",\"password\":\"Password123!\"}" ^
  -v
```

**Busca en la respuesta:**
```
< Access-Control-Allow-Origin: http://localhost:5173
```

✅ Si lo ves → CORS está configurado
❌ Si NO lo ves → Problema en backend

---

## 🔧 Soluciones Específicas

### Solución A: Crear/Actualizar archivo .env del backend

Si el archivo `backend\.env` no existe:

```bash
cd C:\laragon\www\videotecasfx\backend
copy .env.example .env
```

Luego edita `backend\.env` y agrega:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

### Solución B: Verificar que index.php incluya CORS

1. **Abre:** `C:\laragon\www\videotecasfx\backend\index.php`

2. **Al inicio del archivo (después de <?php) debe tener:**
   ```php
   <?php
   // Cargar configuración de CORS
   require_once __DIR__ . '/config/cors.php';
   ```

3. **Si NO lo tiene, agrégalo**

---

### Solución C: Headers en .htaccess

1. **Abre:** `C:\laragon\www\videotecasfx\backend\.htaccess`

2. **Agrega estas líneas antes de RewriteEngine:**
   ```apache
   # CORS Headers
   Header set Access-Control-Allow-Origin "http://localhost:5173"
   Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
   Header set Access-Control-Allow-Headers "Content-Type, Authorization"
   Header set Access-Control-Allow-Credentials "true"
   ```

3. **Guarda y reinicia Apache**

---

## 🔍 Diagnóstico Avanzado

### Verificar logs de Apache

1. **Abre:** `C:\laragon\etc\apache2\logs\error.log`
2. **Busca errores recientes**
3. **Comparte el error si encuentras algo**

### Verificar logs del backend

1. **Abre:** `C:\laragon\www\videotecasfx\backend\logs\`
2. **Revisa el archivo más reciente**
3. **Busca errores relacionados con CORS o autenticación**

---

## ✅ Checklist de Verificación

Marca cada ítem a medida que lo verifiques:

- [ ] Archivo `backend\.env` existe y tiene `CORS_ALLOWED_ORIGINS`
- [ ] Archivo `backend\config\cors.php` existe y está configurado
- [ ] `backend\index.php` incluye `require_once 'config/cors.php'`
- [ ] Apache reiniciado después de cambios
- [ ] Caché del navegador limpiada
- [ ] La petición incluye header `Origin` en DevTools
- [ ] La respuesta incluye `Access-Control-Allow-Origin`

---

## 🎯 Prueba Final

Después de aplicar los cambios:

1. **Reinicia Apache** en Laragon
2. **Cierra completamente el navegador**
3. **Abre el navegador nuevamente**
4. Ve a: http://localhost:5173
5. **Abre DevTools (F12)**
6. **Intenta login**

**Debe funcionar** ✅

---

## 📞 Si Aún No Funciona

Comparte:
1. Screenshot de la pestaña **Network** en DevTools (F12)
2. Contenido del archivo `backend\.env`
3. Contenido del archivo `backend\config\cors.php`
4. Cualquier error en la consola del navegador

---

**Desarrollado para U.E. San Francisco Xavier**
**Roger Omar Luna Yujra - CI: 6734278 LP**
