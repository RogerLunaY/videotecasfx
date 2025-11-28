/**
 * Componente principal de la aplicación
 * Maneja el routing y la estructura general
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EditUserPage from './pages/EditUserPage';
import HomePage from './pages/HomePage';
import MateriasPage from './pages/MateriasPage';
import CursosPage from './pages/CursosPage';
import AcercaDePage from './pages/AcercaDePage';
import FAQPage from './pages/FAQPage';
import DashboardPage from './pages/DashboardPage';
import VideosPage from './pages/VideosPage';
import VideosEstudiantesPage from './pages/VideosEstudiantesPage';
import VideoDetailPage from './pages/VideoDetailPage';
import UploadVideoPage from './pages/UploadVideoPage';
import UsuariosPage from './pages/UsuariosPage';
import PerfilPage from './pages/PerfilPage';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/Common/LoadingSpinner';

/**
 * Componente para rutas protegidas
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Componente principal App
 */
function App() {
  const { loading } = useAuth();
  const location = useLocation();

  // Rutas que no deben mostrar el Navbar
  const hideNavbarRoutes = ['/login'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/materias" element={<MateriasPage />} />
        <Route path="/cursos" element={<CursosPage />} />
        <Route path="/acerca-de" element={<AcercaDePage />} />
        <Route path="/faq" element={<FAQPage />} />

      {/* Rutas protegidas - Solo autenticados */}
      <Route
        path="/videos/:id"
        element={
          <ProtectedRoute>
            <VideoDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/biblioteca"
        element={
          <ProtectedRoute>
            <VideosEstudiantesPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Solo autenticados (continuación) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadVideoPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Solo admin */}
      <Route
        path="/videos"
        element={
          <ProtectedRoute requireAdmin>
            <VideosPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas - Solo admin (continuación) */}
      <Route
        path="/register"
        element={
          <ProtectedRoute requireAdmin>
            <RegisterPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <ProtectedRoute requireAdmin>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios/:id/editar"
        element={
          <ProtectedRoute requireAdmin>
            <EditUserPage />
          </ProtectedRoute>
        }
      />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
