# DTN INDIA — NEW CONNECTION APPLICATION PORTAL
### Digital Telco Network India Pvt. Ltd. (DTN India)

A full-stack, secure, mobile-first web application designed to digitize DTN India's physical customer application form and provide an operational management dashboard with Excel export capabilities.

---

## 📌 Project Overview

This application serves as an independent, standalone demonstration portal for Digital Telco Network India Pvt. Ltd. It faithfully implements:
1. **The Visual Identity & Branding** from the existing DTN India website (Deep Teal `#0E272B`, DTN Gold `#E59836`, Crimson Red `#D92626`, clean responsive typography, and official helpline `9810114338`).
2. **The Exact Required Fields** from DTN India's physical customer application form (References 1, 2, 3, 4, 8, 12, 14, 15, 16, 20, 21, 22, and 23).
3. **Operational Administration**: An administrator dashboard with search, filtering, application detail view, document verification, status transitions, and one-click Excel (.xlsx) export.
4. **Simulated Payment Workflow**: A transparent, clearly labelled payment simulation module (UPI, NetBanking, Cards) allowing demonstration of success, failure, and retry flows without handling real currency.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express 5, TypeScript (TSX runtime), Helmet, CORS, Morgan |
| **Database** | SQLite via SQL.js (ACID-compliant relational database persisted to disk at `server/data/dtn_application_portal.db`) |
| **Excel Generation** | ExcelJS (formatted headers, corporate styling, currency/number formatting, formula injection defense) |
| **File Storage** | Private sandboxed storage (`server/uploads/`) with magic-byte file signature validation and UUID filenames |
| **Security** | Bcrypt (cost factor 12) password hashing, JWT authentication, magic byte file validation, CORS origin control |

---

## 📂 Project Directory Structure

```
d:\DTN application form/
├── client/                              # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/                  # UI Components
│   │   │   ├── Header.tsx               # DTN India branded header & navigation
│   │   │   ├── Footer.tsx               # DTN India corporate footer
│   │   │   ├── StepProgressBar.tsx      # 6-step progress indicator
│   │   │   ├── TermsModal.tsx           # Service Terms & Conditions modal
│   │   │   └── steps/                   # Multi-step form components
│   │   │       ├── Step1Applicant.tsx   # Applicant category & personal details
│   │   │       ├── Step2Address.tsx     # Connection & permanent address
│   │   │       ├── Step3Plan.tsx        # Plan selection & live tariff breakdown
│   │   │       ├── Step4Documents.tsx   # Photo & KYC document uploader
│   │   │       ├── Step5Review.tsx      # Comprehensive review & self-declaration
│   │   │       └── Step6Payment.tsx     # Confirmation & simulated payment checkout
│   │   ├── pages/
│   │   │   ├── CustomerPortal.tsx       # Main multi-step application wizard
│   │   │   ├── AdminPortal.tsx          # Administrator dashboard & management
│   │   │   └── ApplicationStatusLookup.tsx # Customer status tracking portal
│   │   ├── services/                    # API client layer
│   │   ├── types/                       # Shared TypeScript interfaces
│   │   ├── App.tsx                      # Root application & view routing
│   │   └── index.css                    # Tailwind CSS definitions
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                              # Node.js + Express Backend
│   ├── data/
│   │   └── dtn_application_portal.db    # Persistent SQLite database file
│   ├── uploads/                         # Private document upload sandbox
│   ├── src/
│   │   ├── controllers/                 # Applications, Admin, Plans, Documents, Payments
│   │   ├── db/                          # Database connection & schema
│   │   ├── middleware/                  # JWT auth, Multer upload & magic bytes validator
│   │   ├── routes/                      # API endpoints (`/api/...`)
│   │   ├── scripts/
│   │   │   ├── seed.ts                  # Seeds demo plans & default admin
│   │   │   └── test-workflow.ts         # Comprehensive 9-point automated test suite
│   │   ├── services/                    # ExcelJS spreadsheet generator
│   │   ├── types/                       # Backend TypeScript types
│   │   └── index.ts                     # Express server & static hosting
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                             # Environment configuration
├── .env.example                         # Environment configuration template
├── .gitignore                           # Git ignore rules
└── README.md                            # Comprehensive project guide
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v20+ recommended) and npm.

### 2. Install Dependencies

From the project root:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
cd ..
```

