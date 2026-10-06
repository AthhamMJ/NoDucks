import styles from "./Home.module.css";
import Calendar from "../../components/Calender/Calender";
import Welcome from "../../components/Welcome/Welcome";

function Home() {
    return (
        <div className={styles.dashboard}>

            <div className={styles.mainColumn}>
                <section className={styles.welcomeCard}>
                    <Welcome />
                </section>

                <section className={styles.subjectsCard}>
                    Your Subjects
                </section>

                <section className={styles.tasksCard}>
                    Upcoming Tasks
                </section>
            </div>

            <div className={styles.sideColumn}>
                <section className={styles.streakCard}>
                    Streak
                </section>

                <section className={styles.aiCard}>
                    Nocus AI
                </section>

                <section className={styles.calendarCard}>
                    <Calendar />
                </section>
            </div>

        </div>
    );
}

export default Home;