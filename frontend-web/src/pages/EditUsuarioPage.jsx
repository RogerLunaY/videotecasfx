/**
 * Página de Edición de Usuario (solo para admins)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../hooks/useResources';
import { getUserById, updateUser } from '../services/userService';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const EditUsuarioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { roles, loading: resourcesLoading } = useResources();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    email: '',
    telefono: '',
    rol_id: '',
    estado: 'activo',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Solo admins pueden acceder
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const user = await getUserById(id);

      setFormData({
        nombre: user.nombre || '',
        apellido_paterno: user.apellido_paterno || '',
        apellido_materno: user.apellido_materno || '',
        ci: user.ci || '',
        email: user.email || '',
        telefono: user.telefono || '',
        rol_id: user.rol_id || '',
        estado: user.estado || 'activo',
      });
    } catch (error) {
      console.error('Error loading user:', error);
      setErrorMessage('Error al cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.rol_id) {
      newErrors.rol_id = 'El rol es requerido';
    }

    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido';
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

    setSaving(true);

    try {
      const dataToSend = { ...formData };

      // Remover campos vacíos opcionales
      if (!dataToSend.apellido_materno.trim()) delete dataToSend.apellido_materno;
      if (!dataToSend.telefono.trim()) delete dataToSend.telefono;

      await updateUser(id, dataToSend);

      setSuccessMessage('Usuario actualizado exitosamente');

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/usuarios');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  if (loading || resourcesLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Usuario</h1>

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

                  <div>
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
                </div>
              </div>

              {/* Rol y Estado */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rol y Estado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className={`input-field ${errors.estado ? 'border-red-500' : ''}`}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="bloqueado">Bloqueado</option>
                    </select>
                    {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado}</p>}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Nota:</strong> Para cambiar la contraseña del usuario, use la función "Cambiar Contraseña" en el perfil del usuario.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/usuarios')}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditUsuarioPage;
