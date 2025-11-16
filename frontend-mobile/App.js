/**
 * App Principal - Videoteca SFX Mobile
 * Sistema de Biblioteca Digital de Videos Educativos
 * U.E. San Francisco Xavier
 */

import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
