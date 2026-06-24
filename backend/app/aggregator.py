import re
import os
import random
import string
import httpx
import logging
import feedparser
from bs4 import BeautifulSoup
from datetime import datetime, timezone
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    genai = None
    HAS_GEMINI = False
import json
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models import Article, SystemStatus

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aggregator")

# Disable TLS warnings for HTTP requests with verification turned off
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Heuristic category classifier using keyword mappings
def classify_category(title: str, content: str) -> str:
    text = f"{title} {content}".lower()
    
    keywords = {
        'hardware-gpus': ['gpu', 'nvidia', 'h100', 'b200', 'tpu', 'trillium', 'hardware', 'silicon', 'chip', 'cuda', 'processor'],
        'mlops-devops': ['mlops', 'devops', 'kubernetes', 'k8s', 'docker', 'ci/cd', 'jenkins', 'pipeline', 'orchestration', 'kubeflow', 'monitoring', 'weights & biases', 'mlflow'],
        'dev-tools': ['ide', 'antigravity', 'editor', 'coding', 'copilot', 'typescript', 'rust', 'compiler', 'git', 'github', 'vscode'],
        'ai-models': ['model', 'llm', 'claude', 'gemini', 'gpt', 'llama', 'stable diffusion', 'generative', 'ai', 'deep learning', 'rl', 'reinforcement learning'],
        'big-tech': ['google', 'apple', 'microsoft', 'meta', 'amazon', 'alphabet', 'openai', 'anthropic']
    }

    if any(kw in text for kw in keywords['hardware-gpus']):
        return 'hardware-gpus'
    if any(kw in text for kw in keywords['mlops-devops']):
        return 'mlops-devops'
    if any(kw in text for kw in keywords['dev-tools']):
        return 'dev-tools'
        
    has_big_tech = any(kw in text for kw in keywords['big-tech'])
    has_ai_model = any(kw in text for kw in keywords['ai-models'])
    
    if has_big_tech:
        return 'ai-models' if has_ai_model else 'big-tech'
    if has_ai_model:
        return 'ai-models'
        
    return 'dev-tools'

# Meme & Fluff blocker filters
FLUFF_BLACKLIST = [
    r'\bmeme\b', r'\bjoke\b', r'\bfunny\b', r'\bcomic\b', r'\bshitpost\b', 
    r'\bhumor\b', r'\bhumour\b', r'\bsatire\b', r'\bcasual\b', r'\brand\b',
    r'\bama\b', r'\brand-thoughts\b', r'\bwebcomic\b', r'\bxkcd\b', r'\bcartoon\b',
    r'\bshow hn: check out my gaming channel\b', r'\bcat video\b'
]

def pre_filter_articles(articles: list) -> list:
    filtered = []
    for art in articles:
        if not art.get('title') or not art.get('url'):
            continue
            
        title_lower = art['title'].lower()
        snippet_lower = art.get('contentSnippet', '').lower()
        
        # Filter fluff/memes
        matched = False
        for pattern in FLUFF_BLACKLIST:
            if re.search(pattern, title_lower) or re.search(pattern, snippet_lower):
                logger.info(f"[FILTERED OUT MEME/FLUFF]: {art['title']}")
                matched = True
                break
        if matched:
            continue
            
        # Filter low-value Show HNs
        if title_lower.startswith('show hn:') and not any(kw in title_lower for kw in ['open source', 'model', 'library']):
            continue
            
        filtered.append(art)
    return filtered

def deduplicate_articles(articles: list) -> list:
    seen_urls = set()
    seen_titles = set()
    deduped = []
    
    for art in articles:
        if not art.get('title') or not art.get('url'):
            continue
        url = art['url'].lower().strip()
        norm_title = re.sub(r'[^a-z0-9]', '', art['title'].lower())
        
        if url in seen_urls or norm_title in seen_titles:
            logger.info(f"[DEDUPLICATED]: \"{art['title']}\"")
            continue
            
        seen_urls.add(url)
        seen_titles.add(norm_title)
        deduped.append(art)
        
    return deduped

