import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BookingPage from './pages/public/BookingPage';
import CheckoutPage from './pages/public/CheckoutPage';
import TravellerDashboard from './pages/public/TravellerDashboard';
import CheckInPage from './pages/public/CheckInPage';
import BaggagePage from './pages/public/BaggagePage';
import LoginPage from './pages/LoginPage';

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

import { AuthProvider, AuthContext } from './context/AuthContext';

// Provide a pre-authenticated context value for admin page tests
const mockAuthValue = {
  user: { username: 'MReid', role: 'ADMIN', provider: 'keycloak', email: 'mreid@airport.com' },
  token: 'mock-test-token',
  isAuthenticated: true,
  loading: false,
  authError: null,
  login: async () => true,
  loginDirect: () => {},
  logout: async () => {},
};

const renderHtmlWithRouter = (initialRoute = '/') => {
  return renderToString(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/"              element={<HomePage />} />
            <Route path="/booking"       element={<BookingPage />} />
            <Route path="/checkout"      element={<CheckoutPage />} />
            <Route path="/my-bookings"   element={<TravellerDashboard />} />
            <Route path="/check-in"      element={<CheckInPage />} />
            <Route path="/baggage"       element={<BaggagePage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="*"             element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </MemoryRouter>
    </AuthProvider>
  );
};

// Admin pages need an authenticated context — we use AuthContext.Provider directly
const renderAdminWithRouter = (initialRoute = '/admin') => {
  return renderToString(
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <main>
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
        </main>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('Public Side Page Headers', () => {
  it('checks header on "/" (Flight Board)', () => {
    const html = renderHtmlWithRouter('/');
    expect(html).toContain('<h1');
    expect(html).toContain('Flight Board');
  });

  it('checks header on "/booking" (Book a Flight)', () => {
    const html = renderHtmlWithRouter('/booking');
    expect(html).toContain('<h1>Book a Flight</h1>');
  });

  it('checks header on "/checkout" (Checkout & Payment)', () => {
    const html = renderHtmlWithRouter('/checkout');
    expect(html).toContain('<h1>Checkout &amp; Payment</h1>');
  });

  it('checks header on "/my-bookings" (My Bookings & Dashboard)', () => {
    const html = renderHtmlWithRouter('/my-bookings');
    expect(html).toContain('<h1>My Bookings &amp; Dashboard</h1>');
  });

  it('checks header on "/check-in" (Self-Service Check-In)', () => {
    const html = renderHtmlWithRouter('/check-in');
    expect(html).toContain('<h1>Self-Service Check-In</h1>');
  });

  it('checks header on "/baggage" (Baggage Management)', () => {
    const html = renderHtmlWithRouter('/baggage');
    expect(html).toContain('<h1>Baggage Management</h1>');
  });

  it('checks header on "/login" (Login)', () => {
    const html = renderHtmlWithRouter('/login');
    expect(html).toContain('<h1>Login</h1>');
  });

  it('checks header on unmatched route (404 Page Not Found)', () => {
    const html = renderHtmlWithRouter('/non-existent-page');
    expect(html).toContain('<h1>404 - Page Not Found</h1>');
  });
});

describe('Admin Side Page Headers', () => {
  it('checks header on "/admin" (Admin Dashboard)', () => {
    const html = renderAdminWithRouter('/admin');
    expect(html).toContain('<h1>Admin Dashboard</h1>');
  });

  it('checks header on "/admin/flights" (Manage Flights)', () => {
    const html = renderAdminWithRouter('/admin/flights');
    expect(html).toContain('<h1>Manage Flights</h1>');
  });

  it('checks header on "/admin/passengers" (Manage Passengers)', () => {
    const html = renderAdminWithRouter('/admin/passengers');
    expect(html).toContain('<h1>Manage Passengers &amp; Operations</h1>');
  });

  it('checks header on "/admin/aircraft" (Manage Aircraft)', () => {
    const html = renderAdminWithRouter('/admin/aircraft');
    expect(html).toContain('<h1>Manage Aircraft</h1>');
  });

  it('checks header on "/admin/airports" (Manage Airports)', () => {
    const html = renderAdminWithRouter('/admin/airports');
    expect(html).toContain('<h1>Manage Airports</h1>');
  });

  it('checks header on "/admin/cities" (Manage Cities)', () => {
    const html = renderAdminWithRouter('/admin/cities');
    expect(html).toContain('<h1>Manage Cities</h1>');
  });

  it('checks header on "/admin/airlines" (Manage Airlines)', () => {
    const html = renderAdminWithRouter('/admin/airlines');
    expect(html).toContain('<h1>Manage Airlines</h1>');
  });

  it('checks header on "/admin/gates" (Manage Gates)', () => {
    const html = renderAdminWithRouter('/admin/gates');
    expect(html).toContain('<h1>Manage Gates</h1>');
  });

  it('checks header on "/admin/queries" (Sprint Domain Queries Hub)', () => {
    const html = renderAdminWithRouter('/admin/queries');
    expect(html).toContain('<h1>Sprint Domain Queries Hub</h1>');
  });

  it('checks header on "/admin/users" (User Management)', () => {
    const html = renderAdminWithRouter('/admin/users');
    expect(html).toContain('<h1>User Management</h1>');
  });
});
