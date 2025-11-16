/**
 * Pantalla de Catálogo de Videos
 * App Móvil - Videoteca SFX
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import videoService from '../services/videoService';
import VideoCard from '../components/VideoCard';

const VideosScreen = () => {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setPage(1);
        setHasMore(true);
      }

      setLoading(true);
      const response = await videoService.getAll({
        page: isRefresh ? 1 : page,
        per_page: 10,
      });

      const newVideos = response.videos || [];

      if (isRefresh) {
        setVideos(newVideos);
      } else {
        setVideos((prev) => [...prev, ...newVideos]);
      }

      setHasMore(newVideos.length === 10);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadVideos(true);
      return;
    }

    try {
      setLoading(true);
      const response = await videoService.search(searchQuery);
      setVideos(response.videos || []);
      setHasMore(false);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    loadVideos(true);
  };

  const handleVideoPress = (video) => {
    navigation.navigate('VideoDetail', { videoId: video.id });
  };

  const loadMore = () => {
    if (!loading && hasMore && !searchQuery) {
      setPage((prev) => prev + 1);
      loadVideos();
    }
  };

  const renderItem = ({ item }) => (
    <VideoCard video={item} onPress={() => handleVideoPress(item)} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="videocam-off-outline" size={64} color="#cbd5e1" />
      <Text style={styles.emptyText}>No se encontraron videos</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || videos.length === 0) return null;

    return (
      <View style={styles.footerLoader}>
        <Text style={styles.loadingText}>Cargando más videos...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Videos</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar videos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              loadVideos(true);
            }}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Videos List */}
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={!loading && renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
      />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#1e293b',
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default VideosScreen;
