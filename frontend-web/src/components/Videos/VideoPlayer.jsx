/**
 * Componente de Reproductor de Video
 */

import { useRef, useEffect } from 'react';

const VideoPlayer = ({ videoId, onTimeUpdate, onEnded }) => {
  const videoRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/backend';
  const streamUrl = `${API_URL}/api/videos/${videoId}/stream`;

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      const handleTimeUpdate = () => {
        if (onTimeUpdate) {
          onTimeUpdate({
            currentTime: video.currentTime,
            duration: video.duration,
            percentage: (video.currentTime / video.duration) * 100
          });
        }
      };

      const handleEnded = () => {
        if (onEnded) {
          onEnded();
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [onTimeUpdate, onEnded]);

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
