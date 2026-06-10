import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectRoot = 'c:\\Users\\Kashish\\myTechNews';
const intermediateDir = path.join(projectRoot, '.understand-anything', 'intermediate');
const tmpDir = path.join(projectRoot, '.understand-anything', 'tmp');
const skillDir = path.join(projectRoot, '.agent', 'skills', 'understand');

// Key file custom summaries and tags
const customInfo = {
  'backend/app/main.py': {
    summary: 'FastAPI application entry point. Configures routing, database startup hook, background scraping task, and endpoints for authentication and tech news retrieval.',
    tags: ['entry-point', 'api-handler', 'fastapi']
  },
  'backend/app/aggregator.py': {
    summary: 'Core tech news scraper. Handles fetching and parsing RSS feeds and HTML pages, pre-filtering out non-tech items, deduplicating articles, and generating AI summaries via Gemini.',
    tags: ['utility', 'scraper', 'gemini']
  },
  'backend/app/auth.py': {
    summary: 'Authentication service. Implements password hashing with bcrypt, token generation/verification with JWT, and password strength checks.',
    tags: ['utility', 'security', 'authentication']
  },
  'backend/app/config.py': {
    summary: 'App configurations. Loads environment variables (database connection, keys) using Pydantic Settings.',
    tags: ['config', 'configuration', 'fastapi']
  },
  'backend/app/database.py': {
    summary: 'Database connection layer. Configures SQLAlchemy engine and session factory with PostgreSQL/SQLite fallback.',
    tags: ['utility', 'database', 'sqlalchemy']
  },
  'backend/app/email.py': {
    summary: 'Email dispatch utility. Configures SMTP connection to send verification and welcome emails to registered users.',
    tags: ['utility', 'email', 'smtp']
  },
  'backend/app/models.py': {
    summary: 'SQLAlchemy database models definition. Defines schemas for User, Article, SystemStatus, and VerificationCode tables.',
    tags: ['data-model', 'database', 'sqlalchemy']
  },
  'backend/app/schemas.py': {
    summary: 'Pydantic data schemas. Defines request/response models for user registration, login, verification, and news feed.',
    tags: ['data-model', 'validation', 'serialization']
  },
  'backend/app/scrape_cli.py': {
    summary: 'CLI entry point to execute the scraper pipeline manually from the command line.',
    tags: ['entry-point', 'utility', 'cli']
  },
  'frontend/src/App.tsx': {
    summary: 'Main React application container. Handles client routing, authentication state checks, and renders login screen or primary news portal dashboard.',
    tags: ['entry-point', 'component', 'react']
  },
  'frontend/src/components/NewsFeed.tsx': {
    summary: 'Tech news grid dashboard component. Features date/weather widgets, category navigation, live filtering, and pagination.',
    tags: ['component', 'react', 'view']
  },
  'frontend/src/components/Login.tsx': {
    summary: 'Glassmorphism Login/Register portal. Features email validation, secure password checks, and handles immediate auto-login after signing up.',
    tags: ['component', 'react', 'view']
  },
  'frontend/src/components/ReplacementMatrix.tsx': {
    summary: 'Comparative grid dashboard. Displays AI model performance metrics and automated role-replacement ratings.',
    tags: ['component', 'react', 'view']
  },
  'frontend/src/components/LlmComponents.tsx': {
    summary: 'Transformer visualization dashboard. Illustrates mechanisms in modern Large Language Model architecture.',
    tags: ['component', 'react', 'view']
  },
  'AGENTS.md': {
    summary: 'Main repository developer guide detailing architecture layout (SOLID & DRY principles) and native test runner execution commands.',
    tags: ['documentation', 'guidelines']
  },
  'GEMINI.md': {
    summary: 'Platform rules and behaviors for fetching up-to-date documentation using Upstash context7.',
    tags: ['documentation']
  },
  'README.md': {
    summary: 'Main project documentation and guide on how to launch frontend, backend, and build settings.',
    tags: ['documentation']
  }
};

function getDocSummary(filePath) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        // Return first non-heading line or header clean
        const first = lines[0].replace(/^#+\s*/, '');
        if (first.length > 10) return first;
        if (lines.length > 1) return lines[1].replace(/^#+\s*/, '');
      }
    }
  } catch (e) {}
  return null;
}

