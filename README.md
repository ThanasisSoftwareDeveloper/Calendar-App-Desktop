# 🗓️ Calendar-App-Desktop

> A developer-grade task & calendar desktop app with Google Calendar sync, Gmail integration, and drag-and-drop scheduling. Built for daily use and GitHub portfolio.

![Calendar-App-Desktop](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Django](https://img.shields.io/badge/Django-4.2-092E20?style=flat-square&logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)

---

## ✨ Features

- 📅 **Month / Week / Day views** with smooth animations
- 🔀 **Drag & Drop** — move tasks between any days in the calendar
- ✅ **Full task management** — title, description, date, time, priority, status, category, tags
- 🔗 **Google OAuth** — sign in with Google
- 📧 **Gmail import** — turn labeled emails into tasks automatically
- 📤 **Gmail reminders** — get notified via email before deadlines
- 🔄 **Google Calendar 2-way sync** — events appear in both apps
- 🌙 **Dark theme** — terminal-inspired UI matching developer aesthetics
- ⚡ **Built with** React + Vite (frontend) and Django REST Framework (backend)

---

## 🏗️ Architecture

```
Calendar-App-Desktop/
├── frontend/               # React + Vite + Tailwind + @dnd-kit
│   └── src/
│       ├── components/
│       │   ├── calendar/   # MonthView, WeekView, DayView
│       │   ├── tasks/      # TaskCard, TaskChip, TaskModal
│       │   └── ui/         # Sidebar, TopBar
│       ├── pages/          # LoginPage, CalendarPage, GoogleCallback
│       ├── api/            # Axios client + all API calls
│       └── store/          # Zustand global state
└── backend/                # Django + DRF
    ├── devcalendar_project/ # settings, urls, wsgi
    ├── tasks_app/           # Task, Category, Tag models + CRUD API
    ├── google_auth/         # OAuth2, Gmail service, GCal service
    └── calendar_app/        # Calendar settings
```

---

## 🚀 Setup

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** 15+
- **Redis** (for Celery task queue / reminders) with: a) WSL2, or b) Docker (also it uses WSL2 for Windows), or c) Docker Desktop.
- A **Google Cloud Console** project with OAuth2 credentials

---

### 1. Clone the repo

```bash
git clone https://github.com/ThanasisSoftwareDeveloper/Calendar-App-Desktop.git
cd Calendar-App-Desktop
```

---

### 2. Google Cloud Console Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a new project → **Calendar-App-Desktop**
3. Go to **APIs & Services** → **Enable APIs**:
   - Gmail API
   - Google Calendar API
   - Google People API (insted of Google+, for profile info)
4. Go to **APIs & Services** → **OAuth consent screen**:
   - "Audience" → External → Save
   - "Data Access" → "Add or Remove Scopes"
   - "Credentials" → "+ Create Credentials" → "OAuth client ID",
   - Application type: Web application, Name: default (Web client 1)
   - Redirect URI: http://localhost:8000/api/auth/google/callback/
   - Create
   - Coppy or Download: Client ID και Client Secret
   - Add scopes: `gmail.readonly`, `gmail.send`, `calendar`, `userinfo.email`, `userinfo.profile`
6. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:8000/api/auth/google/callback/`
7. Copy your **Client ID** and **Client Secret**

---

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values (DB password, Google credentials, etc.)

# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE calendar_app_desktop;"

# Run migrations
python manage.py migrate

# Create superuser (optional, for Django admin)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

**Backend runs at:** `http://localhost:8000`
**Django Admin:** `http://localhost:8000/admin`

---

### 4. Start Celery (for reminders & background sync)

In a new terminal:

```bash
cd backend
source venv/bin/activate

# Start Celery worker
celery -A devcalendar_project worker -l info

# In another terminal: start Celery Beat (scheduler)
celery -A devcalendar_project beat -l info
```

> **Note:** Make sure Redis is running: `redis-server`

---

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

## 📖 Usage

### Sign In
- Open `http://localhost:5173`
- Click **Continue with Google**
- Authorize the required permissions

### Creating Tasks
- **Double-click** any day in Month view to add a task
- Click the **+ New Task** button in the top bar
- Use the **Day view** for a detailed daily agenda

### Drag & Drop
- In **Month view**: grab any task chip and drop it on a different day
- In **Week view**: drag tasks between day columns
- Changes are saved instantly + synced to Google Calendar

### Gmail Integration
- **Import tasks**: Emails with `[Calendar-App-Desktop]` in the subject line are automatically imported as tasks
  - Example subject: `[Calendar-App-Desktop] Fix login bug`
  - Add custom date header: `X-Task-Date: 2024-03-15`
- **Reminders**: Set a reminder date/time in the task form — you'll receive an email via Gmail

### Google Calendar Sync
- Click **Sync Calendar** in the sidebar to pull events from Google Calendar
- When you create/edit a task with a time, click the sync icon (⟳) to push it to Google Calendar
- Automatic background sync runs every hour (requires Celery)

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/by_month/?year=&month=` | Get tasks for a month |
| GET | `/api/tasks/by_week/?year=&week=` | Get tasks for a week |
| POST | `/api/tasks/` | Create task |
| PATCH | `/api/tasks/{id}/move/` | Move task (drag & drop) |
| POST | `/api/tasks/reorder/` | Reorder tasks within a day |
| POST | `/api/tasks/{id}/complete/` | Mark complete |
| GET | `/api/auth/google/url/` | Get Google OAuth URL |
| GET | `/api/auth/google/callback/` | OAuth callback |
| POST | `/api/auth/google/calendar/sync/` | Sync Google Calendar |
| POST | `/api/auth/google/gmail/import/` | Import Gmail tasks |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| State | Zustand |
| Backend | Django 4.2, Django REST Framework |
| Auth | JWT (SimpleJWT) + Google OAuth2 |
| Database | PostgreSQL |
| Queue | Celery + Redis |
| Google APIs | Gmail API, Google Calendar API |

---

## 📁 Environment Variables

```env
# Backend (.env)
DJANGO_SECRET_KEY=        # Django secret key
DEBUG=True
DB_NAME=calendar_app_desktop
DB_USER=postgres
DB_PASSWORD=              # Your PostgreSQL password
DB_HOST=localhost
DB_PORT=5432
GOOGLE_CLIENT_ID=         # From Google Cloud Console
GOOGLE_CLIENT_SECRET=     # From Google Cloud Console
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback/
CELERY_BROKER_URL=redis://localhost:6379/0
```

---

## 📄 License

MIT — feel free to use, modify, and build upon this.

---

Built by [Thanasis Koufos](https://www.thanasis-codes.eu) · [GitHub](https://github.com/ThanasisSoftwareDeveloper)
