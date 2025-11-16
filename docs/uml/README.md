# Diagramas UML - Videoteca San Francisco Xavier

Esta carpeta contiene los diagramas UML completos del sistema Videoteca SFX, creados con PlantUML.

## 📋 Contenido

### Diagramas Disponibles

1. **`diagrama-clases.puml`** - Diagrama de Clases
   - Muestra todas las clases del sistema (Controllers, Models, Middleware, Utilities)
   - Relaciones entre clases
   - Métodos y propiedades principales
   - Patrones de diseño utilizados

2. **`diagrama-casos-uso.puml`** - Diagrama de Casos de Uso
   - Actores del sistema (Estudiante, Docente, Administrador, Sistema)
   - Funcionalidades públicas y privadas
   - Restricciones por rol
   - Relaciones entre casos de uso

3. **`diagrama-base-datos.puml`** - Diagrama Entidad-Relación
   - Estructura completa de la base de datos
   - Tablas, campos y tipos de datos
   - Relaciones y llaves foráneas
   - Índices y constraints
   - Vistas SQL

4. **`diagrama-secuencia-login.puml`** - Secuencia de Autenticación
   - Proceso completo de login
   - Generación de token JWT
   - Validación de credenciales
   - Manejo de sesiones

5. **`diagrama-secuencia-subir-video.puml`** - Secuencia de Subida de Video
   - Flujo completo de upload
   - Validaciones
   - Extracción de metadatos
   - Generación de thumbnails
   - Almacenamiento en BD

6. **`diagrama-secuencia-reproducir-video.puml`** - Secuencia de Reproducción
   - Streaming de video
   - Range requests
   - Registro de reproducciones
   - Incremento de visualizaciones

7. **`diagrama-componentes.puml`** - Diagrama de Componentes
   - Arquitectura del sistema
   - Frontend (React)
   - Backend (PHP)
   - Librerías y dependencias
   - Comunicación entre componentes

8. **`diagrama-despliegue.puml`** - Diagrama de Despliegue
   - Infraestructura del sistema
   - Servidores (Web, BD, Storage)
   - Configuración de red
   - Flujo de deployment
   - Seguridad

## 🔧 Cómo Visualizar los Diagramas

### Opción 1: Visual Studio Code (Recomendado)

1. **Instalar extensión PlantUML:**
   - Abrir VS Code
   - Ir a Extensions (Ctrl+Shift+X)
   - Buscar "PlantUML"
   - Instalar la extensión de jebbs

2. **Instalar Java (requerido por PlantUML):**
   ```bash
   # Ubuntu/Debian
   sudo apt install default-jre

   # Windows (con Chocolatey)
   choco install openjdk

   # macOS (con Homebrew)
   brew install openjdk
   ```

3. **Instalar Graphviz (requerido para layouts):**
   ```bash
   # Ubuntu/Debian
   sudo apt install graphviz

   # Windows (con Chocolatey)
   choco install graphviz

   # macOS (con Homebrew)
   brew install graphviz
   ```

4. **Visualizar diagrama:**
   - Abrir archivo `.puml`
   - Presionar `Alt+D` o `Ctrl+Shift+P` → "PlantUML: Preview Current Diagram"

5. **Exportar a imagen:**
   - Presionar `Ctrl+Shift+P`
   - Ejecutar "PlantUML: Export Current Diagram"
   - Elegir formato (PNG, SVG, PDF)

### Opción 2: Online (Sin Instalación)

1. **PlantUML Online Server:**
   - Ir a: https://www.plantuml.com/plantuml/uml/
   - Copiar el contenido del archivo `.puml`
   - Pegar en el editor
   - Ver preview en tiempo real
   - Descargar como PNG/SVG

2. **PlantText:**
   - Ir a: https://www.planttext.com/
   - Pegar código PlantUML
   - Generar diagrama
   - Descargar imagen

### Opción 3: Comando de Línea

1. **Instalar PlantUML JAR:**
   ```bash
   # Descargar
   wget https://sourceforge.net/projects/plantuml/files/plantuml.jar/download -O plantuml.jar

   # O con curl
   curl -L https://sourceforge.net/projects/plantuml/files/plantuml.jar/download -o plantuml.jar
   ```

2. **Generar diagrama:**
   ```bash
   # PNG
   java -jar plantuml.jar diagrama-clases.puml

   # SVG
   java -jar plantuml.jar -tsvg diagrama-clases.puml

   # PDF
   java -jar plantuml.jar -tpdf diagrama-clases.puml

   # Todos los archivos en la carpeta
   java -jar plantuml.jar *.puml
   ```

### Opción 4: Docker

```bash
# Generar todos los diagramas con Docker
docker run --rm -v $(pwd):/data plantuml/plantuml *.puml

# Para un archivo específico
docker run --rm -v $(pwd):/data plantuml/plantuml diagrama-clases.puml
```

## 📖 Guía de Lectura de Diagramas

### Diagrama de Clases

