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

      {/* Grid de Grados - Números Gigantes Circulares */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-salesiano-azul-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {grados.map((grado, index) => {
              // Alternar entre azul y amarillo salesiano
              const isAzul = index % 2 === 0;
              const baseColor = isAzul ? 'salesiano-azul' : 'salesiano-amarillo';

              // Extraer número del grado
              const gradoNumero = grado.nombre.match(/\d+/)?.[0] || (index + 1);
              const gradoSufijo = grado.nombre.includes('1ro') ? 'ro' :
                                 grado.nombre.includes('2do') ? 'do' :
                                 grado.nombre.includes('3ro') ? 'ro' : 'to';

              return (
                <button
                  key={grado.id}
                  onClick={() => handleGradoClick(grado.id)}
                  className={`group relative overflow-hidden bg-gradient-to-br from-${baseColor}-500 to-${baseColor}-600 rounded-full aspect-square shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center`}
                >
                  <div className="text-center">
                    {/* Número Gigante */}
                    <div className="text-7xl md:text-8xl font-black text-white mb-2">
                      {gradoNumero}
                    </div>

                    {/* Sufijo */}
                    <div className="text-2xl md:text-3xl font-bold text-white/90">
                      {gradoSufijo}
                    </div>
                  </div>

                  {/* Overlay sutil en hover */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></div>
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
