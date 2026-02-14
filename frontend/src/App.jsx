import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import StaffDashboard from './pages/StaffDashboard';
import ParentDashboard from './pages/ParentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Authentication Routes - No DashboardLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes - Wrapped in DashboardLayout */}
        <Route
          path="/*"
          element={
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                {/* Placeholder routes for other links */}
                <Route path="/children" element={<div className="p-8 text-gray-500 font-medium">Children Management (Coming Soon)</div>} />
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
