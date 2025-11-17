# 🚀 Pasos Finales para Ejecutar el Sistema

## Resumen de la Situación

Tu sistema está casi listo. Solo faltan estos pasos finales:

✅ Backend configurado en: `http://videotecasfx.test`
✅ Frontend configurado para conectar al backend
❌ Falta importar usuarios de prueba a la base de datos

---

## 📋 Pasos en Orden (5-10 minutos)

### Paso 1: Importar Datos de Prueba

**Opción A - Automático (Recomendado):**

1. Abre explorador en: `C:\laragon\www\videotecasfx\`
2. **Doble click** en: `importar-datos.bat`
3. Presiona **S** para confirmar
4. Espera el mensaje: **"IMPORTACION EXITOSA"**

**Opción B - Manual (si el script falla):**

1. Abre: http://localhost/phpmyadmin
2. Click en base de datos: `videoteca`
3. Click en pestaña **"Importar"**
4. Click en **"Elegir archivo"**
5. Selecciona: `C:\laragon\www\videotecasfx\database\seed_data.sql`
6. Click en **"Continuar"**
7. Espera mensaje de éxito en verde

---

### Paso 2: Verificar Backend

Abre en el navegador: **http://videotecasfx.test/api/health**

**Debe mostrar:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```

✅ Si lo ves → Continúa al Paso 3
❌ Si da error → Reinicia Apache en Laragon

---

### Paso 3: Reiniciar Frontend

En la terminal donde está corriendo `npm run dev`:

```bash
# Presiona Ctrl + C para detener

# Luego ejecuta nuevamente:
npm run dev
```

**Debe mostrar:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
```

---

### Paso 4: Probar Login

1. Abre: **http://localhost:5173**
2. Click en **"Iniciar Sesión"**
3. Ingresa credenciales:
   - **Email:** `vladimir.mamani@atsi.edu.bo`
   - **Password:** `Password123!`
4. Click en **"Iniciar Sesión"**

**Debe redirigir al Dashboard** 🎉

---

## 🔐 Credenciales Disponibles

### Administradores:

**Vladimir Mamani**
- Email: vladimir.mamani@atsi.edu.bo
- Password: Password123!

**Ana Torres**
- Email: ana.torres@sfx.edu.bo
- Password: Password123!

### Docentes:

**Juan Pérez** (Matemáticas)
- Email: juan.perez@sfx.edu.bo
- Password: Password123!

**María García** (Física)
- Email: maria.garcia@sfx.edu.bo
- Password: Password123!

---

## 🆘 Solución de Problemas

### Error: "Credenciales inválidas"

→ Los datos no se importaron correctamente
→ **Solución:** Ve a [SOLUCION_CREDENCIALES.md](./SOLUCION_CREDENCIALES.md)

### Error: "401 Unauthorized"

→ Problema de CORS entre frontend y backend
→ **Solución:** Ve a [SOLUCION_ERROR_401.md](./SOLUCION_ERROR_401.md)

### Error: "Failed to scan for dependencies"

→ Problema de ubicación del proyecto
→ **Solución:** Ve a [frontend-web/SOLUCION_ERRORES.md](./frontend-web/SOLUCION_ERRORES.md)

### Backend no responde

→ Apache no está corriendo o hay problema de ruta
→ **Solución:**
1. Abre Laragon
2. Click en "Stop All"
3. Click en "Start All"
4. Verifica que Apache y MySQL estén en verde

---

## ✅ Después del Login Exitoso

Una vez que funcione, podrás:

### Como Administrador:
- 🏠 Ver dashboard con estadísticas completas
- 📹 Explorar 20 videos de prueba
- ⬆️ Subir nuevos videos
- 👥 Gestionar usuarios (crear, editar, eliminar)
- 📊 Ver estadísticas detalladas
- ⚙️ Administrar materias, grados y temas

### Como Docente:
- 🏠 Ver dashboard personal
- 📹 Explorar todos los videos
- ⬆️ Subir tus propios videos
- ✏️ Editar tus videos
- 📊 Ver estadísticas de tus videos
- 👤 Editar tu perfil

---

## 🎯 Pruebas Sugeridas

Una vez dentro del sistema:

### 1. Explorar Videos
- Ve a **"Videos"** en el menú
- Usa los filtros por materia y grado
- Busca un video específico
- Reproduce un video completo

### 2. Subir un Video de Prueba
- Ve a **"Subir Video"**
- Llena el formulario
- Selecciona un video pequeño (< 50MB)
- Observa la barra de progreso
- Verifica que aparezca en tu lista

### 3. Ver Estadísticas
- Ve al **Dashboard**
- Observa las estadísticas generales
- Ve los videos más populares
- Revisa la actividad reciente

### 4. Gestión de Usuarios (Solo Admin)
- Ve a **"Usuarios"**
- Filtra por rol
- Busca un usuario específico
- Prueba crear un nuevo usuario

---

## 📊 Datos del Sistema

Después de importar `seed_data.sql`:

- ✅ **12 usuarios** (2 admins, 10 docentes)
- ✅ **20 videos** de prueba en diferentes materias
- ✅ **12 materias** (Matemáticas, Física, Química, etc.)
- ✅ **6 grados** (1ro a 6to de Secundaria)
- ✅ **24 temas** distribuidos en las materias
- ✅ **2 roles** configurados (Administrador, Docente)

---

## 📁 Archivos de Ayuda Disponibles

En el directorio del proyecto tienes:

| Archivo | Descripción |
|---------|-------------|
| `MANUAL_LARAGON.md` | Manual completo de instalación con Laragon |
| `INICIO_RAPIDO_LARAGON.md` | Guía rápida de 5 minutos |
| `DIAGNOSTICO_LOGIN.md` | Diagnóstico completo de problemas de login |
| `SOLUCION_CREDENCIALES.md` | Solución cuando credenciales no funcionan |
| `SOLUCION_ERROR_401.md` | Solución para error 401 Unauthorized |
| `CONFIGURACION_APLICADA.md` | Configuración para videotecasfx.test |
| `test-backend.bat` | Script para probar el backend |
| `importar-datos.bat` | Script para importar datos automáticamente |
| `frontend-web/diagnostico.bat` | Diagnóstico del frontend |

---

## 🎉 ¡Felicidades!

Si completaste todos los pasos, ahora tienes un **Sistema de Biblioteca Digital de Videos Educativos** completamente funcional para la **U.E. San Francisco Xavier**.

El sistema incluye:
- ✅ Autenticación y autorización por roles
- ✅ Gestión completa de videos
- ✅ Streaming de video optimizado
- ✅ Dashboard con estadísticas
- ✅ Búsqueda y filtros avanzados
- ✅ Sistema de gestión de usuarios
- ✅ Diseño responsive (móvil y desktop)
- ✅ 20 videos de prueba para explorar

---

## 📞 Soporte

Si necesitas ayuda adicional:

1. **Revisa los archivos de documentación** listados arriba
2. **Ejecuta los scripts de diagnóstico** disponibles
3. **Comparte los resultados** para obtener ayuda específica

---

**Sistema Desarrollado para:**
U.E. San Francisco Xavier - Okinawa Uno, Bolivia

**Desarrollador:**
Roger Omar Luna Yujra (CI: 6734278 LP)

**Tutor:**
Lic. Vladimir Mamani

**Institución:**
Instituto Técnico ATSI Bolivia

**Versión:**
1.0.0
