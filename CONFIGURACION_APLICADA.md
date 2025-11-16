# ✅ Configuración para videotecasfx.test

## Problema Resuelto

He actualizado la configuración para que el frontend se conecte correctamente a `http://videotecasfx.test/api`

---

## 🚀 Pasos para Aplicar los Cambios

### 1. Reiniciar el Frontend

El archivo `.env` ya fue actualizado automáticamente. Solo necesitas reiniciar:

```bash
# En la terminal donde está corriendo npm run dev
# Presiona: Ctrl + C (para detener)

# Luego ejecuta nuevamente:
npm run dev
```

### 2. Verificar Backend

Abre el navegador y verifica que el backend responda:

**URL a probar:** http://videotecasfx.test/api/health

**Debe mostrar:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "...",
    "version": "1.0.0",
    "environment": "development",
    "database": "connected"
  }
}
```

✅ Si ves esto → El backend está funcionando correctamente

❌ Si ves error → Verifica que Apache esté corriendo en Laragon

### 3. Probar el Login

1. Abre: **http://localhost:5173**
2. Click en **"Iniciar Sesión"**
3. Ingresar credenciales:
   - **Email:** vladimir.mamani@atsi.edu.bo
   - **Password:** Password123!
4. Click en **"Iniciar Sesión"**

**Debe redirigir al Dashboard** ✅

---

## 🔍 Si Aún No Funciona

### Verificar Configuración CORS

Abre el archivo: `C:\laragon\www\videotecasfx\backend\.env`

Verifica que contenga:

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

Si no tiene esta línea, agrégala y **reinicia Apache** en Laragon.

### Abrir Consola del Navegador

1. Presiona **F12** en el navegador
2. Ve a la pestaña **"Console"**
3. Intenta login nuevamente
4. Si aparece un error, compártelo

**Errores Comunes:**

```
❌ "CORS policy: No 'Access-Control-Allow-Origin'"
Solución: Agregar http://localhost:5173 a CORS_ALLOWED_ORIGINS en backend/.env
```

```
❌ "Network Error"
Solución: Verificar que Apache esté corriendo en Laragon
```

```
❌ "404 Not Found"
Solución: Verificar que videotecasfx.test esté configurado correctamente
```

---

## 📋 Archivos Actualizados

Estos archivos fueron modificados automáticamente:

✅ `frontend-web/.env`
```env
VITE_API_URL=http://videotecasfx.test/api
```

✅ `frontend-web/.env.example`
```env
VITE_API_URL=http://videotecasfx.test/api
```

✅ `backend/.env.example`
```env
APP_URL=http://videotecasfx.test
```

---

## ✨ Después del Login

Una vez que funcione, podrás:

- 🏠 Ver el **Dashboard** con estadísticas
- 📹 **Explorar videos** (20 videos de prueba)
- ⬆️ **Subir videos** (como admin o docente)
- 👥 **Gestionar usuarios** (solo admin)
- 👤 **Editar tu perfil**

---

## 🆘 Soporte

Si después de estos pasos aún no funciona, comparte:

1. ✅ Resultado de: http://videotecasfx.test/api/health
2. 📸 Screenshot de la consola del navegador (F12)
3. ⚠️ Mensaje de error exacto

---

**Sistema listo para U.E. San Francisco Xavier**
**Roger Omar Luna Yujra - CI: 6734278 LP**
