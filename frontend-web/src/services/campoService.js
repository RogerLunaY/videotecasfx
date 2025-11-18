/**
 * Servicio de Campos de Saberes
 * Maneja todas las operaciones relacionadas con campos del currículo boliviano
 */

import api from './api';

const campoService = {
  /**
   * Obtiene todos los campos
   * @returns {Promise}
   */
  async getAll() {
    const response = await api.get('/campos');
    return response.campos;
  },

  /**
   * Obtiene un campo por ID
   * @param {number} id
   * @returns {Promise}
   */
  async getById(id) {
    const response = await api.get(`/campos/${id}`);
    return response.campo;
  },

  /**
   * Obtiene un campo con sus materias asociadas
   * @param {number} id
   * @returns {Promise}
   */
  async getWithMaterias(id) {
    const response = await api.get(`/campos/${id}/materias`);
    return response.campo;
  },
};

// Exports nombrados
export const getCampos = () => campoService.getAll();
export const getCampoById = (id) => campoService.getById(id);
export const getCampoWithMaterias = (id) => campoService.getWithMaterias(id);

export default campoService;
