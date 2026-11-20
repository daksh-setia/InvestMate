# INVESTMATE – Complete Full-Stack Financial Awareness Platform

> **A Lightweight, Educational, and Transparent Welfare Scheme Information Platform**  
> *Designed especially for rural families, smallholder farmers, senior citizens, and frontline workers (ASHA / Anganwadi).*

---

## 1. Project Overview

**INVESTMATE** empowers citizens to explore and understand Indian government welfare schemes and financial basics in simple language, with complete fine-print transparency and without depending on middleman intermediaries.

> [!IMPORTANT]
> **Strict Educational Principle:**  
> INVESTMATE is purely educational and non-commercial. It **does NOT** process payments, investments, or financial transactions, and **never collects** sensitive identity documents (such as Aadhaar or PAN cards).

---

## 2. Architecture & Project Structure

The project is cleanly split into two decoupled yet integrated directories:

```text
INVESTMATE/
├── frontend/                     # User's Original Bilingual React + Vite Application
│   ├── dist/                     # Optimized production bundle (served by Express)
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js            # Centralized API client (Auth, Schemes, Documents, Admin)
│   │   ├── main.jsx              # Main App (Schemes, Modals, Auth, Admin, TTS, Finder)
│   │   ├── styles.css            # Luxury editorial styling (Fraunces + DM Sans + Noto Sans)
│   │   └── translations.js       # Complete English & Hindi bilingual dictionaries & seed data
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env                      # VITE_API_URL=http://localhost:5000/api
│   └── .env.example
│
└── backend/                      # Production Node.js & Express.js REST API
    ├── config/
    │   └── db.js                 # Resilient MongoDB connector (with in-memory fallback)
    ├── controllers/              # auth, scheme, category, document, admin controllers
    ├── middleware/               # JWT auth, error handler, rate-limit, input validation
    ├── models/                   # User, Scheme, Category, DocumentChecklist (Mongoose)
    ├── routes/                   # REST API routes (/api/auth, /api/schemes, etc.)
    ├── seeders/                  # Official verified schemes seeder (PM-KISAN, PM-JAY, etc.)
    ├── services/                 # authService, schemeService
    ├── test/                     # Automated unit and integration test suites
    ├── utils/                    # apiResponse, memoryStore, token generator
    ├── server.js                 # Express entry point (serves API & frontend/dist)
    ├── package.json
    ├── .env
    └── .env.example
```

---

## 3. Technology Stack

- **Frontend:**
  - React 18
  - Vite 8
  - Lucide React Icons
  - Web Speech API (`SpeechSynthesis`) for Hindi & English voice narration
  - CSS Variables & Responsive Layouts
- **Backend:**
  - Node.js (v20+ LTS)
  - Express.js 4.x
  - MongoDB & Mongoose 8.x
  - Dual-mode data resilience (MongoDB + auto in-memory factual fallback)
  - JWT (JSON Web Tokens) & bcryptjs password hashing
  - Helmet (HTTP security headers), CORS, Gzip compression, and Rate Limiting

---

## 4. Key Modules & Features

### A. User Authentication & Profile
- **Citizen Registration:** `POST /api/auth/register`
- **Citizen & Admin Login:** `POST /api/auth/login`
- **Profile Management:** `GET /api/auth/profile` and `PUT /api/auth/profile`
- **Guest Access:** Complete access to search and view all schemes without an account.
- **Demo Logins Built-in:** One-click demo credential buttons for testing both Citizen and Admin access.

### B. Government Schemes Management
- **Dynamic Fetching:** Schemes loaded dynamically from MongoDB with automatic offline fallback.
- **Fast Search & Filter:** Filter by category chips (`Farmer`, `Health`, `Housing`, `Pension`, `Education`, `Employment`) and keyword search.
- **Pagination & Low-Bandwidth Mode:** Supports `?lite=true` and compact JSON responses for 2G/3G connectivity.

### C. Fine-Print Transparency Module
For every scheme, clear and verified disclosures are displayed:
- **Lock-in Period** (e.g. "No lock-in period" or "Till age 60")
- **Exit Penalties** (e.g. "No exit penalties")
- **Hidden Fees & Intermediary Charges** (Discloses ₹0 fee on welfare schemes)
- **Withdrawal Conditions** (e.g. Direct Benefit Transfer into Aadhaar-linked bank account)
- **Expected Returns / Subsidies** (Verified values or "Information not verified")
- **Anti-Middleman Warnings** (Prominent warning banner educating citizens never to pay unauthorized agents)

### D. Interactive Document Checklist
- Displays required documents for each scheme with **preparation instructions** and **where to obtain**.
- Checkboxes can be checked off by citizens as they gather documents.
- State is saved privately in client-side `localStorage`—zero sensitive personal documents are collected or stored on the server.

### E. Admin Dashboard
- Role-protected (`role === 'admin'`).
- Live platform statistics: Total Schemes, Total Categories, Verified Schemes.
- Form to add new schemes directly to MongoDB.
- Instant scheme deletion with confirmation dialog.

### F. Bilingual Audio & 4-Step Questionnaire Finder
- 100% bilingual toggle between English and Hindi (`हिन्दी`).
- Web Speech audio narration for rural citizens who prefer listening.
- 4-step interactive guided questionnaire to recommend relevant schemes and savings concepts.

---

## 5. Quick Start Guide

### Step 1: Start Backend Server
```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:5000`.  
It automatically serves the compiled frontend and API endpoints!

### Step 2: (Optional) Run Frontend in Development Mode
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server runs on `http://localhost:5173`.

### Step 3: Run Backend Test Suite
```bash
cd backend
npm test
```
Runs 16 automated assertions verifying all REST endpoints, authentication, authorization, fine-print transparency, and guest access.

---

## 6. Pre-Configured Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@investmate.gov.in` | `Admin@Secure123` | Full admin privileges (Add, delete, update schemes & view metrics) |
| **Citizen User** | `citizen@investmate.gov.in` | `Citizen@Secure123` | Standard user profile & saved document checklists |
| **Guest User** | *None required* | *None required* | Free access to browse all schemes and guides |
