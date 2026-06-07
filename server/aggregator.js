import Parser from 'rss-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TechNewsAggregator/1.0' }
});

// Initialize Gemini client if key is present
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Heuristic keyword blacklists (Layer 1 filter: Meme & Fluff blocker)
const FLUFF_BLACKLIST = [
  /\bmeme\b/i, /\bjoke\b/i, /\bfunny\b/i, /\bcomic\b/i, /\bshitpost\b/i, 
  /\bhumor\b/i, /\bhumour\b/i, /\bsatire\b/i, /\bcasual\b/i, /\brand\b/i,
  /\bama\b/i, /\brand-thoughts\b/i, /\bwebcomic\b/i, /\bxkcd\b/i, /\bcartoon\b/i,
  /\bshow hn: check out my gaming channel\b/i, /\bcat video\b/i
];

// Heuristic category classifier using keyword mappings for efficiency and readability
function classifyCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  const keywords = {
    'hardware-gpus': ['gpu', 'nvidia', 'h100', 'b200', 'tpu', 'trillium', 'hardware', 'silicon', 'chip', 'cuda', 'processor'],
    'mlops-devops': ['mlops', 'devops', 'kubernetes', 'k8s', 'docker', 'ci/cd', 'jenkins', 'pipeline', 'orchestration', 'kubeflow', 'monitoring', 'weights & biases', 'mlflow'],
    'dev-tools': ['ide', 'antigravity', 'editor', 'coding', 'copilot', 'typescript', 'rust', 'compiler', 'git', 'github', 'vscode'],
    'ai-models': ['model', 'llm', 'claude', 'gemini', 'gpt', 'llama', 'stable diffusion', 'generative', 'ai', 'deep learning', 'rl', 'reinforcement learning'],
    'big-tech': ['google', 'apple', 'microsoft', 'meta', 'amazon', 'alphabet', 'openai', 'anthropic']
  };

  if (keywords['hardware-gpus'].some(kw => text.includes(kw))) {
    return 'hardware-gpus';
  }
  if (keywords['mlops-devops'].some(kw => text.includes(kw))) {
    return 'mlops-devops';
  }
  if (keywords['dev-tools'].some(kw => text.includes(kw))) {
    return 'dev-tools';
  }
  
  const hasBigTech = keywords['big-tech'].some(kw => text.includes(kw));
  const hasAIModel = keywords['ai-models'].some(kw => text.includes(kw));
  
  if (hasBigTech) {
    return hasAIModel ? 'ai-models' : 'big-tech';
  }
  if (hasAIModel) {
    return 'ai-models';
  }
  
  return 'dev-tools'; // default fallback category
}

// Scrape Paul Graham's articles index page
async function scrapePaulGrahamArticles() {
  console.log('Fetching Paul Graham essays...');
  const url = 'https://www.paulgraham.com/articles.html';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    
    // Parse links matching href="[name].html"
    const regex = /href="([^"]+\.html)">([^<]+)<\/a>/g;
    let match;
    const articles = [];
    
    while ((match = regex.exec(html)) !== null) {
      const href = match[1];
      const title = match[2].trim().replace(/\n/g, ' ');
      
      // Filter out utility links like index.html or rss.html
      if (href !== 'index.html' && href !== 'rss.html' && href !== 'search.html' && !href.startsWith('http')) {
        articles.push({
          title: title,
          url: `https://www.paulgraham.com/${href}`,
          source: 'Paul Graham\'s Articles',
          contentSnippet: `A serious essay by Paul Graham covering tech startup strategies, AI builders, programming paradigms, and intellectual concepts. Link: https://www.paulgraham.com/${href}`,
          date: new Date().toISOString() // static articles default to current date
        });
      }
    }
    
    // Return the latest 3 articles
    return articles.slice(0, 3);
  } catch (err) {
    console.error('Error parsing Paul Graham essays, returning empty array:', err.message);
    return [];
  }
}

// Scrape RSS feed helper
async function fetchRssFeed(url, sourceName) {
  console.log(`Fetching feed: ${sourceName} (${url})...`);
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map(item => ({
      title: item.title,
      url: item.link,
      source: sourceName,
      contentSnippet: item.contentSnippet || item.content || '',
      date: item.isoDate || item.pubDate || new Date().toISOString()
    }));
  } catch (err) {
    console.error(`Error fetching RSS feed ${sourceName}:`, err.message);
    return [];
  }
}

// Clean and filter feed raw articles
function preFilterArticles(rawArticles) {
  return rawArticles.filter(art => {
    // 1. Title/link must exist
    if (!art.title || !art.url) return false;
    
    // 2. Filter out blacklisted phrases (Memes, jokes, fluff)
    const matchesBlacklist = FLUFF_BLACKLIST.some(regex => regex.test(art.title) || regex.test(art.contentSnippet));
    if (matchesBlacklist) {
      console.log(`[FILTERED OUT MEME/FLUFF]: ${art.title}`);
      return false;
    }
    
    // 3. Remove general self-promotions or low-quality threads
    if (art.title.toLowerCase().startsWith('show hn:') && !art.title.toLowerCase().includes('open source') && !art.title.toLowerCase().includes('model') && !art.title.toLowerCase().includes('library')) {
      // Keep only high-value Show HNs
      return false;
    }
    
    return true;
  });
}

