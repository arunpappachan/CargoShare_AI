# CARGOSHARE AI — MASTER PROJECT RECORD & TECHNICAL KNOWLEDGE BASE

> **Purpose:** This document contains the complete end-to-end technical documentation, system specifications, database schemas, API references, architecture, and viva defense Q&A for the **CargoShare AI** project. You can copy-paste this document or upload it directly to ChatGPT to query anything about your project.

---

## 1. PROJECT METADATA & QUICK REFERENCE

* **Project Title:** CargoShare AI
* **Tagline:** Intelligent Maritime Logistics & Partial Container Space Sharing Platform
* **Domain:** Maritime Shipping, Freight Logistics (LCL / FCL), Supply Chain Tech, Cloud Computing
* **Architecture:** Decoupled Client-Server (SPA + REST API + WebSockets + Managed RDBMS)
* **Frontend Repository / Deploy:** `https://cargoshare-frontend.onrender.com`
* **Backend API / Deploy:** `https://cargoshare-backend-876x.onrender.com`
* **Database Engine:** Managed PostgreSQL (Render Cloud & Local Postgres 18)
* **GitHub Repository:** `https://github.com/arunpappachan/CargoShare_AI`
* **Primary Roles:** Exporter, Carrier (Shipping Line), Platform Administrator

---

## 2. EXECUTIVE SUMMARY & PROBLEM STATEMENT

### 2.1 The Problem
* **Underutilized Container Capacity:** Maritime container ships regularly sail with 15–30% unused container volume, creating dead freight, revenue loss for shipping lines, and unnecessary carbon emissions.
* **Prohibitive Costs for SMEs:** Small and Medium-sized Enterprises (SMEs) rarely have enough cargo to fill an entire 20ft or 40ft container (Full Container Load - FCL). Hiring full containers is financially unviable.
* **Opaque & Fragmented Freight Forwarding:** Traditional Less-than-Container Load (LCL) booking relies on lengthy email chains, manual phone calls, paper bills of lading, and excessive middleman markups.
* **Financial Risk & Payment Insecurity:** Carriers risk booking cancellations and cargo abandonment; exporters face payment fraud without transparent escrow mechanisms.

### 2.2 The CargoShare AI Solution
CargoShare AI is a centralized digital marketplace that connects verified ocean carriers with exporters to book fractional container volume measured in **Cubic Meters (CBM)**.
* Exporters discover scheduled voyages, calculate dynamic freight costs, pay a 25% advance token via instant **UPI QR Scanner**, upload customs documents, and track voyage milestones.
* Carriers publish remnant container space, review booking requests, inspect trade documentation, and monitor capacity utilization.
* Real-time negotiation is facilitated through **Socket.io WebSockets**, and the platform is governed by an **Administrative Portal** with automated fraud detection and commission auditing.

---

## 3. FULL TECHNOLOGY STACK SPECIFICATION

### Frontend (Client Layer)
* **Framework:** React 19 (`react: ^19.2.8`, `react-dom: ^19.2.8`)
* **Build Tool:** Vite (`vite: ^5.4.1`)
* **Routing:** React Router DOM (`react-router-dom: ^7.1.5`)
* **Styling:** Tailwind CSS (`tailwindcss: ^3.4.1`, `postcss: ^8.4.35`, `autoprefixer: ^10.4.18`)
* **Icons:** Lucide React (`lucide-react: ^0.475.0`)
* **Geospatial & Mapping:** Leaflet (`leaflet: ^1.9.4`) & Google Maps API (`@react-google-maps/api: ^2.20.8`)
* **Real-Time Client:** Socket.io Client (`socket.io-client: ^4.8.3`)

### Backend (Server Layer)
* **Runtime:** Node.js (v20+ / v24)
* **Web Framework:** Express.js (`express: ^4.22.2`)
* **Real-Time Engine:** Socket.io (`socket.io: ^4.8.3`)
* **Database Client:** `pg` (node-postgres: `^8.11.5`) with connection pooling
* **Authentication:** JSON Web Tokens (`jsonwebtoken: ^9.0.2`)
* **Password Hashing:** `bcrypt` (`bcrypt: ^5.1.1`, 10 salt rounds)
* **CORS Handling:** `cors: ^2.8.6`
* **Environment Config:** `dotenv: ^16.4.5`
* **Email Notification:** `nodemailer: ^9.0.5`

### Database Layer
* **RDBMS:** PostgreSQL (relational tables with JSONB document support)
* **Deployment:** Render Managed PostgreSQL with automated SSL connection pooling
* **Fault Tolerance:** Built-in in-memory fallback stores (`fallbackSpaces`, `fallbackBookings`, `fallbackMessages`) preventing downtime during database updates.

### Cloud & DevOps Infrastructure
* **Host Platform:** Render Cloud (`render.yaml` Blueprint Infrastructure-as-Code)
* **Architecture:** 
  1. `cargoshare-db`: Managed PostgreSQL database (Free tier).
  2. `cargoshare-backend`: Node.js Express Web Service with `/api/health` monitoring.
  3. `cargoshare-frontend`: Vite React Static Site with SPA client-side routing rewrite (`/*` → `/index.html`).

