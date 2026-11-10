import { X, Zap } from "lucide-react";
import styles from "./QuotaModal.module.css";

/**
 * QuotaModal — shown when the user hits their AI usage limit.
 * Props:
 *   isOpen   {boolean}
 *   message  {string}  — server error message, e.g. "You've used all 5 chat for this month."
 *   onClose  {() => void}
 */
export default function QuotaModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Zap size={20} />
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          <h2 className={styles.title}>Usage Limit Reached</h2>
          <p className={styles.text}>
            {message ||
              "You've used all your available AI interactions for this period."}
          </p>
          <p className={styles.sub}>
            Your quota resets at the start of next month. Upgrade your plan to
            get more interactions.
          </p>
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={onClose}>
            Got it
          </button>
          <a href="/pricing" className={styles.primaryBtn}>
            View Plans
          </a>
        </div>
      </div>
    </div>
  );
}

