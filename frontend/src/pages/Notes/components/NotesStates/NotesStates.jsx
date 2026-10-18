import {
  CircleAlert,
  LoaderCircle,
  NotebookPen,
  Plus,
  RefreshCw,
} from "lucide-react";
import styles from "../../Notes.module.css";


// shows the spinner while the Notes are loading from the /backend
export default function NotesStates({ status, onReload, onOpenCreate }) {
  if (status === "loading") {
    return (
      <div className={styles.state} role="status">
        <LoaderCircle size={22} className={styles.spin} />
        <p>Loading your notes...</p>
      </div>
    );
  }

// Shows that the notes are private
  if (status === "signed-out") {
    return (
      <div className={styles.state}>
        <NotebookPen size={26} />
        <p>Sign in to see your notes. They are private to your account.</p>
      </div>
    );
  }

// Showing the error message when the connection goes wrong
  if (status === "error") {
    return (
      <div className={styles.state} role="alert">
        <CircleAlert size={26} />
        <p>We couldn't load your notes. Check your connection and try again.</p>
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

// If the user doesn't created any notes
  if (status === "empty") {
    return (
      <div className={styles.state}>
        <NotebookPen size={26} />
        <p>
          You have no notes yet. Write your first one to start building your
          study library.
        </p>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onOpenCreate}
        >
          <Plus size={16} aria-hidden="true" />
          New Note
        </button>
      </div>
    );
  }

  return null;
}