---

## 4. DATABASE SCHEMA DESIGN (POSTGRESQL)

### 1. `users` Table
Stores authenticated account credentials and profile details.
```sql
CREATE TABLE users (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'exporter', -- 'exporter', 'carrier', 'admin'
  company_name VARCHAR(255) DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  region VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `spaces` Table
Stores published container voyage capacity posted by carriers.
```sql
CREATE TABLE spaces (
  id VARCHAR(50) PRIMARY KEY,          -- e.g. 'SP-5001'
  vessel VARCHAR(255) NOT NULL,        -- Vessel name (e.g. 'MSC Oscar')
  carrier VARCHAR(255) NOT NULL,       -- Shipping line (e.g. 'Oceanic Freight Ltd.')
  origin VARCHAR(100) NOT NULL,        -- Departure port (e.g. 'Nhava Sheva / JNPT')
  dest VARCHAR(100) NOT NULL,          -- Destination port (e.g. 'Mundra Port')
  date VARCHAR(50) NOT NULL,           -- Sailing date (YYYY-MM-DD)
  capacity NUMERIC NOT NULL,           -- Total published volume (CBM)
  available NUMERIC NOT NULL,          -- Remaining available volume (CBM)
  price NUMERIC NOT NULL,              -- Rate per CBM in USD / INR
  status VARCHAR(50) DEFAULT 'Available', -- 'Available', 'Full', 'Departed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `bookings` Table
Stores freight contracts, payment splits, and tracking lifecycle.
```sql
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,          -- e.g. 'CS-1001'
  space_id VARCHAR(50),                -- Foreign reference to spaces.id
  route VARCHAR(255) NOT NULL,         -- Route string
  carrier VARCHAR(255) DEFAULT 'AI Assigned Carrier',
  exporter_name VARCHAR(255) DEFAULT 'Global Exports SME',
  cbm NUMERIC NOT NULL,                -- Booked volume
  commodity VARCHAR(255) DEFAULT 'General Cargo',
  weight NUMERIC,                      -- Gross weight in KG
  special_req TEXT DEFAULT 'None',     -- Refrigeration, hazard class, etc.
  status VARCHAR(50) DEFAULT 'Pending Confirmation', -- 'Pending Confirmation', 'Approved', 'In Transit', 'Delivered'
  payment_status VARCHAR(50) DEFAULT 'Advance Paid (25%)',
  payment_method VARCHAR(100) DEFAULT 'UPI Advance (25%)',
  amount_paid NUMERIC DEFAULT 0,       -- Advance paid amount
  advance_amount NUMERIC DEFAULT 0,    -- 25% token amount
  balance_amount NUMERIC DEFAULT 0,    -- 75% balance due upon BOL release
  total_amount NUMERIC DEFAULT 0,      -- Total contract value (CBM * Rate + Tax)
  transaction_id VARCHAR(100),         -- e.g. 'TXN-98421033'
  document_name VARCHAR(255) DEFAULT 'Commercial_Invoice.pdf',
  documents JSONB DEFAULT '[]'::jsonb, -- Array of attached document filenames
  date VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. `messages` Table
Stores real-time negotiation chat history between exporters and carriers.
```sql
CREATE TABLE messages (
  id VARCHAR(100) PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL,     -- Foreign reference to bookings.id
  text TEXT NOT NULL,                  -- Message text
  sender_name VARCHAR(100) DEFAULT 'Anonymous',
  role VARCHAR(50) NOT NULL,           -- 'exporter', 'carrier', 'admin'
  time VARCHAR(50),                    -- Formatted time (e.g. '10:15 AM')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 5. `documents` Table
Stores trade paperwork records uploaded by exporters for customs verification.
```sql
CREATE TABLE documents (
  doc_id VARCHAR(50) PRIMARY KEY,      -- e.g. 'DOC-1001'
  booking_id VARCHAR(50),              -- Reference to booking
  type VARCHAR(100) NOT NULL,          -- 'Commercial Invoice', 'Packing List', 'Bill of Lading', etc.
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'Pending Review', -- 'Verified', 'Pending Review', 'Rejected'
  uploaded_by VARCHAR(100) DEFAULT 'Exporter',
  date VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. COMPLETE REST API ENDPOINTS

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API status and PostgreSQL engine check | No |
| `GET` | `/api/health` | Service health check (used by Render) | No |
| `POST` | `/api/auth/register` | Register new Exporter or Carrier account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/users/profile` | Get current logged-in user details | Yes (Bearer JWT) |
| `PUT` | `/api/users/profile` | Update user profile information | Yes (Bearer JWT) |
| `GET` | `/api/admin/users` | Retrieve all users with filter support | Yes (Admin Role) |
| `GET` | `/api/spaces` | Search container spaces (origin, dest, date) | No |
| `POST` | `/api/spaces` | Post new vessel container space | Yes (Carrier) |
| `GET` | `/api/bookings` | List all bookings | No |
| `POST` | `/api/bookings` | Create new booking & decrement space | No |
| `PATCH`| `/api/bookings/:id/status` | Approve, Accept, or Reject a booking | Yes (Carrier) |
| `PATCH`| `/api/bookings/:id/payment`| Update UPI QR advance payment status | No |
| `GET` | `/api/documents` | Fetch documents (filter by `bookingId`) | No |
| `POST` | `/api/documents` | Upload new customs/shipping document | No |
| `GET` | `/api/messages/:bookingId` | Fetch chat negotiation history | No |
| `POST` | `/api/messages` | Save chat message and trigger Socket.io | No |

---

## 6. KEY FUNCTIONAL MODULES & FEATURES

### Module 1: Exporter Dashboard (`/dashboard/exporter`)
1. **Search Space:** Exporters select origin port (e.g. Nhava Sheva/JNPT), destination port (Mundra, Dubai), sailing date, and required volume in CBM.
2. **Instant Price Calculation:** Calculates total freight cost based on per-CBM pricing plus standard 18% maritime tax, displaying the 25% advance token split.
3. **Razorpay Standard Checkout:** Integrated official Razorpay Checkout popup supporting cards, UPI, and NetBanking with cryptographic signature verification and automated receipts.
4. **Shipment Tracking Tracker:** Visual milestone tracker showing *Pending Confirmation → Approved → In Transit → Delivered*.
5. **Trade Documents:** Upload and track mandatory trade paperwork (Commercial Invoice, Packing List, Shipping Bill EDI).
6. **Live Carrier Chat Widget:** Socket.io chat widget to communicate directly with shipping lines.

### Module 2: Carrier Portal (`/dashboard/carrier`)
1. **Post Space:** Carriers post upcoming voyage schedules, container vessel names, routes, CBM capacities, and rates per CBM.
2. **Booking Requests Audit:** Carriers inspect incoming cargo bookings, check cargo weight/commodity, view attached documents, and click **Approve** or **Reject**.
3. **Automated Inventory Management:** Confirming a booking automatically subtracts CBM from the vessel's available pool.
4. **Paid Exporters Directory:** Table showing all exporters who have completed advance escrow payments.
5. **Document Viewer Modal:** In-app inspection modal to preview exporter documents before issuing container loading orders.
6. **Performance KPIs:** Real-time statistics showing Month-To-Date (MTD) revenue, active voyages, and container space utilization percentage.

### Module 3: Admin Command Hub (`/dashboard/admin`)
1. **User Master Directory:** Filter and audit exporters, carriers, and administrators.
2. **Booking Oversight:** Global view of all freight contracts across the system.
3. **Fraud Detection Manager:** Algorithmic alert detection flagging high-risk cancellations, fraudulent claims, or suspicious transactions.
4. **Commission & Revenue Tracker:** Automatically calculates marketplace commission (e.g., 5-8% platform fee) on completed transactions.
5. **System Reports Generator:** Comprehensive exportable system statistics.

---

## 7. PRE-CONFIGURED DEMO ACCOUNTS

| Role | Email | Password | Pre-seeded Permissions |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin@cargoshare.ai` | `admin123` | Complete access to Admin Dashboard, Users, and Fraud Alerts |
| **John Exporter** | `exporter@cargoshare.ai` | `password123` | Exporter Dashboard, Search Space, Bookings, UPI Scanner |
| **Captain Maersk** | `carrier@cargoshare.ai` | `password123` | Carrier Dashboard, Post Space, Approve Requests, Document Viewer |

---

## 8. FREQUENTLY ASKED VIVA / PROJECT DEFENSE QUESTIONS

**Q1: What is the primary difference between FCL and LCL, and how does CargoShare AI solve it?**
> *Answer:* FCL (Full Container Load) requires renting an entire 20ft or 40ft container, which is expensive for small businesses. LCL (Less than Container Load) consolidates partial cargo from multiple exporters into one shared container. CargoShare AI automates LCL by allowing exporters to book container space granularly by the Cubic Meter (CBM) at transparent rates.

**Q2: Why did you choose PostgreSQL over MongoDB for production?**
> *Answer:* PostgreSQL provides strict relational integrity, ACID compliance, and structured schemas, which are essential for financial transactions, freight bookings, and booking status lifecycles. Furthermore, Render provides native Managed PostgreSQL hosting with automatic internal database pooling (`DATABASE_URL`) and SSL encryption.

**Q3: How does the real-time negotiation chat work?**
> *Answer:* It uses WebSockets via Socket.io. When a user opens a booking, the client joins a unique room keyed by `bookingId`. Messages sent are saved to the PostgreSQL `messages` table and immediately broadcast to all participants in that specific room without page reloading.

**Q4: How does the payment escrow mechanism operate?**
> *Answer:* Exporters pay an initial 25% token advance via UPI QR scanning to secure the container space. This token is held in escrow while the carrier verifies trade documents and approves the booking. The remaining 75% balance is settled upon Bill of Lading (BOL) issuance and container loading.

**Q5: How is the application deployed on Render?**
> *Answer:* Deployment is automated using Infrastructure as Code (IaC) via `render.yaml`. It automatically provisions a Managed PostgreSQL database, an Express Web Service for the backend API, and a Vite Static Site with client-side SPA routing rewrites (`/*` → `/index.html`).
