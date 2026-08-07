import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Traveller & Self-Service Pages
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
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          {/* Public Traveller Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/my-bookings" element={<TravellerDashboard />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/baggage" element={<BaggagePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/flights" element={<FlightsAdmin />} />
          <Route path="/admin/aircraft" element={<AircraftAdmin />} />
          <Route path="/admin/airlines" element={<AirlinesAdmin />} />
          <Route path="/admin/gates" element={<GatesAdmin />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
