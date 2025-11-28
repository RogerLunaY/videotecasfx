/**
 * Página de Gestión de Usuarios (Solo Admin)
 * Con filtros avanzados, búsqueda en tiempo real, vistas múltiples y acciones por lote
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  User, Shield, Search, Filter, LayoutGrid, LayoutList,
  Download, Trash2, ChevronUp, ChevronDown, Plus, X,
  Mail, Phone, Calendar, CheckSquare, Square
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import AsignarDocenteModal from '../components/Common/AsignarDocenteModal';
import { useAuth } from '../context/AuthContext';
import { getUsers, deleteUser } from '../services/userService';
import { formatDate } from '../utils/helpers';

const UsuariosPage = () => {
  const { isAdmin } = useAuth();

  // Cargar filtros y vista desde localStorage
  const loadFromStorage = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(`usuarios_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState(loadFromStorage('viewMode', 'list')); // 'list' o 'cards'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });

  const [filters, setFilters] = useState(loadFromStorage('filters', {
    rol_id: '',
    estado: '',
  }));

  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [batchDeleteModal, setBatchDeleteModal] = useState({ show: false });
  const [asignarModal, setAsignarModal] = useState({ show: false, docente: null });

  // Solo admins pueden acceder
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // Debounce para búsqueda en tiempo real
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Guardar filtros en localStorage
  useEffect(() => {
    localStorage.setItem('usuarios_filters', JSON.stringify(filters));
  }, [filters]);

  // Guardar modo de vista en localStorage
  useEffect(() => {
    localStorage.setItem('usuarios_viewMode', JSON.stringify(viewMode));
  }, [viewMode]);

  // Cargar usuarios cuando cambian filtros o página
  useEffect(() => {
    loadUsers();
  }, [pagination.page, filters, debouncedSearch]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        busqueda: debouncedSearch,
        ...filters
      };

      // Remover filtros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await getUsers(params);
      setUsers(response.usuarios || []);
      setPagination(response.pagination || pagination);
      setSelectedUsers([]); // Limpiar selección al recargar
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

  const handleBatchDelete = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await Promise.all(selectedUsers.map(userId => deleteUser(userId)));
      setBatchDeleteModal({ show: false });
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error deleting users:', error);
      alert('Error al eliminar usuarios');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'CI', 'Email', 'Rol', 'Estado', 'Teléfono', 'Fecha Registro'];
    const rows = users.map(user => [
      `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno || ''}`.trim(),
      user.ci,
      user.email,
      user.rol,
      user.estado,
      user.telefono || '',
      formatDate(user.fecha_registro)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1
  };

  const clearFilters = () => {
    setFilters({ rol_id: '', estado: '' });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Ordenar usuarios según configuración
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return users;

    const sorted = [...users].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Manejar campos especiales
      if (sortConfig.key === 'nombre_completo') {
        aValue = `${a.nombre} ${a.apellido_paterno}`;
        bValue = `${b.nombre} ${b.apellido_paterno}`;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [users, sortConfig]);

  const getRoleBadgeColor = (rol) => {
    switch (rol) {
      case 'Administrador':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300';
      case 'Docente':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getRoleCardColor = (rol) => {
    switch (rol) {
      case 'Administrador':
        return {
          border: 'border-purple-200 dark:border-purple-700',
          bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
          header: 'bg-purple-500 dark:bg-purple-700',
          icon: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
        };
      case 'Docente':
        return {
          border: 'border-blue-200 dark:border-blue-700',
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          header: 'bg-blue-500 dark:bg-blue-700',
          icon: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
        };
      default:
        return {
          border: 'border-green-200 dark:border-green-700',
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          header: 'bg-green-500 dark:bg-green-700',
          icon: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
        };
    }
  };

  const getEstadoBadgeColor = (estado) => {
    return estado === 'activo'
      ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
  };

  const getRoleIcon = (rol) => {
    return rol === 'Administrador' ? Shield : User;
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-600 mt-1">
              {pagination.total} usuario{pagination.total !== 1 ? 's' : ''} total{pagination.total !== 1 ? 'es' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-secondary flex items-center gap-2"
              disabled={users.length === 0}
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <Link to="/register" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </Link>
          </div>
        </div>

        {/* Barra de búsqueda y controles */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email, CI..."
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

            {/* Toggle de vista */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Vista de lista"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded ${viewMode === 'cards' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Vista de tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filtros en botones */}
          <div className="mt-4 space-y-3">
            {/* Filtro de Rol */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filtrar por Rol
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('rol_id', '')}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    filters.rol_id === ''
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => handleFilterChange('rol_id', '1')}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    filters.rol_id === '1'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Administradores
                </button>
                <button
                  onClick={() => handleFilterChange('rol_id', '2')}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    filters.rol_id === '2'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Docentes
                </button>
              </div>
            </div>

            {/* Filtro de Estado */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filtrar por Estado
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('estado', '')}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    filters.estado === ''
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => handleFilterChange('estado', 'activo')}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    filters.estado === 'activo'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  Activos
                </button>
                <button
                  onClick={() => handleFilterChange('estado', 'inactivo')}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    filters.estado === 'inactivo'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                  }`}
                >
                  Inactivos
                </button>
                <button
                  onClick={() => handleFilterChange('estado', 'bloqueado')}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    filters.estado === 'bloqueado'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'
                  }`}
                >
                  Bloqueados
                </button>
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {(filters.rol_id || filters.estado || searchTerm) && (
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-xs text-gray-600">Filtros activos</p>
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Acciones por lote */}
        {selectedUsers.length > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-primary-900">
              {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedUsers([])}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={() => setBatchDeleteModal({ show: true })}
                className="btn-danger text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar seleccionados
              </button>
            </div>
          </div>
        )}

        {/* Lista de Usuarios */}
        {loading ? (
          <LoadingSpinner />
        ) : sortedUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-600">
              {searchTerm || filters.rol_id || filters.estado
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando un nuevo usuario'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          // Vista de Lista
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={handleSelectAll}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedUsers.length === users.length ? (
                          <CheckSquare className="w-5 h-5 text-primary-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('nombre_completo')}
                    >
                      Usuario <SortIcon column="nombre_completo" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('email')}
                    >
                      Email <SortIcon column="email" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('rol')}
                    >
                      Rol <SortIcon column="rol" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('estado')}
                    >
                      Estado <SortIcon column="estado" />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('fecha_registro')}
                    >
                      Registro <SortIcon column="fecha_registro" />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.rol);
                    const isSelected = selectedUsers.includes(user.id);

                    return (
                      <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary-50' : ''}`}>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleSelectUser(user.id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-primary-600" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center group relative">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                                {user.nombre?.charAt(0)}{user.apellido_paterno?.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.nombre} {user.apellido_paterno}
                              </div>
                              <div className="text-sm text-gray-500">CI: {user.ci}</div>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-20 hidden group-hover:block">
                              <p className="font-semibold mb-2">
                                {user.nombre} {user.apellido_paterno} {user.apellido_materno || ''}
                              </p>
                              <div className="space-y-1">
                                <p className="flex items-center gap-2">
                                  <Mail className="w-3 h-3" /> {user.email}
                                </p>
                                {user.telefono && (
                                  <p className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> {user.telefono}
                                  </p>
                                )}
                                <p className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3" /> Registrado: {formatDate(user.fecha_registro)}
                                </p>
                              </div>
                              <div className="absolute bottom-full left-8 -mb-1 border-4 border-transparent border-b-gray-900"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.rol)}`}>
                            <RoleIcon className="w-3 h-3" />
                            {user.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadgeColor(user.estado)}`}>
                            {user.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.fecha_registro)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/usuarios/${user.id}/editar`}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            Editar
                          </Link>
                          {user.rol === 'Docente' && (
                            <button
                              onClick={() => setAsignarModal({ show: true, docente: user })}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Asignar
                            </button>
                          )}
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
        ) : (
          // Vista de Tarjetas con colores por rol
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.rol);
              const isSelected = selectedUsers.includes(user.id);
              const roleColors = getRoleCardColor(user.rol);

              return (
                <div
                  key={user.id}
                  className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 overflow-hidden ${
                    isSelected ? 'border-primary-500 ring-2 ring-primary-300' : roleColors.border
                  }`}
                >
                  {/* Header con color por rol */}
                  <div className={`${roleColors.header} p-4 relative`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-16 w-16 rounded-full bg-white/90 flex items-center justify-center font-bold text-2xl ${roleColors.icon}`}>
                          {user.nombre?.charAt(0)}{user.apellido_paterno?.charAt(0)}
                        </div>
                        <div className="text-white">
                          <h3 className="font-bold text-lg leading-tight">
                            {user.nombre}
                          </h3>
                          <p className="font-semibold opacity-90">
                            {user.apellido_paterno}
                          </p>
                          <p className="text-xs opacity-75 mt-1">CI: {user.ci}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectUser(user.id)}
                        className="text-white/80 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-6 h-6" />
                        ) : (
                          <Square className="w-6 h-6" />
                        )}
                      </button>
                    </div>

                    {/* Rol Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-md">
                        <RoleIcon className="w-3.5 h-3.5" />
                        {user.rol}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div className={`${roleColors.bg} p-4`}>
                    {/* Información principal */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                          <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="truncate font-medium">{user.email}</span>
                      </div>

                      {user.telefono && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                            <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="font-medium">{user.telefono}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm">
                          <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-medium">{formatDate(user.fecha_registro)}</span>
                      </div>
                    </div>

                    {/* Estado Badge */}
                    <div className="mb-4">
                      <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-lg shadow-sm ${getEstadoBadgeColor(user.estado)}`}>
                        {user.estado.toUpperCase()}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/usuarios/${user.id}/editar`}
                        className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm border border-gray-200 dark:border-gray-600"
                      >
                        Editar
                      </Link>
                      {user.rol === 'Docente' && (
                        <button
                          onClick={() => setAsignarModal({ show: true, docente: user })}
                          className="flex-1 text-center px-4 py-2.5 text-sm font-semibold bg-white dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors shadow-sm border border-blue-200 dark:border-blue-700"
                        >
                          Asignar
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteModal({ show: true, user })}
                        className="px-4 py-2.5 text-sm font-semibold bg-white dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors shadow-sm border border-red-200 dark:border-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación (fuera de vistas) */}
        {!loading && pagination.total_pages > 1 && (
          <div className="bg-white rounded-lg shadow-md mt-6 px-4 py-3 flex items-center justify-between">
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

      {/* Modal de Eliminación por Lote */}
      {batchDeleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Eliminar Usuarios Seleccionados</h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''}?
            </p>
            <p className="text-sm text-red-600 mb-6">
              Esta acción no se puede deshacer y eliminará permanentemente los usuarios seleccionados.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setBatchDeleteModal({ show: false })}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleBatchDelete}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar {selectedUsers.length}
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
          // Opcional: recargar lista o mostrar mensaje de éxito
          loadUsers();
        }}
      />
    </Layout>
  );
};

export default UsuariosPage;
