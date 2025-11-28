/**
 * Componente temporal de diagnóstico para verificar datos de login
 * ELIMINAR DESPUÉS DE DIAGNOSTICAR
 */

import { useAuth } from '../../context/AuthContext';

const LoginDebug = () => {
  const { user, isAdmin, isDocente, isEstudiante } = useAuth();

  if (!user) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '400px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ color: 'yellow', marginBottom: '10px' }}>DEBUG - Datos de Usuario</h4>
      <div style={{ marginBottom: '5px' }}>
        <strong>Nombre:</strong> {user.nombre}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Email:</strong> {user.email}
      </div>
      <div style={{ marginBottom: '5px', color: 'lime' }}>
        <strong>ROL (valor):</strong> "{user.rol}"
      </div>
      <div style={{ marginBottom: '5px', color: 'lime' }}>
        <strong>ROL (tipo):</strong> {typeof user.rol}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>ROL_ID:</strong> {user.rol_id}
      </div>
      <hr style={{ margin: '10px 0', borderColor: '#444' }} />
      <div style={{ marginBottom: '5px', color: isAdmin() ? 'lime' : 'red' }}>
        <strong>isAdmin():</strong> {isAdmin().toString()}
      </div>
      <div style={{ marginBottom: '5px', color: isDocente() ? 'lime' : 'red' }}>
        <strong>isDocente():</strong> {isDocente().toString()}
      </div>
      <div style={{ marginBottom: '5px', color: isEstudiante() ? 'lime' : 'red' }}>
        <strong>isEstudiante():</strong> {isEstudiante().toString()}
      </div>
      <hr style={{ margin: '10px 0', borderColor: '#444' }} />
      <div style={{ fontSize: '10px', color: '#888' }}>
        <strong>localStorage user:</strong><br />
        <pre style={{ maxHeight: '100px', overflow: 'auto', fontSize: '9px' }}>
          {localStorage.getItem('user')}
        </pre>
      </div>
    </div>
  );
};

export default LoginDebug;
