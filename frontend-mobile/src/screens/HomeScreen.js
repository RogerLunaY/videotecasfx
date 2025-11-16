/**
 * Pantalla de Inicio
 * App Móvil - Videoteca SFX
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import videoService from '../services/videoService';
import VideoCard from '../components/VideoCard';

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [popularVideos, setPopularVideos] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const [popular, recent] = await Promise.all([
        videoService.getPopular(6),
        videoService.getRecent(6),
      ]);
      setPopularVideos(popular || []);
      setRecentVideos(recent || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  const handleVideoPress = (video) => {
    navigation.navigate('VideoDetail', { videoId: video.id });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.nombre}</Text>
          <Text style={styles.subtitle}>Bienvenido a Videoteca SFX</Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="play-circle" size={40} color="#2563eb" />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="videocam" size={24} color="#2563eb" />
            <Text style={styles.statNumber}>20</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="school" size={24} color="#10b981" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Materias</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>Estudiantes</Text>
          </View>
        </View>

        {/* Videos Populares */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Videos Populares</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Videos')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Cargando...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {popularVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPress={() => handleVideoPress(video)}
                  horizontal
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Videos Recientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Videos Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Videos')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Cargando...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPress={() => handleVideoPress(video)}
                  horizontal
                />
              ))}
            </ScrollView>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  seeAll: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    color: '#64748b',
    padding: 20,
  },
});

export default HomeScreen;
