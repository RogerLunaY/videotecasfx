/**
 * Página de Dashboard
 * Para docentes: muestra solo sus videos con filtros
 * Para admin: muestra estadísticas generales
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import VideoCard from '../components/Videos/VideoCard';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/statsService';
import { getVideos } from '../services/videoService';
import { getGrados } from '../services/gradoService';
import { formatFileSize } from '../utils/helpers';

const DashboardPage = () => {
  const { user, isAdmin, isDocente } = useAuth();
  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para videos de docente
  const [misVideos, setMisVideos] = useState([]);
  const [grados, setGrados] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [filtroGrado, setFiltroGrado] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('fecha_subida');
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 8, // 2 filas de 4 videos
    total: 0,
    total_pages: 0
  });

  useEffect(() => {
    loadDashboard();
    if (isDocente() && !isAdmin()) {
      loadGrados();
      loadMisVideos();
    }
  }, []);

  useEffect(() => {
    if (isDocente() && !isAdmin()) {
      loadMisVideos();
    }
  }, [filtroGrado, ordenamiento, pagination.page]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      // Extraer las estadísticas generales para fácil acceso
      const dashboardData = response.data || response;
      setDashboard(dashboardData);
      setStats(dashboardData.generales || dashboardData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGrados = async () => {
    try {
      const data = await getGrados();
      setGrados(data || []);
    } catch (error) {
      console.error('Error loading grados:', error);
    }
  };

  const loadMisVideos = async () => {
    try {
      setVideosLoading(true);
      const params = {
        docente_id: user?.id,  // CRÍTICO: Filtrar por docente_id, NO usuario_id
        page: pagination.page,
        per_page: 8, // 2 filas de 4 videos
      };

      // Aplicar filtro de grado si está seleccionado
      if (filtroGrado) {
        params.grado_id = filtroGrado;
      }

      // Aplicar ordenamiento
      if (ordenamiento === 'fecha_subida') {
        params.order_by = 'fecha_subida';
        params.order_dir = 'DESC';
      } else if (ordenamiento === 'visualizaciones') {
        params.order_by = 'visualizaciones';
        params.order_dir = 'DESC';
      } else if (ordenamiento === 'titulo') {
        params.order_by = 'titulo';
        params.order_dir = 'ASC';
      }

      const response = await getVideos(params);
      setMisVideos(response.videos || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error loading mis videos:', error);
    } finally {
      setVideosLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltroChange = (nuevoFiltro) => {
    setFiltroGrado(nuevoFiltro);
    setPagination(prev => ({ ...prev, page: 1 })); // Resetear a página 1
  };

  const handleOrdenamientoChange = (nuevoOrdenamiento) => {
    setOrdenamiento(nuevoOrdenamiento);
    setPagination(prev => ({ ...prev, page: 1 })); // Resetear a página 1
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  // Vista para DOCENTES (no admin)
  if (isDocente() && !isAdmin()) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-salesiano-azul-700 mb-2">
              Mis Videos
            </h1>
            <p className="text-gray-600">
              Bienvenido, {user?.nombre} • {user?.rol}
            </p>
          </div>

          {/* Estadísticas del Docente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Mis Videos */}
            <div className="bg-gradient-to-br from-salesiano-azul-500 to-salesiano-azul-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-100">Mis Videos</h3>
                <svg className="w-8 h-8 text-salesiano-amarillo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats?.total_videos || 0}</p>
              <p className="text-sm text-blue-100 mt-1">Videos subidos</p>
            </div>

            {/* Total Visualizaciones */}
            <div className="bg-gradient-to-br from-salesiano-amarillo-400 to-salesiano-amarillo-500 rounded-xl shadow-lg p-6 text-salesiano-azul-900">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-salesiano-azul-800">Visualizaciones</h3>
                <svg className="w-8 h-8 text-salesiano-azul-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats?.total_visualizaciones || 0}</p>
              <p className="text-sm text-salesiano-azul-800 mt-1">Vistas totales</p>
            </div>

            {/* Espacio Usado */}
            <div className="bg-white border-2 border-salesiano-azul-200 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Espacio Usado</h3>
                <svg className="w-8 h-8 text-salesiano-azul-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {formatFileSize(stats?.espacio_usado || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">De tus videos</p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/upload"
                className="bg-gradient-to-r from-salesiano-azul-500 to-salesiano-azul-600 text-white rounded-xl p-6 hover:from-salesiano-azul-600 hover:to-salesiano-azul-700 transition shadow-lg hover:shadow-xl flex items-center group"
              >
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white/30 transition">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Subir Nuevo Video</h3>
                  <p className="text-sm text-blue-100">Comparte contenido educativo</p>
                </div>
              </Link>

              <Link
                to="/perfil"
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-salesiano-azul-400 transition shadow-md hover:shadow-lg flex items-center group"
              >
                <div className="w-14 h-14 bg-salesiano-azul-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-salesiano-azul-100 transition">
                  <svg className="w-8 h-8 text-salesiano-azul-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Mi Perfil</h3>
                  <p className="text-sm text-gray-600">Editar información</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Filtros por Curso */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Filtrar por Curso:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFiltroChange('')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filtroGrado === ''
                        ? 'bg-salesiano-azul-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  {grados.map((grado) => (
                    <button
                      key={grado.id}
                      onClick={() => handleFiltroChange(grado.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filtroGrado === grado.id
                          ? 'bg-salesiano-azul-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {grado.nombre.replace(' Secundaria', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordenamiento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Ordenar por:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOrdenamientoChange('fecha_subida')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      ordenamiento === 'fecha_subida'
                        ? 'bg-salesiano-amarillo-500 text-salesiano-azul-900 shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📅 Fecha
                  </button>
                  <button
                    onClick={() => handleOrdenamientoChange('visualizaciones')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      ordenamiento === 'visualizaciones'
                        ? 'bg-salesiano-amarillo-500 text-salesiano-azul-900 shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👁️ Más Vistos
                  </button>
                  <button
                    onClick={() => handleOrdenamientoChange('titulo')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      ordenamiento === 'titulo'
                        ? 'bg-salesiano-amarillo-500 text-salesiano-azul-900 shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔤 A-Z
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Videos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {filtroGrado
                  ? `Videos de ${grados.find(g => g.id === filtroGrado)?.nombre}`
                  : 'Todos mis Videos'}
              </h2>
              <p className="text-gray-600">
                {pagination.total || 0} video{pagination.total !== 1 ? 's' : ''} total{pagination.total !== 1 ? 'es' : ''}
              </p>
            </div>

            {videosLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-salesiano-azul-600"></div>
              </div>
            ) : misVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {misVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {filtroGrado ? 'No hay videos para este curso' : 'Aún no has subido videos'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filtroGrado
                    ? 'Intenta seleccionar otro curso o sube un video nuevo'
                    : 'Comparte tu conocimiento subiendo tu primer video'}
                </p>
                {!filtroGrado && (
                  <Link
                    to="/upload"
                    className="inline-flex items-center px-6 py-3 bg-salesiano-azul-500 text-white rounded-lg hover:bg-salesiano-azul-600 transition font-semibold"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Subir Primer Video
                  </Link>
                )}
              </div>
            )}

            {/* Paginación */}
            {pagination.total_pages > 1 && misVideos.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-salesiano-azul-400 hover:bg-salesiano-azul-50 transition font-medium text-gray-700"
                  >
                    ← Anterior
                  </button>

                  {[...Array(pagination.total_pages)].map((_, i) => {
                    const page = i + 1;
                    // Mostrar solo páginas cercanas
                    if (
                      page === 1 ||
                      page === pagination.total_pages ||
                      (page >= pagination.page - 2 && page <= pagination.page + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg border-2 font-medium transition ${
                            page === pagination.page
                              ? 'bg-salesiano-azul-500 text-white border-salesiano-azul-500 shadow-md'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-salesiano-azul-400 hover:bg-salesiano-azul-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === pagination.page - 3 || page === pagination.page + 3) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.total_pages}
                    className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-salesiano-azul-400 hover:bg-salesiano-azul-50 transition font-medium text-gray-700"
                  >
                    Siguiente →
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Vista para ADMINISTRADORES
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-salesiano-azul-700 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user?.nombre} • {user?.rol}
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/videos"
              className="bg-gradient-to-r from-salesiano-azul-500 to-salesiano-azul-600 text-white rounded-xl p-6 hover:from-salesiano-azul-600 hover:to-salesiano-azul-700 transition shadow-lg hover:shadow-xl flex items-center"
            >
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-semibold text-lg">Todos los Videos</h3>
                <p className="text-sm text-blue-100">Ver, editar y eliminar</p>
              </div>
            </Link>

            <Link
              to="/usuarios"
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-salesiano-azul-400 transition shadow-md hover:shadow-lg flex items-center"
            >
              <svg className="w-8 h-8 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Usuarios</h3>
                <p className="text-sm text-gray-600">Administrar usuarios</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas Generales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Videos */}
            <div className="bg-gradient-to-br from-salesiano-azul-500 to-salesiano-azul-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-100">Total Videos</h3>
                <svg className="w-8 h-8 text-salesiano-amarillo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats?.total_videos || 0}</p>
            </div>

            {/* Total Visualizaciones */}
            <div className="bg-gradient-to-br from-salesiano-amarillo-400 to-salesiano-amarillo-500 rounded-xl shadow-lg p-6 text-salesiano-azul-900">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-salesiano-azul-800">Visualizaciones</h3>
                <svg className="w-8 h-8 text-salesiano-azul-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-4xl font-bold">{stats?.total_visualizaciones || 0}</p>
            </div>

            {/* Total Docentes */}
            <div className="bg-white border-2 border-salesiano-azul-200 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Docentes</h3>
                <svg className="w-8 h-8 text-salesiano-azul-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats?.total_docentes || 0}</p>
            </div>

            {/* Espacio Usado */}
            <div className="bg-white border-2 border-salesiano-azul-200 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Espacio Usado</h3>
                <svg className="w-8 h-8 text-salesiano-azul-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {formatFileSize(stats?.espacio_usado || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Videos Populares */}
        {dashboard?.videos_populares && dashboard.videos_populares.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Videos Más Populares</h2>
              <Link to="/videos?order_by=visualizaciones&order_dir=DESC" className="text-salesiano-azul-600 hover:text-salesiano-azul-700 text-sm font-medium">
                Ver todos →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-salesiano-azul-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-salesiano-azul-700 uppercase tracking-wider">
                      Video
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-salesiano-azul-700 uppercase tracking-wider">
                      Materia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-salesiano-azul-700 uppercase tracking-wider">
                      Vistas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboard.videos_populares.slice(0, 5).map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link to={`/videos/${video.id}`} className="text-sm font-medium text-gray-900 hover:text-salesiano-azul-600">
                          {video.titulo}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{video.materia || video.materia_nombre}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-salesiano-amarillo-100 text-salesiano-azul-900">
                          {video.visualizaciones}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actividad Reciente */}
        {dashboard?.actividad_reciente && dashboard.actividad_reciente.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-4">
                {dashboard.actividad_reciente.slice(0, 10).map((actividad, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-salesiano-azul-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{actividad.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-1">{actividad.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
