/**
 * Pantalla de Perfil de Usuario
 * App Móvil - Videoteca SFX
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getInitials = (nombre) => {
    if (!nombre) return '?';
    const parts = nombre.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  const MenuItem = ({ icon, title, value, onPress, danger = false }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
          <Ionicons
            name={icon}
            size={20}
            color={danger ? '#ef4444' : '#2563eb'}
          />
        </View>
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, danger && styles.menuItemTitleDanger]}>
            {title}
          </Text>
          {value && <Text style={styles.menuItemValue}>{value}</Text>}
        </View>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.nombre)}</Text>
          </View>
          <Text style={styles.userName}>
            {user?.nombre} {user?.apellido_paterno}
          </Text>
          <Text style={styles.userRole}>{user?.rol}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="mail-outline"
              title="Email"
              value={user?.email}
            />
            <MenuItem
              icon="card-outline"
              title="CI"
              value={user?.ci}
            />
            {user?.telefono && (
              <MenuItem
                icon="call-outline"
                title="Teléfono"
                value={user?.telefono}
              />
            )}
          </View>
        </View>

        {user?.materia_nombre && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Académica</Text>
            <View style={styles.menuContainer}>
              <MenuItem
                icon="book-outline"
                title="Materia"
                value={user.materia_nombre}
              />
              {user?.grado_nombre && (
                <MenuItem
                  icon="school-outline"
                  title="Grado"
                  value={user.grado_nombre}
                />
              )}
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="shield-checkmark-outline"
              title="Cambiar Contraseña"
              onPress={() => Alert.alert('Cambiar Contraseña', 'Funcionalidad en desarrollo')}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <MenuItem
              icon="log-out-outline"
              title="Cerrar Sesión"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Videoteca SFX v1.0.0</Text>
          <Text style={styles.appInfoText}>U.E. San Francisco Xavier</Text>
          <Text style={styles.appInfoTextSmall}>
            Desarrollado por Roger Omar Luna Yujra
          </Text>
          <Text style={styles.appInfoTextSmall}>
            Instituto Técnico ATSI Bolivia
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  userCard: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 16,
    borderRadius: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerDanger: {
    backgroundColor: '#fee2e2',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  menuItemTitleDanger: {
    color: '#ef4444',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appInfoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  appInfoTextSmall: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
});

export default ProfileScreen;
