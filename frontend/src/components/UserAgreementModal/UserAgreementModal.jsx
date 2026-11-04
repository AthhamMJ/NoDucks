import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import privacyText from "../../content/legal/privacy-policy.md?raw";
import termsText from "../../content/legal/terms-and-conditions.md?raw";
import styles from "./UserAgreementModal.module.css";

export default function UserAgreementModal({ onClose }) {
  const dialogRef = useRef(null);

  // Focus the dialog on open, lock page scroll, and restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  // Escape closes the popup and keeps Tab focus inside it.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className={styles.overlay}
      // Stop mousedown here so the Sign Up modal underneath doesn't also close.
      onMouseDown={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        tabIndex={-1}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close legal documents"
        >
          <X size={19} strokeWidth={1.8} />
        </button>

        <div className={styles.header}>
          <h2 id="legal-title">Legal</h2>
        </div>

        <div className={styles.content}>
          <section className={styles.markdown}>
            <ReactMarkdown>{privacyText}</ReactMarkdown>
          </section>

          <hr className={styles.divider} />

          <section className={styles.markdown}>
            <ReactMarkdown>{termsText}</ReactMarkdown>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}