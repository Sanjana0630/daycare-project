import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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
                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/children/add" element={<AddChild />} />
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                {/* Real routes for links */}
                <Route path="/children" element={<Children />} />
                {/* Staff Routes */}
                <Route path="/staff" element={<Staff />} />
                <Route path="/admin/staff" element={<Staff />} />
                <Route path="/admin/staff/add" element={<AddStaff />} />
                <Route path="/admin/staff/edit/:id" element={<EditStaff />} />

                <Route path="/parents" element={<div className="p-8 text-gray-500 font-medium">Parents Module (Coming Soon)</div>} />
                <Route path="/attendance" element={<div className="p-8 text-gray-500 font-medium">Attendance Module (Coming Soon)</div>} />
                <Route path="/fees" element={<div className="p-8 text-gray-500 font-medium">Fees Module (Coming Soon)</div>} />
                <Route path="/reports" element={<div className="p-8 text-gray-500 font-medium">Reports Module (Coming Soon)</div>} />
                <Route path="/settings" element={<div className="p-8 text-gray-500 font-medium">Settings Module (Coming Soon)</div>} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
