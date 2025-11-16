@echo off
echo ============================================
echo Importador de Datos - Videoteca SFX
echo ============================================
echo.

echo Este script importara los datos de prueba a la base de datos.
echo.
echo Datos que se importaran:
echo - 12 usuarios (2 admins, 10 docentes)
echo - 20 videos de prueba
echo - 12 materias
echo - 6 grados
echo - 24 temas
echo.

set /p confirmar="Deseas continuar? (S/N): "

if /i not "%confirmar%"=="S" (
    echo.
    echo Importacion cancelada.
    pause
    exit /b
)

echo.
echo ============================================
echo Importando datos...
echo ============================================
echo.

REM Verificar si existe el archivo seed_data.sql
if not exist "database\seed_data.sql" (
    echo ERROR: No se encuentra el archivo database\seed_data.sql
    echo.
    echo Verifica que estas en el directorio correcto:
    echo C:\laragon\www\videotecasfx
    echo.
    pause
    exit /b 1
)

REM Intentar importar con mysql desde Laragon
echo [1/2] Importando datos de prueba...
echo.

REM Ruta de mysql en Laragon
set MYSQL_PATH=C:\laragon\bin\mysql\mysql-8.0.30\bin\mysql.exe

REM Verificar si mysql existe
if not exist "%MYSQL_PATH%" (
    echo Buscando mysql en rutas alternativas...
    set MYSQL_PATH=C:\laragon\bin\mysql\mysql-5.7.24\bin\mysql.exe
)

if not exist "%MYSQL_PATH%" (
    echo.
    echo No se pudo encontrar mysql automaticamente.
    echo.
    echo Por favor, importa manualmente:
    echo 1. Abre http://localhost/phpmyadmin
    echo 2. Selecciona base de datos: videoteca_sfx
    echo 3. Click en Importar
    echo 4. Selecciona archivo: database\seed_data.sql
    echo 5. Click en Continuar
    echo.
    pause
    exit /b
)

echo Ejecutando importacion...
"%MYSQL_PATH%" -u root videoteca_sfx < database\seed_data.sql

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo IMPORTACION EXITOSA
    echo ============================================
    echo.
    echo Datos importados correctamente:
    echo - 12 usuarios creados
    echo - 20 videos de prueba agregados
    echo - Materias, grados y temas configurados
    echo.
    echo Credenciales de prueba:
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
    echo Ahora puedes hacer login en:
    echo http://localhost:5173
    echo.
) else (
    echo.
    echo ============================================
    echo ERROR EN LA IMPORTACION
    echo ============================================
    echo.
    echo Por favor, importa manualmente usando phpMyAdmin:
    echo.
    echo 1. Abre: http://localhost/phpmyadmin
    echo 2. Selecciona base de datos: videoteca_sfx
    echo 3. Click en pestana "Importar"
    echo 4. Click en "Elegir archivo"
    echo 5. Selecciona: database\seed_data.sql
    echo 6. Click en "Continuar"
    echo.
)

pause
