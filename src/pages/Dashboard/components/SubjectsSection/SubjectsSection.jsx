import styles from "./SubjectsSection.module.css";

import {
  Sigma,
  Atom,
  Microscope,
  Laptop,
  BookOpen,
  Library,
  ChevronRight,
  Letters
} from "lucide-react";

const subjects = [
  { name: "History", tasks: 1, icon: <BookOpen size={18} strokeWidth={1.5} /> },
  { name: "English", tasks: 2, icon: <Letters size={18} strokeWidth={1.5} /> },
  { name: "Computer Science", tasks: 5, icon: <Laptop size={18} strokeWidth={1.5} /> },
  { name: "Biology", tasks: 0, icon: <Microscope size={18} strokeWidth={1.5} /> },
  { name: "Physics", tasks: 4, icon: <Atom size={18} strokeWidth={1.5} /> },
  { name: "Mathematics", tasks: 3, icon: <Sigma size={18} strokeWidth={1.5} /> },
];

function SubjectsSection() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <Library size={19} strokeWidth={1.5} />
        Your Subjects
      </h2>

      <div className={styles.grid}>
        {subjects.map((s) => (
          <button key={s.name} className={styles.item}>
            <span className={styles.icon}>
              {s.icon}
            </span>

            <span className={styles.info}>
              <strong>{s.name}</strong>

              <small className={s.tasks > 0 ? styles.active : ""}>
                {s.tasks} {s.tasks === 1 ? "task" : "tasks"}
              </small>
            </span>

            <span className={styles.arrow}>
              <ChevronRight size={16} strokeWidth={1.5} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SubjectsSection;