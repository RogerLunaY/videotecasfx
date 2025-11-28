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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section - Card Flotante con Animaciones */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-salesiano-azul-500 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 pt-16 pb-24 relative overflow-hidden">
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 dark:bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-salesiano-amarillo-400/10 dark:bg-primary-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-4 flex justify-center relative z-10">
          <div
            className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl px-8 md:px-12 py-10 text-center max-w-3xl w-full transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                Plataforma Educativa Salesiana
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-700 dark:text-primary-400 mb-4">
              BIENVENIDO
            </h1>

            {/* Subtítulo */}
            <h2 className="text-3xl md:text-4xl font-bold text-salesiano-azul-600 dark:text-salesiano-azul-400 mb-4">
              VIDEOTECA SFX
            </h2>

            {/* Información */}
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-semibold mb-2">
              U.E. San Francisco Xavier
            </p>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-8">
              Okinawa Uno, Bolivia
              <span className="mx-2 text-salesiano-amarillo-600 dark:text-salesiano-amarillo-400">•</span>
              Comunidad Salesiana
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/materias"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                <BookOpen className="w-5 h-5" />
                Explorar Materias
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/cursos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 border-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 font-semibold rounded-xl hover:bg-primary-50 dark:hover:bg-gray-600 transform hover:scale-105 transition-all"
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
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center transform transition-all duration-1000 hover:scale-105 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sección de Valores Salesianos */}
      <div className="bg-white dark:bg-gray-800 py-16 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Educación Salesiana de Calidad
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              Nuestra videoteca digital ofrece contenido educativo de alta calidad,
              diseñado para complementar el aprendizaje en el aula y fomentar el
              estudio autónomo bajo los valores salesianos de excelencia académica
              y formación integral.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/acerca-de"
                className="inline-flex items-center gap-2 px-6 py-3 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
              >
                Conoce más sobre nosotros
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 dark:bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
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
