# Diagrama de Secuencia - Autenticación

## Flujo de Login

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente
    participant I as index.php
    participant R as Router
    participant AC as AuthController
    participant U as Usuario Model
    participant JWT as JWTHandler
    participant L as Logger
    participant DB as Database

    C->>I: POST /api/auth/login<br/>{email, password}
    I->>R: Enrutar petición
    R->>AC: login()

    AC->>AC: Validar datos

    AC->>U: estaBloqueado(email)
    U->>DB: SELECT bloqueado_hasta
    DB-->>U: resultado
    U-->>AC: bloqueado: bool

    alt Usuario Bloqueado
        AC-->>C: 403 Forbidden<br/>{error: "Usuario bloqueado"}
    else Usuario No Bloqueado
        AC->>U: verificarPassword(email, password)
        U->>DB: SELECT usuario WHERE email
        DB-->>U: usuario
        U->>U: password_verify()
        U-->>AC: usuario o false

        alt Credenciales Inválidas
            AC->>U: incrementarIntentosLogin(email)
            U->>DB: UPDATE intentos_login++

            alt intentos >= 5
                AC->>U: bloquearUsuario(email, 15min)
                U->>DB: UPDATE bloqueado_hasta
                AC->>L: warning('login_bloqueado')
                L->>DB: INSERT log
            end

            AC-->>C: 401 Unauthorized
        else Credenciales Válidas
            AC->>JWT: generarAccessToken()
            JWT-->>AC: accessToken (1h)

            AC->>JWT: generarRefreshToken()
            JWT-->>AC: refreshToken (7 días)

            AC->>JWT: hashToken(refreshToken)
            JWT-->>AC: tokenHash

            AC->>DB: INSERT tokens_refresh

            AC->>U: actualizarUltimoAcceso()
            U->>DB: UPDATE ultimo_acceso, intentos=0

            AC->>L: auth('login', 'exitoso')
            L->>DB: INSERT log

            AC-->>C: 200 OK<br/>{user, tokens}
        end
    end
```

## Flujo de Refresh Token

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente
    participant AC as AuthController
    participant JWT as JWTHandler
    participant DB as Database

    C->>AC: POST /api/auth/refresh<br/>{refresh_token}

    AC->>JWT: validarToken(refreshToken)
    JWT->>JWT: Verificar firma y expiración
    JWT-->>AC: payload válido

    AC->>JWT: hashToken(refreshToken)
    JWT-->>AC: tokenHash

    AC->>DB: SELECT FROM tokens_refresh<br/>WHERE hash AND !revocado AND !expirado
    DB-->>AC: token válido

    alt Token Válido
        AC->>JWT: generarAccessToken()
        JWT-->>AC: nuevo accessToken
        AC-->>C: 200 OK<br/>{access_token}
    else Token Inválido
        AC-->>C: 401 Unauthorized
    end
```

## Flujo de Logout

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente
    participant AC as AuthController
    participant JWT as JWTHandler
    participant L as Logger
    participant DB as Database

    C->>AC: POST /api/auth/logout<br/>Authorization: Bearer {token}<br/>{refresh_token}

    AC->>JWT: hashToken(refreshToken)
    JWT-->>AC: tokenHash

    AC->>DB: UPDATE tokens_refresh<br/>SET revocado = 1
    DB-->>AC: ok

    AC->>L: auth('logout', 'exitoso')
    L->>DB: INSERT log

    AC-->>C: 200 OK<br/>{message: "Sesión cerrada"}
```

## Aspectos de Seguridad

### Password Hashing
```php
// Creación
password_hash($password, PASSWORD_BCRYPT, ['cost' => 12])

// Verificación
password_verify($password, $hash)
```

### JWT (JSON Web Tokens)
- **Algoritmo**: HMAC-SHA256
- **Access Token**: 1 hora de validez
- **Refresh Token**: 7 días de validez
- **Almacenamiento**: Refresh token hasheado con SHA-256

### Control de Intentos
- **Máximo intentos**: 5
- **Tiempo de bloqueo**: 15 minutos
- **Reset automático**: Al login exitoso

### Estructura del Token

```json
{
  "header": {
    "typ": "JWT",
    "alg": "HS256"
  },
  "payload": {
    "iss": "videoteca-api",
    "aud": "videoteca-client",
    "iat": 1700000000,
    "exp": 1700003600,
    "type": "access",
    "user_id": 1,
    "email": "usuario@ejemplo.com",
    "rol": "Docente",
    "nombre": "Juan Pérez"
  }
}
```
