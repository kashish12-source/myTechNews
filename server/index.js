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

// Helper to check cache status and read it
function getCachedNews() {
  if (fs.existsSync(cacheFilePath)) {
    try {
      const raw = fs.readFileSync(cacheFilePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading cache file:', err.message);
      return null;
    }
  }
  return null;
}

// API Route: Get latest news from cache
app.get('/api/news', async (req, res) => {
  const cache = getCachedNews();
  
  if (!cache) {
    // If no cache, trigger aggregation synchronously
    console.log('No news cache found. Compiling initial feeds...');
    try {
      const data = await aggregateNews();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to aggregate news on initial start', details: err.message });
    }
  }

  // If cache exists, serve it
  res.json(cache);

  // Background refresh check: if cache is older than 6 hours, trigger refresh silently
  const cacheAgeMs = Date.now() - new Date(cache.lastUpdated).getTime();
  const sixHoursMs = 6 * 60 * 60 * 1000;
  if (cacheAgeMs > sixHoursMs) {
    console.log(`Cache is ${(cacheAgeMs / 3600000).toFixed(1)} hours old. Triggering background update...`);
    aggregateNews().catch(err => console.error('Background aggregation error:', err.message));
  }
});

// API Route: Force refresh aggregation
app.post('/api/refresh', async (req, res) => {
  console.log('Manual refresh requested via API...');
  try {
    const data = await aggregateNews();
    res.json(data);
  } catch (err) {
    console.error('Manual refresh aggregation failed:', err.message);
    res.status(500).json({ error: 'Failed to refresh tech news', details: err.message });
  }
});

// Start listening
app.listen(PORT, async () => {
  console.log(`MyTechNews Server running at http://localhost:${PORT}`);
  
  // If no cache exists, run initial aggregation immediately on server boot
  if (!fs.existsSync(cacheFilePath)) {
    console.log('No cache file detected on server boot. Executing initial scrape...');
    try {
      await aggregateNews();
    } catch (err) {
      console.error('Initial boot-time aggregation failed:', err.message);
    }
  }
});
