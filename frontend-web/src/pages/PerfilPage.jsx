/**
 * Página de Perfil de Usuario
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { updateUser, updatePassword } from '../services/userService';
import { getInitials } from '../utils/helpers';

const PerfilPage = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
      if (!dataToSend.apellido_materno.trim()) delete dataToSend.apellido_materno;
      if (!dataToSend.telefono.trim()) delete dataToSend.telefono;

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {getInitials(user?.nombre || '')}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.nombre} {user?.apellido_paterno}
                </h2>
                <p className="text-sm text-gray-600">{user?.rol}</p>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'info'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Información Personal
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === 'password'
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cambiar Contraseña
                </button>
              </nav>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-600'
                    : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                  {message.text}
                </div>
              )}

              {activeTab === 'info' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Personal</h2>
                  <form onSubmit={handleInfoSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre *
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
                        <label htmlFor="apellido_paterno" className="block text-sm font-medium text-gray-700 mb-1">
                          Apellido Paterno *
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
                        <label htmlFor="apellido_materno" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
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
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
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
                        className="btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Cambiar Contraseña</h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña Actual *
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
                      <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña *
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
                      <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nueva Contraseña *
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

                    <div className="flex justify-end space-x-4 pt-4 border-t">
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
                        className="btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PerfilPage;
