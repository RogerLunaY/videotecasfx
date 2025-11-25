/**
 * Página de Catálogo de Videos
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import VideoList from '../components/Videos/VideoList';
import { useResources } from '../hooks/useResources';
import { getVideos, searchVideos } from '../services/videoService';

const VideosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { materias, grados } = useResources();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0
  });

  // Filtros como estado local solo para inputs controlados
  const [filters, setFilters] = useState({
    busqueda: '',
    materia_id: '',
    grado_id: '',
    order_by: 'fecha_subida',
    order_dir: 'DESC'
  });

  // Sincronizar filtros desde searchParams (una sola dirección)
  useEffect(() => {
    setFilters({
      busqueda: searchParams.get('busqueda') || '',
      materia_id: searchParams.get('materia_id') || '',
      grado_id: searchParams.get('grado_id') || '',
      order_by: searchParams.get('order_by') || 'fecha_subida',
      order_dir: searchParams.get('order_dir') || 'DESC'
    });
  }, [searchParams]);

  // Cargar videos cuando cambian los searchParams
  useEffect(() => {
    loadVideos();
  }, [searchParams]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      // Leer directamente desde searchParams (fuente única de verdad)
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
        if (!params[key] && key !== 'per_page') delete params[key];
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
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Actualizar URL
    const newParams = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        newParams.set(key, newFilters[key]);
      }
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (filters.busqueda) {
      newParams.set('busqueda', filters.busqueda);
    }
    if (filters.materia_id) newParams.set('materia_id', filters.materia_id);
    if (filters.grado_id) newParams.set('grado_id', filters.grado_id);
    if (filters.order_by) newParams.set('order_by', filters.order_by);
    if (filters.order_dir) newParams.set('order_dir', filters.order_dir);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      busqueda: '',
      materia_id: '',
      grado_id: '',
      order_by: 'fecha_subida',
      order_dir: 'DESC'
    });
    setSearchParams(new URLSearchParams());
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Catálogo de Videos</h1>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Búsqueda */}
            <div>
              <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="busqueda"
                  value={filters.busqueda}
                  onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
                  placeholder="Buscar por título, descripción..."
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary px-6">
                  Buscar
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="materia_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Materia
                </label>
                <select
                  id="materia_id"
                  value={filters.materia_id}
                  onChange={(e) => handleFilterChange('materia_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">Todas las materias</option>
                  {materias.map(materia => (
                    <option key={materia.id} value={materia.id}>{materia.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="grado_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Grado
                </label>
                <select
                  id="grado_id"
                  value={filters.grado_id}
                  onChange={(e) => handleFilterChange('grado_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos los grados</option>
                  {grados.map(grado => (
                    <option key={grado.id} value={grado.id}>{grado.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="order_by" className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <select
                  id="order_by"
                  value={filters.order_by}
                  onChange={(e) => handleFilterChange('order_by', e.target.value)}
                  className="input-field"
                >
                  <option value="fecha_subida">Fecha de subida</option>
                  <option value="visualizaciones">Visualizaciones</option>
                  <option value="titulo">Título</option>
                </select>
              </div>

              <div>
                <label htmlFor="order_dir" className="block text-sm font-medium text-gray-700 mb-1">
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
            {(filters.busqueda || filters.materia_id || filters.grado_id) && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-secondary text-sm"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Cargando...' : `${pagination.total || 0} video${pagination.total !== 1 ? 's' : ''} encontrado${pagination.total !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Lista de Videos */}
        <VideoList videos={videos} loading={loading} />

        {/* Paginación */}
        {pagination.total_pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
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
                      className={`px-4 py-2 rounded-lg border ${
                        page === pagination.page
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === pagination.page - 3 || page === pagination.page + 3) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.total_pages}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VideosPage;
