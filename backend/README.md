<<<<<<< HEAD
# INVESTMATE – Backend API Architecture & Documentation

> **Financial Awareness & Government Welfare Schemes Information Platform**  
> *Specially engineered for rural families, smallholder farmers, elderly citizens, and frontline workers (ASHA / Anganwadi).*

---

## 1. System Overview

**INVESTMATE** is a lightweight, secure, and accessible RESTful API backend designed to democratize access to Indian government welfare schemes without relying on middleman intermediaries. 

> [!IMPORTANT]
> **Strict Non-Commercial Principle:**  
> INVESTMATE is purely educational and awareness-driven. It **does NOT** process financial investments, collections, loans, or transactions, and **never stores** sensitive citizen identity documents (such as Aadhaar or PAN card numbers).

---

## 2. Technology Stack

- **Runtime:** Node.js (v18+ LTS, v20+ recommended)
- **Web Framework:** Express.js 4.x
- **Database Engine:** MongoDB (via Mongoose 8.x ODM)
- **Resilience Engine:** Dual-mode architecture (Auto-detects active MongoDB instance; seamlessly activates in-memory factual data store when offline)
- **Authentication & Security:** 
  - JSON Web Tokens (`jsonwebtoken`)
  - Password hashing with salted rounds (`bcryptjs`)
  - HTTP security headers (`helmet`)
  - Cross-Origin Resource Sharing (`cors`)
  - Rate limiting on authentication (`express-rate-limit`)
  - Payload sanitization & validation (`express-validator`)
- **Performance Optimization for 2G/3G Networks:**
  - Gzip/Deflate payload compression (`compression`)
  - Fast projection mode (`?lite=true`)
  - Database indexes on text search, slugs, categories, and timestamps

---

## 3. Project Directory Structure

```text
INVESTMATE/
├── auth.html                   # Citizen login, registration, and profile management
├── calculator.html             # Educational awareness calculator (APY, PM-KISAN, SSY)
├── index.html                  # Platform landing page, categories, and featured schemes
├── scheme-detail.html          # Scheme detail, Fine-Print transparency, document checklist
├── scheme.html                 # Schemes directory with search, filter, and pagination
├── style.css                   # High-contrast, accessible, mobile-first stylesheet
├── api.js                      # Universal frontend API client
│
└── backend/
    ├── config/
    │   └── db.js               # Resilient MongoDB connector & fallback coordinator
    ├── controllers/
    │   ├── authController.js   # User registration, login, profile, and guest sessions
    │   ├── schemeController.js # Schemes CRUD, search, filter, and fine-print updates
    │   ├── categoryController.js # Category management and scheme counts
    │   ├── documentController.js # Document checklist and preparation instructions
    │   └── adminController.js  # Administrative platform metrics and insights
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification and role-based access control
    │   ├── errorMiddleware.js  # Centralized error handling and standard JSON responses
    │   ├── rateLimitMiddleware.js # Brute-force protection & DDoS rate limiters
    │   └── validateMiddleware.js # Input validation rules (express-validator)
    ├── models/
    │   ├── User.js             # User model with bcrypt pre-save hashing
    │   ├── Scheme.js           # Comprehensive scheme model with FinePrint subschema
    │   ├── Category.js         # Welfare domain categories with auto-slugs
    │   └── DocumentChecklist.js# Document checklist model with preparation rules
    ├── routes/
    │   ├── authRoutes.js       # /api/auth routes
    │   ├── schemeRoutes.js     # /api/schemes routes
    │   ├── categoryRoutes.js   # /api/categories routes
    │   ├── documentRoutes.js   # /api/documents routes
    │   └── adminRoutes.js      # /api/admin routes
    ├── services/
    │   ├── authService.js      # Authentication business logic & tokens
    │   └── schemeService.js    # Scheme queries, pagination, and search logic
    ├── utils/
    │   ├── apiResponse.js      # Standardized JSON response envelope
    │   ├── generateToken.js    # JWT generation and verification
    │   └── memoryStore.js      # High-performance in-memory factual data store
    ├── seeders/
    │   ├── seedData.js         # 100% verified official Government of India scheme data
    │   └── seed.js             # Database seeding script
    ├── test/
    │   └── api.test.js         # Automated end-to-end test suite (16 tests)
    ├── .env                    # Environment variables file
    ├── .env.example            # Environment variables template
    ├── package.json            # Node.js dependencies and scripts
    ├── README.md               # Backend technical documentation
    └── server.js               # Express application entrypoint
```

