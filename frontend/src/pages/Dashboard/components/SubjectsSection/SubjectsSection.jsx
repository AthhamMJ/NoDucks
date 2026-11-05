import { useNavigate } from "react-router-dom";
import { Library } from "lucide-react";
import { mockSubjects } from "../../../../data/mockSubjects";
import { getSubjectIcon } from "../utils/subjectIcons";
import styles from "./SubjectsSection.module.css";

function SubjectsSection() {
  const navigate = useNavigate();
  const subjects = mockSubjects; // Replace with fetchSubjects() when the API is connected

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>
        <Library size={20} strokeWidth={1.75} />
        Suggested Topics
      </h2>

      <div className={styles.stack}>
        {subjects.map((subject) => {
          const Icon = getSubjectIcon(subject.id);

          return (
            <button
              key={subject.id}
              type="button"
              className={styles.tile}
              style={{ "--tint": subject.color }}
              onClick={() => navigate(`/tasks?subject=${subject.id}`)}
              aria-label={`${subject.name}, ${subject.tasks} open tasks`}
            >
              <div className={styles.iconCenter}>
                <Icon size={20} strokeWidth={1.5} />
              </div>

              <div className={styles.footer}>
                <span className={styles.name}>{subject.name}</span>
                <span className={styles.count}>
                  {subject.tasks} {subject.tasks === 1 ? "task" : "tasks"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default SubjectsSection;