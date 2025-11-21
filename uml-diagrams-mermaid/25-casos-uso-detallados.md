# Casos de Uso Detallados

## CU01 - Iniciar Sesión

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin / Docente |
| **Precondición** | Usuario registrado en el sistema |
| **Postcondición** | Usuario autenticado con tokens JWT |

**Flujo Principal:**
1. Usuario ingresa email y contraseña
2. Sistema valida formato de datos
3. Sistema verifica que usuario no esté bloqueado
4. Sistema verifica credenciales
5. Sistema genera access token (1h) y refresh token (7d)
6. Sistema actualiza último acceso
7. Sistema retorna tokens al usuario

**Flujo Alternativo:**
- 3a. Usuario bloqueado → Mostrar tiempo restante de bloqueo
- 4a. Credenciales inválidas → Incrementar intentos
- 4b. 5 intentos fallidos → Bloquear usuario 15 minutos

---

## CU02 - Cerrar Sesión

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin / Docente |
| **Precondición** | Usuario autenticado |
| **Postcondición** | Tokens revocados |

**Flujo Principal:**
1. Usuario solicita cerrar sesión
2. Sistema revoca refresh token en BD
3. Sistema registra log de logout
4. Sistema confirma cierre de sesión

---

## CU03 - Crear Usuario

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin |
| **Precondición** | Admin autenticado |
| **Postcondición** | Nuevo usuario creado |

**Flujo Principal:**
1. Admin completa formulario (nombre, email, CI, rol, password)
2. Sistema valida datos requeridos
3. Sistema verifica email no duplicado
4. Sistema verifica CI no duplicado
5. Sistema hashea password con bcrypt
6. Sistema crea usuario en BD
7. Sistema registra log de creación
8. Sistema confirma éxito

**Flujo Alternativo:**
- 3a. Email duplicado → Error "Email ya registrado"
- 4a. CI duplicado → Error "CI ya registrado"

---

## CU04 - Editar Usuario

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin / Usuario |
| **Precondición** | Usuario autenticado |
| **Postcondición** | Datos actualizados |

**Flujo Principal:**
1. Usuario accede a edición de perfil
2. Usuario modifica datos permitidos
3. Sistema valida datos
4. Sistema actualiza en BD
5. Sistema confirma cambios

**Flujo Alternativo:**
- 2a. Docente intenta editar otro usuario → Error 403
- 3a. Email duplicado → Error "Email ya existe"

---

## CU05 - Eliminar Usuario

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin |
| **Precondición** | Admin autenticado, usuario existe |
| **Postcondición** | Usuario desactivado (soft delete) |

**Flujo Principal:**
1. Admin selecciona usuario a eliminar
2. Sistema verifica que no sea el mismo admin
3. Sistema cambia estado a "inactivo"
4. Sistema registra log
5. Sistema confirma eliminación

**Flujo Alternativo:**
- 2a. Admin intenta eliminarse → Error "No puede eliminarse a sí mismo"

---

## CU06 - Asignar Materias

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin |
| **Precondición** | Admin autenticado, docente existe |
| **Postcondición** | Materias asignadas al docente |

**Flujo Principal:**
1. Admin selecciona docente
2. Admin selecciona materias a asignar
3. Sistema valida que materias existan
4. Sistema elimina asignaciones anteriores
5. Sistema crea nuevas asignaciones
6. Sistema confirma cambios

**Flujo Alternativo:**
- 3a. Materia no existe → Error "Materia inválida"

---

## CU07 - Asignar Grados

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin |
| **Precondición** | Admin autenticado, docente existe |
| **Postcondición** | Grados asignados al docente |

**Flujo Principal:**
1. Admin selecciona docente
2. Admin selecciona grados a asignar
3. Sistema valida que grados existan
4. Sistema crea asignaciones
5. Sistema confirma cambios

**Flujo Alternativo:**
- 3a. Grado no existe → Error "Grado inválido"

---

## CU08 - Subir Video

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin / Docente |
| **Precondición** | Usuario autenticado, docente con asignaciones |
| **Postcondición** | Video guardado y disponible |

**Flujo Principal:**
1. Usuario selecciona archivo de video
2. Usuario completa título, descripción, materia, grado, tema
3. Sistema valida token JWT
4. Sistema verifica rol (Admin/Docente)
5. Sistema verifica asignación de materia (si es docente)
6. Sistema verifica asignación de grado (si es docente)
7. Sistema valida archivo (MIME, tamaño < 500MB, extensión)
8. Sistema genera nombre único
9. Sistema guarda archivo en storage
10. Sistema extrae metadatos (duración, resolución, codec)
11. Sistema genera thumbnail con FFmpeg
12. Sistema crea registro en BD
13. Sistema registra log de subida
14. Sistema retorna video creado

**Flujo Alternativo:**
- 5a. Sin asignación de materia → Error 403
- 6a. Sin asignación de grado → Error 403
- 7a. Archivo muy grande → Error "Excede 500 MB"
- 7b. Formato inválido → Error "Formato no soportado"
- 11a. FFmpeg no disponible → Sin thumbnail

