import React, { useState, useEffect } from "react";
import { Search, Film, Sparkles, ArrowRight } from "lucide-react";
import { tutorService } from "../../../../services/tutorService";
import styles from "./VideoSearch.module.css";

export const VideoSearch = ({ onSelectTopic }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const videos = await tutorService.searchVideos(trimmed);
        setResults(videos);
      } catch (err) {
        console.warn("Video search failed:", err.message);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <section className={styles.searchSection} aria-label="Topic Video Search">
      <div className={styles.searchHeader}>
        <h2 className={styles.searchTitle}>
          <Film size={18} aria-hidden="true" />
          Search Video Lessons
        </h2>
        <p className={styles.searchSubtitle}>
          Look up animated Manim explanations for academic concepts.
        </p>
      </div>

      <div className={styles.inputWrapper}>
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search topics (e.g. Newton's second law, gravity)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <div className={styles.grid}>
          {results.map((video) => {
            const videoSrc = video.cloudinary?.url || video.url;
            return (
              <div key={video.id} className={styles.card}>
                <div className={styles.videoWrapper}>
                  <video
                    className={styles.videoElement}
                    src={videoSrc}
                    controls
                    playsInline
                    preload="metadata"
                    poster={video.posterUrl}
                    aria-label={video.altText || video.title}
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

                <div className={styles.cardBody}>
                  {video.subject && (
                    <span className={styles.subjectBadge}>{video.subject}</span>
                  )}
                  <h3 className={styles.cardTitle}>{video.title}</h3>
                  {video.caption && (
                    <p className={styles.captionFallback}>{video.caption}</p>
                  )}

                  {onSelectTopic && (
                    <button
                      type="button"
                      className={styles.learnButton}
                      onClick={() => onSelectTopic(video.title)}
                    >
                      <Sparkles size={14} aria-hidden="true" />
                      Learn This Topic
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
