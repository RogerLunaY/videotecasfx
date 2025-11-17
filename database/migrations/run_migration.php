#!/usr/bin/env php
<?php
/**
 * Script para ejecutar la migración de optimización de asignaciones
 * Ejecutar desde línea de comandos: php run_migration.php
 */

// Cargar configuración de base de datos
require_once __DIR__ . '/../../backend/config/database.php';

echo "==============================================\n";
echo "Migración: Optimizar tablas de asignaciones\n";
echo "==============================================\n\n";

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Leer archivo SQL de migración
    $sqlFile = __DIR__ . '/optimize_asignaciones.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("No se encontró el archivo de migración: {$sqlFile}");
    }

    $sql = file_get_contents($sqlFile);

    echo "1. Iniciando migración...\n";

    // Deshabilitar comprobación de claves foráneas temporalmente
    $conn->exec("SET FOREIGN_KEY_CHECKS=0");

    // Separar statements SQL (dividir por punto y coma, pero ignorando comentarios)
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            // Ignorar statements vacíos y comentarios
            return !empty($stmt) &&
                   !preg_match('/^\s*--/', $stmt) &&
                   !preg_match('/^\s*\/\*/', $stmt);
        }
    );

    $executedCount = 0;

    foreach ($statements as $statement) {
        if (empty(trim($statement))) continue;

        try {
            // Ejecutar statement
            $conn->exec($statement);
            $executedCount++;

            // Mostrar progreso para operaciones importantes
            if (stripos($statement, 'CREATE TABLE') !== false) {
                echo "   ✓ Tabla 'asignaciones' creada\n";
            } elseif (stripos($statement, 'INSERT INTO asignaciones') !== false && stripos($statement, 'docente_materias') !== false) {
                $result = $conn->query("SELECT COUNT(*) as count FROM asignaciones WHERE tipo = 'materia'");
                $row = $result->fetch(PDO::FETCH_ASSOC);
                echo "   ✓ Migradas {$row['count']} asignaciones de materias\n";
            } elseif (stripos($statement, 'INSERT INTO asignaciones') !== false && stripos($statement, 'docente_grados') !== false) {
                $result = $conn->query("SELECT COUNT(*) as count FROM asignaciones WHERE tipo = 'grado'");
                $row = $result->fetch(PDO::FETCH_ASSOC);
                echo "   ✓ Migradas {$row['count']} asignaciones de grados\n";
            } elseif (stripos($statement, 'DROP TABLE') !== false) {
                if (stripos($statement, 'docente_materias') !== false) {
                    echo "   ✓ Tabla 'docente_materias' eliminada\n";
                } elseif (stripos($statement, 'docente_grados') !== false) {
                    echo "   ✓ Tabla 'docente_grados' eliminada\n";
                }
            }
        } catch (PDOException $e) {
            // Si es error de tabla ya existe, continuar
            if (strpos($e->getMessage(), 'already exists') === false &&
                strpos($e->getMessage(), "doesn't exist") === false) {
                throw $e;
            }
        }
    }

    // Reactivar comprobación de claves foráneas
    $conn->exec("SET FOREIGN_KEY_CHECKS=1");

    echo "\n2. Verificando migración...\n";

    // Verificar resultados
    $result = $conn->query("
        SELECT
            COUNT(*) as total_asignaciones,
            SUM(CASE WHEN tipo = 'materia' THEN 1 ELSE 0 END) as total_materias,
            SUM(CASE WHEN tipo = 'grado' THEN 1 ELSE 0 END) as total_grados
        FROM asignaciones
    ");
    $stats = $result->fetch(PDO::FETCH_ASSOC);

    echo "   Total asignaciones: {$stats['total_asignaciones']}\n";
    echo "   - Materias: {$stats['total_materias']}\n";
    echo "   - Grados: {$stats['total_grados']}\n";

    // Verificar que las tablas antiguas no existan
    $tables = $conn->query("SHOW TABLES LIKE 'docente_%'")->fetchAll(PDO::FETCH_COLUMN);
    if (empty($tables)) {
        echo "   ✓ Tablas antiguas eliminadas correctamente\n";
    } else {
        echo "   ⚠ Advertencia: Aún existen tablas docente_*: " . implode(', ', $tables) . "\n";
    }

    echo "\n==============================================\n";
    echo "✓ Migración completada exitosamente\n";
    echo "==============================================\n";

    exit(0);

} catch (Exception $e) {
    echo "\n✗ Error en la migración: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
