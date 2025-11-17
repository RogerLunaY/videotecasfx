<?php
/**
 * Script de Migración - Asignaciones de Docentes
 *
 * ⚠️ OBSOLETO - Este archivo ya NO se debe usar
 *
 * Las tablas docente_materias y docente_grados fueron reemplazadas
 * por una tabla unificada 'asignaciones'.
 *
 * Para migrar a la nueva estructura, usar:
 * database/migrations/optimize_asignaciones.sql
 *
 * @deprecated Usar database/migrations/optimize_asignaciones.sql
 */

die("❌ Este script está OBSOLETO. Usar database/migrations/optimize_asignaciones.sql\n");

require_once __DIR__ . '/config/database.php';

try {
    echo "===========================================\n";
    echo "  Migración: Asignaciones de Docentes\n";
    echo "===========================================\n\n";

    // Obtener conexión
    $database = Database::getInstance();
    $conn = $database->getConnection();

    // Leer archivo SQL
    $sqlFile = __DIR__ . '/../database/asignaciones_docentes.sql';

    if (!file_exists($sqlFile)) {
        throw new Exception("Archivo SQL no encontrado: $sqlFile");
    }

    echo "📄 Leyendo archivo: database/asignaciones_docentes.sql\n";
    $sql = file_get_contents($sqlFile);

    // Dividir por statements (separados por ;)
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            // Ignorar comentarios y líneas vacías
            return !empty($stmt) &&
                   strpos($stmt, '--') !== 0 &&
                   strpos($stmt, '/*') !== 0;
        }
    );

    echo "📊 Ejecutando " . count($statements) . " sentencias SQL...\n\n";

    $conn->beginTransaction();

    try {
        foreach ($statements as $index => $statement) {
            $statement = trim($statement);
            if (empty($statement)) continue;

            // Detectar tipo de statement
            $type = 'QUERY';
            if (stripos($statement, 'CREATE TABLE') !== false) {
                $type = 'CREATE TABLE';
                preg_match('/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?/i', $statement, $matches);
                $tableName = $matches[1] ?? 'unknown';
            } elseif (stripos($statement, 'CREATE INDEX') !== false) {
                $type = 'CREATE INDEX';
            } elseif (stripos($statement, 'CREATE VIEW') !== false || stripos($statement, 'CREATE OR REPLACE VIEW') !== false) {
                $type = 'CREATE VIEW';
                preg_match('/CREATE(?:\s+OR\s+REPLACE)?\s+VIEW\s+`?(\w+)`?/i', $statement, $matches);
                $tableName = $matches[1] ?? 'unknown';
            }

            echo "  [$type] ";
            if (isset($tableName)) {
                echo $tableName;
            }
            echo "... ";

            $conn->exec($statement);
            echo "✅\n";
        }

        $conn->commit();

        echo "\n===========================================\n";
        echo "  ✅ Migración completada exitosamente\n";
        echo "===========================================\n\n";

        // Verificar tablas creadas
        echo "📋 Verificando tablas creadas:\n";

        $tables = ['docente_materias', 'docente_grados'];
        foreach ($tables as $table) {
            $stmt = $conn->query("SHOW TABLES LIKE '$table'");
            if ($stmt->rowCount() > 0) {
                echo "  ✅ $table\n";

                // Contar registros
                $count = $conn->query("SELECT COUNT(*) as total FROM $table")->fetch();
                echo "     └─ Registros: {$count['total']}\n";
            } else {
                echo "  ❌ $table (no encontrada)\n";
            }
        }

        // Verificar vista
        $stmt = $conn->query("SHOW FULL TABLES LIKE 'vista_docentes_asignaciones'");
        if ($stmt->rowCount() > 0) {
            echo "  ✅ vista_docentes_asignaciones (VIEW)\n";
        }

        echo "\n";
        echo "🎉 Las tablas de asignaciones están listas para usar.\n";
        echo "   Los administradores ya pueden asignar materias y grados a los docentes.\n\n";

    } catch (Exception $e) {
        $conn->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "   Línea: " . $e->getLine() . "\n";
    echo "   Archivo: " . $e->getFile() . "\n\n";
    exit(1);
}
