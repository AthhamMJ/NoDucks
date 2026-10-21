import { useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, LoaderCircle, Plus, X } from "lucide-react";
import {
  TITLE_MAX,
  description_MAX,
  SUBJECT_MAX,
  DEFAULT_SUBJECT_COLOR,
} from "../../constants/notesConstants";
import { cleanName } from "../../utils/notesUtils";
import styles from "../../Notes.module.css";

export default function NotesModal({
  note,
  subjects,
  subjectCatalog,
  subjectsLoading,
  subjectsError,
  onAddSubject,
  onClose,
  onSave,
}) {
  const isEdit = Boolean(note);
  const initial = useMemo(
    () => ({
      title: note?.title ?? "",
      description: note?.description ?? "",
      subjectId: note?.subject_id ?? "",
    }),
    [note],
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

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === "title" && titleError) setTitleError("");
    if (submitError) setSubmitError("");
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && canDismissSoftly) {
      onClose();
    }
  }

  async function addSubject({ key, name, catalogId = null, color = null }) {
    setSubjectFormError("");
    setAddingKey(key);
    try {
      const created = await onAddSubject({ name, catalogId, color });
      if (created?.id) update("subjectId", created.id);
      return created;
    } catch (error) {
      setSubjectFormError(error?.message || "Couldn't add subject.");
      return null;
    } finally {
      setAddingKey(null);
    }
  }

  async function handleAddCustom() {
    const clean = cleanName(newSubject);
    if (!clean) return;
    const created = await addSubject({ key: "custom", name: clean });
    if (created) setNewSubject("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const title = cleanName(values.title);
    if (!title) {
      setTitleError("Please enter a title");
      titleRef.current?.focus();
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      await onSave({
        title,
        description: values.description.trim(),
        subject_id: values.subjectId || null,
      });
      onClose();
    } catch (error) {
      setSubmitError(
        error?.message || "Failed to save note. Please try again.",
      );
      setSaving(false);
    }
  }

  const subjectsReady = !subjectsLoading && !subjectsError;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
        className={styles.modal}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <header className={styles.modalHeader}>
          <h2 id="note-modal-title" className={styles.modalHeading}>
            {isEdit ? "Edit Note" : "New Note"}
          </h2>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Close dialog"
            disabled={saving}
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <div className={styles.fieldHeader}>
              <label htmlFor="note-title" className={styles.label}>
                Title <span className={styles.required}>*</span>
              </label>
              <span className={styles.counter}>
                {values.title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              ref={titleRef}
              id="note-title"
              type="text"
              className={`${styles.input} ${titleError ? styles.inputError : ""}`}
              placeholder="e.g., Photosynthesis summary"
              value={values.title}
              maxLength={TITLE_MAX}
              onChange={(event) => update("title", event.target.value)}
              disabled={saving}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "title-error" : undefined}
            />
            {titleError && (
              <p id="title-error" className={styles.fieldError} role="alert">
                {titleError}
              </p>
            )}
          </div>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Subject</legend>

            {subjectsLoading && (
              <p className={styles.fieldHint}>Loading your subjects...</p>
            )}

            {subjectsError && (
              <p className={styles.fieldError} role="alert">
                Could not load subjects. You can still save without one.
              </p>
            )}

            {subjectsReady && (
              <div className={styles.subjectGroup}>
                <button
                  type="button"
                  className={`${styles.subjectChip} ${
                    !values.subjectId ? styles.subjectChipActive : ""
                  }`}
                  style={{ "--subject-color": DEFAULT_SUBJECT_COLOR }}
                  onClick={() => update("subjectId", "")}
                >
                  {!values.subjectId && (
                    <CircleCheck size={14} aria-hidden="true" />
                  )}
                  No Subject
                </button>

                {subjects.map((subject) => {
                  const active = values.subjectId === subject.id;
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      className={`${styles.subjectChip} ${
                        active ? styles.subjectChipActive : ""
                      }`}
                      style={{
                        "--subject-color":
                          subject.color || DEFAULT_SUBJECT_COLOR,
                      }}
                      onClick={() => update("subjectId", subject.id)}
                    >
                      {active && <CircleCheck size={14} aria-hidden="true" />}
                      {subject.name}
                    </button>
                  );
                })}
              </div>
            )}

            {subjectsReady && suggestions.length > 0 && (
              <div className={styles.suggestions}>
                <span className={styles.suggestionsLabel}>
                  Add from catalog:
                </span>
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
            <label htmlFor="note-description" className={styles.label}>
              description <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="note-description"
              className={styles.textarea}
              placeholder="Write your note here"
              rows={7}
              value={values.description}
              maxLength={description_MAX}
              onChange={(event) => update("description", event.target.value)}
              disabled={saving}
            />
          </div>

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
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create note"
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
