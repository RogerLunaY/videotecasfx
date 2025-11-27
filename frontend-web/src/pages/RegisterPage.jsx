/**
 * Página de Registro (solo para admins)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';
import Layout from '../components/Layout/Layout';
import UserForm from '../components/Users/UserForm';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Solo admins pueden acceder
  if (!isAdmin()) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (formData) => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const dataToSend = { ...formData };

      // Remover campos vacíos opcionales
      if (!dataToSend.apellido_materno?.trim()) delete dataToSend.apellido_materno;
      if (!dataToSend.telefono?.trim()) delete dataToSend.telefono;
      delete dataToSend.password_confirmation;

      // Convertir arrays de IDs a formato esperado por el backend (si es necesario)
      // Por ahora mantenemos los arrays tal cual
      if (!dataToSend.materias_ids || dataToSend.materias_ids.length === 0) {
        delete dataToSend.materias_ids;
      }
      if (!dataToSend.grados_ids || dataToSend.grados_ids.length === 0) {
        delete dataToSend.grados_ids;
      }

      await registerUser(dataToSend);

      setSuccessMessage('Usuario registrado exitosamente');

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/usuarios');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Registrar Nuevo Usuario</h1>

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

          <div className="bg-white rounded-lg shadow-md p-6">
            <UserForm
              onSubmit={handleSubmit}
              loading={loading}
              isEdit={false}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
