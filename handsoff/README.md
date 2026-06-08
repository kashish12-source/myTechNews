# Handoff Documentation

This directory serves as the handoff records folder, documenting all achievements, code modifications, verified test harness setup, and upcoming tasks. It provides a complete history and guide for any developer or agent to resume work on the `myTechNews` project without context loss.

---

## 🔑 1. Security & Pre-seeded Credentials

We implemented a complete registration & login system. All backend endpoints except public authentication routes (`/api/auth/register` and `/api/auth/login`) are protected and require a `Bearer <token>` in the `Authorization` header.

*   **Pre-seeded Admin User**:
    *   **Email**: `krishvishnoi@gmail.com`
    *   **Password**: `StrongPass@1`
    *   *Hashed and stored securely in `server/users.json` using bcrypt.*
*   **Automatic Login**:
    *   Creating a new account triggers immediate JWT generation and returns the token to the frontend, logging the user in automatically without forcing a manual login step.
*   **Safe Casing & Spacing**:
    *   Email inputs are fully sanitized (`.trim().toLowerCase()`) on both the client and server to prevent copy-paste spacing bugs.

---

## 🏗️ 2. Clean Architecture & Proxy Routing

To guarantee robust cross-environment routing and eliminate CORS or mixed-content problems:
*   **Vite Proxy Target**:
    *   Configured a proxy in [vite.config.ts](file:///c:/Users/Kashish/myTechNews/vite.config.ts) forwarding all `/api` traffic to `http://127.0.0.1:3001` (IPv4 loopback address). 
    *   Using `127.0.0.1` explicitly avoids modern Node.js resolution mismatches (favoring IPv6 `::1`), which otherwise result in `ECONNREFUSED` / "Failed to fetch" browser errors.
*   **Relative Endpoints**:
    *   Replaced all hardcoded `http://localhost:3001` references with relative paths (`/api/news`, `/api/auth/login`, etc.) in [App.tsx](file:///c:/Users/Kashish/myTechNews/src/App.tsx), [Login.tsx](file:///c:/Users/Kashish/myTechNews/src/components/Login.tsx), and [NewsFeed.tsx](file:///c:/Users/Kashish/myTechNews/src/components/NewsFeed.tsx).
*   **Responsive centring**:
    *   Adjusted wrappers and layout grids so that the login/register dialog remains centered and fits standard viewport sizes (preventing button cutoff on standard laptop displays).

---

## 🧪 3. Engineering Test Harness

The project uses Node.js's native test runner to maintain a lightweight footprint:
*   **Command**:
    ```bash
    npm test
    ```
*   **Test Suite**: Located in [server/tests/server.test.js](file:///c:/Users/Kashish/myTechNews/server/tests/server.test.js).
*   **Assertions Cover**:
    *   Unauthenticated blocks (returns `401 Unauthorized`).
    *   Correct credentials login (returns a valid JWT).
    *   Incorrect credentials block (returns `401 Unauthorized`).
    *   Authenticated feed fetch (returns the news array payload with `200 OK`).

---

## 📈 4. Active Ports & Running Processes

1.  **Vite Dev Server (Frontend Client)**:
    *   **URL**: [http://localhost:5173/](http://localhost:5173/)
    *   *Serves the React + TypeScript app with Hot Module Replacement (HMR).*
2.  **Express Backend Server (API)**:
    *   **URL**: `http://localhost:3001/`
    *   *Handles JWT signing/verification, news scraping, and user persistence.*
3.  **Understand-Anything Dashboard (Codebase Graph)**:
    *   **URL**: [http://127.0.0.1:5173/?token=d3055538ac936a6beea7814850e9a7a3](http://127.0.0.1:5173/?token=d3055538ac936a6beea7814850e9a7a3)
    *   *Generates dynamic relationship visualizations of components and routes.*

---

## 📝 5. Next Steps & Pending Items

The following requirements remain active in [context.txt](file:///c:/Users/Kashish/myTechNews/context.txt) for implementation:
- [ ] **Dokploy Setup**: Install and configure Dokploy (`https://github.com/dokploy/dokploy`) inside the environment (pending user direction/permission).
- [ ] **Onboarding Documentations**: Build onboarding guidelines for users and AI assistants joining the repo.
- [ ] **Codebase Graph Maintenance**: Continue running mapping scans with Understand-Anything tool stack to keep relationships up to date.
