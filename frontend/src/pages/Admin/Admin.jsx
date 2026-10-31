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

  // Cards with real data first, then placeholders until tracking is built
  const cards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users },
    { label: "New Users (7 days)", value: stats?.newUsers7d, icon: UserPlus },
    { label: "Tasks Created", value: stats?.totalTasks, icon: ListTodo },
    {
      label: "AI Users (this month)",
      value: stats?.aiUsersThisMonth,
      icon: Sparkles,
    },
    {
      label: "AI Requests (this month)",
      value: stats?.aiRequestsThisMonth,
      icon: Activity,
    },
    {
      label: "AI Errors (this month)",
      value: stats?.aiErrorsThisMonth,
      icon: TriangleAlert,
    },
    { label: "Sessions", icon: Users, pending: true },
    { label: "Storage", icon: HardDrive, pending: true },
  ];

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

      {activeTab === "Overview" && (
        <>
          {error && (
            <div className={styles.error}>
              <CircleAlert size={16} strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.grid}>
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={styles.card}>
                  <div className={styles.cardIcon}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <span className={styles.cardLabel}>{card.label}</span>
                  <strong className={styles.cardValue}>
                    {loading && !card.pending ? (
                      <LoaderCircle
                        size={20}
                        strokeWidth={1.5}
                        className={styles.spin}
                      />
                    ) : (
                      renderValue(card)
                    )}
                  </strong>
                  {card.pending && (
                    <small className={styles.hint}>
                      Tracking not set up yet
                    </small>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      {activeTab === "User Control" && <UserControl />}
      
      {activeTab !== "Overview" && activeTab !== "User Control" && (
        <div className={styles.placeholder}>
          <h2>{activeTab}</h2>
          <p>This section is coming soon.</p>
        </div>
      )}
    </div>
  );
}
