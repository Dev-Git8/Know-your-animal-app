# 🐾 Know Your Animal App

> **Comprehensive Animal Healthcare, Disease Diagnosis, AI Veterinary Assistant & Doctor Booking Platform**

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-black.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment%20Gateway-02042b.svg)](https://razorpay.com/)

---

## 🌟 Overview

**Know Your Animal** is an all-in-one veterinary digital health platform built for pet parents, dairy farmers, livestock caretakers, and veterinarians across India. It connects animal caretakers with emergency first aid, verified clinical appointments, official digital animal passports, and 24/7 AI-powered veterinary triage.

---

## ✨ Key Features

### 1. 📖 Disease & Medical Cure Dossier (17 Animals, 61 Diseases)
- **Species Covered**: Cow, Buffalo, Goat, Sheep, Dog, Cat, Horse, Donkey, Chicken, Duck, Pig, Rabbit, Camel, Elephant, Parrot, Pigeon, and Bengal Tiger.
- **Detailed Clinical Protocols**:
  - Recognizable Symptoms (3–6 clinical indicators per condition)
  - Etiological Causes & Mode of Transmission
  - Medical Cure & Treatment Protocols (emergency first-aid vs. prescription veterinary drugs)
  - Prevention & Biosecurity Guidelines
- **Category Filter Tabs**: *Livestock & Dairy*, *Pets & Companions*, *Birds & Poultry*, *Working & Equine*, and *Wildlife*.
- **Interactive Multi-Parameter Search**: Instant filtering by animal name, Hindi name, or disease/symptom keywords (e.g. `fever`, `bloat`, `colic`, `mastitis`).

### 2. 🤖 24/7 AI Veterinary Health Assistant
- Powered by **Google Gemini 2.5 Flash** with real-time SSE streaming.
- Built-in intelligent emergency fallback triage for feline emergencies (FLUTD / blocked cat), equine colic, bovine bloat, and rabbit GI stasis.
- Bilingual support with compassionate, step-by-step guidance before seeing a doctor.

### 3. 💳 Secure Razorpay Payment Gateway
- **Subscription Tiers**:
  - **Care Plus (₹199 / mo)**: Full pet healthcare protection, unlimited 24/7 AI vet consultations, and priority clinic bookings.
  - **Farm Pro (₹499 / mo)**: Comprehensive livestock & herd protection for dairy farmers and agricultural flocks.
- **Payment Security**:
  - Official Razorpay SDK integration (`RazorpayModal.jsx` and `app.py`).
  - Dynamic QR code generation with UPI deep-linking (PhonePe, Google Pay, Paytm, BHIM).
  - Netbanking across 15+ major Indian banks.
  - RBI-compliant 3D-Secure 2.0 verification.
  - Zero exposed test credentials or insecure bypasses.

### 4. 🩺 Role-Based Portals & Dashboards
- **Pet Owner Dashboard (`/dashboard`)**:
  - Live health stats (Registered Animals, Upcoming Visits, Membership Tier).
  - Quick action tiles for AI chat, doctor bookings, and disease guides.
  - Integrated nationwide **Govt 1962** animal emergency helpline callout.
- **Pet Owner Profile & Health Passports (`/profile`)**:
  - Multi-pet registry with breed, age, and vaccination status.
  - **Printable Official Digital Animal Health Passports** (with allergy warnings, caretaker info, and medical history).
- **Doctor Portal (`/doctor-dashboard`)**:
  - Live appointment management (Pending, Confirmed, Completed, Cancelled).
  - Clinical treatment notes recording.
  - Clinic availability status toggle (Online / Offline).
- **Admin Panel (`/admin`)**:
  - Full platform oversight: user accounts, doctor profile verification, animal database synchronization, and appointment records.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Radix UI.
- **Backend API**: Python 3.10+, Flask, Flask-SQLAlchemy, Flask-CORS, PyJWT, Werkzeug.
- **Alternative Backend**: Node.js, Express, MongoDB Atlas, Mongoose (in `backend/`).
- **Database**: SQLite (`instance/app.db`) with automatic auto-seeder, or MongoDB Atlas.
- **Payments**: Razorpay Official Node/Python SDK & Web Checkout.
- **AI / LLM**: Google Gemini API (`gemini-2.5-flash`).

---

## 📁 Project Structure

```
Know-your-animal-app/
├── app.py                      # Core Python Flask API & database models
├── RUN_APP.bat                 # 1-Click launcher for Windows
├── requirements.txt            # Python dependencies
├── seed_comprehensive_animals.py # Database seeder (17 animals, 61 diseases)
├── instance/app.db             # Pre-seeded SQLite database
├── backend/                    # Express + MongoDB service
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
└── frontend/                   # React + Vite Client
    ├── src/
    │   ├── components/         # Navbar, Footer, RazorpayModal, etc.
    │   ├── contexts/           # AuthContext, LanguageContext
    │   ├── data/               # animalDiseases.js, translations.js (12 languages)
    │   ├── integrations/       # authApi.js, animalApi.js
    │   ├── pages/              # Animals, AnimalDetail, UserDashboard, UserProfile, DoctorDashboard, Auth, etc.
    │   └── utils/              # qrGenerator.js
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Quick Start Guide

### Option A: 1-Click Startup (Windows)
Double-click [`RUN_APP.bat`](RUN_APP.bat). Both Flask and React servers will automatically launch in separate terminal windows, then navigate to **`http://localhost:8080`**.

---

### Option B: Manual Setup

#### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

#### 2. Start Python Flask Backend
```bash
# Install Python packages
pip install -r requirements.txt

# Start the Flask API server
python app.py
```
> Running on **`http://127.0.0.1:3000`**. On first boot, it automatically seeds all 17 animals, 61 disease cures, and verified doctors into SQLite.

#### 3. Start React Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
> Running on **`http://localhost:8080`**.

---

## 🌐 Default Platform Roles

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Pet Owner** | *Register at `/auth`* | *Custom* | Dashboard, Pet Registry, AI Chat, Appointments |
| **Doctor** | `doc1@gmail.com` | `password123` | Doctor Dashboard, Clinical Notes, Patient Appointments |
| **Admin** | `admin@admin.com` | `admin123` | Admin Portal, Doctor Verification, Platform Database |

---

## 📞 Emergency SOS
For critical animal emergencies across India, call the nationwide 24/7 Mobile Veterinary Unit helpline at **1962** (Toll-Free).

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
