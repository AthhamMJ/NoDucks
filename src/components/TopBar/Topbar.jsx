import styles from './Topbar.module.css';
import { Search, Sun, Moon, ChevronDown } from 'lucide-react';

export default function TopBar({ theme, onToggleTheme }) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>
        <strong>NoDucks</strong>
        <span className={styles.badge}>upgrade</span>
      </div>

      <div className={styles.search}>
        <span><Search size={18} strokeWidth={1.5}/></span>
        <input type="text" placeholder="Search tasks..." />
      </div>

      <div className={styles.right}>
        <button className={styles.theme} onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? (
              <Moon size={18} strokeWidth={1.5} />
            ) : (
              <Sun size={18} strokeWidth={1.5} />
            )}
        </button>

        <div className={styles.user}>
          <div className={styles.avatar}>A</div>

          <div className={styles.userText}>
            <strong>Athham M.J</strong>
            <small>Scholar Plan</small>
          </div>

          <span><ChevronDown /></span>
        </div>
      </div>
    </header>
  );
}