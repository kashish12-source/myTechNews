import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { aggregateNews } from './aggregator.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const cacheFilePath = path.join(__dirname, 'news-cache.json');
const usersFilePath = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyformytechnewsaggregator';

async function readUsers() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const raw = await fs.promises.readFile(usersFilePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading users file:', err.message);
  }
  return [];
}

async function writeUsers(users) {
  try {
    await fs.promises.writeFile(usersFilePath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users file:', err.message);
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    }
    req.user = user;
    next();
  });
}

let memoryCache = null;
let isAggregating = false;
let currentAggregationPromise = null;

// Helper to run aggregation and manage state
function runAggregation() {
  if (currentAggregationPromise) {
    return currentAggregationPromise;
  }
  isAggregating = true;
  currentAggregationPromise = aggregateNews()
    .then(data => {
      memoryCache = data;
      isAggregating = false;
      currentAggregationPromise = null;
      return data;
    })
    .catch(err => {
      isAggregating = false;
      currentAggregationPromise = null;
      throw err;
    });
  return currentAggregationPromise;
}

// Helper to load cache into memory asynchronously to avoid blocking the event loop
async function loadCache() {
  try {
    if (fs.existsSync(cacheFilePath)) {
      const raw = await fs.promises.readFile(cacheFilePath, 'utf8');
      memoryCache = JSON.parse(raw);
      console.log('Loaded tech news cache successfully into memory.');
    }
  } catch (err) {
    console.error('Error loading/parsing cache file:', err.message);
  }
}

// API Route: Register user
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  try {
    const users = await readUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email address already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    users.push({ email: email.toLowerCase(), passwordHash });
    await writeUsers(users);

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// API Route: Login user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const users = await readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, email: user.email });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// API Route: Get latest news from memory cache
app.get('/api/news', authenticateToken, async (req, res) => {
  if (!memoryCache) {
    console.log('No news cache found in memory. Compiling initial feeds...');
    try {
      const data = await runAggregation();
      return res.json({ ...data, isSystemUpdating: isAggregating });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to aggregate news on initial start', details: err.message });
    }
  }

  // Serve the in-memory cache instantly along with aggregation status
  res.json({
    ...memoryCache,
    isSystemUpdating: isAggregating
  });

  // Background refresh check: if cache is older than 15 minutes, trigger refresh silently
  const cacheAgeMs = Date.now() - new Date(memoryCache.lastUpdated).getTime();
  const fifteenMinutesMs = 15 * 60 * 1000;
  if (cacheAgeMs > fifteenMinutesMs && !isAggregating) {
    console.log(`Cache is ${(cacheAgeMs / 60000).toFixed(1)} minutes old. Triggering background update...`);
    runAggregation()
      .then(() => console.log('Background cache updated successfully.'))
      .catch(err => console.error('Background aggregation error:', err.message));
  }
});

// API Route: Force refresh aggregation
app.post('/api/refresh', authenticateToken, async (req, res) => {
  console.log('Manual refresh requested via API...');
  try {
    const data = await runAggregation();
    res.json({ ...data, isSystemUpdating: isAggregating });
  } catch (err) {
    console.error('Manual refresh aggregation failed:', err.message);
    res.status(500).json({ error: 'Failed to refresh tech news', details: err.message });
  }
});

// Start listening
app.listen(PORT, async () => {
  console.log(`MyTechNews Server running at http://localhost:${PORT}`);
  
  // Load initial cache file into memory
  await loadCache();
  
  // If memory cache exists and is older than 15 minutes, or if no cache exists, run aggregation
  if (memoryCache) {
    const cacheAgeMs = Date.now() - new Date(memoryCache.lastUpdated).getTime();
    const fifteenMinutesMs = 15 * 60 * 1000;
    if (cacheAgeMs > fifteenMinutesMs) {
      console.log(`Cache is ${(cacheAgeMs / 60000).toFixed(1)} minutes old on boot. Starting background update...`);
      runAggregation()
        .then(() => console.log('Boot background cache updated successfully.'))
        .catch(err => console.error('Boot background aggregation error:', err.message));
    }
  } else {
    console.log('No cache file detected on server boot. Executing initial scrape...');
    runAggregation()
      .then(() => console.log('Initial boot-time aggregation complete.'))
      .catch(err => console.error('Initial boot-time aggregation failed:', err.message));
  }
});
