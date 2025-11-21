# Flujo de Datos, Arquitectura Física y de Red

## Flujo de Datos entre Capas

```mermaid
flowchart TB
    subgraph Presentacion["PRESENTACIÓN"]
        UI["Interfaz de Usuario"]
        Forms["Formularios"]
        Display["Visualización"]
    end

    subgraph Negocio["LÓGICA DE NEGOCIO"]
        Validation["Validación"]
        Auth["Autenticación"]
        Business["Reglas de Negocio"]
        Processing["Procesamiento"]
    end

    subgraph Datos["ACCESO A DATOS"]
        Models["Modelos"]
        Queries["Consultas SQL"]
        FileOps["Operaciones Archivos"]
    end

    subgraph Persistencia["PERSISTENCIA"]
        DB["Base de Datos"]
        Files["Sistema Archivos"]
    end

    UI -->|"1. Request HTTP"| Validation
    Forms -->|"Datos JSON"| Validation

    Validation -->|"2. Datos validados"| Auth
    Auth -->|"3. Usuario verificado"| Business
    Business -->|"4. Lógica aplicada"| Processing

    Processing -->|"5. Operación datos"| Models
    Models -->|"6. Query SQL"| Queries
    Models -->|"7. Leer/Escribir"| FileOps

    Queries -->|"8. Ejecutar"| DB
    FileOps -->|"9. I/O"| Files

    DB -->|"10. Resultado"| Queries
    Files -->|"11. Archivo"| FileOps

    Queries -->|"12. Datos"| Models
    FileOps -->|"13. Contenido"| Models

    Models -->|"14. Respuesta"| Processing
    Processing -->|"15. Resultado"| Display
    Display -->|"16. Response JSON"| UI
```

## Flujo Detallado por Operación

### Lectura (GET)

```mermaid
flowchart LR
    A["Cliente"] -->|Request| B["API"]
    B -->|Query| C["MySQL"]
    C -->|Datos| B
    B -->|JSON| A
```

### Escritura (POST/PUT)

```mermaid
flowchart LR
    A["Cliente"] -->|Datos| B["Validación"]
    B -->|Válido| C["Negocio"]
    C -->|Insert/Update| D["MySQL"]
    D -->|OK| C
    C -->|Respuesta| A
```

### Subida de Archivo

```mermaid
flowchart LR
    A["Cliente"] -->|Archivo| B["API"]
    B -->|Guardar| C["Storage"]
    B -->|Metadatos| D["MySQL"]
    D -->|ID| B
    B -->|Confirmación| A
```

---

## Arquitectura Física

```mermaid
flowchart TB
    subgraph DataCenter["🏢 Data Center / Cloud"]
        subgraph Rack1["Rack Servidores"]
            WebServer["🖧 Servidor Web<br/>────────────<br/>CPU: 4 cores<br/>RAM: 8 GB<br/>Disco: 500 GB SSD<br/>OS: Ubuntu 22.04"]

            DBServer["🗄️ Servidor BD<br/>────────────<br/>CPU: 4 cores<br/>RAM: 16 GB<br/>Disco: 200 GB SSD<br/>OS: Ubuntu 22.04"]
        end

        subgraph Storage["Almacenamiento"]
            NAS["📦 NAS/Storage<br/>────────────<br/>Capacidad: 2 TB<br/>RAID: 1 o 5<br/>Para: Videos"]
        end

        subgraph Network["Red Interna"]
            Switch["🔀 Switch<br/>1 Gbps"]
        end
    end

    subgraph Internet["🌐 Internet"]
        Users["👥 Usuarios"]
        Firewall["🛡️ Firewall"]
    end

    Users --> Firewall
    Firewall --> Switch
    Switch --> WebServer
    Switch --> DBServer
    Switch --> NAS
    WebServer --> DBServer
    WebServer --> NAS
```

## Especificaciones de Hardware

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| **Servidor Web** |
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Disco | 100 GB | 500 GB SSD |
| **Servidor BD** |
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 16+ GB |
| Disco | 50 GB | 200 GB SSD |
| **Storage** |
| Capacidad | 500 GB | 2+ TB |
| Tipo | HDD | SSD/NVMe |

---

## Arquitectura de Red

```mermaid
flowchart TB
    subgraph Internet["Internet"]
        Users["👥 Usuarios<br/>Web/Mobile"]
        DNS["🌐 DNS<br/>videoteca.edu.bo"]
    end

    subgraph DMZ["DMZ (Zona Desmilitarizada)"]
        Firewall["🛡️ Firewall<br/>────────────<br/>Puertos:<br/>80, 443"]

        LB["⚖️ Load Balancer<br/>(Opcional)<br/>────────────<br/>Nginx/HAProxy"]
    end

    subgraph Internal["Red Interna (192.168.1.0/24)"]
        subgraph WebTier["Capa Web"]
            Web1["🖧 Web Server<br/>192.168.1.10<br/>────────────<br/>Apache/Nginx<br/>PHP 8.x"]
        end

        subgraph AppTier["Capa Aplicación"]
            App["⚙️ API REST<br/>────────────<br/>Puerto 80/443"]
        end

        subgraph DataTier["Capa Datos"]
            DB["🗄️ MySQL<br/>192.168.1.20<br/>────────────<br/>Puerto 3306"]

            Storage["📁 Storage<br/>192.168.1.30<br/>────────────<br/>NFS/SMB"]
        end
    end

    Users --> DNS
    DNS --> Firewall
    Firewall -->|"HTTPS:443"| LB
    LB --> Web1
    Web1 --> App
    App -->|"TCP:3306"| DB
    App -->|"NFS"| Storage
```

## Configuración de Red

### Puertos y Protocolos

| Puerto | Protocolo | Servicio | Acceso |
|--------|-----------|----------|--------|
| 80 | HTTP | Web Server | Público (redirige a 443) |
| 443 | HTTPS | Web Server | Público |
| 3306 | MySQL | Base de Datos | Solo interno |
| 22 | SSH | Administración | Solo VPN/interno |
| 2049 | NFS | Storage | Solo interno |

### Segmentación de Red

```mermaid
flowchart LR
    subgraph Public["Red Pública"]
        Internet["0.0.0.0/0"]
    end

    subgraph DMZ["DMZ<br/>10.0.1.0/24"]
        FW["Firewall"]
        LB["Load Balancer"]
    end

    subgraph Private["Red Privada<br/>192.168.1.0/24"]
        Web["Web: .10"]
        DB["DB: .20"]
        Storage["Storage: .30"]
    end

    Internet --> FW
    FW --> LB
    LB --> Web
    Web --> DB
    Web --> Storage
```

### Reglas de Firewall

| Origen | Destino | Puerto | Acción |
|--------|---------|--------|--------|
| Internet | DMZ | 443 | ALLOW |
| Internet | DMZ | 80 | ALLOW (redirect) |
| DMZ | Web Server | 443 | ALLOW |
| Web Server | DB Server | 3306 | ALLOW |
| Web Server | Storage | 2049 | ALLOW |
| * | * | * | DENY |

## Diagrama de Comunicación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant DNS as DNS
    participant FW as Firewall
    participant WS as Web Server
    participant DB as MySQL
    participant FS as Storage

    U->>DNS: videoteca.edu.bo
    DNS-->>U: IP: 203.0.113.10

    U->>FW: HTTPS:443
    FW->>WS: Forward request

    WS->>DB: Query (TCP:3306)
    DB-->>WS: Datos

    WS->>FS: Read file (NFS)
    FS-->>WS: Archivo

    WS-->>FW: Response
    FW-->>U: HTTPS Response
```
