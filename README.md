# HostelHub Pro - Campus Residence Portal (MERN Stack)

A complete full-stack **MERN (MongoDB, Express.js, React, Node.js)** migration of the Hostel Hub Campus Residence & Room Maintenance application.

---

## 🌟 Overview & Preserved Interface

This project preserves 100% of the original application design, styling, and functionality while upgrading from vanilla JavaScript/localStorage to a production-grade MERN architecture:

- **Frontend**: React 18, Vite, centralized Fetch API service, React Context for Theme/Auth/Toast state.
- **Backend**: Node.js, Express.js REST API with validation, centralized error handling, and role-based JWT auth.
- **Database**: MongoDB with Mongoose schemas (User, Complaint, Menu, Notice, Warden, Staff).
- **Security**: `bcryptjs` password hashing, JWT bearer tokens, role-based route protection (`student` vs `warden`).
- **Aesthetics Preserved**: Dark & Light mode toggle, Glassmorphism cards with backdrop blur, emergency badges with CSS pulse animations, responsive grid layouts.

---

## 📁 Project Structure

```text
├── .gitignore
├── package.json               # Root scripts (concurrently dev, seed, test, build)
├── README.md
├── docs/
│   └── API.md                 # Complete REST API specification
├── server/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tests/
│   │   └── api.test.js        # Unit & validator tests
│   └── src/
│       ├── app.js             # Express app, middleware, routes, 404 & error handlers
│       ├── server.js          # Server entry point & DB connection
│       ├── config/
│       │   └── db.js          # Mongoose DB connector
│       ├── controllers/       # Auth, Complaints, Menu, Wardens, Notices, Dashboard
│       ├── middleware/        # JWT auth, role authorization, centralized errorHandler
│       ├── models/            # User, Complaint, Menu, Notice, Warden, Staff Mongoose models
│       ├── routes/            # REST API routers
│       ├── seed/
│       │   └── seed.js        # Idempotent database seeder (upserts without duplicates)
│       └── validators/        # Request & ID validation helpers
└── client/
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   └── manifest.json      # PWA Web App Manifest
    └── src/
        ├── App.jsx            # Main app container & tab routing
        ├── main.jsx           # React DOM root with Context Providers
        ├── components/
        │   ├── common/        # Modal, ToastContainer, Icons, AuthModal
        │   ├── dashboard/     # StatsOverview metric cards & emergency banner
        │   └── layout/        # Header, brand logo, navigation tabs, theme/role toggles
        ├── context/           # AuthContext, ThemeContext, ToastContext
        ├── features/
        │   ├── admin/         # Warden administration dashboard & dispatch queue
        │   ├── complaints/    # ComplaintsTracker, ComplaintModal, UpdateComplaintModal
        │   ├── menu/          # FoodMenu weekly schedule & EditMealModal
        │   ├── notices/       # NoticeBoard circulars & NoticeModal
        │   └── wardens/       # WardenDirectory & Emergency technicians directory
        ├── services/
        │   └── api.js         # Centralized API service
        └── styles/
            └── index.css      # Preserved CSS variables, glassmorphism, animations
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (or a MongoDB Atlas connection URI)

### 2. Install Dependencies
Run the following from the project root:
```bash
# Install root, server, and client dependencies
npm run install:all
```
*(Or install manually in each folder: `npm install`, `cd server && npm install`, `cd ../client && npm install`)*

### 3. Environment Configuration

#### Server (`server/.env`):
Create `server/.env` (copy from `server/.env.example`):
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/hostel_management
JWT_SECRET=super_secret_jwt_key_hostelhub_pro_2026
JWT_EXPIRES_IN=1d
```

#### Client (`client/.env`):
Create `client/.env` (copy from `client/.env.example`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Seed the Database
Run the idempotent seed script to populate initial users, weekly food menu, complaints, wardens, staff, and notices:
```bash
npm run seed
```

#### Default Seed Credentials:
- **Warden Account**:
  - Email: `warden@hostelhub.edu`
  - Password: `WardenPass123!`
  - Privileges: Can assign staff, resolve tickets, edit food menus, post circulars, and access Warden Portal.
- **Student Account**:
  - Email: `student@hostelhub.edu`
  - Password: `StudentPass123!`
  - Privileges: Can view schedules, contacts, circulars, and file room maintenance complaints.

*(Note: The Sign In modal includes convenient one-click demo buttons to automatically populate these credentials).*

### 5. Running the Application

Start both client and server concurrently with a single command:
```bash
npm run dev
```

Or start them individually in separate terminals:
```bash
# Terminal 1 - Backend API Server
npm run server

# Terminal 2 - Frontend Vite React Client
npm run client
```

### 6. Local Application URLs
- **Frontend Portal**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing

Run backend validator and unit tests:
```bash
npm test
```

---

## 🛠️ Production Build

To test and build the production bundle of the React client:
```bash
npm run build
```

The compiled assets will be output to `client/dist/`.

---

## 🔐 Security Features

1. **Password Protection**: Passwords hashed using `bcryptjs` with salt rounds = 12.
2. **JWT Authorization**: Requests to sensitive endpoints (`PATCH /api/complaints/:id`, `PATCH /api/menu/:id`, `POST /api/notices`, etc.) verify bearer tokens and warden roles.
3. **Data Sanitization**: Defensive request validation ensures allowed enum values and sanitizes strings against basic injection.
4. **Secret Isolation**: Secrets reside purely in `server/.env` and are strictly excluded via `.gitignore`.
