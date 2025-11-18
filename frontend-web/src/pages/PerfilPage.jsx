/**
 * Página de Perfil de Usuario
 * Diseño: Modelo 2 (Social Media Style) + Tabs del Modelo 1
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { updateUser, updatePassword } from '../services/userService';
import { getInitials } from '../utils/helpers';

const PerfilPage = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Stats (mock data - ideally from API)
  const [stats, setStats] = useState({
    videos_subidos: 0,
    vistas_totales: 0,
    materias_asignadas: 0,
    cursos_asignados: 0
  });

  // Activity timeline (mock data)
  const [activities, setActivities] = useState([
    { id: 1, tipo: 'video_subido', descripcion: 'Subió el video "Introducción a React"', fecha: '2025-11-17T10:30:00' },
    { id: 2, tipo: 'perfil_actualizado', descripcion: 'Actualizó su información personal', fecha: '2025-11-15T14:20:00' },
    { id: 3, tipo: 'password_changed', descripcion: 'Cambió su contraseña', fecha: '2025-11-10T09:15:00' },
    { id: 4, tipo: 'login', descripcion: 'Inició sesión en la plataforma', fecha: '2025-11-17T08:00:00' }
  ]);

  // Assignments (mock data - for docentes)
  const [assignments, setAssignments] = useState([
    { id: 1, materia: 'Matemáticas', grado: '3ro de Secundaria', videos: 12 },
    { id: 2, materia: 'Física', grado: '4to de Secundaria', videos: 8 },
    { id: 3, materia: 'Química', grado: '5to de Secundaria', videos: 15 }
  ]);

  // Formulario de información
  const [infoForm, setInfoForm] = useState({
    nombre: user?.nombre || '',
    apellido_paterno: user?.apellido_paterno || '',
    apellido_materno: user?.apellido_materno || '',
    telefono: user?.telefono || '',
    email: user?.email || ''
  });

  const [originalInfoForm, setOriginalInfoForm] = useState({ ...infoForm });

  // Formulario de contraseña
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [errors, setErrors] = useState({});

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(infoForm) !== JSON.stringify(originalInfoForm);
    setHasUnsavedChanges(hasChanges || avatarFile !== null);
  }, [infoForm, originalInfoForm, avatarFile]);

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Por favor selecciona una imagen válida (JPG, PNG, GIF)' });
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setMessage({ type: 'error', text: 'La imagen es demasiado grande. Máximo 5MB' });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
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
      if (!dataToSend.apellido_materno.trim()) delete dataToSend.apellido_materno;
      if (!dataToSend.telefono.trim()) delete dataToSend.telefono;

      const response = await updateUser(user.id, dataToSend);
      updateAuthUser(response.usuario);
      setOriginalInfoForm({ ...infoForm });
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });

      // TODO: Upload avatar if avatarFile exists
      if (avatarFile) {
        // Avatar upload logic would go here
        setAvatarFile(null);
      }
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

      // Add to activity timeline
      setActivities(prev => [{
        id: Date.now(),
        tipo: 'password_changed',
        descripcion: 'Cambió su contraseña',
        fecha: new Date().toISOString()
      }, ...prev]);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Error al actualizar contraseña'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getActivityIcon = (tipo) => {
    switch (tipo) {
      case 'video_subido':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        );
      case 'perfil_actualizado':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'password_changed':
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        );
      case 'login':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const memberSince = user?.fecha_creacion
    ? new Date(user.fecha_creacion).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : 'Enero 2025';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Banner con Gradient y Avatar Grande */}
        <div className="bg-gradient-to-r from-salesiano-azul-600 via-salesiano-azul-500 to-salesiano-azul-600 relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute transform rotate-45 -right-20 -top-20 w-80 h-80 bg-white rounded-full"></div>
            <div className="absolute transform -rotate-45 -left-20 -bottom-20 w-80 h-80 bg-salesiano-amarillo-300 rounded-full"></div>
          </div>

          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar Grande */}
              <div className="relative group">
                <div className="w-36 h-36 md:w-40 md:h-40 bg-white rounded-full flex items-center justify-center text-salesiano-azul-600 text-5xl font-bold shadow-2xl ring-4 ring-white ring-opacity-50 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(`${user?.nombre || ''} ${user?.apellido_paterno || ''}`)
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-salesiano-amarillo-400 rounded-full flex items-center justify-center shadow-lg hover:bg-salesiano-amarillo-300 transition-all duration-300 hover:scale-110"
                  title="Cambiar foto de perfil"
                >
                  <svg className="w-5 h-5 text-salesiano-azul-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Info del Usuario */}
              <div className="flex-1 text-center md:text-left text-white">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                  {user?.nombre} {user?.apellido_paterno} {user?.apellido_materno}
                </h1>
                <div className="flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-lg font-medium capitalize">{user?.rol || 'Usuario'}</span>
                  </div>
                  <div className="hidden md:block w-1 h-1 bg-blue-200 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>U.E. San Francisco Xavier</span>
                  </div>
                  <div className="hidden md:block w-1 h-1 bg-blue-200 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Miembro desde {memberSince}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="container mx-auto px-4 -mt-8 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow duration-300 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Videos Subidos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.videos_subidos}</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow duration-300 animate-fade-in" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Vistas Totales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.vistas_totales}</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500 hover:shadow-xl transition-shadow duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Materias Asignadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.materias_asignadas}</p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-shadow duration-300 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Cursos Asignados</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.cursos_asignados}</p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal con Tabs Verticales */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-12">
            {/* Sidebar con Tabs Verticales */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('info');
                      setMessage({ type: '', text: '' });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === 'info'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:scale-102'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Información Personal</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('password');
                      setMessage({ type: '', text: '' });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === 'password'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:scale-102'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-medium">Seguridad</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('activity');
                      setMessage({ type: '', text: '' });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === 'activity'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:scale-102'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-medium">Mi Actividad</span>
                  </button>

                  {user?.rol === 'docente' && (
                    <button
                      onClick={() => {
                        setActiveTab('assignments');
                        setMessage({ type: '', text: '' });
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === 'assignments'
                          ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg scale-105'
                          : 'text-gray-700 hover:bg-gray-50 hover:scale-102'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-medium">Mis Asignaciones</span>
                    </button>
                  )}
                </nav>

                {/* Unsaved Changes Indicator */}
                {hasUnsavedChanges && activeTab === 'info' && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
                    <div className="flex items-center gap-2 text-amber-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-xs font-medium">Cambios sin guardar</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-8">
                {message.text && (
                  <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-fade-in ${
                    message.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {message.type === 'success' ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="font-medium">{message.text}</span>
                  </div>
                )}

                {/* Tab: Información Personal */}
                {activeTab === 'info' && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
                        <p className="text-sm text-gray-600">Actualiza tu información de perfil</p>
                      </div>
                    </div>

                    <form onSubmit={handleInfoSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={infoForm.nombre}
                            onChange={handleInfoChange}
                            className={`input-field ${errors.nombre ? 'border-red-500 ring-2 ring-red-200' : 'focus:ring-2 focus:ring-primary-200'}`}
                            placeholder="Tu nombre"
                          />
                          {errors.nombre && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {errors.nombre}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="apellido_paterno" className="block text-sm font-semibold text-gray-700 mb-2">
                            Apellido Paterno *
                          </label>
                          <input
                            type="text"
                            id="apellido_paterno"
                            name="apellido_paterno"
                            value={infoForm.apellido_paterno}
                            onChange={handleInfoChange}
                            className={`input-field ${errors.apellido_paterno ? 'border-red-500 ring-2 ring-red-200' : 'focus:ring-2 focus:ring-primary-200'}`}
                            placeholder="Tu apellido paterno"
                          />
                          {errors.apellido_paterno && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {errors.apellido_paterno}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="apellido_materno" className="block text-sm font-semibold text-gray-700 mb-2">
                            Apellido Materno
                          </label>
                          <input
                            type="text"
                            id="apellido_materno"
                            name="apellido_materno"
                            value={infoForm.apellido_materno}
                            onChange={handleInfoChange}
                            className="input-field focus:ring-2 focus:ring-primary-200"
                            placeholder="Tu apellido materno (opcional)"
                          />
                        </div>

                        <div>
                          <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                            Teléfono
                          </label>
                          <input
                            type="text"
                            id="telefono"
                            name="telefono"
                            value={infoForm.telefono}
                            onChange={handleInfoChange}
                            className="input-field focus:ring-2 focus:ring-primary-200"
                            placeholder="+591 12345678 (opcional)"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={infoForm.email}
                            onChange={handleInfoChange}
                            className={`input-field ${errors.email ? 'border-red-500 ring-2 ring-red-200' : 'focus:ring-2 focus:ring-primary-200'}`}
                            placeholder="tu.email@ejemplo.com"
                          />
                          {errors.email && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            setInfoForm({ ...originalInfoForm });
                            setAvatarFile(null);
                            setAvatarPreview(null);
                            setErrors({});
                          }}
                          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Guardar Cambios
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab: Seguridad */}
                {activeTab === 'password' && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Seguridad</h2>
                        <p className="text-sm text-gray-600">Actualiza tu contraseña</p>
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">Requisitos de contraseña:</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>Mínimo 8 caracteres</li>
                            <li>Al menos una letra mayúscula</li>
                            <li>Al menos un número</li>
                            <li>Al menos un carácter especial (!@#$%^&*)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                          Contraseña Actual *
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={passwordForm.password}
                          onChange={handlePasswordChange}
                          className={`input-field ${errors.password ? 'border-red-500 ring-2 ring-red-200' : 'focus:ring-2 focus:ring-primary-200'}`}
                          placeholder="Tu contraseña actual"
                        />
                        {errors.password && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="new_password" className="block text-sm font-semibold text-gray-700 mb-2">
                          Nueva Contraseña *
                        </label>
                        <input
                          type="password"
                          id="new_password"
                          name="new_password"
                          value={passwordForm.new_password}
                          onChange={handlePasswordChange}
                          className={`input-field ${errors.new_password ? 'border-red-500 ring-2 ring-red-200' : 'focus:ring-2 focus:ring-primary-200'}`}
                          placeholder="Tu nueva contraseña"
                        />
                        {errors.new_password && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.new_password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="new_password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirmar Nueva Contraseña *
                        </label>
                        <input
                          type="password"
                          id="new_password_confirmation"
                          name="new_password_confirmation"
                          value={passwordForm.new_password_confirmation}
                          onChange={handlePasswordChange}
                          className={`input-field ${errors.new_password_confirmation ? 'border-red-500 ring-2 ring-red-200' : 'focus:ring-2 focus:ring-primary-200'}`}
                          placeholder="Confirma tu nueva contraseña"
                        />
                        {errors.new_password_confirmation && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {errors.new_password_confirmation}
                          </p>
                        )}
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
                          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-medium hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Actualizando...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Actualizar Contraseña
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tab: Mi Actividad */}
                {activeTab === 'activity' && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Mi Actividad</h2>
                        <p className="text-sm text-gray-600">Historial de acciones recientes</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <div
                          key={activity.id}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {getActivityIcon(activity.tipo)}
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{activity.descripcion}</p>
                            <p className="text-sm text-gray-600 mt-1">{formatDate(activity.fecha)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {activities.length === 0 && (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600 font-medium">No hay actividad reciente</p>
                        <p className="text-sm text-gray-500 mt-1">Tus acciones aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Mis Asignaciones (solo docentes) */}
                {activeTab === 'assignments' && user?.rol === 'docente' && (
                  <div className="animate-fade-in">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Mis Asignaciones</h2>
                        <p className="text-sm text-gray-600">Materias y cursos asignados</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignments.map((assignment, index) => (
                        <div
                          key={assignment.id}
                          className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg p-6 hover:shadow-lg transition-shadow animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                              {assignment.materia.charAt(0)}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary-700">{assignment.videos}</div>
                              <div className="text-xs text-gray-600">videos</div>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{assignment.materia}</h3>
                          <p className="text-sm text-gray-600 mb-4">{assignment.grado}</p>
                          <button
                            onClick={() => navigate(`/videos?materia=${assignment.materia}&grado=${assignment.grado}`)}
                            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                          >
                            Ver Videos
                          </button>
                        </div>
                      ))}
                    </div>

                    {assignments.length === 0 && (
                      <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-gray-600 font-medium">No tienes asignaciones</p>
                        <p className="text-sm text-gray-500 mt-1">Contacta al administrador para asignar materias</p>
                      </div>
                    )}
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
