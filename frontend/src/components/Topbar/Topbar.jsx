import { useNavigate } from "react-router-dom";
import { Search, Sun, Moon, LogOut,  } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import FeatureUpdateBell from "../FeatureUpdateBell/FeatureUpdateBell";
import ProfileMenu from "../ProfileMenu/ProfileMenu";
import styles from "./Topbar.module.css";

export default function TopBar({ theme, onToggleTheme }) {
  const { user} = useAuth();

  const name =
    user?.user_metadata?.full_name?.trim() ||
    user?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Student";

  const initials =
    name
      .split(/\s+/) // "Create arrays from spaces of a sentence"
      .filter(Boolean) // drop any empty strings from extra spaces
      .slice(0, 2) // keep at most two words
      .map((part) => part[0]) // take the first letter of each array elements(words)
      .join("") //Join those selected letters
      .toUpperCase() || "S"; // Uppercase those letters

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
          <FeatureUpdateBell />

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

        <ProfileMenu name={name} email={user?.email ?? ""} initials={initials} />
      </div>
    </header>
  );
}