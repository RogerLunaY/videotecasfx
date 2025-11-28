/**
 * Página de Materias
 * Materias agrupadas por campos de saberes con iconos de base de datos
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, Play, ArrowRight, Home, GraduationCap } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getMateriasByCampo } from '../services/materiaService';
import { getGradoById } from '../services/gradoService';

const MateriasPage = () => {
  const [camposConMaterias, setCamposConMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campoExpandido, setCampoExpandido] = useState(null);
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
      const data = await getMateriasByCampo();
      setCamposConMaterias(data || []);
      // Expandir el primer campo por defecto
      if (data && data.length > 0) {
        setCampoExpandido(data[0].id);
      }
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

  const toggleCampo = (campoId) => {
    setCampoExpandido(campoExpandido === campoId ? null : campoId);
  };

  /**
   * Obtiene el componente de icono de Lucide basado en el nombre del icono
   */
  const getIconComponent = (iconName) => {
    const iconMap = {
      // Iconos de materias
      'leaf': LucideIcons.Leaf,
      'atom': LucideIcons.Atom,
      'flask': LucideIcons.Flask,
      'calculator': LucideIcons.Calculator,
      'laptop': LucideIcons.Laptop,
      'book': LucideIcons.Book,
      'book-open': LucideIcons.BookOpen,
      'language': LucideIcons.Languages,
      'globe': LucideIcons.Globe,
      'palette': LucideIcons.Palette,
      'music': LucideIcons.Music,
      'dumbbell': LucideIcons.Dumbbell,
      'brain': LucideIcons.Brain,
      'heart': LucideIcons.Heart,
      // Iconos de campos
      'tree': LucideIcons.TreePine,
      'cog': LucideIcons.Cog,
      'users': LucideIcons.Users,
      'star': LucideIcons.Star,
      // Fallback
      'default': LucideIcons.BookOpen,
    };

    return iconMap[iconName] || iconMap['default'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-salesiano-azul-500 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 max-w-5xl mx-auto">
            {/* Icono a la izquierda */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Texto a la derecha */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                MATERIAS
              </h1>
              <p className="text-xl text-primary-100 dark:text-gray-300">
                Explora las materias organizadas por campos de saberes
              </p>
            </div>
          </div>

          {/* Grado Seleccionado (si existe) */}
          {gradoSeleccionado && (
            <div className="mt-6 flex justify-center max-w-5xl mx-auto">
              <div className="inline-flex items-center bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <GraduationCap className="w-5 h-5 mr-2" />
                <span className="font-semibold">Curso: {gradoSeleccionado.nombre}</span>
                <Link
                  to="/cursos"
                  className="ml-3 text-sm underline hover:no-underline"
                >
                  Cambiar
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1">
              <Home className="w-4 h-4" />
              Inicio
            </Link>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            {gradoSeleccionado ? (
              <>
                <Link to="/cursos" className="text-primary-600 hover:text-primary-700">
                  Cursos
                </Link>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </>
            ) : null}
            <span className="text-gray-600 font-medium">Materias</span>
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          </div>
        ) : camposConMaterias.length > 0 ? (
          <div className="max-w-6xl mx-auto space-y-6">
            {camposConMaterias.map((campo) => {
              const CampoIcon = getIconComponent(campo.icono);
              const isExpanded = campoExpandido === campo.id;
              const totalMaterias = campo.materias?.length || 0;

              return (
                <div
                  key={campo.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
                  onMouseEnter={() => setCampoExpandido(campo.id)}
                >
                  {/* Header del Campo - Clickeable y auto-expandible en hover */}
                  <button
                    onClick={() => toggleCampo(campo.id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    style={{
                      borderLeft: `6px solid ${campo.color || '#6B7280'}`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icono del campo */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${campo.color}20` }}
                      >
                        <CampoIcon
                          className="w-8 h-8"
                          style={{ color: campo.color }}
                          strokeWidth={2}
                        />
                      </div>

                      {/* Información */}
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {campo.nombre}
                        </h2>
                        {campo.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">
                            {campo.descripcion}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Badge con cantidad */}
                      <div
                        className="px-4 py-2 rounded-lg font-semibold text-sm"
                        style={{
                          backgroundColor: `${campo.color}20`,
                          color: campo.color,
                        }}
                      >
                        {totalMaterias} {totalMaterias === 1 ? 'materia' : 'materias'}
                      </div>

                      {/* Icono expandir/colapsar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: isExpanded ? `${campo.color}20` : 'transparent',
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6" style={{ color: campo.color }} />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Lista de Materias - Colapsable y Vertical */}
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 gap-3">
                        {campo.materias && campo.materias.map((materia) => {
                          const MateriaIcon = getIconComponent(materia.icono);

                          return (
                            <button
                              key={materia.id}
                              onClick={() => handleMateriaClick(materia.id)}
                              className="group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 bg-white dark:bg-gray-700 flex items-center gap-4"
                            >
                              {/* Barra de color vertical a la izquierda */}
                              <div
                                className="absolute top-0 left-0 bottom-0 w-1"
                                style={{ backgroundColor: materia.color || campo.color }}
                              />

                              {/* Icono a la izquierda */}
                              <div className="flex-shrink-0 ml-2">
                                <div
                                  className="w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                                  style={{ backgroundColor: `${materia.color || campo.color}20` }}
                                >
                                  <MateriaIcon
                                    className="w-8 h-8"
                                    style={{ color: materia.color || campo.color }}
                                    strokeWidth={2}
                                  />
                                </div>
                              </div>

                              {/* Contenido principal */}
                              <div className="flex-1 min-w-0">
                                {/* Nombre y Sigla */}
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {materia.nombre}
                                  </h3>
                                  {materia.sigla && (
                                    <span
                                      className="text-xs font-bold px-2 py-1 rounded flex-shrink-0"
                                      style={{
                                        backgroundColor: `${materia.color || campo.color}15`,
                                        color: materia.color || campo.color,
                                      }}
                                    >
                                      {materia.sigla}
                                    </span>
                                  )}
                                </div>

                                {/* Descripción */}
                                {materia.descripcion && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                    {materia.descripcion}
                                  </p>
                                )}

                                {/* Contador de videos */}
                                {materia.videos_count !== undefined && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <Play className="w-4 h-4" />
                                    <span>{materia.videos_count} videos</span>
                                  </div>
                                )}
                              </div>

                              {/* Flecha a la derecha */}
                              <div className="flex-shrink-0">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                                  style={{ backgroundColor: `${materia.color || campo.color}20` }}
                                >
                                  <ArrowRight
                                    className="w-6 h-6"
                                    style={{ color: materia.color || campo.color }}
                                  />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-xl text-gray-600">No hay materias disponibles</p>
          </div>
        )}
      </div>

      {/* Footer informativo */}
      <div className="bg-white py-8 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-4">
            Selecciona una materia para {gradoSeleccionado ? 'ver los videos filtrados' : 'continuar con la selección de curso'}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <Home className="w-4 h-4" />
              Volver al inicio
            </Link>
            {!gradoSeleccionado && (
              <Link
                to="/cursos"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Explorar por cursos
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MateriasPage;
