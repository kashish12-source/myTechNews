# Developer Onboarding Guide - myTechNews

Welcome to the `myTechNews` project! This guide provides a walkthrough of the project's structure, architecture layers, key concepts, and guidelines to help you get onboarded quickly.

---

## 🚀 Project Overview
- **Name**: `myTechNews`
- **Description**: A premium tech news aggregator that scrapes technical feeds, filters out fluff, classifies articles into technical categories, generates summaries using Gemini AI, and displays them on a modern React dashboard.
- **Languages**: TypeScript, JavaScript, HTML, CSS, Python, Batch, PowerShell, Markdown
- **Frameworks**: React, FastAPI, Vite, Tailwind CSS v4

---

## 🏗️ Architecture Layers

The repository is structured as a monorepo containing distinct layers for the backend, frontend client, infrastructure, and developer guidelines.

### 1. Frontend Client (React)
- **Description**: Vite-powered React single page application with Tailwind CSS v4.
- **Key Files**:
  - [App.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/App.tsx): Primary React container handling authentication checks and routing.
  - [NewsFeed.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/components/NewsFeed.tsx): Visual grid of tech news articles featuring category filters and search.
  - [Login.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/components/Login.tsx): Glassmorphism registration and login forms with password validation.
  - [ReplacementMatrix.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/components/ReplacementMatrix.tsx): Comparative role matrix displaying model capability indices.
  - [LlmComponents.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/components/LlmComponents.tsx): Visual interactive model layer tracking transformer pass math.

### 2. FastAPI Backend
- **Description**: Python FastAPI web server handling database management, password checks, JWT login tokens, and background scraper updates.
- **Key Files**:
  - [main.py](file:///c:/Users/Kashish/myTechNews/backend/app/main.py): Endpoint routing, startup events, and background thread execution hooks.
  - [aggregator.py](file:///c:/Users/Kashish/myTechNews/backend/app/aggregator.py): Feeds scraper (Paul Graham index, NITI Aayog, RSS streams) with Gemini summarization.
  - [auth.py](file:///c:/Users/Kashish/myTechNews/backend/app/auth.py): Bcrypt hashing and JWT payload encode/decode.
  - [models.py](file:///c:/Users/Kashish/myTechNews/backend/app/models.py): Database SQLAlchemy schemas (Users, Articles).
  - [schemas.py](file:///c:/Users/Kashish/myTechNews/backend/app/schemas.py): Pydantic validation request and response structures.

### 3. Infrastructure & DevOps
- **Description**: Serverless deployment and routing configurations.
- **Key Files**:
  - [vercel.json](file:///c:/Users/Kashish/myTechNews/vercel.json): Vercel monorepo deployment descriptor mapping backend serverless Python routes and frontend build targets.

### 4. Guidelines & Tooling
- **Description**: Code design files (SOLID + DRY rules), context documentation, and helper scripts.
- **Key Files**:
  - [AGENTS.md](file:///c:/Users/Kashish/myTechNews/AGENTS.md): Main engineering rules and guidelines.
  - [GEMINI.md](file:///c:/Users/Kashish/myTechNews/GEMINI.md): Guidelines for using Upstash context7 to query developer documentation.

---

## 🔑 Key Concepts & Design Decisions

- **Postgres-to-SQLite Fallback**: The database layer connects to a Postgres server using SQLAlchemy. If the database URL is missing or unreachable, it falls back to a local SQLite database (`my_tech_news.db`), allowing zero-config local development out of the box.
- **Bcrypt & JWT Security**: Public endpoints like registration and login are open. All other API routes require a valid `Bearer <token>` in the request header. Registering a new user immediately returns a JWT token, triggering automatic login.
- **DIP (Dependency Inversion)**: The aggregator runs classifications via local heuristics if the Google Gemini API key is missing, ensuring the scraping pipeline remains resilient.
- **SOLID/DRY code structures**: Dates are formatted centrally, models strictly segregated, and routers split from scrapers.

---

## 🧭 Guided Tour

Follow this learning path to explore the codebase:

1. **Step 1: Onboarding & Architecture**: Read [AGENTS.md](file:///c:/Users/Kashish/myTechNews/AGENTS.md) and [vercel.json](file:///c:/Users/Kashish/myTechNews/vercel.json) to understand how the project routes requests and enforces DRY/SOLID rules.
2. **Step 2: API Endpoints & Aggregation**: Explore [main.py](file:///c:/Users/Kashish/myTechNews/backend/app/main.py) to see FastAPI routes, and follow the execution flow to [aggregator.py](file:///c:/Users/Kashish/myTechNews/backend/app/aggregator.py) for the parallel scraping mechanics.
3. **Step 3: Database & Auth**: Inspect [models.py](file:///c:/Users/Kashish/myTechNews/backend/app/models.py) and [auth.py](file:///c:/Users/Kashish/myTechNews/backend/app/auth.py) to see how data is modeled and passwords validated.
4. **Step 4: Frontend Views**: Open [App.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/App.tsx) to check client-side routing, and inspect the [NewsFeed.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/components/NewsFeed.tsx) grid to see news feeds rendering.

---

## ⚡ Complexity Hotspots

Approach these files carefully as they hold the most complex business and routing logic:
- **`backend/app/aggregator.py`**: Handles HTML document scraping, cleaning, parallel API calls to Gemini, deduplication, and heuristic routing.
- **`backend/app/main.py`**: Manages background scheduling threads, CORS settings, database sessions, and endpoints routing.
- **`frontend/src/App.tsx` & `NewsFeed.tsx`**: Coordinate search, category selection, client storage caching, layout reflows, and authentication redirects.
