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

const EditUsuarioPage = () => {
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
    estado: 'activo',
  });

  const [selectedMaterias, setSelectedMaterias] = useState([]);
  const [selectedGrados, setSelectedGrados] = useState([]);

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

      // Cargar asignaciones si es docente
      if (user.rol === 'Docente' || user.rol_id === 2) {
        try {
          const asignaciones = await getDocenteAsignaciones(id);

          // Extraer IDs de materias
          const materiasIds = asignaciones.materias?.map(m => m.id) || [];
          setSelectedMaterias(materiasIds);

          // Extraer IDs de grados
          const gradosIds = asignaciones.grados?.map(g => g.id) || [];
          setSelectedGrados(gradosIds);
        } catch (error) {
          console.error('Error loading asignaciones:', error);
          // No es crítico, continuar sin asignaciones
        }
      }
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

      // Si es docente, actualizar asignaciones
      const rolDocente = roles.find(r => r.nombre === 'Docente');
      if (formData.rol_id === rolDocente?.id || formData.rol_id === 2) {
        try {
          await actualizarAsignaciones(id, selectedMaterias, selectedGrados);
        } catch (error) {
          console.error('Error updating asignaciones:', error);
          setErrorMessage('Usuario actualizado pero hubo un error al guardar las asignaciones');
          setSaving(false);
          return;
        }
      }

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

  const rolDocente = roles.find(r => r.nombre === 'Docente');
  const isDocente = formData.rol_id === rolDocente?.id || formData.rol_id === 2;

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
            <div className="space-y-6">
              {/* SECCIÓN: Datos Personales */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-salesiano-azul-700 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Datos Personales
                </h3>

                {/* Grid 2 columnas para campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    />
                  </div>

                  {/* Email - ocupa 2 columnas */}
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
                </div>
              </div>

              {/* SECCIÓN: Asignaciones */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-salesiano-azul-700 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Asignaciones
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

                  {/* Estado */}
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

                  {/* Asignaciones (solo para docentes) */}
                  {isDocente && (
                    <>
                      {/* Materias */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Asignación de Materias
                          <span className="text-gray-500 text-xs ml-2">(Máximo 2 materias)</span>
                        </label>
                        <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto bg-gray-50">
                          {materias.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No hay materias disponibles</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
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
                                    className="w-4 h-4 text-salesiano-azul-600 border-gray-300 rounded focus:ring-salesiano-azul-500 flex-shrink-0"
                                  />
                                  <span className="ml-2 text-sm text-gray-900 truncate" title={materia.nombre}>
                                    {materia.nombre}
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
                        <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto bg-gray-50">
                          {grados.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No hay grados disponibles</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
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
                                    className="w-4 h-4 text-salesiano-azul-600 border-gray-300 rounded focus:ring-salesiano-azul-500 flex-shrink-0"
                                  />
                                  <span className="ml-2 text-sm text-gray-900 truncate" title={grado.nombre}>
                                    {grado.nombre}
                                  </span>
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
                    </>
                  )}

                  {/* Nota sobre contraseña */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Nota:</strong> Para cambiar la contraseña del usuario, use la función "Cambiar Contraseña" en el perfil del usuario.
                    </p>
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
    </Layout>
  );
};

export default EditUsuarioPage;
