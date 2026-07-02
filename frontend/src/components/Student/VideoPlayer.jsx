import { useEffect, useRef } from "react";

const REPORT_INTERVAL_MS = 10000;

const YOUTUBE_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;

const toYouTubeEmbed = (url) => {
  const match = url?.match(YOUTUBE_RE);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

// Plays a signed video url, resumes at initialPosition, and reports
// watchTime/lastPosition periodically + on pause/unmount (throttled).
// Falls back to an iframe embed for YouTube links (no watch-time tracking —
// the caller should offer a manual "mark complete" for those instead).
const VideoPlayer = ({ url, initialPosition = 0, onProgress, onComplete }) => {
  const videoRef = useRef(null);
  const maxWatchedRef = useRef(0);
  const embedUrl = toYouTubeEmbed(url);

  const report = (isCompleted = false) => {
    const video = videoRef.current;
    if (!video) return;
    const lastPosition = Math.floor(video.currentTime);
    maxWatchedRef.current = Math.max(maxWatchedRef.current, lastPosition);
    onProgress?.({ watchTime: maxWatchedRef.current, lastPosition, isCompleted });
  };

  useEffect(() => {
    if (embedUrl) return; // YouTube embed reports no progress
    const video = videoRef.current;
    if (!video) return;

    const seekToResume = () => {
      if (initialPosition > 0 && initialPosition < video.duration - 5) {
        video.currentTime = initialPosition;
      }
    };
    video.addEventListener("loadedmetadata", seekToResume);

    const interval = setInterval(() => {
      if (!video.paused) report();
    }, REPORT_INTERVAL_MS);

    const onPause = () => report();
    const onEnded = () => {
      report(true);
      onComplete?.();
    };
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      clearInterval(interval);
      video.removeEventListener("loadedmetadata", seekToResume);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      report();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title="Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", aspectRatio: "16/9", border: 0, borderRadius: 8 }}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={url}
      controls
      controlsList="nodownload"
      style={{ width: "100%", maxHeight: "60vh", background: "#000", borderRadius: 8 }}
    />
  );
};

export default VideoPlayer;
