# NoDucks API Guide

> **Collection:** NoDucks API Tests  
> **Base URL:** `http://localhost:5000`  
> **Last Updated:** November 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Environment Setup](#2-environment-setup)
3. [Running the Collection in Order](#3-running-the-collection-in-order)
4. [Endpoint Reference](#4-endpoint-reference)
5. [Auth Flow & Token Auto-Capture](#5-auth-flow--token-auto-capture)
6. [AI / Tutor Endpoints & Quota Limits](#6-ai--tutor-endpoints--quota-limits)
7. [Admin Section Notes](#7-admin-section-notes)

---

## 1. Project Overview

The **NoDucks** backend is a RESTful API built to power a student productivity and AI-tutoring application. It provides endpoints for:

- **User authentication** — registration, login, profile management
- **Subjects** — personal subject tracking with an optional catalog
- **Tasks** — task management with priority levels and due dates
- **Notes** — note-taking linked to subjects
- **Lessons** — AI-generated lessons with chat history
- **Tutor** — AI-powered lesson generation, quiz creation, and follow-up chat
- **Updates** — feature update announcements
- **Admin** — dashboard stats, user management, app settings, and quota control

All protected endpoints require a valid JWT bearer token passed via the `Authorization` header (automatically handled by the collection using the `{{authToken}}` variable).

---

## 2. Environment Setup

The collection relies on a set of environment variables. Before running any requests, configure your active environment with the following values:

| Variable | Description | Default / Notes |
|---|---|---|
| `baseUrl` | Root URL of the backend server | `http://localhost:5000` |
| `authToken` | JWT token for regular user auth | **Auto-set** by the Login request |
| `adminToken` | JWT token for admin user auth | **Auto-set** by Admin Login request |
| `userId` | ID of the authenticated user | **Auto-set** by Login request |
| `subjectId` | ID of a created subject | **Auto-set** by Create Subject |
| `taskId` | ID of a created task | **Auto-set** by Create Task |
| `noteId` | ID of a created note | **Auto-set** by Create Note |
| `lessonId` | ID of a lesson | **Auto-set** by List Lessons or Generate Lesson |
| `updateId` | ID of a feature update | **Auto-set** by Create Feature Update |

### Steps to configure

1. Open the **Environments** tab in Postman.
2. Select (or create) your environment (e.g. `NoDucks Local`).
3. Set `baseUrl` to `http://localhost:5000` (or your deployed URL).
4. Leave all other variables blank — they will be **automatically populated** as you run the collection in order.
5. Make sure this environment is set as **active** before sending any requests.

> **Tip:** If you are testing against a deployed environment, update `baseUrl` to the production or staging URL accordingly.

---

## 3. Running the Collection in Order

The collection is designed to be run **sequentially**. Each request may depend on variables set by a previous one (e.g. `authToken` must exist before any protected endpoint is called).

Follow this recommended execution order:

### Step 1 — Health Check
1. `GET /api/health` — Verify the server and database are reachable.

### Step 2 — Auth Setup
2. `POST /api/auth/register` — Create a new user account.
3. `POST /api/auth/login` — Log in; this **auto-saves** `authToken` and `userId`.
4. `GET /api/auth/me` — Confirm the token works and profile is returned.

### Step 3 — Subjects
5. `GET /api/subjects/catalog` — Browse available subject suggestions.
6. `POST /api/subjects` — Create a subject; **auto-saves** `subjectId`.
7. `GET /api/subjects` — List your subjects.

### Step 4 — Tasks
8. `POST /api/tasks` — Create a task; **auto-saves** `taskId`.
9. `GET /api/tasks` — List tasks.
10. `PATCH /api/tasks/:id` — Update the task.
11. `DELETE /api/tasks/:id` — Delete the task.

### Step 5 — Notes
12. `POST /api/notes` — Create a note; **auto-saves** `noteId`.
13. `GET /api/notes` — List notes.
14. `PATCH /api/notes/:id` — Update the note.
15. `DELETE /api/notes/:id` — Delete the note.

### Step 6 — Tutor / AI
16. `GET /api/tutor/usage` — Check current AI quota usage.
17. `POST /api/tutor/generate-lesson` — Generate an AI lesson; **auto-saves** `lessonId`.
18. `POST /api/tutor/chat` — Send a follow-up chat message.
19. `POST /api/tutor/generate-quiz` — Generate a quiz for the lesson.

### Step 7 — Lessons
20. `GET /api/lessons` — List lesson history.
21. `GET /api/lessons/:id` — Get full lesson content.
22. `GET /api/lessons/:id/chat` — Get lesson chat messages.
23. `DELETE /api/lessons/:id` — Delete lesson and its chat.

### Step 8 — Updates
24. `GET /api/updates/latest` — Get the latest feature update.

### Step 9 — Admin (requires admin account)
25. Log in with an admin account to **auto-save** `adminToken`.
26. Run Admin endpoints as needed (see [Admin Section Notes](#7-admin-section-notes)).

> **Using the Collection Runner:** You can also run the entire collection automatically via **Run Collection** in Postman. Ensure the correct environment is selected and requests are in the order above.

---

## 4. Endpoint Reference

### Health

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/health` | Server + DB health check | No |

---

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user (name, email, password) | No |
| POST | `/api/auth/login` | Login — returns JWT token (auto-saved to `{{authToken}}`) | No |
| GET | `/api/auth/me` | Get current user profile | ✅ Yes |
| PATCH | `/api/auth/me` | Update name and preferences | ✅ Yes |
| DELETE | `/api/auth/me` | Delete own account | ✅ Yes |

---

### Subjects — `/api/subjects`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/subjects` | List user's subjects | ✅ Yes |
| GET | `/api/subjects/catalog` | List subject catalog suggestions | ✅ Yes |
| POST | `/api/subjects` | Create subject (name, optional catalogId, optional color) | ✅ Yes |

---

### Tasks — `/api/tasks`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/tasks` | List user's tasks | ✅ Yes |
| POST | `/api/tasks` | Create task (title, priority: low/medium/high, dueDate, subject) | ✅ Yes |
| PATCH | `/api/tasks/:id` | Update task fields | ✅ Yes |
| DELETE | `/api/tasks/:id` | Delete task | ✅ Yes |

---

### Notes — `/api/notes`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/notes` | List user's notes | ✅ Yes |
| POST | `/api/notes` | Create note (title, description, subject) | ✅ Yes |
| PATCH | `/api/notes/:id` | Update note | ✅ Yes |
| DELETE | `/api/notes/:id` | Delete note | ✅ Yes |

---

### Lessons — `/api/lessons`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/lessons` | List lesson history | ✅ Yes |
| GET | `/api/lessons/:id` | Get full lesson content | ✅ Yes |
| GET | `/api/lessons/:id/chat` | Get lesson chat messages | ✅ Yes |
| DELETE | `/api/lessons/:id` | Delete lesson + chat | ✅ Yes |

---

### Tutor (AI) — `/api/tutor`

| Method | Endpoint | Description | Auth Required | Quota Check |
|---|---|---|---|---|
| GET | `/api/tutor/usage` | Get current AI usage stats | ✅ Yes | No |
| POST | `/api/tutor/generate-lesson` | Generate AI lesson (topic, interest) | ✅ Yes | ✅ Yes |
| POST | `/api/tutor/chat` | Chat follow-up (lessonId, message) | ✅ Yes | ✅ Yes |
| POST | `/api/tutor/generate-quiz` | Generate quiz (lessonId) | ✅ Yes | ✅ Yes |

---

### Updates — `/api/updates`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/updates/latest` | Get latest feature update | ✅ Yes |

---

### Admin — `/api/admin`

| Method | Endpoint | Description | Auth Required | Admin Role |
|---|---|---|---|---|
| GET | `/api/admin/overview` | Dashboard overview stats | ✅ Yes | ✅ Yes |
| GET | `/api/admin/users` | List all users | ✅ Yes | ✅ Yes |
| PATCH | `/api/admin/users/:id` | Update a user | ✅ Yes | ✅ Yes |
| GET | `/api/admin/settings` | Get app settings | ✅ Yes | ✅ Yes |
| PATCH | `/api/admin/settings/quotas` | Update AI quotas (lesson, chat, quiz) | ✅ Yes | ✅ Yes |
| PATCH | `/api/admin/settings/general` | Update general settings (e.g. maintenanceMode) | ✅ Yes | ✅ Yes |
| GET | `/api/admin/settings/admins` | List admin users | ✅ Yes | ✅ Yes |
| GET | `/api/admin/updates` | List all feature updates | ✅ Yes | ✅ Yes |
| POST | `/api/admin/updates` | Create feature update (title, description, version) | ✅ Yes | ✅ Yes |
| DELETE | `/api/admin/updates/:id` | Delete feature update | ✅ Yes | ✅ Yes |

---

## 5. Auth Flow & Token Auto-Capture

The NoDucks API uses **JWT (JSON Web Token)** for authentication. Here is how the auth flow works within the collection:

### How tokens are captured automatically

The **Login** request (`POST /api/auth/login`) includes a **post-response script** that extracts the token from the response body and saves it to the environment:

```javascript
// Example of what the Login post-response script does:
const response = pm.response.json();
pm.environment.set("authToken", response.token);
pm.environment.set("userId", response.user._id);
```

Similarly, an **Admin Login** request saves the token to `{{adminToken}}`.

### How tokens are used

All protected requests in the collection use Bearer Token authentication, referencing `{{authToken}}`:

```
Authorization: Bearer {{authToken}}
```

Admin endpoints use `{{adminToken}}` instead.

### Token lifecycle

- Tokens are valid for the duration configured on the server (typically 7 days or until the server restarts in development).
- If you receive a `401 Unauthorized` response, re-run the Login request to refresh `{{authToken}}`.
- Deleting your account (`DELETE /api/auth/me`) will invalidate the token — you will need to register and log in again.

---

## 6. AI / Tutor Endpoints & Quota Limits

All AI-powered endpoints under `/api/tutor` are subject to **quota enforcement**. This prevents excessive AI usage per user.

### Quota-controlled endpoints

| Endpoint | Quota Type |
|---|---|
| `POST /api/tutor/generate-lesson` | Lesson generation quota |
| `POST /api/tutor/chat` | Chat message quota |
| `POST /api/tutor/generate-quiz` | Quiz generation quota |

### Checking your quota

Use `GET /api/tutor/usage` to retrieve your current AI usage stats before running AI requests. This endpoint does **not** consume quota.

### What happens when quota is exceeded

When a user exceeds their quota, the API will return an error response (typically `429 Too Many Requests` or a custom quota error). The request will not be processed.

### Quota management (Admin only)

Admins can update quota limits for all users via:

```
PATCH /api/admin/settings/quotas
```

Example request body:
```json
{
  "lessonQuota": 10,
  "chatQuota": 50,
  "quizQuota": 10
}
```

### Tips for testing AI endpoints

- Always check `GET /api/tutor/usage` first to confirm you have remaining quota.
- Generate a lesson before attempting chat or quiz — both require a valid `{{lessonId}}`.
- The `lessonId` variable is **auto-set** by either `POST /api/tutor/generate-lesson` or `GET /api/lessons`.

---

## 7. Admin Section Notes

All endpoints under `/api/admin` require **both** a valid JWT token **and** the `admin` role on the user account.

### Setting up admin access

1. Ensure you have an admin user account on the server (created directly in the database or via a seed script).
2. Log in with the admin account using the Login request — the token will be saved to `{{adminToken}}`.
3. Admin requests in the collection should be configured to use `{{adminToken}}` as the Bearer token.

### Admin capabilities

| Category | What you can do |
|---|---|
| **Overview** | View dashboard stats (user count, lesson count, etc.) |
| **Users** | List all users, update any user's details |
| **Settings** | Read and update app-wide settings |
| **Quotas** | Adjust per-user AI quota limits for lessons, chat, and quizzes |
| **General Settings** | Toggle maintenance mode and other global flags |
| **Admin List** | View which users have admin privileges |
| **Feature Updates** | Create, list, and delete feature update announcements |

### Feature Updates workflow

Feature updates are announcements shown to users in the app. The admin workflow is:

1. `POST /api/admin/updates` — Create a new update (title, description, version). The `updateId` is **auto-saved**.
2. `GET /api/admin/updates` — List all updates.
3. `DELETE /api/admin/updates/:id` — Remove an update using `{{updateId}}`.

Users can view the latest update via `GET /api/updates/latest`.

### Security reminder

- Never expose `{{adminToken}}` in shared environments or public workspaces.
- Admin tokens should be stored in a **private** or **personal** environment, not a shared team environment.

---

*This document was generated for the NoDucks API Tests collection. Keep it updated as new endpoints are added.*
