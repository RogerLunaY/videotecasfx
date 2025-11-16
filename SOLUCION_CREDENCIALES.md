# ✅ Solución: Credenciales Inválidas

## Problema Identificado

El backend funciona correctamente, pero al intentar login aparece:
```json
{"success":false,"message":"Credenciales inválidas"}
```

**Causa:** Los usuarios de prueba NO están en la base de datos.

---

## 🚀 Solución Rápida (Método Automático)

### Ejecuta el script de importación:

1. Abre el explorador en: `C:\laragon\www\videotecasfx\`
2. **Doble click** en: `importar-datos.bat`
3. Presiona **S** para confirmar
4. Espera a que termine

**Resultado esperado:**
```
============================================
IMPORTACION EXITOSA
============================================

Datos importados correctamente:
- 12 usuarios creados
- 20 videos de prueba agregados
- Materias, grados y temas configurados
```

---

## 🔧 Solución Manual (Si el script falla)

### Paso 1: Abrir phpMyAdmin

Abre en el navegador: **http://localhost/phpmyadmin**

### Paso 2: Seleccionar Base de Datos

1. En el panel izquierdo, click en: **`videoteca_sfx`**
2. Si no existe la base de datos:
   - Click en **"Nueva"**
   - Nombre: `videoteca_sfx`
   - Cotejamiento: `utf8mb4_unicode_ci`
   - Click en **"Crear"**

### Paso 3: Importar Schema (si la BD está vacía)

1. Con `videoteca_sfx` seleccionada
2. Click en pestaña **"Importar"**
3. Click en **"Elegir archivo"**
4. Selecciona: `C:\laragon\www\videotecasfx\database\schema.sql`
5. Click en **"Continuar"** (al final de la página)
6. Espera mensaje de éxito en verde

### Paso 4: Importar Datos de Prueba

1. Click nuevamente en pestaña **"Importar"**
2. Click en **"Elegir archivo"**
3. Selecciona: `C:\laragon\www\videotecasfx\database\seed_data.sql`
4. Click en **"Continuar"**
5. Espera mensaje de éxito en verde

### Paso 5: Verificar Importación

1. En el panel izquierdo, expandir `videoteca_sfx`
2. Click en tabla **`usuarios`**
3. Click en **"Examinar"**
4. **Debe mostrar 12 usuarios**
5. Busca: `vladimir.mamani@atsi.edu.bo`

---

## 🔐 Credenciales de Prueba

Después de importar los datos, usa estas credenciales:

### Administradores:

**Vladimir Mamani** (Admin Principal)
- Email: `vladimir.mamani@atsi.edu.bo`
- Password: `Password123!`

**Ana Torres** (Admin)
- Email: `ana.torres@sfx.edu.bo`
- Password: `Password123!`

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

## ✅ Probar Login

Una vez importados los datos:

1. Abre: **http://localhost:5173**
2. Click en **"Iniciar Sesión"**
3. Usa las credenciales de arriba
4. Click en **"Iniciar Sesión"**

**Debe redirigir al Dashboard** 🎉

---

## 🔍 Verificar que Todo Funcione

### Probar Backend con Credenciales

Ejecuta en el directorio del proyecto:
```bash
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

✅ Si ves esto → Todo funciona correctamente

---

## 📊 Datos Importados

El archivo `seed_data.sql` importa:

- ✅ **12 usuarios** (2 admins, 10 docentes)
- ✅ **2 roles** (Administrador, Docente)
- ✅ **12 materias** (Matemáticas, Física, Química, etc.)
- ✅ **6 grados** (1ro a 6to de Secundaria)
- ✅ **24 temas** distribuidos en las materias
- ✅ **20 videos de prueba** con metadatos completos

---

## 🆘 Si Aún Dice "Credenciales Inválidas"

### Verificar Contraseñas en la Base de Datos

1. Abre phpMyAdmin
2. Selecciona `videoteca_sfx`
3. Click en tabla `usuarios`
4. Click en **"Examinar"**
5. Verifica que el campo `password` tenga un hash largo (no texto plano)

**Debe verse así:**
```
$2y$12$abcdefghijklmnopqrstuvwxyz...
```

Si las contraseñas están en texto plano, significa que el schema no se importó correctamente.

**Solución:**
1. Elimina la base de datos `videoteca_sfx`
2. Créala nuevamente
3. Importa primero `schema.sql`
4. Luego importa `seed_data.sql`

---

## 🎯 Checklist Final

Antes de intentar login:

- [ ] Base de datos `videoteca_sfx` existe
- [ ] Tabla `usuarios` tiene 12 registros
- [ ] Las contraseñas están hasheadas (empiezan con $2y$)
- [ ] Backend responde correctamente en `test-backend.bat`
- [ ] Frontend está corriendo en http://localhost:5173
- [ ] Archivo `.env` tiene la URL correcta: http://videotecasfx.test/api

---

## ✨ Después del Login Exitoso

Cuando funcione, podrás:

- 🏠 Ver el **Dashboard** con estadísticas del sistema
- 📹 **Explorar 20 videos** de prueba organizados por materias
- ⬆️ **Subir nuevos videos** (como admin o docente)
- 👥 **Gestionar usuarios** (solo administradores)
- 📊 **Ver estadísticas** de uso y reproducciones
- 👤 **Editar tu perfil** y cambiar contraseña

---

**Sistema listo para U.E. San Francisco Xavier**
**Roger Omar Luna Yujra - CI: 6734278 LP**
