/**
 * Componente de Reproductor de Video
 */

import { useRef, useEffect } from 'react';
import { getStreamUrl } from '../../services/videoService';

const VideoPlayer = ({ videoId, onTimeUpdate, onEnded }) => {
  const videoRef = useRef(null);
  const streamUrl = getStreamUrl(videoId);
  // Usar refs para almacenar las últimas callbacks y evitar re-renders
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onEndedRef = useRef(onEnded);

  // Mantener las refs actualizadas
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
    onEndedRef.current = onEnded;
  }, [onTimeUpdate, onEnded]);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      const handleTimeUpdate = () => {
        if (onTimeUpdateRef.current) {
          onTimeUpdateRef.current({
            currentTime: video.currentTime,
            duration: video.duration,
            percentage: (video.currentTime / video.duration) * 100
          });
        }
      };

      const handleEnded = () => {
        if (onEndedRef.current) {
          onEndedRef.current();
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, []); // Sin dependencias - los listeners se configuran una vez

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-xl">
      <video
        ref={videoRef}
        className="w-full aspect-video"
        controls
        controlsList="nodownload"
        preload="metadata"
      >
        <source src={streamUrl} type="video/mp4" />
        Tu navegador no soporta el elemento de video.
      </video>
    </div>
  );
};

export default VideoPlayer;
