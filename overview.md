# Aviation Arrivals & Departures System

## Overview

This project is a full-stack aviation arrivals and departures application built with:

- Backend: Spring Boot (REST API, MySQL, authentication, Docker, CI)
- Frontend: React (public arrivals/departures UI + admin CRUD + login)
- Infrastructure: Google Cloud (Google SQL DB, Google Cloud Run API & UI deployed)

The system allows users to:

- View arrivals and departures for selected airports
- Switch between airports
- See flight details (airline, aircraft, gate, times)
- Log in as an admin to manage flights, aircraft, airlines, and gates

This project continues from a completed midterm sprint where:
- A Spring Boot API with City, Airport, Passenger, Aircraft was implemented
- A CLI client consumed the API
- Pagination and sorting were implemented
- GitHub workflow and testing were in place
