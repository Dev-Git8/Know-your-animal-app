# Know Your Animal

Know Your Animal is a full-stack web application developed as a team project to provide accessible animal health information and basic veterinary support features.

The system is designed to help users identify common animal diseases, while also allowing doctors and administrators to manage medical and platform data through role-based access.

---

## Features

* Browse animals and view disease-related information (symptoms, causes, treatment, prevention)
* User authentication and profile management
* Doctor profiles with patient-related data handling
* Admin panel for managing users, doctors, and animal records
* Chat endpoint for handling user queries

---

## Tech Stack

* Frontend: React (Vite), Tailwind CSS
* Backend: Node.js, Express
* Database: MongoDB
* Authentication: JWT (stored in cookies)

---

## Project Structure

```
backend/   → API, database logic, authentication, routes
frontend/  → UI, components, API integration
```

---

## Setup Instructions

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
PORT=3000
```

Start the server:

```bash
node server.js
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Overview

Base URL:

```
http://localhost:3000/api
```

Includes endpoints for:

* Authentication (user, doctor, admin)
* Animal and disease data
* Doctor management
* Admin operations
* Chat functionality

---

## Data Models

* **User** – authentication and role management
* **Animal** – animal details and associated diseases
* **Disease** – symptoms, causes, treatment, prevention
* **DoctorProfile** – professional and clinic information

---

## Limitations

* Chat functionality is not real-time
* No appointment scheduling system
* UI can be further improved

---

## Future Scope

* Real-time chat implementation
* Appointment booking system
* Improved UI/UX and responsiveness

---

## Note

This project was developed as part of a team academic project.
