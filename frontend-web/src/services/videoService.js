/**
 * Servicio de Videos
 * Maneja todas las operaciones relacionadas con videos
 */

import api, { API_URL } from './api';

const videoService = {
  /**
   * Obtiene todos los videos con filtros y paginación
   * @param {Object} params Parámetros de búsqueda
   * @returns {Promise}
   */
  async getAll(params = {}) {
    const response = await api.get('/videos', { params });
    return response.data;
  },

  /**
   * Obtiene un video por ID
   * @param {number} id
   * @returns {Promise}
   */
  async getById(id) {
    const response = await api.get(`/videos/${id}`);
    return response.data.video;
  },

  /**
   * Sube un nuevo video
   * @param {FormData} formData
   * @param {Function} onProgress Callback de progreso
   * @returns {Promise}
   */
  async upload(formData, onProgress) {
    const response = await api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data.video;
  },

  /**
   * Actualiza un video
   * @param {number} id
   * @param {Object} data
   * @returns {Promise}
   */
  async update(id, data) {
    const response = await api.put(`/videos/${id}`, data);
    return response.data.video;
  },

  /**
   * Elimina un video
   * @param {number} id
   * @returns {Promise}
   */
  async delete(id) {
    const response = await api.delete(`/videos/${id}`);
    return response;
  },

  /**
   * Busca videos por texto
   * @param {string} query
   * @param {Object} params
   * @returns {Promise}
   */
  async search(query, params = {}) {
    const response = await api.get('/videos/buscar', {
      params: { q: query, ...params },
    });
    return response.data;
  },

  /**
   * Obtiene videos populares
   * @param {number} limit
   * @returns {Promise}
   */
  async getPopular(limit = 10) {
    const response = await api.get('/videos/populares', {
      params: { limit },
    });
    return response.data.videos;
  },

  /**
   * Obtiene videos recientes
   * @param {number} limit
   * @returns {Promise}
   */
  async getRecent(limit = 10) {
    const response = await api.get('/videos/recientes', {
      params: { limit },
    });
    return response.data.videos;
  },

  /**
   * Obtiene videos por materia
   * @param {number} materiaId
   * @param {Object} params
   * @returns {Promise}
   */
  async getByMateria(materiaId, params = {}) {
    const response = await api.get(`/videos/materia/${materiaId}`, { params });
    return response.data;
  },

  /**
   * Obtiene videos por grado
   * @param {number} gradoId
   * @param {Object} params
   * @returns {Promise}
   */
  async getByGrado(gradoId, params = {}) {
    const response = await api.get(`/videos/grado/${gradoId}`, { params });
    return response.data;
  },

  /**
   * Obtiene la URL de streaming de un video
   * @param {number} id
   * @returns {string}
   */
  getStreamUrl(id) {
    return `${API_URL}/videos/${id}/stream`;
  },

  /**
   * Obtiene la URL del thumbnail
   * @param {string} thumbnailPath
   * @returns {string}
   */
  getThumbnailUrl(thumbnailPath) {
    if (!thumbnailPath) return '/placeholder-video.jpg';
    return `${API_URL.replace('/api', '')}/${thumbnailPath}`;
  },
};

// Exports nombrados para facilitar imports
export const getVideos = (params) => videoService.getAll(params);
export const getVideoById = (id) => videoService.getById(id);
export const uploadVideo = (formData, onProgress) => videoService.upload(formData, onProgress);
export const updateVideo = (id, data) => videoService.update(id, data);
export const deleteVideo = (id) => videoService.delete(id);
export const searchVideos = (query, params) => videoService.search(query, params);
export const getPopularVideos = (limit) => videoService.getPopular(limit);
export const getRecentVideos = (limit) => videoService.getRecent(limit);
export const getVideosByMateria = (materiaId, params) => videoService.getByMateria(materiaId, params);
export const getVideosByGrado = (gradoId, params) => videoService.getByGrado(gradoId, params);
export const getStreamUrl = (id) => videoService.getStreamUrl(id);
export const getThumbnailUrl = (thumbnailPath) => videoService.getThumbnailUrl(thumbnailPath);

export default videoService;
