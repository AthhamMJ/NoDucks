import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Sparkles, LoaderCircle, Info } from "lucide-react";
import { tutorService } from "../../../../services/tutorService";
import styles from "./VisualExplanation.module.css";

export const VisualExplanation = ({ lessonId, initialVisuals = [] }) => {
  const [visuals, setVisuals] = useState(initialVisuals);
  const isMountedRef = useRef(true);

  // Synchronize when initialVisuals prop changes
  useEffect(() => {
    setVisuals(initialVisuals);
  }, [initialVisuals]);

  // Polling for pending visuals
  useEffect(() => {
    isMountedRef.current = true;
    const hasPending = visuals.some((v) => v.status === "pending");

    if (!lessonId || !hasPending) return;

    let timer = null;
    let pollCount = 0;
    const maxPolls = 30; // Max 75 seconds polling

    const poll = async () => {
      try {
        const latest = await tutorService.getLessonVisuals(lessonId);
        if (!isMountedRef.current) return;

        if (Array.isArray(latest) && latest.length > 0) {
          setVisuals(latest);
          const stillPending = latest.some((v) => v.status === "pending");
          if (stillPending && pollCount < maxPolls) {
            pollCount++;
            timer = setTimeout(poll, 2500);
          }
        }
      } catch (err) {
        console.warn("Polling visual explanation failed:", err.message);
      }
    };

    timer = setTimeout(poll, 2500);

    return () => {
      isMountedRef.current = false;
      if (timer) clearTimeout(timer);
    };
  }, [lessonId, visuals]);

  if (!visuals || visuals.length === 0) {
    return null;
  }

  return (
    <section className={styles.container} aria-label="Visual Explanation">
      <div className={styles.header}>
        <span className={styles.badge}>
          <Sparkles size={14} aria-hidden="true" />
          Visual Explanation
        </span>

        {visuals.some((v) => v.status === "pending") && (
          <span className={styles.statusIndicator}>
            <LoaderCircle size={14} className={styles.spinner} aria-hidden="true" />
            Illustrating concept...
          </span>
        )}
      </div>

      {visuals.map((visual, idx) => {
        const isReady = visual.status === "ready" && visual.url;
        const isPending = visual.status === "pending";
        const isFailed = visual.status === "failed" || (!isReady && !isPending);

        return (
          <div key={visual.assetId || idx} className={styles.panelBlock}>
            {/* 1. Ready State */}
            {isReady && (
              <div className={styles.imageWrapper}>
                <img
                  src={visual.url}
                  alt={visual.altText || visual.caption || "Concept illustration"}
                  className={styles.image}
                  loading="lazy"
                />
              </div>
            )}

            {/* 2. Pending State: Skeleton with caption visible */}
            {isPending && (
              <div className={styles.skeleton} aria-busy="true">
                <ImageIcon size={32} strokeWidth={1.5} aria-hidden="true" />
                <span className={styles.skeletonText}>
                  Generating comic illustration...
                </span>
              </div>
            )}

            {/* 3. Failed State: No broken image graphic, caption fallback */}
            {isFailed && (
              <div className={styles.failedBox} role="note">
                <Info size={18} className={styles.failedIcon} aria-hidden="true" />
                <div className={styles.captionBox}>
                  <p className={styles.captionText}>{visual.caption}</p>
                  <span className={styles.subText}>
                    Illustration unavailable — showing conceptual notes instead.
                  </span>
                </div>
              </div>
            )}

            {/* Captions for Ready & Pending states */}
            {!isFailed && visual.caption && (
              <div className={styles.captionBox}>
                <p className={styles.captionText}>{visual.caption}</p>
                {visual.altText && visual.altText !== visual.caption && (
                  <span className={styles.subText}>{visual.altText}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