# Scrapers for specific sources
async def scrape_paul_graham(client: httpx.AsyncClient) -> list:
    logger.info("Fetching Paul Graham essays...")
    url = 'https://www.paulgraham.com/articles.html'
    try:
        response = await client.get(url)
        if response.status_code != 200:
            return []
        
        html = response.text
        # Regex matching href="[name].html" and title text
        matches = re.findall(r'href="([^"]+\.html)">([^<]+)</a>', html)
        articles = []
        for href, title in matches:
            href_clean = href.strip()
            title_clean = title.strip().replace('\n', ' ')
            
            if href_clean not in ['index.html', 'rss.html', 'search.html'] and not href_clean.startswith('http'):
                articles.append({
                    'title': title_clean,
                    'url': f"https://www.paulgraham.com/{href_clean}",
                    'source': "Paul Graham's Articles",
                    'contentSnippet': f"A serious essay by Paul Graham covering tech startup strategies, AI builders, programming paradigms, and intellectual concepts. Link: https://www.paulgraham.com/{href_clean}",
                    'date': datetime.now(timezone.utc).isoformat()
                })
        return articles[:3]
    except Exception as e:
        logger.error(f"Error scraping Paul Graham: {e}")
        return []

async def scrape_niti_aayog(client: httpx.AsyncClient) -> list:
    logger.info("Fetching NITI Aayog reports...")
    url = 'https://niti.gov.in/whats-new'
    try:
        response = await client.get(url)
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        articles = []
        # Find links with format '/whats-new/'
        for link in soup.find_all('a', href=re.compile(r'^/whats-new/')):
            href = link.get('href', '').strip()
            title = link.get_text().strip()
            if not title:
                continue
            
            articles.append({
                'title': title,
                'url': f"https://niti.gov.in{href}",
                'source': 'NITI Aayog',
                'contentSnippet': f"NITI Aayog policy report and strategic national roadmap: {title}. Link: https://niti.gov.in{href}",
                'date': datetime.now(timezone.utc).isoformat()
            })
        return articles[:5]
    except Exception as e:
        logger.error(f"Error scraping NITI Aayog: {e}")
        return []

async def fetch_open_review(client: httpx.AsyncClient) -> list:
    logger.info("Fetching OpenReview papers...")
    urls = [
        'https://api2.openreview.net/notes?invitation=ICLR.cc/2024/Conference/-/Submission&limit=5',
        'https://api2.openreview.net/notes?invitation=NeurIPS.cc/2024/Conference/-/Submission&limit=5'
    ]
    papers = []
    for url in urls:
        try:
            response = await client.get(url)
            if response.status_code != 200:
                continue
            data = response.json()
            for note in data.get('notes', []):
                content = note.get('content', {})
                # Access dict fields (can be nested in api2 format)
                title = content.get('title', {}).get('value') if isinstance(content.get('title'), dict) else content.get('title')
                abstract = content.get('abstract', {}).get('value') if isinstance(content.get('abstract'), dict) else content.get('abstract')
                
                if title:
                    papers.append({
                        'title': title,
                        'url': f"https://openreview.net/forum?id={note.get('id')}",
                        'source': 'OpenReview',
                        'contentSnippet': abstract[:300] if abstract else f"OpenReview paper: {title}",
                        'date': datetime.fromtimestamp(note.get('tcdate', datetime.now().timestamp() * 1000) / 1000, tz=timezone.utc).isoformat()
                    })
        except Exception as e:
            logger.error(f"Error fetching OpenReview paper: {e}")
    return papers

