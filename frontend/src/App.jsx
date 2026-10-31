import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import Tasks from "./pages/Tasks/Tasks";
<<<<<<< HEAD:src/App.jsx
import Notes from './pages/Notes/Notes';
// import AICoaching from './pages/AICoaching/AICoaching';

// import Settings from './pages/Settings/Settings';
=======
import Admin from "./pages/Admin/Admin";
import AITutor from "./pages/AITutor/AITutor";
import Notes from "./pages/Notes/Notes";
import Setting from "./pages/Setting/Setting";
>>>>>>> 6c2320ac0d20f01f3135922aa54fe7461a18bb5d:frontend/src/App.jsx

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ai-coaching" element={<AITutor />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="notes" element={<Notes />} />
<<<<<<< HEAD:src/App.jsx
          {/* <Route path="settings" element={<Settings />} /> */}
=======
          <Route path="settings" element={<Setting />} />
>>>>>>> 6c2320ac0d20f01f3135922aa54fe7461a18bb5d:frontend/src/App.jsx
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      {" "}
      <AppRoutes />{" "}
    </AuthProvider>
  );
}
