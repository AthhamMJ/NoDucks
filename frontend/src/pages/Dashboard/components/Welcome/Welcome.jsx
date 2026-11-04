import styles from "./Welcome.module.css";
import { useAuth } from "../../../../context/AuthContext";
import { fetchTasks } from "../../../../services/taskServices";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function WelcomeSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [focusTask, setFocusTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const formattedDateToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    let ignore = false;

    async function loadFocusTask() {
      try {
        const { tasks } = await fetchTasks();
        const nextTask = tasks.find((task) => !task.is_completed);
        if (!ignore) setFocusTask(nextTask ?? null);
      } catch (error) {
        console.error("Failed to load the focus task:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFocusTask();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className={styles.welcomeContent}>
      <p className={styles.dateLabel}>{formattedDateToday}</p>

      <h1>Welcome Back, {user?.name || "User"}!</h1>

      <div className={styles.focusSection}>
        <div className={styles.focusContent}>
          <div className={styles.focusIconWrapper}>
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              aria-hidden="true"
            >
              <rect width="24" height="24" rx="12" fill="#7438FF" />
              <path
                d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0 2C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                fill="#FFFFFF"
              />
            </svg>
          </div>

          <div className={styles.focusTextDetails}>
            <p className={styles.focusSubheading}>Today's Focus</p>
            {loading ? (
              <p className={styles.loadingState}>Loading focus task...</p>
            ) : focusTask ? (
              <>
                <h3 className={styles.taskTitle}>{focusTask.title}</h3>
                {focusTask.description && (
                  <p className={styles.taskDescription}>{focusTask.description}</p>
                )}
              </>
            ) : (
              <>
                <h3 className={styles.taskTitle}>No Tasks Yet</h3>
                <p className={styles.taskDescription}>Add a task to set your focus target.</p>
              </>
            )}
          </div>
        </div>

        <div className={styles.startButtonContainer}>
          <button
            className={styles.startButton}
            onClick={() => navigate("/ai-coaching")}
            disabled={loading}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;