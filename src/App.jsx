import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
// import AICoaching from './pages/AICoaching/AICoaching';
// import Tasks from './pages/Tasks/Tasks';
// import Notes from './pages/Notes/Notes';
// import Settings from './pages/Settings/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* <Route path="ai-coaching" element={<AICoaching />} /> */}
        {/* <Route path="tasks" element={<Tasks />} />
        <Route path="notes" element={<Notes />} />
        <Route path="settings" element={<Settings />} /> */}
      </Route>
    </Routes>
  );
}