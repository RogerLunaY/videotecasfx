/**
 * Servicio para gestión de asignaciones de docentes
 * Versión 2.0 - Usa tabla asignaciones (docente + materia + grado)
 */

import api from './api';

/**
 * Obtiene todas las asignaciones de todos los docentes
 */
export const getAllDocentesAsignaciones = async () => {
  const response = await api.get('/docentes-asignaciones');
  return response.data;
};

/**
 * Obtiene las asignaciones de un docente específico
 * @param {number} docenteId - ID del docente
 * @returns {Promise} Objeto con { asignaciones, materias, grados }
 */
export const getDocenteAsignaciones = async (docenteId) => {
  const response = await api.get(`/docentes/${docenteId}/asignaciones`);
  return response.data;
};

/**
 * Crea una nueva asignación (materia + grado) para un docente
 * @param {number} docenteId - ID del docente
 * @param {number} materiaId - ID de la materia
 * @param {number} gradoId - ID del grado
 * @param {string} estado - Estado de la asignación (activa|inactiva)
 */
export const crearAsignacion = async (docenteId, materiaId, gradoId, estado = 'activa') => {
  const response = await api.post(`/docentes/${docenteId}/asignaciones`, {
    materia_id: materiaId,
    grado_id: gradoId,
    estado
  });
  return response.data;
};

/**
 * Asigna múltiples combinaciones materia-grado a un docente (reemplaza las existentes)
 * @param {number} docenteId - ID del docente
 * @param {Array} asignaciones - Array de {materia_id, grado_id}
 * @example
 * asignarMultiples(1, [
 *   {materia_id: 1, grado_id: 1},
 *   {materia_id: 1, grado_id: 2},
 *   {materia_id: 2, grado_id: 3}
 * ])
 */
export const asignarMultiples = async (docenteId, asignaciones) => {
  const response = await api.put(`/docentes/${docenteId}/asignaciones`, {
    asignaciones
  });
  return response.data;
};

/**
 * Elimina una asignación específica
 * @param {number} docenteId - ID del docente
 * @param {number} materiaId - ID de la materia
 * @param {number} gradoId - ID del grado
 */
export const eliminarAsignacion = async (docenteId, materiaId, gradoId) => {
  const response = await api.delete(`/docentes/${docenteId}/asignaciones`, {
    data: {
      materia_id: materiaId,
      grado_id: gradoId
    }
  });
  return response.data;
};

/**
 * Actualiza el estado de una asignación
 * @param {number} docenteId - ID del docente
 * @param {number} materiaId - ID de la materia
 * @param {number} gradoId - ID del grado
 * @param {string} estado - Nuevo estado (activa|inactiva)
 */
export const actualizarEstadoAsignacion = async (docenteId, materiaId, gradoId, estado) => {
  const response = await api.patch(`/docentes/${docenteId}/asignaciones/estado`, {
    materia_id: materiaId,
    grado_id: gradoId,
    estado
  });
  return response.data;
};

/**
 * Obtiene todas las asignaciones del sistema
 * @param {string} estado - Filtrar por estado (opcional)
 */
export const getAllAsignaciones = async (estado = 'activa') => {
  const response = await api.get('/asignaciones', {
    params: { estado }
  });
  return response.data;
};

/**
 * FUNCIONES DE COMPATIBILIDAD CON VERSIÓN ANTERIOR
 * Estas funciones permiten mantener compatibilidad con código antiguo
 * que selecciona materias y grados por separado
 */

/**
 * Asigna materias a un docente (DEPRECADO)
 * @deprecated Usar asignarMultiples() con combinaciones materia-grado
 */
export const asignarMaterias = async (docenteId, materiaIds) => {
  console.warn('asignarMaterias() está deprecado. Use asignarMultiples() con combinaciones materia-grado');
  throw new Error('Este método está deprecado. Use asignarMultiples() para asignar combinaciones materia-grado');
};

/**
 * Asigna grados a un docente (DEPRECADO)
 * @deprecated Usar asignarMultiples() con combinaciones materia-grado
 */
export const asignarGrados = async (docenteId, gradoIds) => {
  console.warn('asignarGrados() está deprecado. Use asignarMultiples() con combinaciones materia-grado');
  throw new Error('Este método está deprecado. Use asignarMultiples() para asignar combinaciones materia-grado');
};

/**
 * Actualiza las asignaciones de un docente generando el producto cartesiano
 * de materias y grados seleccionados
 *
 * NOTA: Esta es una función de compatibilidad que genera automáticamente
 * todas las combinaciones posibles de las materias y grados seleccionados.
 *
 * @param {number} docenteId - ID del docente
 * @param {number[]} materiaIds - Array de IDs de materias
 * @param {number[]} gradoIds - Array de IDs de grados
 */
export const actualizarAsignaciones = async (docenteId, materiaIds, gradoIds) => {
  // Generar producto cartesiano: todas las combinaciones de materia x grado
  const asignaciones = [];

  for (const materiaId of materiaIds) {
    for (const gradoId of gradoIds) {
      asignaciones.push({
        materia_id: materiaId,
        grado_id: gradoId
      });
    }
  }

  // Usar el nuevo endpoint
  return await asignarMultiples(docenteId, asignaciones);
};

export default {
  getAllDocentesAsignaciones,
  getDocenteAsignaciones,
  crearAsignacion,
  asignarMultiples,
  eliminarAsignacion,
  actualizarEstadoAsignacion,
  getAllAsignaciones,
  // Funciones de compatibilidad
  actualizarAsignaciones,
  asignarMaterias,  // deprecado
  asignarGrados     // deprecado
};
