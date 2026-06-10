import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\Users\\Kashish\\myTechNews';
const intermediateDir = path.join(projectRoot, '.understand-anything', 'intermediate');

const graphFile = path.join(intermediateDir, 'assembled-graph.json');
const graph = JSON.parse(fs.readFileSync(graphFile, 'utf-8'));
const nodeIds = new Set(graph.nodes.map(n => n.id));

console.log(`Loaded assembled graph with ${nodeIds.size} nodes.`);

// Helper to filter valid IDs
function filterValid(ids) {
  return ids.filter(id => nodeIds.has(id));
}

// 1. Define Layers
const layers = [
  {
    "id": "layer:frontend-client",
    "name": "Frontend Client (React)",
    "description": "Vite + React frontend application files, components, styles, and utils.",
    "nodeIds": filterValid([
      "file:frontend/src/App.tsx",
      "file:frontend/src/main.tsx",
      "file:frontend/src/components/NewsFeed.tsx",
      "file:frontend/src/components/Login.tsx",
      "file:frontend/src/components/ReplacementMatrix.tsx",
      "file:frontend/src/components/LlmComponents.tsx",
      "file:frontend/src/utils/api.ts",
      "file:frontend/index.html",
      "file:frontend/src/index.css",
      "file:frontend/src/App.css",
      "config:frontend/package.json",
      "config:frontend/tsconfig.json",
      "config:frontend/tsconfig.app.json",
      "config:frontend/tsconfig.node.json"
    ])
  },
  {
    "id": "layer:fastapi-backend",
    "name": "FastAPI Backend",
    "description": "Python FastAPI application engine including scraping, authentication, and database services.",
    "nodeIds": filterValid([
      "file:backend/app/main.py",
      "file:backend/app/aggregator.py",
      "file:backend/app/auth.py",
      "file:backend/app/config.py",
      "file:backend/app/database.py",
      "file:backend/app/email.py",
      "file:backend/app/models.py",
      "file:backend/app/schemas.py",
      "file:backend/app/scrape_cli.py",
      "file:backend/tests/test_aggregator.py",
      "config:backend/.env",
      "document:backend/requirements.txt"
    ])
  },
  {
    "id": "layer:infrastructure",
    "name": "Infrastructure & Devops",
    "description": "Docker containerization configurations, scripting, and deployment descriptors.",
    "nodeIds": filterValid([
      "service:backend/Dockerfile",
      "service:frontend/Dockerfile",
      "service:docker-compose.yml",
      "config:vercel.json",
      "file:api/index.py",
      "file:Launch-News.bat",
      "file:schedule-news.ps1",
      "file:frontend/nginx.conf"
    ])
  },
  {
    "id": "layer:tooling-docs",
    "name": "Guidelines & AI Tooling",
    "description": "Developer rules, handoff logs, context document documentation, and custom AI agent skills.",
    "nodeIds": filterValid([
      "document:AGENTS.md",
      "document:GEMINI.md",
      "document:README.md",
      "document:context.txt",
      "document:handsoff/README.md",
      "document:handsoff/conversation.md",
      "document:handsoff/conversation_log.md",
      "document:handsoff/redesign_and_verification_log.md"
    ])
  }
];

// Add any leftover file nodes to layer:tooling-docs or layer:infrastructure so everything is assigned
const assignedNodeIds = new Set(layers.flatMap(l => l.nodeIds));
for (const node of graph.nodes) {
  if (node.type === 'file' || node.type === 'config' || node.type === 'document' || node.type === 'service' || node.type === 'pipeline' || node.type === 'schema' || node.type === 'table' || node.type === 'resource') {
    if (!assignedNodeIds.has(node.id)) {
      if (node.id.includes('skills') || node.id.includes('agent')) {
        layers[3].nodeIds.push(node.id);
      } else {
        layers[2].nodeIds.push(node.id);
      }
      assignedNodeIds.add(node.id);
    }
  }
}

// 2. Define Tour
const tour = [
  {
    "order": 1,
    "title": "Guidelines and System Architecture",
    "description": "Start by reading AGENTS.md to align with the core system rules (SOLID & DRY), and vercel.json to see the monorepo routing entry point.",
    "nodeIds": filterValid(["document:AGENTS.md", "config:vercel.json"])
  },
  {
    "order": 2,
    "title": "FastAPI App Entry and Services",
    "description": "Examine the main FastAPI server setup and the parallel scraping and processing logic.",
    "nodeIds": filterValid(["file:backend/app/main.py", "file:backend/app/aggregator.py"])
  },
  {
    "order": 3,
    "title": "Database Schema and Security",
    "description": "Check user database models, JWT token handling, and bcrypt credentials hashing.",
    "nodeIds": filterValid(["file:backend/app/models.py", "file:backend/app/auth.py"])
  },
  {
    "order": 4,
    "title": "React Client Dashboard",
    "description": "Explore the primary App component and components for category filtering and news rendering.",
    "nodeIds": filterValid(["file:frontend/src/App.tsx", "file:frontend/src/components/NewsFeed.tsx"])
  },
  {
    "order": 5,
    "title": "Docker Multi-Container Orchestration",
    "description": "Check Docker configurations and the compose file that powers the local development environment.",
    "nodeIds": filterValid(["service:docker-compose.yml", "service:backend/Dockerfile", "service:frontend/Dockerfile"])
  }
];

// Write layers.json and tour.json
fs.writeFileSync(path.join(intermediateDir, 'layers.json'), JSON.stringify(layers, null, 2));
fs.writeFileSync(path.join(intermediateDir, 'tour.json'), JSON.stringify(tour, null, 2));

console.log('Successfully generated layers.json and tour.json in intermediate folder.');
