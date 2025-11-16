/**
 * Servicio de Recursos Auxiliares
 * Maneja campos, materias, grados, temas y roles
 */

import api from './api';

const resourceService = {
  /**
   * Obtiene todos los campos de saberes
   * @returns {Promise}
   */
  async getCampos() {
    const response = await api.get('/campos');
    return response.data.campos;
  },

  /**
   * Obtiene todas las materias (opcionalmente filtradas por campo)
   * @param {number} campoId
   * @returns {Promise}
   */
  async getMaterias(campoId = null) {
    const params = campoId ? { campo_id: campoId } : {};
    const response = await api.get('/materias', { params });
    return response.data.materias;
  },

  /**
   * Obtiene materias agrupadas por campo
   * @returns {Promise}
   */
  async getMateriasByCampo() {
    const response = await api.get('/materias/por-campo');
    return response.data.campos;
  },

  /**
   * Obtiene todos los grados
   * @returns {Promise}
   */
  async getGrados() {
    const response = await api.get('/grados');
    return response.data.grados;
  },

  /**
   * Obtiene todos los temas (opcionalmente filtrados por materia y grado)
   * @param {Object} filters - Filtros { materia_id, grado_id }
   * @returns {Promise}
   */
  async getTemas(filters = {}) {
    const params = {};
    if (filters.materia_id) params.materia_id = filters.materia_id;
    if (filters.grado_id) params.grado_id = filters.grado_id;

    // Retrocompatibilidad: si se pasa un número directamente, usarlo como materia_id
    if (typeof filters === 'number') {
      params.materia_id = filters;
    }

    const response = await api.get('/temas', { params });
    return response.data.temas;
  },

  /**
   * Obtiene todos los roles
   * @returns {Promise}
   */
  async getRoles() {
    const response = await api.get('/roles');
    return response.data.roles;
  },
};

export default resourceService;
