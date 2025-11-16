/**
 * Página de Inicio
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import VideoList from '../components/Videos/VideoList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getPopularVideos, getRecentVideos } from '../services/videoService';

const HomePage = () => {
  const [popularVideos, setPopularVideos] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const [popular, recent] = await Promise.all([
        getPopularVideos(8),
        getRecentVideos(8)
      ]);
      setPopularVideos(popular.videos || []);
      setRecentVideos(recent.videos || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Videoteca Digital San Francisco Xavier
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Accede a contenido educativo de calidad. Videos organizados por materias, grados y temas
              para facilitar tu aprendizaje.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/videos" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Explorar Videos
              </Link>
              <Link to="/dashboard" className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">142</div>
              <div className="text-gray-600">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">20</div>
              <div className="text-gray-600">Docentes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {popularVideos.length + recentVideos.length}+
              </div>
              <div className="text-gray-600">Videos Disponibles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Populares */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Videos Populares</h2>
          <Link to="/videos?order_by=visualizaciones&order_dir=DESC" className="text-primary-600 hover:text-primary-700">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <VideoList
            videos={popularVideos.slice(0, 4)}
            loading={false}
            emptyMessage="No hay videos populares disponibles"
          />
        )}
      </div>

      {/* Videos Recientes */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Videos Recientes</h2>
            <Link to="/videos?order_by=fecha_subida&order_dir=DESC" className="text-primary-600 hover:text-primary-700">
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <VideoList
              videos={recentVideos.slice(0, 4)}
              loading={false}
              emptyMessage="No hay videos recientes disponibles"
            />
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary-600 text-white">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Eres docente?</h2>
          <p className="text-xl text-primary-100 mb-6">
            Comparte tu conocimiento subiendo videos educativos
          </p>
          <Link to="/login" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
