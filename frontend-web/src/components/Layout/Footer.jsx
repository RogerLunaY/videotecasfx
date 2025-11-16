/**
 * Componente de Footer
 */

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la Institución */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Videoteca Digital SFX</h3>
            <p className="text-sm text-gray-400 mb-2">
              Unidad Educativa San Francisco Xavier
            </p>
            <p className="text-sm text-gray-400">
              Okinawa Uno, Bolivia
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm hover:text-white transition">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/videos" className="text-sm hover:text-white transition">
                  Videos
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-sm hover:text-white transition">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Información del Proyecto */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Proyecto</h3>
            <p className="text-sm text-gray-400 mb-2">
              Desarrollado por: Roger Omar Luna Yujra
            </p>
            <p className="text-sm text-gray-400 mb-2">
              CI: 6734278 LP
            </p>
            <p className="text-sm text-gray-400 mb-2">
              Tutor: Lic. Vladimir Mamani
            </p>
            <p className="text-sm text-gray-400">
              Instituto Técnico ATSI Bolivia
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} U.E. San Francisco Xavier. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Sistema de Biblioteca Digital de Videos Educativos v1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
