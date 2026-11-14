# StaySync — Personal Living Marketplace

StaySync is a production-quality, modular web marketplace designed for individuals relocating to or settling in a new city. It solves the core problem: *“Where should I live, who should I live with, what should I eat, which daily services do I need, and how much will my total monthly living cost be?”*

Tiffin, laundry, and cleaning are optional modules. Users can select any combination of services, configure their budgets, and StaySync will generate custom recommendation bundles.

---

## Technical Stack

- **Backend**: Node.js, Express.js, MongoDB + Mongoose, JSON Web Tokens (JWT), bcryptjs
- **Frontend**: React.js, Vite, Tailwind CSS, React Router (v6), Axios, Lucide React icons
- **Search AI**: Custom English/Hinglish rule-based Natural Language Processing query parser

---

## Key Features

1. **Modular Onboarding & Dashboard**: Only displays services that the tenant selects.
2. **PG/Room Marketplace**: Searchable listing catalog with distance indicators and verified stay checks.
3. **Roommate Matcher**: Computes compatibility percentages against roommate profiles using sleeping habits, cleanliness levels, and smoking/drinking rules, highlighting matches and friction areas.
4. **Living Cost Calculator**: Evaluates rent combined with utility selections (tiffin + laundry + cleaning) against the user's target monthly budget in real-time.
5. **Hinglish/English NLP Search Parser**: Converts queries like *"₹8k room near college with food"* into structured database query filters.
6. **Expense Logger**: Categorized financial tracker displaying income, expenditures, remaining balances, and budget-limit warnings.
7. **Relocation Checklist Planner**: Step-by-step checklist to help users shift cities, with quick links to local providers.
8. **Direct Message Inbox**: In-app thread messaging between tenants, roommates, and landlords using robust client polling.
9. **Verification Toggles & Moderation Controls**: Landlords upload properties, utility providers list prices, and admins approve/reject verification status badges.

---

## Directory Structure

```text
StaySync/
├── backend/             # Express.js REST API server
│   ├── config/          # DB config, environment vars
│   ├── controllers/     # Route handlers (auth, properties, roommate compatibility)
│   ├── models/          # Mongoose collection models
│   ├── routes/          # Express route endpoints
│   ├── services/        # Roommate compatibility & living cost estimators
│   ├── middleware/      # Auth security checks & RBAC
│   ├── ai/              # Regex NLP search parser
│   └── scripts/         # DB seed script
└── frontend/            # React.js SPA Vite app
    ├── src/
    │   ├── components/  # Cards, Verification badges, Calculator
    │   ├── context/     # Global Authentication state
    │   ├── pages/       # Dashboards, ShiftPlanners, Chat, Expenses
    │   └── services/    # Axios client wrapper
    └── tailwind.config.js
```

---

## Setup & Running Guide

### Prerequisites

- [Node.js](https://nodejs.org) (v18+ recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally

---

### Step 1: Run the Backend Service

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Seed the database with our preconfigured realistic mock profiles:
   ```bash
   npm run seed
   ```
4. Start the Express development server:
   ```bash
   npm run start
   ```
   The backend server will run on `http://localhost:5000`.

---

### Step 2: Run the Frontend App

1. Open a second terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## Test Accounts (Password: `password123`)

For review convenience, the seeder preloaded the database with the following demo credentials:

| User Role | Email | Purpose |
| :--- | :--- | :--- |
| **Tenant** | `user@staysync.com` | Test Dashboard, checklist planner, roommate matcher, and expense logger. |
| **Landlord / Owner** | `owner@staysync.com` | Create properties, receive inquiries, view ratings. |
| **Service Provider** | `provider@staysync.com` | Create tiffin plans or laundry prices, accept booking requests. |
| **Administrator** | `admin@staysync.com` | Manage verifications, review system metrics. |
