<?php
/**
 * Modelo DocenteAsignacion
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 *
 * @author Roger Omar Luna Yujra
 * @version 1.0.0
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Clase DocenteAsignacion - Modelo para asignaciones de materias y grados a docentes
 *
 * Maneja las relaciones N:M entre docentes y materias/grados
 */
class DocenteAsignacion
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /**
     * Constructor
     */
    public function __construct()
    {
        $database = Database::getInstance();
        $this->conn = $database->getConnection();
    }

    /**
     * Asigna una materia a un docente
     *
     * @param int $docenteId ID del docente
     * @param int $materiaId ID de la materia
     * @param int $asignadoPor ID del admin que asigna
     * @return bool
     */
    public function asignarMateria(int $docenteId, int $materiaId, int $asignadoPor): bool
    {
        $query = "INSERT INTO docente_materias (docente_id, materia_id, asignado_por)
                  VALUES (:docente_id, :materia_id, :asignado_por)
                  ON DUPLICATE KEY UPDATE fecha_asignacion = CURRENT_TIMESTAMP";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':materia_id', $materiaId, PDO::PARAM_INT);
            $stmt->bindParam(':asignado_por', $asignadoPor, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::asignarMateria] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Desasigna una materia de un docente
     *
     * @param int $docenteId ID del docente
     * @param int $materiaId ID de la materia
     * @return bool
     */
    public function desasignarMateria(int $docenteId, int $materiaId): bool
    {
        $query = "DELETE FROM docente_materias
                  WHERE docente_id = :docente_id AND materia_id = :materia_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':materia_id', $materiaId, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::desasignarMateria] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Asigna un grado a un docente
     *
     * @param int $docenteId ID del docente
     * @param int $gradoId ID del grado
     * @param int $asignadoPor ID del admin que asigna
     * @return bool
     */
    public function asignarGrado(int $docenteId, int $gradoId, int $asignadoPor): bool
    {
        $query = "INSERT INTO docente_grados (docente_id, grado_id, asignado_por)
                  VALUES (:docente_id, :grado_id, :asignado_por)
                  ON DUPLICATE KEY UPDATE fecha_asignacion = CURRENT_TIMESTAMP";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':grado_id', $gradoId, PDO::PARAM_INT);
            $stmt->bindParam(':asignado_por', $asignadoPor, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::asignarGrado] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Desasigna un grado de un docente
     *
     * @param int $docenteId ID del docente
     * @param int $gradoId ID del grado
     * @return bool
     */
    public function desasignarGrado(int $docenteId, int $gradoId): bool
    {
        $query = "DELETE FROM docente_grados
                  WHERE docente_id = :docente_id AND grado_id = :grado_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':grado_id', $gradoId, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::desasignarGrado] Error: " . $e->getMessage());
            return false;
        }
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
                    dm.fecha_asignacion
                  FROM materias m
                  INNER JOIN docente_materias dm ON m.id = dm.materia_id
                  WHERE dm.docente_id = :docente_id
                  ORDER BY m.nombre";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
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
                    dg.fecha_asignacion
                  FROM grados g
                  INNER JOIN docente_grados dg ON g.id = dg.grado_id
                  WHERE dg.docente_id = :docente_id
                  ORDER BY g.orden";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
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
        $query = "SELECT COUNT(*) as count
                  FROM docente_materias
                  WHERE docente_id = :docente_id AND materia_id = :materia_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':materia_id', $materiaId, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] > 0;
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::tieneMateria] Error: " . $e->getMessage());
            return false;
        }
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
        $query = "SELECT COUNT(*) as count
                  FROM docente_grados
                  WHERE docente_id = :docente_id AND grado_id = :grado_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':grado_id', $gradoId, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] > 0;
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::tieneGrado] Error: " . $e->getMessage());
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
        try {
            $this->conn->beginTransaction();

            // Eliminar asignaciones actuales
            $deleteQuery = "DELETE FROM docente_materias WHERE docente_id = :docente_id";
            $stmt = $this->conn->prepare($deleteQuery);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->execute();

            // Insertar nuevas asignaciones
            if (!empty($materiaIds)) {
                $insertQuery = "INSERT INTO docente_materias (docente_id, materia_id, asignado_por)
                               VALUES (:docente_id, :materia_id, :asignado_por)";
                $stmt = $this->conn->prepare($insertQuery);

                foreach ($materiaIds as $materiaId) {
                    $stmt->bindValue(':docente_id', $docenteId, PDO::PARAM_INT);
                    $stmt->bindValue(':materia_id', $materiaId, PDO::PARAM_INT);
                    $stmt->bindValue(':asignado_por', $asignadoPor, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("[DocenteAsignacion::asignarMaterias] Error: " . $e->getMessage());
            return false;
        }
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
        try {
            $this->conn->beginTransaction();

            // Eliminar asignaciones actuales
            $deleteQuery = "DELETE FROM docente_grados WHERE docente_id = :docente_id";
            $stmt = $this->conn->prepare($deleteQuery);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->execute();

            // Insertar nuevas asignaciones
            if (!empty($gradoIds)) {
                $insertQuery = "INSERT INTO docente_grados (docente_id, grado_id, asignado_por)
                               VALUES (:docente_id, :grado_id, :asignado_por)";
                $stmt = $this->conn->prepare($insertQuery);

                foreach ($gradoIds as $gradoId) {
                    $stmt->bindValue(':docente_id', $docenteId, PDO::PARAM_INT);
                    $stmt->bindValue(':grado_id', $gradoId, PDO::PARAM_INT);
                    $stmt->bindValue(':asignado_por', $asignadoPor, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("[DocenteAsignacion::asignarGrados] Error: " . $e->getMessage());
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
        $query = "SELECT * FROM vista_docentes_asignaciones ORDER BY nombre_completo";

        try {
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::obtenerTodosConAsignaciones] Error: " . $e->getMessage());
            return [];
        }
    }
}
