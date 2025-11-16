/**
 * Configuración de Axios para la API
 * App Móvil - Videoteca SFX
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// URL del API desde la configuración de Expo
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2/videotecasfx/backend/api';

// Instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Interceptor de requests - Agrega token de autenticación
 */
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de responses - Manejo de errores y refresh token
 */
api.interceptors.response.use(
  (response) => {
    // Retornar solo los datos
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');

        if (refreshToken) {
          // Intentar refrescar el token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          if (response.data.success) {
            const { access_token } = response.data.data;

            // Guardar nuevo access token
            await AsyncStorage.setItem('access_token', access_token);

            // Reintentar la petición original
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir a login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        // Emitir evento para que la app redirija a login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { API_URL };
export default api;
