import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, LayoutGrid, List, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  fetchSubjects,
  fetchSubjectCatalog,
  addSubject,
} from "../../services/noteService";
import {
  CUSTOM_SUBJECT_COLORS,
  SUBJECT_COLUMNS,
} from "./constants/notesConstants";
import {
  cleanName,
  isMissingTable,
  sortByName,
  sortByRecent,
} from "./utils/notesUtils";
import NotesStates from "./components/NotesStates/NotesStates";
import NotesItem from "./components/NotesItem/NotesItem";
import NotesModal from "./components/NotesModal/NotesModal";
import styles from "./Notes.module.css";

export default function Notes() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [status, setStatus] = useState("loading");
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectCatalog, setSubjectCatalog] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState(false);
  const [modal, setModal] = useState(null);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [confirmingId, setConfirmingId] = useState(null);


  const loadNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setSubjects([]);
      setSubjectCatalog([]);
      setSubjectsLoading(false);
      setStatus("sign-out");
      return;
    }

    setStatus("loading");
    setSubjectsLoading(true);
    setSubjectsError(false);

    try {
      const [NoteRes, subjectsRes, catalogRes] = await Promise.all([
        fetchNotes(),
        fetchSubjects().catch(() => ({ subjects: [] })),
        fetchSubjectCatalog().catch(() => ({ catalog: [] })),
      ]);

      setNotes(NoteRes.notes ?? []);
      setSubjects(subjectsRes.subjects ?? []);
      setSubjectCatalog(catalogRes.catalog ?? []);
      setSubjectsError(false);
      setSubjectsLoading(false);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load Notes:", error);
      setNotes([]);
      setSubjectsLoading(false);
      setStatus("error");
    }
  }, [user]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  async function handleAddSubject({ name, catalogId = null, color }) {
    const data = await addSubject({ name, catalogId: catalogId, color });
    const newSubject = data.subject ?? data;
    setSubjects((current) => sortByName([...current, newSubject]));
    return newSubject;
  }

  async function handleSave(values) {
    if (modal?.note) {
      const data = await updateNote(modal.note.id, values);
      const updated = data.note ?? data;
      setNotes((current) =>
        current.map((note) => (note.id === updated.id ? updated : note))
      );
    } else {
      const data = await createNote(values);
      const created = data.note ?? data;
      setNotes((current) => [created, ...current]);
    }
  }

  async function handleDelete(noteId) {
    try{
      await deleteNote(noteId);
      //remove the deleted note from the state
      setNotes((current) => current.filter((note) => note.id !== noteId));
      setModal(null)
    }catch(error){
      console.error("Failed to delete Notes", error);
      alert("Could not delete the note. please try again later")
    }
  }

  const canAdd = status === "ready";
  const openCreate = () => setModal({ note: null });

  const [view, setView] = useState("grid");
  
  // Map for fast subject color & name lookup (Memo, Memories)
  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  function renderContent() {
    if (status !== "ready") {
      return (
        <NotesStates
          status={status}
          onReload={loadNotes}
          onOpenCreate={openCreate}
        />
      );
    }

    if (notes.length === 0) {
      return (
        <NotesStates
          status="empty"
          onReload={loadNotes}
          onOpenCreate={openCreate}
        />
      );
    }

    return (
      <ul className={`${styles.grid} ${view === "list" ? styles.list : ""}`}>
        {notes.map((note) => (
          <NotesItem
            key={note.id}
            note={note}
            subject={note.subject_id ? subjectsById.get(note.subject_id) : null}
            onSelect={(selected) => setModal({ note: selected })}
          />
        ))}
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

      {renderContent()}

      {modal && (
        <NotesModal
          key={modal.note?.id ?? "new"}
          note={modal.note}
          subjects={subjects}
          subjectCatalog={subjectCatalog}
          subjectsLoading={subjectsLoading}
          subjectsError={subjectsError}
          onAddSubject={handleAddSubject}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
