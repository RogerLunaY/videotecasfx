# 🔧 Solución de Errores Comunes - Frontend

## Error: "Failed to scan for dependencies"

Si ves este error al ejecutar `npm run dev`:

```
Failed to scan for dependencies from entries:
C:/laragon/www/videotecasfx/SFX/frontend-web/index.html
```

### ✅ Solución Automática (Recomendada)

1. **Ejecutar el script de diagnóstico:**
   ```bash
   cd C:\laragon\www\videotecasfx\frontend-web
   diagnostico.bat
   ```

2. El script verificará:
   - ✓ Si estás en el directorio correcto
   - ✓ Si existen los archivos necesarios
   - ✓ Si node_modules está instalado
   - ✓ Versiones de Node.js y npm

3. Al final te preguntará si quieres limpiar y reinstalar
   - Presiona **S** para limpiar e instalar automáticamente
   - Presiona **N** para hacerlo manualmente

### 🛠️ Solución Manual

```bash
# 1. Ir al directorio correcto
cd C:\laragon\www\videotecasfx\frontend-web

# 2. Verificar que estás en el lugar correcto
dir package.json
# Debe mostrar el archivo package.json

# 3. Limpiar instalación anterior
rmdir /s /q node_modules
del package-lock.json

# 4. Reinstalar dependencias
npm install

# 5. Ejecutar el servidor
npm run dev
```

### 🚨 Problema con carpeta "SFX" extra

Si el error muestra una ruta como:
```
C:/laragon/www/videotecasfx/SFX/frontend-web/index.html
```

**Solución:**
1. Verificar que el proyecto NO esté dentro de una carpeta SFX
2. La estructura correcta es:
   ```
   C:\laragon\www\videotecasfx\
   ├── backend\
   ├── database\
   ├── frontend-web\  ← Aquí debe estar
   └── ...
   ```

3. Si está en `SFX\`, mover todo el contenido un nivel arriba

---

## Otros Errores Comunes

### Error: "npm: command not found"

**Solución:**
1. Instalar Node.js desde https://nodejs.org/
2. Reiniciar Laragon
3. Abrir nueva terminal
4. Verificar: `node --version`

### Error: "Cannot find module 'react'"

**Solución:**
```bash
npm install
```

### Error de permisos al instalar

**Solución (ejecutar PowerShell como Administrador):**
```bash
npm install --legacy-peer-deps
```

### Puerto 5173 ya en uso

**Solución:**
```bash
# Matar proceso en puerto 5173
netstat -ano | findstr :5173
# Tomar el PID y ejecutar:
taskkill /PID [número_pid] /F

# O usar otro puerto:
npm run dev -- --port 3000
```

---

## 📞 ¿Aún tienes problemas?

1. Ejecuta el script de diagnóstico: `diagnostico.bat`
2. Copia el resultado completo
3. Consulta el manual completo: [MANUAL_LARAGON.md](../MANUAL_LARAGON.md)
