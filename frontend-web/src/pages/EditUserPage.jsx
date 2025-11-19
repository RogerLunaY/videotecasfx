/**
 * Página de Edición de Usuario (solo para admins)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResources } from '../hooks/useResources';
import { getUserById, updateUser } from '../services/userService';
import { getDocenteAsignaciones, actualizarAsignaciones } from '../services/docenteAsignacionService';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { roles, materias, grados, loading: resourcesLoading } = useResources();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    email: '',
    telefono: '',
    rol_id: '',
  });

  // Arrays para selección múltiple de materias y grados (solo docentes)
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [gradosSeleccionados, setGradosSeleccionados] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Límites
  const MAX_MATERIAS = 3;
  const MAX_GRADOS = 6;

  // Solo admins pueden acceder
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoadingData(true);
        const userData = await getUserById(id);

        setFormData({
          nombre: userData.nombre || '',
          apellido_paterno: userData.apellido_paterno || '',
          apellido_materno: userData.apellido_materno || '',
          ci: userData.ci || '',
          email: userData.email || '',
          telefono: userData.telefono || '',
          rol_id: userData.rol_id || '',
        });

        // Si es docente, cargar sus asignaciones
        const rolDocente = roles.find(r => r.id === userData.rol_id);
        if (rolDocente && rolDocente.nombre?.toLowerCase() === 'docente') {
          try {
            const asignaciones = await getDocenteAsignaciones(id);
            const materiasIds = (asignaciones.materias || []).map(m => m.id);
            const gradosIds = (asignaciones.grados || []).map(g => g.id);
            setMateriasSeleccionadas(materiasIds);
            setGradosSeleccionados(gradosIds);
          } catch (error) {
            console.error('Error cargando asignaciones:', error);
          }
        }
      } catch (error) {
        console.error('Error cargando usuario:', error);
        setErrorMessage('Error al cargar los datos del usuario');
      } finally {
        setLoadingData(false);
      }
    };

    if (id && roles.length > 0) {
      loadUserData();
    }
  }, [id, roles]);

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
    if (rolSeleccionado && rolSeleccionado.nombre?.toLowerCase() !== 'docente') {
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
    return rolSeleccionado && rolSeleccionado.nombre?.toLowerCase() === 'docente';
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
      if (!dataToSend.apellido_materno?.trim()) delete dataToSend.apellido_materno;
      if (!dataToSend.telefono?.trim()) delete dataToSend.telefono;

      await updateUser(id, dataToSend);

      // Si es docente, actualizar las asignaciones
      if (isDocente()) {
        await actualizarAsignaciones(
          id,
          materiasSeleccionadas,
          gradosSeleccionados
        );
      }

      setSuccessMessage('Usuario actualizado exitosamente');

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/usuarios');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (resourcesLoading || loadingData) {
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

          <form onSubmit={handleSubmit}>
            <div className={`grid gap-6 ${isDocente() ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {/* COLUMNA IZQUIERDA: ROL Y DATOS PERSONALES */}
              <div className={`space-y-6 ${isDocente() ? '' : ''}`}>
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

                {/* Email */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email</h3>
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
                    <p className="mt-1 text-xs text-gray-500">
                      Para cambiar la contraseña, usa la opción de cambio de contraseña en el perfil del usuario.
                    </p>
                  </div>
                </div>
              </div>

              {/* ASIGNACIONES (SOLO DOCENTE) */}
              {isDocente() && (
                <>
                  {/* Materias - 2 columnas */}
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Materias ({materiasSeleccionadas.length}/{MAX_MATERIAS})
                      </h3>
                      <span className="text-xs text-gray-500">
                        Máximo {MAX_MATERIAS}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
                      {materias.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">No hay materias disponibles</p>
                      ) : (
                        materias.map(materia => (
                          <button
                            key={materia.id}
                            type="button"
                            onClick={() => handleMateriaToggle(materia.id)}
                            className={`p-4 rounded-lg border-2 font-medium transition-all duration-200 transform hover:scale-105 text-left ${
                              materiasSeleccionadas.includes(materia.id)
                                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-lg'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold flex-1">
                                {materia.nombre}
                              </p>
                              {materiasSeleccionadas.includes(materia.id) && (
                                <svg className="w-5 h-5 text-primary-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {errors.materias && (
                      <p className="mt-2 text-sm text-red-600">{errors.materias}</p>
                    )}
                  </div>

                  {/* Grados - 1 columna */}
                  <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Grados ({gradosSeleccionados.length}/{MAX_GRADOS})
                      </h3>
                      <span className="text-xs text-gray-500">
                        Máx {MAX_GRADOS}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto p-2">
                      {grados.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">No hay grados disponibles</p>
                      ) : (
                        grados.map(grado => (
                          <button
                            key={grado.id}
                            type="button"
                            onClick={() => handleGradoToggle(grado.id)}
                            className={`p-4 rounded-lg border-2 font-medium transition-all duration-200 transform hover:scale-105 text-left ${
                              gradosSeleccionados.includes(grado.id)
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold flex-1">
                                {grado.nombre}
                              </p>
                              {gradosSeleccionados.includes(grado.id) && (
                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {errors.grados && (
                      <p className="mt-2 text-sm text-red-600">{errors.grados}</p>
                    )}
                  </div>
                </>
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
                {loading ? 'Actualizando...' : 'Actualizar Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditUserPage;
