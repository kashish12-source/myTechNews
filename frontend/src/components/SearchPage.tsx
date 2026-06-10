import { useState, useEffect } from 'react';
import { ArrowLeft, Search, X, Clock, Bookmark, ExternalLink, AlertCircle } from 'lucide-react';
import fallbackData from '../data/news-cache.json';
import { getApiUrl } from '../utils/api';
import type { Article } from './NewsFeed';

interface SearchPageProps {
  authToken: string | null;
  userEmail: string | null;
  onBack: () => void;
}

export default function SearchPage({ authToken, userEmail, onBack }: SearchPageProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  // Bookmarking states
  const [watchLaterIds, setWatchLaterIds] = useState<string[]>([]);
  const [readLaterIds, setReadLaterIds] = useState<string[]>([]);

  // Trending search tags
  const trendingTags = [
    { label: 'Gemini AI', query: 'Gemini' },
    { label: 'Blackwell GPU', query: 'Blackwell' },
    { label: 'FastAPI', query: 'FastAPI' },
    { label: 'React', query: 'React' },
    { label: 'DevOps & MLOps', query: 'MLOps' },
    { label: 'SQLite Cache', query: 'SQLite' }
  ];

  const loadSavedArticles = async () => {
    const emailKey = userEmail || 'guest';
    
    // Load local storage fallback immediately for offline/guest mode
    const wl = localStorage.getItem(`watch_later_${emailKey}`);
    const rl = localStorage.getItem(`read_later_${emailKey}`);
    if (wl) setWatchLaterIds(JSON.parse(wl));
    if (rl) setReadLaterIds(JSON.parse(rl));

    if (!authToken || !userEmail) return;
    try {
      const response = await fetch(getApiUrl('/api/saved'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWatchLaterIds(data.watch_later || []);
        setReadLaterIds(data.read_later || []);
        localStorage.setItem(`watch_later_${emailKey}`, JSON.stringify(data.watch_later || []));
        localStorage.setItem(`read_later_${emailKey}`, JSON.stringify(data.read_later || []));
        return;
      }
    } catch (err) {
      console.warn('Backend server offline, loading bookmarks from local storage', err);
    }
  };

  const toggleSaved = async (articleId: string, listType: 'watch_later' | 'read_later') => {
    const emailKey = userEmail || 'guest';
    
    // Dynamic optimistic local updates
    let updatedIds: string[] = [];
    if (listType === 'watch_later') {
      updatedIds = watchLaterIds.includes(articleId)
        ? watchLaterIds.filter(id => id !== articleId)
        : [...watchLaterIds, articleId];
      setWatchLaterIds(updatedIds);
      localStorage.setItem(`watch_later_${emailKey}`, JSON.stringify(updatedIds));
    } else {
      updatedIds = readLaterIds.includes(articleId)
        ? readLaterIds.filter(id => id !== articleId)
        : [...readLaterIds, articleId];
      setReadLaterIds(updatedIds);
      localStorage.setItem(`read_later_${emailKey}`, JSON.stringify(updatedIds));
    }

    if (!authToken || !userEmail) return;

    try {
      const response = await fetch(getApiUrl('/api/saved/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ article_id: articleId, list_type: listType })
      });
      if (response.ok) {
        const data = await response.json();
        setWatchLaterIds(data.watch_later || []);
        setReadLaterIds(data.read_later || []);
        localStorage.setItem(`watch_later_${emailKey}`, JSON.stringify(data.watch_later || []));
        localStorage.setItem(`read_later_${emailKey}`, JSON.stringify(data.read_later || []));
      }
    } catch (err) {
      console.warn('Failed to sync bookmark toggle with server, saved locally', err);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await fetch(getApiUrl('/api/news'), {
        method: 'GET',
        headers
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve news from backend.');
      }
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.warn('Backend server offline. Fetching search cache from static data.', err);
      setArticles(fallbackData.articles || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    loadSavedArticles();
  }, [authToken, userEmail]);

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return 'Recent';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const calculateReadingTime = (text: string) => {
    const chars = text.length || 0;
    return Math.max(1, Math.ceil(chars / 180));
  };

  const getCategoryBadgeTheme = (_cat: string) => {
    return 'text-[var(--text-secondary)] border-[var(--border-color)] bg-[var(--bg-secondary)]';
  };

  // Filter logic
  const filteredArticles = articles.filter(article => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return article.title.toLowerCase().includes(q) || 
           article.summary.toLowerCase().includes(q) ||
           article.source.toLowerCase().includes(q) ||
           article.category.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full font-sans select-none">
      
      {/* 1. Header with back link */}
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-color)]">
        <button
          onClick={onBack}
          className="p-2 border border-[var(--border-color)] hover:border-brand-primary rounded-full text-[var(--text-secondary)] hover:text-brand-primary bg-[var(--bg-card)] cursor-pointer transition-all duration-150"
          title="Return to Dashboard"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Search Hub</h2>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium uppercase tracking-wider">
            Access 28+ indexed feeds concurrently
          </p>
        </div>
      </div>

      {/* 2. Premium Centered Capsule Search Box */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm flex flex-col gap-4 mt-2">
        <div className="google-search-bar w-full flex items-center relative select-none">
          <Search size={18} className="text-slate-400 mr-3.5 shrink-0" />
          <input
            type="text"
            placeholder="Type keywords, authors, or categories (e.g. Nvidia, PyTorch, CNET)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm border-none outline-none text-[var(--text-primary)] placeholder-slate-400"
            autoFocus
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 cursor-pointer"
              title="Clear Search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Trending Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1.5">Trending:</span>
          {trendingTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(tag.query)}
              className="text-[10.5px] font-semibold px-3 py-1 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-brand-primary hover:border-brand-primary transition-all cursor-pointer bg-transparent"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search Results block */}
      <div className="w-full mt-2">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="animate-spin text-brand-primary mb-4">
              <Search size={32} className="animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-secondary)]">Crawling indices...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-semibold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : !searchQuery.trim() ? (
          <div className="py-24 text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 shadow-sm">
            <Search size={40} className="mx-auto mb-4 text-slate-500 opacity-40" />
            <p className="font-semibold text-sm text-[var(--text-secondary)]">Ready to search</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              Ingest summaries, model specs, product metrics, and GitHub webhooks dynamically as you type.
            </p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-24 text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 shadow-sm animate-fade-in">
            <AlertCircle size={40} className="mx-auto mb-4 text-slate-500 opacity-40" />
            <p className="font-semibold text-sm text-[var(--text-secondary)]">No matches found</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Try double checking spelling or searching broader keywords.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center text-xs text-[var(--text-muted)] px-1">
              <span>Found {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} for "{searchQuery}"</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in">
              {filteredArticles.map((article) => {
                const badgeClass = getCategoryBadgeTheme(article.category);
                const readingTime = calculateReadingTime(article.summary);
                const isExpanded = expandedArticle === article.id;

                return (
                  <div key={article.id} className="google-news-card">
                    <div>
                      {/* Dynamic Circular Avatar Header */}
                      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[var(--border-color)]/60">
                        <div className="flex items-center gap-2">
                          <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase select-none ${
                            article.source.toLowerCase().includes('hacker') ? 'bg-orange-500' :
                            article.source.toLowerCase().includes('lobster') ? 'bg-rose-500' :
                            article.source.toLowerCase().includes('crunch') ? 'bg-emerald-500' :
                            article.source.toLowerCase().includes('wired') ? 'bg-cyan-600' : 'bg-brand-primary'
                          }`}>
                            {article.source.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[10px] text-[var(--text-primary)] leading-none">{article.source}</span>
                            <span className="text-[8.5px] text-[var(--text-muted)] mt-0.5">{formatDate(article.date)}</span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-wide ${badgeClass}`}>
                          {article.category.replace('-', ' ')}
                        </span>
                      </div>

                      {/* Title */}
                      <a href={article.url} target="_blank" rel="noreferrer">
                        <h3 className="text-base font-serif font-bold text-[var(--text-primary)] hover:text-brand-primary transition-colors leading-snug line-clamp-2 mb-2.5">
                          {article.title}
                        </h3>
                      </a>

                      {/* Summary Text */}
                      <p className={`text-[var(--text-secondary)] text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {article.summary}
                      </p>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-[var(--border-color)] text-[10px]">
                      <button 
                        onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
                        className="font-bold text-brand-primary hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0"
                      >
                        <span>{isExpanded ? 'Collapse' : 'Read summary'}</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                        <button
                          onClick={() => toggleSaved(article.id, 'watch_later')}
                          className={`p-1 border rounded hover:bg-[var(--border-hover)] cursor-pointer transition-all ${
                            watchLaterIds.includes(article.id)
                              ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 hover:bg-amber-500/20'
                              : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                          title={watchLaterIds.includes(article.id) ? "Remove from Watch Later" : "Watch Later"}
                        >
                          <Clock size={10} className={watchLaterIds.includes(article.id) ? "fill-amber-500/25" : ""} />
                        </button>

                        <button
                          onClick={() => toggleSaved(article.id, 'read_later')}
                          className={`p-1 border rounded hover:bg-[var(--border-hover)] cursor-pointer transition-all ${
                            readLaterIds.includes(article.id)
                              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                          title={readLaterIds.includes(article.id) ? "Remove from Read Later" : "Read Later"}
                        >
                          <Bookmark size={10} className={readLaterIds.includes(article.id) ? "fill-emerald-500/25" : ""} />
                        </button>

                        <span className="text-[var(--text-muted)] opacity-50">•</span>

                        <span className="flex items-center gap-0.5"><Clock size={10} /> {readingTime} min</span>
                        
                        <span className="text-[var(--text-muted)] opacity-50">•</span>
                        
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1 border border-[var(--border-color)] rounded hover:bg-[var(--border-hover)] text-[var(--text-secondary)]"
                          title="Read original source"
                        >
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
