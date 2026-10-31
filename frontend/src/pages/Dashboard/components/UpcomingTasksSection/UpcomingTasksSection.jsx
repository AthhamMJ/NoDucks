import { Link } from "react-router-dom";
import TaskCard from "../TaskCard/TaskCard";
import styles from "./UpcomingTasksSection.module.css";
import { useEffect, useState } from "react";
import {
  fetchTasks,
  fetchSubjects,
  toggleTask,
} from "../../../../services/taskServices";

// const tasks = [ hardcoded tasks used before
//   { id: 1, title: 'Newton’s First Law – Read & Notes', subject: 'Physics', due: 'Today' },
//   { id: 2, title: 'Algebra – Practice Questions', subject: 'Mathematics', due: 'Today' },
//   { id: 3, title: 'Data Structures – Watch Video', subject: 'Computer Science', due: 'Tomorrow' },
//   { id: 4, title: 'Essay Draft – The Industrial Revolution', subject: 'History', due: 'Tomorrow' },
// ];

//function to mod the date looks easily
function formatDueDate(dateString) {
  if (!dateString) return "";
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  if (dateString === today) return "Today";
  if (dateString === tomorrow) return "Tomorrow";

  const dateObj = new Date(dateString + "T00:00:00");
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
export default function UpcomingTasksSection() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tasksRes, subjectsRes] = await Promise.all([
          fetchTasks(),
          fetchSubjects().catch(() => ({ subjects: [] })),
        ]);
        setTasks(tasksRes.tasks || []);
        setSubjects(subjectsRes.subjects || []);
      } catch (error) {
        console.error("Failed to load the upcoming Tasks", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleToggle = async (task) => {
    const nextStatus = !task.is_completed;
    //updating the user interface
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, is_completed: nextStatus } : t,
      ),
    );

    try {
      await toggleTask(task.id, nextStatus);
    } catch (error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, is_completed: task.is_completed } : t,
        ),
      );
      console.error("Failed to toggle the taks", error);
    }
  };

  //filter the active 4 incomplete tasks first
  const previewTasks = tasks.filter((task) => !task.is_completed).slice(0, 4);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Upcoming Tasks</h2>
        <Link to="/tasks">View all ›</Link>
      </div>

      <div className={styles.taskList}>
        {loading ? (
          <p>Loading Tasks...</p>
        ) : previewTasks.length === 0 ? (
          <p>No upcoming Tasks</p>
        ) : (
          previewTasks.map((t) => {
            const subject = subjects.find((s) => s.id === t.subject_id);

            return (
              <TaskCard
                key={t.id}
                title={t.title}
                subject={subject ? subject.name : ""}
                due={formatDueDate(t.due_date)}
                done={t.is_completed}
                onToggle={() => handleToggle(t)}
              ></TaskCard>
            );
          })
        )}
      </div>
    </section>
  );
}
