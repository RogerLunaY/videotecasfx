/**
 * Página de Cursos
 * Mosaico de grados (1ro a 6to Secundaria) con navegación bidireccional
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getGrados } from '../services/gradoService';
import { getMateriaById } from '../services/materiaService';

const CursosPage = () => {
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Obtener materia seleccionada previamente (si viene desde MateriaPage)
  const materiaId = searchParams.get('materia');
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  useEffect(() => {
    loadGrados();
    if (materiaId) {
      loadMateria();
    }
  }, [materiaId]);

  const loadGrados = async () => {
    try {
      setLoading(true);
      const data = await getGrados();
      setGrados(data || []);
    } catch (error) {
      console.error('Error loading grados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMateria = async () => {
    try {
      const materia = await getMateriaById(materiaId);
      setMateriaSeleccionada(materia);
    } catch (error) {
      console.error('Error loading materia:', error);
    }
  };

  const handleGradoClick = (gradoId) => {
    if (materiaId) {
      // Si ya hay una materia seleccionada, ir a videos filtrados
      navigate(`/videos?materia_id=${materiaId}&grado_id=${gradoId}`);
    } else {
      // Si no hay materia, ir a página de materias con este grado
      navigate(`/materias?grado=${gradoId}`);
    }
  };

  // Colores de gradiente para cada grado
  const gradoColors = [
    { from: 'from-red-400', to: 'to-red-600', text: 'text-red-700', bg: 'bg-red-500' },
    { from: 'from-orange-400', to: 'to-orange-600', text: 'text-orange-700', bg: 'bg-orange-500' },
    { from: 'from-salesiano-amarillo-400', to: 'to-salesiano-amarillo-600', text: 'text-salesiano-amarillo-700', bg: 'bg-salesiano-amarillo-500' },
    { from: 'from-green-400', to: 'to-green-600', text: 'text-green-700', bg: 'bg-green-500' },
    { from: 'from-salesiano-azul-400', to: 'to-salesiano-azul-600', text: 'text-salesiano-azul-700', bg: 'bg-salesiano-azul-500' },
    { from: 'from-purple-400', to: 'to-purple-600', text: 'text-purple-700', bg: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-salesiano-amarillo-500 to-salesiano-amarillo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            {/* Icono */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <svg className="w-12 h-12 text-salesiano-amarillo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              SELECCIONE SU CURSO
            </h1>
            <p className="text-xl text-yellow-100 max-w-2xl mx-auto">
              Elija el grado escolar para encontrar videos educativos
            </p>

            {/* Materia Seleccionada (si existe) */}
            {materiaSeleccionada && (
              <div className="mt-6 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Materia seleccionada: {materiaSeleccionada.nombre}</span>
                <Link
                  to="/materias"
                  className="ml-3 text-sm underline hover:no-underline"
                >
                  Cambiar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-salesiano-azul-600 hover:text-salesiano-azul-700">
              Inicio
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {materiaSeleccionada ? (
              <>
                <Link to="/materias" className="text-salesiano-azul-600 hover:text-salesiano-azul-700">
                  Materias
                </Link>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : null}
            <span className="text-gray-600">Cursos</span>
          </nav>
        </div>
      </div>

      {/* Grid de Grados */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-salesiano-azul-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {grados.map((grado, index) => {
              const colors = gradoColors[index % gradoColors.length];
              // Extraer número del grado (ej: "1ro Secundaria" → "1")
              const gradoNumero = grado.nombre.match(/\d+/)?.[0] || (index + 1);
              const gradoSufijo = grado.nombre.includes('1ro') ? 'ro' :
                                 grado.nombre.includes('2do') ? 'do' :
                                 grado.nombre.includes('3ro') ? 'ro' : 'to';

              return (
                <button
                  key={grado.id}
                  onClick={() => handleGradoClick(grado.id)}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-8"
                >
                  {/* Fondo de gradiente en hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                  <div className="relative text-center">
                    {/* Número grande */}
                    <div className="mb-4">
                      <div className="text-8xl md:text-9xl font-black text-gray-200 group-hover:text-white/30 transition-colors duration-300">
                        {gradoNumero}
                      </div>
                      <div className={`-mt-6 text-3xl font-bold ${colors.text} group-hover:text-white transition-colors duration-300`}>
                        {gradoNumero}{gradoSufijo}
                      </div>
                    </div>

                    {/* Nombre del grado */}
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-white mb-2 transition-colors duration-300">
                      {grado.nombre}
                    </h3>

                    {/* Descripción */}
                    <p className="text-gray-600 group-hover:text-white/90 text-sm mb-4 transition-colors duration-300">
                      {grado.descripcion || 'Videos educativos'}
                    </p>

                    {/* Icono de flecha */}
                    <div className="flex justify-center">
                      <div className={`w-12 h-12 ${colors.bg} group-hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300`}>
                        <svg className={`w-6 h-6 text-white group-hover:${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Mensaje si no hay grados */}
        {!loading && grados.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-xl text-gray-600">No hay cursos disponibles</p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-white py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Selecciona un curso para {materiaSeleccionada ? 'ver los videos filtrados' : 'continuar con la selección de materia'}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link
              to="/"
              className="text-salesiano-azul-600 hover:text-salesiano-azul-700 font-medium"
            >
              ← Volver al inicio
            </Link>
            {!materiaSeleccionada && (
              <Link
                to="/materias"
                className="text-salesiano-azul-600 hover:text-salesiano-azul-700 font-medium"
              >
                O explorar por materias →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursosPage;
