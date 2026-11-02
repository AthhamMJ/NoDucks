import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { CircleAlert, CircleCheck, LoaderCircle, Trash2 } from "lucide-react";
import {
  fetchFeatureUpdates,
  createFeatureUpdate,
  deleteFeatureUpdate,
} from "../../../../services/adminService";
import styles from "../../Admin.module.css";

export default function FeatureUpdates() {
  const [updates, setUpdates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchFeatureUpdates()
      .then((list) => {
        if (cancelled) return;
        setUpdates(list);
        setSelected(list[0] || null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load updates");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      const created = await createFeatureUpdate({ title, content });
      setUpdates((prev) => [created, ...prev]);
      setSelected(created);
      setTitle("");
      setContent("");
      setSuccess("Update published");
    } catch (err) {
      setError(err.message || "Failed to save update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;

    setBusyId(item._id);
    setError("");
    setSuccess("");
    try {
      await deleteFeatureUpdate(item._id);
      const next = updates.filter((u) => u._id !== item._id);
      setUpdates(next);
      if (selected?._id === item._id) setSelected(next[0] || null);
    } catch (err) {
      setError(err.message || "Failed to delete update");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className={styles.center}>
        <LoaderCircle size={22} strokeWidth={1.5} className={styles.spin} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.error}>
          <CircleAlert size={16} strokeWidth={1.5} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={styles.success}>
          <CircleCheck size={16} strokeWidth={1.5} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleCreate} className={styles.formCard}>
        <h2 className={styles.sectionTitle}>New update</h2>

        <label className={styles.field}>
          Title
          <input
            className={styles.input}
            value={title}
            maxLength={120}
            disabled={saving}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          Content (Markdown)
          <textarea
            className={styles.textarea}
            value={content}
            maxLength={10000}
            disabled={saving}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>

        <div className={styles.formFooter}>
          <button type="submit" className={styles.primaryBtn} disabled={saving}>
            {saving ? "Publishing..." : "Publish update"}
          </button>
        </div>
      </form>

      <div className={styles.previewLayout}>
        <div className={styles.list}>
          {updates.length === 0 && <p className={styles.muted}>No updates yet</p>}

          {updates.map((item) => (
            <button
              key={item._id}
              type="button"
              className={`${styles.listItem} ${
                selected?._id === item._id ? styles.listItemActive : ""
              }`}
              onClick={() => setSelected(item)}
            >
              <span>{item.title}</span>
              <small className={styles.muted}>
                {new Date(item.createdAt).toLocaleDateString()}
              </small>
            </button>
          ))}
        </div>

        <div className={styles.previewCard}>
          {selected ? (
            <>
              <div className={styles.previewHeader}>
                <strong>{selected.title}</strong>
                <button
                  className={styles.iconDangerBtn}
                  disabled={busyId === selected._id}
                  onClick={() => handleDelete(selected)}
                  aria-label="Delete update"
                  title="Delete update"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div className={styles.markdown}>
                <ReactMarkdown>{selected.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            <p className={styles.muted}>Select an update to preview it</p>
          )}
        </div>
      </div>
    </div>
  );
}