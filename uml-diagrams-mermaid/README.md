# Diagramas UML - Mermaid

Diagramas UML del sistema Videoteca SFX en formato Mermaid, visualizables directamente en GitHub.

## Diagramas Disponibles

### 1. [Diagrama de Clases](01-diagrama-clases.md)
Modelo de datos completo con 10 clases principales, atributos, métodos y relaciones.

### 2. [Diagrama Entidad-Relación](02-diagrama-er.md)
Esquema de base de datos con 11 tablas, triggers, vistas, procedimientos y eventos.

### 3. [Diagrama de Arquitectura](03-diagrama-arquitectura.md)
Componentes del sistema: Entry Point, Middleware, Controllers, Models, Utilities, Database.

### 4. [Secuencia: Autenticación](04-secuencia-autenticacion.md)
Flujos de login, refresh token y logout con seguridad JWT.

### 5. [Secuencia: Subida de Video](05-secuencia-subida-video.md)
Proceso completo de subida por docente con validación de permisos.

### 6. [Secuencia: Streaming](06-secuencia-streaming.md)
Streaming de video con HTTP Range Requests y registro de reproducciones.

### 7. [Secuencia: Asignaciones](07-secuencia-asignaciones.md)
Gestión de asignaciones docente-materia-grado.

## Visualización

Los diagramas se renderizan automáticamente en:
- GitHub
- GitLab
- VS Code (extensión Markdown Preview Mermaid Support)
- Cualquier visor que soporte Mermaid

## Tecnologías del Sistema

| Componente | Tecnología |
|------------|------------|
| Backend | PHP 8.x REST API |
| Database | MySQL/MariaDB |
| Frontend Web | React + Vite + Tailwind |
| Frontend Mobile | React Native |
| Auth | JWT (HMAC-SHA256) |

## Estadísticas

- **11 tablas** de base de datos
- **10 modelos** PHP
- **9 controladores**
- **60+ endpoints** REST
- **4 triggers** automáticos
- **5 vistas** SQL
- **3 procedimientos** almacenados
- **2 eventos** programados

## Patrones de Diseño

- MVC (Model-View-Controller)
- Repository Pattern
- Singleton (Database)
- Factory (JWT)
- Middleware Chain
- Front Controller
