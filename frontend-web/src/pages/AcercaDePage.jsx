/**
 * Página Acerca de
 * Información institucional de la U.E. San Francisco Xavier
 */

import { Link } from 'react-router-dom';

const AcercaDePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-salesiano-azul-600 to-salesiano-azul-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center">
              <svg className="w-12 h-12 text-salesiano-azul-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Acerca de Nosotros
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Unidad Educativa San Francisco Xavier - Okinawa Uno, Bolivia
          </p>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-12">
        {/* Nuestra Institución */}
        <div className="max-w-4xl mx-auto mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-salesiano-azul-700 mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Nuestra Institución
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="mb-4">
              La <strong>Unidad Educativa San Francisco Xavier</strong> es una institución educativa comprometida
              con la formación integral de nuestros estudiantes, ubicada en Okinawa Uno, Bolivia.
            </p>
            <p className="mb-4">
              Somos parte de la <strong>Comunidad Salesiana</strong>, inspirados en el carisma de Don Bosco,
              dedicados a la educación de la juventud con amor, razón y religión.
            </p>
            <p>
              Atendemos a <strong>142 estudiantes</strong> de 1ro a 6to de Secundaria, con un equipo de
              <strong> 20 docentes</strong> comprometidos con la excelencia académica y la formación en valores.
            </p>
          </div>
        </div>

        {/* Videoteca Digital */}
        <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-br from-salesiano-azul-50 to-salesiano-amarillo-50 rounded-2xl shadow-xl p-8 border-2 border-salesiano-azul-200">
          <h2 className="text-3xl font-bold text-salesiano-azul-700 mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Videoteca Digital
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="mb-4">
              Nuestra <strong>Videoteca Digital</strong> es una plataforma educativa diseñada para facilitar
              el acceso a contenido educativo de calidad para todos nuestros estudiantes y docentes.
            </p>
            <p className="mb-4">
              La plataforma funciona en la <strong>red intranet local</strong>, sin necesidad de conexión a internet,
              garantizando acceso permanente a los recursos educativos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-salesiano-azul-600 mb-2">12</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Materias Disponibles</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-salesiano-amarillo-600 mb-2">6</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Grados de Secundaria</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-salesiano-azul-600 mb-2">20+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Videos Educativos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Comunidad Salesiana */}
        <div className="max-w-4xl mx-auto mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-salesiano-azul-700 mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Carisma Salesiano
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="mb-4">
              Como institución salesiana, nuestra labor educativa se inspira en el <strong>Sistema Preventivo</strong>
              de Don Bosco, basado en tres pilares fundamentales:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-salesiano-azul-50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-salesiano-azul-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-salesiano-azul-700 mb-2">Razón</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Educación basada en el diálogo y la comprensión</p>
              </div>
              <div className="bg-salesiano-amarillo-50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-salesiano-amarillo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-salesiano-azul-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-salesiano-amarillo-700 mb-2">Amor</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acompañamiento cercano y afectuoso</p>
              </div>
              <div className="bg-salesiano-azul-50 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-salesiano-azul-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-salesiano-azul-700 mb-2">Religión</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Formación en valores cristianos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Características de la Plataforma */}
        <div className="max-w-4xl mx-auto mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-salesiano-azul-700 mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Características de la Plataforma
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-salesiano-azul-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-salesiano-azul-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Acceso Local</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Sin necesidad de internet, disponible 24/7 en la intranet</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 bg-salesiano-amarillo-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-salesiano-amarillo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Búsqueda Avanzada</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Filtros por materia, curso y palabras clave</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 bg-salesiano-azul-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-salesiano-azul-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Gestión de Usuarios</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Acceso personalizado para docentes y administradores</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-12 h-12 bg-salesiano-amarillo-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-salesiano-amarillo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Subida de Videos</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Los docentes pueden compartir contenido educativo</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-salesiano-azul-600 to-salesiano-azul-500 rounded-2xl shadow-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para explorar?
            </h2>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Descubre nuestra colección de videos educativos organizados por materias y cursos
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
                className="px-8 py-3 bg-white dark:bg-gray-800 text-salesiano-azul-700 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
              >
                Explorar Cursos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcercaDePage;
