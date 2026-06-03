import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Customer
import Fleet from './pages/customer/Fleet';
import VehicleDetail from './pages/customer/VehicleDetail';
import MyBookings from './pages/customer/MyBookings';
import Settings from './pages/customer/Settings';

// Agency
import AgencyLayout from './pages/agency/AgencyLayout';
import AgencyDashboard from './pages/agency/AgencyDashboard';
import ManageFleet from './pages/agency/ManageFleet';
import BookingRequests from './pages/agency/BookingRequests';
import Pricing from './pages/Pricing';
import AgencyProfile from './pages/agency/AgencyProfile';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAgencies from './pages/admin/ManageAgencies';
import AllBookings from './pages/admin/AllBookings';

// Protected Route
function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/fleet" element={<Fleet />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/vehicle/:id" element={<VehicleDetail />} />

      {/* Customer Protected */}
      <Route path="/my-bookings" element={
        <ProtectedRoute><MyBookings /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><Settings /></ProtectedRoute>
      } />

      {/* Agency Protected */}
      <Route path="/agency" element={
        <ProtectedRoute role="agency"><AgencyLayout /></ProtectedRoute>
      }>
        <Route index element={<AgencyDashboard />} />
        <Route path="fleet" element={<ManageFleet />} />
        <Route path="bookings" element={<BookingRequests />} />
        <Route path="pricing" element={<Pricing isDashboard={true} />} />
        <Route path="profile" element={<AgencyProfile />} />
      </Route>

      {/* Admin Protected */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="agencies" element={<ManageAgencies />} />
        <Route path="bookings" element={<AllBookings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
