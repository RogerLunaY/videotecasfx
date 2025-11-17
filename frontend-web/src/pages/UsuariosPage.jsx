/**
 * Página de Gestión de Usuarios (Solo Admin)
 */

import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getUsers, deleteUser } from '../services/userService';
import { formatDate } from '../utils/helpers';

const UsuariosPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
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
    busqueda: ''
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });

  // Solo admins pueden acceder
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadUsers();
  }, [pagination.page, filters]);

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <Link to="/register" className="btn-primary">
            Nuevo Usuario
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                id="busqueda"
                value={filters.busqueda}
                onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
                placeholder="Nombre, email..."
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="rol_id" className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                id="rol_id"
                value={filters.rol_id}
                onChange={(e) => setFilters({ ...filters, rol_id: e.target.value })}
                className="input-field"
              >
                <option value="">Todos los roles</option>
                <option value="1">Administrador</option>
                <option value="2">Docente</option>
              </select>
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="estado"
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                className="input-field"
              >
                <option value="">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
                <option value="bloqueado">Bloqueados</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ rol_id: '', estado: '', busqueda: '' })}
                className="btn-secondary w-full"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asignación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const nombreCompleto = `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno || ''}`.trim();
                    const tieneAsignacion = user.materias_asignadas && user.materias_asignadas.trim() !== '';

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-salesiano-azul-600 text-white flex items-center justify-center font-semibold">
                                {user.nombre?.charAt(0)}{user.apellido_paterno?.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {nombreCompleto}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.rol === 'Docente' ? (
                            tieneAsignacion ? (
                              <div className="text-sm text-gray-900">
                                Profesor de <span className="font-medium">{user.materias_asignadas}</span>
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-red-600">
                                Sin asignar
                              </span>
                            )
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.rol)}`}>
                            {user.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.fecha_registro)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeColor(user.estado)}`}>
                            {user.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/usuarios/${user.id}/editar`}
                            className="text-salesiano-azul-600 hover:text-salesiano-azul-900 mr-4"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ show: true, user })}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.total_pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.total_pages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.per_page + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.per_page, pagination.total)}
                      </span>{' '}
                      de <span className="font-medium">{pagination.total}</span> resultados
                    </p>
                  </div>
                  <div>
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar al usuario "{deleteModal.user?.nombre} {deleteModal.user?.apellido_paterno}"?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModal({ show: false, user: null })}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UsuariosPage;
