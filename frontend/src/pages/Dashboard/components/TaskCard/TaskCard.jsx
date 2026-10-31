import styles from './TaskCard.module.css';

export default function TaskCard({ title, subject = '', due, done = false, onToggle }) {
  const subjectKey = subject.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={styles.task}>
      <input
        type="checkbox"
        className={styles.check}
        checked={done}
        onChange={onToggle}
        readOnly={!onToggle}
        aria-label={`Complete ${title}`}
      />
      <span className={`${styles.title} ${done ? styles.done : ''}`}>{title}</span>
      <span className={styles.tag} data-subject={subjectKey}>{subject}</span>
      <span className={due === 'Today' ? styles.today : styles.due}>{due}</span>
    </div>
  );
}