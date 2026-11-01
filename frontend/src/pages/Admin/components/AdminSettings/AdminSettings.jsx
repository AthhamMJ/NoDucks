import { useEffect, useState } from "react";
import {
  Database,
  Clock,
  Cpu,
  Server,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
} from "lucide-react";
import {
  fetchAdminSettings,
  updateAdminQuotas,
} from "../../../../services/adminService";
import styles from "../../Admin.module.css";

const PLANS = [
  { key: "free", label: "Free" },
  { key: "student", label: "Student" },
];

const ACTIONS = [
  { key: "lesson", label: "Lessons" },
  { key: "chat", label: "Chats" },
  { key: "quiz", label: "Quizzes" },
];

function formatUptime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function AdminSettings() {
  const [quotas, setQuotas] = useState(null); // editable copy (values may be strings while typing)
  const [saved, setSaved] = useState(null); // last saved copy from the server
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchAdminSettings();
        if (cancelled) return;
        setQuotas(data.quotas);
        setSaved(data.quotas);
        setSystem(data.system);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = JSON.stringify(quotas) !== JSON.stringify(saved);

  function handleChange(plan, action, value) {
    setSuccess("");
    setQuotas((prev) => ({
      ...prev,
      [plan]: { ...prev[plan], [action]: value },
    }));
  }

  function handleDiscard() {
    setQuotas(saved);
    setError("");
    setSuccess("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Build a clean payload with whole numbers only
    const payload = {};
    for (const plan of PLANS) {
      payload[plan.key] = {};
      for (const action of ACTIONS) {
        const raw = String(quotas[plan.key][action.key]).trim();
        const n = Number(raw);

        if (raw === "" || !Number.isInteger(n) || n < 0) {
          setError(
            `${plan.label} ${action.label.toLowerCase()} must be a whole number, 0 or more`,
          );
          return;
        }
        payload[plan.key][action.key] = n;
      }
    }

    setSaving(true);
    try {
      const updated = await updateAdminQuotas(payload);
      setQuotas(updated);
      setSaved(updated);
      setSuccess("Quotas saved");
    } catch (err) {
      setError(err.message || "Failed to save quotas");
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

  const systemCards = system
    ? [
        {
          label: "Database",
          value: system.database,
          icon: Database,
        },
        {
          label: "Uptime",
          value: formatUptime(system.uptimeSeconds),
          icon: Clock,
        },
        {
          label: "Node version",
          value: system.nodeVersion,
          icon: Cpu,
        },
        {
          label: "Environment",
          value: system.environment,
          icon: Server,
        },
      ]
    : [];

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

      {quotas && (
        <form onSubmit={handleSave} className={styles.wrapper}>
          <div>
            <h2 className={styles.sectionTitle}>AI quota limits</h2>
            <p className={styles.sectionHint}>
              Monthly requests allowed per user, by plan
            </p>
          </div>

          <div className={styles.tableCard}>
            <div className={styles.scroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    {PLANS.map((plan) => (
                      <th key={plan.key}>{plan.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACTIONS.map((action) => (
                    <tr key={action.key}>
                      <td>{action.label}</td>
                      {PLANS.map((plan) => (
                        <td key={plan.key}>
                          <input
                            className={styles.input}
                            type="number"
                            min="0"
                            step="1"
                            value={quotas[plan.key][action.key]}
                            disabled={saving}
                            onChange={(e) =>
                              handleChange(plan.key, action.key, e.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.formFooter}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleDiscard}
              disabled={!dirty || saving}
            >
              Discard
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={!dirty || saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}

      {system && (
        <div>
          <h2 className={styles.sectionTitle}>System</h2>
          <div className={styles.grid} style={{ marginTop: 12 }}>
            {systemCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={styles.card}>
                  <div className={styles.cardIcon}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <span className={styles.cardLabel}>{card.label}</span>
                  <strong className={styles.cardValue}>{card.value}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}