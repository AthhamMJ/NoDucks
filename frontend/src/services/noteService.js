import api from "./api";

const formatNote = (note) => ({
  id: note.id || note._id,
  _id: note._id,
  title: note.title,
  description: note.description || "",
  subject_id: note.subject || null,
  createdAt: note.createdAt,
  updatedAT: note.updatedAT,
});

const toBackendNote = (data) => {
  const payload = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.subject_id !== undefined) payload.subject = data.subject_id || null;
  if (data.subject !== undefined) payload.subject = data.subject || null;
  return payload;
};

const formatSubject = (subject) => ({
  id: subject.id || subject._id,
  _id: subject._id,
  name: subject.name,
  color: subject.color,
  catalog_id: subject.catalog || null,
});
const formatCatalog = (item) => ({
  id: item.id || item._id,
  _id: item._id,
  name: item.name,
  default_color: item.defaultColor || item.default_color,
});

export const fetchNotes = async () => {
  const { data } = await api.get("/api/notes");
  const notes = Array.isArray(data.notes) ? data.notes.map(formatNote) : [];
  return { notes };
};

export const createNote = async (noteData) => {
  const body = toBackendNote(noteData);
  const { data } = await api.post("/api/notes", body);
  return { note: formatNote(data.note) };
};

export const updateNote = async (id, noteData) => {
  const body = toBackendNote(noteData);
  const { data } = await api.patch(`/api/notes/${id}`, body);
  return { note: formatNote(data.note) };
};

export const deleteNote = async (id) => {
  const { data } =await api.delete(`/api/notes/${id}`);
  return data
};

export const fetchSubjects = async () => {
  const { data } = await api.get("/api/subjects");
  const subjects = Array.isArray(data.subjects)
    ? data.subjects.map(formatSubject)
    : [];
  return { subjects };
};

export const fetchSubjectCatalog = async () => {
  const { data } = await api.get("/api/subjects/catalog");
  const catalog = Array.isArray(data.catalog)
    ? data.catalog.map(formatCatalog)
    : [];
  return { catalog };
};

export const addSubject = async ({ name, catalog_id, catalogId, color }) => {
  const body = {
    name,
    catalogId: catalogId || catalog_id || null,
    color,
  };
  const { data } = await api.post("/api/subjects", body);
  return { subject: formatSubject(data.subject) };
};
