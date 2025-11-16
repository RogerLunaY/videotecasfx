# Documentación - Videoteca San Francisco Xavier

Documentación técnica completa del Sistema de Biblioteca Digital de Videos Educativos.

## 📚 Índice de Documentación

### 🎨 Diagramas UML

Todos los diagramas están en formato PlantUML en la carpeta [`uml/`](uml/)

| Diagrama | Descripción | Archivo |
|----------|-------------|---------|
| **Diagrama de Clases** | Estructura completa del código backend: Controllers, Models, Middleware, Utilities | [diagrama-clases.puml](uml/diagrama-clases.puml) |
| **Diagrama de Casos de Uso** | Funcionalidades del sistema por rol (Estudiante, Docente, Administrador) | [diagrama-casos-uso.puml](uml/diagrama-casos-uso.puml) |
| **Diagrama de Base de Datos** | Esquema ER completo con tablas, relaciones, índices y vistas | [diagrama-base-datos.puml](uml/diagrama-base-datos.puml) |
| **Diagrama de Componentes** | Arquitectura del sistema: Frontend (React) + Backend (PHP) + Base de Datos | [diagrama-componentes.puml](uml/diagrama-componentes.puml) |
| **Diagrama de Despliegue** | Infraestructura, servidores, configuración de red y deployment | [diagrama-despliegue.puml](uml/diagrama-despliegue.puml) |
| **Secuencia: Login** | Flujo de autenticación con JWT, validación y manejo de sesiones | [diagrama-secuencia-login.puml](uml/diagrama-secuencia-login.puml) |
| **Secuencia: Subir Video** | Proceso completo de upload, validación, metadatos y thumbnails | [diagrama-secuencia-subir-video.puml](uml/diagrama-secuencia-subir-video.puml) |
| **Secuencia: Reproducir Video** | Streaming con range requests, registro de reproducciones | [diagrama-secuencia-reproducir-video.puml](uml/diagrama-secuencia-reproducir-video.puml) |
| **Diagrama de Estados** | Ciclo de vida de un video: Subiendo → Procesando → Activo → Eliminado | [diagrama-estados-video.puml](uml/diagrama-estados-video.puml) |

**[Ver guía completa de visualización →](uml/README.md)**

### 📖 Documentación Funcional

| Documento | Descripción |
|-----------|-------------|
| [README.md](../README.md) | Descripción general del proyecto, instalación y configuración |
| [INICIO_RAPIDO_LARAGON.md](../INICIO_RAPIDO_LARAGON.md) | Guía de inicio rápido con Laragon |
| [MANUAL_LARAGON.md](../MANUAL_LARAGON.md) | Manual detallado de configuración con Laragon |
| [SISTEMA_COMPLETO.md](../SISTEMA_COMPLETO.md) | Descripción completa del sistema y sus características |
| [RESTRICCIONES_DOCENTE.md](../RESTRICCIONES_DOCENTE.md) | Permisos y restricciones para rol docente |

### 🔧 Documentación Técnica

| Documento | Descripción |
|-----------|-------------|
| [CONFIGURACION_APLICADA.md](../CONFIGURACION_APLICADA.md) | Configuración aplicada al sistema |
| [SOLUCION_METADATOS_THUMBNAILS.md](../SOLUCION_METADATOS_THUMBNAILS.md) | Extracción de metadatos con getID3 |
| [DIAGNOSTICO_REPRODUCCION.md](../DIAGNOSTICO_REPRODUCCION.md) | Solución de problemas de reproducción |
| [VIDEOS_HUERFANOS.md](../VIDEOS_HUERFANOS.md) | Manejo de videos sin archivo físico |

### 🐛 Solución de Problemas

| Documento | Descripción |
|-----------|-------------|
| [DIAGNOSTICO_LOGIN.md](../DIAGNOSTICO_LOGIN.md) | Diagnóstico de problemas de autenticación |
| [SOLUCION_CREDENCIALES.md](../SOLUCION_CREDENCIALES.md) | Solución de problemas con credenciales |
| [SOLUCION_ERROR_401.md](../SOLUCION_ERROR_401.md) | Solución de errores 401 Unauthorized |
| [SOLUCION_ERROR_SUBIDA.md](../SOLUCION_ERROR_SUBIDA.md) | Configuración de límites para subida de archivos |
| [PASOS_FINALES.md](../PASOS_FINALES.md) | Pasos finales de configuración |

## 🎯 Guías Rápidas

### Para Desarrolladores

