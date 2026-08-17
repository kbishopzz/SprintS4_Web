import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Public Pages
import HomePage from './pages/HomePage';
import BookingPage from './pages/public/BookingPage';
import CheckoutPage from './pages/public/CheckoutPage';
import TravellerDashboard from './pages/public/TravellerDashboard';
import CheckInPage from './pages/public/CheckInPage';
import BaggagePage from './pages/public/BaggagePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

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

// Components & Context
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthContext } from './context/AuthContext';
import * as apiModule from './api/ApiClient';

const mockAdminUser = {
  username: 'MReid',
  firstName: 'Mark',
  lastName: 'Reid',
  role: 'ADMIN',
  email: 'mreid@airport.com',
  provider: 'local',
};

const mockClientUser = {
  username: 'Alice',
  firstName: 'Alice',
  lastName: 'Nguyen',
  role: 'CLIENT',
  email: 'alice@example.com',
  provider: 'local',
};

const createMockAuth = (user = mockAdminUser) => ({
  user,
  token: 'mock-token',
  isAuthenticated: !!user,
  loading: false,
  authError: null,
  login: vi.fn().mockResolvedValue(true),
  loginDirect: vi.fn(),
  logout: vi.fn().mockResolvedValue(true),
});

describe('AeroPulse Web - Buttons, Modals, and Backend API Coverage', () => {

  describe('1. API Client Endpoints Verification', () => {
    it('verifies airportApi endpoints structure', () => {
      expect(apiModule.airportApi.getAll).toBeTypeOf('function');
      expect(apiModule.airportApi.getById).toBeTypeOf('function');
      expect(apiModule.airportApi.create).toBeTypeOf('function');
      expect(apiModule.airportApi.update).toBeTypeOf('function');
      expect(apiModule.airportApi.delete).toBeTypeOf('function');
      expect(apiModule.airportApi.getGates).toBeTypeOf('function');
    });

    it('verifies cityApi endpoints structure', () => {
      expect(apiModule.cityApi.getAll).toBeTypeOf('function');
      expect(apiModule.cityApi.getById).toBeTypeOf('function');
      expect(apiModule.cityApi.create).toBeTypeOf('function');
      expect(apiModule.cityApi.update).toBeTypeOf('function');
      expect(apiModule.cityApi.delete).toBeTypeOf('function');
      expect(apiModule.cityApi.getAirports).toBeTypeOf('function');
    });

    it('verifies planeApi endpoints structure', () => {
      expect(apiModule.planeApi.getAll).toBeTypeOf('function');
      expect(apiModule.planeApi.getById).toBeTypeOf('function');
      expect(apiModule.planeApi.create).toBeTypeOf('function');
      expect(apiModule.planeApi.update).toBeTypeOf('function');
      expect(apiModule.planeApi.delete).toBeTypeOf('function');
      expect(apiModule.planeApi.getAirports).toBeTypeOf('function');
    });

    it('verifies passengerApi endpoints structure', () => {
      expect(apiModule.passengerApi.getAll).toBeTypeOf('function');
      expect(apiModule.passengerApi.getById).toBeTypeOf('function');
      expect(apiModule.passengerApi.create).toBeTypeOf('function');
      expect(apiModule.passengerApi.update).toBeTypeOf('function');
      expect(apiModule.passengerApi.delete).toBeTypeOf('function');
      expect(apiModule.passengerApi.getPlanes).toBeTypeOf('function');
      expect(apiModule.passengerApi.getAirports).toBeTypeOf('function');
    });

    it('verifies gateApi endpoints structure', () => {
      expect(apiModule.gateApi.getAll).toBeTypeOf('function');
      expect(apiModule.gateApi.getById).toBeTypeOf('function');
      expect(apiModule.gateApi.getByAirport).toBeTypeOf('function');
      expect(apiModule.gateApi.create).toBeTypeOf('function');
      expect(apiModule.gateApi.update).toBeTypeOf('function');
      expect(apiModule.gateApi.delete).toBeTypeOf('function');
    });

    it('verifies airlineApi endpoints structure', () => {
      expect(apiModule.airlineApi.getAll).toBeTypeOf('function');
      expect(apiModule.airlineApi.getById).toBeTypeOf('function');
      expect(apiModule.airlineApi.getByCode).toBeTypeOf('function');
      expect(apiModule.airlineApi.create).toBeTypeOf('function');
      expect(apiModule.airlineApi.update).toBeTypeOf('function');
      expect(apiModule.airlineApi.delete).toBeTypeOf('function');
    });

    it('verifies bookingApi endpoints structure', () => {
      expect(apiModule.bookingApi.getAll).toBeTypeOf('function');
      expect(apiModule.bookingApi.getById).toBeTypeOf('function');
      expect(apiModule.bookingApi.getByReference).toBeTypeOf('function');
      expect(apiModule.bookingApi.getByPassenger).toBeTypeOf('function');
      expect(apiModule.bookingApi.create).toBeTypeOf('function');
      expect(apiModule.bookingApi.update).toBeTypeOf('function');
      expect(apiModule.bookingApi.checkIn).toBeTypeOf('function');
      expect(apiModule.bookingApi.delete).toBeTypeOf('function');
    });

    it('verifies userApi endpoints structure', () => {
      expect(apiModule.userApi.getAll).toBeTypeOf('function');
      expect(apiModule.userApi.getById).toBeTypeOf('function');
      expect(apiModule.userApi.getByUsername).toBeTypeOf('function');
      expect(apiModule.userApi.create).toBeTypeOf('function');
      expect(apiModule.userApi.update).toBeTypeOf('function');
      expect(apiModule.userApi.delete).toBeTypeOf('function');
    });
  });

  describe('2. Public Pages - Buttons & Modals Render Testing', () => {
    it('HomePage renders action buttons and filter pills', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockClientUser)}>
          <MemoryRouter initialEntries={['/']}>
            <HomePage />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('Book a Flight');
      expect(html).toContain('Web Check-In');
      expect(html).toContain('Baggage Tracker');
      expect(html).toContain('My Trips');
      expect(html).toContain('All Flights');
      expect(html).toContain('On Time');
      expect(html).toContain('Boarding');
      expect(html).toContain('Delayed');
    });

    it('LoginPage renders login & registration tabs and submit buttons', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(null)}>
          <MemoryRouter initialEntries={['/login']}>
            <LoginPage />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('Log In');
      expect(html).toContain('Register New User');
      expect(html).toContain('Log In to Portal');
      expect(html).toContain('MReid');
      expect(html).toContain('Kbishop');
      expect(html).toContain('CRubia');
    });

    it('BookingPage renders route selection controls and search filters', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockClientUser)}>
          <MemoryRouter initialEntries={['/booking']}>
            <BookingPage />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('Search Available Routes');
      expect(html).toContain('Departure Airport');
      expect(html).toContain('Destination Airport');
    });

    it('CheckInPage renders wizard stepper and lookup form buttons', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockClientUser)}>
          <MemoryRouter initialEntries={['/check-in']}>
            <CheckInPage />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('Retrieve Booking');
      expect(html).toContain('Seat &amp; Baggage');
      expect(html).toContain('Boarding Pass');
      expect(html).toContain('Find Reservation &amp; View Boarding Pass');
    });

    it('BaggagePage renders baggage tracking form and buttons', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockClientUser)}>
          <MemoryRouter initialEntries={['/baggage']}>
            <BaggagePage />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('Track Your Luggage');
      expect(html).toContain('Track Baggage');
    });

    it('TravellerDashboard renders quick actions and trip booking buttons', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockClientUser)}>
          <MemoryRouter initialEntries={['/my-bookings']}>
            <TravellerDashboard />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('Welcome back');
      expect(html).toContain('Alice Nguyen');
      expect(html).toContain('Book New Flight');
      expect(html).toContain('Web Check-In');
    });

    it('CheckoutPage renders passenger details form and payment button', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockClientUser)}>
          <MemoryRouter initialEntries={['/checkout']}>
            <CheckoutPage />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('Passenger Information');
      expect(html).toContain('Payment Method');
      expect(html).toContain('Complete &amp; Pay');
    });
  });

  describe('3. Admin Pages - Buttons & Modals Render Testing', () => {
    it('AdminDashboard renders quick console navigation buttons and gate links', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin']}>
            <AdminDashboard />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('Manage Flights');
      expect(html).toContain('Manage Gates');
      expect(html).toContain('Open Console ➔');
      expect(html).toContain('Open Control ➔');
      expect(html).toContain('Open Fleet ➔');
      expect(html).toContain('Open Network ➔');
    });

    it('AircraftAdmin renders Add Aircraft button and fleet metrics', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin/aircraft']}>
            <AircraftAdmin />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('+ Add Aircraft');
      expect(html).toContain('Total Fleet Size');
    });

    it('AirlinesAdmin renders Add Airline Partner button and table headers', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin/airlines']}>
            <AirlinesAdmin />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('+ Add Airline Partner');
      expect(html).toContain('Total Airlines');
    });

    it('AirportsAdmin renders Add Airport button, ID Lookup form, and Refresh button', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin/airports']}>
            <AirportsAdmin />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('+ Add Airport');
      expect(html).toContain('Airport Lookup by ID');
      expect(html).toContain('Find Airport');
      expect(html).toContain('↻ Refresh');
    });

    it('CitiesAdmin renders Add City button, ID lookup, and pagination controls', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin/cities']}>
            <CitiesAdmin />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('+ Add City');
      expect(html).toContain('City Lookup by ID');
      expect(html).toContain('Find City');
      expect(html).toContain('↻ Refresh');
      expect(html).toContain('◀ Prev');
      expect(html).toContain('Next ▶');
    });

    it('DomainQueriesAdmin renders all 4 domain query tab buttons and execute buttons', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin/queries']}>
            <DomainQueriesAdmin />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('Airports in City');
      expect(html).toContain('Planes for Passenger');
      expect(html).toContain('Airports for Plane');
      expect(html).toContain('Airports for Passenger');
      expect(html).toContain('🚀 Execute Query');
    });

    it('FlightsAdmin renders Add New Flight button and status filters', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin/flights']}>
            <FlightsAdmin />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('+ Add New Flight');
      expect(html).toContain('Total Scheduled Flights');
    });

    it('GatesAdmin renders Add Gate button and overview', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin/gates']}>
            <GatesAdmin />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('+ Add Gate');
      expect(html).toContain('Gate Overview');
    });

    it('PassengersAdmin renders Add Passenger button, ID lookup, and operations controls', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin/passengers']}>
            <PassengersAdmin />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('+ Add Passenger');
      expect(html).toContain('Fast Passenger Lookup &amp; Quick Actions');
      expect(html).toContain('Find Passenger');
      expect(html).toContain('↻ Refresh');
    });

    it('UsersAdmin renders New Account button, role filters, and refresh control', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin/users']}>
            <UsersAdmin />
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('+ New Account');
      expect(html).toContain('ALL');
      expect(html).toContain('ADMIN');
      expect(html).toContain('USER');
      expect(html).toContain('↻ Refresh');
    });
  });

  describe('4. Layouts & Header/Footer Navigation', () => {
    it('PublicLayout renders brand, navigation links, and admin login button', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockClientUser)}>
          <MemoryRouter initialEntries={['/']}>
            <PublicLayout>
              <div>Content</div>
            </PublicLayout>
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('AeroPulse');
      expect(html).toContain('Flight Board');
      expect(html).toContain('Book Flight');
      expect(html).toContain('Self Check-In');
      expect(html).toContain('Track Baggage');
      expect(html).toContain('My Trips');
      expect(html).toContain('Admin Portal Login 🔒');
      expect(html).toContain('Logout');
    });

    it('AdminLayout renders sidebar navigation, brand logo, toggle button, and user footer', () => {
      const html = renderToString(
        <AuthContext.Provider value={createMockAuth(mockAdminUser)}>
          <MemoryRouter initialEntries={['/admin']}>
            <AdminLayout>
              <div>Admin Content</div>
            </AdminLayout>
          </MemoryRouter>
        </AuthContext.Provider>
      );
      expect(html).toContain('SkyOps Control');
      expect(html).toContain('Dashboard');
      expect(html).toContain('Flights');
      expect(html).toContain('Passengers');
      expect(html).toContain('Gates');
      expect(html).toContain('Aircraft Fleet');
      expect(html).toContain('Airports');
      expect(html).toContain('Cities');
      expect(html).toContain('Partner Airlines');
      expect(html).toContain('Domain Queries');
      expect(html).toContain('User Management');
      expect(html).toContain('Public Portal');
      expect(html).toContain('MReid');
    });

    it('Footer renders operational status and legal links', () => {
      const html = renderToString(<Footer />);
      expect(html).toContain('AeroPulse • SkyOps Platform');
      expect(html).toContain('All Systems Operational');
      expect(html).toContain('Privacy Policy');
      expect(html).toContain('Terms of Service');
      expect(html).toContain('Accessibility');
      expect(html).toContain('Help Centre');
    });
  });
});
