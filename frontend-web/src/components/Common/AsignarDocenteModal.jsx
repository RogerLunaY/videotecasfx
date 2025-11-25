/**
 * Modal para Asignar Materias y Grados a Docentes
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from './LoadingSpinner';
import {
  getDocenteAsignaciones,
  actualizarAsignaciones
} from '../../services/docenteAsignacionService';
import { getMaterias } from '../../services/materiaService';
import { getGrados } from '../../services/gradoService';

const AsignarDocenteModal = ({ show, onClose, docente, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Listas disponibles
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const [gradosDisponibles, setGradosDisponibles] = useState([]);

  // Selecciones actuales
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
  const [gradosSeleccionados, setGradosSeleccionados] = useState([]);

  useEffect(() => {
    if (show && docente) {
      loadData();
    }
  }, [show, docente]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar en paralelo: asignaciones actuales, materias y grados disponibles
      const [asignacionesData, materiasData, gradosData] = await Promise.all([
        getDocenteAsignaciones(docente.id),
        getMaterias(),
        getGrados()
      ]);

      setMateriasDisponibles(materiasData || []);
      setGradosDisponibles(gradosData || []);

      // Establecer selecciones actuales
      const materiasIds = (asignacionesData.materias || []).map(m => m.id);
      const gradosIds = (asignacionesData.grados || []).map(g => g.id);

      setMateriasSeleccionadas(materiasIds);
      setGradosSeleccionados(gradosIds);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar las asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMateriaToggle = (materiaId) => {
    if (materiasSeleccionadas.includes(materiaId)) {
      setMateriasSeleccionadas(materiasSeleccionadas.filter(id => id !== materiaId));
    } else {
      setMateriasSeleccionadas([...materiasSeleccionadas, materiaId]);
    }
  };

  const handleGradoToggle = (gradoId) => {
    if (gradosSeleccionados.includes(gradoId)) {
      setGradosSeleccionados(gradosSeleccionados.filter(id => id !== gradoId));
    } else {
      setGradosSeleccionados([...gradosSeleccionados, gradoId]);
    }
  };

  const handleSelectAllMaterias = () => {
    if (materiasSeleccionadas.length === materiasDisponibles.length) {
      setMateriasSeleccionadas([]);
    } else {
      setMateriasSeleccionadas(materiasDisponibles.map(m => m.id));
    }
  };

  const handleSelectAllGrados = () => {
    if (gradosSeleccionados.length === gradosDisponibles.length) {
      setGradosSeleccionados([]);
    } else {
      setGradosSeleccionados(gradosDisponibles.map(g => g.id));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await actualizarAsignaciones(
        docente.id,
        materiasSeleccionadas,
        gradosSeleccionados
      );

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error('Error saving assignments:', err);
      setError('Error al guardar las asignaciones');
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            Asignar Materias y Grados
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Docente: {docente?.nombre} {docente?.apellido_paterno}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Materias */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Materias ({materiasSeleccionadas.length}/{materiasDisponibles.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleSelectAllMaterias}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    {materiasSeleccionadas.length === materiasDisponibles.length
                      ? 'Deseleccionar todas'
                      : 'Seleccionar todas'}
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {materiasDisponibles.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay materias disponibles</p>
                  ) : (
                    materiasDisponibles.map((materia) => (
                      <label
                        key={materia.id}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={materiasSeleccionadas.includes(materia.id)}
                          onChange={() => handleMateriaToggle(materia.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {materia.nombre}
                          </p>
                          {materia.descripcion && (
                            <p className="text-xs text-gray-500">
                              {materia.descripcion}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Grados */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Grados ({gradosSeleccionados.length}/{gradosDisponibles.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleSelectAllGrados}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    {gradosSeleccionados.length === gradosDisponibles.length
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {gradosDisponibles.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay grados disponibles</p>
                  ) : (
                    gradosDisponibles.map((grado) => (
                      <label
                        key={grado.id}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={gradosSeleccionados.includes(grado.id)}
                          onChange={() => handleGradoToggle(grado.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {grado.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            Nivel: {grado.nivel}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Información */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-blue-700">
                  <strong>Importante:</strong> Se crearán asignaciones para todas las combinaciones de materia × grado seleccionadas.
                  Por ejemplo, si selecciona 2 materias y 3 grados, se crearán 6 asignaciones (2 × 3 = 6).
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  El docente solo podrá subir y gestionar videos de las combinaciones materia-grado asignadas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Asignaciones'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

AsignarDocenteModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  docente: PropTypes.object,
  onSuccess: PropTypes.func
};

export default AsignarDocenteModal;