### 3. Initialize & Seed Database
The database seeds demonstration plans, sample records, and the administrator account automatically on first start, or manually via:
```bash
cd server
npm run seed
cd ..
```

### 4. Start the Application

You can run the unified backend server which serves both the API and the compiled React frontend, or run both servers concurrently:

**Option A: Unified Server (Single Port)**
```bash
cd client
npm run build

cd ../server
npm run dev
```
Access at: **`http://localhost:5000`**

**Option B: Concurrent Development (HMR Enabled)**
- **Backend**: `http://localhost:5000`
- **Frontend (Vite Dev Server)**: `http://localhost:5173`

---

## 🔑 Demonstration Credentials & URLs

| Portal | URL | Credentials / Notes |
|---|---|---|
| **Customer Application Portal** | `http://localhost:5173` or `http://localhost:5000` | No login required for customers |
| **Application Status Tracker** | Click **"Track Status"** in header | Search by Application ID (e.g. `DTN-2026-000101`) |
| **Administrator Dashboard** | Click **"Admin Dashboard"** in header | **Username**: `admin`<br>**Password**: `Admin@DTN2026!` |

---

## 📋 Customer Workflow Walkthrough

1. **Step 1: Applicant Details** (References 1, 2, 3, 4, 8, 12, 14)
   - Select Applicant Category: *Residential* (reveals Owner/Tenant) or Organization (*SME, Corporate, Wholesale, NGO, Educational, Government* which reveals Organization Name and Authorized Representative).
   - Enter Title, Full Name, Date of Birth, Gender, Existing Customer info, 10-digit Indian Mobile (`+91`), and Contact Email.
2. **Step 2: Address Details** (References 15, 16)
   - Enter Connection / Correspondence address (the installation site).
   - Check *"My permanent address is the same as my connection address"* to auto-populate permanent address, or uncheck to specify a different address.
3. **Step 3: Internet Plan & Billing** (References 20, 21)
   - Choose Billing Frequency: *Monthly, Quarterly, Half-Yearly, or Annual* (annual provides 20% savings + free installation).
   - Select an optical fibre plan (50 Mbps Starter, 150 Mbps Premium, 300 Mbps Ultra, or 500 Mbps Enterprise).
   - View live calculated pricing breakdown (Base Price, 18% GST, Installation fee, Total).
4. **Step 4: Document Uploads** (Reference 23)
   - Upload Applicant Photograph, Identity Proof (PAN Card, Voter ID, Aadhaar, Passport, etc.), and Address Proof (Electricity bill, Rent agreement, etc.).
   - File signature (magic bytes) validation verifies authentic JPG, PNG, and PDF formats.
5. **Step 5: Review & Self-Declaration** (Reference 22)
   - Review all entered fields with one-click "Edit" jumps to any previous step.
   - Click to read the full DTN India Broadband Service Terms & Conditions modal.
   - Accept the required self-declaration checkbox and submit.
6. **Step 6: Submission & Payment**
   - Receive a unique, sequential Application ID formatted as `DTN-2026-XXXXXX`.
   - The application is permanently committed to SQLite.
   - Simulated payment terminal allows testing **Success**, **Failure**, and **Cancellation** outcomes.
   - On success, transaction ID is generated and receipt can be printed.

---

## 📊 Administrator Dashboard & Excel Export

1. Log in at the Administrator Portal with `admin` / `Admin@DTN2026!`.
2. View real-time metric cards (Total Applications, Submitted, Under Review, Approved, Paid, Pending/Failed).
3. Search by Application ID, Name, Phone, Email, or Organization.
4. Filter by Category, Application Status, Payment Status, or Date range.
5. Click **"EXPORT TO EXCEL"** to generate and download a corporate-styled `.xlsx` workbook containing:
   - Formatted DTN India corporate header row (`#0E272B`) with gold borders.
   - All 36 application fields.
   - Currency formatting (`₹#,##0.00`) and date-time localization.
   - Defense against CSV/formula injection (safely sanitizing leading `=`, `+`, `-`, `@`).
   - Exports all matching filtered records.
