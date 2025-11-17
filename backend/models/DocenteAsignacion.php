<?php
/**
 * Modelo DocenteAsignacion
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 2.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase DocenteAsignacion - Modelo para asignaciones de materias y grados a docentes
 *
 * Versión 2.0: Tabla unificada 'asignaciones' que consolida materias y grados
 */
class DocenteAsignacion
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Tabla de asignaciones */
    private string $table = 'asignaciones';

    /**
     * Constructor
     */
    public function __construct()
    {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Asigna recursos (materias o grados) a un docente
     *
     * @param int $docenteId ID del docente
     * @param string $tipo Tipo de recurso ('materia' o 'grado')
     * @param array $recursoIds Array de IDs de recursos
     * @param int $asignadoPor ID del admin que asigna
     * @return bool
     */
    public function asignarRecursos(int $docenteId, string $tipo, array $recursoIds, int $asignadoPor): bool
    {
        if (!in_array($tipo, ['materia', 'grado'])) {
            error_log("[DocenteAsignacion::asignarRecursos] Tipo inválido: {$tipo}");
            return false;
        }

        try {
            $this->conn->beginTransaction();

            // Eliminar asignaciones actuales de este tipo
            $deleteQuery = "DELETE FROM {$this->table}
                           WHERE docente_id = :docente_id AND tipo = :tipo";
            $stmt = $this->conn->prepare($deleteQuery);
            $stmt->bindValue(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindValue(':tipo', $tipo, PDO::PARAM_STR);
            $stmt->execute();

            // Insertar nuevas asignaciones
            if (!empty($recursoIds)) {
                $insertQuery = "INSERT INTO {$this->table}
                               (docente_id, tipo, recurso_id, asignado_por)
                               VALUES (:docente_id, :tipo, :recurso_id, :asignado_por)";
                $stmt = $this->conn->prepare($insertQuery);

                foreach ($recursoIds as $recursoId) {
                    $stmt->bindValue(':docente_id', $docenteId, PDO::PARAM_INT);
                    $stmt->bindValue(':tipo', $tipo, PDO::PARAM_STR);
                    $stmt->bindValue(':recurso_id', $recursoId, PDO::PARAM_INT);
                    $stmt->bindValue(':asignado_por', $asignadoPor, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("[DocenteAsignacion::asignarRecursos] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Asigna múltiples materias a un docente (reemplaza las existentes)
     *
     * @param int $docenteId ID del docente
     * @param array $materiaIds Array de IDs de materias
     * @param int $asignadoPor ID del admin que asigna
     * @return bool
     */
    public function asignarMaterias(int $docenteId, array $materiaIds, int $asignadoPor): bool
    {
        return $this->asignarRecursos($docenteId, 'materia', $materiaIds, $asignadoPor);
    }

    /**
     * Asigna múltiples grados a un docente (reemplaza los existentes)
     *
     * @param int $docenteId ID del docente
     * @param array $gradoIds Array de IDs de grados
     * @param int $asignadoPor ID del admin que asigna
     * @return bool
     */
    public function asignarGrados(int $docenteId, array $gradoIds, int $asignadoPor): bool
    {
        return $this->asignarRecursos($docenteId, 'grado', $gradoIds, $asignadoPor);
    }

    /**
     * Obtiene todas las materias asignadas a un docente
     *
     * @param int $docenteId ID del docente
     * @return array
     */
    public function obtenerMateriasDocente(int $docenteId): array
    {
        $query = "SELECT
                    m.*,
                    a.fecha_asignacion
                  FROM materias m
                  INNER JOIN {$this->table} a ON m.id = a.recurso_id
                  WHERE a.docente_id = :docente_id
                    AND a.tipo = 'materia'
                  ORDER BY m.nombre";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::obtenerMateriasDocente] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene todos los grados asignados a un docente
     *
     * @param int $docenteId ID del docente
     * @return array
     */
    public function obtenerGradosDocente(int $docenteId): array
    {
        $query = "SELECT
                    g.*,
                    a.fecha_asignacion
                  FROM grados g
                  INNER JOIN {$this->table} a ON g.id = a.recurso_id
                  WHERE a.docente_id = :docente_id
                    AND a.tipo = 'grado'
                  ORDER BY g.orden";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::obtenerGradosDocente] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene las asignaciones completas de un docente
     *
     * @param int $docenteId ID del docente
     * @return array
     */
    public function obtenerAsignacionesDocente(int $docenteId): array
    {
        return [
            'materias' => $this->obtenerMateriasDocente($docenteId),
            'grados' => $this->obtenerGradosDocente($docenteId)
        ];
    }

    /**
     * Verifica si un docente tiene asignada una materia
     *
     * @param int $docenteId ID del docente
     * @param int $materiaId ID de la materia
     * @return bool
     */
    public function tieneMateria(int $docenteId, int $materiaId): bool
    {
        return $this->tieneRecurso($docenteId, 'materia', $materiaId);
    }

    /**
     * Verifica si un docente tiene asignado un grado
     *
     * @param int $docenteId ID del docente
     * @param int $gradoId ID del grado
     * @return bool
     */
    public function tieneGrado(int $docenteId, int $gradoId): bool
    {
        return $this->tieneRecurso($docenteId, 'grado', $gradoId);
    }

    /**
     * Verifica si un docente tiene asignado un recurso específico
     *
     * @param int $docenteId ID del docente
     * @param string $tipo Tipo de recurso ('materia' o 'grado')
     * @param int $recursoId ID del recurso
     * @return bool
     */
    private function tieneRecurso(int $docenteId, string $tipo, int $recursoId): bool
    {
        $query = "SELECT COUNT(*) as count
                  FROM {$this->table}
                  WHERE docente_id = :docente_id
                    AND tipo = :tipo
                    AND recurso_id = :recurso_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindValue(':tipo', $tipo, PDO::PARAM_STR);
            $stmt->bindValue(':recurso_id', $recursoId, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] > 0;
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::tieneRecurso] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene todos los docentes con sus asignaciones
     *
     * @return array
     */
    public function obtenerTodosConAsignaciones(): array
    {
        $query = "SELECT
                    u.id,
                    CONCAT(u.nombre, ' ', u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) as nombre_completo,
                    u.email,
                    u.ci,
                    GROUP_CONCAT(DISTINCT CASE WHEN a.tipo = 'materia' THEN m.nombre END ORDER BY m.nombre SEPARATOR ', ') as materias_asignadas,
                    GROUP_CONCAT(DISTINCT CASE WHEN a.tipo = 'grado' THEN g.nombre END ORDER BY g.orden SEPARATOR ', ') as grados_asignados,
                    COUNT(DISTINCT CASE WHEN a.tipo = 'materia' THEN a.id END) as total_materias,
                    COUNT(DISTINCT CASE WHEN a.tipo = 'grado' THEN a.id END) as total_grados
                  FROM usuarios u
                  INNER JOIN roles r ON u.rol_id = r.id
                  LEFT JOIN {$this->table} a ON u.id = a.docente_id
                  LEFT JOIN materias m ON a.tipo = 'materia' AND a.recurso_id = m.id
                  LEFT JOIN grados g ON a.tipo = 'grado' AND a.recurso_id = g.id
                  WHERE r.nombre = 'Docente' AND u.estado = 'activo'
                  GROUP BY u.id, u.nombre, u.apellido_paterno, u.apellido_materno, u.email, u.ci
                  ORDER BY nombre_completo";

        try {
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::obtenerTodosConAsignaciones] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene estadísticas de asignaciones
     *
     * @return array
     */
    public function obtenerEstadisticas(): array
    {
        $query = "SELECT
                    COUNT(DISTINCT docente_id) as total_docentes,
                    COUNT(DISTINCT CASE WHEN tipo = 'materia' THEN id END) as total_asignaciones_materias,
                    COUNT(DISTINCT CASE WHEN tipo = 'grado' THEN id END) as total_asignaciones_grados,
                    COUNT(*) as total_asignaciones
                  FROM {$this->table}";

        try {
            $stmt = $this->conn->query($query);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: [];
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::obtenerEstadisticas] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Elimina todas las asignaciones de un docente
     *
     * @param int $docenteId ID del docente
     * @return bool
     */
    public function eliminarAsignacionesDocente(int $docenteId): bool
    {
        $query = "DELETE FROM {$this->table} WHERE docente_id = :docente_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':docente_id', $docenteId, PDO::PARAM_INT);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::eliminarAsignacionesDocente] Error: " . $e->getMessage());
            return false;
        }
    }
}
