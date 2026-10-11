import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Circle,
  Database,
  ListChecks,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import styles from "./Tasks.module.css";

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 500;
const SUBJECT_MAX = 40;

const DEFAULT_SUBJECT_COLOR = "#64748B";
const CUSTOM_SUBJECT_COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#8B5CF6",
];

const SUBJECT_COLUMNS = "id, name, color, catalog_id";

function isMissingTable(error) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    /schema cache|does not exist/i.test(error?.message || "")
  );
}

function cleanName(value) {
  return value.replace(/\s+/g, " ").trim();
}

function sortByName(list) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDue(value) {
  const date = parseDate(value);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function isOverdue(value) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDate(value) < today;
}

function TaskModal({
  task,
  subjects,
  subjectCatalog,
  subjectsLoading,
  subjectsError,
  onAddSubject,
  onClose,
  onSave,
}) {
  const isEdit = Boolean(task);
  const initial = useMemo(
    () => ({
      title: task?.title ?? "",
      description: task?.description ?? "",
      dueDate: task?.due_date ?? "",
      priority: task?.priority ?? "medium",
      subjectId: task?.subject_id ?? "",
    }),
    [task],
  );

  const [values, setValues] = useState(initial);
  const [titleError, setTitleError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newSubject, setNewSubject] = useState("");
  const [addingKey, setAddingKey] = useState(null);
  const [subjectFormError, setSubjectFormError] = useState("");

  const dialogRef = useRef(null);
  const titleRef = useRef(null);

  const dirty =
    values.title !== initial.title ||
    values.description !== initial.description ||
    values.dueDate !== initial.dueDate ||
    values.priority !== initial.priority ||
    values.subjectId !== initial.subjectId;

  const canDismissSoftly = !dirty && !saving;

  // Catalogue suggestions the student hasn't added yet.
  const suggestions = useMemo(() => {
    const ownedCatalogIds = new Set(
      subjects.map((s) => s.catalog_id).filter(Boolean),
    );
    const ownedNames = new Set(subjects.map((s) => s.name.toLowerCase()));
    return subjectCatalog.filter(
      (entry) =>
        !ownedCatalogIds.has(entry.id) &&
        !ownedNames.has(entry.name.toLowerCase()),
    );
  }, [subjects, subjectCatalog]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      if (canDismissSoftly) onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget && canDismissSoftly) onClose();
  }

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === "title") setTitleError("");
    setSubmitError("");
  }

  async function addSubject({ key, name, catalogId, color }) {
    if (addingKey) return;

    setAddingKey(key);
    setSubjectFormError("");

    try {
      const subject = await onAddSubject({ name, catalogId, color });

      update("subjectId", subject.id);

      if (key === "custom") {
        setNewSubject("");
      }
    } catch (error) {
      console.error("Failed to add subject:", error);

      setSubjectFormError(
        isMissingTable(error)
          ? "The subjects table isn't set up in the database yet."
          : "We couldn't add that subject. Please try again.",
      );
    } finally {
      setAddingKey(null);
    }
  }

  function handleAddCustom() {
    const name = cleanName(newSubject);
    if (name) addSubject({ key: "custom", name });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    const title = values.title.trim();
    if (!title) {
      setTitleError("Give your task a title.");
      titleRef.current?.focus();
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      await onSave({
        title,
        description: values.description.trim() || null,
        due_date: values.dueDate || null,
        priority: values.priority,
        subject_id: values.subjectId || null,
      });
      onClose();
    } catch (error) {
      setSubmitError(
        isMissingTable(error)
          ? "The tasks table isn't set up in the database yet."
          : "We couldn't save this task. Check your connection and try again.",
      );
      setSaving(false);
    }
  }

  const subjectsReady = !subjectsLoading && !subjectsError;

  return (
    <div
      className={styles.backdrop}
      onMouseDown={handleBackdropMouseDown}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <header className={styles.modalHeader}>
          <div>
            <h2 id="task-modal-title" className={styles.modalTitle}>
              {isEdit ? "Edit task" : "Add new task"}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEdit
                ? "Update the details of this task."
                : "Capture what you need to get done."}
            </p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="task-title" className={styles.label}>
              Title
            </label>
            <input
              id="task-title"
              ref={titleRef}
              type="text"
              className={`${styles.input} ${titleError ? styles.inputInvalid : ""}`}
              placeholder="e.g. Revise Newton's laws"
              value={values.title}
              maxLength={TITLE_MAX}
              onChange={(event) => update("title", event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "task-title-error" : undefined}
              disabled={saving}
            />
            {titleError && (
              <p
                id="task-title-error"
                className={styles.fieldError}
                role="alert"
              >
                {titleError}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="task-description" className={styles.label}>
              Description <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="task-description"
              className={styles.textarea}
              placeholder="Add details about this task"
              rows={3}
              value={values.description}
              maxLength={DESCRIPTION_MAX}
              onChange={(event) => update("description", event.target.value)}
              disabled={saving}
            />
          </div>

          <fieldset className={styles.field} disabled={saving}>
            <legend className={styles.label}>
              Subject <span className={styles.optional}>(optional)</span>
            </legend>

            {subjectsLoading && (
              <p className={styles.subjectHelp}>Loading subjects...</p>
            )}

            {!subjectsLoading && subjectsError && (
              <p className={styles.subjectError} role="alert">
                <CircleAlert size={16} aria-hidden="true" />
                We couldn't load your subjects. Close and reopen this window to
                try again.
              </p>
            )}

            {!subjectsLoading && subjects.length > 0 && (
              <div
                className={styles.subjectGroup}
                role="group"
                aria-label="Your subjects"
              >
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    type="button"
                    className={`${styles.subjectOption} ${
                      values.subjectId === subject.id
                        ? styles.subjectOptionActive
                        : ""
                    }`}
                    style={{
                      "--subject-color": subject.color || DEFAULT_SUBJECT_COLOR,
                      "--subject-soft": `${subject.color || DEFAULT_SUBJECT_COLOR}20`,
                    }}
                    onClick={() =>
                      update(
                        "subjectId",
                        values.subjectId === subject.id ? "" : subject.id,
                      )
                    }
                    aria-pressed={values.subjectId === subject.id}
                  >
                    <span className={styles.subjectDot} />
                    {subject.name}
                    {values.subjectId === subject.id && (
                      <CircleCheck size={15} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {subjectsReady && subjects.length === 0 && (
              <p className={styles.subjectHelp}>
                No subjects yet. Pick a suggestion or create your own.
              </p>
            )}

            {subjectsReady && suggestions.length > 0 && (
              <div className={styles.subjectSuggestions}>
                <p className={styles.subjectSubLabel}>Suggestions</p>
                <div className={styles.subjectGroup}>
                  {suggestions.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className={styles.suggestionChip}
                      style={{
                        "--subject-color":
                          entry.default_color || DEFAULT_SUBJECT_COLOR,
                      }}
                      onClick={() =>
                        addSubject({
                          key: entry.id,
                          name: entry.name,
                          catalogId: entry.id,
                          color: entry.default_color,
                        })
                      }
                      disabled={Boolean(addingKey)}
                      aria-label={`Add ${entry.name} to your subjects`}
                    >
                      {addingKey === entry.id ? (
                        <LoaderCircle
                          size={14}
                          className={styles.spin}
                          aria-hidden="true"
                        />
                      ) : (
                        <Plus size={14} aria-hidden="true" />
                      )}
                      {entry.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {subjectsReady && (
              <div className={styles.subjectAdd}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Create a custom subject"
                  aria-label="Custom subject name"
                  value={newSubject}
                  maxLength={SUBJECT_MAX}
                  onChange={(event) => {
                    setNewSubject(event.target.value);
                    setSubjectFormError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddCustom();
                    }
                  }}
                  disabled={Boolean(addingKey)}
                />
                <button
                  type="button"
                  className={styles.secondaryButtonSmall}
                  onClick={handleAddCustom}
                  disabled={!cleanName(newSubject) || Boolean(addingKey)}
                >
                  {addingKey === "custom" ? (
                    <LoaderCircle
                      size={14}
                      className={styles.spin}
                      aria-hidden="true"
                    />
                  ) : (
                    <Plus size={14} aria-hidden="true" />
                  )}
                  Add
                </button>
              </div>
            )}

            {subjectFormError && (
              <p className={styles.fieldError} role="alert">
                {subjectFormError}
              </p>
            )}
          </fieldset>

          <div className={styles.field}>
            <label htmlFor="task-due" className={styles.label}>
              Due date <span className={styles.optional}>(optional)</span>
            </label>

            <div className={styles.dateWrap}>
              <CalendarDays
                size={18}
                className={styles.dateIcon}
                aria-hidden="true"
              />
              <input
                id="task-due"
                type="date"
                className={`${styles.input} ${styles.dateInput}`}
                value={values.dueDate}
                onChange={(event) => update("dueDate", event.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <fieldset className={styles.field} disabled={saving}>
            <legend className={styles.label}>Priority</legend>
            <div
              className={styles.priorityGroup}
              role="radiogroup"
              aria-label="Priority"
            >
              {PRIORITIES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`${styles.priorityOption} ${styles[`priority_${value}`]} ${
                    values.priority === value ? styles.priorityActive : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={value}
                    checked={values.priority === value}
                    onChange={() => update("priority", value)}
                    className={styles.visuallyHidden}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {submitError && (
            <p className={styles.formError} role="alert">
              <CircleAlert size={16} aria-hidden="true" />
              {submitError}
            </p>
          )}

          <footer className={styles.modalFooter}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={18}
                    className={styles.spin}
                    aria-hidden="true"
                  />
                  Saving
                </>
              ) : (
                "Save task"
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [status, setStatus] = useState("loading");
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectCatalog, setSubjectCatalog] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState(false);
  const [userId, setUserId] = useState(null);
  const [modal, setModal] = useState(null);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [confirmingId, setConfirmingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const loadTasks = useCallback(async () => {
    setStatus("loading");
    setSubjectsLoading(true);
    setSubjectsError(false);
    setActionError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setUserId(null);
      setTasks([]);
      setSubjects([]);
      setSubjectCatalog([]);
      setSubjectsLoading(false);
      setStatus("signed-out");
      return;
    }

    setUserId(user.id);

    const [tasksResult, subjectsResult, catalogResult] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("subjects")
        .select(SUBJECT_COLUMNS)
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
      supabase
        .from("subject_catalog")
        .select("id, name, default_color")
        .order("name", { ascending: true }),
    ]);

    setSubjects(subjectsResult.error ? [] : (subjectsResult.data ?? []));
    setSubjectCatalog(catalogResult.error ? [] : (catalogResult.data ?? []));
    setSubjectsError(Boolean(subjectsResult.error || catalogResult.error));
    setSubjectsLoading(false);

    if (tasksResult.error) {
      setTasks([]);
      setStatus(isMissingTable(tasksResult.error) ? "no-table" : "error");
      return;
    }

    setTasks(tasksResult.data ?? []);
    setStatus("ready");
  }, []);

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

  // Adds a subject to the student's own list. Reuses an existing one
  // instead of creating a duplicate.
  async function handleAddSubject({ name, catalogId = null, color }) {
    const clean = cleanName(name);
    if (!clean) throw new Error("Subject name is required.");
    const key = clean.toLowerCase();

    // A custom name that matches a catalogue entry links to that entry.
    let linkedCatalogId = catalogId;
    let chosenColor = color;
    if (!linkedCatalogId) {
      const match = subjectCatalog.find((e) => e.name.toLowerCase() === key);
      if (match) {
        linkedCatalogId = match.id;
        chosenColor = chosenColor || match.default_color;
      }
    }

    const sameSubject = (s) =>
      s.name.toLowerCase() === key ||
      (linkedCatalogId && s.catalog_id === linkedCatalogId);

    const existing = subjects.find(sameSubject);
    if (existing) return existing;

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        user_id: userId,
        name: clean,
        color:
          chosenColor ||
          CUSTOM_SUBJECT_COLORS[subjects.length % CUSTOM_SUBJECT_COLORS.length],
        catalog_id: linkedCatalogId,
      })
      .select(SUBJECT_COLUMNS)
      .single();

    if (!error) {
      setSubjects((current) => sortByName([...current, data]));
      return data;
    }

    // Already exists (added in another tab): reuse that record.
    if (error.code === "23505") {
      const { data: fresh } = await supabase
        .from("subjects")
        .select(SUBJECT_COLUMNS)
        .eq("user_id", userId)
        .order("name", { ascending: true });
      const match = fresh?.find(sameSubject);
      if (match) {
        setSubjects(fresh);
        return match;
      }
    }

    throw error;
  }

  async function handleSave(values) {
    if (modal?.task) {
      const { data, error } = await supabase
        .from("tasks")
        .update(values)
        .eq("id", modal.task.id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      setTasks((current) =>
        current.map((task) => (task.id === data.id ? data : task)),
      );
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ ...values, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      setTasks((current) => [data, ...current]);
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

    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: next })
      .eq("id", task.id)
      .eq("user_id", userId);

    if (error) {
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, is_completed: task.is_completed }
            : item,
        ),
      );
      setActionError("We couldn't update that task. Please try again.");
    }
    setPending(task.id, false);
  }

  async function handleDelete(task) {
    if (pendingIds.has(task.id)) return;

    setActionError("");
    setPending(task.id, true);

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id)
      .eq("user_id", userId);

    if (error) {
      setActionError("We couldn't delete that task. Please try again.");
    } else {
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setConfirmingId(null);
    }
    setPending(task.id, false);
  }

  const canAdd = status === "ready";
  const openCreate = () => setModal({ task: null });

  function renderBody() {
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
            onClick={loadTasks}
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
            onClick={loadTasks}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        </div>
      );
    }

    if (tasks.length === 0) {
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
            onClick={openCreate}
          >
            <Plus size={18} aria-hidden="true" />
            Add your first task
          </button>
        </div>
      );
    }

    return (
      <ul className={styles.list}>
        {orderedTasks.map((task) => {
          const pending = pendingIds.has(task.id);
          const confirming = confirmingId === task.id;
          const overdue =
            task.due_date && !task.is_completed && isOverdue(task.due_date);
          const subject = task.subject_id
            ? subjectsById.get(task.subject_id)
            : null;

          return (
            <li
              key={task.id}
              className={`${styles.card} ${task.is_completed ? styles.cardDone : ""}`}
            >
              <div className={styles.cardMain}>
                <button
                  type="button"
                  className={styles.checkButton}
                  onClick={() => handleToggle(task)}
                  disabled={pending}
                  aria-pressed={task.is_completed}
                  aria-label={
                    task.is_completed
                      ? `Mark "${task.title}" as not completed`
                      : `Mark "${task.title}" as completed`
                  }
                >
                  {task.is_completed ? (
                    <CircleCheck size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span
                      className={`${styles.pill} ${styles[`priority_${task.priority}`]} ${styles.priorityActive}`}
                    >
                      {PRIORITIES.find((p) => p.value === task.priority)
                        ?.label ?? "Medium"}
                    </span>
                    {subject && (
                      <span
                        className={styles.subjectPill}
                        style={{
                          "--subject-color":
                            subject.color || DEFAULT_SUBJECT_COLOR,
                          "--subject-soft": `${subject.color || DEFAULT_SUBJECT_COLOR}20`,
                        }}
                      >
                        <span className={styles.subjectDot} />
                        {subject.name}
                      </span>
                    )}
                    {task.due_date && (
                      <span
                        className={`${styles.due} ${overdue ? styles.dueOverdue : ""}`}
                      >
                        <CalendarDays size={14} aria-hidden="true" />
                        {overdue ? "Overdue · " : ""}
                        {formatDue(task.due_date)}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.cardTitle}>{task.title}</h3>
                  {task.description && (
                    <p className={styles.cardDescription}>{task.description}</p>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => setModal({ task })}
                    disabled={pending}
                    aria-label={`Edit "${task.title}"`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                    onClick={() => setConfirmingId(task.id)}
                    disabled={pending}
                    aria-label={`Delete "${task.title}"`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {confirming && (
                <div className={styles.confirmBar} role="alert">
                  <span>Delete this task? This can't be undone.</span>
                  <div className={styles.confirmActions}>
                    <button
                      type="button"
                      className={styles.secondaryButtonSmall}
                      onClick={() => setConfirmingId(null)}
                      disabled={pending}
                    >
                      Keep
                    </button>
                    <button
                      type="button"
                      className={styles.dangerButtonSmall}
                      onClick={() => handleDelete(task)}
                      disabled={pending}
                    >
                      {pending ? (
                        <LoaderCircle
                          size={14}
                          className={styles.spin}
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2 size={14} aria-hidden="true" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.heading}>Tasks</h1>
          <p className={styles.subheading}>Plan your work. Make progress.</p>
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

      {renderBody()}

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
