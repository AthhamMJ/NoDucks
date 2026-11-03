import styles from "./SubjectsSection.module.css";
import {
  Sigma,
  Atom,
  Microscope,
  Laptop,
  BookOpen,
  Library,
  ChevronRight,
  Type
} from "lucide-react";

// Lucide icon replacement: 'Letters' -> 'Type' for standard lucide-react builds
const subjects = [
  { name: "History", tasks: 1, icon: <BookOpen size={16} strokeWidth={1.75} /> },
  { name: "English", tasks: 2, icon: <Type size={16} strokeWidth={1.75} /> },
  { name: "Computer Science", tasks: 5, icon: <Laptop size={16} strokeWidth={1.75} /> },
  { name: "Biology", tasks: 0, icon: <Microscope size={16} strokeWidth={1.75} /> },
  { name: "Physics", tasks: 4, icon: <Atom size={16} strokeWidth={1.75} /> },
  { name: "Mathematics", tasks: 3, icon: <Sigma size={16} strokeWidth={1.75} /> },
];

function SubjectsSection() {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>
            <Library size={18} strokeWidth={1.75} />
          </span>
          Your Subjects
        </h2>
      </div>

      <div className={styles.grid}>
        {subjects.map((s) => (
          <button key={s.name} className={styles.item} type="button">
            <div className={styles.iconWrapper}>
              {s.icon}
            </div>

            <div className={styles.info}>
              <strong className={styles.subjectName}>{s.name}</strong>
              <span className={`${styles.taskCount} ${s.tasks > 0 ? styles.active : ""}`}>
                {s.tasks} {s.tasks === 1 ? "task" : "tasks"}
              </span>
            </div>

            <span className={styles.arrow}>
              <ChevronRight size={15} strokeWidth={2} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default SubjectsSection;