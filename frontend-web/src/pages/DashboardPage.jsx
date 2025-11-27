/**
 * Página de Dashboard
 * Para docentes: resumen personal con gráficos y acciones rápidas
 * Para admin: estadísticas generales con visualizaciones y top content
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Video, Eye, HardDrive, Upload, User, Users,
  TrendingUp, Award, Clock, Calendar, BarChart3,
  Play, Edit, Trash2, FileVideo, BookOpen, GraduationCap,
  ChevronRight, Activity, Zap, Target, Star
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import VideoCard from '../components/Videos/VideoCard';
import GradoSelector from '../components/Common/GradoSelector';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/statsService';
import { getVideos } from '../services/videoService';
import { useResources } from '../hooks/useResources';
import { formatFileSize } from '../utils/helpers';

const DashboardPage = () => {
  const { user, isAdmin, isDocente } = useAuth();
  const { grados } = useResources();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para videos de docente
  const [misVideos, setMisVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [filtroGrado, setFiltroGrado] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('fecha_subida');
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 8,
    total: 0,
    total_pages: 0
  });

  useEffect(() => {
    loadDashboard();
    if (isDocente() && !isAdmin()) {
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
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMisVideos = async () => {
    try {
      setVideosLoading(true);
      const params = {
        docente_id: user?.id,
        page: pagination.page,
        per_page: 8,
      };

      if (filtroGrado) {
        params.grado_id = filtroGrado;
      }

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
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleOrdenamientoChange = (nuevoOrdenamiento) => {
    setOrdenamiento(nuevoOrdenamiento);
    setPagination(prev => ({ ...prev, page: 1 }));
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
        <div className="min-h-screen bg-gray-50">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-salesiano-azul-500 text-white py-8">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Bienvenido, {user?.nombre}
                  </h1>
                  <p className="text-primary-100">
                    Resumen de tu actividad como docente
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            {/* Estadísticas principales con iconos grandes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Videos subidos */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Videos Subidos</p>
                    <p className="text-4xl font-bold text-gray-900">{stats?.total_videos || 0}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Video className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>Contenido activo</span>
                </div>
              </div>

              {/* Visualizaciones totales */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Visualizaciones</p>
                    <p className="text-4xl font-bold text-gray-900">{stats?.total_visualizaciones || 0}</p>
                  </div>
                  <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Eye className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Activity className="w-4 h-4 mr-1" />
                  <span>Alcance total</span>
                </div>
              </div>

              {/* Espacio usado */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Espacio Usado</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatFileSize(stats?.espacio_usado || 0)}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <HardDrive className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span>Almacenamiento</span>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas mejoradas */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary-600" />
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/upload"
                  className="bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl p-6 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Subir Nuevo Video</h3>
                      <p className="text-sm text-primary-100">Comparte contenido educativo</p>
                    </div>
                    <ChevronRight className="ml-auto w-6 h-6" />
                  </div>
                </Link>

                <Link
                  to="/perfil"
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-400 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary-100 transition-colors">
                      <User className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">Mi Perfil</h3>
                      <p className="text-sm text-gray-600">Ver y editar información</p>
                    </div>
                    <ChevronRight className="ml-auto w-6 h-6 text-gray-400" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Filtros y Ordenamiento mejorados */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                {/* Filtro por Grado */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Filtrar por Grado
                  </label>
                  <GradoSelector
                    grados={grados}
                    value={filtroGrado}
                    onChange={handleFiltroChange}
                    allowClear
                  />
                </div>

                {/* Ordenamiento */}
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Ordenar por
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleOrdenamientoChange('fecha_subida')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        ordenamiento === 'fecha_subida'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Más recientes
                    </button>
                    <button
                      onClick={() => handleOrdenamientoChange('visualizaciones')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        ordenamiento === 'visualizaciones'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Más vistos
                    </button>
                    <button
                      onClick={() => handleOrdenamientoChange('titulo')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        ordenamiento === 'titulo'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <Target className="w-4 h-4" />
                      A-Z
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Videos */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FileVideo className="w-6 h-6 text-primary-600" />
                  Mis Videos
                </h2>
                <p className="text-gray-600 font-medium">
                  <span className="text-2xl font-bold text-gray-900">{pagination.total || 0}</span>{' '}
                  video{pagination.total !== 1 ? 's' : ''}
                </p>
              </div>

              {videosLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : misVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {misVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {filtroGrado ? 'No hay videos para este grado' : 'Aún no has subido videos'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {filtroGrado
                      ? 'Intenta seleccionar otro grado o sube un video nuevo'
                      : 'Comparte tu conocimiento subiendo tu primer video'}
                  </p>
                  {!filtroGrado && (
                    <Link
                      to="/upload"
                      className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                    >
                      <Upload className="w-5 h-5 mr-2" />
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
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Anterior
                    </button>

                    {[...Array(pagination.total_pages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.total_pages ||
                        (page >= pagination.page - 2 && page <= pagination.page + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              page === pagination.page
                                ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                : 'border-gray-300 hover:bg-gray-50'
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
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Vista para ADMINISTRADORES
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-salesiano-azul-500 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Panel de Administración
                </h1>
                <p className="text-primary-100">
                  Bienvenido, {user?.nombre} • Estadísticas del sistema
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Estadísticas principales con iconos grandes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Videos */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Videos</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.total_videos || 0}</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Video className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <Link
                to="/videos"
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver catálogo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Total Visualizaciones */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Visualizaciones</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.total_visualizaciones || 0}</p>
                </div>
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Alcance total</span>
              </div>
            </div>

            {/* Total Docentes */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Docentes</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.total_docentes || 0}</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <Link
                to="/usuarios"
                className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Gestionar usuarios
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Espacio Usado */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Espacio Usado</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatFileSize(stats?.espacio_usado || 0)}
                  </p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <HardDrive className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BarChart3 className="w-4 h-4 mr-1" />
                <span>Almacenamiento</span>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary-600" />
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/upload"
                className="bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Subir Video</h3>
                    <p className="text-sm text-primary-100">Nuevo contenido</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>

              <Link
                to="/videos"
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                    <FileVideo className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Videos</h3>
                    <p className="text-sm text-gray-600">Catálogo completo</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>

              <Link
                to="/usuarios"
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-100 transition-colors">
                    <Users className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">Usuarios</h3>
                    <p className="text-sm text-gray-600">Gestionar</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            </div>
          </div>

          {/* Videos Más Populares */}
          {stats?.videos_populares && stats.videos_populares.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  Videos Más Populares
                </h2>
                <Link
                  to="/videos?order_by=visualizaciones&order_dir=DESC"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                >
                  Ver todos
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posición
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Video
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Materia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visualizaciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.videos_populares.slice(0, 5).map((video, index) => (
                        <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-gray-100 text-gray-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              to={`/videos/${video.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-primary-600 flex items-center gap-2"
                            >
                              <Play className="w-4 h-4 text-gray-400" />
                              {video.titulo}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {video.materia_nombre}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-900">
                                {video.visualizaciones.toLocaleString()}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Actividad Reciente */}
          {stats?.actividad_reciente && stats.actividad_reciente.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary-600" />
                Actividad Reciente
              </h2>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="relative">
                  {/* Línea vertical del timeline */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  <div className="space-y-6">
                    {stats.actividad_reciente.slice(0, 10).map((actividad, index) => (
                      <div key={index} className="relative pl-16">
                        {/* Punto del timeline */}
                        <div className="absolute left-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <Activity className="w-6 h-6 text-primary-600" />
                        </div>

                        {/* Contenido */}
                        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <p className="text-sm text-gray-900 font-medium mb-1">{actividad.descripcion}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {actividad.fecha}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
