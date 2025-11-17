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
 * Clase DocenteAsignacion - Modelo para asignaciones de docentes
 *
 * Maneja la tabla asignaciones que vincula docente + materia + grado
 * Una asignación representa que un docente enseña una materia específica en un grado específico
 */
class DocenteAsignacion
{
    /** @var PDO Conexión a la base de datos */
    private PDO $conn;

    /** @var string Nombre de la tabla */
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
     * Crea una nueva asignación (docente + materia + grado)
     *
     * @param int $docenteId ID del docente
     * @param int $materiaId ID de la materia
     * @param int $gradoId ID del grado
     * @param int $usuarioAsignadorId ID del usuario que asigna
     * @param string $estado Estado de la asignación (activa|inactiva)
     * @return int|false ID de la asignación creada o false si falla
     */
    public function crear(int $docenteId, int $materiaId, int $gradoId, int $usuarioAsignadorId, string $estado = 'activa')
    {
        $query = "INSERT INTO {$this->table}
                  (docente_id, materia_id, grado_id, estado, usuario_asignador_id)
                  VALUES (:docente_id, :materia_id, :grado_id, :estado, :usuario_asignador_id)
                  ON DUPLICATE KEY UPDATE
                    estado = :estado,
                    fecha_asignacion = CURRENT_TIMESTAMP";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':materia_id', $materiaId, PDO::PARAM_INT);
            $stmt->bindParam(':grado_id', $gradoId, PDO::PARAM_INT);
            $stmt->bindParam(':estado', $estado);
            $stmt->bindParam(':usuario_asignador_id', $usuarioAsignadorId, PDO::PARAM_INT);

            if ($stmt->execute()) {
                return (int) $this->conn->lastInsertId();
            }
            return false;
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::crear] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtiene todas las asignaciones de un docente
     *
     * @param int $docenteId ID del docente
     * @param string|null $estado Filtrar por estado (opcional)
     * @return array Array de asignaciones
     */
    public function obtenerPorDocente(int $docenteId, ?string $estado = 'activa'): array
    {
        $query = "SELECT
                    a.*,
                    m.nombre AS materia_nombre,
                    m.sigla AS materia_sigla,
                    m.color AS materia_color,
                    m.icono AS materia_icono,
                    g.nombre AS grado_nombre,
                    g.nivel AS grado_nivel,
                    g.sigla AS grado_sigla,
                    CONCAT(u.nombre, ' ', u.apellido_paterno) AS asignado_por_nombre
                  FROM {$this->table} a
                  INNER JOIN materias m ON a.materia_id = m.id
                  INNER JOIN grados g ON a.grado_id = g.id
                  LEFT JOIN usuarios u ON a.usuario_asignador_id = u.id
                  WHERE a.docente_id = :docente_id";

        if ($estado !== null) {
            $query .= " AND a.estado = :estado";
        }

        $query .= " ORDER BY g.orden, m.nombre";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            if ($estado !== null) {
                $stmt->bindParam(':estado', $estado);
            }
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::obtenerPorDocente] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtiene las materias únicas asignadas a un docente
     *
     * @param int $docenteId ID del docente
     * @return array Array de materias
     */
    public function obtenerMateriasDocente(int $docenteId): array
    {
        $query = "SELECT DISTINCT
                    m.*,
                    GROUP_CONCAT(g.nombre ORDER BY g.orden SEPARATOR ', ') AS grados
                  FROM {$this->table} a
                  INNER JOIN materias m ON a.materia_id = m.id
                  INNER JOIN grados g ON a.grado_id = g.id
                  WHERE a.docente_id = :docente_id AND a.estado = 'activa'
                  GROUP BY m.id
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
     * Obtiene los grados únicos asignados a un docente
     *
     * @param int $docenteId ID del docente
     * @return array Array de grados
     */
    public function obtenerGradosDocente(int $docenteId): array
    {
        $query = "SELECT DISTINCT
                    g.*,
                    GROUP_CONCAT(m.nombre ORDER BY m.nombre SEPARATOR ', ') AS materias
                  FROM {$this->table} a
                  INNER JOIN grados g ON a.grado_id = g.id
                  INNER JOIN materias m ON a.materia_id = m.id
                  WHERE a.docente_id = :docente_id AND a.estado = 'activa'
                  GROUP BY g.id
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
            'asignaciones' => $this->obtenerPorDocente($docenteId),
            'materias' => $this->obtenerMateriasDocente($docenteId),
            'grados' => $this->obtenerGradosDocente($docenteId)
        ];
    }

