/**
 * Página de Inicio
 * Bienvenida y navegación a Materias/Cursos con diseño salesiano
 */

import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-salesiano-azul-600 via-salesiano-azul-500 to-salesiano-azul-400 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          {/* Logo Grande */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
              <svg className="w-16 h-16 text-salesiano-azul-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Título de Bienvenida */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
            BIENVENIDO A LA VIDEOTECA
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-salesiano-amarillo-300">
            DE LA UNIDAD EDUCATIVA
          </h2>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 text-salesiano-amarillo-400">
            SAN FRANCISCO XAVIER
          </h2>

          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-4">
            Plataforma educativa de videos para estudiantes y docentes
          </p>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Okinawa Uno, Bolivia • Comunidad Salesiana
          </p>
        </div>
      </div>

      {/* Sección de Búsqueda por Categoría */}
      <div className="container mx-auto px-4 py-20">
        {/* Título de Sección */}
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-extrabold text-salesiano-azul-700">
            BUSCAR POR CATEGORÍA
          </h3>
        </div>

        {/* Cards de Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Card: MATERIA */}
          <Link
            to="/materias"
            className="group relative overflow-hidden bg-gradient-to-br from-salesiano-azul-500 to-salesiano-azul-600 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="relative p-16 text-center">
              {/* Icono */}
              <div className="mb-8 flex justify-center">
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-20 h-20 text-salesiano-azul-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              {/* Título */}
              <h4 className="text-5xl font-extrabold text-white mb-6">
                MATERIA
              </h4>

              {/* Flecha */}
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-salesiano-amarillo-400 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                  <svg className="w-7 h-7 text-salesiano-azul-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Card: CURSO */}
          <Link
            to="/cursos"
            className="group relative overflow-hidden bg-gradient-to-br from-salesiano-amarillo-400 to-salesiano-amarillo-500 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="relative p-16 text-center">
              {/* Icono */}
              <div className="mb-8 flex justify-center">
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-20 h-20 text-salesiano-amarillo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>

              {/* Título */}
              <h4 className="text-5xl font-extrabold text-salesiano-azul-900 mb-6">
                CURSO
              </h4>

              {/* Flecha */}
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-salesiano-azul-600 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
