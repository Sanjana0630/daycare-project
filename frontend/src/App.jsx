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
const AdminGuard = ({ children }) => {
  const role = localStorage.getItem('role');
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const ParentGuard = ({ children }) => {
  const role = localStorage.getItem('role');
  if (role !== 'parent') return <Navigate to="/dashboard" replace />;
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
            <DashboardLayout>
              <Routes>
                {/* Fallback Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Admin/Staff Specific Routes */}
                <Route path="/admin/dashboard" element={<AdminGuard><Dashboard /></AdminGuard>} />
                <Route path="/admin/children/add" element={<AdminGuard><AddChild /></AdminGuard>} />
                <Route path="/children" element={<AdminGuard><Children /></AdminGuard>} />
                <Route path="/staff" element={<AdminGuard><Staff /></AdminGuard>} />
                <Route path="/admin/staff" element={<AdminGuard><Staff /></AdminGuard>} />
                <Route path="/admin/staff/add" element={<AdminGuard><AddStaff /></AdminGuard>} />
                <Route path="/admin/staff/edit/:id" element={<AdminGuard><EditStaff /></AdminGuard>} />
                <Route path="/admin/attendance/staff" element={<AdminGuard><StaffAttendance /></AdminGuard>} />
                <Route path="/admin/attendance/children" element={<AdminGuard><ChildrenAttendance /></AdminGuard>} />
                <Route path="/parents" element={<AdminGuard><div className="p-8 text-gray-500 font-medium">Parents Management</div></AdminGuard>} />
                <Route path="/attendance" element={<AdminGuard><div className="p-8 text-gray-500 font-medium">Admin Attendance</div></AdminGuard>} />
                <Route path="/fees" element={<AdminGuard><div className="p-8 text-gray-500 font-medium">Admin Fees</div></AdminGuard>} />
                <Route path="/reports" element={<AdminGuard><div className="p-8 text-gray-500 font-medium">Admin Reports</div></AdminGuard>} />
                <Route path="/settings" element={<AdminGuard><div className="p-8 text-gray-500 font-medium">Admin Settings</div></AdminGuard>} />

                {/* Staff Dashboard */}
                <Route path="/staff/dashboard" element={<StaffDashboard />} />

                {/* Parent Specific Routes */}
                <Route path="/parent/dashboard" element={<ParentGuard><ParentDashboard /></ParentGuard>} />
                <Route path="/parent/child" element={<ParentGuard><Placeholder title="My Child Details" /></ParentGuard>} />
                <Route path="/parent/attendance" element={<ParentGuard><Placeholder title="Attendance History" /></ParentGuard>} />
                <Route path="/parent/activities" element={<ParentGuard><Placeholder title="Daily Activities" /></ParentGuard>} />
                <Route path="/parent/fees" element={<ParentGuard><Placeholder title="Fee Records" /></ParentGuard>} />
                <Route path="/parent/notifications" element={<ParentGuard><Placeholder title="Notifications" /></ParentGuard>} />
                <Route path="/parent/settings" element={<ParentGuard><Placeholder title="Parent Settings" /></ParentGuard>} />

                {/* Catch-all or Redirects */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