---

## CU09 - Editar Video

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin / Docente |
| **Precondición** | Usuario autenticado, video existe |
| **Postcondición** | Metadatos actualizados |

**Flujo Principal:**
1. Usuario accede a edición de video
2. Sistema verifica permisos (admin o dueño)
3. Usuario modifica título, descripción, tema
4. Sistema valida datos
5. Sistema actualiza en BD
6. Sistema registra log
7. Sistema confirma cambios

**Flujo Alternativo:**
- 2a. Docente intenta editar video ajeno → Error 403
- 4a. Cambio de materia/grado sin asignación → Error 403

---

## CU10 - Eliminar Video

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin / Docente |
| **Precondición** | Usuario autenticado, video existe |
| **Postcondición** | Video desactivado (soft delete) |

**Flujo Principal:**
1. Usuario solicita eliminar video
2. Sistema verifica permisos (admin o dueño)
3. Sistema cambia estado a "inactivo"
4. Sistema registra log
5. Sistema confirma eliminación

**Flujo Alternativo:**
- 2a. Docente intenta eliminar video ajeno → Error 403

---

## CU11 - Reproducir Video

| Campo | Descripción |
|-------|-------------|
| **Actor** | Público / Docente / Admin |
| **Precondición** | Video existe y está activo |
| **Postcondición** | Video reproducido, estadísticas actualizadas |

**Flujo Principal:**
1. Usuario solicita reproducir video
2. Sistema busca video en BD
3. Sistema verifica estado activo
4. Sistema verifica archivo existe
5. Sistema registra reproducción
6. Sistema lee header Range (si existe)
7. Sistema envía stream por chunks de 8KB
8. Trigger incrementa visualizaciones

**Flujo Alternativo:**
- 2a. Video no encontrado → Error 404
- 3a. Video inactivo → Error 403
- 4a. Archivo no existe → Error 404

---

## CU12 - Buscar Videos

| Campo | Descripción |
|-------|-------------|
| **Actor** | Público / Docente / Admin |
| **Precondición** | Ninguna |
| **Postcondición** | Lista de videos encontrados |

**Flujo Principal:**
1. Usuario ingresa término de búsqueda
2. Usuario aplica filtros (materia, grado, tema)
3. Sistema construye query
4. Sistema ejecuta búsqueda FULLTEXT
5. Sistema filtra videos huérfanos
6. Sistema pagina resultados
7. Sistema retorna videos encontrados

**Flujo Alternativo:**
- 4a. FULLTEXT falla → Fallback a LIKE
- 5a. Sin resultados → Retornar lista vacía

**Restricciones por Rol:**
- Docente: Solo ve sus propios videos
- Admin: Ve todos los videos
- Público: Solo videos activos

---

## CU13 - Ver Dashboard

| Campo | Descripción |
|-------|-------------|
| **Actor** | Admin |
| **Precondición** | Admin autenticado |
| **Postcondición** | Dashboard mostrado |

**Flujo Principal:**
1. Admin accede al dashboard
2. Sistema consulta estadísticas generales
3. Sistema consulta métricas por materia
4. Sistema consulta métricas por grado
5. Sistema consulta tendencias
6. Sistema retorna datos del dashboard

**Datos mostrados:**
- Total usuarios, videos, reproducciones
- Videos por materia
- Videos por grado
- Top videos populares
- Videos recientes
- Tendencias de visualización

---

## CU14 - Ver Mis Estadísticas

| Campo | Descripción |
|-------|-------------|
| **Actor** | Docente |
| **Precondición** | Docente autenticado |
| **Postcondición** | Estadísticas propias mostradas |

**Flujo Principal:**
1. Docente accede a sus estadísticas
2. Sistema filtra por docente_id
3. Sistema consulta total de videos propios
4. Sistema consulta reproducciones de sus videos
5. Sistema consulta videos más vistos propios
6. Sistema retorna estadísticas

**Datos mostrados:**
- Total de mis videos
- Total reproducciones de mis videos
- Mis videos más populares
- Tiempo total de visualización

---

## Matriz de Trazabilidad

| CU | RF Relacionados |
|----|-----------------|
| CU01 | RF01.1, RF01.2, RF01.3 |
| CU02 | RF01.5 |
| CU03 | RF02.1 |
| CU04 | RF02.2, RF02.5 |
| CU05 | RF02.3 |
| CU06 | RF03.1 |
| CU07 | RF03.2 |
| CU08 | RF04.1, RF04.2, RF04.3 |
| CU09 | RF04.4 |
| CU10 | RF04.5 |
| CU11 | RF05.1, RF05.2, RF05.3, RF05.4 |
| CU12 | RF06.1, RF06.2, RF06.3, RF06.4 |
| CU13 | RF07.1, RF07.2, RF07.3 |
| CU14 | RF07.4 |
