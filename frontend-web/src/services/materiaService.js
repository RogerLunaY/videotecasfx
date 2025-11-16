/**
 * Servicio de Materias
 * Maneja todas las operaciones relacionadas con materias
 */

import api from './api';

const materiaService = {
  /**
   * Obtiene todas las materias
   * @returns {Promise}
   */
  async getAll() {
    const response = await api.get('/materias');
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
};

// Exports nombrados
export const getMaterias = () => materiaService.getAll();
export const getMateriaById = (id) => materiaService.getById(id);

export default materiaService;
