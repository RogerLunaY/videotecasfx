/**
 * Componente de Selección de Materias
 * Muestra materias organizadas por campos de saberes con iconos SVG de Lucide
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import * as LucideIcons from 'lucide-react';

const MateriaSelector = ({ campos, materias, value, onChange, error, required = false }) => {
  // Agrupar materias por campo
  const materiasPorCampo = useMemo(() => {
    const grupos = {};
    campos.forEach(campo => {
      grupos[campo.id] = {
        ...campo,
        materias: materias.filter(m => m.campo_id === campo.id && m.estado === 'activo')
      };
    });
    return grupos;
  }, [campos, materias]);

  /**
   * Obtiene el componente de icono de Lucide basado en el nombre del icono
   * @param {string} iconName - Nombre del icono de la BD
   * @returns {Component} - Componente de icono de Lucide
   */
  const getIconComponent = (iconName) => {
    // Mapeo de nombres de iconos de BD a componentes de Lucide
    const iconMap = {
      // Iconos de materias
      'leaf': LucideIcons.Leaf,
      'atom': LucideIcons.Atom,
      'flask': LucideIcons.Flask,
      'calculator': LucideIcons.Calculator,
      'laptop': LucideIcons.Laptop,
      'book': LucideIcons.Book,
      'book-open': LucideIcons.BookOpen,
      'language': LucideIcons.Languages,
      'globe': LucideIcons.Globe,
      'palette': LucideIcons.Palette,
      'music': LucideIcons.Music,
      'dumbbell': LucideIcons.Dumbbell,
      'brain': LucideIcons.Brain,
      'heart': LucideIcons.Heart,
      // Iconos de campos
      'tree': LucideIcons.TreePine,
      'cog': LucideIcons.Cog,
      'users': LucideIcons.Users,
      'star': LucideIcons.Star,
      // Fallback
      'default': LucideIcons.BookOpen,
    };

    return iconMap[iconName] || iconMap['default'];
  };

  /**
   * Obtiene el componente de icono del campo
   */
  const getCampoIcon = (campo) => {
    const IconComponent = getIconComponent(campo.icono);
    return <IconComponent className="w-5 h-5" style={{ color: campo.color }} />;
  };

  return (
    <div className="space-y-6">
      <label className="block text-sm font-medium text-gray-700">
        Materia {required && <span className="text-red-500">*</span>}
      </label>

      {Object.values(materiasPorCampo).map(campo => {
        if (campo.materias.length === 0) return null;

        return (
          <div key={campo.id} className="border rounded-lg p-4 bg-gray-50">
            {/* Nombre del campo */}
            <div className="flex items-center mb-3">
              <div
                className="w-1 h-6 rounded mr-2"
                style={{ backgroundColor: campo.color || '#6B7280' }}
              />
              {getCampoIcon(campo)}
              <h4 className="font-semibold text-gray-900 ml-2">{campo.nombre}</h4>
              {campo.descripcion && (
                <div className="group relative ml-2">
                  <LucideIcons.Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                    {campo.descripcion}
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Grid de materias */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {campo.materias.map(materia => {
                const IconComponent = getIconComponent(materia.icono);

                return (
                  <button
                    key={materia.id}
                    type="button"
                    onClick={() => onChange(materia.id)}
                    className={`
                      group relative flex flex-col items-center p-3 rounded-lg border-2 transition-all
                      ${value == materia.id
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {/* Icono SVG */}
                    <div className={`
                      mb-2
                      ${value == materia.id ? 'scale-110' : 'group-hover:scale-105'}
                      transition-transform
                    `}>
                      <IconComponent
                        className="w-8 h-8"
                        style={{ color: materia.color || campo.color }}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Nombre y sigla */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900 leading-tight">
                        {materia.nombre}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {materia.sigla}
                      </p>
                    </div>

                    {/* Tooltip con descripción */}
                    {materia.descripcion && (
                      <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-20">
                        {materia.descripcion}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}

                    {/* Indicador de selección */}
                    {value == materia.id && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <LucideIcons.Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

MateriaSelector.propTypes = {
  campos: PropTypes.array.isRequired,
  materias: PropTypes.array.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
};

export default MateriaSelector;
