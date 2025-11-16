/**
 * Componente de Tarjeta de Video
 * App Móvil - Videoteca SFX
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import videoService from '../services/videoService';

const VideoCard = ({ video, onPress, horizontal = false }) => {
  const thumbnailUrl = videoService.getThumbnailUrl(video.thumbnail);

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, horizontal && styles.horizontalContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: thumbnailUrl || 'https://via.placeholder.com/300x200' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {video.duracion && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(video.duracion)}</Text>
          </View>
        )}
        <View style={styles.playOverlay}>
          <Ionicons name="play-circle" size={48} color="rgba(255, 255, 255, 0.9)" />
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {video.titulo}
        </Text>

        {video.descripcion && (
          <Text style={styles.description} numberOfLines={2}>
            {video.descripcion}
          </Text>
        )}

        <View style={styles.metaContainer}>
          {video.materia_nombre && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{video.materia_nombre}</Text>
            </View>
          )}
          {video.grado_nombre && (
            <View style={[styles.badge, styles.badgeGray]}>
              <Text style={styles.badgeTextGray}>{video.grado_nombre}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.viewsContainer}>
            <Ionicons name="eye-outline" size={14} color="#64748b" />
            <Text style={styles.viewsText}>{video.visualizaciones || 0} vistas</Text>
          </View>
          {video.docente_nombre && (
            <Text style={styles.docenteText} numberOfLines={1}>
              {video.docente_nombre}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  horizontalContainer: {
    width: 280,
    marginHorizontal: 8,
    marginLeft: 20,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
  },
  badgeGray: {
    backgroundColor: '#f1f5f9',
  },
  badgeTextGray: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  docenteText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
    marginLeft: 8,
  },
});

export default VideoCard;
