/**
 * Página de Materias
 * Mosaico de materias con iconos representativos y navegación bidireccional
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getMaterias } from '../services/materiaService';
import { getGradoById } from '../services/gradoService';
import { getCampos } from '../services/campoService';

// Iconos SVG representativos para cada materia
const MateriaIcon = ({ nombre }) => {
  const iconClass = "w-12 h-12";
  const nombreLower = nombre.toLowerCase();

  // Determinar icono según el nombre de la materia
  // IMPORTANTE: Las condiciones más específicas deben ir primero

  if (nombreLower.includes('matemática') || nombreLower.includes('matematica')) {
    // Calculadora para matemáticas
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  } else if (nombreLower.includes('educación física') || nombreLower.includes('educacion fisica')) {
    // Persona corriendo para educación física
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  } else if (nombreLower.includes('física') || nombreLower.includes('fisica')) {
    // Rayo/electricidad para física
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  } else if (nombreLower.includes('química') || nombreLower.includes('quimica')) {
    // Matraz/frasco para química
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    );
  } else if (nombreLower.includes('biología') || nombreLower.includes('biologia')) {
    // DNA/Molécula para biología
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  } else if (nombreLower.includes('historia')) {
    // Reloj/Tiempo para historia
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  } else if (nombreLower.includes('geografía') || nombreLower.includes('geografia')) {
    // Globo/Mapa para geografía
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  } else if (nombreLower.includes('inglés') || nombreLower.includes('ingles')) {
    // Letras/Idioma para inglés
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    );
  } else if (nombreLower.includes('literatura') || nombreLower.includes('lengua') || nombreLower.includes('comunicación')) {
    // Libro para literatura/lengua
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  } else if (nombreLower.includes('computación') || nombreLower.includes('informática') || nombreLower.includes('informatica')) {
    // Computadora para computación
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  } else if (nombreLower.includes('música') || nombreLower.includes('musica')) {
    // Notas musicales para música
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    );
  } else if (nombreLower.includes('arte') || nombreLower.includes('plástica')) {
    // Pincel para arte
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    );
  } else if (nombreLower.includes('religión') || nombreLower.includes('religion') || nombreLower.includes('valores')) {
    // Estrella para religión/valores
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    );
  } else if (nombreLower.includes('filosofía') || nombreLower.includes('filosofia')) {
    // Bombilla/Idea para filosofía
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    );
  } else {
    // Icono por defecto para otras materias (libro)
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  }
};

const MateriasPage = () => {
  const [materias, setMaterias] = useState([]);
  const [campos, setCampos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Obtener grado seleccionado previamente (si viene desde CursosPage)
  const gradoId = searchParams.get('grado');
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);

  useEffect(() => {
    loadMaterias();
    if (gradoId) {
      loadGrado();
    }
  }, [gradoId]);

  const loadMaterias = async () => {
    try {
      setLoading(true);
      // Cargar materias y campos en paralelo
      const [materiasData, camposData] = await Promise.all([
        getMaterias(),
        getCampos()
      ]);
      setMaterias(materiasData || []);
      setCampos(camposData || []);
    } catch (error) {
      console.error('Error loading materias:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGrado = async () => {
    try {
      const grado = await getGradoById(gradoId);
      setGradoSeleccionado(grado);
    } catch (error) {
      console.error('Error loading grado:', error);
    }
  };

  const handleMateriaClick = (materiaId) => {
    if (gradoId) {
      // Si ya hay un grado seleccionado, ir a videos filtrados
      navigate(`/videos?materia_id=${materiaId}&grado_id=${gradoId}`);
    } else {
      // Si no hay grado, ir a página de cursos con esta materia
      navigate(`/cursos?materia=${materiaId}`);
    }
  };

  // Colores para las materias
  const materiaColors = [
    { from: 'from-blue-400', to: 'to-blue-600', bg: 'bg-blue-500', hover: 'hover:from-blue-500 hover:to-blue-700' },
    { from: 'from-purple-400', to: 'to-purple-600', bg: 'bg-purple-500', hover: 'hover:from-purple-500 hover:to-purple-700' },
    { from: 'from-pink-400', to: 'to-pink-600', bg: 'bg-pink-500', hover: 'hover:from-pink-500 hover:to-pink-700' },
    { from: 'from-red-400', to: 'to-red-600', bg: 'bg-red-500', hover: 'hover:from-red-500 hover:to-red-700' },
    { from: 'from-orange-400', to: 'to-orange-600', bg: 'bg-orange-500', hover: 'hover:from-orange-500 hover:to-orange-700' },
    { from: 'from-salesiano-amarillo-400', to: 'to-salesiano-amarillo-600', bg: 'bg-salesiano-amarillo-500', hover: 'hover:from-salesiano-amarillo-500 hover:to-salesiano-amarillo-700' },
    { from: 'from-green-400', to: 'to-green-600', bg: 'bg-green-500', hover: 'hover:from-green-500 hover:to-green-700' },
    { from: 'from-teal-400', to: 'to-teal-600', bg: 'bg-teal-500', hover: 'hover:from-teal-500 hover:to-teal-700' },
    { from: 'from-cyan-400', to: 'to-cyan-600', bg: 'bg-cyan-500', hover: 'hover:from-cyan-500 hover:to-cyan-700' },
    { from: 'from-indigo-400', to: 'to-indigo-600', bg: 'bg-indigo-500', hover: 'hover:from-indigo-500 hover:to-indigo-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-salesiano-azul-500 to-salesiano-azul-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            {/* Icono */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                <svg className="w-12 h-12 text-salesiano-azul-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              SELECCIONE LA MATERIA
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Elija la asignatura para encontrar videos educativos
            </p>

            {/* Grado Seleccionado (si existe) */}
            {gradoSeleccionado && (
              <div className="mt-6 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Curso seleccionado: {gradoSeleccionado.nombre}</span>
                <Link
                  to="/cursos"
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
            {gradoSeleccionado ? (
              <>
                <Link to="/cursos" className="text-salesiano-azul-600 hover:text-salesiano-azul-700">
                  Cursos
                </Link>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : null}
            <span className="text-gray-600">Materias</span>
          </nav>
        </div>
      </div>

      {/* Grid de Materias agrupadas por Campos */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-salesiano-azul-600"></div>
          </div>
        ) : (
          <div className="space-y-10 max-w-7xl mx-auto">
            {campos.map((campo) => {
              const materiasCampo = materias.filter(m => m.campo_id === campo.id);
              if (materiasCampo.length === 0) return null;

              return (
                <div key={campo.id} className="space-y-4">
                  {/* Título del Campo */}
                  <div className="border-l-4 border-salesiano-azul-500 pl-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {campo.nombre}
                    </h2>
                    {campo.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">
                        {campo.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Grid de Materias del Campo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {materiasCampo.map((materia, index) => {
                      const colors = materiaColors[index % materiaColors.length];

                      return (
                        <button
                          key={materia.id}
                          onClick={() => handleMateriaClick(materia.id)}
                          className={`group relative overflow-hidden bg-gradient-to-br ${colors.from} ${colors.to} ${colors.hover} rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 p-6 text-white`}
                        >
                          <div className="text-center">
                            {/* Icono */}
                            <div className="mb-4 flex justify-center">
                              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                                <MateriaIcon nombre={materia.nombre} />
                              </div>
                            </div>

                            {/* Nombre de la materia */}
                            <h3 className="text-xl font-bold mb-2">
                              {materia.nombre}
                            </h3>

                            {/* Helpbox para Descripción */}
                            {materia.descripcion && (
                              <div className="flex justify-center items-center mt-2">
                                <div className="group/tooltip relative inline-flex">
                                  <div className="flex items-center gap-1 text-xs text-white/90 cursor-help">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Info</span>
                                  </div>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 w-48 text-center z-10 pointer-events-none">
                                    {materia.descripcion}
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
                              <div className="w-10 h-10 bg-white/20 group-hover:bg-white rounded-full flex items-center justify-center transition-all duration-300">
                                <svg className={`w-5 h-5 group-hover:${colors.bg.replace('bg-', 'text-')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mensaje si no hay materias */}
        {!loading && materias.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-xl text-gray-600">No hay materias disponibles</p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-white py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Selecciona una materia para {gradoSeleccionado ? 'ver los videos filtrados' : 'continuar con la selección de curso'}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link
              to="/"
              className="text-salesiano-azul-600 hover:text-salesiano-azul-700 font-medium"
            >
              ← Volver al inicio
            </Link>
            {!gradoSeleccionado && (
              <Link
                to="/cursos"
                className="text-salesiano-azul-600 hover:text-salesiano-azul-700 font-medium"
              >
                O explorar por cursos →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MateriasPage;
