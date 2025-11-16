@echo off
REM Script de diagnóstico para Videoteca SFX
echo ============================================
echo Diagnóstico del Frontend - Videoteca SFX
echo ============================================
echo.

REM Mostrar directorio actual
echo [1] Directorio actual:
cd
echo.

REM Verificar si existe package.json
echo [2] Verificando package.json...
if exist package.json (
    echo ✓ package.json encontrado
) else (
    echo ✗ package.json NO encontrado
    echo.
    echo ERROR: No estás en el directorio correcto del frontend
    echo.
    echo Por favor ejecuta:
    echo cd C:\laragon\www\videotecasfx\frontend-web
    echo.
    pause
    exit /b 1
)
echo.

REM Verificar si existe node_modules
echo [3] Verificando node_modules...
if exist node_modules (
    echo ✓ node_modules encontrado
) else (
    echo ✗ node_modules NO encontrado
    echo Necesitas ejecutar: npm install
)
echo.

REM Verificar si existe index.html
echo [4] Verificando index.html...
if exist index.html (
    echo ✓ index.html encontrado
) else (
    echo ✗ index.html NO encontrado
)
echo.

REM Verificar si existe src/main.jsx
echo [5] Verificando src/main.jsx...
if exist src\main.jsx (
    echo ✓ src/main.jsx encontrado
) else (
    echo ✗ src/main.jsx NO encontrado
)
echo.

REM Verificar versión de Node
echo [6] Versión de Node.js:
node --version
echo.

REM Verificar versión de npm
echo [7] Versión de npm:
npm --version
echo.

echo ============================================
echo Diagnóstico completado
echo ============================================
echo.

REM Preguntar si desea limpiar e instalar
echo ¿Deseas limpiar node_modules y reinstalar? (S/N)
set /p respuesta=

if /i "%respuesta%"=="S" (
    echo.
    echo Limpiando node_modules...
    if exist node_modules rmdir /s /q node_modules
    if exist package-lock.json del package-lock.json

    echo.
    echo Instalando dependencias...
    npm install

    echo.
    echo ✓ Instalación completada
    echo.
    echo Ahora ejecuta: npm run dev
) else (
    echo.
    echo Instalación cancelada
)

echo.
pause
