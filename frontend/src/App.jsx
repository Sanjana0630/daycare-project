import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import StaffDashboard from './pages/StaffDashboard';
import ParentDashboard from './pages/ParentDashboard';
import Home from './pages/Home';
import AddChild from './pages/AddChild';
import Children from './pages/Children';
import Staff from './pages/Staff';
import AddStaff from './pages/AddStaff';
import EditStaff from './pages/EditStaff';
import StaffAttendance from './pages/StaffAttendance';
import ChildrenAttendance from './pages/ChildrenAttendance';

// Security Guards
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) {
    // If unauthorized, redirect to their respective dashboard or a safe fallback
    const fallback = role === 'admin' ? '/admin/dashboard' :
      role === 'staff' ? '/staff/dashboard' :
        role === 'parent' ? '/parent/dashboard' : '/login';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

// Component to redirect logged-in users from auth pages
const LoggedInRedirect = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Redirect to dashboard if already logged in
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Component to redirect /dashboard based on role
const DashboardRedirector = () => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'staff':
      return <Navigate to="/staff/dashboard" replace />;
    case 'parent':
      return <Navigate to="/parent/dashboard" replace />;
    default:
      // Fallback for unknown roles or if role is not set
      return <Navigate to="/login" replace />;
  }
};

const Placeholder = ({ title }) => (
  <div className="p-8 text-center animate-in fade-in duration-500">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 mb-4 border border-purple-100 shadow-sm">
      <div className="animate-pulse">✨</div>
    </div>
    <h2 className="text-2xl font-black text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 max-w-xs mx-auto">This module is currently being optimized for your experience. Check back soon!</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Public Authentication Routes - No DashboardLayout */}
        <Route path="/login" element={<LoggedInRedirect><Login /></LoggedInRedirect>} />
        <Route path="/register" element={<LoggedInRedirect><Register /></LoggedInRedirect>} />

        {/* Protected Dashboard Routes - Wrapped in DashboardLayout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  {/* Fallback/Home Dashboard - Redirects based on role */}
                  <Route path="/dashboard" element={<DashboardRedirector />} />

                  {/* Admin Specific Routes */}
                  <Route path="/admin/*" element={
                    <RoleBasedRoute allowedRoles={['admin']}>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="children/add" element={<AddChild />} />
                        <Route path="staff/add" element={<AddStaff />} />
                        <Route path="staff/edit/:id" element={<EditStaff />} />
                        <Route path="attendance/staff" element={<StaffAttendance />} />
                        <Route path="attendance/children" element={<ChildrenAttendance />} />
                      </Routes>
                    </RoleBasedRoute>
                  } />

                  {/* Flat Admin Routes (for backward compatibility or direct links) */}
                  <Route path="/children" element={<RoleBasedRoute allowedRoles={['admin']}><Children /></RoleBasedRoute>} />
                  <Route path="/staff" element={<RoleBasedRoute allowedRoles={['admin']}><Staff /></RoleBasedRoute>} />
                  <Route path="/parents" element={<RoleBasedRoute allowedRoles={['admin']}><div className="p-8 text-gray-500 font-medium">Parents Management</div></RoleBasedRoute>} />
                  <Route path="/fees" element={<RoleBasedRoute allowedRoles={['admin']}><div className="p-8 text-gray-500 font-medium">Admin Fees</div></RoleBasedRoute>} />
                  <Route path="/reports" element={<RoleBasedRoute allowedRoles={['admin']}><div className="p-8 text-gray-500 font-medium">Admin Reports</div></RoleBasedRoute>} />
                  <Route path="/settings" element={<RoleBasedRoute allowedRoles={['admin']}><div className="p-8 text-gray-500 font-medium">Admin Settings</div></RoleBasedRoute>} />

                  {/* Staff Dashboard */}
                  <Route path="/staff/dashboard" element={
                    <RoleBasedRoute allowedRoles={['staff', 'admin']}>
                      <StaffDashboard />
                    </RoleBasedRoute>
                  } />

                  {/* Parent Specific Routes */}
                  <Route path="/parent/*" element={
                    <RoleBasedRoute allowedRoles={['parent']}>
                      <Routes>
                        <Route path="dashboard" element={<ParentDashboard />} />
                        <Route path="child" element={<Placeholder title="My Child Details" />} />
                        <Route path="attendance" element={<Placeholder title="Attendance History" />} />
                        <Route path="activities" element={<Placeholder title="Daily Activities" />} />
                        <Route path="fees" element={<Placeholder title="Fee Records" />} />
                        <Route path="notifications" element={<Placeholder title="Notifications" />} />
                        <Route path="settings" element={<Placeholder title="Parent Settings" />} />
                      </Routes>
                    </RoleBasedRoute>
                  } />

                  {/* Catch-all or Redirects */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