6. Click **"View"** on any application to open the detail view:
   - Inspect full details, addresses, and pricing snapshot.
   - Securely preview or download uploaded KYC documents.
   - Update application status (*Submitted → Under Review → Approved → Rejected*) with internal audit notes.

---

## 🛡️ Security & Privacy Implementation

- **No Public Document Exposure**: Uploaded identity and address documents are stored in `server/uploads/` with randomized UUID filenames outside the web root. Files are served strictly via authenticated streaming endpoints.
- **Magic-Byte Content Validation**: Uploads are inspected for binary signatures (`FF D8 FF` for JPG, `89 50 4E 47` for PNG, `%PDF-` for PDF), rejecting disguised executables even if given a safe extension.
- **Formula Injection Defense**: All text cells in Excel exports are checked; leading `=`, `+`, `-`, or `@` characters are escaped to prevent spreadsheet command execution.
- **Backend Price Integrity**: All prices, taxes (18% GST), and total payable amounts are calculated server-side from the database; client-supplied monetary values are never trusted.
- **Pricing Snapshot Immutability**: Submitted applications store an immutable pricing snapshot so future tariff changes do not mutate past applications.
- **Password Security**: Passwords are saved with bcrypt hashing (12 salt rounds).

---

## 💳 Integrating a Production Payment Gateway Later

To migrate from the simulated payment gateway to an official Indian provider (e.g., **Razorpay**, **Cashfree**, or **PayU**):

1. Obtain official test API keys from the provider portal.
2. Update `server/.env`:
   ```ini
   PAYMENT_MODE=razorpay_sandbox
   RAZORPAY_KEY_ID=rzp_test_your_key_here
   RAZORPAY_KEY_SECRET=your_secret_here
   ```
3. Install the official SDK: `npm install razorpay` in `server`.
4. In `server/src/controllers/paymentsController.ts`, uncomment the Razorpay order creation block in `initiatePayment` and webhook signature verification in `processPaymentCallback`.

---

## 🧪 Automated Verification Test Suite

To run the complete 9-point end-to-end automated verification suite:
```bash
cd server
npx tsx src/scripts/test-workflow.ts
cd ..
```
**Test Coverage:**
- `[TEST 1]` Health check endpoint verification
- `[TEST 2]` Demonstration plans API retrieval
- `[TEST 3]` Genuine PNG document upload
- `[TEST 3B]` Malicious/prohibited file signature rejection
- `[TEST 3C]` Valid PDF identity document upload
- `[TEST 4]` Full application submission & backend pricing calculation
- `[TEST 5]` Payment failure simulation, retry, and success confirmation
- `[TEST 6]` Administrator authentication & protected route enforcement
- `[TEST 7]` Admin stats calculation & multi-field search
- `[TEST 8]` Status transition with audit trail logging
- `[TEST 9]` ExcelJS workbook generation, corporate formatting, and export

---

## ⚖️ DTN India Review & Production Checklist

Before deploying this portal into official production on DTN India's infrastructure, DTN India management should:
1. **Approve Official Plans & Tariffs**: Replace sample demonstration rates in `server/src/scripts/seed.ts` with officially approved commercial packages and GST rules.
2. **Review Legal Terms & Conditions**: Replace prototype terms in `TermsModal.tsx` with legal counsel approved Service Level Agreements.
3. **Configure Official Payment Gateway**: Add company Razorpay/Cashfree credentials.
4. **Deploy SSL/TLS Certificate**: Enforce HTTPS on the production domain.
5. **Configure Production Storage**: Switch private local directory storage (`server/uploads/`) to private AWS S3 / Google Cloud Storage buckets with signed URL access.
