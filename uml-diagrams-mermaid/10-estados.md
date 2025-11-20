# Diagramas de Estados

## Estado de Video

```mermaid
stateDiagram-v2
    [*] --> Procesando: Subida iniciada

    Procesando --> Activo: Procesamiento exitoso
    Procesando --> Error: Fallo en procesamiento

    Activo --> Inactivo: Desactivar video
    Activo --> Activo: Editar metadatos
    Activo --> Activo: Incrementar visualizaciones

    Inactivo --> Activo: Reactivar video
    Inactivo --> [*]: Eliminar permanentemente

    Error --> Procesando: Reintentar subida
    Error --> [*]: Descartar video

    note right of Procesando
        - Archivo subido
        - Extrayendo metadatos
        - Generando thumbnail
    end note

    note right of Activo
        - Visible para usuarios
        - Disponible para streaming
        - Aparece en búsquedas
    end note

    note right of Inactivo
        - No visible públicamente
        - Solo admin puede ver
        - Soft delete
    end note

    note right of Error
        - Fallo en procesamiento
        - Archivo corrupto
        - FFmpeg no disponible
    end note
```

## Estado de Usuario

```mermaid
stateDiagram-v2
    [*] --> Activo: Registro exitoso

    Activo --> Activo: Login exitoso
    Activo --> Activo: Actualizar perfil
    Activo --> Activo: Cambiar contraseña
    Activo --> Bloqueado: 5 intentos fallidos

    Bloqueado --> Activo: Tiempo expirado (15 min)
    Bloqueado --> Activo: Admin desbloquea

    Activo --> Inactivo: Admin desactiva
    Inactivo --> Activo: Admin reactiva
    Inactivo --> [*]: Eliminar permanentemente

    note right of Activo
        - Puede hacer login
        - Acceso según rol
        - intentos_login = 0
    end note

    note right of Bloqueado
        - No puede hacer login
        - bloqueado_hasta > NOW()
        - Protección contra fuerza bruta
    end note

    note right of Inactivo
        - No puede hacer login
        - Datos preservados
        - Soft delete
    end note
```

## Estado de Sesión (Token)

```mermaid
stateDiagram-v2
    [*] --> SinAutenticar

    SinAutenticar --> Autenticado: Login exitoso

    state Autenticado {
        [*] --> TokenValido
        TokenValido --> TokenValido: Usar API
        TokenValido --> TokenExpirado: exp < now()
        TokenExpirado --> TokenValido: Refresh token
        TokenExpirado --> [*]: Refresh inválido
    }

    Autenticado --> SinAutenticar: Logout
    Autenticado --> SinAutenticar: Token revocado

    note right of TokenValido
        Access Token válido
        - Duración: 1 hora
        - Firmado con HS256
    end note

    note right of TokenExpirado
        Access Token expirado
        - Usar Refresh Token
        - Duración refresh: 7 días
    end note
```

## Estado de Refresh Token

```mermaid
stateDiagram-v2
    [*] --> Valido: Generado en login

    Valido --> Usado: Refresh solicitado
    Usado --> Valido: Nuevo access token generado

    Valido --> Expirado: 7 días transcurridos
    Usado --> Expirado: 7 días transcurridos

    Valido --> Revocado: Logout
    Usado --> Revocado: Logout

    Expirado --> [*]: Limpieza automática
    Revocado --> [*]: Limpieza automática

    note right of Valido
        - revocado = false
        - expira_en > NOW()
        - Almacenado hasheado
    end note

    note right of Revocado
        - revocado = true
        - Usuario hizo logout
        - No se puede usar
    end note

    note right of Expirado
        - expira_en < NOW()
        - Evento diario limpia
        - sp_limpiar_tokens_expirados()
    end note
```

## Estado de Reproducción

```mermaid
stateDiagram-v2
    [*] --> Iniciada: Usuario abre video

    Iniciada --> EnProgreso: Reproducción comenzada

    state EnProgreso {
        [*] --> Reproduciendo
        Reproduciendo --> Pausado: Pausar
        Pausado --> Reproduciendo: Reanudar
        Reproduciendo --> Reproduciendo: Actualizar progreso
    }

    EnProgreso --> Completada: porcentaje >= 90%
    EnProgreso --> Abandonada: Usuario cierra

    Completada --> [*]
    Abandonada --> [*]

    note right of Iniciada
        - Registro creado
        - tiempo_reproducido = 0
        - Trigger incrementa visualizaciones
    end note

    note right of EnProgreso
        - Actualizaciones periódicas
        - tiempo_reproducido aumenta
        - porcentaje_visto calculado
    end note

    note right of Completada
        - completado = true
        - fecha_fin registrada
        - Estadísticas actualizadas
    end note
```

## Estado de Asignación

```mermaid
stateDiagram-v2
    [*] --> Activa: Admin asigna

    Activa --> Activa: Verificar permisos
    Activa --> Inactiva: Admin desasigna

    Inactiva --> Activa: Admin reasigna
    Inactiva --> [*]: Eliminar registro

    note right of Activa
        - estado = 'activo'
        - Docente puede subir videos
        - Válida para materia+grado
    end note

    note right of Inactiva
        - estado = 'inactivo'
        - Docente no puede subir
        - Histórico preservado
    end note
```

## Estado del Sistema (General)

```mermaid
stateDiagram-v2
    [*] --> Iniciando

    Iniciando --> Operativo: Configuración cargada
    Iniciando --> Error: Fallo de configuración

    state Operativo {
        [*] --> Normal
        Normal --> AltaCarga: Muchas peticiones
        AltaCarga --> Normal: Carga reducida
        Normal --> Mantenimiento: Admin activa
        Mantenimiento --> Normal: Admin desactiva
    }

    Error --> Iniciando: Reiniciar
    Operativo --> [*]: Apagar sistema

    note right of Normal
        - API respondiendo
        - BD conectada
        - Archivos accesibles
    end note

    note right of AltaCarga
        - Streaming múltiple
        - Posible throttling
        - Monitoreo activo
    end note

    note right of Mantenimiento
        - Solo admins acceden
        - Actualizaciones en curso
        - Backup en progreso
    end note
```

## Tabla de Estados por Entidad

| Entidad | Estados | Transiciones Principales |
|---------|---------|--------------------------|
| **Video** | procesando, activo, inactivo, error | subir→procesar→activar |
| **Usuario** | activo, bloqueado, inactivo | registrar→activar, login fallido→bloquear |
| **Token** | válido, expirado, revocado | crear→usar→expirar/revocar |
| **Reproducción** | iniciada, en_progreso, completada, abandonada | abrir→reproducir→completar |
| **Asignación** | activa, inactiva | asignar→activar, desasignar→inactivar |

## Eventos Automáticos

| Evento | Disparador | Resultado |
|--------|------------|-----------|
| Bloqueo de usuario | 5 intentos fallidos | estado → bloqueado por 15 min |
| Desbloqueo | Tiempo expirado | estado → activo |
| Expiración de token | exp < NOW() | Requiere refresh |
| Limpieza de tokens | Evento diario | Elimina tokens expirados |
| Incremento visualizaciones | Nueva reproducción | Trigger actualiza contador |
