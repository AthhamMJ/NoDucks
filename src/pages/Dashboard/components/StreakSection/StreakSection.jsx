import styles from './StreakSection.module.css';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StreakSection({ streak = 3, todayIndex = 2 }) {
  return (
    <div>
      <p className={styles.quote}>Small steps every day lead to big dreams.</p>
      <p className={styles.count}>
        <strong>{streak}</strong> days
      </p>
      <p className={styles.hint}>Keep it going!</p>

      <div className={styles.week}>
        {days.map((d, i) => (
          <div key={i} className={styles.day}>
            <span
              className={`${styles.dot} ${i < todayIndex ? styles.done : ''} ${i === todayIndex ? styles.today : ''}`}
            >
              {i <= todayIndex ? '✓' : ''}
            </span>
            <small>{d}</small>
          </div>
        ))}
      </div>
    </div>
  );
}