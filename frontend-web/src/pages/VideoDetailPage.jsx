/**
 * Página de Detalle de Video
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import VideoPlayer from '../components/Videos/VideoPlayer';
import VideoList from '../components/Videos/VideoList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getVideoById, deleteVideo, getVideos, getThumbnailUrl } from '../services/videoService';
import { formatDate, formatDuration, formatFileSize } from '../utils/helpers';

const VideoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isDocente } = useAuth();

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const videoData = await getVideoById(id);
      setVideo(videoData);

      // Cargar videos relacionados
      if (videoData.materia_id) {
        const relatedResponse = await getVideos({
          materia_id: videoData.materia_id,
          per_page: 4
        });
        setRelatedVideos(relatedResponse.videos.filter(v => v.id !== parseInt(id)));
      }
    } catch (error) {
      console.error('Error loading video:', error);
      navigate('/videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVideo(id);
      navigate('/videos');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error al eliminar el video');
    }
  };

  const canEdit = () => {
    if (!isAuthenticated) return false;
    if (isAdmin()) return true;
    if (isDocente() && video?.docente_id === user?.id) return true;
    return false;
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Video no encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2">
            {/* Reproductor */}
            <VideoPlayer videoId={video.id} />

            {/* Información del Video */}
            <div className="mt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {video.titulo}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {video.visualizaciones || 0} visualizaciones
                    </div>
                    <div>
                      {formatDate(video.fecha_subida)}
                    </div>
                  </div>
                </div>

                {canEdit() && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/videos/${video.id}/editar`}
                      className="btn-secondary text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="btn-danger text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {video.materia_nombre && (
                  <Link
                    to={`/videos?materia_id=${video.materia_id}`}
                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100"
                  >
                    {video.materia_nombre}
                  </Link>
                )}
                {video.grado_nombre && (
                  <Link
                    to={`/videos?grado_id=${video.grado_id}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200"
                  >
                    {video.grado_nombre}
                  </Link>
                )}
                {video.tema_nombre && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    {video.tema_nombre}
                  </span>
                )}
              </div>

              {/* Descripción */}
              {video.descripcion && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{video.descripcion}</p>
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Información</h3>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {video.docente_nombre && (
                    <>
                      <dt className="text-gray-600">Docente:</dt>
                      <dd className="text-gray-900 font-medium">{video.docente_nombre}</dd>
                    </>
                  )}
                  {video.duracion && (
                    <>
                      <dt className="text-gray-600">Duración:</dt>
                      <dd className="text-gray-900 font-medium">{formatDuration(video.duracion)}</dd>
                    </>
                  )}
                  {video.tamano_archivo && (
                    <>
                      <dt className="text-gray-600">Tamaño:</dt>
                      <dd className="text-gray-900 font-medium">{formatFileSize(video.tamano_archivo)}</dd>
                    </>
                  )}
                  {video.resolucion && (
                    <>
                      <dt className="text-gray-600">Resolución:</dt>
                      <dd className="text-gray-900 font-medium">{video.resolucion}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Sidebar - Videos Relacionados */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Videos Relacionados</h2>
            {relatedVideos.length > 0 ? (
              <div className="space-y-4">
                {relatedVideos.map(relatedVideo => (
                  <Link
                    key={relatedVideo.id}
                    to={`/videos/${relatedVideo.id}`}
                    className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex">
                      <div className="w-40 aspect-video bg-gray-200 flex-shrink-0">
                        <img
                          src={getThumbnailUrl(relatedVideo.thumbnail)}
                          alt={relatedVideo.titulo}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.src = '/placeholder-video.png'}
                        />
                      </div>
                      <div className="p-3 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                          {relatedVideo.titulo}
                        </h3>
                        <p className="text-xs text-gray-600">{relatedVideo.docente_nombre}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {relatedVideo.visualizaciones || 0} vistas
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay videos relacionados</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el video "{video.titulo}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VideoDetailPage;
