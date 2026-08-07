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

- MySQL (RDS or EC2)
- Spring Boot API (Docker → EC2/ECS)
- React UI (S3 + CloudFront or EC2)
- Environment variables for API URL and auth configuration
