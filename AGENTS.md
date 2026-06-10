# Coding Agents Guidelines & System Architecture

Welcome to the `myTechNews` repository. This document outlines the repository structure, software engineering guidelines (SOLID & DRY), the test suite (Engineering Harness), and AI integrations (`context7`, `Understand-Anything`, and `Dokploy`).

---

## 📂 Repository Structure

The project is structured as a monorepo containing a modern React frontend and a Python FastAPI backend.

```
myTechNews/
├── .agent/                      # Custom agent skills
│   ├── skills/find-docs/        # context7 query skill
│   └── skills/understand/       # Codebase analyzer skill
├── .github/workflows/           # GitHub Actions (daily cron scraping job)
├── backend/                     # Backend code (FastAPI)
│   ├── app/                     # Core application source
│   │   ├── aggregator.py        # Core tech scraper & pipeline
│   │   ├── auth.py              # Password hashing & JWT helper
│   │   ├── database.py          # SQLAlchemy engine & session getter
│   │   ├── main.py              # FastAPI router & endpoints
│   │   ├── models.py            # Database tables schema
│   │   └── schemas.py           # Pydantic schemas (validation/serialization)
│   ├── tests/                   # Python unit tests
│   │   └── test_aggregator.py
│   └── requirements.txt
├── frontend/                    # Frontend code (React + Vite + Tailwind CSS v4)
│   ├── public/                  # Static assets & manifest.json
│   ├── src/                     # Source folder
│   │   ├── components/          # Portal dashboards
│   │   │   ├── LlmComponents.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── NewsFeed.tsx
│   │   │   └── ReplacementMatrix.tsx
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── utils/
│   │       └── api.ts
│   └── package.json
├── docs/                        # Onboarding & documentation guides
│   └── ONBOARDING.md
├── AGENTS.md                    # System rules & guides (This file)
├── GEMINI.md                    # context7 fetch doc rules
├── package.json                 # Root monorepo script setup
└── vercel.json                  # Vercel deployment descriptor
```

---

## 🛠️ Software Engineering Principles

Every change in this repository must maintain the following SOLID and DRY principles:

### 1. SOLID Principles
*   **Single Responsibility Principle (SRP)**:
    *   Separate the HTTP routing/endpoints (`backend/app/main.py`) from the scraper pipeline execution (`backend/app/aggregator.py`).
    *   Separate frontend tabs into specific dashboard components: [NewsFeed.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/components/NewsFeed.tsx) (news view), [ReplacementMatrix.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/components/ReplacementMatrix.tsx) (AI comparative tool), and [LlmComponents.tsx](file:///c:/Users/Kashish/myTechNews/frontend/src/components/LlmComponents.tsx) (mechanics inspector).
*   **Open/Closed Principle (OCP)**:
    *   The aggregator list (`fetch_rss_feed` / scraping modules in `backend/app/aggregator.py`) is designed as a set of declarative RSS/Scraping configurations. You can add a new source by appending a fetch call without modifying the core deduplication or parsing algorithms.
*   **Liskov Substitution Principle (LSP)**:
    *   The backend's schema matches the client's `Article` interface, ensuring mock caches can be swapped seamlessly in the client logic if the local server is offline.
*   **Interface Segregation Principle (ISP)**:
    *   The UI components only receive the narrow data schemas they require (e.g. `Article` and `ReplacementTask`), preventing fat interfaces and layout dependencies.
*   **Dependency Inversion Principle (DIP)**:
    *   The application does not depend directly on Gemini AI API availability. It checks for the existence of `GEMINI_API_KEY` and falls back automatically to heuristic metadata processors (`classify_category`) if unavailable.

### 2. DRY (Don't Repeat Yourself)
*   **Centralized Parsing & Formatting**: Avoid duplicate date parsing. The utility function `formatDate` handles formatting safely across different browser versions.
*   **Single Source of Truth**: The tech news database is held in `news-cache.json` which is read and written in a single standard format across both server memory and client build processes.

---

## 🧪 Engineering Test Harness

To preserve codebase integrity and prevent regression bugs, the codebase includes a test suite built on top of **pytest**.

### Run Tests
To execute the tests from the project root:
```bash
npm test
```
To run tests directly inside the backend directory:
```bash
npm run test:backend
```

### Writing New Tests
*   Place tests inside `backend/tests/` ending in `test_*.py`.
*   Import standard pytest libraries and backend models:
    ```python
    import pytest
    from backend.app.aggregator import classify_category
    ```

---

## 🔒 Security & Authentication

The project uses JWT (JSON Web Tokens) and bcrypt password hashing to protect endpoints and prevent unauthorized access.

### Authentication Mechanics
1. **User Schema**: Registered users are persisted in the SQLite/Postgres database with an email address and a bcrypt-hashed password.
2. **Pre-seeded Admin User**:
   * **Email**: `krishvishnoi@gmail.com`
   * **Password**: `StrongPass@1`
3. **Endpoint Protection**:
   * Public routes: `/api/auth/register`, `/api/auth/login`.
   * Protected routes: `/api/news`, `/api/refresh`. These require a `Bearer <token>` string in the `Authorization` header.
4. **Middleware**:
   * FastAPI dependencies handle token validation and extract user context. If missing, it returns `401 Unauthorized`. If invalid or expired, it returns `403 Forbidden`.

---

## 🔍 Tool Integrations

Two key AI-assistance tools are configured in this repository to empower agents and coding workflows:

### 1. context7
[context7](https://github.com/upstash/context7) injects up-to-date, official documentation directly into AI assistant scopes.
*   **Rules & Behavior**: Located in [GEMINI.md](file:///c:/Users/Kashish/myTechNews/GEMINI.md). Always look up library documentation through `ctx7` to prevent hallucinations of APIs.
*   **Command**:
    *   Resolve libraries: `npx ctx7 library <name> "<query>"`
    *   Query docs: `npx ctx7 docs <libraryId> "<query>"`

### 2. Understand-Anything
[Understand-Anything](https://github.com/Lum1104/Understand-Anything) maps the codebase domains, workflow paths, and files to an interactive, force-directed graph dashboard.
*   **Analyzer CLI**: Execute the analyzer tool to rebuild knowledge mapping:
    ```bash
    /understand
    ```
*   **Visualization Dashboard**: Open the web portal:
    ```bash
    /understand-dashboard
    ```
