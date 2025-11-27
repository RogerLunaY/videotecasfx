/**
 * Página de Perfil de Usuario
 * Estilo Redes Sociales con Banner, Avatar, Tabs y Estadísticas
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Shield, BookOpen, GraduationCap, Calendar,
  Mail, Phone, MapPin, Award, Video, Clock, TrendingUp,
  Edit3, Camera, Check, X, Activity
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { updateUser, updatePassword } from '../services/userService';
import { getVideos } from '../services/videoService';
import { formatDate } from '../utils/helpers';

const PerfilPage = () => {
  const { user, updateUser: updateAuthUser, isDocente } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    videosSubidos: 0,
    totalVisualizaciones: 0,
    materiasAsignadas: 0,
    gradosAsignados: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Formulario de información
  const [infoForm, setInfoForm] = useState({
    nombre: user?.nombre || '',
    apellido_paterno: user?.apellido_paterno || '',
    apellido_materno: user?.apellido_materno || '',
    telefono: user?.telefono || '',
    email: user?.email || ''
  });

  // Formulario de contraseña
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isDocente()) {
      loadStats();
      loadRecentActivity();
    }
  }, []);

  const loadStats = async () => {
    try {
      // Cargar estadísticas del docente
      const response = await getVideos({ docente_id: user?.id });
      const videos = response.videos || [];

      setStats({
        videosSubidos: videos.length,
        totalVisualizaciones: videos.reduce((sum, v) => sum + (v.visualizaciones || 0), 0),
        materiasAsignadas: user?.materias?.length || 0,
        gradosAsignados: user?.grados?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const response = await getVideos({
        docente_id: user?.id,
        order_by: 'fecha_subida',
        order_dir: 'DESC',
        per_page: 5
      });
      setRecentActivity(response.videos || []);
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateInfo = () => {
    const newErrors = {};

    if (!infoForm.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!infoForm.apellido_paterno.trim()) {
      newErrors.apellido_paterno = 'El apellido paterno es requerido';
    }

    if (!infoForm.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(infoForm.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordForm.password) {
      newErrors.password = 'La contraseña actual es requerida';
    }

    if (!passwordForm.new_password) {
      newErrors.new_password = 'La nueva contraseña es requerida';
    } else if (passwordForm.new_password.length < 8) {
      newErrors.new_password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateInfo()) return;

    setLoading(true);

    try {
      const dataToSend = { ...infoForm };
      if (!dataToSend.apellido_materno?.trim()) delete dataToSend.apellido_materno;
      if (!dataToSend.telefono?.trim()) delete dataToSend.telefono;

      const response = await updateUser(user.id, dataToSend);
      updateAuthUser(response.usuario);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Error al actualizar perfil'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validatePassword()) return;

    setLoading(true);

    try {
      await updatePassword(user.id, passwordForm);
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setPasswordForm({
        password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Error al actualizar contraseña'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const nombre = user?.nombre || '';
    const apellido = user?.apellido_paterno || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const getRoleIcon = () => {
    return user?.rol === 'Administrador' ? Shield : User;
  };

  const RoleIcon = getRoleIcon();

  // Tabs configuration
  const tabs = [
    { id: 'info', label: 'Información', icon: User },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'activity', label: 'Actividad', icon: Activity, docenteOnly: true },
    { id: 'assignments', label: 'Asignaciones', icon: BookOpen, docenteOnly: true },
  ].filter(tab => !tab.docenteOnly || isDocente());

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Banner con Gradient */}
        <div className="relative">
          <div className="h-48 md:h-64 bg-gradient-to-r from-salesiano-azul-600 via-primary-500 to-salesiano-azul-400 relative overflow-hidden">
            {/* Patrón decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>
          </div>

          {/* Avatar y Info Básica */}
          <div className="container mx-auto px-4">
            <div className="relative -mt-20 md:-mt-24">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* Avatar Grande */}
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white p-2 shadow-xl">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-600 to-salesiano-azul-600 flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                      {getInitials()}
                    </div>
                  </div>
                  {/* Botón cambiar foto (futuro) */}
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                {/* Info del Usuario */}
                <div className="flex-1 text-center md:text-left mb-6 md:mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {user?.nombre} {user?.apellido_paterno} {user?.apellido_materno || ''}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                      user?.rol === 'Administrador'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      <RoleIcon className="w-4 h-4" />
                      {user?.rol}
                    </span>
                    {user?.email && (
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </span>
                    )}
                    {user?.fecha_registro && (
                      <span className="text-gray-600 text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Desde {formatDate(user.fecha_registro)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas (solo para docentes) */}
        {isDocente() && (
          <div className="container mx-auto px-4 mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Video className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.videosSubidos}</p>
                <p className="text-sm text-gray-600">Videos Subidos</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalVisualizaciones}</p>
                <p className="text-sm text-gray-600">Visualizaciones</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.materiasAsignadas}</p>
                <p className="text-sm text-gray-600">Materias</p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.gradosAsignados}</p>
                <p className="text-sm text-gray-600">Cursos</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Principal con Tabs Verticales */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar con Tabs Verticales */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMessage({ type: '', text: '' });
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6">
                {/* Mensajes de Éxito/Error */}
                {message.text && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    message.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {message.type === 'success' ? (
                      <Check className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 flex-shrink-0" />
                    )}
                    <p>{message.text}</p>
                  </div>
                )}

                {/* Tab: Información Personal */}
                {activeTab === 'info' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <User className="w-6 h-6 text-primary-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
                    </div>
                    <form onSubmit={handleInfoSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={infoForm.nombre}
                            onChange={handleInfoChange}
                            className={`input-field ${errors.nombre ? 'border-red-500' : ''}`}
                          />
                          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                        </div>

                        <div>
                          <label htmlFor="apellido_paterno" className="block text-sm font-medium text-gray-700 mb-2">
                            Apellido Paterno <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="apellido_paterno"
                            name="apellido_paterno"
                            value={infoForm.apellido_paterno}
                            onChange={handleInfoChange}
                            className={`input-field ${errors.apellido_paterno ? 'border-red-500' : ''}`}
                          />
                          {errors.apellido_paterno && <p className="mt-1 text-sm text-red-600">{errors.apellido_paterno}</p>}
                        </div>

                        <div>
                          <label htmlFor="apellido_materno" className="block text-sm font-medium text-gray-700 mb-2">
                            Apellido Materno
                          </label>
                          <input
                            type="text"
                            id="apellido_materno"
                            name="apellido_materno"
                            value={infoForm.apellido_materno}
                            onChange={handleInfoChange}
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Teléfono
                          </label>
                          <input
                            type="text"
                            id="telefono"
                            name="telefono"
                            value={infoForm.telefono}
                            onChange={handleInfoChange}
                            className="input-field"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={infoForm.email}
                            onChange={handleInfoChange}
                            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                          />
                          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Información de Cuenta
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">CI</p>
                                <p className="font-medium text-gray-900">{user?.ci || 'No especificado'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Rol</p>
                                <p className="font-medium text-gray-900">{user?.rol}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Estado</p>
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                  user?.estado === 'activo'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {user?.estado}
                                </span>
                              </div>
                              <div>
                                <p className="text-gray-500">Fecha de Registro</p>
                                <p className="font-medium text-gray-900">{formatDate(user?.fecha_registro)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard')}
                          className="btn-secondary"
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn-primary flex items-center gap-2"
                          disabled={loading}
                        >
                          <Check className="w-4 h-4" />
                          {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab: Seguridad */}
                {activeTab === 'security' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Lock className="w-6 h-6 text-primary-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Seguridad</h2>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                          <strong>Recomendación:</strong> Usa una contraseña segura de al menos 8 caracteres con letras, números y símbolos.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña Actual <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={passwordForm.password}
                          onChange={handlePasswordChange}
                          className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                      </div>

                      <div>
                        <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                          Nueva Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          id="new_password"
                          name="new_password"
                          value={passwordForm.new_password}
                          onChange={handlePasswordChange}
                          className={`input-field ${errors.new_password ? 'border-red-500' : ''}`}
                        />
                        {errors.new_password && <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>}
                      </div>

                      <div>
                        <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          id="new_password_confirmation"
                          name="new_password_confirmation"
                          value={passwordForm.new_password_confirmation}
                          onChange={handlePasswordChange}
                          className={`input-field ${errors.new_password_confirmation ? 'border-red-500' : ''}`}
                        />
                        {errors.new_password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.new_password_confirmation}</p>}
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordForm({
                              password: '',
                              new_password: '',
                              new_password_confirmation: ''
                            });
                            setErrors({});
                          }}
                          className="btn-secondary"
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn-primary flex items-center gap-2"
                          disabled={loading}
                        >
                          <Lock className="w-4 h-4" />
                          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab: Actividad Reciente (solo docentes) */}
                {activeTab === 'activity' && isDocente() && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Activity className="w-6 h-6 text-primary-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Actividad Reciente</h2>
                    </div>

                    {activityLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                      </div>
                    ) : recentActivity.length === 0 ? (
                      <div className="text-center py-12">
                        <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No hay actividad reciente</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Timeline de actividad */}
                        <div className="relative">
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                          {recentActivity.map((video, index) => (
                            <div key={video.id} className="relative pl-16 pb-8 last:pb-0">
                              <div className="absolute left-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <Video className="w-6 h-6 text-primary-600" />
                              </div>

                              <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900">{video.titulo}</h3>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(video.fecha_subida)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{video.descripcion}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {video.visualizaciones || 0} visualizaciones
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {video.materia}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" />
                                    {video.grado}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Asignaciones (solo docentes) */}
                {activeTab === 'assignments' && isDocente() && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <BookOpen className="w-6 h-6 text-primary-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Mis Asignaciones</h2>
                    </div>

                    <div className="space-y-6">
                      {/* Materias Asignadas */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                          Materias Asignadas
                        </h3>
                        {user?.materias && user.materias.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {user.materias.map((materia, index) => (
                              <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <p className="font-semibold text-purple-900">{materia.nombre}</p>
                                <p className="text-sm text-purple-600">{materia.sigla}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">No tienes materias asignadas</p>
                          </div>
                        )}
                      </div>

                      {/* Cursos/Grados Asignados */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-orange-600" />
                          Cursos Asignados
                        </h3>
                        {user?.grados && user.grados.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {user.grados.map((grado, index) => (
                              <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-orange-900">{grado.nivel}°</p>
                                <p className="text-sm text-orange-600">{grado.nombre}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">No tienes cursos asignados</p>
                          </div>
                        )}
                      </div>

                      {/* Contactar al Administrador */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Nota:</strong> Para modificar tus asignaciones de materias y cursos, contacta al administrador del sistema.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PerfilPage;
