import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar/Topbar';
import Sidebar from '../components/SideBar/Sidebar';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className={styles.app}>
      <TopBar
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.page}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}