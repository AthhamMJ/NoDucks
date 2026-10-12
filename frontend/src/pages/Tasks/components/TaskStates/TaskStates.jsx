import { CircleAlert, Database, ListChecks, Plus, RefreshCw } from "lucide-react";
import styles from "../../Tasks.module.css";

export default function TaskStates({ status, onReload, onOpenCreate }) {
  if (status === "loading") {
    return (
      <div className={styles.list} aria-busy="true" aria-live="polite">
        <span className={styles.visuallyHidden}>Loading your tasks</span>
        {[0, 1, 2].map((key) => (
          <div key={key} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (status === "signed-out") {
    return (
      <div className={styles.stateCard}>
        <div className={styles.stateIcon}>
          <ListChecks size={28} />
        </div>
        <h2 className={styles.stateTitle}>Sign in to see your tasks</h2>
        <p className={styles.stateText}>
          Your tasks are private to your account. Sign in to view and manage
          them.
        </p>
      </div>
    );
  }

  if (status === "no-table") {
    return (
      <div className={styles.stateCard}>
        <div className={styles.stateIcon}>
          <Database size={28} />
        </div>
        <h2 className={styles.stateTitle}>Tasks aren't set up yet</h2>
        <p className={styles.stateText}>
          The tasks table doesn't exist in your database yet. Run the setup
          SQL in Supabase, then check again.
        </p>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onReload}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Check again
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.stateCard} role="alert">
        <div className={`${styles.stateIcon} ${styles.stateIconDanger}`}>
          <CircleAlert size={28} />
        </div>
        <h2 className={styles.stateTitle}>We couldn't load your tasks</h2>
        <p className={styles.stateText}>
          Check your connection and try again.
        </p>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onReload}
        >
          <RefreshCw size={16} aria-hidden="true" />
          Try again
        </button>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className={styles.stateCard}>
        <div className={styles.stateIcon}>
          <ListChecks size={28} />
        </div>
        <h2 className={styles.stateTitle}>No tasks yet</h2>
        <p className={styles.stateText}>
          Add your first task to start organizing your learning.
        </p>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onOpenCreate}
        >
          <Plus size={18} aria-hidden="true" />
          Add your first task
        </button>
      </div>
    );
  }

  return null;
}
