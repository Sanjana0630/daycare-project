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
import StaffApproval from './pages/StaffApproval';
import EditStaff from './pages/EditStaff';
import StaffAttendance from './pages/StaffAttendance';
import ChildrenAttendance from './pages/ChildrenAttendance';
import MyChildren from './pages/MyChildren';
import StaffMarkAttendance from './pages/StaffMarkAttendance';
import StaffActivities from './pages/StaffActivities';
import StaffProfile from './pages/StaffProfile';

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

  if (!allowedRoles.includes(role)) {
    // Redirect to respective dashboard based on role if unauthorized
    const redirectPath = role === 'admin' ? '/dashboard' :
      role === 'staff' ? '/staff/dashboard' :
        role === 'parent' ? '/parent/dashboard' : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes - Wrapped in DashboardLayout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  {/* Fallback Dashboard - Visible to all logged in users */}
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Admin Specific Routes */}
                  <Route path="/admin/dashboard" element={<RoleBasedRoute allowedRoles={["admin"]}><Dashboard /></RoleBasedRoute>} />
                  <Route path="/admin/children/add" element={<RoleBasedRoute allowedRoles={["admin"]}><AddChild /></RoleBasedRoute>} />
                  <Route path="/children" element={<RoleBasedRoute allowedRoles={["admin"]}><Children /></RoleBasedRoute>} />
                  <Route path="/staff" element={<RoleBasedRoute allowedRoles={["admin"]}><Staff /></RoleBasedRoute>} />
                  <Route path="/admin/staff" element={<RoleBasedRoute allowedRoles={["admin"]}><Staff /></RoleBasedRoute>} />
                  <Route path="/admin/staff/approve" element={<RoleBasedRoute allowedRoles={["admin"]}><StaffApproval /></RoleBasedRoute>} />
                  <Route path="/admin/attendance/staff" element={<RoleBasedRoute allowedRoles={["admin"]}><StaffAttendance /></RoleBasedRoute>} />
                  <Route path="/admin/attendance/children" element={<RoleBasedRoute allowedRoles={["admin"]}><ChildrenAttendance /></RoleBasedRoute>} />
                  <Route path="/parents" element={<RoleBasedRoute allowedRoles={["admin"]}><div className="p-8 text-gray-500 font-medium">Parents Management</div></RoleBasedRoute>} />
                  <Route path="/attendance" element={<RoleBasedRoute allowedRoles={["admin"]}><div className="p-8 text-gray-500 font-medium">Admin Attendance</div></RoleBasedRoute>} />
                  <Route path="/fees" element={<RoleBasedRoute allowedRoles={["admin"]}><div className="p-8 text-gray-500 font-medium">Admin Fees</div></RoleBasedRoute>} />
                  <Route path="/reports" element={<RoleBasedRoute allowedRoles={["admin"]}><div className="p-8 text-gray-500 font-medium">Admin Reports</div></RoleBasedRoute>} />
                  <Route path="/settings" element={<RoleBasedRoute allowedRoles={["admin"]}><div className="p-8 text-gray-500 font-medium">Admin Settings</div></RoleBasedRoute>} />

                  {/* Staff Routes */}
                  <Route path="/staff/dashboard" element={<RoleBasedRoute allowedRoles={["staff", "admin"]}><StaffDashboard /></RoleBasedRoute>} />
                  <Route path="/staff/my-children" element={<RoleBasedRoute allowedRoles={["staff"]}><MyChildren /></RoleBasedRoute>} />
                  <Route path="/staff/attendance" element={<RoleBasedRoute allowedRoles={["staff"]}><StaffMarkAttendance /></RoleBasedRoute>} />
                  <Route path="/staff/activities" element={<RoleBasedRoute allowedRoles={["staff"]}><StaffActivities /></RoleBasedRoute>} />
                  <Route path="/staff/settings" element={<RoleBasedRoute allowedRoles={["staff"]}><StaffProfile /></RoleBasedRoute>} />

                  {/* Parent Specific Routes */}
                  <Route path="/parent/dashboard" element={<RoleBasedRoute allowedRoles={["parent"]}><ParentDashboard /></RoleBasedRoute>} />
                  <Route path="/parent/child" element={<RoleBasedRoute allowedRoles={["parent"]}><Placeholder title="My Child Details" /></RoleBasedRoute>} />
                  <Route path="/parent/attendance" element={<RoleBasedRoute allowedRoles={["parent"]}><Placeholder title="Attendance History" /></RoleBasedRoute>} />
                  <Route path="/parent/activities" element={<RoleBasedRoute allowedRoles={["parent"]}><Placeholder title="Daily Activities" /></RoleBasedRoute>} />
                  <Route path="/parent/fees" element={<RoleBasedRoute allowedRoles={["parent"]}><Placeholder title="Fee Records" /></RoleBasedRoute>} />
                  <Route path="/parent/notifications" element={<RoleBasedRoute allowedRoles={["parent"]}><Placeholder title="Notifications" /></RoleBasedRoute>} />
                  <Route path="/parent/settings" element={<RoleBasedRoute allowedRoles={["parent"]}><Placeholder title="Parent Settings" /></RoleBasedRoute>} />

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
