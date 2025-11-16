/**
 * Servicio de Materias
 * Maneja todas las operaciones relacionadas con materias
 */

import api from './api';

const materiaService = {
  /**
   * Obtiene todas las materias (opcionalmente filtradas por campo)
   * @param {Object} filters - Filtros { campo_id }
   * @returns {Promise}
   */
  async getAll(filters = {}) {
    const params = {};
    if (filters.campo_id) params.campo_id = filters.campo_id;

    const response = await api.get('/materias', { params });
    return response.data.materias;
  },

  /**
   * Obtiene una materia por ID
   * @param {number} id
   * @returns {Promise}
   */
  async getById(id) {
    const response = await api.get(`/materias/${id}`);
    return response.data.materia;
  },

  /**
   * Obtiene una materia con sus temas
   * @param {number} id - ID de la materia
   * @param {number} gradoId - ID del grado (opcional)
   * @returns {Promise}
   */
  async getWithTemas(id, gradoId = null) {
    const params = gradoId ? { grado_id: gradoId } : {};
    const response = await api.get(`/materias/${id}/temas`, { params });
    return response.data.materia;
  },

  /**
   * Obtiene materias agrupadas por campo
   * @returns {Promise}
   */
  async getByCampo() {
    const response = await api.get('/materias/por-campo');
    return response.data.campos;
  },
};

// Exports nombrados
export const getMaterias = (filters) => materiaService.getAll(filters);
export const getMateriaById = (id) => materiaService.getById(id);
export const getMateriaWithTemas = (id, gradoId) => materiaService.getWithTemas(id, gradoId);
export const getMateriasByCampo = () => materiaService.getByCampo();

export default materiaService;
