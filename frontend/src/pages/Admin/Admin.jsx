import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  ListTodo,
  Activity,
  Sparkles,
  TriangleAlert,
  HardDrive,
  LoaderCircle,
  CircleAlert,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminOverview } from "../../services/adminService";
import styles from "./Admin.module.css";
import UserControl from "./components/UserControl/UserControl";
import AdminSettings from "./components/AdminSettings/AdminSettings";
import Overview from "./components/Overview/Overview";

const TABS = ["Overview", "User Control", "Feature Updates", "Admin Settings"];

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAdminOverview();
        if (!cancelled) setStats(data.stats);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load overview");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  function renderValue(card) {
    if (card.pending) return "—";
    if (loading) return "…";
    return card.value ?? "—";
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>NoDucks overview and management</p>
        </div>
      </div>

      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && <Overview />}
      {error && (
            <div className={styles.error}>
              <CircleAlert size={16} strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

      {activeTab === "User Control" && <UserControl />}

      {activeTab === "Admin Settings" && <AdminSettings />}

      {activeTab !== "Overview" &&
        activeTab !== "User Control" &&
        activeTab !== "Admin Settings" && (
          <div className={styles.placeholder}>
            <h2>{activeTab}</h2>
            <p>This section is coming soon.</p>
          </div>
        )}
    </div>
  );
}
