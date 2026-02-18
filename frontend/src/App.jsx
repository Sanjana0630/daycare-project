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
                {/* Placeholder routes for remaining links */}
                <Route path="/staff" element={<div className="p-8 text-gray-500 font-medium">Staff Management (Coming Soon)</div>} />
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
