/**
 * Página de Registro (solo para admins)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../hooks/useResources';
import { registerUser } from '../services/authService';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { roles, loading: resourcesLoading } = useResources();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    email: '',
    password: '',
    password_confirmation: '',
    telefono: '',
    rol_id: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Solo admins pueden acceder
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido_paterno.trim()) {
      newErrors.apellido_paterno = 'El apellido paterno es requerido';
    }

    if (!formData.ci.trim()) {
      newErrors.ci = 'El CI es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }

    if (!formData.rol_id) {
      newErrors.rol_id = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSend = { ...formData };

      // Remover campos vacíos opcionales
      if (!dataToSend.apellido_materno.trim()) delete dataToSend.apellido_materno;
      if (!dataToSend.telefono.trim()) delete dataToSend.telefono;
      delete dataToSend.password_confirmation;

      await registerUser(dataToSend);

      setSuccessMessage('Usuario registrado exitosamente');

      // Resetear formulario
      setFormData({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        ci: '',
        email: '',
        password: '',
        password_confirmation: '',
        telefono: '',
        rol_id: '',
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/usuarios');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (resourcesLoading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Registrar Nuevo Usuario</h1>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Personal */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
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
                      value={formData.apellido_paterno}
                      onChange={handleChange}
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
                      value={formData.apellido_materno}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label htmlFor="ci" className="block text-sm font-medium text-gray-700 mb-1">
                      CI *
                    </label>
                    <input
                      type="text"
                      id="ci"
                      name="ci"
                      value={formData.ci}
                      onChange={handleChange}
                      className={`input-field ${errors.ci ? 'border-red-500' : ''}`}
                    />
                    {errors.ci && <p className="mt-1 text-sm text-red-600">{errors.ci}</p>}
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Credenciales */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Credenciales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña *
                    </label>
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={`input-field ${errors.password_confirmation ? 'border-red-500' : ''}`}
                    />
                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                  </div>
                </div>
              </div>

              {/* Rol */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rol del Sistema</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="rol_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Rol *
                    </label>
                    <select
                      id="rol_id"
                      name="rol_id"
                      value={formData.rol_id}
                      onChange={handleChange}
                      className={`input-field ${errors.rol_id ? 'border-red-500' : ''}`}
                    >
                      <option value="">Seleccionar rol</option>
                      {roles.map(rol => (
                        <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                      ))}
                    </select>
                    {errors.rol_id && <p className="mt-1 text-sm text-red-600">{errors.rol_id}</p>}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Nota:</strong> Para asignar materias y grados a docentes, use el botón "Asignar" en la lista de usuarios después de crear el usuario.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/usuarios')}
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
                  {loading ? 'Registrando...' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
