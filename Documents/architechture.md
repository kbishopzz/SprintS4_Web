## Architecture

### Backend (Spring Boot)

- Entities:
  - City
  - Airport
  - Passenger
  - Aircraft
  - Flight
  - Airline
  - Gate
  - User (for authentication)
- Features:
  - REST API with CRUD for all entities
  - Authentication (Spring Security or Keycloak)
  - Pagination and sorting (Spring Data JPA)
  - Dockerized API and MySQL
  - Unit tests (JUnit + Mockito)
  - GitHub Actions CI pipeline

### Frontend (React)

- Public UI:
  - Airport selector
  - Arrivals board
  - Departures board
- Admin UI:
  - CRUD for Flights, Aircraft, Airlines, Gates
- Authentication:
  - Login page
  - Protected admin routes

### Infrastructure

- Google SQL (MySQL)
- Spring Boot API (Docker → Google Cloud Run)
- React UI (Google Cloud Run)
- Environment variables for API URL and auth configuration
