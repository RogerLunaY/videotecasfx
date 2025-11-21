# Flujo de Datos - Versión Simplificada

## Flujo General

```mermaid
flowchart LR
    A["👤 Usuario"] -->|Request| B["🔐 Auth"]
    B -->|Validado| C["⚙️ Lógica"]
    C -->|Query| D["🗄️ Datos"]
    D -->|Resultado| C
    C -->|Response| A
```

## Por Tipo de Operación

### Consultar Datos

```mermaid
flowchart LR
    U["Usuario"] -->|GET| API["API"]
    API -->|SELECT| DB["MySQL"]
    DB -->|Datos| API
    API -->|JSON| U
```

### Guardar Datos

```mermaid
flowchart LR
    U["Usuario"] -->|POST| API["API"]
    API -->|INSERT| DB["MySQL"]
    DB -->|OK| API
    API -->|Confirmación| U
```

### Subir Video

```mermaid
flowchart LR
    U["Usuario"] -->|Archivo| API["API"]
    API -->|Guardar| FS["Storage"]
    API -->|Metadatos| DB["MySQL"]
    API -->|OK| U
```

### Streaming

```mermaid
flowchart LR
    U["Usuario"] -->|GET| API["API"]
    API -->|Leer| FS["Storage"]
    FS -->|Video| API
    API -->|Stream| U
```

## Flujo entre Capas

```mermaid
flowchart TB
    P["📱 Presentación"]
    N["⚙️ Negocio"]
    D["💾 Datos"]

    P -->|"1. Request"| N
    N -->|"2. Query"| D
    D -->|"3. Resultado"| N
    N -->|"4. Response"| P
```

## Resumen

| Operación | Flujo |
|-----------|-------|
| **GET** | Cliente → API → MySQL → API → Cliente |
| **POST** | Cliente → API → MySQL → API → Cliente |
| **Upload** | Cliente → API → Storage + MySQL → Cliente |
| **Stream** | Cliente → API → Storage → Cliente |
