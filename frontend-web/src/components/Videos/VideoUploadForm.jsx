/**
 * Componente de Formulario de Subida de Video
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../../hooks/useResources';
import { uploadVideo } from '../../services/videoService';
import LoadingSpinner from '../Common/LoadingSpinner';

const VideoUploadForm = () => {
  const navigate = useNavigate();
  const { materias, grados, temas, loading: resourcesLoading } = useResources();
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    materia_id: '',
    grado_id: '',
    tema_id: '',
  });

  const [files, setFiles] = useState({
    video: null,
    thumbnail: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: selectedFiles[0]
      }));
      // Limpiar error del campo
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }

    if (!formData.materia_id) {
      newErrors.materia_id = 'La materia es requerida';
    }

    if (!formData.grado_id) {
      newErrors.grado_id = 'El grado es requerido';
    }

    if (!formData.tema_id) {
      newErrors.tema_id = 'El tema es requerido';
    }

    if (!files.video) {
      newErrors.video = 'El archivo de video es requerido';
    } else {
      // Validar tipo de archivo
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'];
      if (!validTypes.includes(files.video.type)) {
        newErrors.video = 'Formato de video no válido. Use MP4, WebM, OGG o AVI';
      }

      // Validar tamaño (máximo 500MB)
      const maxSize = 500 * 1024 * 1024; // 500MB en bytes
      if (files.video.size > maxSize) {
        newErrors.video = 'El archivo de video es demasiado grande. Máximo 500MB';
      }
    }

    if (files.thumbnail) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(files.thumbnail.type)) {
        newErrors.thumbnail = 'Formato de imagen no válido. Use JPG, PNG o WebP';
      }

      // Validar tamaño de thumbnail (máximo 5MB)
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      if (files.thumbnail.size > maxImageSize) {
        newErrors.thumbnail = 'La imagen es demasiado grande. Máximo 5MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('titulo', formData.titulo);
      uploadData.append('descripcion', formData.descripcion);
      uploadData.append('materia_id', formData.materia_id);
      uploadData.append('grado_id', formData.grado_id);
      uploadData.append('tema_id', formData.tema_id);
      uploadData.append('video', files.video);

      if (files.thumbnail) {
        uploadData.append('thumbnail', files.thumbnail);
      }

      const response = await uploadVideo(uploadData, (progress) => {
        setUploadProgress(progress);
      });

      // Redirigir al video subido
      navigate(`/videos/${response.video.id}`);
    } catch (error) {
      console.error('Error al subir video:', error);

      // Mensaje de error más descriptivo
      let mensajeError = 'Error al subir el video';

      if (error.response) {
        // Error del servidor
        mensajeError = error.response.data?.error?.message || error.response.data?.message || 'Error del servidor al procesar el video';
      } else if (error.request) {
        // No hubo respuesta del servidor
        mensajeError = 'No se pudo conectar con el servidor. Verifica tu conexión a internet o que el video no sea demasiado grande para los límites del servidor.';
      } else {
        // Error al configurar la petición
        mensajeError = error.message || 'Error al preparar la subida del video';
      }

      setErrorMessage(mensajeError);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemas = temas.filter(tema => tema.materia_id == formData.materia_id);

  if (resourcesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Información del Video */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Video</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={`input-field ${errors.titulo ? 'border-red-500' : ''}`}
              placeholder="Ej: Introducción al Álgebra"
            />
            {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>}
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              className="input-field"
              placeholder="Describe el contenido del video..."
            />
          </div>
        </div>
      </div>

      {/* Clasificación */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clasificación</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="materia_id" className="block text-sm font-medium text-gray-700 mb-1">
              Materia *
            </label>
            <select
              id="materia_id"
              name="materia_id"
              value={formData.materia_id}
              onChange={handleChange}
              className={`input-field ${errors.materia_id ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccionar materia</option>
              {materias.map(materia => (
                <option key={materia.id} value={materia.id}>{materia.nombre}</option>
              ))}
            </select>
            {errors.materia_id && <p className="mt-1 text-sm text-red-600">{errors.materia_id}</p>}
          </div>

          <div>
            <label htmlFor="grado_id" className="block text-sm font-medium text-gray-700 mb-1">
              Grado *
            </label>
            <select
              id="grado_id"
              name="grado_id"
              value={formData.grado_id}
              onChange={handleChange}
              className={`input-field ${errors.grado_id ? 'border-red-500' : ''}`}
            >
              <option value="">Seleccionar grado</option>
              {grados.map(grado => (
                <option key={grado.id} value={grado.id}>{grado.nombre}</option>
              ))}
            </select>
            {errors.grado_id && <p className="mt-1 text-sm text-red-600">{errors.grado_id}</p>}
          </div>

          <div>
            <label htmlFor="tema_id" className="block text-sm font-medium text-gray-700 mb-1">
              Tema *
            </label>
            <select
              id="tema_id"
              name="tema_id"
              value={formData.tema_id}
              onChange={handleChange}
              className={`input-field ${errors.tema_id ? 'border-red-500' : ''}`}
              disabled={!formData.materia_id}
            >
              <option value="">Seleccionar tema</option>
              {filteredTemas.map(tema => (
                <option key={tema.id} value={tema.id}>{tema.nombre}</option>
              ))}
            </select>
            {errors.tema_id && <p className="mt-1 text-sm text-red-600">{errors.tema_id}</p>}
          </div>
        </div>
      </div>

      {/* Archivos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Archivos</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
              Archivo de Video * (MP4, WebM, OGG, AVI - Máx. 500MB)
            </label>
            <input
              ref={videoInputRef}
              type="file"
              id="video"
              name="video"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="btn-secondary"
              >
                Seleccionar Video
              </button>
              {files.video && (
                <span className="text-sm text-gray-600">
                  {files.video.name} ({(files.video.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
            {errors.video && <p className="mt-1 text-sm text-red-600">{errors.video}</p>}
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
              Miniatura (Opcional - JPG, PNG, WebP - Máx. 5MB)
            </label>
            <input
              ref={thumbnailInputRef}
              type="file"
              id="thumbnail"
              name="thumbnail"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                className="btn-secondary"
              >
                Seleccionar Miniatura
              </button>
              {files.thumbnail && (
                <span className="text-sm text-gray-600">
                  {files.thumbnail.name} ({(files.thumbnail.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
            {errors.thumbnail && <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Si no subes una miniatura, se generará automáticamente del video
            </p>
          </div>
        </div>
      </div>

      {/* Progreso de Subida */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Subiendo video...</span>
            <span className="text-sm text-blue-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Subiendo...' : 'Subir Video'}
        </button>
      </div>
    </form>
  );
};

export default VideoUploadForm;
