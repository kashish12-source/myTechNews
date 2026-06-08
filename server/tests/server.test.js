import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverEntry = path.join(__dirname, '../index.js');

test('Express API integration check with Authentication', async (t) => {
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

  let authToken = '';

  // 1. Verify that fetching without a token is blocked with 401
  await t.test('GET /api/news without token returns 401 Unauthorized', async () => {
    const res = await fetch('http://localhost:3002/api/news');
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.ok(body.error.includes('Access token required'), 'Should return clear unauth error message');
  });

  // 2. Verify login with correct admin credentials returns token
  await t.test('POST /api/auth/login with correct admin credentials returns JWT', async () => {
    const res = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'krishvishnoi@gmail.com', password: 'StrongPass@1' })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.token, 'Should return a JWT token string');
    assert.strictEqual(body.email, 'krishvishnoi@gmail.com');
    authToken = body.token;
  });

  // 3. Verify login with incorrect credentials fails with 401
  await t.test('POST /api/auth/login with incorrect credentials returns 401', async () => {
    const res = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'krishvishnoi@gmail.com', password: 'WrongPassword' })
    });
    assert.strictEqual(res.status, 401);
  });

  // 4. Verify access is allowed when passing the authorization token
  await t.test('GET /api/news with valid JWT returns 200 and news articles', async () => {
    assert.ok(authToken, 'Should have a valid authentication token');
    const res = await fetch('http://localhost:3002/api/news', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
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
