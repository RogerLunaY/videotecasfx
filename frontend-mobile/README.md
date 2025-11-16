# 📱 App Móvil - Videoteca SFX

Aplicación móvil para el Sistema de Biblioteca Digital de Videos Educativos de la **U.E. San Francisco Xavier**.

## 🛠️ Tecnologías

- **React Native** - Framework móvil
- **Expo** - Toolchain y SDK
- **React Navigation** - Navegación entre pantallas
- **Expo AV** - Reproductor de video
- **Axios** - Cliente HTTP
- **AsyncStorage** - Almacenamiento local

## 📋 Requisitos

- **Node.js** 18+ y npm
- **Expo CLI** (se instala automáticamente con npm)
- **Expo Go App** (para testing en dispositivo físico)
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
cd frontend-mobile
npm install
```

### 2. Configurar API URL

El archivo `app.json` ya tiene configurada la URL del backend:

```json
"extra": {
  "apiUrl": "http://videotecasfx.test/api"
}
```

**IMPORTANTE para Android:**
- Si pruebas en emulador Android, usar: `http://10.0.2.2/videotecasfx/backend/api`
- Si pruebas en dispositivo físico, usar la IP local de tu PC (ej: `http://192.168.1.100/videotecasfx/backend/api`)

### 3. Ejecutar la App

```bash
# Iniciar el servidor de desarrollo
npm start

# O directamente en Android/iOS
npm run android
npm run ios
```

## 📱 Probar en Dispositivo Físico

1. **Instalar Expo Go** en tu teléfono (App Store o Google Play)
2. **Ejecutar** `npm start`
3. **Escanear el QR** que aparece en la terminal con:
   - **iOS**: Cámara del iPhone
   - **Android**: App Expo Go

4. **Importante**: Tu teléfono y tu PC deben estar en la **misma red WiFi**

## 📱 Probar en Emulador

### Android (Windows/Mac/Linux)

1. Instalar **Android Studio**
2. Configurar un **Android Virtual Device (AVD)**
3. Ejecutar: `npm run android`

### iOS (Solo Mac)

1. Instalar **Xcode** desde App Store
2. Instalar Command Line Tools
3. Ejecutar: `npm run ios`

## 🔐 Credenciales de Prueba

La app viene con credenciales precargadas en la pantalla de login:

**Administrador:**
- Email: `vladimir.mamani@atsi.edu.bo`
- Password: `Password123!`

**Docente:**
- Email: `juan.perez@sfx.edu.bo`
- Password: `Password123!`

## 📂 Estructura del Proyecto

```
frontend-mobile/
├── App.js                    # Punto de entrada principal
├── app.json                  # Configuración de Expo
├── package.json              # Dependencias
├── babel.config.js           # Configuración de Babel
├── src/
│   ├── components/           # Componentes reutilizables
│   │   └── VideoCard.js      # Tarjeta de video
│   ├── context/              # Contextos de React
│   │   └── AuthContext.js    # Contexto de autenticación
│   ├── navigation/           # Configuración de navegación
│   │   └── AppNavigator.js   # Navegador principal
│   ├── screens/              # Pantallas de la app
│   │   ├── LoginScreen.js    # Pantalla de login
│   │   ├── HomeScreen.js     # Pantalla de inicio
│   │   ├── VideosScreen.js   # Catálogo de videos
│   │   ├── VideoDetailScreen.js  # Detalle y reproductor
│   │   ├── ProfileScreen.js  # Perfil de usuario
│   │   └── LoadingScreen.js  # Pantalla de carga
│   └── services/             # Servicios de API
│       ├── api.js            # Configuración de Axios
│       ├── authService.js    # Servicio de autenticación
│       └── videoService.js   # Servicio de videos
└── assets/                   # Imágenes, iconos, fonts
```

## ✨ Funcionalidades

### Autenticación
- ✅ Login con email y contraseña
- ✅ Persistencia de sesión con AsyncStorage
- ✅ Auto-refresh de tokens JWT
- ✅ Logout seguro

### Navegación
- ✅ Tab navigation (Inicio, Videos, Perfil)
- ✅ Stack navigation para detalles
- ✅ Navegación condicional según autenticación

### Videos
- ✅ Lista de videos con paginación
- ✅ Búsqueda de videos
- ✅ Videos populares y recientes
- ✅ Reproductor de video nativo
- ✅ Detalles completos del video
- ✅ Filtros por materia y grado

### Perfil
- ✅ Información del usuario
- ✅ Cerrar sesión
- ✅ Configuraciones

## 🎨 Diseño

- **Sistema de diseño**: Tailwind-inspired colors
- **Colores primarios**:
  - Primary: `#2563eb` (Blue 600)
  - Secondary: `#64748b` (Slate 500)
  - Success: `#10b981` (Green 500)
  - Danger: `#ef4444` (Red 500)
- **Tipografía**: Sistema nativo (San Francisco en iOS, Roboto en Android)
- **Iconos**: Ionicons de Expo
- **Espaciado**: Sistema de 4px (4, 8, 12, 16, 20, 24...)

## 📦 Build para Producción

### Android APK

```bash
# Build de desarrollo
expo build:android -t apk

# Build para producción (requiere cuenta Expo)
expo build:android -t app-bundle
```

### iOS IPA

```bash
# Build para producción (requiere cuenta Apple Developer)
expo build:ios
```

## 🔧 Solución de Problemas

### Error de red / Cannot connect

1. **Verificar que el backend esté corriendo**
2. **Verificar la URL en `app.json`:**
   - Emulador Android: `http://10.0.2.2/...`
   - Dispositivo físico: IP local de tu PC `http://192.168.1.X/...`
3. **Verificar que estén en la misma red WiFi** (dispositivo físico)

### Videos no se reproducen

1. Verificar que el backend sirva el video correctamente
2. Verificar permisos de red en el dispositivo
3. Probar con un video más pequeño primero

### La app no carga en Expo Go

1. Cerrar y volver a abrir Expo Go
2. Ejecutar `npm start -- --clear`
3. Reinstalar dependencias: `rm -rf node_modules && npm install`

## 📱 Capturas de Pantalla

(Agregar capturas de pantalla de la app)

## 👨‍💻 Desarrollo

- **Desarrollador**: Roger Omar Luna Yujra (CI: 6734278 LP)
- **Tutor**: Lic. Vladimir Mamani
- **Institución**: Instituto Técnico ATSI Bolivia
- **Beneficiario**: U.E. San Francisco Xavier - Okinawa Uno, Bolivia

## 📄 Licencia

Sistema desarrollado para U.E. San Francisco Xavier - Okinawa Uno, Bolivia
© 2024 Todos los derechos reservados
