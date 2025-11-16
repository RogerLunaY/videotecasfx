/**
 * Servicio de Usuarios
 * Maneja operaciones CRUD de usuarios
 */

import api from './api';

const userService = {
  /**
   * Obtiene todos los usuarios
   * @param {Object} params
   * @returns {Promise}
   */
  async getAll(params = {}) {
    const response = await api.get('/usuarios', { params });
    return response.data;
  },

  /**
   * Obtiene un usuario por ID
   * @param {number} id
   * @returns {Promise}
   */
  async getById(id) {
    const response = await api.get(`/usuarios/${id}`);
    return response.data.usuario;
  },

  /**
   * Crea un nuevo usuario
   * @param {Object} userData
   * @returns {Promise}
   */
  async create(userData) {
    const response = await api.post('/usuarios', userData);
    return response.data.usuario;
  },

  /**
   * Actualiza un usuario
   * @param {number} id
   * @param {Object} userData
   * @returns {Promise}
   */
  async update(id, userData) {
    const response = await api.put(`/usuarios/${id}`, userData);
    return response.data.usuario;
  },

  /**
   * Elimina un usuario
   * @param {number} id
   * @returns {Promise}
   */
  async delete(id) {
    const response = await api.delete(`/usuarios/${id}`);
    return response;
  },

  /**
   * Cambia la contraseña de un usuario
   * @param {number} id
   * @param {Object} passwordData - {password, new_password, new_password_confirmation}
   * @returns {Promise}
   */
  async changePassword(id, passwordData) {
    const response = await api.put(`/usuarios/${id}/password`, passwordData);
    return response;
  },

  /**
   * Obtiene usuarios por rol
   * @param {string} rol
   * @returns {Promise}
   */
  async getByRole(rol) {
    const response = await api.get(`/usuarios/rol/${rol}`);
    return response.data.usuarios;
  },
};

// Exports nombrados para facilitar imports
export const getUsers = (params) => userService.getAll(params);
export const getUserById = (id) => userService.getById(id);
export const createUser = (userData) => userService.create(userData);
export const updateUser = (id, userData) => userService.update(id, userData);
export const deleteUser = (id) => userService.delete(id);
export const updatePassword = (id, passwordData) => userService.changePassword(id, passwordData);
export const getUsersByRole = (rol) => userService.getByRole(rol);

export default userService;
