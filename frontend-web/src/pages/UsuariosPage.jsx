/**
 * Página de Gestión de Usuarios (Solo Admin)
 * Diseño con Cards, Filtros con Botones, Búsqueda en Tiempo Real y Animaciones
 */

import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import AsignarDocenteModal from '../components/Common/AsignarDocenteModal';
import { useAuth } from '../context/AuthContext';
import { getUsers, deleteUser } from '../services/userService';
import { getMaterias } from '../services/materiaService';
import { getGrados } from '../services/gradoService';
import { formatDate, debounce } from '../utils/helpers';

const UsuariosPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });
  const [filters, setFilters] = useState({
    rol_id: '',
    estado: '',
    materia_id: '',
    grado_id: '',
    busqueda: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [asignarModal, setAsignarModal] = useState({ show: false, docente: null });

  // Solo admins pueden acceder
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadUsers();
    loadMaterias();
    loadGrados();
  }, [pagination.page, filters]);

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setFilters(prev => ({ ...prev, busqueda: searchInput }));
      setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1
    }, 500);

    debouncedSearch();
  }, [searchInput]);

  const loadMaterias = async () => {
    try {
      const data = await getMaterias();
      setMaterias(data || []);
    } catch (error) {
      console.error('Error loading materias:', error);
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

  // Helper para obtener siglas de materia (primeras letras de cada palabra)
  const getSiglas = (nombre) => {
    return nombre
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Helper para obtener primera palabra
  const getFirstWord = (nombre) => {
    return nombre.split(' ')[0];
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...filters
      };

      // Remover filtros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await getUsers(params);
      setUsers(response.usuarios || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    try {
      await deleteUser(deleteModal.user.id);
      setDeleteModal({ show: false, user: null });
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar usuario');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRolFilter = (rolId) => {
    setFilters(prev => ({ ...prev, rol_id: prev.rol_id === rolId ? '' : rolId }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEstadoFilter = (estado) => {
    setFilters(prev => ({ ...prev, estado: prev.estado === estado ? '' : estado }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleMateriaFilter = (materiaId) => {
    setFilters(prev => ({ ...prev, materia_id: prev.materia_id === materiaId ? '' : materiaId }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleGradoFilter = (gradoId) => {
    setFilters(prev => ({ ...prev, grado_id: prev.grado_id === gradoId ? '' : gradoId }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ rol_id: '', estado: '', materia_id: '', grado_id: '', busqueda: '' });
    setSearchInput('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getRoleBadgeColor = (rol) => {
    switch (rol) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-800';
      case 'Docente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoBadgeColor = (estado) => {
    return estado === 'activo'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header - Primera Fila */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            {pagination.total > 0 && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold">
                {pagination.total} usuario{pagination.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Link
            to="/register"
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Usuario
          </Link>
        </div>

        {/* Búsqueda - Segunda Fila */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
              placeholder="Buscar por nombre, email, CI..."
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {/* Filtros en Grid de 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Columna 1: Filtros por Rol y Estado */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {/* Filtro de Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Rol:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleRolFilter('1')}
                  className={`px-3 py-1 text-sm rounded-full font-semibold transition ${
                    filters.rol_id === '1'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleRolFilter('2')}
                  className={`px-3 py-1 text-sm rounded-full font-semibold transition ${
                    filters.rol_id === '2'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Docente
                </button>
              </div>
            </div>

            {/* Filtro de Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Estado:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEstadoFilter('activo')}
                  className={`px-3 py-1 text-sm rounded-full font-semibold transition ${
                    filters.estado === 'activo'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  Activo
                </button>
                <button
                  onClick={() => handleEstadoFilter('inactivo')}
                  className={`px-3 py-1 text-sm rounded-full font-semibold transition ${
                    filters.estado === 'inactivo'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Inactivo
                </button>
                <button
                  onClick={() => handleEstadoFilter('bloqueado')}
                  className={`px-3 py-1 text-sm rounded-full font-semibold transition ${
                    filters.estado === 'bloqueado'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bloqueado
                </button>
              </div>
            </div>
          </div>

          {/* Columna 2: Filtros por Materia y Curso */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {/* Filtro de Materia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Materia:
              </label>
              <div className="flex flex-wrap gap-2">
                {materias.map((materia) => (
                  <button
                    key={materia.id}
                    onClick={() => handleMateriaFilter(materia.id.toString())}
                    className={`px-2.5 py-1 text-xs rounded-full font-bold transition ${
                      filters.materia_id === materia.id.toString()
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                    title={materia.nombre}
                  >
                    {getSiglas(materia.nombre)}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de Curso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Curso:
              </label>
              <div className="flex flex-wrap gap-2">
                {grados.map((grado) => (
                  <button
                    key={grado.id}
                    onClick={() => handleGradoFilter(grado.id.toString())}
                    className={`px-3 py-1 text-sm rounded-full font-semibold transition ${
                      filters.grado_id === grado.id.toString()
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                    title={grado.nombre}
                  >
                    {getFirstWord(grado.nombre)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botón Limpiar Filtros */}
        {(filters.rol_id || filters.estado || filters.materia_id || filters.grado_id || filters.busqueda) && (
          <div className="mb-6">
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar Filtros
            </button>
          </div>
        )}

        {/* Grid de Cards */}
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500">
              {filters.busqueda || filters.rol_id || filters.estado
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando un nuevo usuario'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Header del Card */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center font-bold text-xl">
                          {user.nombre?.charAt(0)}{user.apellido_paterno?.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">
                          {user.nombre} {user.apellido_paterno}
                        </h3>
                        <p className="text-sm text-white text-opacity-90 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body del Card */}
                  <div className="p-6">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        CI: {user.ci}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rol:</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.rol)}`}>
                          {user.rol}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Estado:</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeColor(user.estado)}`}>
                          {user.estado}
                        </span>
                      </div>

                      <div className="flex items-center text-xs text-gray-500 pt-2 border-t">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Registrado {formatDate(user.fecha_registro)}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <Link
                        to={`/usuarios/${user.id}/editar`}
                        className="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-center transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Link>

                      {user.rol === 'Docente' && (
                        <button
                          onClick={() => setAsignarModal({ show: true, docente: user })}
                          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          Asignar Materias/Grados
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteModal({ show: true, user })}
                        className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {pagination.total_pages > 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
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
          </>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6 text-center">
              ¿Estás seguro de que deseas eliminar al usuario <strong>"{deleteModal.user?.nombre} {deleteModal.user?.apellido_paterno}"</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, user: null })}
                className="btn-secondary transition-all duration-200 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger transition-all duration-200 hover:scale-105"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Asignación de Materias y Grados */}
      <AsignarDocenteModal
        show={asignarModal.show}
        docente={asignarModal.docente}
        onClose={() => setAsignarModal({ show: false, docente: null })}
        onSuccess={() => {
          loadUsers();
        }}
      />

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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out backwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </Layout>
  );
};

export default UsuariosPage;
