/**
 * Servicio de Grados
 * Maneja todas las operaciones relacionadas con grados
 */

import api from './api';

const gradoService = {
  /**
   * Obtiene todos los grados
   * @returns {Promise}
   */
  async getAll() {
    const response = await api.get('/grados');
    return response.data.grados;
  },

  /**
   * Obtiene un grado por ID
   * @param {number} id
   * @returns {Promise}
   */
  async getById(id) {
    const response = await api.get(`/grados/${id}`);
    return response.data.grado;
  },
};

// Exports nombrados
export const getGrados = () => gradoService.getAll();
export const getGradoById = (id) => gradoService.getById(id);

export default gradoService;