**Elementos:**
- `+` = Público
- `-` = Privado
- `#` = Protegido
- `{static}` = Método/propiedad estática
- `<<interface>>` = Interfaz
- `<<abstract>>` = Clase abstracta

**Relaciones:**
- `-->` = Asociación
- `--|>` = Herencia
- `..>` = Dependencia
- `*--` = Composición
- `o--` = Agregación

### Diagrama de Casos de Uso

**Relaciones:**
- `<<include>>` = Siempre incluido
- `<<extend>>` = Extensión opcional
- `--|>` = Generalización

### Diagrama de Secuencia

**Elementos:**
- `->` = Llamada síncrona
- `-->` = Retorno
- `..>` = Llamada asíncrona
- `alt` = Alternativa (if/else)
- `loop` = Bucle
- `opt` = Opcional

### Diagrama Entidad-Relación

**Cardinalidad:**
- `1` = Uno
- `N` = Muchos
- `0..1` = Cero o uno
- `1..*` = Uno o más

## 🎨 Personalización

### Cambiar Colores

Editar los archivos `.puml` y modificar las secciones de `skinparam`:

```plantuml
skinparam class {
    BackgroundColor LightBlue
    BorderColor Navy
    ArrowColor Navy
}
```

### Cambiar Fuente

```plantuml
skinparam defaultFontName Arial
skinparam defaultFontSize 12
```

### Orientación

```plantuml
left to right direction  ' Horizontal
top to bottom direction  ' Vertical (default)
```

## 📊 Generar Documentación Completa

### Script de Generación Automática

Crear un script `generate-diagrams.sh`:

```bash
#!/bin/bash

# Crear carpeta de salida
mkdir -p output

# Generar todos los diagramas en PNG
for file in *.puml; do
    echo "Generando $file..."
    java -jar plantuml.jar -tpng -o output "$file"
done

# Generar también en SVG (mejor calidad)
for file in *.puml; do
    echo "Generando $file (SVG)..."
    java -jar plantuml.jar -tsvg -o output "$file"
done

echo "✅ Diagramas generados en ./output/"
```

Ejecutar:
```bash
chmod +x generate-diagrams.sh
./generate-diagrams.sh
```

### Generar PDF con Todos los Diagramas

```bash
# Instalar ImageMagick
sudo apt install imagemagick

# Convertir PNGs a PDF
convert output/*.png documentacion-completa.pdf
```

## 🔗 Referencias

### PlantUML
- **Documentación oficial:** https://plantuml.com/
- **Guía de referencia:** https://plantuml.com/guide
- **Ejemplos:** https://real-world-plantuml.com/

### Diagramas UML
- **UML 2.5 Specification:** https://www.omg.org/spec/UML/
- **Tutorial UML:** https://www.tutorialspoint.com/uml/index.htm

### Herramientas
- **VS Code Extension:** https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml
- **PlantUML Server:** https://github.com/plantuml/plantuml-server

## 📝 Mantenimiento

### Actualizar Diagramas

Cuando se modifique el código del sistema:

1. Identificar qué diagramas se ven afectados
2. Editar los archivos `.puml` correspondientes
3. Regenerar las imágenes
4. Actualizar documentación relacionada

### Versionado

Los diagramas están versionados junto con el código en Git:

```bash
# Agregar cambios
git add docs/uml/

# Commit
git commit -m "docs: Actualizar diagrama de clases con nuevos controllers"

# Push
git push
```

## 🎯 Uso en Documentación

### Incluir en README.md

```markdown
## Arquitectura del Sistema

![Diagrama de Componentes](docs/uml/output/diagrama-componentes.png)

Para más detalles, ver los [diagramas UML completos](docs/uml/).
```

### Incluir en Wiki/Confluence

1. Generar imágenes PNG/SVG
2. Subir a la plataforma
3. Insertar en páginas de documentación

### Presentaciones

1. Exportar como SVG (mejor calidad)
2. Importar en PowerPoint/Google Slides
3. Redimensionar según necesidad

## 🚀 Tips Avanzados

### Dividir Diagramas Grandes

Si un diagrama es muy complejo, dividirlo en sub-diagramas:

```plantuml
@startuml diagrama-clases-controllers
!include diagrama-clases-base.puml
' Solo mostrar controllers
@enduml
```

### Usar Sprites/Iconos

```plantuml
!define ICONURL https://raw.githubusercontent.com/tupadr3/plantuml-icon-font-sprites/master

!include ICONURL/common.puml
!include ICONURL/font-awesome/database.puml

database "MySQL" as db <<$database>>
```

### Generar desde CI/CD

Agregar a GitHub Actions/GitLab CI:

```yaml
- name: Generate UML Diagrams
  run: |
    apt-get install -y default-jre graphviz
    wget https://sourceforge.net/projects/plantuml/files/plantuml.jar
    java -jar plantuml.jar docs/uml/*.puml
```

---

**Autor:** Roger Omar Luna Yujra
**Proyecto:** Videoteca San Francisco Xavier
**Fecha:** Noviembre 2025
**Versión:** 1.0.0
