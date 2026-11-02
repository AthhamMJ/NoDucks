import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { Bell, X, CircleAlert, LoaderCircle } from "lucide-react";
import { fetchLatestUpdate } from "../../services/updateService";
import styles from "./FeatureUpdateBell.module.css";

export default function FeatureUpdateBell() {
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleOpen() {
    setOpen(true);
    setLoading(true);
    setError("");
    try {
      const data = await fetchLatestUpdate();
      setUpdate(data.update);
    } catch (err) {
      setError(err.message || "Failed to load the update");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
  }

  // Close with Escape, and stop the page behind from scrolling while open
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.bellBtn}
        onClick={handleOpen}
        aria-label="Latest feature update"
        title="Latest update"
      >
        <Bell size={18} strokeWidth={1.5} />
      </button>

      {open &&
        createPortal(
          <div className={styles.overlay} onClick={handleClose}>
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <strong>{update?.title || "Latest update"}</strong>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              <div className={styles.body}>
                {loading && (
                  <div className={styles.center}>
                    <LoaderCircle size={20} strokeWidth={1.5} className={styles.spin} />
                  </div>
                )}

                {error && (
                  <div className={styles.error}>
                    <CircleAlert size={16} strokeWidth={1.5} />
                    <span>{error}</span>
                  </div>
                )}

                {!loading && !error && !update && (
                  <p className={styles.empty}>No updates yet</p>
                )}

                {!loading && update && (
                  <ReactMarkdown>{update.content}</ReactMarkdown>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.skipBtn} onClick={handleClose}>
                  Skip
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}