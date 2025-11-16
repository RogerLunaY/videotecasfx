/**
 * Página de Subida de Video
 */

import Layout from '../components/Layout/Layout';
import VideoUploadForm from '../components/Videos/VideoUploadForm';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const UploadVideoPage = () => {
  const { isAuthenticated, isAdmin, isDocente } = useAuth();

  // Solo admins y docentes pueden subir videos
  if (!isAuthenticated || (!isAdmin() && !isDocente())) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subir Nuevo Video</h1>
            <p className="text-gray-600">
              Comparte contenido educativo con la comunidad de la U.E. San Francisco Xavier
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <VideoUploadForm />
          </div>

          {/* Notas Importantes */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Notas Importantes:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>El tamaño máximo del video es 500MB</li>
              <li>Formatos aceptados: MP4, WebM, OGG, AVI</li>
              <li>Se generará automáticamente una miniatura si no subes una</li>
              <li>El video será procesado para optimizar la reproducción</li>
              <li>Asegúrate de clasificar correctamente el video por materia, grado y tema</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadVideoPage;
