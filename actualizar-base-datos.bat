@echo off
echo ============================================
echo Actualizador de Base de Datos - Videoteca SFX
echo ============================================
echo.

echo Este script creara/actualizara la base de datos "videoteca"
echo.
echo ATENCION: Si la base de datos ya existe, se eliminara y recreara.
echo.

set /p confirmar="Deseas continuar? (S/N): "

if /i not "%confirmar%"=="S" (
    echo.
    echo Actualizacion cancelada.
    pause
    exit /b
)

echo.
echo ============================================
echo Actualizando base de datos...
echo ============================================
echo.

REM Verificar archivos SQL
if not exist "database\schema.sql" (
    echo ERROR: No se encuentra database\schema.sql
    pause
    exit /b 1
)

if not exist "database\seed_data.sql" (
    echo ERROR: No se encuentra database\seed_data.sql
    pause
    exit /b 1
)

REM Buscar mysql en Laragon
set MYSQL_PATH=C:\laragon\bin\mysql\mysql-8.0.30\bin\mysql.exe

if not exist "%MYSQL_PATH%" (
    set MYSQL_PATH=C:\laragon\bin\mysql\mysql-5.7.24\bin\mysql.exe
)

if not exist "%MYSQL_PATH%" (
    set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
)

if not exist "%MYSQL_PATH%" (
    echo.
    echo No se pudo encontrar mysql automaticamente.
    echo.
    echo Por favor, ejecuta manualmente en HeidiSQL o phpMyAdmin:
    echo.
    echo 1. Ejecutar: database\schema.sql
    echo    (Esto creara la base de datos "videoteca" y todas las tablas)
    echo.
    echo 2. Ejecutar: database\seed_data.sql
    echo    (Esto cargara los datos iniciales)
    echo.
    pause
    exit /b
)

echo [1/2] Creando estructura de base de datos...
echo.
"%MYSQL_PATH%" -u root < database\schema.sql

if %errorlevel% neq 0 (
    echo ERROR: Fallo al crear la estructura
    pause
    exit /b 1
)

echo OK - Estructura creada
echo.

echo [2/2] Importando datos iniciales...
echo.
"%MYSQL_PATH%" -u root videoteca < database\seed_data.sql

if %errorlevel% neq 0 (
    echo ERROR: Fallo al importar datos
    pause
    exit /b 1
)

echo OK - Datos importados
echo.

echo ============================================
echo ACTUALIZACION EXITOSA
echo ============================================
echo.
echo Base de datos "videoteca" creada y actualizada con:
echo.
echo - Estructura completa (tablas, indices, relaciones)
echo - Roles: Administrador, Docente
echo - Grados: 1ro a 6to de Secundaria
echo - Campos: 4 areas de conocimiento
echo - Materias: 12 materias del curriculo boliviano
echo - Temas: 24 temas organizados por materia
echo - Usuarios: 12 usuarios de prueba (2 admins, 10 docentes)
echo - Videos: 20 videos de ejemplo
echo.
echo ============================================
echo CREDENCIALES DE ACCESO
echo ============================================
echo.
echo ADMINISTRADOR:
echo   Email: vladimir.mamani@atsi.edu.bo
echo   Password: Password123!
echo.
echo DOCENTE:
echo   Email: juan.perez@sfx.edu.bo
echo   Password: Password123!
echo.
echo ============================================
echo.
echo Ahora puedes:
echo 1. Iniciar el backend (Laragon Start All)
echo 2. Iniciar el frontend (npm run dev)
echo 3. Acceder a: http://videoteca.test
echo.

pause
