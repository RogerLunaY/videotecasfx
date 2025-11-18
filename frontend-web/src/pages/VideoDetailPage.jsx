/**
 * Página de Detalle de Video
 * Diseño: Hero section estilo YouTube/Netflix + Sidebar de navegación
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import VideoPlayer from '../components/Videos/VideoPlayer';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getVideoById, deleteVideo, getVideos, getThumbnailUrl, getStreamUrl } from '../services/videoService';
import { formatDate, formatDuration, formatFileSize, getInitials } from '../utils/helpers';

const VideoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isDocente } = useAuth();

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const videoData = await getVideoById(id);
      setVideo(videoData);

      // Cargar videos del mismo tema
      if (videoData.tema_id) {
        const relatedResponse = await getVideos({
          tema_id: videoData.tema_id,
          per_page: 12
        });
        setRelatedVideos(relatedResponse.videos.filter(v => v.id !== parseInt(id)));
      } else if (videoData.materia_id) {
        // Si no hay tema, cargar por materia
        const relatedResponse = await getVideos({
          materia_id: videoData.materia_id,
          per_page: 12
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

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownload = () => {
    const streamUrl = getStreamUrl(video.id);
    window.open(streamUrl, '_blank');
  };

  const canEdit = () => {
    if (!isAuthenticated) return false;
    if (isAdmin()) return true;
    if (isDocente() && video?.docente_id === user?.id) return true;
    return false;
  };

  const isNew = () => {
    if (!video?.fecha_subida) return false;
    const uploadDate = new Date(video.fecha_subida);
    const daysSince = Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince < 7;
  };

  const isPopular = () => {
    return video?.visualizaciones >= 100;
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;

    return formatDate(dateString);
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

  const currentIndex = relatedVideos.findIndex(v => v.id === parseInt(id));

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link to="/" className="hover:text-primary-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/videos" className="hover:text-primary-600 transition-colors">Videos</Link>
            {video.materia_nombre && (
              <>
                <span className="text-gray-400">/</span>
                <Link
                  to={`/videos?materia_id=${video.materia_id}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {video.materia_nombre}
                </Link>
              </>
            )}
            {video.grado_nombre && (
              <>
                <span className="text-gray-400">/</span>
                <Link
                  to={`/videos?grado_id=${video.grado_id}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {video.grado_nombre}
                </Link>
              </>
            )}
            {video.tema_nombre && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">{video.tema_nombre}</span>
              </>
            )}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Principal - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Reproductor de Video */}
              <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
                <VideoPlayer videoId={video.id} />
              </div>

              {/* Título y Badges */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start gap-3 mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex-1">
                    {video.titulo}
                  </h1>
                  <div className="flex items-center gap-2">
                    {isNew() && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Nuevo
                      </span>
                    )}
                    {isPopular() && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-medium">{video.visualizaciones?.toLocaleString() || 0}</span>
                    <span>visualizaciones</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full hidden md:block"></div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatRelativeDate(video.fecha_subida)}</span>
                  </div>
                  {video.duracion && (
                    <>
                      <div className="w-1 h-1 bg-gray-400 rounded-full hidden md:block"></div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDuration(video.duracion)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Card del Docente */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 ring-4 ring-white shadow-lg">
                      {getInitials(video.docente_nombre || 'Docente')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {video.docente_nombre || 'Docente'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Docente de {video.materia_nombre || 'la materia'}
                      </p>
                    </div>
                    {video.docente_id && (
                      <Link
                        to={`/videos?docente_id=${video.docente_id}`}
                        className="px-4 py-2 bg-white border-2 border-primary-600 text-primary-600 rounded-lg text-sm font-semibold hover:bg-primary-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                      >
                        Ver más videos
                      </Link>
                    )}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-wrap items-center gap-3 pb-6 border-b">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368a3 3 0 105.368 0m-4.681 0a3.001 3.001 0 01-5.368 0m9.049 0a3 3 0 010-5.368m0 5.368a3.001 3.001 0 015.368 0" />
                    </svg>
                    Compartir
                  </button>
                  {canEdit() && (
                    <>
                      <Link
                        to={`/videos/${video.id}/editar`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </>
                  )}
                </div>

                {/* Etiquetas */}
                <div className="flex flex-wrap gap-2 pt-6">
                  {video.materia_nombre && (
                    <Link
                      to={`/videos?materia_id=${video.materia_id}`}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold hover:bg-primary-200 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {video.materia_nombre}
                    </Link>
                  )}
                  {video.grado_nombre && (
                    <Link
                      to={`/videos?grado_id=${video.grado_id}`}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {video.grado_nombre}
                    </Link>
                  )}
                  {video.tema_nombre && (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {video.tema_nombre}
                    </span>
                  )}
                  {video.etiquetas && video.etiquetas.split(',').map((tag, index) => (
                    <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tabs de Contenido */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                      activeTab === 'description'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Descripción
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                      activeTab === 'details'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Detalles Técnicos
                    </div>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'description' && (
                    <div className="animate-fade-in">
                      {video.descripcion ? (
                        <div className="prose max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {video.descripcion}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500">No hay descripción disponible</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'details' && (
                    <div className="animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">Información del Video</h4>
                          </div>
                          <dl className="space-y-3 text-sm">
                            {video.duracion && (
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Duración:</dt>
                                <dd className="text-gray-900 font-medium">{formatDuration(video.duracion)}</dd>
                              </div>
                            )}
                            {video.resolucion && (
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Resolución:</dt>
                                <dd className="text-gray-900 font-medium">{video.resolucion}</dd>
                              </div>
                            )}
                            {video.tamano_archivo && (
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Tamaño:</dt>
                                <dd className="text-gray-900 font-medium">{formatFileSize(video.tamano_archivo)}</dd>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Formato:</dt>
                              <dd className="text-gray-900 font-medium">MP4</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">Detalles de Publicación</h4>
                          </div>
                          <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Fecha de subida:</dt>
                              <dd className="text-gray-900 font-medium">{formatDate(video.fecha_subida)}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Visualizaciones:</dt>
                              <dd className="text-gray-900 font-medium">{video.visualizaciones?.toLocaleString() || 0}</dd>
                            </div>
                            {video.docente_nombre && (
                              <div className="flex justify-between">
                                <dt className="text-gray-600">Docente:</dt>
                                <dd className="text-gray-900 font-medium">{video.docente_nombre}</dd>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <dt className="text-gray-600">ID del video:</dt>
                              <dd className="text-gray-900 font-medium">#{video.id}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Videos del Tema - 1/3 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {video.tema_nombre ? `Videos de ${video.tema_nombre}` : 'Videos Relacionados'}
                </h2>

                {relatedVideos.length > 0 ? (
                  <>
                    {currentIndex >= 0 && (
                      <div className="mb-4 p-3 bg-primary-50 border-2 border-primary-200 rounded-lg">
                        <p className="text-sm text-primary-700 font-semibold flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Video {currentIndex + 1} de {relatedVideos.length + 1}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {relatedVideos.map((relatedVideo, index) => {
                        const isCurrent = relatedVideo.id === parseInt(id);
                        return (
                          <Link
                            key={relatedVideo.id}
                            to={`/videos/${relatedVideo.id}`}
                            className={`block rounded-lg overflow-hidden transition-all ${
                              isCurrent
                                ? 'ring-2 ring-primary-600 bg-primary-50'
                                : 'hover:shadow-lg bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex gap-3 p-3">
                              <div className="relative w-32 aspect-video bg-gray-200 flex-shrink-0 rounded-md overflow-hidden">
                                {relatedVideo.thumbnail ? (
                                  <img
                                    src={getThumbnailUrl(relatedVideo.thumbnail)}
                                    alt={relatedVideo.titulo}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div className="w-full h-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900" style={{ display: relatedVideo.thumbnail ? 'none' : 'flex' }}>
                                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                {relatedVideo.duracion && (
                                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black bg-opacity-75 text-white text-xs font-semibold rounded">
                                    {formatDuration(relatedVideo.duracion)}
                                  </div>
                                )}
                                {isCurrent && (
                                  <div className="absolute inset-0 bg-primary-600 bg-opacity-20 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm line-clamp-2 mb-1 ${
                                  isCurrent ? 'text-primary-700' : 'text-gray-900'
                                }`}>
                                  {relatedVideo.titulo}
                                </h3>
                                <p className="text-xs text-gray-600 mb-1">{relatedVideo.docente_nombre}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{relatedVideo.visualizaciones || 0} vistas</span>
                                  {(() => {
                                    const uploadDate = new Date(relatedVideo.fecha_subida);
                                    const daysSince = Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
                                    if (daysSince < 7) {
                                      return (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                                          Nuevo
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium">No hay videos relacionados</p>
                    <p className="text-sm text-gray-500 mt-1">Este es el único video en este tema</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Compartir */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Compartir Video</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6">Comparte este video con tus colegas y estudiantes</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    copySuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {copySuccess ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              {copySuccess && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enlace copiado al portapapeles
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6 text-center">
              ¿Estás seguro de que deseas eliminar el video <strong>"{video.titulo}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </Layout>
  );
};

export default VideoDetailPage;
