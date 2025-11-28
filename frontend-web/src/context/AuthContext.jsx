/**
 * Auth Context
 * Maneja el estado de autenticación global de la aplicación
 */

import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar usuario al montar el componente
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();

          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);

            // Verificar con el servidor
            try {
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
            } catch (error) {
              console.error('Error al verificar usuario:', error);
              // Si falla, mantener el usuario guardado localmente
            }
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        // Limpiar si hay error
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login de usuario
   */
  const login = async (email, password) => {
    try {
      const { user: loggedUser } = await authService.login(email, password);
      setUser(loggedUser);
      setIsAuthenticated(true);
      return { success: true, user: loggedUser };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Error en el login',
      };
    }
  };

  /**
   * Logout de usuario
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Actualiza los datos del usuario
   */
  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role) => {
    return user?.rol === role;
  };

  /**
   * Verifica si el usuario es administrador
   */
  const isAdmin = () => {
    return hasRole('Administrador');
  };

  /**
   * Verifica si el usuario es docente
   */
  const isDocente = () => {
    return hasRole('Docente');
  };

  /**
   * Verifica si el usuario es estudiante
   */
  const isEstudiante = () => {
    return hasRole('Estudiante');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    isDocente,
    isEstudiante,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
