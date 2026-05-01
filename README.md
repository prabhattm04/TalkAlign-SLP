# TalkAlign - AI-Powered Speech-Language Pathology Platform

TalkAlign is a modern, full-stack web application designed for Speech-Language Pathologists (SLPs) and caregivers. It streamlines the therapy process by integrating an AI-powered pipeline to transcribe sessions, generate SOAP notes, and suggest therapy goals, while providing a dedicated caregiver portal for tracking progress and managing home practice.

## ✨ Features

### For Doctors (SLPs)
* **Patient Management:** Create, track, and manage patient profiles and therapy statuses.
* **Smart Session Workspace:** Record session audio directly in the browser. 
* **AI Pipeline Integration:** Automatically transcribes recorded sessions and generates structured SOAP notes (Subjective, Objective, Assessment, Plan) and parent summaries using Azure OpenAI.
* **Therapy Goals:** AI-assisted goal suggestions based on historical SOAP notes, with full CRUD functionality for manual goal tracking.
* **Home Practice:** Assign targeted practice exercises to patients for completion between sessions.

### For Caregivers (Parents)
* **Caregiver Portal:** A dedicated, secure view for parents to monitor their child's therapy progress.
* **Session History:** Access session summaries (written in caregiver-friendly language) and review progress over time.
* **Home Practice Tracking:** View assigned tasks and track completion of home exercises.

## 🛠️ Technology Stack

TalkAlign is built as a monorepo containing a RESTful backend and a modern single-page frontend.

* **Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios
* **Backend:** Node.js, Express.js, TypeScript, Zod (Schema Validation), Multer
* **Database & Authentication:** Supabase (PostgreSQL, Row-Level Security, Supabase Auth, Storage)
* **AI & Processing:** Azure OpenAI (GPT-4o), OpenAI Whisper (via Hugging Face or direct integration)

## 🏗️ Architecture

The project is split into two directories:
* `/frontend`: The React SPA client.
* `/backend`: The Express/TypeScript API server.

**Security:** The system relies heavily on Supabase Row-Level Security (RLS). A user-scoped Supabase client is attached to every authenticated request, ensuring that doctors can only access their own patients and sessions.

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm or yarn
* A Supabase project (for Auth, Database, and Storage)
* Azure OpenAI API credentials

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd TalkAlign-SLP
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on the following template:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Pipeline
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
AZURE_OPENAI_KEY=your_azure_key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-05-01-preview
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 4. Database Setup (Supabase)
The database schema relies on several custom tables, triggers, and RLS policies. Ensure you apply the migrations located in `supabase/migrations/` to your Supabase project to correctly set up:
- `profiles` (extends auth.users with roles)
- `patients`
- `sessions`
- `goals`
- `home_practice_tasks`

You will also need to create a storage bucket named `session-audio` for storing audio recordings.

## 📜 Scripts

**Backend (`/backend`)**
* `npm run dev`: Start the server with hot-reload (tsx).
* `npm run build`: Compile TypeScript to the `dist/` folder.
* `npm run start`: Run the production build.

**Frontend (`/frontend`)**
* `npm run dev`: Start the Vite development server.
* `npm run build`: Build for production.
* `npm run lint`: Run ESLint.
* `npm run preview`: Preview the production build locally.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## 📝 License
This project is licensed under the MIT License.
