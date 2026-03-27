# 🗓️ Calendar App Desktop

> Started as a desktop app — evolved into a **full-stack web application**.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Django](https://img.shields.io/badge/Django-4.2-092E20?style=flat-square&logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render)

---

> ⚠️ **Note:** This project started as a desktop application and the name **"Calendar App Desktop"** was kept for continuity — even though it now runs primarily as a web app. Perhaps a slightly wrong decision, but that's how it happened!

---

## 🌐 Live Web App

### 👉 [calendar-app-desktop.vercel.app](https://calendar-app-desktop.vercel.app)

Fully functional web application — no installation required, runs directly in the browser.

- **Frontend:** Vercel → `https://calendar-app-desktop.vercel.app`
- **Backend API:** Render → `https://calendar-app-desktop-backend.onrender.com`
- **Database:** Supabase (PostgreSQL)

> 💡 Render's free tier spins down after 15 minutes of inactivity. The first request may take ~30 seconds to wake up.

---

## ✨ Features

- 📅 **Month / Week / Day views** with smooth animations
- 🔀 **Drag & Drop** - move tasks between any days
- ✅ **Full task management** - title, description, date, time, priority, status, category, tags
- 🔗 **Google OAuth** - sign in with your Google account
- 📧 **Gmail import** - automatically turn labeled emails into tasks
- 📤 **Gmail reminders** - get notified via email before deadlines
- 🔄 **Google Calendar 2-way sync** - keep events in sync across both apps
- 🌙 **Dark theme** - terminal-inspired UI built for developers
- 📱 **Responsive** - works in browser and on mobile

---

## 🏗️ Architecture

```
Calendar-App-Desktop/
├── frontend/                  # React + Vite + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── calendar/      # MonthView, WeekView, DayView
│       │   ├── tasks/         # TaskCard, TaskChip, TaskModal
│       │   └── ui/            # Sidebar, TopBar
│       ├── pages/             # LoginPage, CalendarPage, GoogleCallback
│       ├── api/               # Axios client
│       └── store/             # Zustand global state
└── backend/                   # Django + Django REST Framework
    ├── devcalendar_project/   # settings, urls, wsgi
    ├── tasks_app/             # Task, Category, Tag models + CRUD API
    ├── google_auth/           # OAuth2, Gmail, Google Calendar
    └── calendar_app/          # Calendar settings
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| State Management | Zustand |
| Backend | Django 4.2, Django REST Framework |
| Authentication | JWT (SimpleJWT) + Google OAuth2 |
| Database | PostgreSQL (Supabase) |
| Task Queue | Celery + Redis (Upstash) |
| Google APIs | Gmail API, Google Calendar API |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## ☁️ Deployment Stack (Free Tier)

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | calendar-app-desktop.vercel.app |
| Backend | Render | calendar-app-desktop-backend.onrender.com |
| Database | Supabase | PostgreSQL |
| Redis | Upstash | Celery broker |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL
- Redis

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# Copy env.example to .env and fill in your values
cp env.example .env

python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`
Backend API: `http://localhost:8000`

---

## 📁 Environment Variables

```env
# Backend (.env)
DJANGO_SECRET_KEY=
DEBUG=True
DATABASE_URL=              # Supabase connection string
GOOGLE_CLIENT_ID=          # Google Cloud Console
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback/
CELERY_BROKER_URL=         # Upstash Redis URL
CELERY_RESULT_BACKEND=
CORS_ALLOWED_ORIGINS=      # Vercel frontend URL (production)
```

---

## 📖 Origin Story

This project started as a **desktop application** (Electron + React) for daily personal use and as a portfolio piece. Over time it evolved into a **full-stack web app** with a Django REST API backend, deployed on Vercel + Render + Supabase.

The name "Calendar App Desktop" was kept throughout, arguably incorrectly, but it reflects the history of the project.

---

## 📄 License

MIT — free to use, modify, and build upon.

---

Built by [Thanasis Koufos](https://www.thanasis-codes.eu) · [GitHub](https://github.com/ThanasisSoftwareDeveloper) · [Portfolio](https://www.thanasis-codes.eu)
