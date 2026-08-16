import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import PublicLayout from './components/PublicLayout';

// Public Pages
import HomePage from './pages/HomePage';
import BookingPage from './pages/public/BookingPage';
import CheckoutPage from './pages/public/CheckoutPage';
import TravellerDashboard from './pages/public/TravellerDashboard';
import CheckInPage from './pages/public/CheckInPage';
import BaggagePage from './pages/public/BaggagePage';
import LoginPage from './pages/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import FlightsAdmin from './pages/admin/FlightsAdmin';
import AircraftAdmin from './pages/admin/AircraftAdmin';
import AirlinesAdmin from './pages/admin/AirlinesAdmin';
import GatesAdmin from './pages/admin/GatesAdmin';
import PassengersAdmin from './pages/admin/PassengersAdmin';
import AirportsAdmin from './pages/admin/AirportsAdmin';
import CitiesAdmin from './pages/admin/CitiesAdmin';
import DomainQueriesAdmin from './pages/admin/DomainQueriesAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';
import NotFoundPage from './pages/NotFoundPage';

/**
 * AdminProtectedRoute — strictly requires Admin role.
 */
function AdminProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If authenticated as CLIENT, show role restriction notice
  if (user?.role && user.role !== 'ADMIN') {
    return (
      <div className="page-container" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '2.5rem', borderTop: '4px solid var(--sky-red)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: 'var(--sky-red)' }}>Admin Access Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your account (<strong>{user.username}</strong>) has <code>CLIENT</code> privileges. The Admin Portal is restricted to Administrator accounts.
          </p>
          <a className="btn btn-primary" href="/login?redirect=/admin">
            Log In as Administrator ➔
          </a>
        </div>
      </div>
    );
  }

  return children;
}

/**
 * UserProtectedRoute — requires login before accessing client features.
 */
function UserProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <Routes>
            <Route path="/admin"             element={<AdminDashboard />} />
            <Route path="/admin/flights"     element={<FlightsAdmin />} />
            <Route path="/admin/passengers"  element={<PassengersAdmin />} />
            <Route path="/admin/aircraft"    element={<AircraftAdmin />} />
            <Route path="/admin/airports"    element={<AirportsAdmin />} />
            <Route path="/admin/cities"      element={<CitiesAdmin />} />
            <Route path="/admin/airlines"    element={<AirlinesAdmin />} />
            <Route path="/admin/gates"       element={<GatesAdmin />} />
            <Route path="/admin/queries"     element={<DomainQueriesAdmin />} />
            <Route path="/admin/users"       element={<UsersAdmin />} />
            <Route path="*"                 element={<NotFoundPage />} />
          </Routes>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <PublicLayout>
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/booking"    element={<UserProtectedRoute><BookingPage /></UserProtectedRoute>} />
        <Route path="/checkout"   element={<UserProtectedRoute><CheckoutPage /></UserProtectedRoute>} />
        <Route path="/my-bookings" element={<UserProtectedRoute><TravellerDashboard /></UserProtectedRoute>} />
        <Route path="/check-in"   element={<UserProtectedRoute><CheckInPage /></UserProtectedRoute>} />
        <Route path="/baggage"    element={<UserProtectedRoute><BaggagePage /></UserProtectedRoute>} />
        <Route path="/login"      element={<LoginPage />} />
        <Route path="*"           element={<NotFoundPage />} />
      </Routes>
    </PublicLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
