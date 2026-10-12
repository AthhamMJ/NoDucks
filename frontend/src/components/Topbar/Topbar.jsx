import { useNavigate } from "react-router-dom";
import { Search, Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./Topbar.module.css";

export default function TopBar({ theme, onToggleTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const name =
    user?.user_metadata?.full_name?.trim() ||
    user?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Student";

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S";

  async function handleSignOut() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Sign-out failed:", error.message);
    }
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <strong>NoDucks</strong>
        <span className={styles.badge}>upgrade</span>
      </div>

      <div className={styles.search}>
        <span>
          <Search size={18} strokeWidth={1.5} />
        </span>
        <input type="text" placeholder="Search tasks..." />
      </div>

      <div className={styles.right}>
        <button
          className={styles.theme}
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon size={18} strokeWidth={1.5} />
          ) : (
            <Sun size={18} strokeWidth={1.5} />
          )}
        </button>

        <div className={styles.user}>
          <div className={styles.avatar}>{initials}</div>

          <div className={styles.userText}>
            <strong>{name}</strong>
            <small>{user?.email ?? ""}</small>
          </div>

          <button
            type="button"
            className={styles.theme}
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
