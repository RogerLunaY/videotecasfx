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
      <div className="container mx-auto px-4 py-16">
        {/* Título de Sección */}
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-salesiano-azul-700 mb-3">
            BUSCAR POR CATEGORÍA
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestro catálogo de videos educativos organizados por materia o curso
          </p>
        </div>

        {/* Cards de Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card: MATERIA */}
          <Link
            to="/materias"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-salesiano-azul-500 to-salesiano-azul-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative p-12 text-center">
              {/* Icono */}
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-salesiano-azul-500 to-salesiano-azul-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-salesiano-amarillo-400 transition-all duration-300">
                  <svg className="w-14 h-14 text-white group-hover:text-salesiano-azul-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>

              {/* Título */}
              <h4 className="text-3xl font-bold text-salesiano-azul-700 group-hover:text-white mb-3 transition-colors duration-300">
                MATERIA
              </h4>

              {/* Descripción */}
              <p className="text-gray-600 group-hover:text-blue-100 text-lg mb-6 transition-colors duration-300">
                Explora videos organizados por asignaturas
              </p>

              {/* Badge */}
              <div className="inline-block px-4 py-2 bg-salesiano-azul-100 group-hover:bg-salesiano-amarillo-400 text-salesiano-azul-700 group-hover:text-salesiano-azul-900 rounded-full text-sm font-semibold transition-all duration-300">
                Matemáticas, Física, Química y más
              </div>

              {/* Flecha */}
              <div className="mt-6 flex justify-center">
                <div className="w-10 h-10 bg-salesiano-azul-100 group-hover:bg-salesiano-amarillo-400 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-6 h-6 text-salesiano-azul-600 group-hover:text-salesiano-azul-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Card: CURSO */}
          <Link
            to="/cursos"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-salesiano-amarillo-400 to-salesiano-amarillo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative p-12 text-center">
              {/* Icono */}
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-salesiano-amarillo-400 to-salesiano-amarillo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-salesiano-azul-600 transition-all duration-300">
                  <svg className="w-14 h-14 text-salesiano-azul-900 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>

              {/* Título */}
              <h4 className="text-3xl font-bold text-salesiano-amarillo-700 group-hover:text-white mb-3 transition-colors duration-300">
                CURSO
              </h4>

              {/* Descripción */}
              <p className="text-gray-600 group-hover:text-yellow-100 text-lg mb-6 transition-colors duration-300">
                Busca videos según tu grado escolar
              </p>

              {/* Badge */}
              <div className="inline-block px-4 py-2 bg-salesiano-amarillo-100 group-hover:bg-salesiano-azul-600 text-salesiano-amarillo-800 group-hover:text-white rounded-full text-sm font-semibold transition-all duration-300">
                1ro a 6to de Secundaria
              </div>

              {/* Flecha */}
              <div className="mt-6 flex justify-center">
                <div className="w-10 h-10 bg-salesiano-amarillo-100 group-hover:bg-salesiano-azul-600 rounded-full flex items-center justify-center transition-all duration-300">
                  <svg className="w-6 h-6 text-salesiano-amarillo-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Sección de Información Adicional */}
      <div className="bg-gradient-to-r from-salesiano-azul-50 to-salesiano-amarillo-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Feature 1 */}
            <div className="p-6">
              <div className="w-16 h-16 bg-salesiano-azul-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h5 className="text-xl font-bold text-salesiano-azul-700 mb-2">Videos Educativos</h5>
              <p className="text-gray-600">Contenido de calidad creado por nuestros docentes</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6">
              <div className="w-16 h-16 bg-salesiano-amarillo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-salesiano-azul-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h5 className="text-xl font-bold text-salesiano-azul-700 mb-2">Todas las Materias</h5>
              <p className="text-gray-600">Matemáticas, Física, Química, Historia y más</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6">
              <div className="w-16 h-16 bg-salesiano-azul-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h5 className="text-xl font-bold text-salesiano-azul-700 mb-2">Acceso Local</h5>
              <p className="text-gray-600">Sin necesidad de internet, disponible en la intranet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="bg-gradient-to-r from-salesiano-azul-700 to-salesiano-azul-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Listo para explorar?
          </h3>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Selecciona una categoría arriba para comenzar a descubrir contenido educativo de calidad
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/materias"
              className="px-8 py-3 bg-salesiano-amarillo-400 text-salesiano-azul-900 rounded-lg font-bold hover:bg-salesiano-amarillo-300 transition shadow-lg hover:shadow-xl"
            >
              Explorar Materias
            </Link>
            <Link
              to="/cursos"
              className="px-8 py-3 bg-white text-salesiano-azul-700 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
            >
              Explorar Cursos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
