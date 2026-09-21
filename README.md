# User Management CRUD App

A beginner-friendly full-stack user management app built with React, Vite, Spring Boot, Spring Security, JWT, Spring Data JPA, PostgreSQL, and Docker.

The project is useful as a learning or portfolio app because it shows the usual pieces of a modern CRUD system: a frontend, a REST API, authentication, authorization, a service layer, a repository layer, and a real database.

## Features

- Register and login users
- JWT-based authentication
- BCrypt password hashing
- Public registration creates standard `USER` accounts
- Optional bootstrap admin account for local testing
- Admin-only user management endpoints
- Create, read, update, and delete users
- React + Vite frontend
- Spring Boot REST API
- PostgreSQL database with Docker Compose

## Tech Stack

Frontend:

- React 18
- Vite
- Fetch API
- CSS

Backend:

- Java 21
- Spring Boot
- Spring Web
- Spring Security
- Spring Data JPA
- JWT
- Maven

Database:

- PostgreSQL 16
- Docker Compose

## Project Structure

```text
user-management-app/
  backend/
    src/main/java/com/example/usermanagement/
      auth/        Register and login endpoints
      error/       Shared API error handling
      security/    JWT and Spring Security configuration
      user/        User entity, DTOs, controller, service, repository
    src/main/resources/application.yml
    pom.xml

  frontend/
    src/
      App.jsx
      api.js
      main.jsx
      styles.css
    package.json

  docker-compose.yml
  README.md
```

## Requirements

Install these before running the app:

- Java 21 or newer
- Maven
- Node.js 18 or newer
- Docker Desktop

You can check your versions with:

```bash
java -version
mvn -version
node -v
npm -v
docker --version
```

## Quick Start

Run these from the project root unless a command says otherwise.

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts a local PostgreSQL database with:

```text
database: user_management
username: postgres
password: postgres
port: 5432
```

### 2. Start The Backend

Open a new terminal:

```bash
cd backend
mvn spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

### 3. Start The Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend in your browser:

```text
http://localhost:5173
```

## Building And Compiling

### Backend

Compile and run backend checks:

```bash
cd backend
mvn test
```

Build the backend JAR:

```bash
cd backend
mvn clean package
```

The built file is created in:

```text
backend/target/
```

### Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Build the frontend:

```bash
cd frontend
npm run build
```

Preview the production build locally:

```bash
cd frontend
npm run preview
```

## Using The App

1. Start PostgreSQL, the backend, and the frontend.
2. Open `http://localhost:5173`.
3. Register a new user or login with an existing account.
4. Use an admin account to access the user management features.

Public registration always creates a normal `USER` account. User management endpoints require an authenticated user with the `ADMIN` role.

## Admin Account For Local Testing

To create an initial admin account for local testing, start the backend with these environment variables:

```text
BOOTSTRAP_ADMIN_NAME=Admin User
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_PASSWORD=password123
```

PowerShell example:

```powershell
$env:BOOTSTRAP_ADMIN_NAME="Admin User"
$env:BOOTSTRAP_ADMIN_EMAIL="admin@example.com"
$env:BOOTSTRAP_ADMIN_PASSWORD="password123"
mvn spring-boot:run
```

The bootstrap admin is created only when both email and password are provided, and only if that email does not already exist.

## API Endpoints

Base backend URL:

```text
http://localhost:8080
```

### Authentication

These routes are public:

```http
POST /api/auth/register
POST /api/auth/login
```

Example register request:

```json
{
  "name": "Jane Admin",
  "email": "jane@example.com",
  "password": "password123"
}
```

Example login request:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

Successful auth responses include a JWT token. Send that token on protected requests:

```http
Authorization: Bearer <jwt-token>
```

### Users

These routes require a valid JWT token from an `ADMIN` user:

```http
GET    /api/users
GET    /api/users/{id}
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

Example create user request:

```json
{
  "name": "Sam User",
  "email": "sam@example.com",
  "password": "password123",
  "role": "USER"
}
```

## Environment Variables

Backend defaults are configured in:

```text
backend/src/main/resources/application.yml
```

Useful backend variables:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
JWT_EXPIRATION_MS
CORS_ALLOWED_ORIGINS
BOOTSTRAP_ADMIN_NAME
BOOTSTRAP_ADMIN_EMAIL
BOOTSTRAP_ADMIN_PASSWORD
```

Frontend API variable:

```text
VITE_API_URL
```

If `VITE_API_URL` is not set, the frontend uses:

```text
http://localhost:8080/api
```

## Security Notes

- Passwords are stored using BCrypt.
- API routes use stateless JWT authentication.
- Only `POST /api/auth/register` and `POST /api/auth/login` are public.
- Other `/api/auth/**` routes are denied.
- `/api/users/**` routes require an authenticated `ADMIN` user.
- CORS is controlled by `CORS_ALLOWED_ORIGINS`.

For local development, the app includes a default JWT secret in `application.yml`. Use a strong `JWT_SECRET` environment variable for anything outside local testing.

## Resetting The Local Database

To delete all local database data and start fresh:

```bash
docker compose down -v
docker compose up -d
```

## Troubleshooting

If the backend cannot connect to the database, make sure Docker is running and PostgreSQL is up:

```bash
docker compose ps
```

If the frontend cannot reach the backend, check that:

- The backend is running on `http://localhost:8080`.
- The frontend is using `http://localhost:8080/api`.
- `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`.

If login works but user management is blocked, make sure you are logged in as an `ADMIN` user.

## Learning Goals

This project demonstrates:

- How React talks to a backend API
- How Spring Boot controllers expose REST endpoints
- How a service layer keeps business logic out of controllers
- How Spring Data JPA maps Java objects to database tables
- How JWT authentication works
- How Spring Security protects routes
- How Docker can run a local PostgreSQL database

## Possible Improvements

- Add automated backend tests
- Add frontend form validation improvements
- Add refresh tokens
- Add an admin invitation flow
- Add pagination and search for users
- Add deployment instructions
- Add screenshots