    /**
     * Verifica si un docente tiene una asignación específica (materia + grado)
     *
     * @param int $docenteId ID del docente
     * @param int $materiaId ID de la materia
     * @param int $gradoId ID del grado
     * @return bool
     */
    public function tieneAsignacion(int $docenteId, int $materiaId, int $gradoId): bool
    {
        $query = "SELECT COUNT(*) as count
                  FROM {$this->table}
                  WHERE docente_id = :docente_id
                    AND materia_id = :materia_id
                    AND grado_id = :grado_id
                    AND estado = 'activa'";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':materia_id', $materiaId, PDO::PARAM_INT);
            $stmt->bindParam(':grado_id', $gradoId, PDO::PARAM_INT);
            $stmt->execute();

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['count'] > 0;
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::tieneAsignacion] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verifica si un docente tiene asignada una materia (en cualquier grado)
     *
     * @param int $docenteId ID del docente
     * @param int $materiaId ID de la materia
     * @return bool
     */
    public function tieneMateria(int $docenteId, int $materiaId): bool
    {
        $query = "SELECT COUNT(*) as count
                  FROM {$this->table}
                  WHERE docente_id = :docente_id
                    AND materia_id = :materia_id
                    AND estado = 'activa'";

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
     * Verifica si un docente tiene asignado un grado (en cualquier materia)
     *
     * @param int $docenteId ID del docente
     * @param int $gradoId ID del grado
     * @return bool
     */
    public function tieneGrado(int $docenteId, int $gradoId): bool
    {
        $query = "SELECT COUNT(*) as count
                  FROM {$this->table}
                  WHERE docente_id = :docente_id
                    AND grado_id = :grado_id
                    AND estado = 'activa'";

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
     * Elimina una asignación específica
     *
     * @param int $docenteId ID del docente
     * @param int $materiaId ID de la materia
     * @param int $gradoId ID del grado
     * @return bool
     */
    public function eliminar(int $docenteId, int $materiaId, int $gradoId): bool
    {
        $query = "DELETE FROM {$this->table}
                  WHERE docente_id = :docente_id
                    AND materia_id = :materia_id
                    AND grado_id = :grado_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':materia_id', $materiaId, PDO::PARAM_INT);
            $stmt->bindParam(':grado_id', $gradoId, PDO::PARAM_INT);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::eliminar] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Actualiza el estado de una asignación
     *
     * @param int $docenteId ID del docente
     * @param int $materiaId ID de la materia
     * @param int $gradoId ID del grado
     * @param string $estado Nuevo estado (activa|inactiva)
     * @return bool
     */
    public function actualizarEstado(int $docenteId, int $materiaId, int $gradoId, string $estado): bool
    {
        $query = "UPDATE {$this->table}
                  SET estado = :estado
                  WHERE docente_id = :docente_id
                    AND materia_id = :materia_id
                    AND grado_id = :grado_id";

        try {
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->bindParam(':materia_id', $materiaId, PDO::PARAM_INT);
            $stmt->bindParam(':grado_id', $gradoId, PDO::PARAM_INT);
            $stmt->bindParam(':estado', $estado);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::actualizarEstado] Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Asigna múltiples combinaciones materia-grado a un docente (reemplaza las existentes)
     *
     * @param int $docenteId ID del docente
     * @param array $asignaciones Array de ['materia_id' => X, 'grado_id' => Y]
     * @param int $usuarioAsignadorId ID del usuario que asigna
     * @return bool
     */
    public function asignarMultiples(int $docenteId, array $asignaciones, int $usuarioAsignadorId): bool
    {
        try {
            $this->conn->beginTransaction();

            // Eliminar asignaciones actuales
            $deleteQuery = "DELETE FROM {$this->table} WHERE docente_id = :docente_id";
            $stmt = $this->conn->prepare($deleteQuery);
            $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
            $stmt->execute();

            // Insertar nuevas asignaciones
            if (!empty($asignaciones)) {
                $insertQuery = "INSERT INTO {$this->table}
                               (docente_id, materia_id, grado_id, usuario_asignador_id, estado)
                               VALUES (:docente_id, :materia_id, :grado_id, :usuario_asignador_id, 'activa')";
                $stmt = $this->conn->prepare($insertQuery);

                foreach ($asignaciones as $asignacion) {
                    $stmt->bindParam(':docente_id', $docenteId, PDO::PARAM_INT);
                    $stmt->bindParam(':materia_id', $asignacion['materia_id'], PDO::PARAM_INT);
                    $stmt->bindParam(':grado_id', $asignacion['grado_id'], PDO::PARAM_INT);
                    $stmt->bindParam(':usuario_asignador_id', $usuarioAsignadorId, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("[DocenteAsignacion::asignarMultiples] Error: " . $e->getMessage());
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

    /**
     * Obtiene todas las asignaciones activas
     *
     * @return array
     */
    public function obtenerTodas(?string $estado = 'activa'): array
    {
        $query = "SELECT
                    a.*,
                    CONCAT(u.nombre, ' ', u.apellido_paterno) AS docente_nombre,
                    m.nombre AS materia_nombre,
                    m.sigla AS materia_sigla,
                    g.nombre AS grado_nombre,
                    g.nivel AS grado_nivel
                  FROM {$this->table} a
                  INNER JOIN usuarios u ON a.docente_id = u.id
                  INNER JOIN materias m ON a.materia_id = m.id
                  INNER JOIN grados g ON a.grado_id = g.id";

        if ($estado !== null) {
            $query .= " WHERE a.estado = :estado";
        }

        $query .= " ORDER BY u.apellido_paterno, u.nombre, g.orden, m.nombre";

        try {
            $stmt = $this->conn->prepare($query);
            if ($estado !== null) {
                $stmt->bindParam(':estado', $estado);
            }
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("[DocenteAsignacion::obtenerTodas] Error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * MÉTODOS DE COMPATIBILIDAD CON VERSIÓN ANTERIOR
     * Estos métodos mantienen compatibilidad con el código que usaba las tablas separadas
     */

    /**
     * @deprecated Usar crear() con materia_id y grado_id
     */
    public function asignarMateria(int $docenteId, int $materiaId, int $asignadoPor): bool
    {
        error_log("[DocenteAsignacion::asignarMateria] DEPRECATED: Use crear() con grado_id");
        return false;
    }

    /**
     * @deprecated Usar crear() con materia_id y grado_id
     */
    public function asignarGrado(int $docenteId, int $gradoId, int $asignadoPor): bool
    {
        error_log("[DocenteAsignacion::asignarGrado] DEPRECATED: Use crear() con materia_id");
        return false;
    }

    /**
     * @deprecated Usar eliminar() con materia_id y grado_id
     */
    public function desasignarMateria(int $docenteId, int $materiaId): bool
    {
        error_log("[DocenteAsignacion::desasignarMateria] DEPRECATED: Use eliminar() con grado_id");
        return false;
    }

    /**
     * @deprecated Usar eliminar() con materia_id y grado_id
     */
    public function desasignarGrado(int $docenteId, int $gradoId): bool
    {
        error_log("[DocenteAsignacion::desasignarGrado] DEPRECATED: Use eliminar() con materia_id");
        return false;
    }

    /**
     * @deprecated Usar asignarMultiples()
     */
    public function asignarMaterias(int $docenteId, array $materiaIds, int $asignadoPor): bool
    {
        error_log("[DocenteAsignacion::asignarMaterias] DEPRECATED: Use asignarMultiples()");
        return false;
    }

    /**
     * @deprecated Usar asignarMultiples()
     */
    public function asignarGrados(int $docenteId, array $gradoIds, int $asignadoPor): bool
    {
        error_log("[DocenteAsignacion::asignarGrados] DEPRECATED: Use asignarMultiples()");
        return false;
    }
}
