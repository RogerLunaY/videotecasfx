/**
 * Componente de Selección de Grados
 * Muestra grados con iconos y números
 */

import PropTypes from 'prop-types';

const GradoSelector = ({ grados, value, onChange, error, required = false }) => {
  // Iconos por nivel de grado
  const getGradoIcon = (nivel) => {
    const icons = {
      1: '1️⃣',
      2: '2️⃣',
      3: '3️⃣',
      4: '4️⃣',
      5: '5️⃣',
      6: '6️⃣',
    };
    return icons[nivel] || '📚';
  };

  // Ordenar grados por nivel
  const gradosOrdenados = [...grados]
    .filter(g => g.estado === 'activo')
    .sort((a, b) => a.nivel - b.nivel);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Grado {required && <span className="text-red-500">*</span>}
      </label>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {gradosOrdenados.map(grado => (
          <button
            key={grado.id}
            type="button"
            onClick={() => onChange(grado.id)}
            className={`
              group relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
              ${value == grado.id
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
              }
            `}
          >
            {/* Icono con número */}
            <div className={`
              text-4xl mb-1
              ${value == grado.id ? 'scale-110' : 'group-hover:scale-105'}
              transition-transform
            `}>
              {getGradoIcon(grado.nivel)}
            </div>

            {/* Nombre */}
            <div className="text-center">
              <p className="text-xs font-medium text-gray-900 leading-tight">
                {grado.nivel}° Sec.
              </p>
              {grado.sigla && (
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {grado.sigla}
                </p>
              )}
            </div>

            {/* Tooltip con descripción */}
            {grado.descripcion && (
              <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-20">
                <strong>{grado.nombre}</strong>
                <br />
                {grado.descripcion}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}

            {/* Indicador de selección */}
            {value == grado.id && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

GradoSelector.propTypes = {
  grados: PropTypes.array.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
};

export default GradoSelector;
