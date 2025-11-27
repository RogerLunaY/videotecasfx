/**
 * Página de Edición de Usuario (Solo Admin)
 * Reutiliza el componente UserForm en modo edición
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import UserForm from '../components/Users/UserForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getUserById, updateUser } from '../services/userService';

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Solo admins pueden acceder
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const user = await getUserById(id);

      // Preparar datos para el formulario
      const formData = {
        nombre: user.nombre || '',
        apellido_paterno: user.apellido_paterno || '',
        apellido_materno: user.apellido_materno || '',
        ci: user.ci || '',
        email: user.email || '',
        telefono: user.telefono || '',
        rol_id: user.rol_id?.toString() || '',
        materias_ids: user.materias?.map(m => m.id) || [],
        grados_ids: user.grados?.map(g => g.id) || [],
      };

      setUserData(formData);
    } catch (error) {
      console.error('Error loading user:', error);
      setErrorMessage('Error al cargar el usuario');
      setTimeout(() => navigate('/usuarios'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitLoading(true);

    try {
      const dataToSend = { ...formData };

      // Remover campos vacíos opcionales
      if (!dataToSend.apellido_materno?.trim()) delete dataToSend.apellido_materno;
      if (!dataToSend.telefono?.trim()) delete dataToSend.telefono;

      // En edición, la contraseña es opcional
      if (!dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.password_confirmation;
      }

      // Manejar asignaciones vacías
      if (!dataToSend.materias_ids || dataToSend.materias_ids.length === 0) {
        delete dataToSend.materias_ids;
      }
      if (!dataToSend.grados_ids || dataToSend.grados_ids.length === 0) {
        delete dataToSend.grados_ids;
      }

      await updateUser(id, dataToSend);

      setSuccessMessage('Usuario actualizado exitosamente');

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/usuarios');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'Error al actualizar usuario');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }

  if (!userData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Usuario no encontrado</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header con botón de regreso */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/usuarios')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Volver a usuarios"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
              <p className="text-sm text-gray-600 mt-1">
                Modificar información de {userData.nombre} {userData.apellido_paterno}
              </p>
            </div>
          </div>

          {/* Mensajes de éxito/error */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          {/* Formulario de edición */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <UserForm
              initialData={userData}
              onSubmit={handleSubmit}
              loading={submitLoading}
              isEdit={true}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditUserPage;
