import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleAlert, CircleCheck, Plus, X , ArrowLeft} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  fetchSubjects,
  fetchSubjectCatalog,
  addSubject,
} from "../../services/taskService";
import { isMissingTable, sortByName } from "./utils/taskUtils";
import TaskModal from "./components/TaskModal/TaskModal";
import TaskItem from "./components/TaskItem/TaskItem";
import TaskStates from "./components/TaskStates/TaskStates";
import styles from "./Tasks.module.css";

export default function Tasks() {
  const { user } = useAuth();
  const [status, setStatus] = useState("loading");
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectCatalog, setSubjectCatalog] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState(false);
  const [modal, setModal] = useState(null);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [confirmingId, setConfirmingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setSubjects([]);
      setSubjectCatalog([]);
      setSubjectsLoading(false);
      setStatus("signed-out");
      return;
    }

    setStatus("loading");
    setSubjectsLoading(true);
    setSubjectsError(false);
    setActionError("");

    try {
      const [tasksRes, subjectsRes, catalogRes] = await Promise.all([
        fetchTasks(),
        fetchSubjects().catch(() => ({ subjects: [] })),
        fetchSubjectCatalog().catch(() => ({ catalog: [] })),
      ]);

      setTasks(tasksRes.tasks ?? []);
      setSubjects(subjectsRes.subjects ?? []);
      setSubjectCatalog(catalogRes.catalog ?? []);
      setSubjectsError(false);
      setSubjectsLoading(false);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
      setSubjectsLoading(false);
      setStatus(isMissingTable(error) ? "no-table" : "error");
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const orderedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) => Number(a.is_completed) - Number(b.is_completed),
      ),
    [tasks],
  );

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const completedCount = tasks.filter((task) => task.is_completed).length;

  function setPending(id, isPending) {
    setPendingIds((current) => {
      const next = new Set(current);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleAddSubject({ name, catalogId = null, color }) {
    const data = await addSubject({ name, catalog_id: catalogId, color });
    const newSubject = data.subject ?? data;
    setSubjects((current) => sortByName([...current, newSubject]));
    return newSubject;
  }

  async function handleSave(values) {
    if (modal?.task) {
      const data = await updateTask(modal.task.id, values);
      const updated = data.task ?? data;
      setTasks((current) =>
        current.map((task) => (task.id === updated.id ? updated : task)),
      );
    } else {
      const data = await createTask(values);
      const created = data.task ?? data;
      setTasks((current) => [created, ...current]);
    }
  }

  async function handleToggle(task) {
    if (pendingIds.has(task.id)) return;
    const next = !task.is_completed;

    setActionError("");
    setPending(task.id, true);
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, is_completed: next } : item,
      ),
    );

    try {
      await toggleTask(task.id, next);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, is_completed: task.is_completed }
            : item,
        ),
      );
      setActionError("We couldn't update that task. Please try again.");
    } finally {
      setPending(task.id, false);
    }
  }

  async function handleDelete(task) {
    if (pendingIds.has(task.id)) return;

    setActionError("");
    setPending(task.id, true);

    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setConfirmingId(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
      setActionError("We couldn't delete that task. Please try again.");
    } finally {
      setPending(task.id, false);
    }
  }

  const canAdd = status === "ready";
  const openCreate = () => setModal({ task: null });

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.breadcrumb}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <Link to="/dashboard" className={styles.crumbLink}>
              Home
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span className={styles.crumbCurrent}>Tasks</span>
          </nav>
        </div>
        </div>

        <div className={styles.headerActions}>
          {status === "ready" && tasks.length > 0 && (
            <span className={styles.progress}>
              <CircleCheck size={16} aria-hidden="true" />
              {completedCount} of {tasks.length} completed
            </span>
          )}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreate}
            disabled={!canAdd}
          >
            <Plus size={18} aria-hidden="true" />
            Add task
          </button>
        </div>
      </header>

      {actionError && (
        <p className={styles.banner} role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          <span>{actionError}</span>
          <button
            type="button"
            className={styles.bannerClose}
            onClick={() => setActionError("")}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </p>
      )}

      {status !== "ready" ? (
        <TaskStates
          status={status}
          onReload={loadTasks}
          onOpenCreate={openCreate}
        />
      ) : tasks.length === 0 ? (
        <TaskStates status="empty" onOpenCreate={openCreate} />
      ) : (
        <ul className={styles.list}>
          {orderedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              subject={
                task.subject_id ? subjectsById.get(task.subject_id) : null
              }
              isPending={pendingIds.has(task.id)}
              isConfirming={confirmingId === task.id}
              onToggle={handleToggle}
              onEdit={(t) => setModal({ task: t })}
              onConfirmDelete={(id) => setConfirmingId(id)}
              onCancelDelete={() => setConfirmingId(null)}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {modal && (
        <TaskModal
          key={modal.task?.id ?? "new"}
          task={modal.task}
          subjects={subjects}
          subjectCatalog={subjectCatalog}
          subjectsLoading={subjectsLoading}
          subjectsError={subjectsError}
          onAddSubject={handleAddSubject}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}
