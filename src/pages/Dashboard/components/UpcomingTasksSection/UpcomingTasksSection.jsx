import { Link } from 'react-router-dom';
import TaskCard from '../TaskCard/TaskCard';
import styles from './UpcomingTasksSection.module.css';

const tasks = [
  { id: 1, title: 'Newton’s First Law – Read & Notes', subject: 'Physics', due: 'Today' },
  { id: 2, title: 'Algebra – Practice Questions', subject: 'Mathematics', due: 'Today' },
  { id: 3, title: 'Data Structures – Watch Video', subject: 'Computer Science', due: 'Tomorrow' },
  { id: 4, title: 'Essay Draft – The Industrial Revolution', subject: 'History', due: 'Tomorrow' },
];

export default function UpcomingTasksSection() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Upcoming Tasks</h2>
        <Link to="/tasks">View all ›</Link>
      </div>

      <div className={styles.taskList}>
        {tasks.map((t) => (
          <TaskCard key={t.id} {...t} />
        ))}
      </div>
    </section>
  );
}