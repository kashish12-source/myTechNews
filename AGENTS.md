# Coding Agents Guidelines & System Architecture

Welcome to the `myTechNews` repository. This document outlines the repository structure, software engineering guidelines (SOLID & DRY), the test suite (Engineering Harness), and AI integrations (`context7` and `Understand-Anything`).

---

## 📂 Repository Structure

The project is split into a modern React frontend and a lightweight Express backend.

```
myTechNews/
├── .agent/                  # Custom agent skills
│   └── skills/find-docs/    # context7 query skill
├── .github/workflows/       # GitHub Actions (daily cron scraping job)
├── server/                  # Backend code
│   ├── tests/               # Node.js native tests
│   │   ├── aggregator.test.js
│   │   └── server.test.js
│   ├── aggregator.js        # Core tech scraper & pipeline
│   ├── index.js             # Express API server & background caching
│   └── package.json
├── src/                     # Frontend code (React + Vite + Tailwind/CSS)
│   ├── components/          # Dashboard panels
│   │   ├── LlmComponents.tsx
│   │   ├── NewsFeed.tsx
│   │   └── ReplacementMatrix.tsx
│   ├── data/
│   │   └── news-cache.json  # Pre-seeded JSON archive (fallback)
│   └── main.tsx
├── AGENTS.md                # System rules & guides (This file)
├── GEMINI.md                # context7 fetch doc rules
├── package.json             # Root workspace script setup
└── vite.config.ts
```

---

## 🛠️ Software Engineering Principles

Every change in this repository must maintain the following SOLID and DRY principles:

### 1. SOLID Principles
*   **Single Responsibility Principle (SRP)**:
    *   Separate the HTTP routing logic (`server/index.js`) from the scraper pipeline execution (`server/aggregator.js`).
    *   Separate frontend tabs into specific components: [NewsFeed.tsx](file:///c:/Users/Kashish/myTechNews/src/components/NewsFeed.tsx) (news view), [ReplacementMatrix.tsx](file:///c:/Users/Kashish/myTechNews/src/components/ReplacementMatrix.tsx) (AI comparative tool), and [LlmComponents.tsx](file:///c:/Users/Kashish/myTechNews/src/components/LlmComponents.tsx) (mechanics inspector).
*   **Open/Closed Principle (OCP)**:
    *   The aggregator list (`feedPromises` in `server/aggregator.js`) is designed as a set of declarative RSS/Scraping configurations. You can add a new source by appending a fetch call without modifying the core deduplication or parsing algorithms.
*   **Liskov Substitution Principle (LSP)**:
    *   The backend's schema matches the client's `Article` interface, ensuring mock caches can be swapped seamlessly in the client logic if the local server is offline.
*   **Interface Segregation Principle (ISP)**:
    *   The UI components only receive the narrow data schemas they require (e.g. `Article` and `ReplacementTask`), preventing fat interfaces and layout dependencies.
*   **Dependency Inversion Principle (DIP)**:
    *   The application does not depend directly on Gemini AI API availability. It checks for the existence of `GEMINI_API_KEY` and falls back automatically to heuristic metadata processors (`classifyCategory`) if unavailable.

### 2. DRY (Don't Repeat Yourself)
*   **Centralized Parsing & Formatting**: Avoid duplicate date parsing. The utility function `formatDate` handles formatting safely across different browser versions.
*   **Single Source of Truth**: The tech news database is held in `news-cache.json` which is read and written in a single standard format across both server memory and client build processes.

---

## 🧪 Engineering Test Harness

To preserve codebase integrity and prevent regression bugs, the codebase includes a test suite built on top of **Node.js's native test runner**. This avoids heavy framework dependencies like Jest or Vitest, maintaining a fast and clean environment.

### Run Tests
To execute the tests from the project root:
```bash
npm test
```
To run tests directly inside the server directory:
```bash
npm run test
```

### Writing New Tests
*   Place tests inside `server/tests/` ending in `.test.js`.
*   Import Node's native test module and assertion library:
    ```javascript
    import test from 'node:test';
    import assert from 'node:assert';
    ```

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
