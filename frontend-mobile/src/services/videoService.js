/**
 * Servicio de Videos
 * App Móvil - Videoteca SFX
 */

import api, { API_URL } from './api';

const videoService = {
  /**
   * Obtiene todos los videos con filtros y paginación
   */
  async getAll(params = {}) {
    const response = await api.get('/videos', { params });
    return response.data;
  },

  /**
   * Obtiene un video por ID
   */
  async getById(id) {
    const response = await api.get(`/videos/${id}`);
    return response.data.video;
  },

  /**
   * Busca videos por texto
   */
  async search(query, params = {}) {
    const response = await api.get('/videos/buscar', {
      params: { q: query, ...params },
    });
    return response.data;
  },

  /**
   * Obtiene videos populares
   */
  async getPopular(limit = 10) {
    const response = await api.get('/videos/populares', {
      params: { limit },
    });
    return response.data.videos;
  },

  /**
   * Obtiene videos recientes
   */
  async getRecent(limit = 10) {
    const response = await api.get('/videos/recientes', {
      params: { limit },
    });
    return response.data.videos;
  },

  /**
   * Obtiene la URL de streaming de un video
   */
  getStreamUrl(id) {
    return `${API_URL}/videos/${id}/stream`;
  },

  /**
   * Obtiene la URL del thumbnail
   */
  getThumbnailUrl(thumbnailPath) {
    if (!thumbnailPath) return null;
    return `${API_URL.replace('/api', '')}/${thumbnailPath}`;
  },
};

export default videoService;
