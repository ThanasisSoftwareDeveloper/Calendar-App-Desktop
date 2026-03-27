# 🚀 Deployment Guide — 30 Λεπτά για να είσαι Live

## Links
| Service | Link | Κόστος |
|---------|------|--------|
| **Vercel** (Frontend) | https://vercel.com | ΔΩΡΕΑΝ |
| **Render** (Backend) | https://render.com | ΔΩΡΕΑΝ |
| **Supabase** (Database) | https://supabase.com | ΔΩΡΕΑΝ |
| **Upstash** (Redis) | https://upstash.com | ΔΩΡΕΑΝ |
| **Google Cloud** (OAuth) | https://console.cloud.google.com | ΔΩΡΕΑΝ |

---

## ΒΗΜΑ 1 — Supabase (Database) ~3 λεπτά

1. Άνοιξε → **https://supabase.com** → Sign up with GitHub
2. **New Project** → name: `calendar-app-desktop` → βάλε DB password → region: **West EU (Ireland)**
3. Περίμενε ~2 λεπτά να ξεκινήσει
4. Πήγαινε **Settings** → **Database** → αντέγραψε το **Connection string (URI)**
   - Μοιάζει: `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`
5. **Αποθήκευσε αυτό το URL** — θα το χρειαστείς στο Render

---

## ΒΗΜΑ 2 — Upstash (Redis) ~2 λεπτά

1. Άνοιξε → **https://upstash.com** → Sign up with GitHub
2. **Create Database** → name: `calendar-redis` → type: **Redis** → region: **EU-West-1**
3. Αντέγραψε το **REDIS_URL** — μοιάζει: `rediss://default:PASSWORD@xxx.upstash.io:PORT`
4. **Αποθήκευσε αυτό το URL** — θα το χρειαστείς στο Render

---

## ΒΗΜΑ 3 — Google Cloud Console ~5 λεπτά

1. Άνοιξε → **https://console.cloud.google.com**
2. Επέλεξε το υπάρχον project σου
3. **APIs & Services** → **Credentials** → κλικ στο OAuth 2.0 Client ID
4. Στο **Authorized redirect URIs** πρόσθεσε:
   ```
   https://calendar-app-desktop-backend.onrender.com/api/auth/google/callback/
   ```
5. Κλικ **Save**

---

## ΒΗΜΑ 4 — Render (Backend) ~10 λεπτά

1. Άνοιξε → **https://render.com** → Sign up with GitHub
2. **New +** → **Web Service**
3. Σύνδεσε το GitHub repo: `ThanasisSoftwareDeveloper/Calendar-App-Desktop`
4. Ρυθμίσεις:
   - **Name**: `calendar-app-desktop-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn devcalendar_project.wsgi:application --bind 0.0.0.0:$PORT`
   - **Plan**: Free
5. **Environment Variables** — πρόσθεσε αυτά:

| Key | Value |
|-----|-------|
| `DJANGO_SECRET_KEY` | κλικ Generate |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `.onrender.com` |
| `DATABASE_URL` | (το Supabase URL από Βήμα 1) |
| `GOOGLE_CLIENT_ID` | (το Google Client ID σου) |
| `GOOGLE_CLIENT_SECRET` | (το Google Client Secret σου) |
| `GOOGLE_REDIRECT_URI` | `https://calendar-app-desktop-backend.onrender.com/api/auth/google/callback/` |
| `CELERY_BROKER_URL` | (το Upstash URL από Βήμα 2) |
| `CELERY_RESULT_BACKEND` | (το Upstash URL από Βήμα 2) |

6. Κλικ **Create Web Service** → περίμενε ~3 λεπτά
7. Backend URL: `https://calendar-app-desktop-backend.onrender.com`
8. Τεστ: άνοιξε `https://calendar-app-desktop-backend.onrender.com/api/tasks/` → πρέπει να επιστρέψει JSON

---

## ΒΗΜΑ 5 — Vercel (Frontend) ~5 λεπτά

1. Άνοιξε → **https://vercel.com** → Sign up with GitHub
2. **Add New Project** → Import `ThanasisSoftwareDeveloper/Calendar-App-Desktop`
3. Ρυθμίσεις:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** — πρόσθεσε:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://calendar-app-desktop-backend.onrender.com` |

5. Κλικ **Deploy** → περίμενε ~2 λεπτά
6. Frontend URL: `https://calendar-app-desktop.vercel.app`

---

## ΒΗΜΑ 6 — CORS σύνδεση ~2 λεπτά

1. Πήγαινε στο **Render** → backend service → **Environment**
2. Πρόσθεσε:

| Key | Value |
|-----|-------|
| `CORS_ALLOWED_ORIGINS` | `https://calendar-app-desktop.vercel.app` |

3. Render κάνει auto-redeploy σε ~1 λεπτό

---

## ΒΗΜΑ 7 — Google OAuth τελικό fix ~1 λεπτό

1. **Google Cloud Console** → Credentials → OAuth client
2. **Authorized JavaScript origins** → πρόσθεσε:
   ```
   https://calendar-app-desktop.vercel.app
   ```
3. Save

---

## ✅ Η εφαρμογή είναι live στο:
### `https://calendar-app-desktop.vercel.app`


---

## Αντιμετώπιση προβλημάτων

**Backend 500 error?**
→ Render → Logs tab

**CORS error στο browser?**
→ Έλεγξε ότι το `CORS_ALLOWED_ORIGINS` στο Render ταιριάζει ακριβώς με το Vercel URL

**Google login αποτυγχάνει?**
→ Έλεγξε ότι το redirect URI στο Google Cloud ταιριάζει ακριβώς με το `GOOGLE_REDIRECT_URI`

**Αργεί το πρώτο load?**
→ Φυσιολογικό στο free tier — κοιμάται μετά 15 λεπτά, ξυπνά σε ~30 δευτερόλεπτα
