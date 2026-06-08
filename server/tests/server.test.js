import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverEntry = path.join(__dirname, '../index.js');

test('Express API integration check', async (t) => {
  console.log('Spawning test server on port 3002...');
  
  // Set mock GEMINI_API_KEY empty to trigger heuristic cache fallback in aggregator if run
  const env = { ...process.env, PORT: '3002', GEMINI_API_KEY: '' };
  const serverProcess = spawn('node', [serverEntry], { env });

  let serverStarted = false;
  
  // Wait up to 10 seconds for the server to print the startup message
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      serverProcess.kill();
      reject(new Error('Server failed to start within 10 seconds'));
    }, 10000);

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Server stdout]:', output.trim());
      if (output.includes('MyTechNews Server running at') || output.includes('Loaded tech news cache successfully')) {
        serverStarted = true;
        clearTimeout(timeout);
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('[Server stderr]:', data.toString());
    });

    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });

  assert.ok(serverStarted, 'Server process should start successfully');

  // Test /api/news endpoint
  await t.test('GET /api/news returns cached news', async () => {
    const res = await fetch('http://localhost:3002/api/news');
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.articles), 'Response articles should be an array');
    assert.ok(body.lastUpdated, 'Response should contain lastUpdated date');
  });

  // Clean up server process
  console.log('Terminating test server...');
  serverProcess.kill();
  
  await new Promise((resolve) => {
    serverProcess.on('close', resolve);
  });
});
