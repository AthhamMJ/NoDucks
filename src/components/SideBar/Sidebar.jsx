import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

import {
  LayoutDashboard,
  Sparkles,
  ListTodo,
  NotebookPen,
  FlaskConical,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ai-coaching', label: 'AI Coaching', icon: Sparkles },
  { to: '/tasks', label: 'Task Lists', icon: ListTodo },
  { to: '/notes', label: 'Notes', icon: NotebookPen },
];

export default function Sidebar({ collapsed, onToggle }) {
  const linkClass = ({ isActive }) =>
    `${styles.link} ${isActive ? styles.active : ''}`;

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.top}>
        <div className={styles.logo}>NoDucks</div>

        <button
          className={styles.toggle}
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand (Ctrl+B)' : 'Collapse (Ctrl+B)'}
        >
          {collapsed ? (
            <PanelLeftOpen size={17} strokeWidth={1.5} />
          ) : (
            <PanelLeftClose size={17} strokeWidth={1.5} />
          )}
        </button>
      </div>

      <nav className={styles.nav}>
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              title={collapsed ? item.label : undefined}
            >
              <span className={styles.icon}>
                <Icon size={17} strokeWidth={1.5} />
              </span>

              <span className={styles.label}>{item.label}</span>
            </NavLink>
          );
        })}

        <span
          className={`${styles.link} ${styles.disabled}`}
          aria-disabled="true"
          title={collapsed ? 'Experiment lab (Soon)' : undefined}
        >
          <span className={styles.icon}>
            <FlaskConical size={17} strokeWidth={1.5} />
          </span>

          <span className={styles.label}>Experiment lab (Soon)</span>
        </span>
      </nav>

      <div className={styles.bottom}>
        <NavLink
          to="/settings"
          className={linkClass}
          title={collapsed ? 'Settings' : undefined}
        >
          <span className={styles.icon}>
            <Settings size={17} strokeWidth={1.5} />
          </span>

          <span className={styles.label}>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}