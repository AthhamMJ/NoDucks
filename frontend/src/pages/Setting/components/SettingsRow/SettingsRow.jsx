import { ChevronRight } from "lucide-react";
import styles from "./SettingsRow.module.css";

export default function SettingsRow({
  icon: Icon,
  title,
  description,
  control,
  onClick,
  showChevron = false,
}) {
  const content = (
    <>
      <div className={styles.main}>
        {Icon && (
          <div className={styles.iconBox}>
            <Icon size={16} />
          </div>
        )}
        <div className={styles.text}>
          <span className={styles.title}>{title}</span>
          {description && (
            <span className={styles.description}>{description}</span>
          )}
        </div>
      </div>

      <div className={styles.control}>
        {control}
        {showChevron && <ChevronRight size={16} />}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.row} ${styles.interactive}`}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <div className={styles.row}>{content}</div>;
}