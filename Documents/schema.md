# Database Schema

This document describes the current and extended database schema as defined by the JPA entity models and seed data in the project. It reflects both the midterm implementation and the new entities required for the full-stack arrivals/departures system.

## Overview

The database consists of the following tables:

- city
- airport
- passenger
- plane
- bookings
- plane_airport
- plane_passenger
- airline
- gate
- user_account

The application is configured to use MySQL, and Hibernate is set to `ddl-auto=update`, so the schema is derived from the entity classes.

## Existing Tables

### city

Stores cities.

| Column     | Type         | Constraints                 |
| ---------- | ------------ | --------------------------- |
| id         | bigint       | Primary key, auto-generated |
| name       | varchar(255) |                             |
| province   | varchar(255) |                             |
| population | int          |                             |

**Relationships:**

- One city can have many airports.

---

### airport

Stores airports.

| Column       | Type         | Constraints                 |
| ------------ | ------------ | --------------------------- |
| id           | bigint       | Primary key, auto-generated |
| name         | varchar(255) |                             |
| airport_code | varchar(255) |                             |
| city_id      | bigint       | Foreign key to city.id      |

**Relationships:**

- Many airports belong to one city.
- One airport can have many gates.
- One airport can be origin or destination for many bookings.

---

### passenger

Stores passengers.

| Column          | Type         | Constraints                 |
| --------------- | ------------ | --------------------------- |
| id              | bigint       | Primary key, auto-generated |
| first_name      | varchar(255) |                             |
| last_name       | varchar(255) |                             |
| phone_number    | varchar(255) |                             |
| email           | varchar(255) |                             |
| passport_number | varchar(255) |                             |

**Relationships:**

- Passenger is linked to planes through a many-to-many relationship (plane_passenger).
- Passenger is linked to bookings through a one-to-many relationship (one passenger, many bookings).

---

### plane

Stores planes.

| Column            | Type         | Constraints                      |
| ----------------- | ------------ | -------------------------------- |
| id                | bigint       | Primary key, auto-generated      |
| type              | varchar(255) |                                  |
| airline_name      | varchar(255) | (to be refactored to airline_id) |
| num_of_passengers | int          |                                  |

**Relationships:**

- Many-to-many with airports through plane_airport.
- Many-to-many with passengers through plane_passenger.
- One plane can have many bookings.
- One plane belongs to one airline (after refactor).

---

### bookings

Stores booking records and effectively represents individual flights for a given passenger.

| Column                 | Type         | Constraints                           |
| ---------------------- | ------------ | ------------------------------------- |
| id                     | bigint       | Primary key, auto-generated           |
| booking_reference      | varchar(255) | Not null, unique                      |
| passenger_id           | bigint       | Not null, foreign key to passenger.id |
| plane_id               | bigint       | Not null, foreign key to plane.id     |
| origin_airport_id      | bigint       | Not null, foreign key to airport.id   |
| destination_airport_id | bigint       | Not null, foreign key to airport.id   |
| flight_number          | varchar(255) |                                       |
| departure_time         | varchar(255) | (to be refactored to datetime)        |
| gate                   | varchar(255) | (to be refactored to gate_id)         |
| seat_number            | varchar(255) |                                       |
| baggage_count          | int          | Default 0                             |
| status                 | varchar(255) | Default BOOKED                        |
| check_in_time          | varchar(255) |                                       |

**Relationships:**

- Each booking belongs to one passenger.
- Each booking belongs to one plane.
- Each booking has one origin airport.
- Each booking has one destination airport.
- Each booking uses one gate (after refactor).

---

### plane_airport

Join table for the many-to-many relationship between planes and airports.

| Column     | Type   | Constraints               |
| ---------- | ------ | ------------------------- |
| plane_id   | bigint | Foreign key to plane.id   |
| airport_id | bigint | Foreign key to airport.id |

---

### plane_passenger

Join table for the many-to-many relationship between planes and passengers.

| Column       | Type   | Constraints                 |
| ------------ | ------ | --------------------------- |
| plane_id     | bigint | Foreign key to plane.id     |
| passenger_id | bigint | Foreign key to passenger.id |

---

## New Tables (Final Sprint Extensions)

### airline

Represents airlines operating flights and owning planes.

| Column | Type         | Constraints                     |
| ------ | ------------ | ------------------------------- |
| id     | bigint       | Primary key, auto-generated     |
| name   | varchar(255) | Not null                        |
| code   | varchar(255) | Not null, unique (e.g., AC, WS) |

**Relationships:**

- One airline can have many planes.
- One airline can have many bookings (via planes).

---

### gate

Represents gates at airports.

| Column     | Type         | Constraints                 |
| ---------- | ------------ | --------------------------- |
| id         | bigint       | Primary key, auto-generated |
| gate_code  | varchar(255) | Not null (e.g., A12, B3)    |
| airport_id | bigint       | Foreign key to airport.id   |

**Relationships:**

- One airport can have many gates.
- One gate can be used by many bookings.

---

### user_account

Represents application users for authentication.

| Column        | Type         | Constraints                 |
| ------------- | ------------ | --------------------------- |
| id            | bigint       | Primary key, auto-generated |
| username      | varchar(255) | Not null, unique            |
| password_hash | varchar(255) | Not null                    |
| email         | varchar(255) | Optional                    |

**Relationships:**

- No direct domain relationships; used for authentication and authorization.

---

## Relationships Summary (Extended)

- city 1 to many airport
- airport many to 1 city
- plane many to many airport (plane_airport)
- plane many to many passenger (plane_passenger)
- booking many to 1 passenger
- booking many to 1 plane
- booking many to 1 airport as origin
- booking many to 1 airport as destination
- airline 1 to many plane
- airport 1 to many gate
- gate 1 to many bookings (via gate_id)
- user_account used for API authentication
