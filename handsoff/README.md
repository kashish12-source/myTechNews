# Handoff Documentation - Monorepo Migration & Redesign

This directory contains handoff records, documenting all achievements, code modifications, verified test harness setup, and configuration steps. It provides a complete history and guide for any developer or agent to resume work on the `myTechNews` project without context loss.

---

## 🔑 1. Security & Pre-seeded Credentials

We implemented a complete registration & login system in Python (FastAPI). All backend endpoints except public authentication routes (`/api/auth/register` and `/api/auth/login`) are protected and require a `Bearer <token>` in the `Authorization` header.

*   **Pre-seeded Admin User**:
    *   **Email**: `krishvishnoi@gmail.com`
    *   **Password**: `StrongPass@1`
    *   *Automatically seeded on startup in the PostgreSQL/SQLite database.*
*   **Automatic Login**:
    *   Creating a new account triggers immediate JWT generation and returns the token to the frontend, logging the user in automatically.
*   **Input Sanitization**:
    *   Email inputs are fully sanitized (`.trim().toLowerCase()`) on both client and server to prevent auto-fill spacing issues.
*   **Strong Password Validation**:
    *   Passwords must be at least 8 characters long, containing one uppercase letter, one lowercase letter, one digit, and one special character.

---

## 🏗️ 2. Clean Architecture & Proxy Routing

The project is structured as a monorepo containing:
1.  **frontend/**: A modular React + TypeScript + Tailwind CSS v4 app built with Vite.
2.  **backend/**: A Python FastAPI application using SQLAlchemy and Pydantic.
3.  **api/index.py**: Vercel Python serverless function entrypoint.

*   **Vite Proxy Target**:
    *   Configured a proxy in [vite.config.ts](file:///c:/Users/Kashish/myTechNews/frontend/vite.config.ts) forwarding all `/api` traffic to `http://127.0.0.1:3001` (FastAPI).
*   **Resilient Database**:
    *   Connected via SQLAlchemy to PostgreSQL using the pure-Python `pg8000` driver. If the `DATABASE_URL` connection fails or is missing, the backend automatically falls back to local SQLite (`my_tech_news.db`), ensuring out-of-the-box local development.

---

## 🧪 3. Engineering Test Harness

The project uses Python `pytest` for backend verification:
*   **Command**:
    ```bash
    python -m pytest backend
    ```
*   **Test Suite**: Located in [backend/tests/test_aggregator.py](file:///c:/Users/Kashish/myTechNews/backend/tests/test_aggregator.py).
*   **Assertions Cover**:
    *   Heuristic category classification checks.
    *   Aggregator pre-filtering (filtering out memes/fluff).
    *   Deduplication check by URL and normalized title.

---

## 📈 4. Active Ports & Running Processes

1.  **Vite Dev Server (Frontend Client)**:
    *   **URL**: [http://localhost:5173/](http://localhost:5173/)
    *   *Serves the React + TypeScript app with Tailwind CSS and HMR.*
2.  **FastAPI Backend Server (API)**:
    *   **URL**: `http://localhost:3001/`
    *   *Handles JWT signing/verification, news scraping, and user/article persistence.*
3.  **Vercel Serverless Function Route**:
    *   **Endpoint**: `/api/*` maps to [api/index.py](file:///c:/Users/Kashish/myTechNews/api/index.py).

---

## 📝 5. Deployment Guide

The project is fully configured for Vercel deployment:
1.  **Vercel Configuration**: Set up in [vercel.json](file:///c:/Users/Kashish/myTechNews/vercel.json) at the root, which compiles the React frontend statically and builds the API as a Python serverless function.
2.  **Vercel environment variables to set**:
    *   `DATABASE_URL`: Connection string pointing to your PostgreSQL instance (e.g. Supabase/Neon), formatted as:
        `postgresql+pg8000://user:password@host/database`
    *   `GEMINI_API_KEY`: Google Gemini API Key for AI summaries and classification.
    *   `JWT_SECRET`: Secret key for JWT signatures (randomly generated if missing).
