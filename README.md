# 🎓 Digital Classroom Board

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployment_Ready-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, real-time collaborative digital classroom whiteboard platform engineered for modern online teaching. Combines an ultra-responsive vector drawing canvas with educator authority controls, live classroom chat, 25MB file sharing, and high-resolution board export.

---

## 🌟 Key Highlights & Features

### 🖌️ Interactive Whiteboard Canvas
- **Vector Drawing Engine**: Smooth freehand pen, precision eraser, rectangles, ellipses, lines, arrows, and multiline text stamping.
- **High-DPI Retina Support**: Pixel-perfect rendering using automatic device pixel ratio scaling (`devicePixelRatio`).
- **Undo / Redo & Canvas Clear**: Teacher-exclusive historical stroke management with stroke batching for 0ms perceived latency.
- **High-Resolution PNG Export**: Download board notes as clear PNG images anytime for student revision.

### 🧑‍🏫 Educator Authority & Classroom Moderation
- **Individual Student Whiteboard Lock**: Teachers can lock or unlock canvas drawing for any specific student without interrupting the class.
- **Classroom Chat Pause**: Teachers can pause the entire chat stream during lectures and resume for Q&A.
- **Participant Ejection**: Remove disruptive students with automatic session disconnection and room re-entry protection.
- **Official Teacher vs Promoted Student Hierarchy**:
  - Official Teachers have exclusive privileges to view active promoted teachers and revoke their teacher status.
  - Teacher invitation passkey (`TEACH_2026_COLAB_SECRET`) is masked and visible only on Official Teachers' private dashboards.

### ⚡ Zero-Latency Real-Time Collaboration
- **Socket.IO Engine**: Real-time vector stroke broadcasting, live multi-user cursor tracking with usernames, and instant participant presence updates.
- **Smart Stroke Batching**: Flushes segments every 30 strokes or 600ms to eliminate network bottlenecks.

### 📁 25MB Supabase Resource Hub
- **Lecture Handouts & Diagrams**: Upload PDF notes, slides, and diagrams up to 25MB directly to Supabase Storage.
- **Instant Preview**: Clicking "Open" launches PDFs in a new browser tab or opens images in an interactive fullscreen preview modal with zoom and direct download.

### 🔒 Enterprise Security & Architecture
- **Supabase Authentication**: Secure JWT email/password registration, session persistence, and self-service password reset.
- **PostgreSQL Row Level Security (RLS)**: Enforces zero-trust data access on all database tables.

### 🎨 Premium Landing Page
- Modern design inspired by commercial SaaS platforms.
- Interactive platform preview tabs, feature suite grid, educator/student workflows, FAQ accordion, and smooth scroll navigation.

---

## 🏛️ System Architecture

```
                                  +------------------------------+
                                  |     React 19 + Vite App      |
                                  |    (Tailwind CSS v4 + SPA)   |
                                  +--------------+---------------+
                                                 |
                        +------------------------+------------------------+
                        | HTTP REST API                                   | WebSocket (Socket.IO)
                        v                                                 v
           +---------------------------+                     +---------------------------+
           |     Node.js / Express     | <=================> |     Socket.IO Server      |
           |     REST API Controllers  |                     | Real-Time Event Engine    |
           +-------------+-------------+                     +-------------+-------------+
                         |                                                 |
                         +------------------------+------------------------+
                                                  | Supabase Admin Client
                                                  v
                               +-------------------------------------+
                               |          Supabase Platform          |
                               |  - PostgreSQL Database (RLS)        |
                               |  - GoTrue Auth (JWT Sessions)       |
                               |  - Storage (classroom-resources)    |
                               +-------------------------------------+
```

---

## 📂 Repository Structure

