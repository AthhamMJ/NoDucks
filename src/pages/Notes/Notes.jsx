import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  LayoutGrid,
  List,
  LoaderCircle,
  NotebookPen,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import styles from "./Notes.module.css";

const TITLE_MAX = 120;
const CONTENT_MAX = 5000;
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

function sortByRecent(list) {
  return [...list].sort(
    (a, b) =>
      new Date(b.updated_at ?? b.created_at) -
      new Date(a.updated_at ?? a.created_at),
  );
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const minutes = Math.floor((Date.now() - new Date(dateString)) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NoteModal({
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
      content: note?.content ?? "",
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
    values.content !== initial.content ||
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
      if (key === "custom") setNewSubject("");
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
      setTitleError("Give your note a title.");
      titleRef.current?.focus();
      return;
    }

    setSaving(true);
    setSubmitError("");
    try {
      await onSave({
        title,
        content: values.content,
        subject_id: values.subjectId || null,
      });
      onClose();
    } catch (error) {
      console.error("Notes save failed:", error);

      setSubmitError(
        error?.message || "Couldn't save this note. Please try again.",
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
        aria-labelledby="note-modal-title"
      >
        <header className={styles.modalHeader}>
          <div>
            <h2 id="note-modal-title" className={styles.modalTitle}>
              {isEdit ? "Edit note" : "New note"}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEdit
                ? "Update the details of this note."
                : "Write down what you've learned."}
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
            <label htmlFor="note-title" className={styles.label}>
              Title
            </label>
            <input
              id="note-title"
              ref={titleRef}
              type="text"
              className={`${styles.input} ${titleError ? styles.inputInvalid : ""}`}
              placeholder="e.g. Newton's Laws, Key Formulas"
              value={values.title}
              maxLength={TITLE_MAX}
              onChange={(event) => update("title", event.target.value)}
              aria-required="true"
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? "note-title-error" : undefined}
              disabled={saving}
            />
            {titleError && (
              <p
                id="note-title-error"
                className={styles.fieldError}
                role="alert"
              >
                {titleError}
              </p>
            )}
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
            <label htmlFor="note-content" className={styles.label}>
              Content <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="note-content"
              className={styles.textarea}
              placeholder="Write your note here"
              rows={7}
              value={values.content}
              maxLength={CONTENT_MAX}
              onChange={(event) => update("content", event.target.value)}
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

export default function Notes() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectCatalog, setSubjectCatalog] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState(false);
  const [userId, setUserId] = useState(null);
  const [view, setView] = useState("grid");
  const [modal, setModal] = useState(null);

  const loadNotes = useCallback(async () => {
    setStatus("loading");
    setSubjectsLoading(true);
    setSubjectsError(false);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setUserId(null);
      setNotes([]);
      setSubjects([]);
      setSubjectCatalog([]);
      setSubjectsLoading(false);
      setStatus("signed-out");
      return;
    }

    setUserId(user.id);

    const [notesResult, subjectsResult, catalogResult] = await Promise.all([
      supabase.from("notes").select("*").eq("user_id", user.id),
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
    setSubjectsError(Boolean(subjectsResult.error));
    setSubjectsLoading(false);

    if (notesResult.error) {
      setNotes([]);
      setStatus("error");
      return;
    }

    setNotes(sortByRecent(notesResult.data ?? []));
    setStatus("ready");
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

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
    const payload = {
      ...values,
      updated_at: new Date().toISOString(),
    };

    if (modal?.note) {
      const { data, error } = await supabase
        .from("notes")
        .update(payload)
        .eq("id", modal.note.id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      setNotes((current) =>
        sortByRecent(
          current.map((note) => (note.id === data.id ? data : note)),
        ),
      );
    } else {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          ...payload,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      setNotes((current) => sortByRecent([data, ...current]));
    }
  }

  const canAdd = status === "ready";
  const openCreate = () => setModal({ note: null });

  function renderBody() {
    if (status === "loading") {
      return (
        <div className={styles.state} role="status">
          <LoaderCircle size={22} className={styles.spin} />
          <p>Loading your notes...</p>
        </div>
      );
    }

    if (status === "signed-out") {
      return (
        <div className={styles.state}>
          <NotebookPen size={26} />
          <p>Sign in to see your notes. They are private to your account.</p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className={styles.state} role="alert">
          <CircleAlert size={26} />
          <p>
            We couldn't load your notes. Check your connection and try again.
          </p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={loadNotes}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        </div>
      );
    }

    if (notes.length === 0) {
      return (
        <div className={styles.state}>
          <NotebookPen size={26} />
          <p>
            You have no notes yet. Write your first one to start building your
            study library.
          </p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreate}
          >
            <Plus size={16} aria-hidden="true" />
            New Note
          </button>
        </div>
      );
    }

    return (
      <ul className={`${styles.grid} ${view === "list" ? styles.list : ""}`}>
        {notes.map((note) => {
          const subject = note.subject_id
            ? subjectsById.get(note.subject_id)
            : null;
          const subjectName = subject?.name ?? note.subject;
          const cardStyle = subject?.color
            ? { "--note-color": subject.color }
            : undefined;

          return (
            <li key={note.id}>
              <button
                type="button"
                className={styles.card}
                style={cardStyle}
                onClick={() => setModal({ note })}
              >
                {subjectName && (
                  <span className={styles.subjectPill}>{subjectName}</span>
                )}
                <h2 className={styles.cardTitle}>{note.title}</h2>
                <p className={styles.cardPreview}>{note.content}</p>
                <span className={styles.cardMeta}>
                  <Clock size={12} aria-hidden="true" />
                  Edited {timeAgo(note.updated_at ?? note.created_at)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
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
            <span className={styles.crumbCurrent}>Notes</span>
          </nav>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() =>
              setView((current) => (current === "grid" ? "list" : "grid"))
            }
            aria-label={
              view === "grid" ? "Switch to list view" : "Switch to grid view"
            }
          >
            {view === "grid" ? <List size={18} /> : <LayoutGrid size={18} />}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreate}
            disabled={!canAdd}
          >
            <Plus size={16} aria-hidden="true" />
            New Note
          </button>
        </div>
      </header>

      {renderBody()}

      {modal && (
        <NoteModal
          key={modal.note?.id ?? "new"}
          note={modal.note}
          subjects={subjects}
          subjectCatalog={subjectCatalog}
          subjectsLoading={subjectsLoading}
          subjectsError={subjectsError}
          onAddSubject={handleAddSubject}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
