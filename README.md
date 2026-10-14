# StudyPulse — Student Study Planner

**A full-stack MERN application for smarter study planning, academic productivity, exam preparation, and progress tracking.**

<p align="center">
  <a href="https://study-project-jcpd-six.vercel.app/"><strong>🚀 Live Demo</strong></a>
  &nbsp; • &nbsp;
  <a href="https://github.com/yajashkhamar-python/Study-Project"><strong>💻 GitHub Repository</strong></a>
</p>

---

## 📌 About the Project

**StudyPulse** is a full-stack student productivity platform built to help students manage their academic responsibilities in one place.

It brings together task management, exam tracking, calendar scheduling, study goals, notes, productivity analytics, notifications, and AI-powered study assistance.

The application uses React for the frontend, Node.js and Express.js for the backend, MongoDB for data persistence, and JWT for authentication. Google Gemini API integration provides AI-assisted study guidance.

### 🎯 Project Objectives

- Simplify daily study planning and academic organization.
- Help students prioritize assignments and upcoming exams.
- Track study progress through dashboards and analytics.
- Encourage consistent study habits with focus tools.
- Provide AI-assisted explanations and personalized study guidance.
- Deliver a unified, responsive interface for academic productivity.

---

## ✨ Features

### 🔐 Authentication and User Management
- User registration and login.
- JWT-based authentication.
- Protected API access.
- User profile and account settings.
- Theme and application preferences.

### 📝 Task Management
- Create, view, update, and delete study tasks.
- Organize tasks by subject, priority, due date, and status.
- Track pending, completed, and overdue tasks.
- Filter and manage academic work.
- Recurring tasks and CSV export where supported by the current implementation.

### 📚 Exam Tracker
- Schedule and manage upcoming exams.
- View exam countdowns.
- Maintain syllabus and preparation notes.
- Organize preparation tasks around exam dates.

### 🎯 Goals and Milestones
- Define academic goals.
- Break objectives into manageable milestones.
- Track progress toward learning targets.

### 📅 Interactive Calendar
- Visualize scheduled academic activities.
- Organize tasks and important dates.
- Use calendar views for study planning.

### 📊 Dashboard and Analytics
- Overview of study tasks and progress.
- Subject-wise and task-completion visualizations.
- Study activity and productivity trends.
- Study streak and progress indicators.

### ⏱️ Focus Center
- Focused study sessions.
- Work and break timer controls.
- Support for structured study routines.

### 🗒️ Study Notes
- Create and manage academic notes.
- Keep study information organized within the application.

### 🤖 StudyPulse AI
An AI-powered study assistant integrated with Google's Gemini API.

Available AI assistance includes:
- Personalized study planning.
- Exam preparation guidance.
- Study progress analysis.
- Academic topic explanations.
- Practice quizzes and revision assistance.

AI-generated content should be reviewed for accuracy before relying on it for academic work.

### 🔔 Notifications
- Task and exam reminders.
- Unread notification indicators.
- Notification management.
- Scheduled background checks where configured.

### 🎨 User Experience
- React single-page application.
- Tailwind CSS styling.
- Interactive charts and calendar components.
- Modern glassmorphism-inspired interface.
- Theme support.
- PWA-related manifest and service-worker configuration.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, JavaScript, Vite |
| Styling | Tailwind CSS |
| API communication | Axios, REST APIs |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Data visualization | Recharts |
| Calendar | React Big Calendar |
| AI integration | Google Gemini API, `@google/genai` |
| Background jobs | node-cron |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Database hosting | MongoDB Atlas |
| Version control | Git, GitHub |

---

## 🏗️ Architecture

StudyPulse uses a client-server architecture in which the frontend communicates with the backend through REST APIs.

```text
                STUDYPULSE
                    |
        +-----------+-----------+
        |                       |
        v                       v
 React Frontend            User Interface
 Vite + Tailwind           Dashboard, Tasks,
                           Exams, Goals, Notes
        |
        | HTTPS / REST API
        | JWT Authorization
        v
 Express.js + Node.js
 Authentication, Routes,
 Controllers, Validation
        |
        +-------------------+
        |                   |
        v                   v
 MongoDB Atlas         Google Gemini API
 Persistent Data       AI Study Assistance
```

