/**
 * Página de Videos para Estudiantes
 * Vista simplificada: solo pueden filtrar por materia y grado
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Search, BookOpen, GraduationCap, Play, Filter, X
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import VideoCard from '../components/Videos/VideoCard';
import MateriaSelector from '../components/Common/MateriaSelector';
import GradoSelector from '../components/Common/GradoSelector';
import { useResources } from '../hooks/useResources';
import { getVideos } from '../services/videoService';

const VideosEstudiantesPage = () => {
  const { campos, materias, grados } = useResources();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0
  });

  const [filters, setFilters] = useState({
    materia_id: '',
    grado_id: '',
  });

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar videos cuando cambian filtros o búsqueda
  useEffect(() => {
    if (filters.materia_id && filters.grado_id) {
      loadVideos();
    } else {
      setVideos([]);
    }
  }, [debouncedSearch, filters, pagination.page]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: 12,
        ...filters
      };

      if (debouncedSearch) {
        params.busqueda = debouncedSearch;
      }

      // Remover filtros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await getVideos(params);
      setVideos(response.videos || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      materia_id: '',
      grado_id: '',
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.materia_id || filters.grado_id;
  const canSearch = filters.materia_id && filters.grado_id;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-salesiano-azul-500 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Biblioteca de Videos</h1>
            <p className="text-primary-100 text-lg">
              Selecciona tu materia y curso para ver los videos disponibles
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Filtros obligatorios */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-6 h-6 text-primary-600" />
                Selecciona tu Materia y Curso
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpiar
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Selector de Materia */}
              <div>
                <MateriaSelector
                  campos={campos}
                  materias={materias}
                  value={filters.materia_id}
                  onChange={(value) => handleFilterChange('materia_id', value)}
                  required
                />
              </div>

              {/* Selector de Grado */}
              <div>
                <GradoSelector
                  grados={grados}
                  value={filters.grado_id}
                  onChange={(value) => handleFilterChange('grado_id', value)}
                  required
                />
              </div>

              {/* Búsqueda (solo si ya seleccionó materia y grado) */}
              {canSearch && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar en los videos
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por título o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje instruccional */}
          {!canSearch && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Selecciona una Materia y tu Curso
              </h3>
              <p className="text-gray-600">
                Para ver los videos disponibles, primero debes seleccionar la materia que deseas estudiar y tu curso actual
              </p>
            </div>
          )}

          {/* Lista de Videos */}
          {canSearch && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Play className="w-6 h-6 text-primary-600" />
                  Videos Disponibles
                </h2>
                <p className="text-gray-600 font-medium">
                  <span className="text-2xl font-bold text-gray-900">{pagination.total || 0}</span>{' '}
                  video{pagination.total !== 1 ? 's' : ''}
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay videos disponibles
                  </h3>
                  <p className="text-gray-600">
                    No se encontraron videos para esta combinación de materia y curso
                  </p>
                </div>
              )}

              {/* Paginación */}
              {pagination.total_pages > 1 && videos.length > 0 && (
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VideosEstudiantesPage;