async def fetch_rss_feed(client: httpx.AsyncClient, url: str, source_name: str) -> list:
    logger.info(f"Fetching RSS feed: {source_name} ({url})...")
    try:
        response = await client.get(url, timeout=10.0)
        if response.status_code != 200:
            return []
        
        feed = feedparser.parse(response.text)
        articles = []
        for entry in feed.entries:
            date_str = entry.get('published') or entry.get('updated') or datetime.now(timezone.utc).isoformat()
            
            # Convert feed date formats to iso format if parsed
            try:
                if entry.get('published_parsed'):
                    date_str = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).isoformat()
            except Exception:
                pass
                
            content = entry.get('summary') or entry.get('description') or ''
            # Clean HTML tags from content
            soup = BeautifulSoup(content, 'html.parser')
            clean_content = soup.get_text()
            
            articles.append({
                'title': entry.get('title', ''),
                'url': entry.get('link', ''),
                'source': source_name,
                'contentSnippet': clean_content[:400],
                'date': date_str
            })
        return articles
    except Exception as e:
        logger.error(f"Error fetching RSS {source_name}: {e}")
        return []

# AI Enrichment via Gemini
async def enrich_with_gemini(articles: list) -> list:
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
    if not api_key or not HAS_GEMINI:
        logger.info("No Gemini API key detected or google-generativeai not installed. Using heuristics for categorization and fallback summaries.")
        enriched = []
        for art in articles:
            char_pool = string.ascii_lowercase + string.digits
            uid = ''.join(random.choices(char_pool, k=7))
            
            # Generate high-quality fallback summary if the raw snippet is missing or trivial (like "Comments")
            snippet = art.get('contentSnippet', '')
            if not snippet or len(snippet.strip()) < 15 or snippet.strip().lower() == "comments":
                snippet = f"Latest technical updates, releases, and discussions from {art['source']} covering \"{art['title']}\". Tap the link to view the full details and community commentary."
                
            enriched.append({
                'id': uid,
                'title': art['title'],
                'url': art['url'],
                'source': art['source'],
                'date': art['date'],
                'category': classify_category(art['title'], art['contentSnippet']),
                'summary': snippet[:280] + '...' if len(snippet) > 280 else snippet,
                'importance': 'medium',
                'sentiment': 'neutral'
            })
        return enriched

    logger.info(f"Leveraging Gemini to enrich {len(articles)} articles...")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    enriched = []
    # Process sequential to avoid rate limits, or concurrent with limits
    for art in articles:
        try:
            prompt = f"""Analyze this technology article:
Title: "{art['title']}"
Snippet: "{art['contentSnippet'][:800]}"

Respond ONLY with a JSON object in this exact format:
{{
  "isSeriousTechNews": true/false (Set to false if this is a meme, joke, casual opinion, duplicate, or fluff),
  "category": "ai-models" | "big-tech" | "dev-tools" | "mlops-devops" | "hardware-gpus",
  "summary": "Create a clear, informative 3-sentence summary of the core technical points, products, models or announcements in this article. Avoid fluff.",
  "importance": "high" | "medium" | "low",
  "sentiment": "positive" | "neutral" | "negative"
}}"""

            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            data = json.loads(response.text)
            
            if data.get('isSeriousTechNews', True):
                char_pool = string.ascii_lowercase + string.digits
                uid = ''.join(random.choices(char_pool, k=7))
                enriched.append({
                    'id': uid,
                    'title': art['title'],
                    'url': art['url'],
                    'source': art['source'],
                    'date': art['date'],
                    'category': data.get('category') or classify_category(art['title'], art['contentSnippet']),
                    'summary': data.get('summary') or art['contentSnippet'][:280],
                    'importance': data.get('importance') or 'medium',
                    'sentiment': data.get('sentiment') or 'neutral'
                })
            else:
                logger.info(f"[GEMINI FILTERED OUT]: \"{art['title']}\" (Fluff/Meme)")
        except Exception as e:
            logger.warning(f"Gemini failed for \"{art['title']}\", falling back: {e}")
            char_pool = string.ascii_lowercase + string.digits
            uid = ''.join(random.choices(char_pool, k=7))
            
            # Generate high-quality fallback summary if the raw snippet is missing or trivial (like "Comments")
            snippet = art.get('contentSnippet', '')
            if not snippet or len(snippet.strip()) < 15 or snippet.strip().lower() == "comments":
                snippet = f"Latest technical updates, releases, and discussions from {art['source']} covering \"{art['title']}\". Tap the link to view the full details and community commentary."
                
            enriched.append({
                'id': uid,
                'title': art['title'],
                'url': art['url'],
                'source': art['source'],
                'date': art['date'],
                'category': classify_category(art['title'], art['contentSnippet']),
                'summary': snippet[:280] + '...' if len(snippet) > 280 else snippet,
                'importance': 'medium',
                'sentiment': 'neutral'
            })
            
    return enriched

