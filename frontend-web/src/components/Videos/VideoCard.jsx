/**
 * Componente de Tarjeta de Video
 */

import { Link } from 'react-router-dom';
import { formatDuration, formatDate } from '../../utils/helpers';
import { getThumbnailUrl } from '../../services/videoService';

const VideoCard = ({ video }) => {
  const thumbnailUrl = getThumbnailUrl(video.thumbnail);

  return (
    <Link to={`/videos/${video.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200 overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={video.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-video.png';
            }}
          />
          {/* Duración */}
          {video.duracion && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duracion)}
            </div>
          )}
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {video.titulo}
          </h3>

          {video.descripcion && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {video.descripcion}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {/* Materia */}
              {video.materia_nombre && (
                <span className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded">
                  {video.materia_nombre}
                </span>
              )}
              {/* Grado */}
              {video.grado_nombre && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {video.grado_nombre}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {video.visualizaciones || 0} vistas
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(video.fecha_subida)}
            </div>
          </div>

          {video.docente_nombre && (
            <div className="mt-2 text-xs text-gray-500">
              Por: {video.docente_nombre}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
