/**
 * Componente de Formulario de Subida de Video - Wizard Multi-Paso
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../../hooks/useResources';
import { uploadVideo } from '../../services/videoService';
import LoadingSpinner from '../Common/LoadingSpinner';

const MAX_TITULO_LENGTH = 100;
const MAX_DESCRIPCION_LENGTH = 1000;
const MAX_TAGS = 10;

const VideoUploadForm = () => {
  const navigate = useNavigate();
  const { materias, grados, temas, loading: resourcesLoading } = useResources();
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const videoPreviewRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    materia_id: '',
    grado_id: '',
    tema_id: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [files, setFiles] = useState({
    video: null,
    thumbnail: null,
  });

  const [videoPreviews, setVideoPreviews] = useState({
    thumbnailUrl: null,
    duration: null,
    resolution: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState({ video: false, thumbnail: false });

  const steps = [
    { number: 1, name: 'Información', icon: '📝' },
    { number: 2, name: 'Clasificación', icon: '📚' },
    { number: 3, name: 'Archivos', icon: '📁' },
    { number: 4, name: 'Confirmar', icon: '✓' },
  ];

  // Generar thumbnail del video
  const generateVideoThumbnail = (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;

      video.onloadedmetadata = () => {
        // Obtener duración y resolución
        const duration = Math.round(video.duration);
        const resolution = `${video.videoWidth}x${video.videoHeight}`;

        // Ir al segundo 1 para capturar thumbnail
        video.currentTime = 1;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const thumbnailUrl = URL.createObjectURL(blob);
          resolve({
            thumbnailUrl,
            duration: video.duration,
            resolution: `${video.videoWidth}x${video.videoHeight}`,
          });
        }, 'image/jpeg', 0.95);
      };

      video.onerror = () => {
        reject(new Error('Error al cargar el video'));
      };

      video.src = URL.createObjectURL(videoFile);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validar longitud según el campo
    if (name === 'titulo' && value.length > MAX_TITULO_LENGTH) return;
    if (name === 'descripcion' && value.length > MAX_DESCRIPCION_LENGTH) return;

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

  const handleFileChange = async (e, fileType) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    await processFile(selectedFile, fileType);
  };

  const processFile = async (file, fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    // Generar preview del video
    if (fileType === 'video') {
      try {
        const preview = await generateVideoThumbnail(file);
        setVideoPreviews(prev => ({
          ...prev,
          ...preview
        }));
      } catch (error) {
        console.error('Error generando preview:', error);
      }
    } else if (fileType === 'thumbnail') {
      const thumbnailUrl = URL.createObjectURL(file);
      setVideoPreviews(prev => ({
        ...prev,
        thumbnailUrl
      }));
    }

    // Limpiar error del campo
    if (errors[fileType]) {
      setErrors(prev => ({
        ...prev,
        [fileType]: ''
      }));
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [fileType]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [fileType]: false }));
    }
  };

  const handleDrop = async (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [fileType]: false }));

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file, fileType);
    }
  };

  // Tags handlers
  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();

    if (!tag) return;

    if (formData.tags.length >= MAX_TAGS) {
      setErrors(prev => ({ ...prev, tags: `Máximo ${MAX_TAGS} etiquetas` }));
      return;
    }

    if (formData.tags.includes(tag)) {
      setErrors(prev => ({ ...prev, tags: 'Esta etiqueta ya existe' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
    setTagInput('');
    setErrors(prev => ({ ...prev, tags: '' }));
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleMateriaSelect = (materiaId) => {
    setFormData(prev => ({
      ...prev,
      materia_id: prev.materia_id === materiaId ? '' : materiaId,
      tema_id: prev.materia_id === materiaId ? prev.tema_id : '', // Mantener tema si es la misma materia
    }));
    if (errors.materia_id) {
      setErrors(prev => ({ ...prev, materia_id: '' }));
    }
  };

  const handleGradoSelect = (gradoId) => {
    setFormData(prev => ({
      ...prev,
      grado_id: prev.grado_id === gradoId ? '' : gradoId,
    }));
    if (errors.grado_id) {
      setErrors(prev => ({ ...prev, grado_id: '' }));
    }
  };

  const handleTemaSelect = (temaId) => {
    setFormData(prev => ({
      ...prev,
      tema_id: prev.tema_id === temaId ? '' : temaId,
    }));
    if (errors.tema_id) {
      setErrors(prev => ({ ...prev, tema_id: '' }));
    }
  };

  // Validación por paso
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.titulo.trim()) {
        newErrors.titulo = 'El título es requerido';
      }
    }

    if (step === 2) {
      if (!formData.materia_id) {
        newErrors.materia_id = 'La materia es requerida';
      }
      if (!formData.grado_id) {
        newErrors.grado_id = 'El grado es requerido';
      }
      if (!formData.tema_id) {
        newErrors.tema_id = 'El tema es requerido';
      }
    }

    if (step === 3) {
      if (!files.video) {
        newErrors.video = 'El archivo de video es requerido';
      } else {
        // Validar tipo de archivo
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/quicktime'];
        if (!validTypes.includes(files.video.type)) {
          newErrors.video = 'Formato de video no válido. Use MP4, WebM, OGG o AVI';
        }

        // Validar tamaño (máximo 500MB)
        const maxSize = 500 * 1024 * 1024;
        if (files.video.size > maxSize) {
          newErrors.video = 'El archivo de video es demasiado grande. Máximo 500MB';
        }

        // Validar duración (opcional: máximo 2 horas)
        if (videoPreviews.duration && videoPreviews.duration > 7200) {
          newErrors.video = 'El video es demasiado largo. Máximo 2 horas';
        }
      }

      if (files.thumbnail) {
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validImageTypes.includes(files.thumbnail.type)) {
          newErrors.thumbnail = 'Formato de imagen no válido. Use JPG, PNG o WebP';
        }

        const maxImageSize = 5 * 1024 * 1024;
        if (files.thumbnail.size > maxImageSize) {
          newErrors.thumbnail = 'La imagen es demasiado grande. Máximo 5MB';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!validateStep(3)) {
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

      // Agregar tags como JSON string
      if (formData.tags.length > 0) {
        uploadData.append('tags', JSON.stringify(formData.tags));
      }

      if (files.thumbnail) {
        uploadData.append('thumbnail', files.thumbnail);
      }

      const response = await uploadVideo(uploadData, (progress) => {
        setUploadProgress(progress);
      });

      // Redirigir al video subido
      navigate(`/videos/${response.id}`);
    } catch (error) {
      console.error('Error al subir video:', error);

      let mensajeError = 'Error al subir el video';

      if (error.response) {
        mensajeError = error.response.data?.error?.message || error.response.data?.message || 'Error del servidor al procesar el video';
      } else if (error.request) {
        mensajeError = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        mensajeError = error.message || 'Error al preparar la subida del video';
      }

      setErrorMessage(mensajeError);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTemas = temas.filter(tema => tema.materia_id == formData.materia_id);
  const selectedMateria = materias.find(m => m.id == formData.materia_id);
  const selectedGrado = grados.find(g => g.id == formData.grado_id);
  const selectedTema = temas.find(t => t.id == formData.tema_id);

  // Función helper para obtener primera palabra
  const getFirstWord = (str) => str?.split(' ')[0] || str;

  if (resourcesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Indicador de Progreso */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : currentStep === step.number
                      ? 'bg-primary-600 text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? '✓' : step.icon}
                </div>
                <span
                  className={`mt-2 text-sm font-medium transition-all duration-300 ${
                    currentStep === step.number ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 mb-8">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mensaje de Error General */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Contenido del Paso Actual */}
      <div className="bg-white rounded-lg shadow-md p-8 min-h-[500px] animate-slide-in">
        {/* PASO 1: Información Básica */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📝 Información del Video</h2>
              <p className="text-gray-600">Proporciona los detalles básicos de tu video educativo</p>
            </div>

            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
                Título del Video *
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className={`input-field text-lg ${errors.titulo ? 'border-red-500' : ''}`}
                placeholder="Ej: Introducción al Álgebra Lineal"
                maxLength={MAX_TITULO_LENGTH}
              />
              <div className="flex justify-between mt-1">
                <div>
                  {errors.titulo && <p className="text-sm text-red-600">{errors.titulo}</p>}
                </div>
                <p className={`text-sm ${formData.titulo.length > MAX_TITULO_LENGTH * 0.9 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                  {formData.titulo.length}/{MAX_TITULO_LENGTH}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={6}
                className="input-field"
                placeholder="Describe el contenido del video, los temas que se cubren y lo que los estudiantes aprenderán..."
                maxLength={MAX_DESCRIPCION_LENGTH}
              />
              <div className="flex justify-end mt-1">
                <p className={`text-sm ${formData.descripcion.length > MAX_DESCRIPCION_LENGTH * 0.9 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                  {formData.descripcion.length}/{MAX_DESCRIPCION_LENGTH}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas (Opcional) - Máximo {MAX_TAGS}
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                  className="input-field flex-1"
                  placeholder="Escribe una etiqueta y presiona Enter"
                  disabled={formData.tags.length >= MAX_TAGS}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={formData.tags.length >= MAX_TAGS}
                  className="btn-secondary"
                >
                  Agregar
                </button>
              </div>
              {errors.tags && <p className="text-sm text-red-600 mb-2">{errors.tags}</p>}
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium animate-scale-in"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-primary-900 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {formData.tags.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.tags.length}/{MAX_TAGS} etiquetas
                </p>
              )}
            </div>
          </div>
        )}

        {/* PASO 2: Clasificación */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📚 Clasificación del Video</h2>
              <p className="text-gray-600">Selecciona la materia, grado y tema correspondiente</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Materia * <span className="text-gray-500 font-normal">(Selecciona una)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {materias.map((materia) => (
                  <button
                    key={materia.id}
                    type="button"
                    onClick={() => handleMateriaSelect(materia.id)}
                    className={`p-4 rounded-lg border-2 font-medium transition-all duration-200 transform hover:scale-105 ${
                      formData.materia_id == materia.id
                        ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-lg'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    {materia.nombre}
                  </button>
                ))}
              </div>
              {errors.materia_id && <p className="mt-2 text-sm text-red-600">{errors.materia_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Grado * <span className="text-gray-500 font-normal">(Selecciona uno)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {grados.map((grado) => (
                  <button
                    key={grado.id}
                    type="button"
                    onClick={() => handleGradoSelect(grado.id)}
                    className={`p-4 rounded-lg border-2 font-medium transition-all duration-200 transform hover:scale-105 ${
                      formData.grado_id == grado.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    {getFirstWord(grado.nombre)}
                  </button>
                ))}
              </div>
              {errors.grado_id && <p className="mt-2 text-sm text-red-600">{errors.grado_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tema * <span className="text-gray-500 font-normal">(Selecciona uno)</span>
              </label>
              {!formData.materia_id ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500">Primero selecciona una materia para ver los temas disponibles</p>
                </div>
              ) : filteredTemas.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-yellow-700">No hay temas disponibles para esta materia</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredTemas.map((tema) => (
                    <button
                      key={tema.id}
                      type="button"
                      onClick={() => handleTemaSelect(tema.id)}
                      className={`p-4 rounded-lg border-2 font-medium transition-all duration-200 transform hover:scale-105 ${
                        formData.tema_id == tema.id
                          ? 'border-green-600 bg-green-50 text-green-700 shadow-lg'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      {tema.nombre}
                    </button>
                  ))}
                </div>
              )}
              {errors.tema_id && <p className="mt-2 text-sm text-red-600">{errors.tema_id}</p>}
            </div>
          </div>
        )}

        {/* PASO 3: Archivos */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📁 Archivos del Video</h2>
              <p className="text-gray-600">Sube tu video y opcionalmente una miniatura personalizada</p>
            </div>

            {/* Upload Video */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Archivo de Video * <span className="text-gray-500 font-normal">(MP4, WebM, OGG, AVI - Máx. 500MB)</span>
              </label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                className="hidden"
              />
              <div
                onDragEnter={(e) => handleDrag(e, 'video')}
                onDragLeave={(e) => handleDrag(e, 'video')}
                onDragOver={(e) => handleDrag(e, 'video')}
                onDrop={(e) => handleDrop(e, 'video')}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
                  dragActive.video
                    ? 'border-primary-500 bg-primary-50'
                    : files.video
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
                onClick={() => videoInputRef.current?.click()}
              >
                {files.video ? (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-center">
                      <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{files.video.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {(files.video.size / 1024 / 1024).toFixed(2)} MB
                        {videoPreviews.duration && ` • ${formatDuration(videoPreviews.duration)}`}
                        {videoPreviews.resolution && ` • ${videoPreviews.resolution}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles(prev => ({ ...prev, video: null }));
                        setVideoPreviews({ thumbnailUrl: null, duration: null, resolution: null });
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Cambiar video
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {dragActive.video ? '¡Suelta el archivo aquí!' : 'Arrastra tu video aquí'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">o haz clic para seleccionar</p>
                    </div>
                  </div>
                )}
              </div>
              {errors.video && <p className="mt-2 text-sm text-red-600">{errors.video}</p>}
            </div>

            {/* Upload Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Miniatura Personalizada <span className="text-gray-500 font-normal">(Opcional - JPG, PNG, WebP - Máx. 5MB)</span>
              </label>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                className="hidden"
              />
              <div
                onDragEnter={(e) => handleDrag(e, 'thumbnail')}
                onDragLeave={(e) => handleDrag(e, 'thumbnail')}
                onDragOver={(e) => handleDrag(e, 'thumbnail')}
                onDrop={(e) => handleDrop(e, 'thumbnail')}
                className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 cursor-pointer ${
                  dragActive.thumbnail
                    ? 'border-primary-500 bg-primary-50'
                    : files.thumbnail || videoPreviews.thumbnailUrl
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
                onClick={() => thumbnailInputRef.current?.click()}
              >
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {videoPreviews.thumbnailUrl ? (
                      <img
                        src={videoPreviews.thumbnailUrl}
                        alt="Preview"
                        className="w-40 h-24 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-40 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {files.thumbnail ? (
                      <div>
                        <p className="font-medium text-gray-900">✓ Miniatura personalizada</p>
                        <p className="text-sm text-gray-600 mt-1">{files.thumbnail.name}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles(prev => ({ ...prev, thumbnail: null }));
                            if (files.video) {
                              generateVideoThumbnail(files.video).then(preview => {
                                setVideoPreviews(prev => ({ ...prev, thumbnailUrl: preview.thumbnailUrl }));
                              });
                            }
                          }}
                          className="text-sm text-red-600 hover:text-red-700 font-medium mt-2"
                        >
                          Eliminar miniatura personalizada
                        </button>
                      </div>
                    ) : videoPreviews.thumbnailUrl ? (
                      <div>
                        <p className="font-medium text-gray-700">Miniatura generada automáticamente</p>
                        <p className="text-sm text-gray-500 mt-1">Haz clic para subir una miniatura personalizada</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-700">Sin miniatura</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {dragActive.thumbnail ? '¡Suelta la imagen aquí!' : 'Arrastra una imagen o haz clic para seleccionar'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {errors.thumbnail && <p className="mt-2 text-sm text-red-600">{errors.thumbnail}</p>}
              <p className="mt-2 text-xs text-gray-500">
                💡 Si no subes una miniatura personalizada, se generará automáticamente del video
              </p>
            </div>
          </div>
        )}

        {/* PASO 4: Confirmación */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">✓ Revisar y Confirmar</h2>
              <p className="text-gray-600">Verifica que toda la información sea correcta antes de subir</p>
            </div>

            {/* Preview del Card del Video */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👁️ Vista Previa del Video</h3>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto animate-scale-in">
                {/* Thumbnail */}
                <div className="relative bg-gray-900 aspect-video">
                  {videoPreviews.thumbnailUrl ? (
                    <img
                      src={videoPreviews.thumbnailUrl}
                      alt={formData.titulo}
                      className="w-full h-full object-cover"
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
                  {videoPreviews.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(videoPreviews.duration)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {formData.titulo || 'Título del video'}
                  </h3>

                  {formData.descripcion && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {formData.descripcion}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedMateria && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                        📚 {selectedMateria.nombre}
                      </span>
                    )}
                    {selectedGrado && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        🎓 {getFirstWord(selectedGrado.nombre)}
                      </span>
                    )}
                    {selectedTema && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        📖 {selectedTema.nombre}
                      </span>
                    )}
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="text-xs text-gray-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 border-t pt-2">
                    <p>👁️ 0 vistas • ⏱️ Hace un momento</p>
                    {videoPreviews.resolution && <p className="mt-1">📺 {videoPreviews.resolution}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles del Archivo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">📦 Detalles del Archivo</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Archivo:</strong> {files.video?.name}</p>
                <p><strong>Tamaño:</strong> {files.video && (files.video.size / 1024 / 1024).toFixed(2)} MB</p>
                {videoPreviews.duration && <p><strong>Duración:</strong> {formatDuration(videoPreviews.duration)}</p>}
                {videoPreviews.resolution && <p><strong>Resolución:</strong> {videoPreviews.resolution}</p>}
                <p><strong>Miniatura:</strong> {files.thumbnail ? 'Personalizada' : 'Automática'}</p>
              </div>
            </div>

            {/* Advertencia */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>El video será procesado y estará disponible en unos minutos</li>
                    <li>No cierres esta ventana hasta que la subida se complete</li>
                    <li>Asegúrate de que la información sea correcta antes de continuar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progreso de Subida */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {uploadProgress < 100 ? '📤 Subiendo video...' : '⚙️ Procesando video...'}
              </span>
              <span className="text-sm text-gray-700 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            {uploadProgress < 100 && (
              <p className="text-xs text-gray-500">Por favor, no cierres esta ventana...</p>
            )}
          </div>
        </div>
      )}

      {/* Botones de Navegación */}
      <div className="flex items-center justify-between pt-6 border-t">
        <button
          type="button"
          onClick={() => currentStep === 1 ? navigate(-1) : handlePrevStep()}
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="btn-primary flex items-center gap-2"
            disabled={loading}
          >
            Siguiente
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {loading ? 'Subiendo...' : '✓ Subir Video'}
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default VideoUploadForm;
