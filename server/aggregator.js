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

// Heuristic category classifier
function classifyCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  
  if (text.includes('gpu') || text.includes('nvidia') || text.includes('h100') || text.includes('b200') || text.includes('tpu') || text.includes('trillium') || text.includes('hardware') || text.includes('silicon') || text.includes('chip') || text.includes('cuda') || text.includes('hardware') || text.includes('processor')) {
    return 'hardware-gpus';
  }
  if (text.includes('mlops') || text.includes('devops') || text.includes('kubernetes') || text.includes('k8s') || text.includes('docker') || text.includes('ci/cd') || text.includes('jenkins') || text.includes('pipeline') || text.includes('orchestration') || text.includes('kubeflow') || text.includes('monitoring') || text.includes('weights & biases') || text.includes('mlflow')) {
    return 'mlops-devops';
  }
  if (text.includes('ide') || text.includes('antigravity') || text.includes('editor') || text.includes('coding') || text.includes('copilot') || text.includes('typescript') || text.includes('rust') || text.includes('compiler') || text.includes('git') || text.includes('github') || text.includes('vscode')) {
    return 'dev-tools';
  }
  if (text.includes('google') || text.includes('apple') || text.includes('microsoft') || text.includes('meta') || text.includes('amazon') || text.includes('alphabet') || text.includes('openai') || text.includes('anthropic')) {
    // If it mentions Big Tech but also specific model things, classify model first, otherwise big-tech
    if (text.includes('model') || text.includes('claude') || text.includes('gemini') || text.includes('gpt') || text.includes('llama')) {
      return 'ai-models';
    }
    return 'big-tech';
  }
  if (text.includes('model') || text.includes('llm') || text.includes('claude') || text.includes('gemini') || text.includes('gpt') || text.includes('llama') || text.includes('stable diffusion') || text.includes('generative') || text.includes('ai') || text.includes('deep learning') || text.includes('rl') || text.includes('reinforcement learning')) {
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

// AI-powered summarizer and classification
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

  console.log(`Leveraging Gemini to process and summarize ${articlesList.length} articles...`);
  const enrichedArticles = [];

  for (const art of articlesList) {
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
        enrichedArticles.push({
          id: Math.random().toString(36).substring(2, 9),
          title: art.title,
          url: art.url,
          source: art.source,
          date: art.date,
          category: parsedData.category || classifyCategory(art.title, art.contentSnippet),
          summary: parsedData.summary,
          importance: parsedData.importance || 'medium',
          sentiment: parsedData.sentiment || 'neutral'
        });
      } else {
        console.log(`[GEMINI FILTERED OUT]: "${art.title}" (Classified as fluff/meme)`);
      }
    } catch (err) {
      console.warn(`Gemini processing failed for "${art.title}". Falling back to heuristics.`, err.message);
      enrichedArticles.push({
        id: Math.random().toString(36).substring(2, 9),
        title: art.title,
        url: art.url,
        source: art.source,
        date: art.date,
        category: classifyCategory(art.title, art.contentSnippet),
        summary: art.contentSnippet ? art.contentSnippet.slice(0, 280) + '...' : 'Read details at the source.',
        importance: 'medium',
        sentiment: 'neutral'
      });
    }
  }

  return enrichedArticles;
}

export async function aggregateNews() {
  console.log('Initiating technology news aggregation pipeline...');
  
  // 1. Gather all raw articles
  const rawFeeds = [];
  
  // Hacker News Feed
  const hn = await fetchRssFeed('https://news.ycombinator.com/rss', 'Hacker News');
  rawFeeds.push(...hn);

  // Lobsters Feed
  const lobs = await fetchRssFeed('https://lobste.rs/rss', 'Lobsters');
  rawFeeds.push(...lobs);

  // Paul Graham Articles
  const pg = await scrapePaulGrahamArticles();
  rawFeeds.push(...pg);

  // arXiv ML Feed (arXiv export API serves atom/rss)
  const arxiv = await fetchRssFeed('http://export.arxiv.org/api/query?search_query=cat:cs.LG+OR+cat:cs.AI&sortBy=lastUpdatedDate&sortOrder=descending&max_results=8', 'arXiv AI/ML');
  rawFeeds.push(...arxiv);

  // TechCrunch AI Category Feed
  const tc = await fetchRssFeed('https://techcrunch.com/category/artificial-intelligence/feed/', 'TechCrunch AI');
  rawFeeds.push(...tc);

  console.log(`Gathered ${rawFeeds.length} articles from all feeds. Pre-filtering...`);
  
  // 2. Run heuristics filter
  const preFiltered = preFilterArticles(rawFeeds);
  console.log(`Pre-filtered down to ${preFiltered.length} serious items. Compiling/Enriching...`);

  // Limit number of concurrent articles processed to avoid API limits (keep top 15 newest articles)
  const sortedArticles = preFiltered
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);

  // 3. Summarize and Categorize (via Gemini or heuristics)
  const enrichedArticles = await summarizeAndEnrichWithGemini(sortedArticles);
  
  console.log(`News aggregation complete. Compiled ${enrichedArticles.length} clean technical updates.`);
  
  const cacheData = {
    lastUpdated: new Date().toISOString(),
    articles: enrichedArticles
  };

  // Write to client cache location
  const clientCachePath = path.join(__dirname, '../src/data/news-cache.json');
  fs.mkdirSync(path.dirname(clientCachePath), { recursive: true });
  fs.writeFileSync(clientCachePath, JSON.stringify(cacheData, null, 2));
  console.log(`Successfully updated client local cache file at: ${clientCachePath}`);

  // Write to server local cache location
  const serverCachePath = path.join(__dirname, 'news-cache.json');
  fs.writeFileSync(serverCachePath, JSON.stringify(cacheData, null, 2));

  return cacheData;
}
