import { LogOut, Trash2, TriangleAlert } from "lucide-react";
import SettingsCard from "../SettingsCard/SettingsCard";
import styles from "./DangerZone.module.css";

export default function DangerZone({ onLogOut, onDeleteAccount }) {
  return (
    <SettingsCard danger>
      <div className={styles.wrapper}>
        <div className={styles.titleRow}>
          <TriangleAlert size={18} />
          <h2 className={styles.heading}>Account Deactivation</h2>
        </div>

        <p className={styles.intro}>
          Invaluable actions regarding your active study profile and persistent
          sync storage.
        </p>

        <div className={styles.actionCard}>
          <div className={styles.actionInfo}>
            <span className={styles.actionTitle}>
              End Current Session or Erase Data
            </span>
            <span className={styles.actionDescription}>
              Sign out from this browser session or permanently erase all
              learning logs, decks, and task records.
            </span>
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.logOutButton} onClick={onLogOut}>
              <LogOut size={14} />
              Log Out
            </button>
            <button type="button" className={styles.deleteButton} onClick={onDeleteAccount}>
              <Trash2 size={14} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}