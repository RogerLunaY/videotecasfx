/**
 * Servicio de Autenticación
 * Maneja login, register, logout y refresh de tokens
 */

import api from './api';

const authService = {
  /**
   * Login de usuario
   * @param {string} email
   * @param {string} password
   * @returns {Promise}
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });

    if (response.success) {
      const { user, tokens } = response.data;

      // Guardar en localStorage
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, tokens };
    }

    throw new Error(response.error?.message || 'Error en login');
  },

  /**
   * Registro de nuevo usuario (solo admins)
   * @param {Object} userData
   * @returns {Promise}
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Logout de usuario
   * @returns {Promise}
   */
  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');

    try {
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Refresh de access token
   * @returns {Promise}
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken,
    });

    if (response.success) {
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      return access_token;
    }

    throw new Error('Error al refrescar token');
  },

  /**
   * Obtiene el usuario actual
   * @returns {Promise}
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');

    if (response.success) {
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }

    return null;
  },

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Obtiene el usuario guardado en localStorage
   * @returns {Object|null}
   */
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
