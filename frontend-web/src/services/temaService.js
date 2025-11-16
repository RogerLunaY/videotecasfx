/**
 * Servicio de Temas Curriculares
 * Maneja todas las operaciones relacionadas con temas del currículo
 */

import api from './api';

const temaService = {
  /**
   * Obtiene todos los temas con filtros opcionales
   * @param {Object} filters - Filtros { materia_id, grado_id }
   * @returns {Promise}
   */
  async getAll(filters = {}) {
    const params = {};
    if (filters.materia_id) params.materia_id = filters.materia_id;
    if (filters.grado_id) params.grado_id = filters.grado_id;

    const response = await api.get('/temas', { params });
    return response.data.temas;
  },

  /**
   * Obtiene un tema por ID
   * @param {number} id
   * @returns {Promise}
   */
  async getById(id) {
    const response = await api.get(`/temas/${id}`);
    return response.data.tema;
  },

  /**
   * Obtiene la estructura completa de temas agrupados por grado y materia
   * @param {Object} filters - Filtros { materia_id, grado_id }
   * @returns {Promise}
   */
  async getEstructura(filters = {}) {
    const params = {};
    if (filters.materia_id) params.materia_id = filters.materia_id;
    if (filters.grado_id) params.grado_id = filters.grado_id;

    const response = await api.get('/temas/estructura', { params });
    return response.data.estructura;
  },

  /**
   * Busca temas por texto
   * @param {string} query - Texto de búsqueda
   * @param {Object} filters - Filtros { materia_id, grado_id }
   * @returns {Promise}
   */
  async search(query, filters = {}) {
    const params = { q: query };
    if (filters.materia_id) params.materia_id = filters.materia_id;
    if (filters.grado_id) params.grado_id = filters.grado_id;

    const response = await api.get('/temas/buscar', { params });
    return response.data.temas;
  },
};

// Exports nombrados
export const getTemas = (filters) => temaService.getAll(filters);
export const getTemaById = (id) => temaService.getById(id);
export const getTemasEstructura = (filters) => temaService.getEstructura(filters);
export const searchTemas = (query, filters) => temaService.search(query, filters);

export default temaService;
