/**
 * Componente de Layout Principal
 * Solo contenedor - Navbar y Footer están en App.jsx
 */

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
