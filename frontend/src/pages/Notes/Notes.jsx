import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, LayoutGrid, List, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  CUSTOM_SUBJECT_COLORS,
  SUBJECT_COLUMNS,
} from "./constants/notesConstants";
import { cleanName, sortByName, sortByRecent } from "./utils/notesUtils";
import NotesStates from "./components/NotesStates/NotesStates";
import NotesItem from "./components/NotesItem/NotesItem";
import NotesModal from "./components/NotesModal/NotesModal";
import styles from "./Notes.module.css";

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
    } = await mongoose.auth.getUser();

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

  async function handleAddSubject({ name, catalogId = null, color }) {
    const clean = cleanName(name);
    if (!clean) throw new Error("Subject name is required.");
    const key = clean.toLowerCase();

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
        />
      )}
    </div>
  );
}
