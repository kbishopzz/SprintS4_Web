import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Flight Board</Link> | {' '}
      <Link to="/booking">Book Flight</Link> | {' '}
      <Link to="/my-bookings">My Bookings</Link> | {' '}
      <Link to="/check-in">Check-In</Link> | {' '}
      <Link to="/baggage">Baggage</Link> | {' '}
      <Link to="/checkout">Checkout</Link> | {' '}
      <Link to="/login">Login</Link> | {' '}
      <Link to="/admin">Admin Dashboard</Link> | {' '}
      <Link to="/admin/flights">Flights</Link> | {' '}
      <Link to="/admin/aircraft">Aircraft</Link> | {' '}
      <Link to="/admin/airlines">Airlines</Link> | {' '}
      <Link to="/admin/gates">Gates</Link>
    </nav>
  );
}
