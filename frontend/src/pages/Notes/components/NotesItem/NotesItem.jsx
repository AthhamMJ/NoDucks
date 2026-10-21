import { Clock } from "lucide-react";
import { timeAgo } from "../../utils/notesUtils";
import styles from "../../Notes.module.css";

export default function NotesItem({ note, subject, onSelect }) {
  const subjectName = subject?.name ?? note.subject;
  const cardStyle = subject?.color
    ? { "--note-color": subject.color }
    : undefined;

  return (
    <li>
      <button
        type="button"
        className={styles.card}
        style={cardStyle}
        onClick={() => onSelect(note)}
      >
        {subjectName && (
          <span className={styles.subjectPill}>{subjectName}</span>
        )}
        <h2 className={styles.cardTitle}>{note.title}</h2>
        <p className={styles.cardPreview}>{note.description}</p>
        <span className={styles.cardMeta}>
          <Clock size={12} aria-hidden="true" />
          Edited {timeAgo(note.updated_at ?? note.created_at)}
        </span>
      </button>
    </li>
  );
}
