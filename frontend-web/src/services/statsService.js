/**
 * Servicio de Estadísticas
 * Maneja operaciones de estadísticas y reportes
 */

import api from './api';

const statsService = {
  /**
   * Obtiene el dashboard completo
   * @returns {Promise}
   */
  async getDashboard() {
    const response = await api.get('/estadisticas/dashboard');
    return response.data.dashboard;
  },

  /**
   * Obtiene estadísticas generales
   * @returns {Promise}
   */
  async getGenerales() {
    const response = await api.get('/estadisticas/generales');
    return response.data.estadisticas;
  },

  /**
   * Obtiene videos más populares
   * @param {number} limit
   * @returns {Promise}
   */
  async getVideosPopulares(limit = 10) {
    const response = await api.get('/estadisticas/videos-populares', {
      params: { limit },
    });
    return response.data.videos;
  },

  /**
   * Obtiene estadísticas por materia
   * @returns {Promise}
   */
  async getPorMateria() {
    const response = await api.get('/estadisticas/por-materia');
    return response.data.estadisticas;
  },

  /**
   * Obtiene estadísticas por grado
   * @returns {Promise}
   */
  async getPorGrado() {
    const response = await api.get('/estadisticas/por-grado');
    return response.data.estadisticas;
  },

  /**
   * Obtiene estadísticas de reproducciones
   * @param {string} fechaInicio
   * @param {string} fechaFin
   * @returns {Promise}
   */
  async getReproducciones(fechaInicio, fechaFin) {
    const response = await api.get('/estadisticas/reproducciones', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    });
    return response.data;
  },

  /**
   * Obtiene horas por materia
   * @returns {Promise}
   */
  async getHorasPorMateria() {
    const response = await api.get('/estadisticas/horas-por-materia');
    return response.data.estadisticas;
  },

  /**
   * Obtiene horas por grado
   * @returns {Promise}
   */
  async getHorasPorGrado() {
    const response = await api.get('/estadisticas/horas-por-grado');
    return response.data.estadisticas;
  },

  /**
   * Obtiene estadísticas de un docente
   * @param {number} docenteId
   * @returns {Promise}
   */
  async getPorDocente(docenteId) {
    const response = await api.get(`/estadisticas/docente/${docenteId}`);
    return response.data.estadisticas;
  },

  /**
   * Obtiene tendencias
   * @param {number} dias
   * @returns {Promise}
   */
  async getTendencias(dias = 7) {
    const response = await api.get('/estadisticas/tendencias', {
      params: { dias },
    });
    return response.data;
  },

  /**
   * Obtiene actividad reciente
   * @param {number} limit
   * @returns {Promise}
   */
  async getActividadReciente(limit = 20) {
    const response = await api.get('/estadisticas/actividad-reciente', {
      params: { limit },
    });
    return response.data.actividad;
  },

  /**
   * Obtiene resumen ejecutivo
   * @returns {Promise}
   */
  async getResumenEjecutivo() {
    const response = await api.get('/estadisticas/resumen-ejecutivo');
    return response.data.resumen;
  },
};

// Exports nombrados para facilitar imports
export const getDashboard = () => statsService.getDashboard();
export const getGeneralStats = () => statsService.getGenerales();
export const getPopularVideos = (limit) => statsService.getVideosPopulares(limit);
export const getStatsByMateria = () => statsService.getPorMateria();
export const getStatsByGrado = () => statsService.getPorGrado();
export const getPlaybackStats = (fechaInicio, fechaFin) => statsService.getReproducciones(fechaInicio, fechaFin);
export const getHoursByMateria = () => statsService.getHorasPorMateria();
export const getHoursByGrado = () => statsService.getHorasPorGrado();
export const getDocenteStats = (docenteId) => statsService.getPorDocente(docenteId);
export const getTrends = (dias) => statsService.getTendencias(dias);
export const getRecentActivity = (limit) => statsService.getActividadReciente(limit);
export const getExecutiveSummary = () => statsService.getResumenEjecutivo();

export default statsService;