1. **Clonar y Configurar:**
   ```bash
   git clone <repository>
   cd videotecasfx
   # Ver README.md para instrucciones detalladas
   ```

2. **Entender la Arquitectura:**
   - Revisar [Diagrama de Componentes](uml/diagrama-componentes.puml)
   - Revisar [Diagrama de Clases](uml/diagrama-clases.puml)

3. **Entender los Flujos:**
   - [Secuencia de Login](uml/diagrama-secuencia-login.puml)
   - [Secuencia de Subir Video](uml/diagrama-secuencia-subir-video.puml)
   - [Secuencia de Reproducir Video](uml/diagrama-secuencia-reproducir-video.puml)

4. **Base de Datos:**
   - Revisar [Diagrama ER](uml/diagrama-base-datos.puml)
   - Scripts SQL en `backend/database/`

### Para Administradores de Sistema

1. **Deployment:**
   - Revisar [Diagrama de Despliegue](uml/diagrama-despliegue.puml)
   - Seguir [MANUAL_LARAGON.md](../MANUAL_LARAGON.md)

2. **Configuración:**
   - [CONFIGURACION_APLICADA.md](../CONFIGURACION_APLICADA.md)
   - [SOLUCION_ERROR_SUBIDA.md](../SOLUCION_ERROR_SUBIDA.md)

3. **Troubleshooting:**
   - [DIAGNOSTICO_REPRODUCCION.md](../DIAGNOSTICO_REPRODUCCION.md)
   - [VIDEOS_HUERFANOS.md](../VIDEOS_HUERFANOS.md)

### Para Usuarios Finales

1. **Roles y Permisos:**
   - [Diagrama de Casos de Uso](uml/diagrama-casos-uso.puml)
   - [RESTRICCIONES_DOCENTE.md](../RESTRICCIONES_DOCENTE.md)

2. **Funcionalidades:**
   - [SISTEMA_COMPLETO.md](../SISTEMA_COMPLETO.md)

## 🔍 Visualizar Diagramas UML

### Opción 1: Visual Studio Code

```bash
# Instalar extensión PlantUML
code --install-extension jebbs.plantuml

# Abrir cualquier archivo .puml
# Presionar Alt+D para previsualizar
```

### Opción 2: Online

Visitar: https://www.plantuml.com/plantuml/uml/

Copiar y pegar el contenido de cualquier archivo `.puml`

### Opción 3: Generar Imágenes

```bash
cd docs/uml
java -jar plantuml.jar *.puml
# Genera archivos PNG
```

**[Guía completa de visualización →](uml/README.md)**

## 📊 Estructura de la Documentación

```
docs/
├── README.md (este archivo)
├── uml/
│   ├── README.md
│   ├── diagrama-clases.puml
│   ├── diagrama-casos-uso.puml
│   ├── diagrama-base-datos.puml
│   ├── diagrama-componentes.puml
│   ├── diagrama-despliegue.puml
│   ├── diagrama-secuencia-login.puml
│   ├── diagrama-secuencia-subir-video.puml
│   ├── diagrama-secuencia-reproducir-video.puml
│   └── diagrama-estados-video.puml
└── (otros documentos en raíz del proyecto)
```

## 🚀 Próximos Pasos

1. **Revisar los diagramas UML** para entender la arquitectura
2. **Leer el README principal** para instrucciones de instalación
3. **Seguir las guías específicas** según tu rol (dev, admin, usuario)
4. **Consultar troubleshooting** si encuentras problemas

## 📝 Contribuir a la Documentación

### Actualizar Diagramas UML

1. Editar archivo `.puml` correspondiente
2. Regenerar imagen (si aplica)
3. Commit con mensaje descriptivo:
   ```bash
   git commit -m "docs: Actualizar diagrama de clases con nuevo controller"
   ```

### Agregar Nueva Documentación

1. Crear archivo Markdown en ubicación apropiada
2. Actualizar este índice
3. Agregar enlaces cruzados desde otros documentos
4. Commit:
   ```bash
   git commit -m "docs: Agregar guía de configuración de SSL"
   ```

## 📞 Contacto

**Desarrollador:** Roger Omar Luna Yujra
**Institución:** Instituto Técnico ATSI Bolivia
**Proyecto:** Videoteca San Francisco Xavier
**Versión:** 1.0.0
**Fecha:** Noviembre 2025

---

**Nota:** Esta es documentación técnica completa. Para información general del proyecto, ver [README.md](../README.md)
