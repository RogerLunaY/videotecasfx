/**
 * Componente de Formulario de Usuario (Crear/Editar)
 * Layout de 2 columnas con selección visual de rol, materias y grados
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { User, Shield, BookOpen, GraduationCap, Check, X } from 'lucide-react';
import { useResources } from '../../hooks/useResources';
import MateriaSelector from '../Common/MateriaSelector';
import GradoSelector from '../Common/GradoSelector';

const UserForm = ({ initialData = {}, onSubmit, loading, isEdit = false }) => {
  const { campos, materias, grados, roles, loading: resourcesLoading } = useResources();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci: '',
    email: '',
    password: '',
    password_confirmation: '',
    telefono: '',
    rol_id: '2', // Por defecto: Docente (ID 2)
    materias_ids: [], // Array para múltiples materias
    grados_ids: [], // Array para múltiples grados
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [selectedRol, setSelectedRol] = useState('2'); // Por defecto Docente

  useEffect(() => {
    if (initialData.rol_id) {
      setSelectedRol(initialData.rol_id.toString());
    }
  }, [initialData]);

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

  const handleRolChange = (rolId) => {
    setSelectedRol(rolId);
    setFormData(prev => ({
      ...prev,
      rol_id: rolId,
      // Limpiar asignaciones si no es docente
      ...(rolId !== '2' && { materias_ids: [], grados_ids: [] })
    }));
  };

  const handleMateriaToggle = (materiaId) => {
    setFormData(prev => {
      const materias = prev.materias_ids || [];
      const isSelected = materias.includes(materiaId);

      if (isSelected) {
        // Remover
        return {
          ...prev,
          materias_ids: materias.filter(id => id !== materiaId)
        };
      } else {
        // Agregar solo si no se alcanzó el máximo (3)
        if (materias.length >= 3) {
          alert('Solo puedes seleccionar un máximo de 3 materias');
          return prev;
        }
        return {
          ...prev,
          materias_ids: [...materias, materiaId]
        };
      }
    });
  };

  const handleGradoToggle = (gradoId) => {
    setFormData(prev => {
      const grados = prev.grados_ids || [];
      const isSelected = grados.includes(gradoId);

      if (isSelected) {
        // Remover
        return {
          ...prev,
          grados_ids: grados.filter(id => id !== gradoId)
        };
      } else {
        // Agregar solo si no se alcanzó el máximo (6)
        if (grados.length >= 6) {
          alert('Solo puedes seleccionar un máximo de 6 cursos');
          return prev;
        }
        return {
          ...prev,
          grados_ids: [...grados, gradoId]
        };
      }
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido_paterno.trim()) newErrors.apellido_paterno = 'El apellido paterno es requerido';
    if (!formData.ci.trim()) newErrors.ci = 'El CI es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Las contraseñas no coinciden';
      }
    }

    if (!formData.rol_id) newErrors.rol_id = 'El rol es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (resourcesLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  const isDocente = selectedRol === '2';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Rol y Datos Personales */}
        <div className="space-y-6">
          {/* Selección de Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rol <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(rol => {
                const isSelected = selectedRol === rol.id.toString();
                return (
                  <button
                    key={rol.id}
                    type="button"
                    onClick={() => handleRolChange(rol.id.toString())}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all duration-200
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {rol.nombre === 'Administrador' ? (
                        <Shield className={`w-8 h-8 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                      ) : (
                        <User className={`w-8 h-8 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                      )}
                      <span className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                        {rol.nombre}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {errors.rol_id && <p className="mt-1 text-sm text-red-600">{errors.rol_id}</p>}
          </div>

          {/* Datos Personales */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Datos Personales
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
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
                  Apellido Paterno <span className="text-red-500">*</span>
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
                  CI <span className="text-red-500">*</span>
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

              <div className="col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
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

              {!isEdit && (
                <>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña <span className="text-red-500">*</span>
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
                      Confirmar <span className="text-red-500">*</span>
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Asignaciones (solo para Docentes) */}
        <div className={`space-y-6 transition-opacity duration-300 ${isDocente ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          {/* Selección de Materias */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between mb-3">
              <span className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Materias
              </span>
              <span className="text-sm text-gray-500">
                {formData.materias_ids?.length || 0}/3
              </span>
            </h3>
            <p className="text-xs text-gray-600 mb-4">Selecciona hasta 3 materias</p>

            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {materias.map(materia => {
                const isSelected = formData.materias_ids?.includes(materia.id);
                return (
                  <button
                    key={materia.id}
                    type="button"
                    onClick={() => handleMateriaToggle(materia.id)}
                    disabled={!isDocente}
                    className={`
                      relative p-3 rounded-lg border transition-all text-left
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-primary-300'
                      }
                      ${!isDocente && 'cursor-not-allowed'}
                    `}
                  >
                    <p className="text-xs font-medium text-gray-900">{materia.nombre}</p>
                    <p className="text-[10px] text-gray-500">{materia.sigla}</p>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selección de Grados/Cursos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-between mb-3">
              <span className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Cursos
              </span>
              <span className="text-sm text-gray-500">
                {formData.grados_ids?.length || 0}/6
              </span>
            </h3>
            <p className="text-xs text-gray-600 mb-4">Selecciona hasta 6 cursos</p>

            <div className="grid grid-cols-3 gap-2">
              {grados.map(grado => {
                const isSelected = formData.grados_ids?.includes(grado.id);
                return (
                  <button
                    key={grado.id}
                    type="button"
                    onClick={() => handleGradoToggle(grado.id)}
                    disabled={!isDocente}
                    className={`
                      relative p-3 rounded-lg border transition-all
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-primary-300'
                      }
                      ${!isDocente && 'cursor-not-allowed'}
                    `}
                  >
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{grado.nivel}°</p>
                      <p className="text-[10px] text-gray-500">Sec</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {!isDocente && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-800">
                Las asignaciones solo están disponibles para el rol de Docente
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => window.history.back()}
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
          {loading ? 'Procesando...' : isEdit ? 'Actualizar Usuario' : 'Registrar Usuario'}
        </button>
      </div>
    </form>
  );
};

UserForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  isEdit: PropTypes.bool,
};

export default UserForm;