async function run() {
  const batchesFile = path.join(intermediateDir, 'batches.json');
  const batchesData = JSON.parse(fs.readFileSync(batchesFile, 'utf-8'));
  const batches = batchesData.batches;

  console.log(`Processing ${batches.length} batches...`);
  const files = batches.flatMap(b => b.files);

  for (const batch of batches) {
    const idx = batch.batchIndex;
    console.log(`Batch ${idx}/${batches.length}...`);

    // Step 1: Write input JSON for extractor
    const inputPath = path.join(tmpDir, `ua-file-analyzer-input-${idx}.json`);
    const input = {
      projectRoot,
      batchFiles: batch.files,
      batchImportData: batch.batchImportData
    };
    fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));

    // Step 2: Execute extract-structure.mjs
    const outputPath = path.join(tmpDir, `ua-file-extract-results-${idx}.json`);
    const cmd = `node ${path.join(skillDir, 'extract-structure.mjs')} ${inputPath} ${outputPath}`;
    execSync(cmd, { stdio: 'inherit' });

    // Step 3: Read and compile results into batch-<idx>.json GraphFragment
    const results = JSON.parse(fs.readFileSync(outputPath, 'utf-8')).results;
    
    const nodes = [];
    const edges = [];

    for (const res of results) {
      const filePath = res.path;
      const fileCategory = res.fileCategory;
      const totalLines = res.totalLines;
      const nonEmptyLines = res.nonEmptyLines;

      // Type mapping
      let type = 'file';
      if (fileCategory === 'config') type = 'config';
      else if (fileCategory === 'docs') type = 'document';
      else if (fileCategory === 'infra') {
        if (filePath.startsWith('.github/workflows/') || filePath.startsWith('.circleci/')) {
          type = 'pipeline';
        } else if (filePath.includes('Dockerfile') || filePath.includes('docker-compose') || filePath.includes('nginx.conf')) {
          type = 'service';
        } else {
          type = 'resource';
        }
      } else if (fileCategory === 'data') {
        if (filePath.endsWith('.sql')) type = 'table';
        else if (filePath.endsWith('.graphql') || filePath.endsWith('.proto') || filePath.endsWith('.json')) type = 'schema';
        else type = 'endpoint';
      }

      const id = `${type}:${filePath}`;
      const name = path.basename(filePath);

      // Summary
      let summary = customInfo[filePath]?.summary || getDocSummary(filePath);
      if (!summary) {
        if (fileCategory === 'code') {
          summary = `Source code file written in ${res.language} containing functional logic for ${name}.`;
        } else if (fileCategory === 'config') {
          summary = `Configuration settings file for ${name}.`;
        } else if (fileCategory === 'docs') {
          summary = `Documentation details in ${name}.`;
        } else {
          summary = `Infrastructure and development settings in ${name}.`;
        }
      }

      // Tags
      let tags = customInfo[filePath]?.tags;
      if (!tags) {
        tags = [fileCategory];
        if (res.language !== 'unknown') tags.push(res.language.toLowerCase());
        if (filePath.includes('test')) tags.push('test');
      }

      // Complexity
      let complexity = 'simple';
      if (nonEmptyLines > 200) complexity = 'complex';
      else if (nonEmptyLines > 50) complexity = 'moderate';

      const fileNode = {
        id,
        type,
        name,
        filePath,
        summary,
        tags,
        complexity
      };
      nodes.push(fileNode);

      // Create function and class nodes if significant
      const functions = res.functions || [];
      const classes = res.classes || [];

      for (const fn of functions) {
        // Significance check (exported or >10 lines)
        const isExported = res.exports?.some(e => e.name === fn.name);
        const linesCount = fn.endLine - fn.startLine;
        if (isExported || linesCount >= 10) {
          const fnId = `function:${filePath}:${fn.name}`;
          nodes.push({
            id: fnId,
            type: 'function',
            name: fn.name,
            filePath,
            lineRange: [fn.startLine, fn.endLine],
            summary: `Function defining code execution logic for ${fn.name}.`,
            tags: ['function', ...tags],
            complexity: linesCount > 50 ? 'complex' : (linesCount > 20 ? 'moderate' : 'simple')
          });
          edges.push({
            source: id,
            target: fnId,
            type: 'contains',
            direction: 'forward',
            weight: 1.0
          });
          if (isExported) {
            edges.push({
              source: id,
              target: fnId,
              type: 'exports',
              direction: 'forward',
              weight: 0.8
            });
          }
        }
      }

      for (const cls of classes) {
        const linesCount = cls.endLine - cls.startLine;
        const isExported = res.exports?.some(e => e.name === cls.name);
        if (isExported || linesCount >= 20 || (cls.methods && cls.methods.length >= 2)) {
          const clsId = `class:${filePath}:${cls.name}`;
          nodes.push({
            id: clsId,
            type: 'class',
            name: cls.name,
            filePath,
            lineRange: [cls.startLine, cls.endLine],
            summary: `Class structuring code abstractions for ${cls.name}.`,
            tags: ['class', ...tags],
            complexity: linesCount > 100 ? 'complex' : (linesCount > 40 ? 'moderate' : 'simple')
          });
          edges.push({
            source: id,
            target: clsId,
            type: 'contains',
            direction: 'forward',
            weight: 1.0
          });
          if (isExported) {
            edges.push({
              source: id,
              target: clsId,
              type: 'exports',
              direction: 'forward',
              weight: 0.8
            });
          }
        }
      }

      // Add imports edges
      const imports = batch.batchImportData[filePath] || [];
      for (const targetPath of imports) {
        // Find target type
        const targetNode = files.find(f => f.path === targetPath);
        let targetType = 'file';
        if (targetNode) {
          const cat = targetNode.fileCategory;
          if (cat === 'config') targetType = 'config';
          else if (cat === 'docs') targetType = 'document';
          else if (cat === 'infra') targetType = 'service';
          else if (cat === 'data') targetType = 'schema';
        }
        edges.push({
          source: id,
          target: `${targetType}:${targetPath}`,
          type: 'imports',
          direction: 'forward',
          weight: 0.7
        });
      }
    }

    // Write final output file
    const batchOutPath = path.join(intermediateDir, `batch-${idx}.json`);
    fs.writeFileSync(batchOutPath, JSON.stringify({ nodes, edges }, null, 2));
    console.log(`Wrote batch-${idx}.json with ${nodes.length} nodes and ${edges.length} edges.`);
  }

  console.log('Done generating batches data.');
}

run();
