# Career Bridge (Govt Theme)

Full-stack Government Skill & Employment Portal featuring a **React + Tailwind CSS** frontend, **Node.js/Express** backend, and **Supabase Postgres** database with role-based JWT authentication (`candidate`, `training_center`, `government`, `employer`).

---

## 🎨 Theme & UI Architecture
- **Primary Color**: Navy Blue (`#0B3D6B`)
- **Accent Color**: Vivid Orange (`#FF6B00`)
- **Typography**: Google Font **Roboto**
- **Layout**: Fixed top header (`Header.jsx`) with Government Emblem & role preview switcher, fixed left sidebar (`Sidebar.jsx`) with role-specific navigation menus, and main content area.

---

## 🔒 Role-Based Access Control (RBAC)
The portal supports 4 primary roles:
1. **Candidate / Trainee** (`candidate`): View enrolled skill courses, digital NCVT certificates, direct benefit transfer (DBT) stipends, and skill-matched job openings.
2. **Training Center Provider** (`training_center`): Manage training batches, candidate attendance, infrastructure accreditation, and audit reports.
3. **Government Admin** (`government`): National skilling statistics, budget disbursements, state performance metrics, and center accreditation approval queue.
4. **Employer / Partner** (`employer`): Create job vacancies, search verified candidate database, and manage recruitment pipeline.

---

## 📁 Repository Structure
```
c:/SIH-SKILLING/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Supabase client setup
│   │   ├── middleware/       # JWT Auth & RBAC Role verification middleware
│   │   ├── routes/           # Auth & Portal protected endpoints
│   │   └── server.js         # Express app entrypoint
│   ├── .env                  # Environment variables (ignored by Git)
│   └── package.json
├── frontend/                 # Vite + React + Tailwind CSS App
│   ├── src/
│   │   ├── components/       # Header, Sidebar, MainLayout
│   │   ├── context/          # AuthContext with Supabase & Demo Role Switcher
│   │   ├── lib/              # Supabase client & API fetch helpers
│   │   ├── pages/            # Role dashboards (Candidate, Training Center, Govt, Employer), Login, Register
│   │   ├── App.jsx
│   │   └── index.css         # Tailwind & custom govt-portal theme utilities
│   ├── .env                  # Environment variables (ignored by Git)
│   └── package.json
├── supabase/
│   └── schema.sql            # Database schema, roles enum, RLS, and auth trigger
├── .gitignore                # Global ignore rules (.env, node_modules)
└── README.md
```

---

## ⚡ Quick Setup & Startup

### 1. Database Setup (Supabase)
Run the SQL queries in [`supabase/schema.sql`](file:///c:/SIH-SKILLING/supabase/schema.sql) inside your Supabase project's **SQL Editor**:
- Creates the `profiles` table linked to `auth.users(id)`.
- Defines the `user_role` enum (`'candidate'`, `'training_center'`, `'government'`, `'employer'`).
- Sets up Row Level Security (RLS) policies and automatic trigger on signup.

### 2. Environment Variables (.env)
Update backend and frontend `.env` files with your Supabase credentials:

**Backend (`backend/.env`)**:
```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`)**:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Run Backend Express Server
```bash
cd backend
npm install
npm run dev
```
Express server starts at `http://localhost:5000`.

### 4. Run Frontend React App
```bash
cd frontend
npm install
npm run dev
```
Vite dev server starts at `http://localhost:5173`.

---

## 🧪 Quick Demo Mode
If Supabase environment variables are not yet configured, the application automatically enables **Interactive Demo Mode**. You can switch between all 4 roles directly in the top header dropdown or use the quick role buttons on the login page to preview each dashboard view and test protected Express API endpoints seamlessly.
