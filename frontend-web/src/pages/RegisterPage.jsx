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
  const { roles, materias, grados, loading: resourcesLoading } = useResources();

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

  const [selectedMaterias, setSelectedMaterias] = useState([]);
  const [selectedGrados, setSelectedGrados] = useState([]);

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

  const handleToggleMateria = (materiaId) => {
    setSelectedMaterias(prev => {
      if (prev.includes(materiaId)) {
        // Deseleccionar
        return prev.filter(id => id !== materiaId);
      } else {
        // Seleccionar solo si no se ha alcanzado el máximo
        if (prev.length >= 2) {
          setErrors(prev => ({
            ...prev,
            materias: 'Solo puede seleccionar hasta 2 materias'
          }));
          return prev;
        }
        setErrors(prev => ({
          ...prev,
          materias: ''
        }));
        return [...prev, materiaId];
      }
    });
  };

  const handleToggleGrado = (gradoId) => {
    setSelectedGrados(prev => {
      if (prev.includes(gradoId)) {
        // Deseleccionar
        return prev.filter(id => id !== gradoId);
      } else {
        // Seleccionar solo si no se ha alcanzado el máximo
        if (prev.length >= 6) {
          setErrors(prev => ({
            ...prev,
            grados: 'Solo puede seleccionar hasta 6 grados'
          }));
          return prev;
        }
        setErrors(prev => ({
          ...prev,
          grados: ''
        }));
        return [...prev, gradoId];
      }
    });
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
      const dataToSend = {
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        ci: formData.ci,
        email: formData.email,
        password: formData.password,
        rol_id: formData.rol_id,
      };

      // Agregar campos opcionales si tienen valor
      if (formData.apellido_materno.trim()) {
        dataToSend.apellido_materno = formData.apellido_materno;
      }
      if (formData.telefono.trim()) {
        dataToSend.telefono = formData.telefono;
      }

      // Agregar asignaciones si hay selecciones
      if (selectedMaterias.length > 0) {
        dataToSend.materias_ids = selectedMaterias;
      }
      if (selectedGrados.length > 0) {
        dataToSend.grados_ids = selectedGrados;
      }

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
      setSelectedMaterias([]);
      setSelectedGrados([]);

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
        <div className="max-w-7xl mx-auto">
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

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* COLUMNA IZQUIERDA: Datos Personales */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-salesiano-azul-700 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Datos Personales
                </h3>

                <div className="space-y-4">
                  {/* Nombre */}
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
                      placeholder="Ej: Juan"
                    />
                    {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                  </div>

                  {/* Apellido Paterno */}
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
                      placeholder="Ej: Pérez"
                    />
                    {errors.apellido_paterno && <p className="mt-1 text-sm text-red-600">{errors.apellido_paterno}</p>}
                  </div>

                  {/* Apellido Materno */}
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
                      placeholder="Ej: García"
                    />
                  </div>

                  {/* CI */}
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
                      placeholder="Ej: 12345678"
                    />
                    {errors.ci && <p className="mt-1 text-sm text-red-600">{errors.ci}</p>}
                  </div>

                  {/* Teléfono */}
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
                      placeholder="Ej: 70123456"
                    />
                  </div>

                  {/* Email */}
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
                      placeholder="Ej: usuario@ejemplo.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Contraseña */}
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
                      placeholder="Mínimo 8 caracteres"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  {/* Confirmar Contraseña */}
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
                      placeholder="Repite la contraseña"
                    />
                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: Rol y Asignaciones */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-salesiano-azul-700 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Rol y Asignaciones
                </h3>

                <div className="space-y-6">
                  {/* Rol */}
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

                  {/* Materias (solo para docentes) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asignación de Materias
                      <span className="text-gray-500 text-xs ml-2">(Máximo 2 materias)</span>
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                      {materias.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No hay materias disponibles</p>
                      ) : (
                        <div className="space-y-2">
                          {materias.map((materia) => (
                            <label
                              key={materia.id}
                              className={`flex items-center p-2 rounded-lg hover:bg-white cursor-pointer transition ${
                                selectedMaterias.includes(materia.id) ? 'bg-white shadow-sm' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedMaterias.includes(materia.id)}
                                onChange={() => handleToggleMateria(materia.id)}
                                disabled={!selectedMaterias.includes(materia.id) && selectedMaterias.length >= 2}
                                className="w-4 h-4 text-salesiano-azul-600 border-gray-300 rounded focus:ring-salesiano-azul-500"
                              />
                              <span className="ml-3 text-sm text-gray-900">
                                {materia.nombre}
                              </span>
                              <span className="ml-auto text-xs text-gray-500">
                                {materia.sigla}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {selectedMaterias.length}/2 materias seleccionadas
                    </p>
                    {errors.materias && <p className="mt-1 text-sm text-red-600">{errors.materias}</p>}
                  </div>

                  {/* Grados/Cursos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asignación de Grados/Cursos
                      <span className="text-gray-500 text-xs ml-2">(Máximo 6 grados)</span>
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                      {grados.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No hay grados disponibles</p>
                      ) : (
                        <div className="space-y-2">
                          {grados.map((grado) => (
                            <label
                              key={grado.id}
                              className={`flex items-center p-2 rounded-lg hover:bg-white cursor-pointer transition ${
                                selectedGrados.includes(grado.id) ? 'bg-white shadow-sm' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedGrados.includes(grado.id)}
                                onChange={() => handleToggleGrado(grado.id)}
                                disabled={!selectedGrados.includes(grado.id) && selectedGrados.length >= 6}
                                className="w-4 h-4 text-salesiano-azul-600 border-gray-300 rounded focus:ring-salesiano-azul-500"
                              />
                              <span className="ml-3 text-sm text-gray-900">
                                {grado.nombre}
                              </span>
                              {grado.sigla && (
                                <span className="ml-auto text-xs text-gray-500">
                                  {grado.sigla}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {selectedGrados.length}/6 grados seleccionados
                    </p>
                    {errors.grados && <p className="mt-1 text-sm text-red-600">{errors.grados}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex items-center justify-end space-x-4">
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
    </Layout>
  );
};

export default RegisterPage;
