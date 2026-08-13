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
 * ProtectedRoute — redirects unauthenticated visitors to /login.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <ProtectedRoute>
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
      </ProtectedRoute>
    );
  }

  return (
    <PublicLayout>
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/booking"    element={<BookingPage />} />
        <Route path="/checkout"   element={<CheckoutPage />} />
        <Route path="/my-bookings" element={<TravellerDashboard />} />
        <Route path="/check-in"   element={<CheckInPage />} />
        <Route path="/baggage"    element={<BaggagePage />} />
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