---

## 4. Environment Variables (`.env`)

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Server Network
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Local instance or MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/investmate

# JWT Secrets
JWT_SECRET=investmate_super_secret_jwt_key_2026_rural_financial_awareness
JWT_EXPIRES_IN=7d

# CORS Policy
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
AUTH_RATE_LIMIT_MAX=20
```

---

## 5. Getting Started & Installation

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Seed Verified Sample Data
The database seeder populates verified Indian government schemes (PM-KISAN, Ayushman Bharat PM-JAY, Atal Pension Yojana, PMSBY, PMJJBY, Sukanya Samriddhi Yojana, PM-SYM, IGNOAPS), categories, and demonstration accounts:

```bash
npm run seed
```

### Step 3: Run the Backend Server
- **Development Mode (Auto-restart on save):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```
The server will boot on port `5000`:
- **API Base:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

### Step 4: Run the Automated Test Suite
Run the 16 automated tests verifying authentication, scheme search, fine-print transparency, document checklists, and admin access control:

```bash
npm test
```

---

## 6. Pre-Configured Test Accounts

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@investmate.gov.in` | `Admin@Secure123` | Full access to add, edit, verify, and delete schemes & view dashboard metrics |
| **Citizen (Farmer)** | `farmer.ramesh@investmate.in` | `Farmer@Ramesh123` | Regular citizen user (Hindi preference) |
| **Frontline Worker** | `asha.sunita@investmate.in` | `Sunita@Asha123` | ASHA facilitator account |
| **Guest Access** | *No account required* | *None* | Complete public browsing of all schemes & checklists |

---

## 7. REST API Reference

All responses follow a predictable JSON format:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable status",
  "data": { ... },
  "meta": { "total": 8, "page": 1, "limit": 10 }
}
```

### A. Authentication Module (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user. Hashes password with bcrypt. |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT token. |
| `GET` | `/api/auth/profile` | Protected (JWT) | Retrieves current logged-in citizen/admin profile. |
| `PUT` | `/api/auth/profile` | Protected (JWT) | Updates full name and preferred language. |
| `POST` | `/api/auth/logout` | Public | Informative logout response to clear client token. |
| `POST` | `/api/auth/guest` | Public | Guest session authorization. |

#### Sample Registration Payload:
```json
{
  "fullName": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "password": "Password@123",
  "preferredLanguage": "hi",
  "role": "user"
}
```

---

### B. Schemes Management Module (`/api/schemes`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/schemes` | Public / Guest | Paginated list of schemes with optional `category`, `status`, and `lite=true` parameters. |
| `GET` | `/api/schemes/:id` | Public / Guest | Retrieve full scheme details by MongoDB ObjectId or URL-friendly slug. |
| `GET` | `/api/schemes/search` | Public / Guest | Fast search across scheme names, descriptions, eligibility (age, occupation), and keywords. |
| `GET` | `/api/schemes/category/:categoryId` | Public / Guest | Schemes filtered by category ObjectId or slug. |
| `POST` | `/api/schemes` | Admin Only | Create new government welfare scheme. |
| `PUT` | `/api/schemes/:id` | Admin Only | Update existing scheme details. |
| `DELETE` | `/api/schemes/:id` | Admin Only | Delete a scheme and its document checklist. |
| `PUT` | `/api/schemes/:id/fine-print` | Admin Only | Update fine-print disclosures directly. |
| `PATCH` | `/api/schemes/:id/verify` | Admin Only | Update fact-check verification status & source. |

