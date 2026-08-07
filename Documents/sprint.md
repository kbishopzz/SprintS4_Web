# 10-Day Sprint Plan

## Day 1 — Kickoff & Architecture

- Finalize architecture and entities
- Assign roles (Backend Lead, Frontend Lead, DevOps/Integration)
- Create GitHub Project board and add tasks
- Create main branches and basic repo structure

## Day 2 — Backend Entities

- Implement Flight, Airline, Gate entities
- Update relationships with existing entities (City, Airport, Aircraft)
- Create repositories and service classes

## Day 3 — Authentication

- Implement User entity
- Configure Spring Security or Keycloak
- Protect admin endpoints with authentication

## Day 4 — Backend CRUD & Tests

- Implement CRUD controllers for Flight, Airline, Gate
- Add unit tests for services (JUnit + Mockito)
- Add controller tests (MockMvc)
- Configure GitHub Actions CI for backend

## Day 5 — Dockerization & Local Integration

- Create Dockerfile for API
- Create Docker Compose for API + MySQL
- Run local integration tests (API + DB)

## Day 6 — React Setup & Auth

- Initialize React project
- Set up routing and Axios client
- Implement Login page and Auth context
- Implement ProtectedRoute component

## Day 7 — Public UI (Arrivals/Departures)

- Implement Airport selector
- Implement Arrivals board
- Implement Departures board
- Connect UI to backend endpoints

## Day 8 — Admin UI (CRUD)

- Implement Admin dashboard
- Implement Flights admin CRUD page
- Implement Aircraft admin CRUD page
- Implement Airlines admin CRUD page
- Implement Gates admin CRUD page

## Day 9 — Deployment

- Deploy Google SQL
- Deploy API (Google Cloud Run)
- Deploy UI (Google Cloud Run)
- Configure environment variables and test end-to-end

## Day 10 — Demo & Documentation

- Record demo video with all team members
- Finalize README and architecture docs
- Write personal reflections and role descriptions
- Clean up PRs and ensure main branches are stable
