/**
 * Página de Inicio
 * Hero section animado con estadísticas y navegación a Materias/Cursos
 */

import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Play, Users, Video, ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Estadísticas de ejemplo (podrían venir de la API)
  const stats = [
    { label: 'Videos Educativos', value: '500+', icon: Video },
    { label: 'Materias', value: '15+', icon: BookOpen },
    { label: 'Docentes', value: '30+', icon: Users },
    { label: 'Cursos', value: '6', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50">
      {/* Hero Section - Card Flotante con Animaciones */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-salesiano-azul-500 pt-16 pb-24 relative overflow-hidden">
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-salesiano-amarillo-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-4 flex justify-center relative z-10">
          <div
            className={`bg-white rounded-3xl shadow-2xl px-8 md:px-12 py-10 text-center max-w-3xl w-full transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-700">
                Plataforma Educativa Salesiana
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-700 mb-4">
              BIENVENIDO
            </h1>

            {/* Subtítulo */}
            <h2 className="text-3xl md:text-4xl font-bold text-salesiano-azul-600 mb-4">
              VIDEOTECA SFX
            </h2>

            {/* Información */}
            <p className="text-lg md:text-xl text-gray-700 font-semibold mb-2">
              U.E. San Francisco Xavier
            </p>
            <p className="text-sm md:text-base text-gray-600 mb-8">
              Okinawa Uno, Bolivia
              <span className="mx-2 text-salesiano-amarillo-600">•</span>
              Comunidad Salesiana
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/materias"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <BookOpen className="w-5 h-5" />
                Explorar Materias
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/cursos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transform hover:scale-105 transition-all"
              >
                <GraduationCap className="w-5 h-5" />
                Ver Cursos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="container mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg p-6 text-center transform transition-all duration-1000 hover:scale-105 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección de Búsqueda por Categoría */}
      <div className="container mx-auto px-4 py-20">
        {/* Título de Sección */}
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-extrabold text-primary-700 mb-4">
            BUSCAR POR CATEGORÍA
          </h3>
          <p className="text-lg text-gray-600">
            Encuentra el contenido educativo que necesitas de manera rápida
          </p>
        </div>

        {/* Cards de Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Card: MATERIA */}
          <Link
            to="/materias"
            className="group relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
            <div className="relative p-12 md:p-16 text-center">
              {/* Icono */}
              <div className="mb-8 flex justify-center">
                <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-primary-600" strokeWidth={2} />
                </div>
              </div>

              {/* Título */}
              <h4 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                MATERIA
              </h4>
              <p className="text-primary-100 mb-6">
                Busca por área de conocimiento
              </p>

              {/* Flecha */}
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-salesiano-amarillo-400 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:shadow-lg transition-all duration-300">
                  <ArrowRight className="w-7 h-7 text-salesiano-azul-900" strokeWidth={3} />
                </div>
              </div>
            </div>
          </Link>

          {/* Card: CURSO */}
          <Link
            to="/cursos"
            className="group relative overflow-hidden bg-gradient-to-br from-salesiano-amarillo-400 to-salesiano-amarillo-500 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
            <div className="relative p-12 md:p-16 text-center">
              {/* Icono */}
              <div className="mb-8 flex justify-center">
                <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <GraduationCap className="w-16 h-16 md:w-20 md:h-20 text-salesiano-amarillo-600" strokeWidth={2} />
                </div>
              </div>

              {/* Título */}
              <h4 className="text-4xl md:text-5xl font-extrabold text-salesiano-azul-900 mb-3">
                CURSO
              </h4>
              <p className="text-salesiano-azul-800 mb-6">
                Busca por nivel académico
              </p>

              {/* Flecha */}
              <div className="flex justify-center">
                <div className="w-14 h-14 bg-salesiano-azul-600 rounded-full flex items-center justify-center group-hover:scale-125 group-hover:shadow-lg transition-all duration-300">
                  <ArrowRight className="w-7 h-7 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Sección de Valores Salesianos */}
      <div className="bg-white py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Educación Salesiana de Calidad
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Nuestra videoteca digital ofrece contenido educativo de alta calidad,
              diseñado para complementar el aprendizaje en el aula y fomentar el
              estudio autónomo bajo los valores salesianos de excelencia académica
              y formación integral.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/acerca-de"
                className="inline-flex items-center gap-2 px-6 py-3 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Conoce más sobre nosotros
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
