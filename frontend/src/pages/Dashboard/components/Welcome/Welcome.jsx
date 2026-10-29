import styles from "./Welcome.module.css";
import { useAuth } from "../../../../context/AuthContext";
import { fetchTasks } from "../../../../services/taskServices";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function WelcomeSection() {
  const navigate = useNavigate();
  //destructuring the important data from the hook
  const { user } = useAuth();
  const [focusTask, setFocusTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const formattedDateToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  //Show the real subjects rather than Mock Data
  useEffect(() => {
    let ignore = false;

    async function loadFocusTask() {
      try {
        const { tasks } = await fetchTasks();
        const nextTask = tasks.find((task) => !task.is_completed);
        if (!ignore) setFocusTask(nextTask ?? null);
      } catch (error) {
        console.error("Failed to load the focus Task", error);
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
      <p>{formattedDateToday}</p>

      <h1>Welcome Back, {user?.name || "User"}!</h1>
      {/* division for making the distance between focusContent and the Start Button */}
      <div className={styles.focusSection}>
        <div className={styles.focusContent}>
          <div>
            <svg
              width="35px"
              height="35px"
              viewBox="0 0 24.00 24.00"
              xmlns="http://www.w3.org/2000/svg"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="0.00024000000000000003"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0">
                <rect
                  x="0"
                  y="0"
                  width="24.00"
                  height="24.00"
                  rx="12"
                  fill="#7438ff"
                  strokeWidth="0"
                ></rect>
              </g>

              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#CCCCCC"
                strokeWidth="0.4800000000000001"
              ></g>

              <g id="SVGRepo_iconCarrier">
                <g>
                  <path fill="none" d="M0 0h24v24H0z"></path>
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0 2C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path>
                </g>
              </g>
            </svg>
          </div>

          <div>
            <p>Today's Focus</p>
            {loading ? (
              <p>loading...</p>
            ) : focusTask ? (
              <>
                <h3>{focusTask.title}</h3>
                {focusTask.description && <p>{focusTask.description}</p>}
              </>
            ) : (
              <>
                <h3>No Tasks yet</h3>
                <p>Add a task to see it here.</p>
              </>
            )}
          </div>
        </div>

        <div className={styles.startButtonContainer}>
          <button
            className={styles.startButton}
            onClick={() => navigate("/ai-coaching")}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
