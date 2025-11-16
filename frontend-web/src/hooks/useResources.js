/**
 * Hook personalizado para cargar recursos auxiliares
 * (materias, grados, temas, roles)
 */

import { useState, useEffect } from 'react';
import resourceService from '../services/resourceService';

export const useResources = () => {
  const [materias, setMaterias] = useState([]);
  const [grados, setGrados] = useState([]);
  const [temas, setTemas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const [materiasData, gradosData, temasData, rolesData] = await Promise.all([
        resourceService.getMaterias(),
        resourceService.getGrados(),
        resourceService.getTemas(),
        resourceService.getRoles().catch(() => []), // Los roles requieren auth
      ]);

      setMaterias(materiasData);
      setGrados(gradosData);
      setTemas(temasData);
      setRoles(rolesData);
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
    roles,
    loading,
    error,
    loadTemasPorMateria,
    reload: loadResources,
  };
};