// AI-powered summarizer and classification (optimized with parallel processing)
async function summarizeAndEnrichWithGemini(articlesList) {
  if (!aiClient) {
    console.log('No Gemini API client initialized. Using heuristic summarization.');
    return articlesList.map(art => ({
      ...art,
      id: Math.random().toString(36).substring(2, 9),
      category: classifyCategory(art.title, art.contentSnippet),
      summary: art.contentSnippet ? art.contentSnippet.slice(0, 280) + (art.contentSnippet.length > 280 ? '...' : '') : 'Read the article details at the source link.',
      importance: 'medium',
      sentiment: 'neutral'
    }));
  }

  console.log(`Leveraging Gemini to process and summarize ${articlesList.length} articles in parallel...`);
  
  const promises = articlesList.map(async (art) => {
    try {
      // Run quick structured analysis query using gemini-2.5-flash
      const prompt = `Analyze this technology article:
Title: "${art.title}"
Snippet: "${art.contentSnippet.slice(0, 800)}"

Respond ONLY with a JSON object in this exact format:
{
  "isSeriousTechNews": true/false (Set to false if this is a meme, joke, casual opinion, duplicate, or fluff),
  "category": "ai-models" | "big-tech" | "dev-tools" | "mlops-devops" | "hardware-gpus",
  "summary": "Create a clear, informative 3-sentence summary of the core technical points, products, models or announcements in this article. Avoid fluff.",
  "importance": "high" | "medium" | "low",
  "sentiment": "positive" | "neutral" | "negative"
}`;

      // Call API
      const model = aiClient.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });
      const response = await model.generateContent(prompt);
      const responseText = response.response.text();
      const parsedData = JSON.parse(responseText);

      if (parsedData.isSeriousTechNews) {
        return {
          id: Math.random().toString(36).substring(2, 9),
          title: art.title,
          url: art.url,
          source: art.source,
          date: art.date,
          category: parsedData.category || classifyCategory(art.title, art.contentSnippet),
          summary: parsedData.summary,
          importance: parsedData.importance || 'medium',
          sentiment: parsedData.sentiment || 'neutral'
        };
      } else {
        console.log(`[GEMINI FILTERED OUT]: "${art.title}" (Classified as fluff/meme)`);
        return null;
      }
    } catch (err) {
      console.warn(`Gemini processing failed for "${art.title}". Falling back to heuristics.`, err.message);
      return {
        id: Math.random().toString(36).substring(2, 9),
        title: art.title,
        url: art.url,
        source: art.source,
        date: art.date,
        category: classifyCategory(art.title, art.contentSnippet),
        summary: art.contentSnippet ? art.contentSnippet.slice(0, 280) + '...' : 'Read details at the source.',
        importance: 'medium',
        sentiment: 'neutral'
      };
    }
  });

  const results = await Promise.all(promises);
  return results.filter(Boolean);
}

// De-duplicate articles by normalized title or URL
function deduplicateArticles(articles) {
  const seenUrls = new Set();
  const seenTitles = new Set();
  return articles.filter(art => {
    if (!art.title || !art.url) return false;
    const url = art.url.toLowerCase().trim();
    // Normalize title: lowercase, remove non-alphanumeric characters and collapse spaces
    const normTitle = art.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (seenUrls.has(url) || seenTitles.has(normTitle)) {
      console.log(`[DEDUPLICATED]: "${art.title}"`);
      return false;
    }
    seenUrls.add(url);
    seenTitles.add(normTitle);
    return true;
  });
}

export async function aggregateNews() {
  console.log('Initiating technology news aggregation pipeline...');
  
  // 1. Gather all raw articles in parallel
  console.log('Fetching all feeds concurrently...');
  const [hn, lobs, pg, arxiv, tc] = await Promise.all([
    fetchRssFeed('https://news.ycombinator.com/rss', 'Hacker News'),
    fetchRssFeed('https://lobste.rs/rss', 'Lobsters'),
    scrapePaulGrahamArticles(),
    fetchRssFeed('https://export.arxiv.org/api/query?search_query=cat:cs.LG+OR+cat:cs.AI&sortBy=lastUpdatedDate&sortOrder=descending&max_results=8', 'arXiv AI/ML'),
    fetchRssFeed('https://techcrunch.com/category/artificial-intelligence/feed/', 'TechCrunch AI')
  ]);

  const rawFeeds = [...hn, ...lobs, ...pg, ...arxiv, ...tc];
  console.log(`Gathered ${rawFeeds.length} articles from all feeds. Pre-filtering...`);
  
  // 2. Run heuristics filter
  const preFiltered = preFilterArticles(rawFeeds);
  
  // 3. De-duplicate articles
  const uniqueArticles = deduplicateArticles(preFiltered);
  console.log(`Filtered and de-duplicated down to ${uniqueArticles.length} serious unique items. Compiling/Enriching...`);

  // Limit number of concurrent articles processed to avoid API limits (keep top 15 newest articles)
  const sortedArticles = uniqueArticles
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);

  // 4. Summarize and Categorize (via Gemini or heuristics in parallel)
  const enrichedArticles = await summarizeAndEnrichWithGemini(sortedArticles);
  
  console.log(`News aggregation complete. Compiled ${enrichedArticles.length} clean technical updates.`);
  
  const cacheData = {
    lastUpdated: new Date().toISOString(),
    articles: enrichedArticles
  };

  // Write to client cache location
  const clientCachePath = path.join(__dirname, '../src/data/news-cache.json');
  await fs.promises.mkdir(path.dirname(clientCachePath), { recursive: true });
  await fs.promises.writeFile(clientCachePath, JSON.stringify(cacheData, null, 2));
  console.log(`Successfully updated client local cache file at: ${clientCachePath}`);

  // Write to server local cache location
  const serverCachePath = path.join(__dirname, 'news-cache.json');
  await fs.promises.writeFile(serverCachePath, JSON.stringify(cacheData, null, 2));

  return cacheData;
}
