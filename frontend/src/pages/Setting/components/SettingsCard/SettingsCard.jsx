import styles from "./SettingsCard.module.css";

export default function SettingsCard({
  title,
  description,
  footer,
  danger = false,
  children,
}) {
  return (
    <section className={`${styles.card} ${danger ? styles.danger : ""}`}>
      {(title || description) && (
        <header className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {description && <p className={styles.description}>{description}</p>}
        </header>
      )}

      <div className={styles.body}>{children}</div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
//this is where we used to render the contents from the child classes