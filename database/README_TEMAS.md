# Gestión de Temas del Currículo Boliviano

## Estructura de la Tabla

La tabla `temas` ahora incluye el campo `grado_id` para relacionar cada tema con un grado específico (1-6):

```sql
CREATE TABLE temas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    materia_id INT UNSIGNED NOT NULL,
    grado_id INT UNSIGNED NOT NULL,
    orden INT DEFAULT 0,
    ...
);
```

## Datos Completos del Currículo

El currículo boliviano incluye **más de 600 temas** distribuidos en:
- **14 materias** (áreas de conocimiento)
- **6 grados** (años de escolaridad de secundaria)

### Distribución de Temas por Materia

| Materia | ID | Temas Aproximados |
|---------|----|--------------------|
| Biología - Geografía | 1 | 59 |
| Física | 2 | 33 |
| Química | 3 | 19 |
| Matemática | 4 | 57 |
| Técnica Tecnológica | 5 | 25 |
| Lengua Castellana | 6 | 18 |
| Lengua Originaria | 7 | 39 |
| Lengua Extranjera | 8 | 18 |
| Ciencias Sociales | 9 | 102 |
| Artes Plásticas | 10 | 36 |
| Educación Musical | 11 | 18 |
| Educación Física | 12 | 30 |
| Cosmovisiones | 13 | 45 |
| Valores | 14 | 45 |

**Total: ~600+ temas**

## Opciones de Importación

### Opción 1: Datos de Prueba (Actual)

El archivo `seed_data.sql` incluye una **muestra representativa** de temas para demostrar la estructura:
- Al menos 1-3 temas por materia en grado 1
- Suficiente para testing y desarrollo inicial

### Opción 2: Importación Completa

Para cargar todos los temas del currículo completo, tienes dos opciones:

#### A. Archivo SQL Completo

1. Crear archivo `temas_completos.sql` con todos los temas
2. Importar después de la instalación inicial:

```bash
mysql -u usuario -p videoteca_sfx < database/temas_completos.sql
```

#### B. Interfaz de Administración

1. Implementar módulo de administración de temas en el frontend
2. Permitir a administradores agregar temas manualmente o mediante importación CSV/Excel

## Formato de los Datos Originales

Los datos fueron proporcionados en el siguiente formato:

```sql
INSERT INTO TEMAS(area_id, ano_escolaridad, descripcion_tema) VALUES
(materia_id, grado, 'NOMBRE DEL TEMA'),
...
```

Estos fueron transformados a:

```sql
INSERT INTO temas (nombre, materia_id, grado_id, orden) VALUES
('NOMBRE DEL TEMA', materia_id, grado_id, orden),
...
```

## Mantenimiento

### Agregar Nuevos Temas

```sql
INSERT INTO temas (nombre, materia_id, grado_id, orden, estado) VALUES
('NUEVO TEMA', 1, 1, 100, 'activo');
```

### Actualizar Temas Existentes

```sql
UPDATE temas
SET nombre = 'TEMA ACTUALIZADO', orden = 101
WHERE id = 1;
```

### Consultar Temas por Materia y Grado

```sql
SELECT t.*, m.nombre as materia, g.nombre as grado
FROM temas t
INNER JOIN materias m ON t.materia_id = m.id
INNER JOIN grados g ON t.grado_id = g.id
WHERE t.materia_id = 1 AND t.grado_id = 1
ORDER BY t.orden;
```

## Notas Importantes

1. **Los temas de Lengua Originaria** (materia_id: 7) usan minúsculas como en el currículo oficial
2. **Los temas de Educación Física** (materia_id: 12) se repiten para cada grado con la misma estructura
3. **Orden de temas**: El campo `orden` es secuencial y único dentro de toda la tabla para facilitar la gestión

## Referencias

- Currículo Base del Sistema Educativo Plurinacional de Bolivia
- Ley 070 - Ley de la Educación "Avelino Siñani - Elizardo Pérez"
- Campos de Saberes y Conocimientos del Currículo Boliviano
