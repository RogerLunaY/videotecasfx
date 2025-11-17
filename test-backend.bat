@echo off
echo ============================================
echo Prueba de Conexion Backend - Videoteca SFX
echo ============================================
echo.

echo [1] Probando conexion al backend...
echo.

REM Probar endpoint de health
echo Endpoint: http://localhost/videotecasfx/backend/api/health
curl -s http://localhost/videotecasfx/backend/api/health
echo.
echo.

REM Probar endpoint de login
echo [2] Probando login con credenciales de prueba...
echo.
echo Endpoint: http://localhost/videotecasfx/backend/api/auth/login
curl -s -X POST http://localhost/videotecasfx/backend/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"vladimir.mamani@atsi.edu.bo\",\"password\":\"Password123!\"}"
echo.
echo.

echo ============================================
echo Pruebas completadas
echo ============================================
echo.

echo Si ves errores 404:
echo - Verifica que Laragon este corriendo
echo - Verifica la ruta del proyecto en Laragon
echo.

echo Si ves errores de base de datos:
echo - Verifica que MySQL este corriendo en Laragon
echo - Verifica que la base de datos videoteca exista
echo - Revisa el archivo backend\.env
echo.

pause
