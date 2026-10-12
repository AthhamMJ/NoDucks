import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";
import {
  PRIORITIES,
  TITLE_MAX,
  DESCRIPTION_MAX,
  SUBJECT_MAX,
  DEFAULT_SUBJECT_COLOR,
} from "../../constants/taskConstants";
import { cleanName, isMissingTable } from "../../utils/taskUtils";
import styles from "../../Tasks.module.css";

export default function TaskModal({
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
