# Know Your Animal App

A full-stack veterinary and animal health application with user authentication, admin management, doctor profiles, animal disease information, chat support, and profile management.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Admin Routes](#admin-routes)
  - [Animal Routes](#animal-routes)
  - [Doctor Routes](#doctor-routes)
  - [Chat Routes](#chat-routes)
- [Data Models](#data-models)
- [Notes](#notes)

## Project Overview

This project provides an animal health portal where:

- Users can register and log in.
- Doctors can manage their profile and patients.
- Admins can manage doctors and view users.
- Animal disease data is available publicly.
- Real-time chat support is available through a chat endpoint.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT stored in cookies
- File Uploads: Multer
- Frontend: React, Vite, Tailwind CSS
- API Client: Axios

## Repository Structure

- `backend/`
  - `server.js` - backend entrypoint
  - `src/app.js` - Express app configuration and route registration
  - `src/db/db.js` - MongoDB connection helper
  - `src/routes/` - API routing modules
  - `src/controllers/` - route logic and handlers
  - `src/middlewares/` - auth, admin and upload middleware
  - `src/models/` - Mongoose schemas
  - `src/utils/` - seed utilities
- `frontend/`
  - Vite-powered React app
  - `src/` contains pages, components, hooks, contexts, and API integration

## Getting Started

### Backend

1. Open a terminal and navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in `backend/` with the required environment variables.

4. Start the backend server:

```bash
node server.js
```

The backend server starts on `http://localhost:3000` by default.

### Frontend

1. Open a terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npm run dev
```

The frontend will run on a Vite host, typically `http://localhost:5173`.

## Environment Variables

Create a `.env` file under `backend/` containing at least:

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
CLIENT_URL=http://localhost:5173
PORT=3000
```

## API Documentation

Base backend URL: `http://localhost:3000/api`

### Authentication

#### Register User

- Endpoint: `POST /api/auth/register`
- Description: Register a new user.
- Body:
  - `username` (string)
  - `email` (string)
  - `password` (string)

#### Login User

- Endpoint: `POST /api/auth/login-user`
- Description: Login as a regular user.
- Body:
  - `email` (string)
  - `password` (string)

#### Login Doctor

- Endpoint: `POST /api/auth/login-doctor`
- Description: Login as a doctor.
- Body:
  - `email` (string)
  - `password` (string)

#### Logout

- Endpoint: `POST /api/auth/logout`
- Description: Clears the authentication cookie.

#### Get Profile

- Endpoint: `GET /api/auth/profile`
- Description: Get the authenticated user's profile.
- Authorization: Cookie token required.

#### Update Profile

- Endpoint: `PUT /api/auth/profile`
- Description: Update the authenticated user's profile.
- Authorization: Cookie token required.
- Body: fields for username, email, and profile updates.

#### Public Doctors List

- Endpoint: `GET /api/auth/public/doctors`
- Description: Retrieve a public list of doctor profiles.
- Authorization: None.

### Admin Routes

#### Admin Login

- Endpoint: `POST /api/admin/login-admin`
- Description: Login as an admin.
- Body:
  - `email` (string)
  - `password` (string)

#### Admin Logout

- Endpoint: `POST /api/admin/logout`
- Description: Clear admin auth cookie.

#### Admin Profile

- Endpoint: `GET /api/admin/profile`
- Description: Get authenticated admin profile.
- Authorization: `adminToken` cookie required.

#### List Users

- Endpoint: `GET /api/admin/users`
- Description: Get all registered users.
- Authorization: `adminToken` cookie required.

#### List Doctors

- Endpoint: `GET /api/admin/doctors`
- Description: Get all doctor accounts.
- Authorization: `adminToken` cookie required.

#### Add Doctor

- Endpoint: `POST /api/admin/doctors`
- Description: Create a new doctor account.
- Authorization: `adminToken` cookie required.
- Body: doctor details form data.

#### Update Doctor

- Endpoint: `PUT /api/admin/doctors/:id`
- Description: Update an existing doctor account.
- Authorization: `adminToken` cookie required.

#### Delete Doctor

- Endpoint: `DELETE /api/admin/doctors/:id`
- Description: Remove a doctor account.
- Authorization: `adminToken` cookie required.

### Animal Routes

#### Get All Animals

- Endpoint: `GET /api/animals/`
- Description: Retrieve all animals with disease summaries.
- Authorization: None.

#### Get Animal by Slug

- Endpoint: `GET /api/animals/:slug`
- Description: Retrieve a single animal and its disease details.
- Authorization: None.

#### Create Animal

- Endpoint: `POST /api/animals/`
- Description: Create an animal entry.
- Authorization: Admin only.
- Body: `slug`, `name`, `nameHi`, `image`, `description`, `diseases`

#### Update Animal

- Endpoint: `PUT /api/animals/:slug`
- Description: Update animal data by slug.
- Authorization: Admin only.

#### Delete Animal

- Endpoint: `DELETE /api/animals/:slug`
- Description: Delete an animal entry.
- Authorization: Admin only.

#### Add Disease

- Endpoint: `POST /api/animals/:slug/diseases`
- Description: Add a new disease to an animal profile.
- Authorization: Admin only.
- Body: disease object with `name`, `symptoms`, `causes`, `treatment`, and `prevention`.

#### Delete Disease

- Endpoint: `DELETE /api/animals/:slug/diseases/:diseaseId`
- Description: Remove a disease from an animal profile.
- Authorization: Admin only.

### Doctor Routes

#### Doctor Profile

- Endpoint: `GET /api/doctor/profile`
- Description: Get the authenticated doctor's profile.
- Authorization: Doctor cookie token required.

#### Update Doctor Profile

- Endpoint: `PUT /api/doctor/profile`
- Description: Update doctor profile information.
- Authorization: Doctor cookie token required.

#### Get Patients

- Endpoint: `GET /api/doctor/patients`
- Description: Retrieve the doctor's patients.
- Authorization: Doctor cookie token required.

#### Add Treatment Note

- Endpoint: `POST /api/doctor/treatment-notes`
- Description: Add treatment notes for patients.
- Authorization: Doctor cookie token required.

### Chat Routes

#### Chat Message

- Endpoint: `POST /api/chat/`
- Description: Send a chat request to the support/chat controller.
- Body: message content for chat handling.
- Authorization: None required by route definition.

## Data Models

### User

- `username` (string)
- `email` (string)
- `password` (string, hashed)
- `role` (`user`, `doctor`, `admin`)

### Animal

- `slug` (string)
- `name` (string)
- `nameHi` (string)
- `image` (string)
- `description` (string)
- `diseases` (array)

### Disease

- `name`
- `nameHi`
- `symptoms` (string[])
- `causes`
- `treatment`
- `prevention` (string[])

### DoctorProfile

- `userId`
- `doctorName`
- `profilePhoto`
- `qualification`
- `yearsOfExperience`
- `specialization`
- `clinicName`
- `location`
- `contactNumber`
- `email`
- `availabilityStatus`
- `rating`

## Notes

- The backend expects JWT secrets in `.env` and uses cookies for authenticated sessions.
- Admin and doctor routes are protected by role-specific middleware.
- The frontend is built with React and Vite; run it separately from the backend.
- Adjust `CLIENT_URL` in `.env` to match the frontend origin for CORS.

---

Happy coding! 👩‍⚕️🐾
