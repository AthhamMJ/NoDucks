import React, { useState, useEffect } from "react";
import { Film, CheckCircle, Clock, LoaderCircle, AlertCircle } from "lucide-react";
import { fetchAdminVideos, publishAdminVideo } from "../../../../services/adminService";
import styles from "./Videos.module.css";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState(null);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await fetchAdminVideos();
      setVideos(list);
    } catch (err) {
      setError(err.message || "Failed to load videos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handlePublish = async (id) => {
    try {
      setPublishingId(id);
      await publishAdminVideo(id);
      await loadVideos();
    } catch (err) {
      alert(err.message || "Failed to publish video.");
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Film size={20} aria-hidden="true" />
            Video Lessons Management
          </h2>
        </div>

        {error && (
          <div style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <LoaderCircle size={24} className="spin" />
          </div>
        ) : videos.length === 0 ? (
          <div className={styles.emptyState}>
            No video lessons found. Run the seed script or add videos to the database.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Subject</th>
                  <th>Duration</th>
                  <th>Aliases</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => {
                  const isDraft = v.status === "draft";
                  return (
                    <tr key={v._id}>
                      <td>
                        <div className={styles.videoCell}>
                          {v.posterUrl && (
                            <img
                              src={v.posterUrl}
                              alt={v.title}
                              className={styles.thumbnail}
                            />
                          )}
                          <div className={styles.videoMeta}>
                            <span className={styles.videoTitle}>{v.title}</span>
                            <span className={styles.conceptId}>{v.conceptId}</span>
                          </div>
                        </div>
                      </td>
                      <td>{v.subject}</td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Clock size={14} />
                          {v.durationSeconds}s
                        </span>
                      </td>
                      <td style={{ maxWidth: 200, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {v.aliases?.join(", ") || "—"}
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            isDraft ? styles.badgeDraft : styles.badgeReady
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td>
                        {isDraft ? (
                          <button
                            type="button"
                            className={styles.publishButton}
                            disabled={publishingId === v._id}
                            onClick={() => handlePublish(v._id)}
                          >
                            {publishingId === v._id ? (
                              <LoaderCircle size={14} className="spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            Publish
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 600 }}>
                            Published
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
