/**
 * Contexto de Autenticación
 * App Móvil - Videoteca SFX
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await authService.getStoredUser();
      const authenticated = await authService.isAuthenticated();

      if (storedUser && authenticated) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { user: loggedUser } = await authService.login(email, password);
    setUser(loggedUser);
    setIsAuthenticated(true);
    return loggedUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const hasRole = (roleName) => {
    return user?.rol === roleName;
  };

  const isAdmin = () => {
    return hasRole('Administrador');
  };

  const isDocente = () => {
    return hasRole('Docente');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
        hasRole,
        isAdmin,
        isDocente,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
