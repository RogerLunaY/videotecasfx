/**
 * Componente de Tarjeta de Video - Soporte para Vista Grid y Lista
 */

import { Link } from 'react-router-dom';
import { formatDuration, formatDate } from '../../utils/helpers';
import { getThumbnailUrl } from '../../services/videoService';

const VideoCard = ({ video, viewMode = 'grid' }) => {
  const thumbnailUrl = getThumbnailUrl(video.thumbnail);

  // Vista de Lista (horizontal)
  if (viewMode === 'list') {
    return (
      <Link to={`/videos/${video.id}`} className="group">
        <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex">
          {/* Thumbnail */}
          <div className="relative w-80 flex-shrink-0 bg-gray-200 overflow-hidden">
            <img
              src={thumbnailUrl}
              alt={video.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = '/placeholder-video.svg';
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
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                {video.titulo}
              </h3>

              {video.descripcion && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {video.descripcion}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Materia */}
                {video.materia_nombre && (
                  <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                    📚 {video.materia_nombre}
                  </span>
                )}
                {/* Grado */}
                {video.grado_nombre && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    🎓 {video.grado_nombre}
                  </span>
                )}
                {/* Tema */}
                {video.tema_nombre && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    📖 {video.tema_nombre}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {video.visualizaciones || 0} vistas
              </div>

              {video.docente_nombre && (
                <div className="text-sm text-gray-600">
                  Por: <span className="font-medium">{video.docente_nombre}</span>
                </div>
              )}

              <div className="text-sm text-gray-500">
                {formatDate(video.fecha_subida)}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Vista de Grid (vertical) - Default
  return (
    <Link to={`/videos/${video.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200 overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Placeholder cuando no hay thumbnail
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                    <div class="text-center">
                      <svg class="w-20 h-20 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p class="text-gray-400 text-sm font-medium">Vista Previa del Video</p>
                    </div>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
              <div className="text-center">
                <svg className="w-20 h-20 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-sm font-medium">Vista Previa del Video</p>
              </div>
            </div>
          )}

          {/* Duración */}
          {video.duracion && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duracion)}
            </div>
          )}

          {/* Badge "Nuevo" para videos recientes (< 7 días) */}
          {(() => {
            const uploadDate = new Date(video.fecha_subida);
            const daysSince = Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysSince < 7 && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                ✨ Nuevo
              </div>
            );
          })()}

          {/* Badge "Popular" para videos con más de 100 vistas */}
          {video.visualizaciones >= 100 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
              🔥 Popular
            </div>
          )}

          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
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

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Materia */}
            {video.materia_nombre && (
              <span className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                {video.materia_nombre}
              </span>
            )}
            {/* Grado */}
            {video.grado_nombre && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                {video.grado_nombre}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
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
