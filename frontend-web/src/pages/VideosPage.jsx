/**
 * Página de Catálogo de Videos
 * Con selectores visuales, debounce y vistas múltiples
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, LayoutGrid, LayoutList, Filter, X, ChevronDown,
  SlidersHorizontal, Video as VideoIcon
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import VideoList from '../components/Videos/VideoList';
import MateriaSelector from '../components/Common/MateriaSelector';
import GradoSelector from '../components/Common/GradoSelector';
import { useResources } from '../hooks/useResources';
import { getVideos, searchVideos } from '../services/videoService';

const VideosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { campos, materias, grados } = useResources();

  // Cargar configuración desde localStorage
  const loadFromStorage = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(`videos_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('busqueda') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('busqueda') || '');
  const [viewMode, setViewMode] = useState(loadFromStorage('viewMode', 'grid')); // 'grid' o 'list'
  const [showFilters, setShowFilters] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0
  });

  const [filters, setFilters] = useState({
    materia_id: searchParams.get('materia_id') || '',
    grado_id: searchParams.get('grado_id') || '',
    campo_id: searchParams.get('campo_id') || '',
    order_by: searchParams.get('order_by') || 'fecha_subida',
    order_dir: searchParams.get('order_dir') || 'DESC'
  });

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Guardar vista en localStorage
  useEffect(() => {
    localStorage.setItem('videos_viewMode', JSON.stringify(viewMode));
  }, [viewMode]);

  // Cargar videos cuando cambian filtros o búsqueda
  useEffect(() => {
    loadVideos();
  }, [debouncedSearch, filters, pagination.page]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: 12,
        ...filters
      };

      // Remover filtros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = debouncedSearch
        ? await searchVideos(debouncedSearch, params)
        : await getVideos(params);

      setVideos(response.videos || []);
      setPagination(response.pagination || pagination);

      // Actualizar URL
      const newParams = new URLSearchParams();
      if (debouncedSearch) newParams.set('busqueda', debouncedSearch);
      if (filters.materia_id) newParams.set('materia_id', filters.materia_id);
      if (filters.grado_id) newParams.set('grado_id', filters.grado_id);
      if (filters.campo_id) newParams.set('campo_id', filters.campo_id);
      if (filters.order_by !== 'fecha_subida') newParams.set('order_by', filters.order_by);
      if (filters.order_dir !== 'DESC') newParams.set('order_dir', filters.order_dir);
      if (pagination.page > 1) newParams.set('page', pagination.page.toString());
      setSearchParams(newParams);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      materia_id: '',
      grado_id: '',
      campo_id: '',
      order_by: 'fecha_subida',
      order_dir: 'DESC'
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = searchTerm || filters.materia_id || filters.grado_id || filters.campo_id;

  // Filtrar materias por campo seleccionado
  const filteredMaterias = useMemo(() => {
    if (!filters.campo_id) return materias;
    return materias.filter(m => m.campo_id?.toString() === filters.campo_id);
  }, [materias, filters.campo_id]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-salesiano-azul-500 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Catálogo de Videos</h1>
            <p className="text-primary-100 text-lg">
              Explora nuestra colección de contenido educativo
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Barra de búsqueda y controles */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Búsqueda con debounce */}
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar videos por título, descripción, tema..."
                  className="input-field pl-10 w-full"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controles */}
              <div className="flex items-center gap-2">
                {/* Toggle filtros */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    showFilters
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtros</span>
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                  )}
                </button>

                {/* Toggle vista */}
                <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Vista de cuadrícula"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    title="Vista de lista"
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Panel de Filtros Expandible */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t space-y-4 animate-fadeIn">
                {/* Filtro por Campo de Saber */}
                {campos.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Campo de Saber
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleFilterChange('campo_id', '')}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                          !filters.campo_id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 bg-white hover:border-primary-300'
                        }`}
                      >
                        Todos
                      </button>
                      {campos.map(campo => (
                        <button
                          key={campo.id}
                          onClick={() => handleFilterChange('campo_id', campo.id.toString())}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            filters.campo_id === campo.id.toString()
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white hover:border-primary-300'
                          }`}
                          style={{
                            borderColor: filters.campo_id === campo.id.toString() ? campo.color : undefined,
                            backgroundColor: filters.campo_id === campo.id.toString() ? `${campo.color}15` : undefined,
                          }}
                        >
                          {campo.nombre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selector Visual de Materias */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materia
                  </label>
                  <MateriaSelector
                    campos={campos}
                    materias={filteredMaterias}
                    value={filters.materia_id}
                    onChange={(value) => handleFilterChange('materia_id', value)}
                    allowClear
                  />
                </div>

                {/* Selector Visual de Grados */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grado
                  </label>
                  <GradoSelector
                    grados={grados}
                    value={filters.grado_id}
                    onChange={(value) => handleFilterChange('grado_id', value)}
                    allowClear
                  />
                </div>

                {/* Ordenamiento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="order_by" className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      id="order_by"
                      value={filters.order_by}
                      onChange={(e) => handleFilterChange('order_by', e.target.value)}
                      className="input-field"
                    >
                      <option value="fecha_subida">Más recientes</option>
                      <option value="visualizaciones">Más vistos</option>
                      <option value="titulo">Título (A-Z)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="order_dir" className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <select
                      id="order_dir"
                      value={filters.order_dir}
                      onChange={(e) => handleFilterChange('order_dir', e.target.value)}
                      className="input-field"
                    >
                      <option value="DESC">Descendente</option>
                      <option value="ASC">Ascendente</option>
                    </select>
                  </div>
                </div>

                {/* Limpiar filtros */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-sm text-gray-600">Filtros activos</p>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Limpiar todos los filtros
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contador de resultados */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600 font-medium">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  Cargando videos...
                </span>
              ) : (
                <>
                  <span className="text-2xl font-bold text-gray-900">{pagination.total || 0}</span>{' '}
                  video{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
                </>
              )}
            </p>
          </div>

          {/* Lista de Videos */}
          {videos.length === 0 && !loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <VideoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron videos</h3>
              <p className="text-gray-600">
                {hasActiveFilters
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Aún no hay videos disponibles'}
              </p>
            </div>
          ) : (
            <VideoList videos={videos} loading={loading} viewMode={viewMode} />
          )}

          {/* Paginación */}
          {pagination.total_pages > 1 && !loading && (
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
    </Layout>
  );
};

export default VideosPage;
