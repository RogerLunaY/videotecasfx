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
      {/* Header Minimalista */}
      <div className="bg-gradient-to-r from-salesiano-azul-600 via-salesiano-azul-500 to-salesiano-azul-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
            SELECCIONE SU CURSO
          </h1>

          {/* Materia Seleccionada (si existe) */}
          {materiaSeleccionada && (
            <div className="mt-6 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-white">{materiaSeleccionada.nombre}</span>
              <Link
                to="/materias"
                className="ml-3 text-sm underline hover:no-underline text-salesiano-amarillo-300"
              >
                Cambiar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Grados - Botones Rectangulares */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-salesiano-azul-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {grados.map((grado, index) => {
              // Alternar entre azul y amarillo salesiano
              const isAzul = index % 2 === 0;
              const colors = isAzul
                ? { from: 'from-salesiano-azul-500', to: 'to-salesiano-azul-600', icon: 'text-salesiano-azul-600' }
                : { from: 'from-salesiano-amarillo-400', to: 'to-salesiano-amarillo-500', icon: 'text-salesiano-amarillo-600' };

              // Extraer número del grado
              const gradoNumero = grado.nombre.match(/\d+/)?.[0] || (index + 1);

              return (
                <button
                  key={grado.id}
                  onClick={() => handleGradoClick(grado.id)}
                  className={`group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-8`}
                >
                  {/* Fondo degradado en hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                  <div className="relative text-center">
                    {/* Icono con número grande */}
                    <div className="mb-4 flex justify-center">
                      <div className={`w-24 h-24 bg-gradient-to-br ${colors.from} ${colors.to} rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-white transition-all duration-300`}>
                        <div className="text-5xl font-black text-white group-hover:text-salesiano-azul-700 transition-colors duration-300">
                          {gradoNumero}
                        </div>
                      </div>
                    </div>

                    {/* Nombre completo del grado */}
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-white mb-2 transition-colors duration-300">
                      {grado.nombre}
                    </h3>

                    {/* Helpbox para Descripción */}
                    {grado.descripcion && (
                      <div className="flex justify-center items-center mt-2">
                        <div className="group/tooltip relative inline-flex">
                          <div className="flex items-center gap-1 text-xs text-gray-600 group-hover:text-white/90 cursor-help transition-colors duration-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Info</span>
                          </div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 w-48 text-center z-10 pointer-events-none">
                            {grado.descripcion}
                            {/* Flecha */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                              <div className="border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Icono de flecha */}
                    <div className="flex justify-center mt-4">
                      <div className={`w-10 h-10 ${isAzul ? 'bg-salesiano-azul-100' : 'bg-salesiano-amarillo-100'} group-hover:bg-white rounded-full flex items-center justify-center transition-all duration-300`}>
                        <svg className={`w-5 h-5 ${colors.icon} group-hover:text-salesiano-azul-700`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="text-xl text-gray-600">No hay cursos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CursosPage;
