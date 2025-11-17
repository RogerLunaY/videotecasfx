/**
 * Componente de Barra de Navegación
 * Versión pública y autenticada con colores salesianos
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isDocente } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-salesiano-azul-500 to-salesiano-azul-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Título */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg className="w-8 h-8 text-salesiano-azul-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-white">Videoteca SFX</h1>
              <p className="text-xs text-salesiano-amarillo-300">U.E. San Francisco Xavier</p>
            </div>
          </Link>

          {/* Navegación Desktop - Solo para usuarios NO autenticados */}
          {!isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/materias"
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition font-medium"
              >
                Materias
              </Link>
              <Link
                to="/cursos"
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition font-medium"
              >
                Cursos
              </Link>
              <Link
                to="/acerca-de"
                className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition font-medium"
              >
                Acerca de
              </Link>
            </div>
          )}

          {/* Spacer para centrar navegación */}
          <div className="flex-1"></div>

          {/* Usuario / Login */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Menú de navegación principal */}
                <div className="hidden lg:flex items-center space-x-2 mr-2">
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 bg-salesiano-amarillo-500 text-salesiano-azul-900 hover:bg-salesiano-amarillo-400 rounded-lg transition font-semibold text-sm"
                  >
                    Dashboard
                  </Link>

                  {isAdmin() && (
                    <Link
                      to="/usuarios"
                      className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Usuarios</span>
                    </Link>
                  )}

                  {isDocente() && !isAdmin() && (
                    <Link
                      to="/perfil"
                      className="flex items-center space-x-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Mi Perfil</span>
                    </Link>
                  )}
                </div>

                {/* Avatar y Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 hover:bg-white/10 rounded-lg px-3 py-2 transition"
                  >
                    <div className="w-9 h-9 rounded-full bg-salesiano-amarillo-400 text-salesiano-azul-900 flex items-center justify-center text-sm font-bold shadow-md">
                      {getInitials(user?.nombre || '')}
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-semibold text-white">{user?.nombre}</p>
                      <p className="text-xs text-salesiano-amarillo-300">{user?.rol}</p>
                    </div>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user?.nombre}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>

                      <Link
                        to="/perfil"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mi Perfil
                      </Link>

                      {(isAdmin() || isDocente()) && (
                        <>
                          <Link
                            to="/mis-videos"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Mis Videos
                          </Link>

                          <Link
                            to="/upload"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Subir Video
                          </Link>
                        </>
                      )}

                      {isAdmin() && (
                        <Link
                          to="/usuarios"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Gestionar Usuarios
                        </Link>
                      )}

                      <hr className="my-2" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden py-4 border-t border-white/20">
            {/* Menú Público - Solo si NO está autenticado */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/materias"
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Materias
                </Link>
                <Link
                  to="/cursos"
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Cursos
                </Link>
                <Link
                  to="/acerca-de"
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg font-medium"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Acerca de
                </Link>
              </>
            )}

            {/* Menú de Dashboard (solo autenticados) */}
            {isAuthenticated && (
              <>
                <hr className="my-2 border-white/20" />
                <div className="px-2 py-1 text-xs font-semibold text-salesiano-amarillo-300 uppercase tracking-wide">
                  Dashboard
                </div>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Mi Dashboard
                </Link>
                {isAdmin() && (
                  <Link
                    to="/usuarios"
                    className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Gestionar Usuarios
                  </Link>
                )}
                {(isAdmin() || isDocente()) && (
                  <>
                    <Link
                      to="/mis-videos"
                      className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Mis Videos
                    </Link>
                    <Link
                      to="/upload"
                      className="block px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Subir Video
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