```
Classroom/
├── backend/
│   ├── config/
│   │   └── supabase.js             # Supabase Admin & Anon client setup
│   ├── controller/                 # Route logic controllers
│   ├── middleware/
│   │   └── auth.js                 # JWT verification & Socket.IO auth middleware
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth (login, signup, teacher permissions)
│   │   └── classroomRoutes.js      # /api/classrooms (rooms, members, 25MB files)
│   ├── scripts/
│   │   └── migrateMongoToSupabase.js # MongoDB to PostgreSQL migration utility
│   ├── server.js                   # Express server, CORS & Socket.IO handlers
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AuthModal.jsx   # Login, Sign Up, Passkey masked input
│   │   │   │   └── ResetPasswordModal.jsx
│   │   │   ├── classroom/
│   │   │   │   └── Whiteboard.jsx  # Canvas, Chat, Tools, Participants, File Hub
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.jsx   # Classroom creation, joining, teacher management
│   │   │   └── landing/            # Modern SaaS Landing Page components
│   │   │       ├── HeroSection.jsx
│   │   │       ├── ProductPreview.jsx
│   │   │       ├── FeaturesSection.jsx
│   │   │       ├── ForTeachersSection.jsx
│   │   │       ├── ForStudentsSection.jsx
│   │   │       ├── HowItWorksSection.jsx
│   │   │       ├── FaqSection.jsx
│   │   │       ├── Navbar.jsx
│   │   │       └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Supabase auth session & profile provider
│   │   ├── lib/
│   │   │   └── supabase.js         # Frontend Supabase client
│   │   ├── App.jsx                 # Routing (Landing / Dashboard / Classroom)
│   │   └── main.jsx
│   ├── vercel.json                 # SPA rewrite configuration for Vercel
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema, triggers, RLS, Storage bucket
├── vercel.json                     # Monorepo Vercel configuration
├── package.json                    # Root monorepo scripts
├── .gitignore                      # Watertight gitignore (blocks .env & build dirs)
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- A free **Supabase** account ([supabase.com](https://supabase.com))

---

### Step 1: Clone and Prepare Repository
```bash
git clone <your-repository-url>
cd Classroom
```

---

### Step 2: Set Up Supabase Database & Storage

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Open the **SQL Editor** from the left sidebar and click **New Query**.
3. Copy the entire contents of [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) and paste into the editor.
4. Click **Run**. This automatically provisions:
   - Tables: `profiles`, `classrooms`, `classroom_members`, `boards`, `board_elements`, `chat_messages`, `classroom_resources`.
   - Automated triggers for profile creation and timestamp tracking.
   - Row Level Security (RLS) policies for zero-trust data safety.
   - Supabase Storage bucket `classroom-resources` (25MB limit with public/authenticated download access).

5. In **Project Settings** -> **API**, copy:
   - **Project URL**
   - **anon / public key**
   - **service_role key** (secret)

---

### Step 3: Configure Environment Variables

#### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173

# Supabase API Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_secret_key

# Teacher Authorization Passkey
TEACHER_INVITATION_CODE=TEACH_2026_COLAB_SECRET
```

#### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_SERVER_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ **Important Security Rule**: Never commit `.env` files to GitHub. Only `.env.example` templates should be tracked in Git.

---

### Step 4: Run the Application

You can run both backend and frontend from separate terminals:

#### Terminal 1 — Backend Server
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

#### Terminal 2 — Frontend Application
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

Open `http://localhost:5173` in your web browser.

---

## 🔑 Teacher Roles & Passkey Guide

- **Official Teachers**:
  - Pre-designated platform administrator emails (e.g. `faisal123@gmail.com`, `devesh@gmail.com`).
  - View the list of promoted teachers and can revoke teacher privileges from any student.
  - Can view and copy the private Teacher Passkey directly from the dashboard.
- **Promoted Teachers**:
  - Registered or upgraded using the authorized passkey `TEACH_2026_COLAB_SECRET`.
  - Can create and manage their own classrooms.
  - Cannot revoke other teachers or view the private passkey.
- **Students**:
  - Can join any classroom using its unique 6-character room code (e.g., `CLASS-EAQKL2`).
  - Draw on the canvas when unlocked by the teacher.
  - Ask doubts in chat and access all shared PDFs and diagrams.

---

## 📤 GitHub Push Guide

To push your project cleanly to your GitHub account:

### 1. Initialize Git & Check Status
```bash
git init
git status
```
Verify that `backend/.env`, `frontend/.env`, `node_modules/`, and `dist/` are in the **Ignored files** list.

### 2. Stage and Commit
```bash
git add .
git commit -m "feat: complete digital classroom board with landing page, teacher moderation, and vercel deployment config"
```

