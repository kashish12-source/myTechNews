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
      const data = await aggregateNews();
      memoryCache = data;
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to aggregate news on initial start', details: err.message });
    }
  }

  // Serve the in-memory cache instantly
  res.json(memoryCache);

  // Background refresh check: if cache is older than 6 hours, trigger refresh silently
  const cacheAgeMs = Date.now() - new Date(memoryCache.lastUpdated).getTime();
  const sixHoursMs = 6 * 60 * 60 * 1000;
  if (cacheAgeMs > sixHoursMs) {
    console.log(`Cache is ${(cacheAgeMs / 3600000).toFixed(1)} hours old. Triggering background update...`);
    aggregateNews().then(data => {
      memoryCache = data;
      console.log('Background cache updated successfully.');
    }).catch(err => console.error('Background aggregation error:', err.message));
  }
});

// API Route: Force refresh aggregation
app.post('/api/refresh', async (req, res) => {
  console.log('Manual refresh requested via API...');
  try {
    const data = await aggregateNews();
    memoryCache = data;
    res.json(data);
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
  
  // If no cache exists, run initial aggregation immediately on server boot
  if (!memoryCache) {
    console.log('No cache file detected on server boot. Executing initial scrape...');
    try {
      const data = await aggregateNews();
      memoryCache = data;
    } catch (err) {
      console.error('Initial boot-time aggregation failed:', err.message);
    }
  }
});
