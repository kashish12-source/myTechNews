import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectRoot = 'c:\\Users\\Kashish\\myTechNews';
const intermediateDir = path.join(projectRoot, '.understand-anything', 'intermediate');
const tmpDir = path.join(projectRoot, '.understand-anything', 'tmp');
const skillDir = path.join(projectRoot, '.agent', 'skills', 'understand');

const commitHash = '6d87400e45759311a595e64dc9fb73fec771930f';

async function run() {
  const graphFile = path.join(intermediateDir, 'assembled-graph.json');
  const graph = JSON.parse(fs.readFileSync(graphFile, 'utf-8'));

  const layersFile = path.join(intermediateDir, 'layers.json');
  const layers = JSON.parse(fs.readFileSync(layersFile, 'utf-8'));

  const tourFile = path.join(intermediateDir, 'tour.json');
  const tour = JSON.parse(fs.readFileSync(tourFile, 'utf-8'));

  const scanPath = path.join(intermediateDir, 'scan-result.json');
  const scan = JSON.parse(fs.readFileSync(scanPath, 'utf-8'));

  const timestamp = new Date().toISOString();

  const finalGraph = {
    version: '1.0.0',
    project: {
      name: 'myTechNews',
      languages: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Python', 'Batch', 'PowerShell', 'Markdown'],
      frameworks: ['React', 'FastAPI', 'Vite', 'Tailwind CSS'],
      description: 'Tech news aggregator with Gemini AI summarization and filtering.',
      analyzedAt: timestamp,
      gitCommitHash: commitHash
    },
    nodes: graph.nodes,
    edges: graph.edges,
    layers: layers,
    tour: tour
  };

  // Save intermediate assembled full graph
  const finalGraphPath = path.join(projectRoot, '.understand-anything', 'knowledge-graph.json');
  fs.writeFileSync(finalGraphPath, JSON.stringify(finalGraph, null, 2));
  console.log(`Saved knowledge-graph.json with ${finalGraph.nodes.length} nodes and ${finalGraph.edges.length} edges.`);

  // Save fingerprint input JSON
  const sourceFilePaths = scan.files.map(f => f.path);
  const fingerprintInput = {
    projectRoot,
    sourceFilePaths,
    gitCommitHash: commitHash
  };
  const fingerprintInputPath = path.join(intermediateDir, 'fingerprint-input.json');
  fs.writeFileSync(fingerprintInputPath, JSON.stringify(fingerprintInput, null, 2));

  // Run build-fingerprints.mjs
  console.log('Building fingerprints baseline...');
  const cmd = `node ${path.join(skillDir, 'build-fingerprints.mjs')} ${fingerprintInputPath}`;
  execSync(cmd, { stdio: 'inherit' });

  // Save meta.json
  const meta = {
    lastAnalyzedAt: timestamp,
    gitCommitHash: commitHash,
    version: '1.0.0',
    analyzedFiles: scan.files.length
  };
  const metaPath = path.join(projectRoot, '.understand-anything', 'meta.json');
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log('Saved meta.json');

  // Stale intermediate cleanup
  console.log('Cleaning up intermediate files...');
  const trashDir = path.join(projectRoot, '.understand-anything', `.trash-${Math.floor(Date.now() / 1000)}`);
  fs.mkdirSync(trashDir, { recursive: true });

  const filesInIntermediate = fs.readdirSync(intermediateDir);
  for (const f of filesInIntermediate) {
    if (f !== 'scan-result.json') {
      fs.renameSync(path.join(intermediateDir, f), path.join(trashDir, f));
    }
  }

  // Rename tmp files
  if (fs.existsSync(tmpDir)) {
    const tmpTrashDir = path.join(trashDir, 'tmp');
    fs.renameSync(tmpDir, tmpTrashDir);
  }

  console.log('Validation and build completed successfully.');
}

run().catch(err => {
  console.error('Failed compiling final graph:', err);
  process.exit(1);
});
