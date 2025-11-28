/**
 * Componente de Selección de Grados
 * Muestra grados con iconos SVG y números
 */

import PropTypes from 'prop-types';
import { GraduationCap, Check } from 'lucide-react';

const GradoSelector = ({ grados, value, onChange, error, required = false }) => {
  // Colores por nivel de grado (gradiente de azul a púrpura)
  const getGradoColor = (nivel) => {
    const colors = {
      1: '#3B82F6', // Azul
      2: '#6366F1', // Azul índigo
      3: '#8B5CF6', // Púrpura
      4: '#A855F7', // Púrpura claro
      5: '#D946EF', // Fucsia
      6: '#EC4899', // Rosa
    };
    return colors[nivel] || '#6B7280';
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
        {gradosOrdenados.map(grado => {
          const color = getGradoColor(grado.nivel);
          const isSelected = String(value) === String(grado.id);

          return (
            <button
              key={grado.id}
              type="button"
              onClick={() => onChange(grado.id)}
              className={`
                group relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                }
              `}
            >
              {/* Badge con número y icono */}
              <div className={`
                relative flex items-center justify-center mb-2
                ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                transition-transform
              `}>
                {/* Círculo de fondo */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isSelected ? color : `${color}15`,
                    border: `2px solid ${color}`,
                  }}
                >
                  {/* Icono de graduación */}
                  <GraduationCap
                    className="w-6 h-6"
                    style={{ color: isSelected ? 'white' : color }}
                    strokeWidth={2}
                  />
                </div>

                {/* Número del grado */}
                <div
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  {grado.nivel}
                </div>
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
              {isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
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
