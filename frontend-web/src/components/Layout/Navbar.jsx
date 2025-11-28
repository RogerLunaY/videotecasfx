/**
 * Componente de Barra de Navegación
 * Versión pública y autenticada con colores salesianos
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Video, Upload, Users, LogOut,
  ChevronDown, Search, Menu, X, Library
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isDocente, isEstudiante } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/videos?busqueda=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
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

          {/* Barra de Búsqueda */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar videos..."
                className="w-full px-4 py-2 pl-10 rounded-lg bg-white/90 backdrop-blur-sm border-2 border-transparent focus:border-salesiano-amarillo-400 focus:bg-white focus:outline-none transition text-gray-800"
              />
              <svg
                className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Usuario / Login */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Menú de Dashboard para usuarios autenticados */}
                <div className="hidden lg:flex items-center space-x-1 mr-2">
                  <Link
                    to="/dashboard"
                    className="px-3 py-2 bg-salesiano-amarillo-500 text-salesiano-azul-900 hover:bg-salesiano-amarillo-400 rounded-lg transition font-semibold text-sm"
                  >
                    Dashboard
                  </Link>

                  {isAdmin() && (
                    <>
                      <Link
                        to="/usuarios"
                        className="px-3 py-2 text-white hover:bg-white/10 rounded-lg transition text-sm"
                      >
                        Usuarios
                      </Link>
                      <Link
                        to="/upload"
                        className="px-3 py-2 text-white hover:bg-white/10 rounded-lg transition text-sm"
                      >
                        Subir Video
                      </Link>
                    </>
                  )}

                  {isDocente() && !isAdmin() && (
                    <>
                      <Link
                        to="/mis-videos"
                        className="px-3 py-2 text-white hover:bg-white/10 rounded-lg transition text-sm"
                      >
                        Mis Videos
                      </Link>
                      <Link
                        to="/upload"
                        className="px-3 py-2 text-white hover:bg-white/10 rounded-lg transition text-sm"
                      >
                        Subir Video
                      </Link>
                    </>
                  )}
                </div>

                {/* Avatar y Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 hover:bg-white/10 rounded-lg px-3 py-2 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-salesiano-amarillo-400 to-salesiano-amarillo-500 text-salesiano-azul-900 flex items-center justify-center text-sm font-bold shadow-lg group-hover:shadow-xl transition-shadow ring-2 ring-white/30">
                      {getInitials(user?.nombre || '')}
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-semibold text-white">{user?.nombre}</p>
                      <p className="text-xs text-salesiano-amarillo-300">{user?.rol}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu - Cardbox Style */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Header Card */}
                      <div className="bg-gradient-to-br from-salesiano-azul-500 to-salesiano-azul-600 p-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-14 h-14 rounded-full bg-white text-salesiano-azul-600 flex items-center justify-center text-lg font-bold shadow-md">
                            {getInitials(user?.nombre || '')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-white truncate">{user?.nombre}</p>
                            <p className="text-sm text-salesiano-amarillo-300 truncate">{user?.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20 text-white">
                              {user?.rol}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items - Card Style */}
                      <div className="p-2">
                        {/* Dashboard Card */}
                        <Link
                          to="/dashboard"
                          className="flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all group mb-1"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center mr-3 group-hover:bg-blue-200 group-hover:scale-110 transition-all">
                            <LayoutDashboard className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Dashboard</p>
                            <p className="text-xs text-gray-500">Ver panel principal</p>
                          </div>
                        </Link>

                        {/* Videos Card - Para todos los usuarios */}
                        <Link
                          to="/videos"
                          className="flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all group mb-1"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-11 h-11 rounded-lg bg-purple-100 flex items-center justify-center mr-3 group-hover:bg-purple-200 group-hover:scale-110 transition-all">
                            <Video className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Videos</p>
                            <p className="text-xs text-gray-500">Catálogo de videos</p>
                          </div>
                        </Link>

                        {/* Perfil Card */}
                        <Link
                          to="/perfil"
                          className="flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all group mb-1"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-11 h-11 rounded-lg bg-green-100 flex items-center justify-center mr-3 group-hover:bg-green-200 group-hover:scale-110 transition-all">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Mi Perfil</p>
                            <p className="text-xs text-gray-500">Datos personales</p>
                          </div>
                        </Link>

                        {/* Sección Docente/Admin */}
                        {(isAdmin() || isDocente()) && (
                          <>
                            <div className="my-3 px-3">
                              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-2">Gestión</p>
                            </div>

                            {/* Upload Card */}
                            <Link
                              to="/upload"
                              className="flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all group mb-1"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <div className="w-11 h-11 rounded-lg bg-indigo-100 flex items-center justify-center mr-3 group-hover:bg-indigo-200 group-hover:scale-110 transition-all">
                                <Upload className="w-5 h-5 text-indigo-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">Subir Video</p>
                                <p className="text-xs text-gray-500">Nuevo contenido</p>
                              </div>
                            </Link>

                            {/* Usuarios Card - Solo Admin */}
                            {isAdmin() && (
                              <Link
                                to="/usuarios"
                                className="flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100 transition-all group mb-1"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <div className="w-11 h-11 rounded-lg bg-teal-100 flex items-center justify-center mr-3 group-hover:bg-teal-200 group-hover:scale-110 transition-all">
                                  <Users className="w-5 h-5 text-teal-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">Usuarios</p>
                                  <p className="text-xs text-gray-500">Gestionar usuarios</p>
                                </div>
                              </Link>
                            )}
                          </>
                        )}

                        {/* Separator */}
                        <div className="my-2 px-3">
                          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        </div>

                        {/* Logout Card */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all group"
                        >
                          <div className="w-11 h-11 rounded-lg bg-red-100 flex items-center justify-center mr-3 group-hover:bg-red-200 group-hover:scale-110 transition-all">
                            <LogOut className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-red-600">Cerrar Sesión</p>
                            <p className="text-xs text-red-400">Salir de tu cuenta</p>
                          </div>
                        </button>
                      </div>
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
            {/* Búsqueda Móvil */}
            <form onSubmit={handleSearch} className="mb-3 px-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar videos..."
                  className="w-full px-4 py-2 pl-10 rounded-lg bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-salesiano-amarillo-400 text-gray-800"
                />
                <svg
                  className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

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
