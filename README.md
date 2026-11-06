# NoDucks

NoDucks is a student-focused learning platform designed to make learning more practical, understandable, and engaging.

Instead of focusing only on memorizing theories and answers, NoDucks helps students move through:

**Plan → Learn → Understand → Practice → Apply → Get Feedback → Improve**

## Current Stack

* React + Vite (Serverless Frontend functions)
* JavaScript (Base language)
* ExpressJS + ES6+ (Backend Server Oriented Function)
* CSS Modules (Standard CSS)

## Development

The project is currently being rebuilt from the ground up with a focus on:

* Clean and scalable React architecture
* Simple, elegant UI
* Responsive design
* Practical learning experiences
* AI-assisted learning features

## Project Status

🚧 **Active development**

The current focus is building the core UI and application structure before connecting the full learning and AI functionality.

## Branches

* `main` → Stable version
* `ui-dev` → UI development and experimentation
* `backend-dev` → Backend development and API testing
* `admin-dev` → Admin feature development
* `mongodb-architecture-v2` → MongoDB Version

## Features

- **Landing page** with theme toggle (dark/light) and Sign In / Get Started modals
- **Authentication** with JWT (register, login, session restore)
- **Home dashboard** with today's focus, subjects, upcoming tasks, streak, and calendar
- **Tasks** with priorities, due dates, and a hybrid subject system
- **Notes** with subject-colored cards and a note editor
- **Subjects** with a global catalog of suggestions and per-user custom subjects
- **Admin dashboard** (role-based) with platform stats and user management
- **AI Coaching** and **Experiment Lab** (planned)
- **Pricing and checkout** (planned, mock payment flow first)

## Tech Stack

**Frontend**
- React + Vite (JavaScript)
- React Router
- CSS Modules, with theme variables in `index.css`
- lucide-react icons

**Backend**
- Node.js + Express (ESM)
- MongoDB + Mongoose
- JWT auth (`jsonwebtoken`, `bcryptjs`)
- `zod` validation, `helmet`, `cors`, `dotenv`
- Deployed on Render

**Planned:** Cloudflare R2 for file storage.

## Folder Structure

```
noducks/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/              # images, SVGs
│   │   ├── components/          # reusable UI
│   │   │   ├── TopBar/
│   │   │   ├── Sidebar/
│   │   │   ├── Calendar/
│   │   │   ├── Welcome/
│   │   │   ├── TaskModal/
│   │   │   ├── TaskItem/
│   │   │   └── TaskStates/
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # AuthProvider + useAuth
│   │   ├── pages/               # one folder per page
│   │   │   ├── Home/
│   │   │   │   ├── Home.jsx
│   │   │   │   └── Home.module.css
│   │   │   ├── Tasks/
│   │   │   ├── Notes/
│   │   │   └── Admin/
│   │   ├── services/            # one file per API area
│   │   │   ├── api.js           # apiCall() wrapper
│   │   │   ├── authService.js
│   │   │   ├── taskServices.js
│   │   │   ├── subjectsService.js
│   │   │   └── notesService.js
│   │   ├── utils/
│   │   │   └── taskUtils.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css            # global styles + theme variables
│   ├── .env                     # VITE_API_URL
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── config/              # db connection
    │   ├── controllers/         # auth, user, task, subject, note, admin
    │   ├── middleware/          # protect (JWT), adminOnly
    │   ├── models/              # User, Task, Subject, SubjectCatalog, Note
    │   ├── routes/              # /api/auth, /tasks, /subjects, /notes, /admin
    │   ├── seeds/               # subject catalog seed script
    │   └── server.js            # entry point
    ├── .env
    └── package.json
```

### Conventions

- Only create a component when it has reusable logic or is used on multiple pages. Otherwise keep it inside the page.
- Every page lives in `pages/<Page>/<Page>.jsx` with a matching `<Page>.module.css`.
- All API calls go through `services/api.js` (`apiCall`), with one service file per API area.
- Colors come from CSS variables in `index.css`; light and dark themes are switched with `[data-theme="dark"]`.
- Icons come from `lucide-react`, with no emoji placeholders.
- Database changes are additive only (no dropping or renaming existing fields).

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas database (or local MongoDB)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

```bash
npm run seed   # seed the subject catalog
npm run dev    # start the API on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev    # start the app on http://localhost:5173
```

## API Overview

| Area | Base route | Notes |
| --- | --- | --- |
| Auth | `/api/auth` | `register`, `login`, `me` |
| Subjects | `/api/subjects` | per-user subjects, plus catalog |
| Tasks | `/api/tasks` | CRUD and toggle |
| Notes | `/api/notes` | CRUD |
| Admin | `/api/admin` | admin-only (`overview`, `users`) |

## Roles

Users have a `role` of `user` (default) or `admin`. Admin routes are protected by `protect` followed by `adminOnly`. Roles are never set from the signup form.

## Roadmap

- [x] Authentication (JWT)
- [x] Tasks, Subjects, Notes APIs
- [x] Admin overview and users endpoints
- [ ] Admin dashboard page
- [ ] AI Coaching
- [ ] Pricing page and mock checkout
- [ ] Cloudflare R2 storage
- [ ] Experiment Lab

## License

TBD
