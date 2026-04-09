import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import ActivityLogs from '../pages/ActivityLogs';
import Barangays from '../pages/Barangays';
import Categories from '../pages/Categories';
import Dashboard from '../pages/Dashboard';
import Documents from '../pages/Documents';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import UploadDocument from '../pages/UploadDocument';
import Users from '../pages/Users';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={(
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/documents/upload"
          element={(
            <ProtectedRoute roles={['admin', 'staff']}>
              <UploadDocument />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/settings"
          element={(
            <ProtectedRoute roles={['admin']}>
              <Settings />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/categories"
          element={(
            <ProtectedRoute roles={['admin']}>
              <Categories />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/barangays"
          element={(
            <ProtectedRoute roles={['admin']}>
              <Barangays />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/users"
          element={(
            <ProtectedRoute roles={['admin']}>
              <Users />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/activity-logs"
          element={(
            <ProtectedRoute roles={['admin']}>
              <ActivityLogs />
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
