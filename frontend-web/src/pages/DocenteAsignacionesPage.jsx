/**
 * Página de Gestión de Asignaciones de Docentes
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  getAllDocentesAsignaciones,
  actualizarAsignaciones
} from '../services/docenteAsignacionService';
import { getMaterias } from '../services/materiaService';
import { getGrados } from '../services/gradoService';

const DocenteAsignacionesPage = () => {
  const { isAdmin } = useAuth();
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [selectedMaterias, setSelectedMaterias] = useState([]);
  const [selectedGrados, setSelectedGrados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'assigned', 'unassigned'

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = '/dashboard';
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docentesData, materiasData, gradosData] = await Promise.all([
        getAllDocentesAsignaciones(),
        getMaterias(),
        getGrados()
      ]);

      setDocentes(docentesData.data.docentes || []);
      setMaterias(materiasData || []);
      setGrados(gradosData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsignaciones = (docente) => {
    setSelectedDocente(docente);

    // Parsear las asignaciones actuales
    const materiaIds = docente.materia_ids
      ? docente.materia_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];
    const gradoIds = docente.grado_ids
      ? docente.grado_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : [];

    setSelectedMaterias(materiaIds);
    setSelectedGrados(gradoIds);
    setShowModal(true);
  };

  const handleToggleMateria = (materiaId) => {
    setSelectedMaterias(prev =>
      prev.includes(materiaId)
        ? prev.filter(id => id !== materiaId)
        : [...prev, materiaId]
    );
  };

  const handleToggleGrado = (gradoId) => {
    setSelectedGrados(prev =>
      prev.includes(gradoId)
        ? prev.filter(id => id !== gradoId)
        : [...prev, gradoId]
    );
  };

  const handleSaveAsignaciones = async () => {
    if (!selectedDocente) return;

    try {
      setSaving(true);
      await actualizarAsignaciones(
        selectedDocente.docente_id,
        selectedMaterias,
        selectedGrados
      );

      // Recargar datos
      await loadData();

      setShowModal(false);
      setSelectedDocente(null);
      setSelectedMaterias([]);
      setSelectedGrados([]);
    } catch (error) {
      console.error('Error saving asignaciones:', error);
      alert('Error al guardar las asignaciones');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDocente(null);
    setSelectedMaterias([]);
    setSelectedGrados([]);
  };

  const filteredDocentes = docentes.filter(docente => {
    // Filtro de búsqueda
    const matchesSearch = searchQuery === '' ||
      docente.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docente.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtro de estado
    const hasAsignaciones = (docente.total_materias > 0 || docente.total_grados > 0);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'assigned' && hasAsignaciones) ||
      (filterStatus === 'unassigned' && !hasAsignaciones);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-salesiano-azul-700 mb-2">
            Asignación de Materias y Grados
          </h1>
          <p className="text-gray-600">
            Gestiona las materias y grados asignados a cada docente
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-salesiano-azul-500"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-salesiano-azul-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({docentes.length})
              </button>
              <button
                onClick={() => setFilterStatus('assigned')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'assigned'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Asignados ({docentes.filter(d => d.total_materias > 0 || d.total_grados > 0).length})
              </button>
              <button
                onClick={() => setFilterStatus('unassigned')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'unassigned'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sin asignar ({docentes.filter(d => d.total_materias === 0 && d.total_grados === 0).length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Docentes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredDocentes.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron docentes
              </h3>
              <p className="text-gray-600">
                {searchQuery ? 'Intenta con otra búsqueda' : 'No hay docentes registrados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-salesiano-azul-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-salesiano-azul-700 uppercase tracking-wider">
                      Docente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-salesiano-azul-700 uppercase tracking-wider">
                      Materias Asignadas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-salesiano-azul-700 uppercase tracking-wider">
                      Grados Asignados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-salesiano-azul-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-salesiano-azul-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocentes.map((docente) => {
                    const hasAsignaciones = docente.total_materias > 0 || docente.total_grados > 0;

                    return (
                      <tr key={docente.docente_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {docente.nombre_completo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {docente.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {docente.materias_asignadas ? (
                            <div className="flex flex-wrap gap-1">
                              {docente.materias_asignadas.split(', ').map((materia, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {materia}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Sin materias</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {docente.grados_asignados ? (
                            <div className="flex flex-wrap gap-1">
                              {docente.grados_asignados.split(', ').map((grado, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {grado.replace(' Secundaria', '')}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Sin grados</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {hasAsignaciones ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Asignado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEditAsignaciones(docente)}
                            className="inline-flex items-center px-4 py-2 bg-salesiano-azul-500 text-white rounded-lg hover:bg-salesiano-azul-600 transition font-medium text-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar Asignaciones
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Edición */}
        {showModal && selectedDocente && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Editar Asignaciones
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedDocente.nombre_completo} • {selectedDocente.email}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Materias */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-salesiano-azul-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Materias ({selectedMaterias.length} seleccionadas)
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {materias.map((materia) => (
                        <label
                          key={materia.id}
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMaterias.includes(materia.id)}
                            onChange={() => handleToggleMateria(materia.id)}
                            className="w-5 h-5 text-salesiano-azul-600 border-gray-300 rounded focus:ring-salesiano-azul-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {materia.nombre}
                          </span>
                          <span className="ml-auto text-xs text-gray-500">
                            {materia.sigla}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Grados */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-salesiano-azul-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Grados ({selectedGrados.length} seleccionados)
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {grados.map((grado) => (
                        <label
                          key={grado.id}
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGrados.includes(grado.id)}
                            onChange={() => handleToggleGrado(grado.id)}
                            className="w-5 h-5 text-salesiano-azul-600 border-gray-300 rounded focus:ring-salesiano-azul-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
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
                  </div>
                </div>
              </div>

              {/* Footer del Modal */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAsignaciones}
                  disabled={saving}
                  className="px-6 py-2 bg-salesiano-azul-500 text-white rounded-lg hover:bg-salesiano-azul-600 transition font-medium disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar Asignaciones
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocenteAsignacionesPage;
