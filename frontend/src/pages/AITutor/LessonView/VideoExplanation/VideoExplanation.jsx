import React from "react";
import { Film, Clock } from "lucide-react";
import styles from "./VideoExplanation.module.css";

/**
 * Renders published Manim video explanation for the lesson's topic.
 * If no matching video exists, hides the section entirely (no empty placeholder).
 */
export const VideoExplanation = ({ videos = [] }) => {
  if (!videos || !videos.length) {
    return null;
  }

  return (
    <section className={styles.container} aria-label="Video Lesson">
      <div className={styles.header}>
        <span className={styles.badge}>
          <Film size={14} aria-hidden="true" />
          Video Explanation
        </span>
      </div>

      {videos.map((video, idx) => {
        const videoSrc = video.cloudinary?.url || video.url;
        if (!videoSrc) return null;

        return (
          <div key={video.id || idx} className={styles.videoCard}>
            {video.title && (
              <div className={styles.header}>
                <h3 className={styles.videoTitle}>{video.title}</h3>
                {video.durationSeconds > 0 && (
                  <span className={styles.durationBadge}>
                    <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                    {video.durationSeconds}s
                  </span>
                )}
              </div>
            )}

            <div className={styles.videoWrapper}>
              <video
                className={styles.videoElement}
                src={videoSrc}
                controls
                playsInline
                preload="metadata"
                poster={video.posterUrl}
                aria-label={video.altText || video.title || "Video Lesson"}
              >
                <source src={videoSrc} type="video/mp4" />
                {video.captionsUrl && video.captionsUrl.startsWith("http") && (
                  <track
                    kind="captions"
                    src={video.captionsUrl}
                    srcLang="en"
                    label="English"
                    default
                  />
                )}
                Your browser does not support HTML5 video playback.
              </video>
            </div>

            {video.caption && (
              <div className={styles.captionBox}>
                <p className={styles.captionText}>{video.caption}</p>
                {video.altText && video.altText !== video.caption && (
                  <p className={styles.altText}>{video.altText}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};
