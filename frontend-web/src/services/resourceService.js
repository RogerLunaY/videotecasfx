/**
 * Servicio de Recursos Auxiliares
 * Maneja materias, grados, temas y roles
 */

import api from './api';

const resourceService = {
  /**
   * Obtiene todas las materias
   * @returns {Promise}
   */
  async getMaterias() {
    const response = await api.get('/materias');
    return response.data.materias;
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
   * Obtiene todos los temas (opcionalmente filtrados por materia)
   * @param {number} materiaId
   * @returns {Promise}
   */
  async getTemas(materiaId = null) {
    const params = materiaId ? { materia_id: materiaId } : {};
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