### Production Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **AI provider:** Google Gemini

The frontend uses `VITE_API_URL` to identify the backend API. Database credentials, JWT secrets, and the Gemini API key are configured on the backend.

---

## 📂 Project Structure

```text
Study-Project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   └── cronService.js
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── .gitignore
└── README.md
```

*This shows the main structure; additional files and folders may exist in the repository.*

---

## ⚙️ Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/) — version 18 or later.
- npm.
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB server.
- [Google AI Studio](https://aistudio.google.com/) API key for AI functionality.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/yajashkhamar-python/Study-Project.git
cd Study-Project
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory.

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/student_study_planner
MONGODB_DB=studypulse_db

JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
JWT_EXPIRE=30d

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=YOUR_SUPPORTED_GEMINI_MODEL
```

**Configuration notes:**

- `MONGODB_URI`: Local MongoDB or MongoDB Atlas connection string.
- `MONGODB_DB`: Database name used by the application.
- `JWT_SECRET`: A strong, private random secret used for JWT signing.
- `JWT_EXPIRE`: Token expiry configuration.
- `GEMINI_API_KEY`: Private Gemini API key.
- `GEMINI_MODEL`: Model identifier supported by the installed SDK and your Google AI configuration.
- `PORT`: Local backend port; Render provides its runtime port in production.
- `NODE_ENV`: Use `development` locally and `production` for deployment.

Use the database configuration appropriate to your environment. Do not publish actual credentials or commit `.env` files.

### 3. Start the backend

From the `backend` directory:

```bash
npm run dev
```

The API should run locally at:

```text
http://localhost:5000
```

Check the health endpoint:

[http://localhost:5000/api/health](http://localhost:5000/api/health)

Keep the backend terminal running.

### 4. Configure the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env` if you need to configure the local API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend API client uses `/api` as its fallback when `VITE_API_URL` is not set.

### 5. Start the frontend

From the `frontend` directory:

```bash
npm run dev
```

Vite displays the local development URL in the terminal. The default is commonly:

```text
http://localhost:5173
```

Open the exact URL printed by Vite.

---

## 🌐 Live Demo and Deployment

### Production links

| Resource | Link |
|---|---|
| Live application | [https://study-project-jcpd-six.vercel.app/](https://study-project-jcpd-six.vercel.app/) |
| Login page | [Open Login](https://study-project-jcpd-six.vercel.app/login) |
| Source code | [GitHub Repository](https://github.com/yajashkhamar-python/Study-Project) |

### Vercel frontend configuration

Set the following environment variable in the Vercel project settings:

```env
VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com/api
```

Replace the example domain with the actual Render backend URL. Configure the variable for the relevant environment and redeploy the frontend after changing it.

### Render backend configuration

Configure the required backend variables in Render's environment settings:

```env
NODE_ENV=production
MONGODB_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
MONGODB_DB=studypulse_db
JWT_SECRET=YOUR_PRIVATE_PRODUCTION_SECRET
JWT_EXPIRE=30d
GEMINI_API_KEY=YOUR_PRIVATE_GEMINI_API_KEY
GEMINI_MODEL=YOUR_SUPPORTED_GEMINI_MODEL
```

Add only the variables required by the deployed application and its enabled features. Never replace these placeholders with real secrets in this README.

Render supplies the runtime port automatically.

### MongoDB Atlas

For a hosted deployment:

1. Create a MongoDB Atlas cluster.
2. Configure a database user.
3. Set appropriate network access permissions.
4. Add the connection string to Render as `MONGODB_URI`.
5. Set `MONGODB_DB` to the intended database name.
6. Confirm the backend logs report a successful database connection.

---

## 🔌 REST API Overview

The backend exposes REST API routes for authentication, tasks, exams, dashboard data, analytics, calendar data, goals, notes, notifications, and AI assistance.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend health check |
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/auth/me` | Retrieve the current user's profile |
| `PUT` | `/api/auth/me` | Update supported profile settings |
| `GET` | `/api/tasks` | Retrieve tasks |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/exams` | Retrieve exams |
| `POST` | `/api/exams` | Create an exam |
| `/api/dashboard` | Dashboard routes | Dashboard data |
| `/api/analytics` | Analytics routes | Productivity analytics |
| `/api/calendar` | Calendar routes | Calendar data |
| `/api/goals` | Goal routes | Goal management |
| `/api/notes` | Note routes | Study note management |
| `/api/notifications` | Notification routes | Notification management |
| `/api/ai` | AI routes | AI study assistance |

The exact methods and subpaths for each feature are defined in the backend route files.

### Authentication

Protected endpoints use a JWT bearer token in the authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The frontend API client attaches the saved token when available. The backend verifies the token before processing protected requests.

Never share authentication tokens publicly.

---

## 🤖 StudyPulse AI Setup

StudyPulse AI uses the Gemini API through the backend.

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Set `GEMINI_API_KEY` in `backend/.env`.
3. Set `GEMINI_MODEL` to a supported model identifier.
4. Restart the backend.
5. Open the AI assistant and test an available AI feature.

The Gemini API key must remain on the backend. Do not use a `VITE_` variable for this key because frontend environment variables with that prefix can be exposed in the client bundle.

AI features require valid credentials, a supported model, network access, and available provider quota.

---

## 🔒 Security and Privacy

StudyPulse uses JWT-based authentication, password hashing with `bcryptjs`, and backend environment variables for private configuration.

Security practices for deployment:

- Use a strong, randomly generated production JWT secret.
- Never hardcode private secrets into application code or documentation.
- Keep `.env` files out of Git.
- Store database credentials and AI keys only in server-side environment variables.
- Use HTTPS for production services.
- Restrict database access where practical.
- Check authorization for user-owned resources.
- Avoid logging passwords, tokens, or secret values.

**Never share your real MongoDB URI credentials, JWT secret, or Gemini API key in a public issue or README.**

---

## 🧪 Testing and Verification

After making changes, verify:

- Registration and login.
- Protected API access.
- Task creation, retrieval, updating, and deletion.
- Task priority validation.
- Exam management.
- Dashboard and analytics loading.
- Calendar, goals, and notes functionality.
- AI requests with valid configuration.
- Notifications.
- Data persistence after refreshing or signing back in.
- Frontend-to-backend communication in production.

### Frontend production build

From the frontend directory:

```bash
npm run build
```

This checks whether Vite can generate the production frontend build.

Use the project's existing tests or an API client such as Postman or Thunder Client to test backend endpoints.

---

## 🐛 Troubleshooting

### MongoDB connection fails
- Verify `MONGODB_URI` and `MONGODB_DB`.
- Check database credentials and Atlas network access.
- Review backend logs.
- Confirm that the application successfully connects to MongoDB.

### Task or API requests fail
- Verify that the backend is running.
- Check `VITE_API_URL`.
- Open Developer Tools → Network in the browser.
- Inspect the failed request's HTTP status and response.
- Review backend logs for validation, authentication, or database errors.

### Login fails
- Verify the frontend is communicating with the correct backend.
- Check the backend's `JWT_SECRET` configuration.
- Confirm that the token is included in protected requests.
- Sign in again if authentication configuration has changed.

### AI assistant fails
- Verify the Gemini API key and model configuration.
- Confirm that the key exists in the backend environment.
- Check backend logs for provider, quota, or model errors.

### Latest deployment changes do not appear
- Confirm the Vercel deployment completed successfully.
- Review build logs and environment variables.
- Verify that you are opening the correct production URL.
- Refresh the browser or clear cached site data if needed.

---

## 🚀 Potential Future Enhancements

Possible future improvements include:

- More detailed academic reports.
- Expanded scheduling and revision workflows.
- Additional reminder customization.
- More comprehensive automated testing.
- Further accessibility and mobile usability improvements.

These are potential enhancements, not claims about existing functionality.

---

## 👨‍💻 Author

**Yajash Khamar**

- GitHub: [@yajashkhamar-python](https://github.com/yajashkhamar-python)
- Project: [StudyPulse — Student Study Planner](https://github.com/yajashkhamar-python/Study-Project)
- Live demo: [https://study-project-jcpd-six.vercel.app/](https://study-project-jcpd-six.vercel.app/)

---

## 📄 License

No license is specified in this README. Add a `LICENSE` file if you want to formally permit others to reuse, modify, or distribute the project.

---

<p align="center">
  <strong>StudyPulse — Plan your studies. Stay focused. Track your progress.</strong>
</p>
