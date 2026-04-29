import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Pages
import Landing       from './pages/Landing/index.jsx';
import Login         from './pages/Auth/Login.jsx';
import Register      from './pages/Auth/Register.jsx';
import DashboardHome from './pages/Dashboard/Home.jsx';
import Patients      from './pages/Dashboard/Patients.jsx';
import PatientDetail from './pages/Dashboard/PatientDetail.jsx';
import Sessions      from './pages/Dashboard/Sessions.jsx';
import Session       from './pages/Dashboard/Session.jsx';

// Portal Pages
import PortalLayout  from './components/layout/PortalLayout.jsx';
import PortalHome    from './pages/Portal/Home.jsx';
import PortalSessions from './pages/Portal/Sessions.jsx';
import PortalSessionDetail from './pages/Portal/SessionDetail.jsx';
import PortalPractice from './pages/Portal/Practice.jsx';
import PortalProgress from './pages/Portal/Progress.jsx';

// Supervisor Pages
import SupervisorLayout from './components/layout/SupervisorLayout.jsx';
import SupervisorHome from './pages/Supervisor/Home.jsx';
import SupervisorPatients from './pages/Supervisor/Patients.jsx';
import SupervisorDoctors from './pages/Supervisor/Doctors.jsx';
import SupervisorSchedule from './pages/Supervisor/Schedule.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index                element={<DashboardHome />} />
            <Route path="patients"      element={<Patients />} />
            <Route path="patients/:id"  element={<PatientDetail />} />
            <Route path="sessions"      element={<Sessions />} />
            <Route path="sessions/:id"  element={<Session />} />
          </Route>

          {/* Protected portal routes (Caregivers) */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route path="home"          element={<PortalHome />} />
            <Route path="sessions"      element={<PortalSessions />} />
            <Route path="sessions/:id"  element={<PortalSessionDetail />} />
            <Route path="practice"      element={<PortalPractice />} />
            <Route path="progress"      element={<PortalProgress />} />
          </Route>

          {/* Protected supervisor routes */}
          <Route
            path="/supervisor"
            element={
              <ProtectedRoute>
                <SupervisorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="home"          element={<SupervisorHome />} />
            <Route path="patients"      element={<SupervisorPatients />} />
            <Route path="doctors"       element={<SupervisorDoctors />} />
            <Route path="schedule"      element={<SupervisorSchedule />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
