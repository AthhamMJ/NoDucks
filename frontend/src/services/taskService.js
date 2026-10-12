import { apiRequest } from "./api";

function getToken() {
  return localStorage.getItem("accessToken");
}

export function fetchTasks() {
  return apiRequest("/api/tasks", {
    accessToken: getToken(),
  });
}

export function createTask(taskData) {
  return apiRequest("/api/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
    accessToken: getToken(),
  });
}

export function updateTask(id, taskData) {
  return apiRequest(`/api/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
    accessToken: getToken(),
  });
}

export function toggleTask(id, isCompleted) {
  return apiRequest(`/api/tasks/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ is_completed: isCompleted }),
    accessToken: getToken(),
  });
}

export function deleteTask(id) {
  return apiRequest(`/api/tasks/${id}`, {
    method: "DELETE",
    accessToken: getToken(),
  });
}

export function fetchSubjects() {
  return apiRequest("/api/subjects", {
    accessToken: getToken(),
  });
}

export function fetchSubjectCatalog() {
  return apiRequest("/api/subjects/catalog", {
    accessToken: getToken(),
  });
}

export function addSubject(subjectData) {
  return apiRequest("/api/subjects", {
    method: "POST",
    body: JSON.stringify(subjectData),
    accessToken: getToken(),
  });
}
