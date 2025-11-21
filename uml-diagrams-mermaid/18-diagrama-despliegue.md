# Diagrama de Despliegue

## Infraestructura del Sistema

```mermaid
flowchart TB
    subgraph Internet["🌐 Internet"]
        Browser["🖥️ Navegador Web"]
        Mobile["📱 App Móvil"]
    end

    subgraph Servidor["🖧 Servidor Web"]
        subgraph Apache["Apache/Nginx"]
            PHP["PHP 8.x"]
        end

        subgraph App["Aplicación"]
            API["API REST"]
            Frontend["Frontend React<br/>(build estático)"]
        end

        subgraph Storage["Almacenamiento"]
            Videos["📁 /uploads/videos"]
            Thumbs["📁 /uploads/thumbnails"]
            Logs["📁 /logs"]
        end
    end

    subgraph DBServer["🗄️ Servidor BD"]
        MySQL["MySQL/MariaDB<br/>Puerto 3306"]
    end

    Browser -->|HTTPS:443| Apache
    Mobile -->|HTTPS:443| Apache

    Apache --> PHP
    PHP --> API
    Apache --> Frontend

    API -->|PDO| MySQL
    API --> Storage
```

## Despliegue Detallado

```mermaid
flowchart TB
    subgraph Cliente["Dispositivos Cliente"]
        PC["💻 PC/Laptop<br/>Chrome, Firefox, Edge"]
        Tablet["📱 Tablet<br/>Safari, Chrome"]
        Phone["📱 Smartphone<br/>App React Native"]
    end

    subgraph LoadBalancer["Balanceador (Opcional)"]
        LB["⚖️ Load Balancer<br/>Nginx/HAProxy"]
    end

    subgraph WebServer["Servidor Web"]
        direction TB
        Web1["🖧 Web Server<br/>Apache 2.4 / Nginx"]
        PHP1["PHP 8.x<br/>+ Extensiones:<br/>PDO, JSON, mbstring"]

        subgraph AppFiles["Archivos de Aplicación"]
            Backend["📂 /var/www/videoteca/backend"]
            FrontendBuild["📂 /var/www/videoteca/frontend-web/dist"]
        end
    end

    subgraph FileServer["Servidor de Archivos"]
        direction TB
        VideoStore["🎬 Videos<br/>/uploads/videos/{materia}/{grado}/"]
        ThumbStore["🖼️ Thumbnails<br/>/uploads/thumbnails/"]
        LogStore["📋 Logs<br/>/logs/"]
    end

    subgraph DatabaseServer["Servidor de Base de Datos"]
        direction TB
        MySQLServer["🗄️ MySQL 8.0 / MariaDB 10.x"]
        DBFiles["📂 /var/lib/mysql/videoteca"]
    end

    subgraph External["Servicios Externos"]
        FFmpeg["🎥 FFmpeg<br/>(generación thumbnails)"]
        GetID3["📦 getID3<br/>(metadatos video)"]
    end

    Cliente -->|HTTPS| LB
    LB --> Web1
    Web1 --> PHP1
    PHP1 --> AppFiles
    PHP1 -->|TCP:3306| MySQLServer
    PHP1 --> FileServer
    PHP1 --> External
```

## Configuración de Puertos

| Servicio | Puerto | Protocolo |
|----------|--------|-----------|
| HTTP | 80 | TCP |
| HTTPS | 443 | TCP |
| MySQL | 3306 | TCP |
| SSH | 22 | TCP |

## Requisitos del Servidor

### Servidor Web
- **OS:** Ubuntu 20.04+ / CentOS 8+
- **RAM:** 4 GB mínimo
- **CPU:** 2 cores mínimo
- **Disco:** 100 GB+ (para videos)
- **Software:**
  - Apache 2.4 o Nginx
  - PHP 8.0+
  - FFmpeg
  - getID3

### Servidor de Base de Datos
- **OS:** Ubuntu 20.04+ / CentOS 8+
- **RAM:** 2 GB mínimo
- **CPU:** 2 cores
- **Disco:** 20 GB
- **Software:**
  - MySQL 8.0+ o MariaDB 10.x

## Estructura de Directorios

```
/var/www/videoteca/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   │   ├── videos/
│   │   └── thumbnails/
│   ├── logs/
│   └── index.php
├── frontend-web/
│   └── dist/
└── database/
    ├── schema.sql
    └── seed_data.sql
```
