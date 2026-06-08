import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { aggregateNews } from './aggregator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const cacheFilePath = path.join(__dirname, 'news-cache.json');

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

// API Route: Get latest news from memory cache
app.get('/api/news', async (req, res) => {
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
app.post('/api/refresh', async (req, res) => {
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