### 3. Add Remote & Push to Main
```bash
# Replace with your actual GitHub repository URL
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

---

## 🌐 Vercel Deployment Guide (Frontend)

Digital Classroom Board includes both `frontend/vercel.json` and a root `vercel.json` for automatic Single-Page Application (SPA) routing on Vercel.

### Method A: Deploy from Vercel Web Dashboard (Recommended)

1. Log in to [vercel.com](https://vercel.com) and click **"Add New..." -> "Project"**.
2. Connect your GitHub account and import your repository.
3. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add the following 3 variables:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_SERVER_URL` | `https://your-backend.onrender.com` | Your live backend server URL |
   | `VITE_SUPABASE_URL` | `https://xyz.supabase.co` | Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_...` | Supabase Public / Anon Key |
5. Click **Deploy**.
6. Once deployed, Vercel will provide your live URL (e.g., `https://digital-classroom-board.vercel.app`).

### Method B: Deploy using Vercel CLI
```bash
npm install -g vercel
cd frontend
vercel
# Follow the interactive prompts and enter your environment variables
vercel --prod
```

---

## 🖥️ Backend Deployment Guide (Render / Railway / VPS)

The backend runs Node.js with Socket.IO and requires persistent WebSocket connections. You can deploy it for free on **Render**, **Railway**, **Fly.io**, or any cloud VPS.

### Deploying on Render:
1. Go to [render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository.
3. Set the following build settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add the following **Environment Variables**:
   | Key | Value |
   |---|---|
   | `PORT` | `5000` (or `10000` for Render) |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (Your live Vercel URL) |
   | `SUPABASE_URL` | `https://your-project.supabase.co` |
   | `SUPABASE_ANON_KEY` | `your_supabase_anon_key` |
   | `SUPABASE_SECRET_KEY` | `your_supabase_service_role_secret_key` |
   | `TEACHER_INVITATION_CODE` | `TEACH_2026_COLAB_SECRET` |
5. Click **Create Web Service**.
6. Copy the generated backend URL (e.g., `https://classroom-api.onrender.com`) and paste it into your Vercel frontend `VITE_SERVER_URL` variable.

---

## 📡 REST API & Socket.IO Reference

### REST API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register-teacher` | Authenticated | Promotes user to teacher using valid passkey |
| `GET` | `/api/auth/promoted-students` | Official Teacher | Lists all students promoted to teacher role |
| `POST` | `/api/auth/revoke-student-teacher-control` | Official Teacher | Revokes teacher authority from specific student |
| `GET` | `/api/classrooms` | Authenticated | Lists classrooms accessible to the user |
| `POST` | `/api/classrooms` | Teacher | Creates a new classroom and generates 6-digit code |
| `POST` | `/api/classrooms/join` | Authenticated | Joins classroom using room code |
| `GET` | `/api/classrooms/:code/resources` | Room Members | Retrieves list of shared files (PDFs, images) |
| `POST` | `/api/classrooms/:code/resources` | Room Members | Uploads resource file up to 25MB to Supabase Storage |

### Socket.IO Real-Time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client -> Server | `{ room }` | Connects socket to specific classroom room |
| `draw-segment` | Client -> Server | Segment payload | Broadcasts pen/shape stroke to room |
| `clear-board` | Client -> Server | `{ room }` | Clears canvas (Teacher only) |
| `undo-board` / `redo-board` | Client -> Server | `{ room }` | Undo/redo strokes (Teacher only) |
| `set-board-lock` | Client -> Server | `{ room, locked }` | Global room drawing lock (Teacher only) |
| `toggle-student-board-lock` | Client -> Server | `{ room, studentUserId }` | Locks/unlocks specific student's canvas |
| `toggle-chat-disabled` | Client -> Server | `{ room, disabled }` | Pauses/resumes classroom chat stream |
| `kick-participant` | Client -> Server | `{ room, targetUserId }` | Disconnects & ejects student from classroom |
| `chat-message` | Client -> Server | `{ room, message }` | Sends live discussion message |
| `cursor-move` | Client -> Server | `{ room, x, y }` | Broadcasts live user cursor position |

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
Feel free to customize, contribute, and deploy for educational institutions, academies, and personal tutoring.
#   D i g i t a l - C l a s s R o o m  
 