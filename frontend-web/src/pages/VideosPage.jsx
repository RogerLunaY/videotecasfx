/**
 * Página de Catálogo de Videos - Diseño Moderno con Búsqueda y Filtros
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import VideoCard from '../components/Videos/VideoCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useResources } from '../hooks/useResources';
import { getVideos, searchVideos } from '../services/videoService';
import { debounce } from '../utils/helpers';

const VideosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { materias, grados } = useResources();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('busqueda') || '');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0
  });

  const [filters, setFilters] = useState({
    busqueda: searchParams.get('busqueda') || '',
    materia_id: searchParams.get('materia_id') || '',
    grado_id: searchParams.get('grado_id') || '',
    order_by: searchParams.get('order_by') || 'fecha_subida',
    order_dir: searchParams.get('order_dir') || 'DESC'
  });

  // Obtener nombres de materia y grado desde los IDs
  const selectedMateria = materias.find(m => m.id == filters.materia_id);
  const selectedGrado = grados.find(g => g.id == filters.grado_id);

  useEffect(() => {
    loadVideos();
  }, [searchParams]);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (searchInput !== filters.busqueda) {
        handleFilterChange('busqueda', searchInput);
      }
    }, 500);

    debouncedSearch();
  }, [searchInput]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        per_page: 12,
        busqueda: searchParams.get('busqueda') || '',
        materia_id: searchParams.get('materia_id') || '',
        grado_id: searchParams.get('grado_id') || '',
        order_by: searchParams.get('order_by') || 'fecha_subida',
        order_dir: searchParams.get('order_dir') || 'DESC'
      };

      // Remover filtros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = params.busqueda
        ? await searchVideos(params.busqueda, params)
        : await getVideos(params);

      setVideos(response.videos || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }

    // Reset a página 1 al cambiar filtros
    newParams.delete('page');

    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderChange = (orderBy) => {
    const newParams = new URLSearchParams(searchParams);

    // Si es el mismo orden, cambiar dirección
    if (filters.order_by === orderBy) {
      const newDir = filters.order_dir === 'DESC' ? 'ASC' : 'DESC';
      newParams.set('order_dir', newDir);
    } else {
      newParams.set('order_by', orderBy);
      newParams.set('order_dir', 'DESC');
    }

    newParams.delete('page');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const removeFilter = (filterName) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterName);
    newParams.delete('page');

    if (filterName === 'busqueda') {
      setSearchInput('');
    }

    setSearchParams(newParams);
  };

  const hasActiveFilters = filters.busqueda || filters.materia_id || filters.grado_id;

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="aspect-video bg-gray-300"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section con Estadísticas */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">📹 Videoteca UESFX</h1>
              <p className="text-primary-100 text-lg">
                Explora contenido educativo de calidad
              </p>
            </div>
            <div className="flex gap-6 text-center">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">{pagination.total || 0}</div>
                <div className="text-sm text-primary-100">Videos</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">{materias.length}</div>
                <div className="text-sm text-primary-100">Materias</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">{grados.length}</div>
                <div className="text-sm text-primary-100">Grados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda en Tiempo Real */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 transition-all duration-300">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar videos por título, descripción, tema..."
              className="input-field pl-12 w-full text-lg transition-all duration-200 focus:ring-2 focus:ring-primary-500"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  removeFilter('busqueda');
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filtros Activos y Controles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Badges de Filtros Activos */}
            <div className="flex flex-wrap items-center gap-3">
              {selectedMateria && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-800 rounded-lg font-medium animate-fade-in">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  📚 {selectedMateria.nombre}
                  <button
                    onClick={() => removeFilter('materia_id')}
                    className="hover:text-primary-900 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}

              {selectedGrado && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium animate-fade-in">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  🎓 {selectedGrado.nombre}
                  <button
                    onClick={() => removeFilter('grado_id')}
                    className="hover:text-blue-900 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}

              {filters.busqueda && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium animate-fade-in">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  "{filters.busqueda}"
                  <button
                    onClick={() => {
                      setSearchInput('');
                      removeFilter('busqueda');
                    }}
                    className="hover:text-green-900 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium underline transition-colors"
                >
                  Limpiar todos
                </button>
              )}

              {!hasActiveFilters && (
                <span className="text-sm text-gray-500">Todos los videos</span>
              )}
            </div>

            {/* Controles de Vista y Ordenamiento */}
            <div className="flex items-center gap-3">
              {/* Ordenamiento */}
              <div className="flex items-center gap-2 border-r pr-3">
                <span className="text-sm text-gray-600 font-medium">Ordenar:</span>
                <button
                  onClick={() => handleOrderChange('fecha_subida')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.order_by === 'fecha_subida'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Recientes
                  {filters.order_by === 'fecha_subida' && (
                    <span className="ml-1">{filters.order_dir === 'DESC' ? '↓' : '↑'}</span>
                  )}
                </button>
                <button
                  onClick={() => handleOrderChange('visualizaciones')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.order_by === 'visualizaciones'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Populares
                  {filters.order_by === 'visualizaciones' && (
                    <span className="ml-1">{filters.order_dir === 'DESC' ? '↓' : '↑'}</span>
                  )}
                </button>
                <button
                  onClick={() => handleOrderChange('titulo')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filters.order_by === 'titulo'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  A-Z
                  {filters.order_by === 'titulo' && (
                    <span className="ml-1">{filters.order_dir === 'DESC' ? '↓' : '↑'}</span>
                  )}
                </button>
              </div>

              {/* Vista Grid/Lista */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Vista de cuadrícula"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Vista de lista"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="mb-6">
          <p className="text-gray-600 font-medium">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando videos...
              </span>
            ) : (
              `${pagination.total || 0} video${pagination.total !== 1 ? 's' : ''} encontrado${pagination.total !== 1 ? 's' : ''}`
            )}
          </p>
        </div>

        {/* Lista de Videos */}
        {loading ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center animate-fade-in">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron videos</h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros de búsqueda o limpiar todos los filtros'
                : 'Aún no hay videos disponibles en el catálogo'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-primary"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <VideoCard video={video} viewMode="list" />
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.total_pages > 1 && !loading && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.per_page + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.per_page, pagination.total)}
                </span>{' '}
                de <span className="font-medium">{pagination.total}</span> resultados
              </div>

              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 font-medium"
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
                        className={`px-4 py-2 rounded-lg border transition-all duration-200 font-medium ${
                          page === pagination.page
                            ? 'bg-primary-600 text-white border-primary-600 shadow-lg transform scale-110'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === pagination.page - 3 || page === pagination.page + 3) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out backwards;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </Layout>
  );
};

export default VideosPage;