#### Low-Bandwidth Mode (`?lite=true`):
Appending `?lite=true` drops bulky detailed paragraphs and returns only lightweight index cards (`name`, `slug`, `category`, `shortDescription`, `benefits`, `lastVerifiedDate`, and `lockInPeriod`), reducing network payload size by **over 70%** for 2G/3G rural networks.

---

### C. Fine-Print Transparency Module

Every scheme response includes explicit, non-bureaucratic fine-print disclosures:

```json
"finePrint": {
  "lockInPeriod": "Lock-in until the subscriber attains 60 years of age.",
  "exitPenalties": "Premature exit allowed only for terminal illness or demise. Co-contribution interest forfeited in voluntary exit.",
  "hiddenCharges": "Overdue interest fee of ₹1 to ₹10/month for delayed auto-debit.",
  "withdrawalConditions": "Regular monthly pension disbursement begins strictly upon age 60.",
  "expectedReturns": "Guaranteed minimum return backed by Government of India ensuring chosen pension tier (₹1,000-₹5,000/mo).",
  "inflationAdjustedReturns": "Information not verified (Statutory pension is fixed in rupee terms).",
  "importantWarnings": [
    "Keep sufficient balance on auto-debit dates to prevent account freezing.",
    "Do NOT pay cash to any middleman promising accelerated enrollment."
  ],
  "isVerified": true,
  "verificationSource": "PFRDA / Ministry of Finance (pfrda.org.in)"
}
```

> [!NOTE]
> **Zero Financial Fiction:** If official, verified data is unavailable for returns, the field strictly displays `"Information not verified"`.

---

### D. Document Checklist Module (`/api/documents`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/documents/:schemeId` | Public / Guest | Retrieve list of required identity/land documents with step-by-step preparation instructions. |
| `PUT` | `/api/documents/:schemeId` | Admin Only | Update document requirements, guidelines, and accepted alternatives. |

#### Sample Document Checklist Response:
```json
{
  "schemeName": "PM-KISAN",
  "documents": [
    {
      "docId": "doc-1",
      "name": "Aadhaar Card",
      "purpose": "Primary identity proof and Aadhaar-seeded Direct Benefit Transfer (DBT) verification.",
      "preparationInstructions": "Ensure mobile number is linked for OTP. Keep original ready with 2 self-attested photocopies.",
      "isMandatory": true,
      "whereToObtain": "UIDAI Aadhaar Enrolment Centre or Post Office",
      "digitalFormatAccepted": true
    }
  ],
  "preparationGuidelines": [
    "Never hand over original documents to unauthorized intermediaries.",
    "Verify that your bank account is Aadhaar seeded (NPCI mapped) for DBT."
  ]
}
```

---

### E. Categories Module (`/api/categories`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Active categories with real-time active schemes count. |
| `GET` | `/api/categories/:id` | Public | Single category details by ID or slug. |
| `POST` | `/api/categories` | Admin Only | Create new category. |
| `PUT` | `/api/categories/:id` | Admin Only | Update category name, description, or icon. |
| `DELETE` | `/api/categories/:id` | Admin Only | Delete category (blocked if active schemes are attached). |

---

### F. Admin Dashboard Module (`/api/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin Only (JWT) | Platform overview metrics: total schemes, active vs discontinued count, total registered citizens, most-viewed schemes, and category breakdown. |

---

## 8. Frontend Integration

The backend serves the frontend files (`index.html`, `scheme.html`, `scheme-detail.html`, `calculator.html`, `auth.html`, `style.css`, `api.js`) seamlessly:

1. **Option A (Unified Server):**  
   Run `npm start` in `backend/` and visit `http://localhost:5000/`. The backend serves the HTML, CSS, and JS files directly.
2. **Option B (Separate Frontend Server / Live Server):**  
   Open `index.html` via VS Code Live Server or python http server (`http://localhost:3000`). The frontend client (`api.js`) automatically points to `http://localhost:5000/api` and includes full CORS support.
=======
# investmate1
>>>>>>> cb05c0c1c4bd20c9d798c37014129e0ede4f5b9a
