import { apiCall } from "./api";

//Helping tool for Normalize the MONGODB tasks - UI formating
const formatTask = (task) => ({
  id: task.id || task._id,
  _id: task._id,
  title: task.title,
  description: task.description || "",
  priority: task.priority || "medium",
  is_completed: Boolean(task.isCompleted),
  due_date: task.dueDate ? String(task.dueDate).slice(0, 10) : "",
  subject_id: task.subject || null,
  createdAt: task.createdAt,
  updatedAT: task.updatedAT,
});

//Helping for Normalize UI Format -> backend MONGO payload

const toBackendTask = (data) => {
  const payload = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.priority !== undefined) payload.priority = data.priority;
  if (data.due_date !== undefined) payload.dueDate = data.due_date || null;
  if (data.dueDate !== undefined) payload.dueDate = data.dueDate || null;
  if (data.subject_id !== undefined) payload.subject = data.subject_id || null;
  if (data.subject !== undefined) payload.subject = data.subject || null;
  if (data.is_completed !== undefined) payload.isCompleted = data.is_completed;
  if (data.isCompleted !== undefined) payload.isCompleted = data.isCompleted;
  return payload;
};

//Helper for Mormalize Subject
const formatSubject = (subject) => ({
  id: subject.id || subject._id,
  _id: subject._id,
  name: subject.name,
  color: subject.color,
  catalog_id: subject.catalog || null,
});

// Helper: Normalize Subject Catalog format
const formatCatalog = (item) => ({
  id: item.id || item._id,
  _id: item._id,
  name: item.name,
  defalut_color: item.defalutColor || item.defalut_color,
});

// Tasks API

export const fetchTasks = async () => {
  const data = await apiCall("/api/tasks"); //backend will answer for this /tasks api
  const tasks = Array.isArray(data.tasks) ? data.tasks.map(formatTask) : [];
  return { tasks };
};

export const createTask = async (taskData) => {
  const body = toBackendTask(taskData);
  const data = await apiCall("/api/tasks", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { task: formatTask(data.task) };
};

export const updateTask = async (id, taskData) => {
  const body = toBackendTask(taskData);
  const data = await apiCall(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return { task: formatTask(data.task) };
};

export const toggleTask = async (id, isCompleted) => {
  return updateTask(id, { is_completed: isCompleted });
};

export const deleteTask = async (id) => {
  return await apiCall(`/api/tasks/${id}`, {
    method: "DELETE",
  });
};

//subject API

export const fetchSubjects = async () => {
  const data = await apiCall("/api/subjects");
  const subjects = Array.isArray(data.subjects)
    ? data.subjects.map(formatSubject)
    : [];
  return { subjects };
};

export const fetchSubjectCatalog = async () => {
  const data = await apiCall("/api/subjects/catalog");
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
  const data = await apiCall("/api/subjects", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { subject: formatSubject(data.subject) };
};