# Main Orchestrator function
async def aggregate_news(db: Session):
    logger.info("Initiating news aggregation pipeline...")
    
    # 1. Update system status to is_updating = True
    status = db.query(SystemStatus).first()
    if not status:
        status = SystemStatus(id=1, is_updating=True, last_updated="")
        db.add(status)
    else:
        status.is_updating = True
    db.commit()

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TechNewsAggregator/1.0'
    }
    
    raw_articles = []
    
    # Use HTTPX client without cert verify to mimic NODE_TLS_REJECT_UNAUTHORIZED = '0'
    async with httpx.AsyncClient(headers=headers, verify=False, timeout=15.0) as client:
        # Define scraper tasks
        tasks = [
            fetch_rss_feed(client, 'https://news.ycombinator.com/rss', 'Hacker News'),
            fetch_rss_feed(client, 'https://lobste.rs/rss', 'Lobsters'),
            scrape_paul_graham(client),
            fetch_rss_feed(client, 'https://export.arxiv.org/api/query?search_query=cat:cs.LG+OR+cat:cs.AI&sortBy=lastUpdatedDate&sortOrder=descending&max_results=8', 'arXiv AI/ML'),
            fetch_rss_feed(client, 'https://techcrunch.com/category/artificial-intelligence/feed/', 'TechCrunch AI'),
            fetch_rss_feed(client, 'https://news.google.com/rss/search?q=site:gartner.com/en/insights&hl=en-US&gl=US&ceid=US:en', 'Gartner Insights'),
            fetch_rss_feed(client, 'https://www.forrester.com/blogs/feed/', 'Forrester Bold'),
            fetch_rss_feed(client, 'https://news.google.com/rss/search?q=site:mckinsey.com/capabilities/mckinsey-digital/our-insights&hl=en-US&gl=US&ceid=US:en', 'McKinsey Digital'),
            fetch_rss_feed(client, 'https://news.google.com/rss/search?q=site:bain.com/insights&hl=en-US&gl=US&ceid=US:en', 'Bain Insights'),
            scrape_niti_aayog(client),
            fetch_rss_feed(client, 'https://www.amazon.science/index.rss', 'Amazon Science'),
            fetch_rss_feed(client, 'https://netflixtechblog.com/feed', 'Netflix Tech Blog'),
            fetch_rss_feed(client, 'https://news.google.com/rss/search?q=site:uber.com/blog/engineering&hl=en-US&gl=US&ceid=US:en', 'Uber Engineering'),
            fetch_rss_feed(client, 'https://stripe.com/blog/feed.rss', 'Stripe Engineering'),
            fetch_rss_feed(client, 'https://blog.pragmaticengineer.com/rss/', 'Pragmatic Engineer'),
            fetch_rss_feed(client, 'https://stratechery.com/feed/', 'Stratechery'),
            fetch_rss_feed(client, 'https://techcrunch.com/category/enterprise/feed/', 'TechCrunch Enterprise'),
            fetch_rss_feed(client, 'https://restofworld.org/feed/', 'Rest of World'),
            fetch_rss_feed(client, 'https://export.arxiv.org/api/query?search_query=cat:cs.OH+OR+cat:cs.SE+OR+cat:cs.CL&sortBy=lastUpdatedDate&sortOrder=descending&max_results=5', 'arXiv Computer Science'),
            fetch_open_review(client),
            fetch_rss_feed(client, 'https://ourworldindata.org/feed', 'Our World In Data'),
            fetch_rss_feed(client, 'https://news.google.com/rss/search?q=site:blog.feedly.com&hl=en-US&gl=US&ceid=US:en', 'Feedly Blog'),
            fetch_rss_feed(client, 'https://github.com/upstash/context7/releases.atom', 'context7 Releases'),
            fetch_rss_feed(client, 'https://github.com/upstash/context7/commits.atom', 'context7 Commits'),
            fetch_rss_feed(client, 'https://github.com/Lum1104/Understand-Anything/releases.atom', 'Understand-Anything Releases'),
            fetch_rss_feed(client, 'https://github.com/Lum1104/Understand-Anything/commits.atom', 'Understand-Anything Commits'),
            fetch_rss_feed(client, 'https://github.com/dokploy/dokploy/releases.atom', 'dokploy Releases'),
            fetch_rss_feed(client, 'https://github.com/dokploy/dokploy/commits.atom', 'dokploy Commits')
        ]
        
        # Run scraping concurrently
        import asyncio
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for res in results:
            if isinstance(res, list):
                raw_articles.extend(res)
            elif isinstance(res, Exception):
                logger.error(f"Task exception: {res}")
                
    logger.info(f"Scraped total {len(raw_articles)} articles. Filtering and deduplicating...")
    
    # 2. Filter & Deduplicate
    filtered = pre_filter_articles(raw_articles)
    deduped = deduplicate_articles(filtered)
    
    # 3. Sort by date and cap to top 30
    def parse_date(date_str):
        try:
            return datetime.fromisoformat(date_str)
        except Exception:
            return datetime.now(timezone.utc)
            
    sorted_articles = sorted(deduped, key=lambda x: parse_date(x['date']), reverse=True)[:30]
    
    # 4. Enrich metadata with Gemini / Heuristics
    enriched = await enrich_with_gemini(sorted_articles)
    
    # 5. Save to database
    try:
        # Get existing URLs in database to prevent duplicates
        existing_urls = {a.url.lower().strip() for a in db.query(Article.url).all()}
        
        new_count = 0
        # Insert new articles
        for art in enriched:
            url_clean = art['url'].lower().strip()
            if url_clean in existing_urls:
                continue
                
            db_art = Article(
                id=art['id'],
                title=art['title'],
                url=art['url'],
                source=art['source'],
                date=art['date'],
                category=art['category'],
                summary=art['summary'],
                importance=art['importance'],
                sentiment=art['sentiment']
            )
            db.add(db_art)
            existing_urls.add(url_clean)
            new_count += 1
            
        # Commit new articles first
        db.commit()
        logger.info(f"Aggregation: Inserted {new_count} new articles.")
        
        # Purge articles older than 5 days to maintain a rolling window of history
        from datetime import timedelta
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=5)
        
        all_articles = db.query(Article).all()
        deleted_count = 0
        for art in all_articles:
            try:
                art_date = datetime.fromisoformat(art.date)
                if art_date.tzinfo is None:
                    art_date = art_date.replace(tzinfo=timezone.utc)
                if art_date < cutoff_date:
                    db.delete(art)
                    deleted_count += 1
            except Exception as parse_err:
                logger.warning(f"Could not parse date '{art.date}' for article {art.id}: {parse_err}")
                
        if deleted_count > 0:
            db.commit()
            logger.info(f"Purged {deleted_count} articles older than 5 days.")
            
        status.last_updated = datetime.now(timezone.utc).isoformat()
        status.is_updating = False
        db.commit()
        logger.info("Aggregation complete and database updated.")
    except Exception as e:
        db.rollback()
        status.is_updating = False
        db.commit()
        logger.error(f"Failed to commit scraped articles to database: {e}")
