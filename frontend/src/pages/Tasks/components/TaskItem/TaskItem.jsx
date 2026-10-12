import {
  CalendarDays,
  Circle,
  CircleCheck,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { PRIORITIES, DEFAULT_SUBJECT_COLOR } from "../../constants/taskConstants";
import { formatDue, isOverdue } from "../../utils/taskUtils";
import styles from "../../Tasks.module.css";

export default function TaskItem({
  task,
  subject,
  isPending,
  isConfirming,
  onToggle,
  onEdit,
  onConfirmDelete,
  onCancelDelete,
  onDelete,
}) {
  const overdue =
    task.due_date && !task.is_completed && isOverdue(task.due_date);

  return (
    <li
      className={`${styles.card} ${task.is_completed ? styles.cardDone : ""}`}
    >
      <div className={styles.cardMain}>
        <button
          type="button"
          className={styles.checkButton}
          onClick={() => onToggle(task)}
          disabled={isPending}
          aria-pressed={task.is_completed}
          aria-label={
            task.is_completed
              ? `Mark "${task.title}" as not completed`
              : `Mark "${task.title}" as completed`
          }
        >
          {task.is_completed ? (
            <CircleCheck size={24} />
          ) : (
            <Circle size={24} />
          )}
        </button>

        <div className={styles.cardBody}>
          <div className={styles.cardMeta}>
            <span
              className={`${styles.pill} ${styles[`priority_${task.priority}`]} ${styles.priorityActive}`}
            >
              {PRIORITIES.find((p) => p.value === task.priority)?.label ??
                "Medium"}
            </span>

            {subject && (
              <span
                className={styles.subjectPill}
                style={{
                  "--subject-color": subject.color || DEFAULT_SUBJECT_COLOR,
                  "--subject-soft": `${subject.color || DEFAULT_SUBJECT_COLOR}20`,
                }}
              >
                <span className={styles.subjectDot} />
                {subject.name}
              </span>
            )}

            {task.due_date && (
              <span
                className={`${styles.due} ${overdue ? styles.dueOverdue : ""}`}
              >
                <CalendarDays size={14} aria-hidden="true" />
                {overdue ? "Overdue · " : ""}
                {formatDue(task.due_date)}
              </span>
            )}
          </div>

          <h3 className={styles.cardTitle}>{task.title}</h3>
          {task.description && (
            <p className={styles.cardDescription}>{task.description}</p>
          )}
        </div>

        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onEdit(task)}
            disabled={isPending}
            aria-label={`Edit "${task.title}"`}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
            onClick={() => onConfirmDelete(task.id)}
            disabled={isPending}
            aria-label={`Delete "${task.title}"`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isConfirming && (
        <div className={styles.confirmBar} role="alert">
          <span>Delete this task? This can't be undone.</span>
          <div className={styles.confirmActions}>
            <button
              type="button"
              className={styles.secondaryButtonSmall}
              onClick={onCancelDelete}
              disabled={isPending}
            >
              Keep
            </button>
            <button
              type="button"
              className={styles.dangerButtonSmall}
              onClick={() => onDelete(task)}
              disabled={isPending}
            >
              {isPending ? (
                <LoaderCircle
                  size={14}
                  className={styles.spin}
                  aria-hidden="true"
                />
              ) : (
                <Trash2 size={14} aria-hidden="true" />
              )}
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
