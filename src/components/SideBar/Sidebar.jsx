import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

import {
  LayoutDashboard,
  Sparkles,
  ListTodo,
  NotebookPen,
  FlaskConical,
  Settings,
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ai-coaching', label: 'AI Coaching', icon: Sparkles },
  { to: '/tasks', label: 'Task Lists', icon: ListTodo },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
];

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `${styles.link} ${isActive ? styles.active : ''}`;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>NoDucks</div>

      <nav className={styles.nav}>
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
            >
              <span className={styles.icon}>
                <Icon size={17} strokeWidth={1.5} />
              </span>

              {item.label}
            </NavLink>
          );
        })}

        <span
          className={`${styles.link} ${styles.disabled}`}
          aria-disabled="true"
        >
          <span className={styles.icon}>
            <FlaskConical size={17} strokeWidth={1.5} />
          </span>

          Experiment lab (Soon)
        </span>
      </nav>

      <div className={styles.bottom}>
        <NavLink to="/settings" className={linkClass}>
          <span className={styles.icon}>
            <Settings size={17} strokeWidth={1.5} />
          </span>

          Settings
        </NavLink>
      </div>
    </aside>
  );
}