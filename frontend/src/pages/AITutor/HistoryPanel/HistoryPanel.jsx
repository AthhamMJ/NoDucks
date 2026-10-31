import React from "react";
import {
  Plus,
  Trash2,
  BookOpen,
  MessageSquare,
  FlaskConical,
} from "lucide-react";
import styles from "./HistoryPanel.module.css";

const METERS = [
  { key: "lessons", label: "Lessons", icon: BookOpen },
  { key: "chats", label: "Chat messages", icon: MessageSquare },
  { key: "quizzes", label: "Quizzes", icon: FlaskConical },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

export const HistoryPanel = ({
  lessons,
  usage,
  activeLessonId,
  onOpen,
  onDelete,
  onNew,
}) => (
  <aside className={styles.panel}>
    <button type="button" className={styles.newButton} onClick={onNew}>
      <Plus size={16} aria-hidden="true" />
      New lesson
    </button>

    {usage && (
      <div className={styles.usage}>
        <span className={styles.sectionLabel}>
          This month · {usage.plan} plan
        </span>

        {METERS.map(({ key, label, icon: Icon }) => {
          const { used, limit } = usage[key];
          const percent = limit ? Math.min(100, (used / limit) * 100) : 0;

          return (
            <div key={key} className={styles.meter}>
              <div className={styles.meterLabel}>
                <span>
                  <Icon size={13} aria-hidden="true" />
                  {label}
                </span>
                <span>
                  {used} / {limit}
                </span>
              </div>
              <div className={styles.track}>
                <div className={styles.fill} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    )}

    <span className={styles.sectionLabel}>Your lessons</span>

    {lessons.length === 0 ? (
      <p className={styles.empty}>Lessons you create will appear here.</p>
    ) : (
      <ul className={styles.list}>
        {lessons.map((l) => (
          <li
            key={l._id}
            className={`${styles.item} ${
              l._id === activeLessonId ? styles.active : ""
            }`}
          >
            <button
              type="button"
              className={styles.itemButton}
              onClick={() => onOpen(l._id)}
            >
              <span className={styles.itemTopic}>{l.topic}</span>
              <span className={styles.itemMeta}>
                {l.interest}
                {l.createdAt ? ` · ${formatDate(l.createdAt)}` : ""}
              </span>
            </button>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onDelete(l._id)}
              aria-label={`Delete ${l.topic}`}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </aside>
);