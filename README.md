# Student Study Planner (Full MERN Web Application)

StudyPulse is a production-ready Student Study Planner web application built using MongoDB, Express.js, React 18, Node.js, Tailwind CSS, Recharts, and React Big Calendar.

---

## Key Features

- **JWT Authentication**: Register, Login, Logout, Profile updates, Token interceptors.
- **Tasks Management**: Complete CRUD, Subject & Priority filters, Recurring task creation, Overdue detection, CSV Export.
- **Exams Tracker**: Countdown timers, Syllabus notes, Linked tasks, Color-coded cards.
- **Real-Time & Background Notifications**: Hourly `node-cron` scanning upcoming tasks/exams, Unread count badges, Read/Delete notifications.
- **Interactive Dashboard**: Recharts (Bar chart by subject, Completion Pie chart, 30-Day Activity line graph), Study streak tracker.
- **Visual Calendar**: Interactive monthly and weekly event view powered by `react-big-calendar`.
- **Pomodoro Focus Timer**: Customizable work/break session timer.
- **StudyPulse AI**: Personalized AI study companion powered by Google Gemini API, offering study planning, exam prep strategies, progress analysis, topic explanations, and practice quizzes tailored to student context.

- **Glassmorphism UI**: Modern aesthetic with dark mode support.

- **Progressive Web App (PWA)**: Web manifest and Service Worker setup.

---

## Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017/student_study_planner` or a remote MongoDB Atlas URI.

---

### Backend Setup

1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure `.env` file (pre-configured):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/student_study_planner
   JWT_SECRET=super_secret_study_planner_jwt_token_key_2026_prod
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. Run backend dev server:
   ```bash
   npm run dev
   ```
   *The Express server will start on `http://localhost:5000` and connect to MongoDB.*

---

### Frontend Setup

1. Open a new terminal tab and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run Vite frontend dev server:
   ```bash
   npm run dev
   ```
   *The React app will launch at `http://localhost:3000`.*

---

## REST API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new student account |
| `POST` | `/api/auth/login` | Login and obtain JWT bearer token |
| `GET` | `/api/auth/me` | Fetch authenticated profile details |
| `PUT` | `/api/auth/me` | Update profile, theme, password |
| `GET` | `/api/tasks` | Get filtered, sorted, paginated tasks |
| `POST` | `/api/tasks` | Create new study task |
| `PATCH` | `/api/tasks/:id/status` | Quick update task status |
| `GET` | `/api/exams` | Fetch scheduled exams |
| `POST` | `/api/exams` | Schedule new exam |
| `GET` | `/api/dashboard/stats` | Aggregated metrics & chart data |
| `GET` | `/api/notifications` | Get user notifications & unread count |
| `POST` | `/api/ai/chat` | Send prompt & receive personalized AI study guidance |

---

## StudyPulse AI

### Overview
StudyPulse AI is an embedded AI study assistant designed to provide personalized study guidance based on the student's actual tasks, exams, completion rates, and focus stats.

### Features
- **Plan My Day**: Generates a realistic daily study schedule prioritizing overdue & urgent tasks.
- **Prepare for My Exam**: Constructs targeted preparation strategies based on upcoming exam dates and syllabus notes.
- **Analyze My Progress**: Reviews completion rates, pending tasks, and streaks to offer constructive feedback.
- **Explain a Topic**: Explains complex academic topics simply with student-friendly examples.
- **Quiz Me**: Generates quick practice quiz questions tailored to the student's subjects.

### Setup & Configuration
1. Install dependencies (`npm install` in both `backend` and `frontend`).
2. Add your Google Gemini API key to `backend/.env`:
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   GEMINI_MODEL=gemini-1.5-flash
   ```
3. Start the backend (`npm run dev` in `backend`).
4. Start the frontend (`npm run dev` in `frontend`).
5. Access the assistant via `/ai-assistant` or via the **Ask StudyPulse AI** dashboard shortcut.

### Security & Privacy
- **Server-Side API Key**: The Google Gemini API key remains securely stored in the backend environment variables and is never exposed to the frontend React bundle.
- **Authenticated Endpoint**: `/api/ai/chat` requires a valid JWT bearer token.
- **Minimal Context Transfer**: Only essential, non-sensitive task titles, subjects, due dates, exam dates, and completion metrics are sent to Gemini for response formatting.


