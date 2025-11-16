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

  /**
   * Obtiene un grado con sus temas
   * @param {number} id - ID del grado
   * @param {number} materiaId - ID de la materia (opcional)
   * @returns {Promise}
   */
  async getWithTemas(id, materiaId = null) {
    const params = materiaId ? { materia_id: materiaId } : {};
    const response = await api.get(`/grados/${id}/temas`, { params });
    return response.data.grado;
  },
};

// Exports nombrados
export const getGrados = () => gradoService.getAll();
export const getGradoById = (id) => gradoService.getById(id);
export const getGradoWithTemas = (id, materiaId) => gradoService.getWithTemas(id, materiaId);

export default gradoService;
