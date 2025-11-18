/**
 * Hook personalizado para obtener materias y grados asignados al docente actual
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDocenteAsignaciones } from '../services/docenteAsignacionService';
import resourceService from '../services/resourceService';

export const useDocenteAsignaciones = () => {
  const { user, isDocente } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [grados, setGrados] = useState([]);
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResources();
  }, [user, isDocente]);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si es docente, obtener solo sus materias y grados asignados
      if (isDocente() && user?.id) {
        const { materias: materiasAsignadas, grados: gradosAsignados } = await getDocenteAsignaciones(user.id);

        // Cargar todos los temas (se filtrarán por materia en el componente)
        const temasData = await resourceService.getTemas();

        setMaterias(materiasAsignadas || []);
        setGrados(gradosAsignados || []);
        setTemas(temasData || []);
      } else {
        // Si no es docente, cargar todos los recursos
        const [materiasData, gradosData, temasData] = await Promise.all([
          resourceService.getMaterias(),
          resourceService.getGrados(),
          resourceService.getTemas(),
        ]);

        setMaterias(materiasData);
        setGrados(gradosData);
        setTemas(temasData);
      }
    } catch (err) {
      console.error('Error al cargar recursos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga temas de una materia específica
   */
  const loadTemasPorMateria = async (materiaId) => {
    try {
      const temasData = await resourceService.getTemas(materiaId);
      setTemas(temasData);
    } catch (err) {
      console.error('Error al cargar temas:', err);
    }
  };

  return {
    materias,
    grados,
    temas,
    loading,
    error,
    loadTemasPorMateria,
    reload: loadResources,
  };
};
