/**
 * Página de Preguntas Frecuentes
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight, ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      category: 'Acceso y Uso',
      questions: [
        {
          q: '¿Cómo puedo acceder a la videoteca?',
          a: 'La videoteca está disponible en la red intranet local de la institución. No necesitas conexión a internet, solo conectarte a la red de la U.E. San Francisco Xavier y acceder a través de tu navegador web.',
        },
        {
          q: '¿Necesito crear una cuenta?',
          a: 'Los estudiantes pueden navegar y ver videos sin necesidad de cuenta. Los docentes reciben credenciales de acceso para subir contenido. Los administradores tienen acceso completo para gestionar la plataforma.',
        },
        {
          q: '¿Puedo acceder desde mi casa?',
          a: 'Actualmente, la videoteca solo está disponible en la red intranet local de la institución. No es accesible desde internet por razones de seguridad y optimización del ancho de banda.',
        },
      ],
    },
    {
      category: 'Contenido',
      questions: [
        {
          q: '¿Qué tipo de videos encuentro?',
          a: 'Encontrarás videos educativos de todas las materias del currículum de secundaria, organizados por materia, grado y tema. El contenido está curado por nuestros docentes para garantizar su calidad educativa.',
        },
        {
          q: '¿Cómo busco un video específico?',
          a: 'Puedes buscar por materia, grado o curso. También hay filtros por campo de saber y una barra de búsqueda por palabras clave para encontrar rápidamente el contenido que necesitas.',
        },
        {
          q: '¿Con qué frecuencia se agregan nuevos videos?',
          a: 'Los docentes pueden subir nuevos videos en cualquier momento. La frecuencia depende de las necesidades académicas y el material disponible. Te recomendamos revisar regularmente para descubrir nuevo contenido.',
        },
      ],
    },
    {
      category: 'Para Docentes',
      questions: [
        {
          q: '¿Cómo puedo subir un video?',
          a: 'Inicia sesión con tus credenciales de docente, ve a "Subir Video" en el menú principal, completa el formulario con la información del video (título, descripción, materia, grado, tema) y selecciona el archivo. El sistema soporta archivos hasta 500MB.',
        },
        {
          q: '¿Qué formatos de video son aceptados?',
          a: 'Aceptamos los formatos más comunes: MP4, WebM, OGG y AVI. Te recomendamos usar MP4 para mejor compatibilidad y calidad.',
        },
        {
          q: '¿Puedo editar o eliminar mis videos?',
          a: 'Sí, puedes editar la información de tus videos (título, descripción, clasificación) en cualquier momento. Para eliminar un video, contacta con el administrador del sistema.',
        },
      ],
    },
    {
      category: 'Técnico',
      questions: [
        {
          q: '¿Qué navegadores son compatibles?',
          a: 'La plataforma funciona en navegadores modernos: Google Chrome, Mozilla Firefox, Microsoft Edge y Safari. Para mejor experiencia, mantén tu navegador actualizado.',
        },
        {
          q: '¿Por qué un video no se reproduce?',
          a: 'Verifica que tengas una conexión estable a la red intranet. Si el problema persiste, intenta actualizar la página o usar otro navegador. Si el error continúa, reporta el problema a un docente o administrador.',
        },
        {
          q: '¿Puedo descargar los videos?',
          a: 'Por políticas de la institución, los videos están diseñados para visualización en línea dentro de la red intranet. No está habilitada la descarga directa.',
        },
      ],
    },
  ];

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-salesiano-azul-500 text-white py-16">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link to="/" className="hover:underline flex items-center gap-1">
              <Home className="w-4 h-4" />
              Inicio
            </Link>
            <ArrowRight className="w-4 h-4" />
            <span>Preguntas Frecuentes</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <HelpCircle className="w-9 h-9" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold">
                Preguntas Frecuentes
              </h1>
            </div>
            <p className="text-xl text-primary-100">
              Encuentra respuestas a las dudas más comunes sobre la Videoteca SFX
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-8">
              {filteredFAQs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
                    {category.category}
                  </h2>
                  <div className="space-y-3">
                    {category.questions.map((item, questionIndex) => {
                      const index = `${categoryIndex}-${questionIndex}`;
                      const isExpanded = expandedIndex === index;

                      return (
                        <div
                          key={questionIndex}
                          className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
                        >
                          <button
                            onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-gray-900 pr-4">
                              {item.q}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                              {item.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-xl text-gray-600">
                No se encontraron preguntas que coincidan con "{searchTerm}"
              </p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl shadow-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-primary-100 mb-6">
              Contacta con un docente o administrador para recibir ayuda personalizada
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-800 transition-all"
              >
                <Home className="w-4 h-4" />
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
