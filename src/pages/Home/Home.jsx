import styles from "./Home.module.css";
import Welcome from "./components/Welcome/Welcome";
import Calendar from "./components/Calendar/Calendar";
import SubjectsSection from "./components/SubjectsSection/SubjectsSection";
import StreakSection from "./components/StreakSection/StreakSection";
import NocusAISection from "./components/NocusAISection/NocusAISection";
import UpcomingTasksSection from "./components/UpcomingTasksSection/UpcomingTasksSection";

function Home() {
    return (
        <div className={styles.dashboard}>

            <div className={styles.mainColumn}>
                <section className={styles.card}>
                    <Welcome />
                </section>

                <section className={styles.card}>
                    <SubjectsSection />
                </section>

                <section className={styles.card}>
                    <UpcomingTasksSection />
                </section>
            </div>

            <div className={styles.sideColumn}>
                <section className={styles.card}>
                    <StreakSection />
                </section>

                <section className={styles.card}>
                    <NocusAISection />
                </section>

                <section className={styles.card}>
                    <Calendar />
                </section>
            </div>

        </div>
    );
}

export default Home;