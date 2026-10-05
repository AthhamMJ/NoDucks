import styles from './Sidebar.module.css';

function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.upperLayout}>
                <div className={styles.sidebarTop}>
                    <h3>NoDucks</h3>
                    <div className={styles.sidebarToggle}>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 64 64"
                            fill="none"
                        >
                            <path
                                d="M50.008 56H14.019c-3.309 0-5.995-2.686-5.995-5.995V13.994c0-3.308 2.686-5.995 5.995-5.995h35.989c3.309 0 5.995 2.687 5.995 5.995v36.011c0 3.309-2.686 5.995-5.995 5.995ZM24.024 51.999V12h-9.012c-1.65 0-2.989 1.339-2.989 2.989V49.01c0 1.65 1.339 2.989 2.989 2.989h9.012Zm24.991-39.999H28.024v39.999h20.991c1.65 0 2.989-1.339 2.989-2.989V14.989c0-1.65-1.339-2.989-2.989-2.989Z"
                                fill="#000"
                            />
                            <path
                                d="m16.024 38.774 6.828-6.828-6.828-6.829-2.829 2.829 4 4-4 4 2.829 2.828Z"
                                fill="#000"
                            />
                        </svg>
                    </div>
                </div>

                <nav className={styles.navigation}>
                    <a href="#" className={styles.active}>Dashboard</a>
                    <a href="#">AI Coaching</a>
                    <a href="#">Tasks</a>
                    <a href="#">Notes</a>

                    <a href="#" className={styles.experimentLab}>
                        Experiment Lab
                    </a>
                </nav>
            </div>

            <div className={styles.settings}>
                <a href="#">Settings</a>
            </div>

        </aside>
    );
}

export default Sidebar;