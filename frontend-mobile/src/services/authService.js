/**
 * Servicio de Autenticación
 * App Móvil - Videoteca SFX
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const authService = {
  /**
   * Login de usuario
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });

    if (response.success) {
      const { user, tokens } = response.data;

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('access_token', tokens.access_token);
      await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return { user, tokens };
    }

    throw new Error(response.error?.message || 'Error en login');
  },

  /**
   * Logout de usuario
   */
  async logout() {
    const refreshToken = await AsyncStorage.getItem('refresh_token');

    try {
      await api.post('/auth/logout', { refresh_token: refreshToken });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar AsyncStorage
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    }
  },

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');

    if (response.success) {
      const user = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    }

    return null;
  },

  /**
   * Verifica si el usuario está autenticado
   */
  async isAuthenticated() {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Obtiene el usuario guardado en AsyncStorage
   */
  async getStoredUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
