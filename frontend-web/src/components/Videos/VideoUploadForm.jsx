/**
 * Componente de Formulario de Subida de Video
 * Wizard multi-paso con drag & drop y preview
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileVideo, Check, ChevronRight, ChevronLeft,
  Play, Pause, Image as ImageIcon, Info, AlertCircle, X
} from 'lucide-react';
import { useResources } from '../../hooks/useResources';
import { uploadVideo } from '../../services/videoService';
import LoadingSpinner from '../Common/LoadingSpinner';
import MateriaSelector from '../Common/MateriaSelector';
import GradoSelector from '../Common/GradoSelector';

const STEPS = [
  { id: 1, title: 'Seleccionar Video', icon: FileVideo },
  { id: 2, title: 'Información', icon: Info },
  { id: 3, title: 'Clasificación', icon: Check },
  { id: 4, title: 'Thumbnail', icon: ImageIcon },
];

const VideoUploadForm = () => {
  const navigate = useNavigate();
  const { campos, materias, grados, temas, loading: resourcesLoading } = useResources();
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateVideoFile = (file) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'];
    if (!validTypes.includes(file.type)) {
      return 'Formato de video no válido. Use MP4, WebM, OGG o AVI';
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return 'El archivo de video es demasiado grande. Máximo 500MB';
    }

    return null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validateVideoFile(file);

      if (error) {
        setErrors({ video: error });
        return;
      }

      handleVideoSelect(file);
    }
  };

  const handleVideoSelect = (file) => {
    setFiles(prev => ({ ...prev, video: file }));
    setErrors(prev => ({ ...prev, video: '' }));

    // Create preview URL
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateVideoFile(file);

      if (error) {
        setErrors({ video: error });
        return;
      }

      handleVideoSelect(file);
    }
  };

  const handleThumbnailSelect = (file) => {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, thumbnail: 'Formato no válido. Use JPG, PNG o WebP' }));
      return;
    }

    const maxImageSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxImageSize) {
      setErrors(prev => ({ ...prev, thumbnail: 'La imagen es demasiado grande. Máximo 5MB' }));
      return;
    }

    setFiles(prev => ({ ...prev, thumbnail: file }));
    setErrors(prev => ({ ...prev, thumbnail: '' }));

    // Create preview URL
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    const url = URL.createObjectURL(file);
    setThumbnailPreviewUrl(url);
  };

  const handleThumbnailInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleThumbnailSelect(e.target.files[0]);
    }
  };

  const captureThumbnail = () => {
    if (!videoPreviewRef.current) return;

    const video = videoPreviewRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
      handleThumbnailSelect(file);
    }, 'image/jpeg', 0.9);
  };

  const togglePlayPause = () => {
    if (!videoPreviewRef.current) return;

    if (isPlaying) {
      videoPreviewRef.current.pause();
    } else {
      videoPreviewRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!files.video) {
          newErrors.video = 'Selecciona un archivo de video';
        }
        break;
      case 2:
        if (!formData.titulo.trim()) {
          newErrors.titulo = 'El título es requerido';
        }
        break;
      case 3:
        if (!formData.materia_id) {
          newErrors.materia_id = 'Selecciona una materia';
        }
        if (!formData.grado_id) {
          newErrors.grado_id = 'Selecciona un grado';
        }
        if (!formData.tema_id) {
          newErrors.tema_id = 'Selecciona un tema';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setUploadProgress(0);
    setErrorMessage('');

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

      navigate(`/videos/${response.id}`);
    } catch (error) {
      console.error('Error al subir video:', error);

      let mensajeError = 'Error al subir el video';
      if (error.response) {
        mensajeError = error.response.data?.error?.message || error.response.data?.message || 'Error del servidor';
      } else if (error.request) {
        mensajeError = 'No se pudo conectar con el servidor';
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
    <div className="space-y-6">
      {/* Progress Stepper */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : isCurrent
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          isCurrent ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium mt-2 ${
                      isCurrent ? 'text-primary-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[400px]">
        {/* STEP 1: Seleccionar Video */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Selecciona tu video</h2>

            {!files.video ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? 'border-primary-500 bg-primary-50'
                    : errors.video
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Arrastra tu video aquí
                </h3>
                <p className="text-gray-600 mb-4">
                  o haz clic en el botón para seleccionar
                </p>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="btn-primary"
                >
                  Seleccionar Video
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  Formatos: MP4, WebM, OGG, AVI • Tamaño máximo: 500MB
                </p>
                {errors.video && (
                  <p className="text-sm text-red-600 mt-2">{errors.video}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-xl overflow-hidden relative">
                  <video
                    ref={videoPreviewRef}
                    src={videoPreviewUrl}
                    className="w-full max-h-96"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                  >
                    {isPlaying ? (
                      <Pause className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <Play className="w-16 h-16 text-white" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileVideo className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{files.video.name}</p>
                      <p className="text-sm text-gray-600">
                        {(files.video.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFiles(prev => ({ ...prev, video: null }));
                      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
                      setVideoPreviewUrl(null);
                    }}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Información */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Información del video</h2>

            <div>
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-2">
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
                placeholder="Describe el contenido del video, temas que cubre, objetivos de aprendizaje..."
              />
            </div>
          </div>
        )}

        {/* STEP 3: Clasificación */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Clasificación académica</h2>

            <MateriaSelector
              campos={campos}
              materias={materias}
              value={formData.materia_id}
              onChange={(value) => setFormData(prev => ({ ...prev, materia_id: value, tema_id: '' }))}
              error={errors.materia_id}
              required
            />

            <GradoSelector
              grados={grados}
              value={formData.grado_id}
              onChange={(value) => setFormData(prev => ({ ...prev, grado_id: value }))}
              error={errors.grado_id}
              required
            />

            <div>
              <label htmlFor="tema_id" className="block text-sm font-medium text-gray-700 mb-2">
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
        )}

        {/* STEP 4: Thumbnail */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Miniatura del video</h2>
            <p className="text-gray-600">
              Selecciona una imagen o captura un fotograma del video
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Preview para captura */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Capturar del video</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoPreviewRef}
                    src={videoPreviewUrl}
                    className="w-full"
                    controls
                  />
                </div>
                <button
                  type="button"
                  onClick={captureThumbnail}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Capturar fotograma actual
                </button>
              </div>

              {/* Thumbnail Preview */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Vista previa</h3>
                {thumbnailPreviewUrl ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Thumbnail preview"
                      className="w-full rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(prev => ({ ...prev, thumbnail: null }));
                        if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
                        setThumbnailPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Sin miniatura seleccionada</p>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailInputChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-full btn-secondary"
                >
                  Subir imagen
                </button>
                <p className="text-xs text-gray-500">
                  Si no seleccionas una miniatura, se generará automáticamente
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {loading && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-primary-900">Subiendo video...</span>
                  <span className="text-primary-700 font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-primary-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-600 to-primary-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-primary-700 mt-2">
                  No cierres esta ventana mientras se sube el video
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && !loading && (
            <button
              type="button"
              onClick={prevStep}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? 'Subiendo...' : 'Subir Video'}
              <Upload className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploadForm;
