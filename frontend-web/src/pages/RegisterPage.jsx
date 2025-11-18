/**
 * Página de Registro (solo para admins)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../hooks/useResources';
import { registerUser } from '../services/authService';
import { actualizarAsignaciones } from '../services/docenteAsignacionService';
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

  // Arrays para selección múltiple de materias y grados (solo docentes)
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [gradosSeleccionados, setGradosSeleccionados] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Límites
  const MAX_MATERIAS = 3;
  const MAX_GRADOS = 6;

  // Establecer rol "Docente" como predeterminado cuando se carguen los roles
  useEffect(() => {
    if (roles.length > 0 && !formData.rol_id) {
      const rolDocente = roles.find(r => r.nombre === 'Docente');
      if (rolDocente) {
        setFormData(prev => ({ ...prev, rol_id: rolDocente.id }));
      }
    }
  }, [roles]);

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

  const handleRolClick = (rolId) => {
    setFormData(prev => ({ ...prev, rol_id: rolId }));
    // Si cambia de docente a otro rol, limpiar asignaciones
    const rolSeleccionado = roles.find(r => r.id === rolId);
    if (rolSeleccionado && rolSeleccionado.nombre !== 'Docente') {
      setMateriasSeleccionadas([]);
      setGradosSeleccionados([]);
    }
    if (errors.rol_id) {
      setErrors(prev => ({ ...prev, rol_id: '' }));
    }
  };

  const handleMateriaToggle = (materiaId) => {
    setMateriasSeleccionadas(prev => {
      if (prev.includes(materiaId)) {
        return prev.filter(id => id !== materiaId);
      } else {
        if (prev.length >= MAX_MATERIAS) {
          setErrorMessage(`Solo puedes seleccionar hasta ${MAX_MATERIAS} materias`);
          setTimeout(() => setErrorMessage(''), 3000);
          return prev;
        }
        return [...prev, materiaId];
      }
    });
  };

  const handleGradoToggle = (gradoId) => {
    setGradosSeleccionados(prev => {
      if (prev.includes(gradoId)) {
        return prev.filter(id => id !== gradoId);
      } else {
        if (prev.length >= MAX_GRADOS) {
          setErrorMessage(`Solo puedes seleccionar hasta ${MAX_GRADOS} grados`);
          setTimeout(() => setErrorMessage(''), 3000);
          return prev;
        }
        return [...prev, gradoId];
      }
    });
  };

  const getFirstWord = (text) => {
    if (!text) return '';
    return text.split(' ')[0];
  };

  const isDocente = () => {
    const rolSeleccionado = roles.find(r => r.id === formData.rol_id);
    return rolSeleccionado && rolSeleccionado.nombre === 'Docente';
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

    // Validaciones para docentes
    if (isDocente()) {
      if (materiasSeleccionadas.length === 0) {
        newErrors.materias = 'Debes seleccionar al menos una materia para el docente';
      }
      if (gradosSeleccionados.length === 0) {
        newErrors.grados = 'Debes seleccionar al menos un grado para el docente';
      }
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

      const response = await registerUser(dataToSend);
      const usuarioCreado = response.usuario || response;

      // Si es docente, crear las asignaciones
      if (isDocente() && usuarioCreado.id) {
        await actualizarAsignaciones(
          usuarioCreado.id,
          materiasSeleccionadas,
          gradosSeleccionados
        );
      }

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
      setMateriasSeleccionadas([]);
      setGradosSeleccionados([]);

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
              {/* COLUMNA IZQUIERDA: ROL Y DATOS PERSONALES */}
              <div className="space-y-6">
                {/* Selección de Rol (Botones) */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Seleccionar Rol *
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {roles.map(rol => (
                      <button
                        key={rol.id}
                        type="button"
                        onClick={() => handleRolClick(rol.id)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          formData.rol_id === rol.id
                            ? 'bg-primary-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {rol.nombre}
                      </button>
                    ))}
                  </div>
                  {errors.rol_id && (
                    <p className="mt-2 text-sm text-red-600">{errors.rol_id}</p>
                  )}
                </div>

                {/* Datos Personales */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h3>
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

                    <div className="md:col-span-2">
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
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Credenciales</h3>
                  <div className="space-y-4">
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
              </div>

              {/* COLUMNA DERECHA: ASIGNACIONES (SOLO DOCENTE) */}
              {isDocente() && (
                <div className="space-y-6">
                  {/* Materias */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Materias ({materiasSeleccionadas.length}/{MAX_MATERIAS})
                      </h3>
                      <span className="text-xs text-gray-500">
                        Máximo {MAX_MATERIAS}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {materias.map(materia => (
                        <button
                          key={materia.id}
                          type="button"
                          onClick={() => handleMateriaToggle(materia.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            materiasSeleccionadas.includes(materia.id)
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {materia.nombre}
                        </button>
                      ))}
                    </div>

                    {errors.materias && (
                      <p className="mt-2 text-sm text-red-600">{errors.materias}</p>
                    )}

                    {materiasSeleccionadas.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                          <strong>Seleccionadas:</strong> {materias.filter(m => materiasSeleccionadas.includes(m.id)).map(m => m.nombre).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Grados/Cursos */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Grados/Cursos ({gradosSeleccionados.length}/{MAX_GRADOS})
                      </h3>
                      <span className="text-xs text-gray-500">
                        Máximo {MAX_GRADOS}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {grados.map(grado => (
                        <button
                          key={grado.id}
                          type="button"
                          onClick={() => handleGradoToggle(grado.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            gradosSeleccionados.includes(grado.id)
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {getFirstWord(grado.nombre)}
                        </button>
                      ))}
                    </div>

                    {errors.grados && (
                      <p className="mt-2 text-sm text-red-600">{errors.grados}</p>
                    )}

                    {gradosSeleccionados.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-700">
                          <strong>Seleccionados:</strong> {grados.filter(g => gradosSeleccionados.includes(g.id)).map(g => getFirstWord(g.nombre)).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info de Asignaciones */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          Se crearán <strong>{materiasSeleccionadas.length * gradosSeleccionados.length}</strong> asignaciones
                          ({materiasSeleccionadas.length} materias × {gradosSeleccionados.length} grados).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center justify-end space-x-4 mt-6">
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
