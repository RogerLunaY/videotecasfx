# 🗄️ Actualizar Base de Datos - Videoteca SFX

Este documento explica cómo actualizar la base de datos `videoteca` con la estructura y datos correctos.

---

## ⚡ Método Rápido (Windows con Laragon)

### Opción 1: Script Automático

1. **Ejecutar el script batch:**
   ```bash
   # Navegar a la carpeta del proyecto
   cd C:\laragon\www\videotecasfx

   # Ejecutar el script
   actualizar-base-datos.bat
   ```

2. **Confirmar cuando se solicite** (presionar `S` y Enter)

3. **Listo!** La base de datos se creará automáticamente

---

## 🖥️ Método Manual (HeidiSQL)

### Paso 1: Abrir HeidiSQL

1. Abre **HeidiSQL** desde Laragon
2. Conecta a la base de datos (usuario: `root`, sin contraseña)

### Paso 2: Eliminar base de datos antigua (si existe)

```sql
DROP DATABASE IF EXISTS videoteca;
```

### Paso 3: Ejecutar script de estructura

1. Abre el archivo: `C:\laragon\www\videotecasfx\database\schema.sql`
2. Copia todo el contenido
3. En HeidiSQL, pega el código en la pestaña "Consulta"
4. Click en **Ejecutar** (o presiona F9)

**Resultado esperado:**
- Base de datos `videoteca` creada
- 14 tablas creadas (usuarios, roles, videos, materias, grados, etc.)

### Paso 4: Ejecutar script de datos

1. Abre el archivo: `C:\laragon\www\videotecasfx\database\seed_data.sql`
2. Copia todo el contenido
3. En HeidiSQL, pega el código en la pestaña "Consulta"
4. Click en **Ejecutar** (o presiona F9)

**Resultado esperado:**
- 12 usuarios creados
- 12 materias insertadas
- 6 grados insertados
- 24 temas insertados
- 20 videos de ejemplo

### Paso 5: Verificar

En HeidiSQL, ejecuta:

```sql
USE videoteca;

-- Verificar usuarios
SELECT COUNT(*) as total_usuarios FROM usuarios;
-- Debe mostrar: 12

-- Verificar videos
SELECT COUNT(*) as total_videos FROM videos;
-- Debe mostrar: 20

-- Verificar materias
SELECT COUNT(*) as total_materias FROM materias;
-- Debe mostrar: 12

-- Verificar estructura
SHOW TABLES;
-- Debe mostrar 14 tablas
```

---

## 🌐 Método Manual (phpMyAdmin)

### Paso 1: Abrir phpMyAdmin

1. Abre tu navegador
2. Ve a: `http://localhost/phpmyadmin`

### Paso 2: Crear base de datos

1. Click en "Nueva" en el menú izquierdo
2. Nombre: `videoteca`
3. Cotejamiento: `utf8mb4_unicode_ci`
4. Click en "Crear"

### Paso 3: Importar estructura

1. Selecciona la base de datos `videoteca` (menú izquierdo)
2. Click en la pestaña **"Importar"**
3. Click en **"Elegir archivo"**
4. Selecciona: `C:\laragon\www\videotecasfx\database\schema.sql`
5. Click en **"Continuar"** al final de la página
6. Espera a que termine la importación

### Paso 4: Importar datos

1. Asegúrate de estar en la base de datos `videoteca`
2. Click en la pestaña **"Importar"**
3. Click en **"Elegir archivo"**
4. Selecciona: `C:\laragon\www\videotecasfx\database\seed_data.sql`
5. Click en **"Continuar"**
6. Espera a que termine la importación

---

## ✅ Verificación Final

### 1. Verificar Tablas

En HeidiSQL o phpMyAdmin, la base de datos `videoteca` debe tener estas tablas:

- ✅ `roles`
- ✅ `grados`
- ✅ `campos`
- ✅ `materias`
- ✅ `temas`
- ✅ `usuarios`
- ✅ `videos`
- ✅ `reproducciones`
- ✅ `docente_asignaciones`
- ✅ `estadisticas_globales`
- ✅ `refresh_tokens`
- ✅ `vistas` (varias vistas adicionales)

### 2. Probar Conexión del Backend

1. Abre en tu navegador: `http://videoteca.test/api/health`

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "...",
    "database": "connected"
  }
}
```

### 3. Probar Login

1. Abre: `http://videoteca.test` (o donde esté tu frontend)
2. Intenta hacer login con:

**Administrador:**
- Email: `vladimir.mamani@atsi.edu.bo`
- Contraseña: `Password123!`

**Docente:**
- Email: `juan.perez@sfx.edu.bo`
- Contraseña: `Password123!`

---

## 📋 Datos Incluidos en la Base de Datos

### Roles
- Administrador (permisos completos)
- Docente (permisos limitados a sus videos)

### Grados
- 1ro a 6to de Secundaria

### Campos de Conocimiento
- Cosmos y Pensamiento
- Comunidad y Sociedad
- Vida, Tierra y Territorio
- Ciencia, Tecnología y Producción

### Materias (12 total)
- Matemática, Física, Química, Biología
- Lengua Extranjera, Comunicación y Lenguajes
- Ciencias Sociales, Educación Musical
- Artes Plásticas y Visuales, Educación Física
- Técnica Tecnológica, Cosmovisiones

### Usuarios (12 total)
- 2 Administradores
- 10 Docentes (cada uno con asignaciones específicas)

### Videos (20 ejemplos)
- Distribuidos entre diferentes materias y grados
- Con descripciones y metadata completa

---

## 🔧 Solución de Problemas

### Error: "Table already exists"
**Causa:** La base de datos ya tiene tablas
**Solución:** Elimina la base de datos primero:
```sql
DROP DATABASE videoteca;
```
Luego ejecuta de nuevo los scripts.

### Error: "Access denied"
**Causa:** Permisos incorrectos
**Solución:** Verifica que estés usando el usuario `root` de MySQL

### Error: "Unknown database 'videoteca'"
**Causa:** El archivo schema.sql no se ejecutó correctamente
**Solución:** Ejecuta primero `schema.sql`, luego `seed_data.sql`

### La API devuelve 500 o errores de conexión
**Causa:** El archivo `.env` no está configurado
**Solución:**
1. Verifica que existe: `C:\laragon\www\videotecasfx\backend\.env`
2. Debe contener:
   ```env
   DB_NAME=videoteca
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   ```

---

## 🔄 Reiniciar el Servidor

**Después de actualizar la base de datos, DEBES reiniciar:**

### Laragon:
1. Click en **"Stop All"**
2. Click en **"Start All"**

### O manualmente:
```bash
# Si usas Valet
valet restart

# Si usas Apache
sudo systemctl restart apache2
```

---

## 📞 Necesitas Ayuda?

Si tienes problemas:

1. Verifica que Laragon esté corriendo
2. Verifica que MySQL esté iniciado
3. Revisa los logs en: `C:\laragon\data\logs\`
4. Asegúrate de tener los archivos:
   - `database/schema.sql`
   - `database/seed_data.sql`

---

**¡Listo! Tu base de datos `videoteca` está actualizada y lista para usar.**
