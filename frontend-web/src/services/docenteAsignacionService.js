/**
 * Servicio para gestión de asignaciones de docentes
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
 */
export const getDocenteAsignaciones = async (docenteId) => {
  const response = await api.get(`/docentes/${docenteId}/asignaciones`);
  return response.data;
};

/**
 * Asigna materias a un docente
 * @param {number} docenteId - ID del docente
 * @param {number[]} materiaIds - Array de IDs de materias
 */
export const asignarMaterias = async (docenteId, materiaIds) => {
  const response = await api.post(`/docentes/${docenteId}/materias`, {
    materia_ids: materiaIds
  });
  return response.data;
};

/**
 * Asigna grados a un docente
 * @param {number} docenteId - ID del docente
 * @param {number[]} gradoIds - Array de IDs de grados
 */
export const asignarGrados = async (docenteId, gradoIds) => {
  const response = await api.post(`/docentes/${docenteId}/grados`, {
    grado_ids: gradoIds
  });
  return response.data;
};

/**
 * Actualiza todas las asignaciones de un docente (materias y grados)
 * @param {number} docenteId - ID del docente
 * @param {number[]} materiaIds - Array de IDs de materias
 * @param {number[]} gradoIds - Array de IDs de grados
 */
export const actualizarAsignaciones = async (docenteId, materiaIds, gradoIds) => {
  // Realizar ambas peticiones en paralelo
  const [materiasResponse, gradosResponse] = await Promise.all([
    asignarMaterias(docenteId, materiaIds),
    asignarGrados(docenteId, gradoIds)
  ]);

  return {
    materias: materiasResponse,
    grados: gradosResponse
  };
};
