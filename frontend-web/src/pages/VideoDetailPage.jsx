/**
 * Página de Detalle de Video
 * Estilo YouTube/Netflix con Hero Section y Sidebar de Navegación
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Play, Eye, Calendar, Clock, User, BookOpen, GraduationCap,
  FileText, Edit, Trash2, ChevronRight, PlayCircle, Info
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import VideoPlayer from '../components/Videos/VideoPlayer';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getVideoById, deleteVideo, getVideos, getThumbnailUrl } from '../services/videoService';
import { formatDate, formatDuration, formatFileSize } from '../utils/helpers';

const VideoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isDocente } = useAuth();

  const [video, setVideo] = useState(null);
  const [sameTopicVideos, setSameTopicVideos] = useState([]);
  const [sameMateriaVideos, setSameMateriaVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const videoData = await getVideoById(id);
      setVideo(videoData);

      // Cargar videos del mismo tema (si tiene tema)
      if (videoData.tema_id) {
        const topicResponse = await getVideos({
          tema_id: videoData.tema_id,
          per_page: 10
        });
        setSameTopicVideos(topicResponse.videos.filter(v => v.id !== parseInt(id)));
      }

      // Cargar videos de la misma materia
      if (videoData.materia_id) {
        const materiaResponse = await getVideos({
          materia_id: videoData.materia_id,
          per_page: 6
        });
        setSameMateriaVideos(materiaResponse.videos.filter(v => v.id !== parseInt(id)));
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
          <div className="text-center py-12">
            <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Video no encontrado</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-black">
        {/* Hero Section - Video Player (Full Width) */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto">
            <VideoPlayer videoId={video.id} />
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Principal - Información del Video */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md p-6">
                  {/* Título y Acciones */}
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex-1">
                      {video.titulo}
                    </h1>
                    {canEdit() && (
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          to={`/videos/${video.id}/editar`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar video"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar video"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">{video.visualizaciones || 0}</span> visualizaciones
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(video.fecha_subida)}
                    </div>
                    {video.duracion && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatDuration(video.duracion)}
                      </div>
                    )}
                  </div>

                  {/* Tags/Categorías */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {video.materia_nombre && (
                      <Link
                        to={`/videos?materia_id=${video.materia_id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold hover:bg-purple-100 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        {video.materia_nombre}
                      </Link>
                    )}
                    {video.grado_nombre && (
                      <Link
                        to={`/videos?grado_id=${video.grado_id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors"
                      >
                        <GraduationCap className="w-4 h-4" />
                        {video.grado_nombre}
                      </Link>
                    )}
                    {video.tema_nombre && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                        <FileText className="w-4 h-4" />
                        {video.tema_nombre}
                      </span>
                    )}
                  </div>

                  {/* Docente */}
                  {video.docente_nombre && (
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-salesiano-azul-600 flex items-center justify-center text-white font-bold text-lg">
                        {video.docente_nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Docente</p>
                        <p className="font-semibold text-gray-900">{video.docente_nombre}</p>
                      </div>
                    </div>
                  )}

                  {/* Descripción */}
                  {video.descripcion && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-5 h-5 text-primary-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Descripción</h3>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className={`text-gray-700 whitespace-pre-wrap ${!showFullDescription && 'line-clamp-3'}`}>
                          {video.descripcion}
                        </p>
                        {video.descripcion.length > 200 && (
                          <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm mt-2"
                          >
                            {showFullDescription ? 'Mostrar menos' : 'Mostrar más'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Información Técnica */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Técnica</h3>
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {video.duracion && (
                        <div>
                          <dt className="text-gray-500 mb-1">Duración</dt>
                          <dd className="text-gray-900 font-medium">{formatDuration(video.duracion)}</dd>
                        </div>
                      )}
                      {video.tamano_archivo && (
                        <div>
                          <dt className="text-gray-500 mb-1">Tamaño</dt>
                          <dd className="text-gray-900 font-medium">{formatFileSize(video.tamano_archivo)}</dd>
                        </div>
                      )}
                      {video.resolucion && (
                        <div>
                          <dt className="text-gray-500 mb-1">Resolución</dt>
                          <dd className="text-gray-900 font-medium">{video.resolucion}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-gray-500 mb-1">Formato</dt>
                        <dd className="text-gray-900 font-medium">MP4</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Sidebar - Navegación de Videos */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-4">
                  {/* Videos del mismo tema */}
                  {sameTopicVideos.length > 0 && (
                    <div className="border-b border-gray-200">
                      <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-3">
                        <h2 className="font-semibold flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          {video.tema_nombre}
                        </h2>
                        <p className="text-xs text-primary-100 mt-1">
                          {sameTopicVideos.length} videos en este tema
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {sameTopicVideos.map((relatedVideo, index) => (
                          <Link
                            key={relatedVideo.id}
                            to={`/videos/${relatedVideo.id}`}
                            className="block hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex gap-3 p-3">
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 relative">
                                  <img
                                    src={getThumbnailUrl(relatedVideo.thumbnail)}
                                    alt={relatedVideo.titulo}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = '/placeholder-video.svg'}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                                    <PlayCircle className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
                                      {relatedVideo.titulo}
                                    </h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {relatedVideo.visualizaciones || 0} vistas
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos de la misma materia */}
                  {sameMateriaVideos.length > 0 && (
                    <div>
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                          Más de {video.materia_nombre}
                        </h2>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {sameMateriaVideos.map((relatedVideo) => (
                          <Link
                            key={relatedVideo.id}
                            to={`/videos/${relatedVideo.id}`}
                            className="block hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex gap-3 p-3">
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 relative">
                                  <img
                                    src={getThumbnailUrl(relatedVideo.thumbnail)}
                                    alt={relatedVideo.titulo}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = '/placeholder-video.svg'}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                                    <PlayCircle className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
                                  {relatedVideo.titulo}
                                </h3>
                                <p className="text-xs text-gray-500 mb-1">{relatedVideo.docente_nombre}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {relatedVideo.visualizaciones || 0}
                                  </span>
                                  {relatedVideo.tema_nombre && (
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {relatedVideo.tema_nombre}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <Link
                          to={`/videos?materia_id=${video.materia_id}`}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-2"
                        >
                          Ver todos los videos de {video.materia_nombre}
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Estado vacío */}
                  {sameTopicVideos.length === 0 && sameMateriaVideos.length === 0 && (
                    <div className="p-8 text-center">
                      <PlayCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No hay videos relacionados</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Eliminar Video</h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar el video <strong>"{video.titulo}"</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
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
