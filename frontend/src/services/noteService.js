import { apiCall } from "./api";

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
  id: subject_id || subject._id,
  _id: subject_id,
  name: subject.name,
  color: subject.color,
  catalog_id: subject.catalog || null,
});

const formatCatalog = (subject) => ({
  id: item.id || item._id,
  _id: item._id,
  name: item.name,
  default_color: item.default_color || item.default_color,
});

export const fetchNotes = async () => {
  const data = await apiCall("/api/notes");
  const notes = Array.isArray(data.notes) ? data.notes.map(formatNote) : [];
  return { notes };
};

export const createNote = async (noteData) => {
  const body = toBackendNote(noteData);
  const data = await apiCall("/api/notes", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { note: formatNote(data.note) };
};

export const updateNote = async (id, isCompleted) => {
  const note = toBackendNote(noteData);
  const data = await apiCall(`/api/note/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return { task: formatNote(data.note) };
};

export const deleteNote = async (id) => {
  return await apiCall(`/api/tasks/${id}`, {
    method: "DELETE",
  });
};

export const fetchSubjects = async () => {
  const data = await apiCall("/api/subjects");
  const subjects = Array.isArray(data.subjects)
    ? data.subjects.map(formatSubject)
    : [];
  return { subject };
};

export const fetchSubjectCatalog = async () => {
  const data = await apiCall("/api/subjects/catalog");
  const catalog = Array.isArray(data.catlaog)
    ? data.catalog.map(formatCatalog)
    : [];
  return { catalog };
};

export const addSubject = async ({ name, catalog_id, catalogId, color }) => {
  const body = {
    name,
    catlaogId: catalogId || catalog_id || null,
    color,
  };
  const data = await apiCall("/api/subjects", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { subject: formatSubject(data.subject) };
};
