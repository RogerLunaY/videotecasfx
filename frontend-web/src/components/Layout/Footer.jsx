/**
 * Componente de Footer - Diseño Minimalista
 */

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-salesiano-azul-700 via-salesiano-azul-600 to-salesiano-azul-700 text-white mt-auto">
      <div className="container mx-auto px-6 py-6">
        {/* Grid: Institución | Desarrollador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-center md:text-left">
          {/* Institución */}
          <div className="flex items-center justify-center md:justify-start">
            <p className="text-sm">
              <span className="font-bold text-salesiano-amarillo-300">UESFX</span>
              <span className="mx-2 text-salesiano-amarillo-400">•</span>
              <span className="text-blue-100">Okinawa Uno, Bolivia</span>
            </p>
          </div>

          {/* Desarrollador */}
          <div className="flex items-center justify-center md:justify-end">
            <p className="text-sm text-blue-100">
              Roger Omar Luna Yujra
              <span className="mx-2 text-salesiano-amarillo-400">•</span>
              <span className="text-blue-200">ATSI Bolivia</span>
            </p>
          </div>
        </div>

        {/* Copyright centrado */}
        <div className="text-center border-t border-salesiano-azul-500 pt-4">
          <p className="text-sm text-blue-100">
            &copy; {currentYear} San Francisco Xavier
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
