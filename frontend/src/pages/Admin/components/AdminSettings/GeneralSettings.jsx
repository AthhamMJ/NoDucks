import { useEffect, useState } from "react";
import { CircleAlert, LoaderCircle, ShieldCheck, Wrench } from "lucide-react";
import {
  fetchAdminSettings,
  fetchAdminList,
  updateGeneralSettings,
} from "../../../../services/adminService";
import styles from "../../Admin.module.css";

export default function GeneralSettings() {
  const [general, setGeneral] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [settings, adminList] = await Promise.all([
          fetchAdminSettings(),
          fetchAdminList(),
        ]);
        if (cancelled) return;
        setGeneral(settings.general);
        setAdmins(adminList);
      } catch (error) {
        if (!cancelled)
          setError(error.message || "Failed to load general Settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(changes) {
    setSaving(true);
    setError("");
    try {
      const updated = await updateGeneralSettings(changes);
      setGeneral(updated);
    } catch (error) {
      setError(error.message || "Failed to Save");
    } finally {
      setSaving(false);
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
      <div>
        <h2 className={styles.sectionTitle}>General</h2>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Wrench size={18} strokeWidth={1.5} />
          </div>
          <span className={styles.cardLabel}>Maintenance Mode</span>
          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={general?.maintenanceMode ?? false}
              className={styles.check}
              disabled={saving}
              onChange={(e) => save({ maintenanceMode: e.target.checked })}
            />
            <span>{general?.maintenanceMode ? "On" : "Off"}</span>
          </label>
          <small>
            Students will see a maintenance message. Admin can still use the app.
          </small>
        </div>

        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <ShieldCheck size={18} strokeWidth={1.5} />
          </div>
          <span className={styles.cardLabel}>Default plan for new users</span>
          <select
            className={styles.select}
            value={general?.defaultPlan ?? "free"}
            disabled={saving}
            onChange={(e) => save({ defaultPlan: e.target.value })}
          >
            <option value="free">Free</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>Admins</h2>
        <p className={styles.sectionHint}>Account with admin access</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.scroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Since</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a._id}>
                  <td>{a.name}</td>
                  <td className={styles.muted}>{a.email}</td>
                  <td className={styles.muted}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
