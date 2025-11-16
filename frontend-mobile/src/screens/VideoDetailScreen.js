/**
 * Pantalla de Detalle y Reproducción de Video
 * App Móvil - Videoteca SFX
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import videoService from '../services/videoService';

const { width } = Dimensions.get('window');

const VideoDetailScreen = () => {
  const route = useRoute();
  const { videoId } = route.params;
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({});

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const videoData = await videoService.getById(videoId);
      setVideo(videoData);
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = (bytes / 1024 / 1024).toFixed(2);
    return `${mb} MB`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Video no encontrado</Text>
      </View>
    );
  }

  const streamUrl = videoService.getStreamUrl(video.id);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView style={styles.scrollView}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: streamUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          />
        </View>

        {/* Video Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{video.titulo}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="eye-outline" size={16} color="#64748b" />
              <Text style={styles.statText}>{video.visualizaciones || 0} vistas</Text>
            </View>
            {video.duracion && (
              <View style={styles.stat}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text style={styles.statText}>{formatDuration(video.duracion)}</Text>
              </View>
            )}
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {video.materia_nombre && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{video.materia_nombre}</Text>
              </View>
            )}
            {video.grado_nombre && (
              <View style={[styles.tag, styles.tagGray]}>
                <Text style={styles.tagTextGray}>{video.grado_nombre}</Text>
              </View>
            )}
            {video.tema_nombre && (
              <View style={[styles.tag, styles.tagGreen]}>
                <Text style={styles.tagTextGreen}>{video.tema_nombre}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {video.descripcion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{video.descripcion}</Text>
            </View>
          )}

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Docente:</Text>
              <Text style={styles.infoValue}>{video.docente_nombre || 'No especificado'}</Text>
            </View>
            {video.fecha_subida && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Subido:</Text>
                <Text style={styles.infoValue}>
                  {new Date(video.fecha_subida).toLocaleDateString('es-ES')}
                </Text>
              </View>
            )}
            {video.tamano_archivo && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tamaño:</Text>
                <Text style={styles.infoValue}>{formatFileSize(video.tamano_archivo)}</Text>
              </View>
            )}
            {video.resolucion && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Resolución:</Text>
                <Text style={styles.infoValue}>{video.resolucion}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  videoContainer: {
    width,
    height: width * (9 / 16),
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
  tagGray: {
    backgroundColor: '#f1f5f9',
  },
  tagTextGray: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  tagGreen: {
    backgroundColor: '#d1fae5',
  },
  tagTextGreen: {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
});

export default VideoDetailScreen;
