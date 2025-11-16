# 🔧 Diagnóstico de Problemas de Login

## Problema: No entra al dashboard al ingresar credenciales

Este documento te guiará paso a paso para solucionar el problema de login.

---

## ✅ Pasos de Diagnóstico

### Paso 1: Verificar que Laragon esté corriendo

1. Abrir **Laragon**
2. Verificar que **Apache** esté en verde
3. Verificar que **MySQL** esté en verde
4. Si alguno está en rojo, hacer click en **"Start All"**

---

### Paso 2: Ejecutar Script de Prueba del Backend

1. **Abrir explorador de archivos** en: `C:\laragon\www\videotecasfx\`
2. **Doble click** en el archivo: `test-backend.bat`
3. **Leer el resultado**:

**✅ Resultado Correcto:**
```json
{"success":true,"data":{"status":"ok",...}}
{"success":true,"data":{"user":{...},"tokens":{...}}}
```

**❌ Resultado con Error:**
```
404 Not Found
```
O
```
Connection refused
```

**Si ves error 404:**
- La ruta del backend no es correcta
- Ve al **Paso 3**

**Si ves error de conexión:**
- Apache no está corriendo
- Reinicia Laragon

---

### Paso 3: Verificar la Ruta del Backend

Abre el navegador y prueba estas URLs:

1. **Opción A:** http://localhost/videotecasfx/backend/api/health
2. **Opción B:** http://localhost/backend/api/health

**¿Cuál funciona?**

- Si funciona **Opción A**: El proyecto está en `videotecasfx/`
- Si funciona **Opción B**: El proyecto está directamente en `www/`

---

### Paso 4: Configurar Frontend con la Ruta Correcta

1. **Abrir el archivo:** `C:\laragon\www\videotecasfx\frontend-web\.env`

2. **Editar según la opción que funcionó:**

**Si funcionó Opción A:**
```env
VITE_API_URL=http://localhost/videotecasfx/backend/api
```

**Si funcionó Opción B:**
```env
VITE_API_URL=http://localhost/backend/api
```

3. **Guardar** el archivo

---

### Paso 5: Reiniciar el Frontend

1. **En la terminal donde está corriendo el frontend**, presionar **Ctrl + C** para detener
2. **Ejecutar nuevamente:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:** http://localhost:5173

---

### Paso 6: Probar Login

1. Click en **"Iniciar Sesión"**
2. Ingresar credenciales:
   - **Email:** vladimir.mamani@atsi.edu.bo
   - **Password:** Password123!
3. Click en **"Iniciar Sesión"**

---

## 🔍 Diagnóstico Avanzado

### Abrir Consola del Navegador

1. En el navegador, presionar **F12**
2. Ir a la pestaña **"Console"**
3. Intentar login nuevamente
4. **Buscar errores en rojo**

**Errores Comunes:**

**Error: "Network Error"**
```
Solución: El frontend no puede conectar al backend
- Verificar que Apache esté corriendo
- Verificar URL en .env
```

**Error: "CORS policy"**
```
Solución: Problema de CORS
- Verificar backend/config/cors.php
- Debe incluir: http://localhost:5173
```

**Error: "404 Not Found"**
```
Solución: URL incorrecta
- Revisar archivo .env
- Verificar ruta del backend
```

**Error: "Credenciales inválidas"**
```
Solución: Base de datos no tiene usuarios
- Verificar que se importó seed_data.sql
- Ver Paso 7
```

---

### Paso 7: Verificar Base de Datos

1. **Abrir phpMyAdmin:** http://localhost/phpmyadmin
2. **Click en** base de datos `videoteca_sfx`
3. **Click en** tabla `usuarios`
4. **Verificar que haya registros**

**Si la tabla está vacía:**
```
1. Click en "Importar"
2. Seleccionar: C:\laragon\www\videotecasfx\database\seed_data.sql
3. Click en "Continuar"
```

---

### Paso 8: Verificar Configuración Backend

1. **Abrir archivo:** `C:\laragon\www\videotecasfx\backend\.env`

2. **Verificar valores:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=videoteca_sfx
   DB_USER=root
   DB_PASS=
   ```

3. **Si Laragon tiene contraseña MySQL:**
   ```env
   DB_PASS=root
   ```
   (O la contraseña que configuraste)

4. **Guardar** y **reiniciar Apache** en Laragon

---

## 🎯 Checklist Final

Antes de intentar login, verifica:

- [ ] Laragon está corriendo (Apache y MySQL en verde)
- [ ] Base de datos `videoteca_sfx` existe
- [ ] Tabla `usuarios` tiene 12 registros
- [ ] Archivo `backend\.env` tiene configuración correcta
- [ ] Archivo `frontend-web\.env` existe con URL correcta
- [ ] Backend responde en: http://localhost/videotecasfx/backend/api/health
- [ ] Frontend está corriendo en: http://localhost:5173

---

## 📞 Si Aún No Funciona

Comparte esta información:

1. **Resultado de `test-backend.bat`**
2. **Captura de pantalla de la consola del navegador (F12)**
3. **URL que funciona:** ¿Opción A o B del Paso 3?
4. **Contenido del archivo `frontend-web\.env`**
5. **Mensaje de error exacto que aparece**

---

## 🚀 Después de Solucionar

Una vez que funcione el login:

1. Explorar el dashboard
2. Ver videos
3. Subir un video de prueba
4. Probar todas las funcionalidades

---

**Desarrollado para U.E. San Francisco Xavier**
**Roger Omar Luna Yujra - CI: 6734278 LP**
