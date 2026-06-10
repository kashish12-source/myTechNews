# Redesign & Verification Logs - myTechNews Upgrade

This file documents the frontend redesign, codebase cleanups, and the email-based verification (2FA) system.

---

## 🛠️ Restructuring & Cleanups

I removed legacy files and restructured the codebase to make it consistent, clean, and fully Python-based for backend operations:
1. **Removed Legacy NodeJS Backend**:
   - Deleted the empty `server` directory.
   - Deleted the broken legacy script [scripts/update-news.mjs](file:///c:/Users/Kashish/myTechNews/scripts/update-news.mjs).
2. **Created Python news CLI scraper** ([backend/app/scrape_cli.py](file:///c:/Users/Kashish/myTechNews/backend/app/scrape_cli.py)):
   - Runs news aggregation via SQLAlchemy and prints output.
   - Automatically dumps fresh results to [frontend/src/data/news-cache.json](file:///c:/Users/Kashish/myTechNews/frontend/src/data/news-cache.json) for daily cron commits.
3. **Updated Github Actions Workflow** ([.github/workflows/daily-scrape.yml](file:///c:/Users/Kashish/myTechNews/.github/workflows/daily-scrape.yml)):
   - Replaced Node setup environment with Python 3.11.
   - Executes `python backend/app/scrape_cli.py` to trigger scraping.
   - Updates `git add` to register the new fallback cache path (`frontend/src/data/news-cache.json`).
4. **Upgraded Startup Script** ([Launch-News.bat](file:///c:/Users/Kashish/myTechNews/Launch-News.bat)):
   - Corrected command scripts to execute `npm run start:backend` (launching Uvicorn) and `npm run dev:frontend` (launching Vite) directly from the monorepo root.

---

## 🔐 2FA Email Verification Flow

Implemented a 2FA flow on Login and welcome confirmations on Registration:

### 1. Database & Config Mappings
- **Verification Model** ([backend/app/models.py](file:///c:/Users/Kashish/myTechNews/backend/app/models.py)):
  - Declared `VerificationCode` table with columns: `id`, `email`, `code`, `expires_at`, and `created_at`.
- **Config variables** ([backend/app/config.py](file:///c:/Users/Kashish/myTechNews/backend/app/config.py)):
  - Integrated `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` settings.

### 2. Email client dispatch ([backend/app/email.py](file:///c:/Users/Kashish/myTechNews/backend/app/email.py))
- Developed `send_verification_email` and `send_welcome_email`.
- Leverages standard `smtplib` and MIME multipart. Falls back to printing email payloads cleanly to server logs if credentials are absent.

### 3. API Handlers ([backend/app/main.py](file:///c:/Users/Kashish/myTechNews/backend/app/main.py))
- `/api/auth/register`: Welcomes users by triggering `send_welcome_email` inside a background worker thread upon account creation.
- `/api/auth/login`: Validates user password. If correct, generates a 6-digit random verification code, stores it in the database with a 5-minute expiration, triggers `send_verification_email` in the background, and returns `status: "verification_required"`.
- `/api/auth/verify-code`: Matches submitted 6-digit codes. Returns the final JWT session token if valid, otherwise rejects expired/incorrect values.

### 4. React UI Step Integration ([frontend/src/components/Login.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/components/Login.tsx))
- Integrated a state-driven verification screen.
- First step takes user details; if 2FA challenge is flagged, flips card content to input verification code. Allows backtracking via a "Back to login" helper button.

---

## 🎨 Immersive UI redseign

1. **Branding & Logo**: Updated logos to a premium, glowing gradient style: `bg-gradient-to-r from-[#6366f1] to-cyan-400 bg-clip-text text-transparent`.
2. **Typography**: Set Outfit (`font-sans`) for controls/metadata, and Playfair Display (`font-serif`) for headers.
3. **Immersive Cards**: Integrated dark slate-blue card containers with glowing shadows, card lift animations, and clean inline categories/sentiment badges.
4. **Login card**: Transformed register/login layout to use glassmorphism blurred boxes with styled input boundaries.
